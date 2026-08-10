import { prisma } from "@/lib/prisma";

import type { BroadcastAudience } from "@prisma/client";

/**
 * Recipient resolution for broadcasts.
 *
 * The single rule this file implements: who is eligible is decided entirely by
 * the existing persisted Enrollment.status, exactly as the rest of the
 * application already treats it. There is no fresh Telegram membership check
 * here — deliberately. Calling lib/telegram/checkMembership for every
 * recipient would both duplicate the access system and put hundreds of
 * getChatMember calls on the same bot token that serves student logins.
 *
 * This module is READ-ONLY with respect to the student/course/access system.
 * It queries User, Course, and Enrollment; it never writes to any of them.
 * Nothing in the broadcast path can grant, revoke, or alter course access.
 *
 * "Active student" means: has at least one Enrollment with status ACTIVE.
 * It says nothing about when they last opened the Mini App. A student dormant
 * for a year with an ACTIVE enrollment is a valid recipient.
 */

export type Recipient = {
  userId: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  /**
   * The Telegram DM chat id — User.telegramId, which is the chat the bot uses
   * for private conversations. Null when the student has no usable id.
   */
  chatId: string | null;
};

export type AudienceInput = {
  audience: BroadcastAudience;
  courseId: string | null;
  targetUserId: string | null;
  destinationId: string | null;
};

/**
 * A configured destination, resolved to its chat id server-side.
 *
 * The frontend only ever sends a destination id; the chat id is read from the
 * database here, so an arbitrary chat id can never be injected by a client.
 */
export async function resolveDestination(destinationId: string) {
  return prisma.telegramDestination.findUnique({
    where: { id: destinationId, isActive: true },
    select: { id: true, name: true, chatId: true, type: true },
  });
}

/**
 * All students with at least one ACTIVE enrollment, deduplicated.
 *
 * Distinct on telegramId via a Set, so a student with three active courses is
 * a single recipient. `distinct` is applied at the query level too, so the
 * SET is a belt-and-braces guard rather than the only line of defence.
 */
async function allActiveStudents(): Promise<Recipient[]> {
  const rows = await prisma.user.findMany({
    where: {
      enrollments: {
        some: { status: "ACTIVE" },
      },
    },
    select: {
      id: true,
      telegramId: true,
      firstName: true,
      lastName: true,
      username: true,
    },
    distinct: ["telegramId"],
  });

  return rows.map(toRecipient);
}

/**
 * Students whose enrollment in ONE specific course is ACTIVE.
 *
 * Not "everyone who was ever associated with the course": the where clause
 * demands an enrollment row for that course with status ACTIVE, so a student
 * who left the course's channel — and whose enrollment was deactivated by the
 * existing login flow — is excluded. That deactivation is done by the existing
 * access system; this file only reads its result.
 */
async function courseActiveStudents(
  courseId: string
): Promise<Recipient[]> {
  const rows = await prisma.user.findMany({
    where: {
      enrollments: {
        some: {
          courseId,
          status: "ACTIVE",
        },
      },
    },
    select: {
      id: true,
      telegramId: true,
      firstName: true,
      lastName: true,
      username: true,
    },
    distinct: ["telegramId"],
  });

  return rows.map(toRecipient);
}

/**
 * One deliberately chosen student.
 *
 * Intentional direct selection — deliberately NOT filtered on active
 * enrollment. If the admin picks a specific person, that is the person, and
 * whether they currently hold a course is irrelevant. They still need a usable
 * Telegram chat id to receive anything.
 */
async function specificStudent(userId: string): Promise<Recipient[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      telegramId: true,
      firstName: true,
      lastName: true,
      username: true,
    },
  });

  if (!user) return [];

  return [toRecipient(user)];
}

function toRecipient(user: {
  id: string;
  telegramId: bigint;
  firstName: string;
  lastName: string | null;
  username: string | null;
}): Recipient {
  return {
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    // BigInt -> string at the boundary. Safe JSON round-trip, and the chat id
    // is used as a string throughout Telegram's API.
    chatId: user.telegramId.toString(),
  };
}

export type ResolvedAudience =
  | {
      kind: "students";
      recipients: Recipient[];
      // Students without a usable chat id — present for the summary, never
      // delivered to.
      skipped: Recipient[];
    }
  | {
      kind: "destination";
      chatId: string;
      destinationName: string;
    };

export async function resolveRecipients(
  input: AudienceInput
): Promise<ResolvedAudience> {
  switch (input.audience) {
    case "ALL_ACTIVE_STUDENTS":
      return partitionByChatId(await allActiveStudents());

    case "COURSE_ACTIVE_STUDENTS":
      if (!input.courseId) {
        throw new Error("A course is required for this audience.");
      }
      return partitionByChatId(await courseActiveStudents(input.courseId));

    case "SPECIFIC_STUDENT":
      if (!input.targetUserId) {
        throw new Error("Choose a student for this audience.");
      }
      return partitionByChatId(await specificStudent(input.targetUserId));

    case "DESTINATION": {
      if (!input.destinationId) {
        throw new Error("Choose a destination for this audience.");
      }

      const destination = await resolveDestination(input.destinationId);

      /*
       * Not found, or deactivated between composing and sending. Refusing here
       * is what stops a broadcast going to a destination an admin has since
       * turned off.
       */
      if (!destination) {
        throw new Error("That destination is unavailable or inactive.");
      }

      return {
        kind: "destination",
        chatId: destination.chatId,
        destinationName: destination.name,
      };
    }

    default:
      throw new Error(`Unrecognised audience: ${String(input.audience)}`);
  }
}

function partitionByChatId(
  recipients: Recipient[]
): { kind: "students"; recipients: Recipient[]; skipped: Recipient[] } {
  const deliverable: Recipient[] = [];
  const skipped: Recipient[] = [];

  const seen = new Set<string>();

  for (const recipient of recipients) {
    // Deduplicate defensively, in case a future change ever makes two rows
    // carry the same telegramId.
    if (!recipient.chatId || seen.has(recipient.chatId)) {
      skipped.push(recipient);
      continue;
    }

    seen.add(recipient.chatId);
    deliverable.push(recipient);
  }

  return { kind: "students", recipients: deliverable, skipped };
}

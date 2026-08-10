import { prisma } from "@/lib/prisma";

import { LOCK_TTL_MS } from "@/lib/messaging/broadcast";
import type { BroadcastButton } from "@/lib/telegram/compose";

/**
 * Read helpers for the admin messaging screens.
 *
 * Mirrors lib/db/admin/* : plain reads, shaped for the page that renders them,
 * with BigInt converted to string so the result crosses the server/client
 * boundary safely.
 */

export type BroadcastHistoryRow = {
  id: string;
  audience: string;
  courseTitle: string | null;
  destinationName: string | null;
  targetStudentName: string | null;
  title: string | null;
  body: string | null;
  imageUrl: string | null;
  buttons: BroadcastButton[];
  status: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  /**
   * Recipients still awaiting a first attempt. Derived from the delivery rows
   * rather than a counter on the message, so it is always the truth even if a
   * pass was killed before it could write its totals.
   */
  pendingCount: number;
  /** Failures worth another attempt (429, network) — excludes blocked bots. */
  retryableCount: number;
  /** True while a send or resume pass currently holds the lock. */
  isLocked: boolean;
  /**
   * Whether the Resume control should be offered.
   *
   * Derived here rather than in the component so the button's availability and
   * the engine's own claim conditions are decided from one set of rules. The
   * client cannot be the authority on this — resumeBroadcast re-checks
   * everything — but the two agreeing is what stops the UI offering an action
   * that can only fail.
   */
  canResume: boolean;
  /** Whether the Retry-failed control should be offered. */
  canRetry: boolean;
  actorName: string | null;
  createdAt: string;
  completedAt: string | null;
};

export async function getBroadcastHistory(
  limit = 50
): Promise<BroadcastHistoryRow[]> {
  const rows = await prisma.broadcastMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      course: { select: { title: true } },
      destination: { select: { name: true } },
      targetUser: { select: { firstName: true, lastName: true } },
      actor: { select: { name: true, username: true } },
      _count: {
        select: {
          deliveries: { where: { status: "PENDING" } },
        },
      },
    },
  });

  /*
   * Retryable failures, counted per message in one grouped query rather than
   * one query per row.
   */
  const retryableByMessage = new Map<string, number>();

  if (rows.length > 0) {
    const grouped = await prisma.broadcastDelivery.groupBy({
      by: ["messageId"],
      where: {
        messageId: { in: rows.map((row) => row.id) },
        status: "FAILED",
        retryable: true,
      },
      _count: { messageId: true },
    });

    for (const group of grouped) {
      retryableByMessage.set(group.messageId, group._count.messageId);
    }
  }

  const staleBefore = Date.now() - LOCK_TTL_MS;

  return rows.map((row) => {
    const retryableCount = retryableByMessage.get(row.id) ?? 0;

    /*
     * A lock only counts while it is fresh. A pass killed by the platform can
     * never clear its own lock, so treating a stale one as held would leave
     * the broadcast permanently unresumable — the exact failure this feature
     * exists to prevent.
     */
    const isLocked =
      row.lockedAt !== null && row.lockedAt.getTime() > staleBefore;

    return {
      id: row.id,
      audience: row.audience,
      courseTitle: row.course?.title ?? null,
      destinationName: row.destination?.name ?? null,
      targetStudentName: row.targetUser
        ? [row.targetUser.firstName, row.targetUser.lastName]
            .filter(Boolean)
            .join(" ")
        : null,
      title: row.title,
      body: row.body,
      imageUrl: row.imageUrl,
      buttons: (row.buttons as BroadcastButton[] | null) ?? [],
      status: row.status,
      recipientCount: row.recipientCount,
      sentCount: row.sentCount,
      failedCount: row.failedCount,
      skippedCount: row.skippedCount,
      pendingCount: row._count.deliveries,
      retryableCount,
      isLocked,
      /*
       * SENDING with nothing running. Usually a budget-exhausted pass with
       * PENDING rows left; also covers the rarer case of a pass killed after
       * its last send but before it could write the final status, where a
       * resume simply finalises the row.
       */
      canResume: row.status === "SENDING" && !isLocked,
      /*
       * Only settled messages, and only when something is actually worth
       * re-attempting. A run whose failures were all permanent rejections
       * offers no button, because pressing it could only fail again.
       */
      canRetry:
        (row.status === "PARTIALLY_SENT" || row.status === "FAILED") &&
        retryableCount > 0 &&
        !isLocked,
      actorName: row.actor?.name ?? row.actor?.username ?? null,
      createdAt: row.createdAt.toISOString(),
      completedAt: row.completedAt?.toISOString() ?? null,
    };
  });
}

/** Per-recipient outcomes for one broadcast, for the detail view. */
export async function getBroadcastDeliveries(messageId: string) {
  const rows = await prisma.broadcastDelivery.findMany({
    where: { messageId },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    take: 500,
    include: {
      user: { select: { firstName: true, lastName: true, username: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.user
      ? [row.user.firstName, row.user.lastName].filter(Boolean).join(" ")
      : "Channel / group",
    username: row.user?.username ?? null,
    status: row.status,
    error: row.error,
    sentAt: row.sentAt?.toISOString() ?? null,
  }));
}

/** Courses for the audience selector. Every course, published or not. */
export async function getCourseOptions() {
  const courses = await prisma.course.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });

  return courses.map((course) => ({
    value: course.id,
    label: course.title,
  }));
}

export async function getDestinations() {
  const rows = await prisma.telegramDestination.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    chatId: row.chatId,
    type: row.type,
    isActive: row.isActive,
  }));
}

/**
 * Student search for the "specific student" audience.
 *
 * Returns only what the admin needs to identify the right person — name,
 * username, and active course count. The Telegram id is deliberately not
 * returned: the server resolves it at send time, and it is not needed to make
 * a choice.
 */
export async function searchStudents(query: string) {
  const trimmed = query.trim();

  const where = trimmed
    ? {
        OR: [
          { firstName: { contains: trimmed, mode: "insensitive" as const } },
          { lastName: { contains: trimmed, mode: "insensitive" as const } },
          { username: { contains: trimmed, mode: "insensitive" as const } },
        ],
      }
    : {};

  const students = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      _count: {
        select: { enrollments: { where: { status: "ACTIVE" } } },
      },
    },
  });

  return students.map((student) => ({
    id: student.id,
    name: [student.firstName, student.lastName].filter(Boolean).join(" "),
    username: student.username,
    activeCourses: student._count.enrollments,
  }));
}

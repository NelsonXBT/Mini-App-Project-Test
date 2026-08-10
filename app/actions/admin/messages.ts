"use server";

import { revalidatePath } from "next/cache";
import { ActivityType, type BroadcastAudience } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import {
  hasSendableContent,
  validateButtons,
  validateComposedLength,
  type BroadcastButton,
} from "@/lib/telegram/compose";
import { resolveRecipients } from "@/lib/messaging/recipients";
import {
  retryFailedDeliveries,
  resumeBroadcast,
  sendBroadcast,
} from "@/lib/messaging/broadcast";
import { searchStudents } from "@/lib/db/admin/messages";

/**
 * Admin actions for Telegram broadcasts.
 *
 * Every export begins with requireAdmin(), matching the existing admin
 * actions: the layout guard and the proxy redirect are conveniences, and
 * neither protects a directly-invoked server action.
 *
 * Nothing here writes to User, Course, Enrollment, or Session. The audience is
 * derived from the existing persisted Enrollment.status and nothing more.
 */

export type ComposeInput = {
  audience: string;
  courseId: string;
  targetUserId: string;
  destinationId: string;
  title: string;
  body: string;
  imageUrl: string;
  imageKey: string;
  imageMimeType: string;
  imageSize: number | null;
  buttons: BroadcastButton[];
};

const AUDIENCES: BroadcastAudience[] = [
  "ALL_ACTIVE_STUDENTS",
  "COURSE_ACTIVE_STUDENTS",
  "SPECIFIC_STUDENT",
  "DESTINATION",
];

function parseAudience(value: string): BroadcastAudience | null {
  return AUDIENCES.includes(value as BroadcastAudience)
    ? (value as BroadcastAudience)
    : null;
}

/**
 * Everything that must hold before a message can be stored or sent.
 *
 * Repeated server-side even though the composer checks the same things — the
 * client can be bypassed, and the recipient counts shown to the admin are only
 * trustworthy if the server derived them.
 */
function validate(
  input: ComposeInput
): { ok: true; audience: BroadcastAudience; buttons: BroadcastButton[] } | { ok: false; error: string } {
  const audience = parseAudience(input.audience);

  if (!audience) return { ok: false, error: "Choose an audience." };

  if (audience === "COURSE_ACTIVE_STUDENTS" && !input.courseId) {
    return { ok: false, error: "Choose a course." };
  }

  if (audience === "SPECIFIC_STUDENT" && !input.targetUserId) {
    return { ok: false, error: "Choose a student." };
  }

  if (audience === "DESTINATION" && !input.destinationId) {
    return { ok: false, error: "Choose a channel or group." };
  }

  // Image, title, body and buttons are each optional — but not all at once.
  if (!hasSendableContent(input)) {
    return {
      ok: false,
      error: "Add an image, a title, or a message before sending.",
    };
  }

  const length = validateComposedLength(input);
  if (!length.ok) return { ok: false, error: length.error };

  const buttons = validateButtons(input.buttons);
  if (!buttons.ok) return { ok: false, error: buttons.error };

  return { ok: true, audience, buttons: buttons.buttons };
}

/**
 * How many people this audience currently resolves to.
 *
 * Computed server-side and never taken from the client, so the number in the
 * confirmation dialog is the number the broadcast will actually use.
 */
export async function previewAudience(input: {
  audience: string;
  courseId: string;
  targetUserId: string;
  destinationId: string;
}): Promise<
  | { ok: true; kind: "students"; deliverable: number; unavailable: number }
  | { ok: true; kind: "destination"; name: string }
  | { ok: false; error: string }
> {
  await requireAdmin();

  const audience = parseAudience(input.audience);

  if (!audience) return { ok: false, error: "Choose an audience." };

  try {
    const resolved = await resolveRecipients({
      audience,
      courseId: input.courseId || null,
      targetUserId: input.targetUserId || null,
      destinationId: input.destinationId || null,
    });

    if (resolved.kind === "destination") {
      return { ok: true, kind: "destination", name: resolved.destinationName };
    }

    return {
      ok: true,
      kind: "students",
      deliverable: resolved.recipients.length,
      unavailable: resolved.skipped.length,
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not resolve recipients.",
    };
  }
}

/** Student search for the "specific student" picker. */
export async function findStudents(query: string) {
  await requireAdmin();

  return searchStudents(query);
}

/**
 * Create the message and send it.
 *
 * The row is written as DRAFT first so a delivery record exists before any
 * Telegram traffic — sendBroadcast then claims it with a conditional update,
 * which is what makes a double-submitted send impossible.
 */
export async function sendBroadcastMessageAction(
  input: ComposeInput
): Promise<
  | { ok: true; id: string; sent: number; failed: number; skipped: number; status: string }
  | { ok: false; error: string }
> {
  const admin = await requireAdmin();

  const valid = validate(input);
  if (!valid.ok) return { ok: false, error: valid.error };

  let messageId: string;

  try {
    const message = await prisma.broadcastMessage.create({
      data: {
        audience: valid.audience,
        // Only the field relevant to the chosen audience is stored, so a
        // stale course id cannot silently narrow a later re-read.
        courseId:
          valid.audience === "COURSE_ACTIVE_STUDENTS"
            ? input.courseId
            : null,
        targetUserId:
          valid.audience === "SPECIFIC_STUDENT" ? input.targetUserId : null,
        destinationId:
          valid.audience === "DESTINATION" ? input.destinationId : null,
        title: input.title.trim() || null,
        body: input.body.trim() || null,
        imageUrl: input.imageUrl.trim() || null,
        imageKey: input.imageKey.trim() || null,
        imageMimeType: input.imageMimeType.trim() || null,
        imageSize: input.imageSize,
        buttons: valid.buttons.length > 0 ? valid.buttons : undefined,
        status: "DRAFT",
        actorId: admin.id,
      },
    });

    messageId = message.id;
  } catch (error) {
    console.error("createBroadcast failed:", error);
    return { ok: false, error: "Could not create the message." };
  }

  try {
    const outcome = await sendBroadcast(messageId);

    await logActivity({
      type: ActivityType.BROADCAST_SENT,
      summary: `Broadcast sent: ${input.title.trim() || input.body.trim().slice(0, 40) || "media message"} (${outcome.sent} delivered, ${outcome.failed} failed)`,
      entityType: "broadcast",
      entityId: messageId,
      actorId: admin.id,
    });

    revalidatePath("/admin/messaging");
    revalidatePath("/admin/messaging/history");

    return {
      ok: true,
      id: messageId,
      sent: outcome.sent,
      failed: outcome.failed,
      skipped: outcome.skipped,
      status: outcome.status,
    };
  } catch (error) {
    console.error("sendBroadcast failed:", error);

    revalidatePath("/admin/messaging/history");

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "The message was created but could not be sent.",
    };
  }
}

/**
 * What a resume or retry pass achieved, for the toast the admin sees.
 *
 * `pending` is the remaining count *after* the pass — non-zero means the
 * budget ran out again and the control will still be offered, which is the
 * normal shape of a large broadcast draining over several presses.
 */
export type ResumeResult =
  | {
      ok: true;
      status: string;
      sent: number;
      failed: number;
      pending: number;
    }
  | { ok: false; error: string };

/**
 * Continue a broadcast whose previous pass ran out of execution time.
 *
 * Only PENDING deliveries are drained. Recipients already marked SENT are
 * never revisited, so pressing this twice cannot deliver the same message to
 * the same person twice — and the engine's lock refuses a second concurrent
 * pass outright rather than queueing it.
 */
export async function resumeBroadcastAction(
  messageId: string
): Promise<ResumeResult> {
  const admin = await requireAdmin();

  try {
    const outcome = await resumeBroadcast(messageId);

    await logActivity({
      type: ActivityType.BROADCAST_SENT,
      summary: `Broadcast resumed: ${outcome.sent} delivered, ${outcome.failed} failed, ${outcome.pending} still pending`,
      entityType: "broadcast",
      entityId: messageId,
      actorId: admin.id,
    });

    revalidatePath("/admin/messaging/history");

    return {
      ok: true,
      status: outcome.status,
      sent: outcome.sent,
      failed: outcome.failed,
      pending: outcome.pending,
    };
  } catch (error) {
    console.error("resumeBroadcast failed:", error);

    // The pass may still have delivered to some recipients before throwing,
    // so the view is refreshed on the failure path too.
    revalidatePath("/admin/messaging/history");

    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not resume sending.",
    };
  }
}

/**
 * Re-attempt the failures that are worth re-attempting.
 *
 * Scoped to deliveries the transport flagged retryable — a 429 or a network
 * blip. A student who blocked the bot stays failed no matter how often this is
 * pressed, and SENT rows are never touched, so this cannot redeliver to
 * someone who already received the message.
 */
export async function retryFailedAction(
  messageId: string
): Promise<ResumeResult> {
  const admin = await requireAdmin();

  try {
    const outcome = await retryFailedDeliveries(messageId);

    await logActivity({
      type: ActivityType.BROADCAST_SENT,
      summary: `Broadcast failures retried: ${outcome.sent} delivered, ${outcome.failed} failed`,
      entityType: "broadcast",
      entityId: messageId,
      actorId: admin.id,
    });

    revalidatePath("/admin/messaging/history");

    return {
      ok: true,
      status: outcome.status,
      sent: outcome.sent,
      failed: outcome.failed,
      pending: outcome.pending,
    };
  } catch (error) {
    console.error("retryFailedDeliveries failed:", error);

    revalidatePath("/admin/messaging/history");

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not retry the failed recipients.",
    };
  }
}

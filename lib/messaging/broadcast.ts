import { prisma } from "@/lib/prisma";
import {
  sendBroadcastMessage,
  sleep,
  SEND_INTERVAL_MS,
} from "@/lib/telegram/sendMessage";
import type { BroadcastButton } from "@/lib/telegram/compose";

import { resolveRecipients } from "./recipients";

/**
 * The broadcast engine.
 *
 * Writes only to BroadcastMessage and BroadcastDelivery. It never writes to
 * User, Course, Enrollment, or Session — a delivery failure, including a
 * student who has blocked the bot, changes nothing about course access. That
 * remains the sole responsibility of /api/telegram-login and
 * lib/telegram/checkMembership.ts.
 */

/**
 * How long to keep sending within one invocation.
 *
 * Vercel terminates a serverless function at its configured limit, so a large
 * broadcast cannot assume it will finish in one pass. Rather than be killed
 * mid-flight, the loop stops early and leaves the message in SENDING with its
 * remaining deliveries PENDING — a state `resumeBroadcast` can pick up. The
 * budget is deliberately short of the platform default so the final status
 * write always lands.
 */
const SEND_BUDGET_MS = 45_000;

/**
 * How long a lock stays valid without being refreshed.
 *
 * A pass heartbeats `lockedAt` as it works, so a live pass always looks fresh.
 * If a serverless function is killed mid-drain it can never release its lock,
 * so a lock older than this is treated as abandoned and may be reclaimed —
 * otherwise a single killed invocation would strand the broadcast forever.
 *
 * Comfortably longer than SEND_BUDGET_MS so a healthy pass can never have its
 * own lock stolen out from under it.
 *
 * Exported because the history read layer decides whether to *offer* a resume
 * from the same threshold. Two copies of this number would eventually drift,
 * and the failure would be silent: a button offered for a live pass, or
 * withheld from an abandoned one.
 */
export const LOCK_TTL_MS = 120_000;

/** Refresh the lock roughly every 50 sends, cheap relative to the send itself. */
const HEARTBEAT_EVERY = 50;

export type BroadcastContent = {
  title: string | null;
  body: string | null;
  imageUrl: string | null;
  buttons: BroadcastButton[];
};

/**
 * Claim a DRAFT for sending.
 *
 * This is the duplicate-send guard, and it is a conditional update rather than
 * a read-then-write: `where: { status: DRAFT }` means two concurrent calls —
 * a double-clicked button, a retried request, a refreshed tab — cannot both
 * succeed. Postgres serialises them, the first flips the row to SENDING, and
 * the second matches nothing and returns a count of 0.
 */
async function claimForSending(messageId: string): Promise<boolean> {
  const { count } = await prisma.broadcastMessage.updateMany({
    where: { id: messageId, status: "DRAFT" },
    data: { status: "SENDING", lockedAt: new Date() },
  });

  return count === 1;
}

/**
 * Claim an in-flight message for a resume pass.
 *
 * The same conditional-update trick as claimForSending, but the condition is
 * the *lock* rather than the status: a message is claimable only if nothing
 * holds it, or the holder's lock has gone stale. Two admins clicking Resume
 * simultaneously are serialised by Postgres — the first update matches and
 * takes the lock, the second matches nothing and is refused.
 *
 * Without this, both passes would read the same PENDING rows and deliver to
 * every one of them twice.
 */
async function claimForResume(messageId: string): Promise<boolean> {
  const staleBefore = new Date(Date.now() - LOCK_TTL_MS);

  const { count } = await prisma.broadcastMessage.updateMany({
    where: {
      id: messageId,
      status: "SENDING",
      OR: [{ lockedAt: null }, { lockedAt: { lt: staleBefore } }],
    },
    data: { lockedAt: new Date() },
  });

  return count === 1;
}

/** Keep this pass's claim fresh so a long drain is not mistaken for abandoned. */
async function heartbeat(messageId: string) {
  await prisma.broadcastMessage.update({
    where: { id: messageId },
    data: { lockedAt: new Date() },
  });
}

/** Release the claim so the next pass can start immediately. */
async function releaseLock(messageId: string) {
  await prisma.broadcastMessage.update({
    where: { id: messageId },
    data: { lockedAt: null },
  });
}

/**
 * Materialise one delivery row per recipient before any sending starts.
 *
 * Two reasons this happens up front rather than as we go:
 *
 *  - A function timeout mid-broadcast leaves an inspectable record. Anything
 *    still PENDING was definitively not delivered, so there is never an
 *    ambiguous "did that student get it?".
 *  - The @@unique([messageId, chatId]) constraint makes the row itself the
 *    per-recipient idempotency key, so a resumed run cannot double-send.
 *
 * skipDuplicates covers the resume path, where some rows already exist.
 */
async function stageDeliveries(
  messageId: string,
  recipients: { userId: string | null; chatId: string }[]
) {
  if (recipients.length === 0) return;

  const BATCH = 500;

  for (let i = 0; i < recipients.length; i += BATCH) {
    await prisma.broadcastDelivery.createMany({
      data: recipients.slice(i, i + BATCH).map((r) => ({
        messageId,
        userId: r.userId,
        chatId: r.chatId,
        status: "PENDING" as const,
      })),
      skipDuplicates: true,
    });
  }
}

/**
 * Record the recipients we resolved but cannot reach.
 *
 * A student with no usable Telegram chat id is stored as SKIPPED so the
 * summary can distinguish "we tried and it failed" from "there was nothing to
 * try". No Telegram record is created for them, and their enrollment is not
 * touched.
 */
async function stageSkipped(
  messageId: string,
  skipped: { userId: string | null }[]
) {
  if (skipped.length === 0) return;

  await prisma.broadcastDelivery.createMany({
    data: skipped.map((r) => ({
      messageId,
      userId: r.userId,
      // Null chatId is exactly what makes them unreachable. The unique
      // constraint is on (messageId, chatId); Postgres treats NULLs as
      // distinct, so multiple skipped rows coexist without collision.
      chatId: null,
      status: "SKIPPED" as const,
      error: "No Telegram chat ID on file.",
    })),
    skipDuplicates: true,
  });
}

/**
 * Send every PENDING delivery for a message, then finalise its status.
 *
 * Sequential with a fixed interval rather than parallel: Telegram's limit is
 * per-bot, and the same token serves the membership checks that gate course
 * access. Saturating it with broadcast traffic would degrade student logins,
 * which is a far worse outcome than a broadcast taking longer.
 */
async function drainPending(messageId: string, content: BroadcastContent) {
  const startedAt = Date.now();

  let exhaustedBudget = false;
  let sinceHeartbeat = 0;

  try {
    for (;;) {
      /*
       * PENDING only. SENT rows are never revisited — that is what guarantees
       * a resume cannot deliver twice — and FAILED rows are left alone unless
       * an admin explicitly requeues them via retryFailedDeliveries().
       */
      const batch = await prisma.broadcastDelivery.findMany({
        where: { messageId, status: "PENDING", chatId: { not: null } },
        select: { id: true, chatId: true },
        take: 100,
        orderBy: { createdAt: "asc" },
      });

      if (batch.length === 0) break;

      for (const delivery of batch) {
        if (Date.now() - startedAt > SEND_BUDGET_MS) {
          exhaustedBudget = true;
          break;
        }

        const result = await sendBroadcastMessage(delivery.chatId!, content);

        await prisma.broadcastDelivery.update({
          where: { id: delivery.id },
          data: result.ok
            ? {
                status: "SENT",
                sentAt: new Date(),
                error: null,
                retryable: false,
              }
            : {
                status: "FAILED",
                // Telegram's own wording — "bot was blocked by the user",
                // "chat not found" — is the most useful thing an admin can be
                // shown, so it is stored verbatim.
                error: result.error.slice(0, 500),
                // Persisted so a later retry can skip permanently dead
                // recipients instead of hammering them again.
                retryable: result.retryable,
              },
        });

        if (++sinceHeartbeat >= HEARTBEAT_EVERY) {
          sinceHeartbeat = 0;
          await heartbeat(messageId);
        }

        await sleep(SEND_INTERVAL_MS);
      }

      if (exhaustedBudget) break;
    }

    return await finaliseStatus(messageId, exhaustedBudget);
  } finally {
    /*
     * Released whatever happened, including on a thrown error. A pass that
     * ends without clearing its lock would leave the message unresumable
     * until the staleness window expired.
     */
    await releaseLock(messageId).catch(() => {});
  }
}

/**
 * Roll the delivery rows up into the message's final counters and status.
 *
 * Counts are recomputed from the delivery table rather than incremented as we
 * go, so they stay correct across a resumed run and cannot drift if an
 * individual update failed.
 */
async function finaliseStatus(messageId: string, incomplete: boolean) {
  const [sent, failed, skipped, pending] = await Promise.all([
    prisma.broadcastDelivery.count({ where: { messageId, status: "SENT" } }),
    prisma.broadcastDelivery.count({ where: { messageId, status: "FAILED" } }),
    prisma.broadcastDelivery.count({ where: { messageId, status: "SKIPPED" } }),
    prisma.broadcastDelivery.count({ where: { messageId, status: "PENDING" } }),
  ]);

  /*
   * Still work left — the send budget ran out. Left in SENDING rather than
   * marked complete, which is what makes it resumable and stops a partial run
   * being reported as a success.
   */
  if (incomplete || pending > 0) {
    await prisma.broadcastMessage.update({
      where: { id: messageId },
      data: { sentCount: sent, failedCount: failed, skippedCount: skipped },
    });

    return { status: "SENDING" as const, sent, failed, skipped, pending };
  }

  const status =
    failed === 0
      ? ("SENT" as const)
      : sent > 0
        ? ("PARTIALLY_SENT" as const)
        : ("FAILED" as const);

  await prisma.broadcastMessage.update({
    where: { id: messageId },
    data: {
      status,
      sentCount: sent,
      failedCount: failed,
      skippedCount: skipped,
      completedAt: new Date(),
    },
  });

  return { status, sent, failed, skipped, pending: 0 };
}

export type BroadcastOutcome = {
  status: "SENT" | "PARTIALLY_SENT" | "FAILED" | "SENDING";
  sent: number;
  failed: number;
  skipped: number;
  pending: number;
};

/**
 * Send a DRAFT broadcast.
 *
 * Resolves recipients at send time — not at compose time — so the audience
 * reflects enrollment state as of the moment of sending.
 */
export async function sendBroadcast(
  messageId: string
): Promise<BroadcastOutcome> {
  const message = await prisma.broadcastMessage.findUnique({
    where: { id: messageId },
  });

  if (!message) throw new Error("Message not found.");

  if (!(await claimForSending(messageId))) {
    throw new Error(
      "This message has already been sent or is currently sending."
    );
  }

  const content: BroadcastContent = contentOf(message);

  try {
    const audience = await resolveRecipients({
      audience: message.audience,
      courseId: message.courseId,
      targetUserId: message.targetUserId,
      destinationId: message.destinationId,
    });

    if (audience.kind === "destination") {
      await stageDeliveries(messageId, [
        { userId: null, chatId: audience.chatId },
      ]);

      await prisma.broadcastMessage.update({
        where: { id: messageId },
        data: { recipientCount: 1 },
      });
    } else {
      await stageDeliveries(
        messageId,
        audience.recipients.map((r) => ({
          userId: r.userId,
          chatId: r.chatId!,
        }))
      );

      await stageSkipped(messageId, audience.skipped);

      await prisma.broadcastMessage.update({
        where: { id: messageId },
        data: { recipientCount: audience.recipients.length },
      });
    }

    return await drainPending(messageId, content);
  } catch (error) {
    /*
     * Resolution or staging failed, so nothing was delivered. Marked FAILED
     * rather than left in SENDING, which would otherwise be indistinguishable
     * from a run still in progress.
     *
     * The lock is cleared in the same write. claimForSending took it, and this
     * path never reaches drainPending's release — leaving it set would make
     * the row look actively sending for the whole staleness window.
     */
    await prisma.broadcastMessage.update({
      where: { id: messageId },
      data: { status: "FAILED", completedAt: new Date(), lockedAt: null },
    });

    throw error;
  }
}

/**
 * Continue a broadcast whose previous pass ran out of execution time.
 *
 * Only PENDING rows are drained, so recipients already delivered to are never
 * messaged twice. The lock makes concurrent resumes impossible: a second
 * caller is refused rather than queued, because two passes over the same
 * PENDING set would double-send.
 */
export async function resumeBroadcast(
  messageId: string
): Promise<BroadcastOutcome> {
  const message = await prisma.broadcastMessage.findUnique({
    where: { id: messageId },
  });

  if (!message) throw new Error("Message not found.");

  if (message.status !== "SENDING") {
    throw new Error("Only a message that is still sending can be resumed.");
  }

  if (!(await claimForResume(messageId))) {
    throw new Error(
      "This broadcast is already being sent right now. Wait for it to finish, then check again."
    );
  }

  return drainPending(messageId, contentOf(message));
}

/**
 * Requeue failed recipients that are worth another attempt.
 *
 * Only rows flagged `retryable` are reset — a 429 or a network blip. A
 * recipient who blocked the bot, or a chat that does not exist, stays FAILED
 * however many times this is pressed, because retrying them can only produce
 * the same rejection and waste rate-limit budget the login flow also needs.
 *
 * SENT rows are untouched, so this can never redeliver to someone who already
 * received the message.
 */
export async function retryFailedDeliveries(
  messageId: string
): Promise<BroadcastOutcome> {
  const message = await prisma.broadcastMessage.findUnique({
    where: { id: messageId },
  });

  if (!message) throw new Error("Message not found.");

  if (message.status === "SENDING") {
    throw new Error("This broadcast is still sending. Resume it instead.");
  }

  const retryable = await prisma.broadcastDelivery.count({
    where: { messageId, status: "FAILED", retryable: true },
  });

  if (retryable === 0) {
    throw new Error(
      "No failures here can be retried — they were permanent rejections from Telegram."
    );
  }

  /*
   * Move the message back into SENDING and take the lock in one step, so a
   * second retry cannot start alongside this one.
   */
  const { count } = await prisma.broadcastMessage.updateMany({
    where: { id: messageId, status: { in: ["PARTIALLY_SENT", "FAILED"] } },
    data: { status: "SENDING", lockedAt: new Date(), completedAt: null },
  });

  if (count !== 1) {
    throw new Error("This broadcast changed state — reload and try again.");
  }

  await prisma.broadcastDelivery.updateMany({
    where: { messageId, status: "FAILED", retryable: true },
    data: { status: "PENDING", error: null, retryable: false },
  });

  return drainPending(messageId, contentOf(message));
}

/** The stored message, in the shape the transport expects. */
function contentOf(message: {
  title: string | null;
  body: string | null;
  imageUrl: string | null;
  buttons: unknown;
}): BroadcastContent {
  return {
    title: message.title,
    body: message.body,
    imageUrl: message.imageUrl,
    buttons: (message.buttons as BroadcastButton[] | null) ?? [],
  };
}

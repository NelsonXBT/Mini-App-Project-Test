/**
 * Verification for the resume and retry paths.
 *
 * Covers the guarantees that matter once a broadcast can be restarted by hand:
 * a resumed run never redelivers to someone already reached, two concurrent
 * resumes cannot both drain the same queue, and only failures worth retrying
 * are retried.
 *
 * Telegram is never contacted — fetch is intercepted, so the real transport
 * runs (including its mapping of error codes to retryable/permanent) but no
 * message leaves the machine. Runs against the Neon Development branch ONLY.
 *
 * Run: node --env-file=.env node_modules/.bin/tsx scripts/verify-resume.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MARK = "__verify_resume__";
const DEV_ENDPOINT = "ep-muddy-dust-asdoh3ay";

let passed = 0;
let failed = 0;

function check(name: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) passed++;
  else failed++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${name}` +
      (ok
        ? ""
        : `\n      got:  ${JSON.stringify(got)}\n      want: ${JSON.stringify(want)}`)
  );
}

/** Chat ids the stub rejects permanently — a user who blocked the bot. */
const BLOCKED = new Set<string>();
/** Chat ids the stub rejects with a 429 — transient, and so retryable. */
const RATE_LIMITED = new Set<string>();

let sendCalls: string[] = [];

async function main() {
  if (!(process.env.DATABASE_URL ?? "").includes(DEV_ENDPOINT)) {
    console.error("REFUSING TO RUN: not the Development branch.");
    process.exit(1);
  }

  console.log("Target: Development branch — OK\n");

  const realFetch = globalThis.fetch;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();

    if (!url.includes("api.telegram.org")) {
      return realFetch(input as RequestInfo, init);
    }

    const payload = JSON.parse(String(init?.body ?? "{}"));
    const chatId = String(payload.chat_id);

    sendCalls.push(chatId);

    if (BLOCKED.has(chatId)) {
      return new Response(
        JSON.stringify({
          ok: false,
          error_code: 403,
          description: "Forbidden: bot was blocked by the user",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    if (RATE_LIMITED.has(chatId)) {
      /*
       * retry_after 0 so the transport's own flood-wait does not slow the
       * suite. It still exhausts MAX_FLOOD_RETRIES and returns retryable.
       */
      return new Response(
        JSON.stringify({
          ok: false,
          error_code: 429,
          description: "Too Many Requests",
          parameters: { retry_after: 0 },
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: true, result: {} }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  process.env.TELEGRAM_BOT_TOKEN ??= "test-token";

  const { resumeBroadcast, retryFailedDeliveries } = await import(
    "../lib/messaging/broadcast"
  );
  const { getBroadcastHistory } = await import("../lib/db/admin/messages");

  const before = {
    users: await prisma.user.count(),
    enrollments: await prisma.enrollment.count(),
    active: await prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    inactive: await prisma.enrollment.count({ where: { status: "INACTIVE" } }),
  };

  try {
    const course = await prisma.course.create({
      data: { title: `${MARK} Course`, slug: `${MARK}-c1` },
    });

    const mk = async (name: string, tg: string) => {
      const u = await prisma.user.create({
        data: { firstName: `${MARK}${name}`, telegramId: BigInt(tg) },
      });
      await prisma.enrollment.create({
        data: { userId: u.id, courseId: course.id, status: "ACTIVE" },
      });
      return u;
    };

    const s1 = await mk("S1", "9200000000001");
    const s2 = await mk("S2", "9200000000002");
    const s3 = await mk("S3", "9200000000003");

    /*
     * An interrupted broadcast, built directly rather than by timing out a
     * real one: the send budget is 45s and cannot be tripped quickly. What
     * matters to resume is only the state left behind — SENDING, with some
     * rows SENT and some still PENDING — and that is reproduced exactly.
     */
    const message = await prisma.broadcastMessage.create({
      data: {
        audience: "COURSE_ACTIVE_STUDENTS",
        courseId: course.id,
        title: `${MARK} interrupted`,
        body: "resume me",
        status: "SENDING",
        recipientCount: 3,
        sentCount: 1,
      },
    });

    // S1 already received it before the pass was killed.
    await prisma.broadcastDelivery.create({
      data: {
        messageId: message.id,
        userId: s1.id,
        chatId: "9200000000001",
        status: "SENT",
        sentAt: new Date(),
      },
    });

    for (const [user, chat] of [
      [s2, "9200000000002"],
      [s3, "9200000000003"],
    ] as const) {
      await prisma.broadcastDelivery.create({
        data: {
          messageId: message.id,
          userId: user.id,
          chatId: chat,
          status: "PENDING",
        },
      });
    }

    console.log("HISTORY — what the admin is shown");

    const beforeRows = await getBroadcastHistory();
    const beforeRow = beforeRows.find((r) => r.id === message.id)!;

    check("remaining count surfaced", beforeRow.pendingCount, 2);
    check("resume offered", beforeRow.canResume, true);
    check("retry not offered (nothing failed yet)", beforeRow.canRetry, false);
    check("not shown as actively sending", beforeRow.isLocked, false);

    console.log("\nRESUME — no duplicate delivery");

    sendCalls = [];
    const outcome = await resumeBroadcast(message.id);

    check("only the 2 pending recipients contacted", sendCalls.sort(), [
      "9200000000002",
      "9200000000003",
    ]);
    check(
      "already-delivered recipient never re-contacted",
      sendCalls.includes("9200000000001"),
      false
    );
    check("status completed", outcome.status, "SENT");
    check("total sent counts the earlier delivery", outcome.sent, 3);
    check("nothing left pending", outcome.pending, 0);

    const s1Row = await prisma.broadcastDelivery.findFirst({
      where: { messageId: message.id, userId: s1.id },
    });

    check("original delivery row untouched", s1Row?.status, "SENT");
    check(
      "exactly one row per recipient",
      await prisma.broadcastDelivery.count({ where: { messageId: message.id } }),
      3
    );

    console.log("\nLOCK — concurrent resumes cannot both run");

    // A second interrupted message, this time raced by two resume calls.
    const raced = await prisma.broadcastMessage.create({
      data: {
        audience: "COURSE_ACTIVE_STUDENTS",
        courseId: course.id,
        title: `${MARK} raced`,
        body: "race",
        status: "SENDING",
        recipientCount: 2,
      },
    });

    for (const [user, chat] of [
      [s2, "9200000000002"],
      [s3, "9200000000003"],
    ] as const) {
      await prisma.broadcastDelivery.create({
        data: {
          messageId: raced.id,
          userId: user.id,
          chatId: chat,
          status: "PENDING",
        },
      });
    }

    sendCalls = [];

    const results = await Promise.allSettled([
      resumeBroadcast(raced.id),
      resumeBroadcast(raced.id),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled").length;
    const rejected = results.filter((r) => r.status === "rejected").length;

    check("exactly one resume ran", fulfilled, 1);
    check("the other was refused", rejected, 1);
    check(
      "each recipient contacted exactly once",
      sendCalls.sort(),
      ["9200000000002", "9200000000003"]
    );
    check(
      "lock released after the pass",
      (await prisma.broadcastMessage.findUnique({ where: { id: raced.id } }))
        ?.lockedAt ?? null,
      null
    );

    console.log("\nHELD LOCK — a live pass is not stolen");

    const held = await prisma.broadcastMessage.create({
      data: {
        audience: "COURSE_ACTIVE_STUDENTS",
        courseId: course.id,
        title: `${MARK} held`,
        status: "SENDING",
        body: "held",
        // Fresh lock: something else is mid-drain right now.
        lockedAt: new Date(),
      },
    });

    await prisma.broadcastDelivery.create({
      data: {
        messageId: held.id,
        userId: s2.id,
        chatId: "9200000000002",
        status: "PENDING",
      },
    });

    let refused = false;
    try {
      await resumeBroadcast(held.id);
    } catch {
      refused = true;
    }

    check("resume refused while a pass holds the lock", refused, true);

    const heldRows = await getBroadcastHistory();
    const heldRow = heldRows.find((r) => r.id === held.id)!;

    check("shown as actively sending", heldRow.isLocked, true);
    check("resume not offered while locked", heldRow.canResume, false);

    // A lock older than the TTL is abandoned, and must be reclaimable —
    // otherwise a killed function strands the broadcast forever.
    await prisma.broadcastMessage.update({
      where: { id: held.id },
      data: { lockedAt: new Date(Date.now() - 130_000) },
    });

    const staleRows = await getBroadcastHistory();
    const staleRow = staleRows.find((r) => r.id === held.id)!;

    check("stale lock no longer counts as sending", staleRow.isLocked, false);
    check("resume offered again once stale", staleRow.canResume, true);

    const reclaimed = await resumeBroadcast(held.id);
    check("stale lock reclaimed and drained", reclaimed.status, "SENT");

    console.log("\nRETRY — only transient failures");

    const mixed = await prisma.broadcastMessage.create({
      data: {
        audience: "COURSE_ACTIVE_STUDENTS",
        courseId: course.id,
        title: `${MARK} mixed`,
        body: "mixed",
        status: "SENDING",
        recipientCount: 2,
      },
    });

    // S2 is rate limited (transient); S3 has blocked the bot (permanent).
    RATE_LIMITED.add("9200000000002");
    BLOCKED.add("9200000000003");

    for (const [user, chat] of [
      [s2, "9200000000002"],
      [s3, "9200000000003"],
    ] as const) {
      await prisma.broadcastDelivery.create({
        data: {
          messageId: mixed.id,
          userId: user.id,
          chatId: chat,
          status: "PENDING",
        },
      });
    }

    sendCalls = [];
    const mixedOutcome = await resumeBroadcast(mixed.id);

    check("both failed", mixedOutcome.failed, 2);
    check("status FAILED", mixedOutcome.status, "FAILED");

    const rows = await prisma.broadcastDelivery.findMany({
      where: { messageId: mixed.id },
      select: { userId: true, retryable: true },
    });

    check(
      "rate-limited failure flagged retryable",
      rows.find((r) => r.userId === s2.id)?.retryable,
      true
    );
    check(
      "blocked-bot failure flagged permanent",
      rows.find((r) => r.userId === s3.id)?.retryable,
      false
    );

    const mixedRows = await getBroadcastHistory();
    const mixedRow = mixedRows.find((r) => r.id === mixed.id)!;

    check("only the transient failure is offered", mixedRow.retryableCount, 1);
    check("retry offered", mixedRow.canRetry, true);
    check("resume not offered for a settled message", mixedRow.canResume, false);

    // Let the retry succeed this time, as a cleared flood limit would.
    RATE_LIMITED.delete("9200000000002");

    sendCalls = [];
    const retried = await retryFailedDeliveries(mixed.id);

    check("only the retryable recipient re-contacted", sendCalls, [
      "9200000000002",
    ]);
    check(
      "blocked recipient not contacted again",
      sendCalls.includes("9200000000003"),
      false
    );
    check("retry delivered", retried.sent, 1);
    check("permanent failure still failed", retried.failed, 1);
    check("status now PARTIALLY_SENT", retried.status, "PARTIALLY_SENT");

    // Nothing retryable remains, so a second press must be refused rather
    // than re-attempting the blocked recipient.
    let secondRefused = false;
    try {
      await retryFailedDeliveries(mixed.id);
    } catch {
      secondRefused = true;
    }

    check("second retry refused — nothing worth retrying", secondRefused, true);

    console.log("\nREAD-ONLY — resuming must not alter access");

    check(
      "ACTIVE enrollments unchanged",
      await prisma.enrollment.count({ where: { status: "ACTIVE" } }),
      before.active + 3
    );
    check(
      "INACTIVE enrollments unchanged",
      await prisma.enrollment.count({ where: { status: "INACTIVE" } }),
      before.inactive
    );
    check(
      "blocked student's enrollment still ACTIVE",
      (await prisma.enrollment.findFirst({ where: { userId: s3.id } }))?.status,
      "ACTIVE"
    );
    check(
      "no sessions created by resuming",
      await prisma.session.count({
        where: { userId: { in: [s1.id, s2.id, s3.id] } },
      }),
      0
    );
  } finally {
    await prisma.broadcastDelivery.deleteMany({
      where: { message: { title: { startsWith: MARK } } },
    });
    await prisma.broadcastMessage.deleteMany({
      where: { title: { startsWith: MARK } },
    });
    await prisma.enrollment.deleteMany({
      where: { user: { firstName: { startsWith: MARK } } },
    });
    await prisma.user.deleteMany({
      where: { firstName: { startsWith: MARK } },
    });
    await prisma.course.deleteMany({ where: { slug: { startsWith: MARK } } });
  }

  console.log("\nFIXTURE INTEGRITY");
  check("users restored", await prisma.user.count(), before.users);
  check("enrollments restored", await prisma.enrollment.count(), before.enrollments);

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error("VERIFICATION ERROR:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

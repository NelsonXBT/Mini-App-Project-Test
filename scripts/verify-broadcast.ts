/**
 * Verification for the broadcast state machine.
 *
 * Covers duplicate-send protection, per-recipient failure isolation, skipped
 * recipients, and the guarantee that a broadcast never mutates enrollment or
 * course-access state.
 *
 * Telegram is never contacted: sendBroadcastMessage is replaced at module
 * scope with a stub, so no real message is delivered and no bot token is
 * needed. Runs against the Neon Development branch ONLY.
 *
 * Run: npx tsx scripts/verify-broadcast.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MARK = "__verify_broadcast__";
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

/* Chat ids the stub should treat as permanently undeliverable, mimicking a
 * student who has blocked the bot. */
const BLOCKED = new Set<string>();

let sendCalls: string[] = [];
let lastPayload: Record<string, unknown> = {};

async function main() {
  if (!(process.env.DATABASE_URL ?? "").includes(DEV_ENDPOINT)) {
    console.error("REFUSING TO RUN: not the Development branch.");
    process.exit(1);
  }

  console.log("Target: Development branch — OK\n");

  /*
   * Intercept fetch rather than stubbing the transport module.
   *
   * ES module namespaces are frozen, so the exports cannot be replaced — but
   * intercepting at the network boundary is the better test anyway: the real
   * sendBroadcastMessage runs, including its payload construction and its
   * mapping of Telegram error codes to retryable/permanent outcomes. Only the
   * wire is fake.
   */
  const realFetch = globalThis.fetch;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();

    if (!url.includes("api.telegram.org")) {
      return realFetch(input as RequestInfo, init);
    }

    const payload = JSON.parse(String(init?.body ?? "{}"));
    const chatId = String(payload.chat_id);

    sendCalls.push(chatId);
    lastPayload = payload;

    if (BLOCKED.has(chatId)) {
      // Telegram's real shape for a user who has blocked the bot.
      return new Response(
        JSON.stringify({
          ok: false,
          error_code: 403,
          description: "Forbidden: bot was blocked by the user",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: true, result: {} }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  // The interceptor never lets a request reach the network, but the transport
  // still requires a token to be present.
  process.env.TELEGRAM_BOT_TOKEN ??= "test-token";

  const { sendBroadcast } = await import("../lib/messaging/broadcast");

  const before = {
    users: await prisma.user.count(),
    enrollments: await prisma.enrollment.count(),
    active: await prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    inactive: await prisma.enrollment.count({ where: { status: "INACTIVE" } }),
  };

  let messageId = "";

  try {
    const course = await prisma.course.create({
      data: { title: `${MARK} Course`, slug: `${MARK}-c1` },
    });

    const mk = async (name: string, tg: string, status: "ACTIVE" | "INACTIVE") => {
      const u = await prisma.user.create({
        data: { firstName: `${MARK}${name}`, telegramId: BigInt(tg) },
      });
      await prisma.enrollment.create({
        data: { userId: u.id, courseId: course.id, status },
      });
      return u;
    };

    const s1 = await mk("S1", "9100000000001", "ACTIVE");
    const s2 = await mk("S2", "9100000000002", "ACTIVE");
    const s3 = await mk("S3", "9100000000003", "ACTIVE");
    await mk("S4", "9100000000004", "INACTIVE"); // must not receive

    // S3 has blocked the bot.
    BLOCKED.add("9100000000003");

    const message = await prisma.broadcastMessage.create({
      data: {
        audience: "COURSE_ACTIVE_STUDENTS",
        courseId: course.id,
        title: `${MARK} title`,
        body: "hello",
        status: "DRAFT",
      },
    });
    messageId = message.id;

    // ---- send ---------------------------------------------------------
    console.log("BROADCAST — partial failure handling");
    sendCalls = [];
    const outcome = await sendBroadcast(messageId);

    check("3 active students targeted", outcome.sent + outcome.failed, 3);
    check("2 delivered", outcome.sent, 2);
    check("1 failed (blocked bot)", outcome.failed, 1);
    check("status is PARTIALLY_SENT", outcome.status, "PARTIALLY_SENT");
    check("inactive student never contacted", sendCalls.includes("9100000000004"), false);
    check("blocked student was attempted", sendCalls.includes("9100000000003"), true);

    const blockedRow = await prisma.broadcastDelivery.findFirst({
      where: { messageId, chatId: "9100000000003" },
      select: { status: true, error: true },
    });
    check("failure recorded per recipient", blockedRow?.status, "FAILED");
    check("failure reason stored", (blockedRow?.error ?? "").includes("blocked"), true);
    check(
      "one failure did not stop the run",
      (await prisma.broadcastDelivery.count({ where: { messageId, status: "SENT" } })),
      2
    );

    // The interceptor captured the real payload the transport built.
    console.log("\nWIRE PAYLOAD — built by the real transport");
    check("title bolded, body appended", lastPayload.text, `<b>${MARK} title</b>\n\nhello`);
    check("HTML parse mode set", lastPayload.parse_mode, "HTML");
    check("no buttons sent when none configured", "reply_markup" in lastPayload, false);

    // ---- duplicate-send protection -------------------------------------
    console.log("\nDUPLICATE-SEND PROTECTION");
    sendCalls = [];
    let secondSendRejected = false;
    try {
      await sendBroadcast(messageId);
    } catch {
      secondSendRejected = true;
    }
    check("re-sending a completed message is refused", secondSendRejected, true);
    check("no additional Telegram calls made", sendCalls.length, 0);

    // Concurrent double-click on a fresh DRAFT: exactly one must win.
    const race = await prisma.broadcastMessage.create({
      data: { audience: "COURSE_ACTIVE_STUDENTS", courseId: course.id, body: "race", status: "DRAFT" },
    });
    const results = await Promise.allSettled([
      sendBroadcast(race.id),
      sendBroadcast(race.id),
    ]);
    check(
      "concurrent double-send: exactly one succeeds",
      results.filter((r) => r.status === "fulfilled").length,
      1
    );
    const raceDeliveries = await prisma.broadcastDelivery.groupBy({
      by: ["chatId"],
      where: { messageId: race.id },
      _count: { chatId: true },
    });
    check(
      "no recipient staged twice",
      raceDeliveries.every((row) => row._count.chatId === 1),
      true
    );
    await prisma.broadcastMessage.delete({ where: { id: race.id } });

    // ---- access system untouched ---------------------------------------
    console.log("\nREAD-ONLY — broadcasting must not alter access");
    check("ACTIVE enrollments unchanged", await prisma.enrollment.count({ where: { status: "ACTIVE" } }), before.active + 3);
    check("INACTIVE enrollments unchanged", await prisma.enrollment.count({ where: { status: "INACTIVE" } }), before.inactive + 1);
    check(
      "blocked student's enrollment still ACTIVE",
      (await prisma.enrollment.findFirst({ where: { userId: s3.id }, select: { status: true } }))?.status,
      "ACTIVE"
    );
    check(
      "delivered students' enrollments still ACTIVE",
      (await prisma.enrollment.count({ where: { userId: { in: [s1.id, s2.id] }, status: "ACTIVE" } })),
      2
    );
    check("no sessions created by broadcasting", await prisma.session.count({ where: { userId: { in: [s1.id, s2.id, s3.id] } } }), 0);
  } finally {
    await prisma.broadcastDelivery.deleteMany({ where: { message: { title: { startsWith: MARK } } } });
    await prisma.broadcastMessage.deleteMany({ where: { OR: [{ title: { startsWith: MARK } }, { body: "race" }] } });
    await prisma.enrollment.deleteMany({ where: { user: { firstName: { startsWith: MARK } } } });
    await prisma.user.deleteMany({ where: { firstName: { startsWith: MARK } } });
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

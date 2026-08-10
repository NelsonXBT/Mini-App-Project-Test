import { checkMembership } from "@/lib/telegram/checkMembership";
import { PrismaClient } from "@prisma/client";
(async () => {
  const p = new PrismaClient();
  const c = await p.course.findFirst({ where: { telegramChatId: { not: null } }, select: { telegramChatId: true } });
  const u = await p.user.findFirst({ select: { telegramId: true } });
  if (!c?.telegramChatId || !u) { await p.$disconnect(); return; }
  const times: number[] = [];
  for (let i = 0; i < 5; i++) {
    const s = Date.now();
    await checkMembership(c.telegramChatId, u.telegramId);
    times.push(Date.now() - s);
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  console.log("per-call ms:", times.join(", "));
  console.log("average:", avg.toFixed(0), "ms");
  console.log("");
  for (const n of [2, 5, 10, 20]) {
    console.log(`  ${String(n).padStart(2)} gated courses -> ~${(avg * n / 1000).toFixed(1)}s added to EVERY app open`);
  }
  await p.$disconnect();
})();

/**
 * Verification for broadcast recipient resolution.
 *
 * Covers the critical recipient test cases. Runs against the Neon Development
 * branch ONLY — it refuses to start against any other endpoint.
 *
 * Test data is created under a dedicated marker prefix and removed in a
 * finally block, so this script never disturbs the restored Nadi Academy
 * fixture data sharing the same database.
 *
 * Run: npx tsx scripts/verify-recipients.ts
 */

import { PrismaClient } from "@prisma/client";

import { resolveRecipients } from "../lib/messaging/recipients";

const prisma = new PrismaClient();

/* Everything this script creates carries this prefix, and only rows carrying
 * it are ever deleted. */
const MARK = "__verify_recipients__";

const DEV_ENDPOINT = "ep-muddy-dust-asdoh3ay";

let passed = 0;
let failed = 0;

function check(name: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) passed++;
  else failed++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${name}` +
      (ok ? "" : `\n      got:  ${JSON.stringify(got)}\n      want: ${JSON.stringify(want)}`)
  );
}

/** Sorted names of the students a given audience would actually deliver to. */
async function deliverableNames(input: Parameters<typeof resolveRecipients>[0]) {
  const resolved = await resolveRecipients(input);
  if (resolved.kind !== "students") throw new Error("expected students");
  return resolved.recipients.map((r) => r.firstName).sort();
}

async function skippedNames(input: Parameters<typeof resolveRecipients>[0]) {
  const resolved = await resolveRecipients(input);
  if (resolved.kind !== "students") throw new Error("expected students");
  return resolved.skipped.map((r) => r.firstName).sort();
}

async function main() {
  const url = process.env.DATABASE_URL ?? "";

  if (!url.includes(DEV_ENDPOINT)) {
    console.error(
      "REFUSING TO RUN: DATABASE_URL is not the Neon Development branch."
    );
    process.exit(1);
  }

  console.log("Target: Development branch — OK\n");

  // Baseline, so we can prove we left the fixture data untouched.
  const before = {
    users: await prisma.user.count(),
    courses: await prisma.course.count(),
    enrollments: await prisma.enrollment.count(),
    active: await prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    inactive: await prisma.enrollment.count({ where: { status: "INACTIVE" } }),
  };

  try {
    // ---- scenario ----------------------------------------------------
    // Telegram ids are far outside any real range so they cannot collide.
    const c1 = await prisma.course.create({
      data: { title: `${MARK} Course 1`, slug: `${MARK}-c1` },
    });
    const c2 = await prisma.course.create({
      data: { title: `${MARK} Course 2`, slug: `${MARK}-c2` },
    });
    const c3 = await prisma.course.create({
      data: { title: `${MARK} Course 3`, slug: `${MARK}-c3` },
    });

    const mk = (name: string, tgId: bigint) =>
      prisma.user.create({
        data: { firstName: `${MARK}${name}`, telegramId: tgId },
      });

    // A: C1 active
    const A = await mk("A", BigInt("9000000000001"));
    await prisma.enrollment.create({
      data: { userId: A.id, courseId: c1.id, status: "ACTIVE" },
    });

    // B: C1 INACTIVE, C2 active  (must be excluded from a C1 broadcast)
    const B = await mk("B", BigInt("9000000000002"));
    await prisma.enrollment.create({
      data: { userId: B.id, courseId: c1.id, status: "INACTIVE" },
    });
    await prisma.enrollment.create({
      data: { userId: B.id, courseId: c2.id, status: "ACTIVE" },
    });

    // C: C1 + C3 active  (dedup: must appear ONCE)
    const C = await mk("C", BigInt("9000000000003"));
    await prisma.enrollment.create({
      data: { userId: C.id, courseId: c1.id, status: "ACTIVE" },
    });
    await prisma.enrollment.create({
      data: { userId: C.id, courseId: c3.id, status: "ACTIVE" },
    });

    // D: only INACTIVE — not an active student at all
    const D = await mk("D", BigInt("9000000000004"));
    await prisma.enrollment.create({
      data: { userId: D.id, courseId: c1.id, status: "INACTIVE" },
    });

    // E: three active courses (dedup, stronger case)
    const E = await mk("E", BigInt("9000000000005"));
    for (const c of [c1, c2, c3]) {
      await prisma.enrollment.create({
        data: { userId: E.id, courseId: c.id, status: "ACTIVE" },
      });
    }

    const all = { audience: "ALL_ACTIVE_STUDENTS" as const, courseId: null, targetUserId: null, destinationId: null };

    // ---- TEST 1 + 3 + 5: all active students, dedup, exclusion --------
    console.log("TEST 1/3/5 — All Active Students");
    const allNames = (await deliverableNames(all)).filter((n) => n?.startsWith(MARK));
    check("A, B, C, E included; D excluded", allNames, [
      `${MARK}A`, `${MARK}B`, `${MARK}C`, `${MARK}E`,
    ]);
    check("C appears exactly once (2 active courses)", allNames.filter((n) => n === `${MARK}C`).length, 1);
    check("E appears exactly once (3 active courses)", allNames.filter((n) => n === `${MARK}E`).length, 1);
    check("D (no active enrollment) excluded", allNames.includes(`${MARK}D`), false);

    // ---- TEST 2: course-specific --------------------------------------
    console.log("\nTEST 2 — Active Students in Course 1");
    const c1Names = (await deliverableNames({
      audience: "COURSE_ACTIVE_STUDENTS", courseId: c1.id, targetUserId: null, destinationId: null,
    })).filter((n) => n?.startsWith(MARK));
    check("A, C, E included", c1Names, [`${MARK}A`, `${MARK}C`, `${MARK}E`]);
    check("B excluded (C1 INACTIVE despite C2 ACTIVE)", c1Names.includes(`${MARK}B`), false);
    check("D excluded (C1 INACTIVE)", c1Names.includes(`${MARK}D`), false);

    // ---- TEST 4: dormancy is irrelevant --------------------------------
    console.log("\nTEST 4 — Long-dormant student still included");
    // A has no Session and no LessonProgress at all: the strongest possible
    // "has not opened the app" signal. Inclusion above already proves the
    // resolver applies no recency filter.
    check("A included with zero sessions/progress", allNames.includes(`${MARK}A`), true);
    check("no Session rows for A", await prisma.session.count({ where: { userId: A.id } }), 0);
    check("no progress rows for A", await prisma.lessonProgress.count({ where: { userId: A.id } }), 0);

    // ---- TEST 6: specific student, no active enrollment ---------------
    console.log("\nTEST 6 — Specific Student");
    const dNames = await deliverableNames({
      audience: "SPECIFIC_STUDENT", courseId: null, targetUserId: D.id, destinationId: null,
    });
    check("D selectable despite no ACTIVE enrollment", dNames, [`${MARK}D`]);

    // A student with no usable Telegram chat id cannot be created (telegramId
    // is non-nullable), so unreachability is modelled at the partition step.
    // Verified instead via the skipped list being empty for a normal student:
    check("no false skips for a reachable student", await skippedNames({
      audience: "SPECIFIC_STUDENT", courseId: null, targetUserId: A.id, destinationId: null,
    }), []);

    // ---- READ-ONLY GUARANTEE ------------------------------------------
    console.log("\nREAD-ONLY — resolution must not mutate enrollment state");
    const activeBefore = await prisma.enrollment.count({ where: { status: "ACTIVE" } });
    const inactiveBefore = await prisma.enrollment.count({ where: { status: "INACTIVE" } });

    await resolveRecipients(all);
    await resolveRecipients({ audience: "COURSE_ACTIVE_STUDENTS", courseId: c1.id, targetUserId: null, destinationId: null });
    await resolveRecipients({ audience: "SPECIFIC_STUDENT", courseId: null, targetUserId: D.id, destinationId: null });

    check("ACTIVE count unchanged after resolution", await prisma.enrollment.count({ where: { status: "ACTIVE" } }), activeBefore);
    check("INACTIVE count unchanged after resolution", await prisma.enrollment.count({ where: { status: "INACTIVE" } }), inactiveBefore);
    check("B's C1 enrollment still INACTIVE", (await prisma.enrollment.findFirst({
      where: { userId: B.id, courseId: c1.id }, select: { status: true },
    }))?.status, "INACTIVE");
  } finally {
    // ---- cleanup: only ever rows carrying the marker ------------------
    await prisma.enrollment.deleteMany({
      where: { user: { firstName: { startsWith: MARK } } },
    });
    await prisma.user.deleteMany({ where: { firstName: { startsWith: MARK } } });
    await prisma.course.deleteMany({ where: { slug: { startsWith: MARK } } });
  }

  // ---- fixture data must be exactly as we found it ---------------------
  console.log("\nFIXTURE INTEGRITY — existing data untouched");
  const after = {
    users: await prisma.user.count(),
    courses: await prisma.course.count(),
    enrollments: await prisma.enrollment.count(),
    active: await prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    inactive: await prisma.enrollment.count({ where: { status: "INACTIVE" } }),
  };
  check("counts identical to before", after, before);

  console.log(`\n${passed} passed, ${failed} failed`);

  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error("VERIFICATION ERROR:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

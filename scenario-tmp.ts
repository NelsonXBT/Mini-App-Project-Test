/*
 * Reproduces the reported scenario end-to-end, then ROLLS BACK.
 *
 *   1. Student has access to course A and watches a lesson in it.
 *   2. Access to A is revoked (removed from that Telegram chat).
 *   3. Access to course B is granted instead.
 *   4. Open the app — what does the home card offer?
 *
 * Safety: everything happens inside one interactive transaction that always
 * ends by throwing, so the transaction rolls back and nothing is persisted.
 * It only ever CREATEs new isolated rows (unique telegramId / slugs) and
 * never reads-modifies-writes or deletes anything that already exists.
 *
 * Run twice to compare:
 *   --old   leave the revoked enrolment ACTIVE (the bug)
 *   --new   deactivate it, as the fixed login route now does
 */
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const MODE_NEW = process.argv.includes("--new");
const STAMP = `scenario-${Date.now()}`;

class Rollback extends Error {}

async function makeCourse(
  tx: Prisma.TransactionClient,
  slug: string,
  chatId: string,
  lessons: number
) {
  return tx.course.create({
    data: {
      title: slug,
      slug,
      isPublished: true,
      telegramChatId: chatId,
      modules: {
        create: {
          title: "M1",
          order: 1,
          lessons: {
            create: Array.from({ length: lessons }, (_, i) => ({
              title: `L${i + 1}`,
              order: i + 1,
              provider: "youtube" as const,
              videoId: `vid-${i}`,
            })),
          },
        },
      },
    },
    include: { modules: { include: { lessons: true } } },
  });
}

async function main() {
  let output = "";

  try {
    await prisma.$transaction(
      async (tx) => {
        const A = await makeCourse(tx, `${STAMP}-a-old`, "-100111", 4);
        const B = await makeCourse(tx, `${STAMP}-b-new`, "-100222", 3);

        const user = await tx.user.create({
          data: {
            // Far outside the real Telegram id space, and rolled back anyway.
            telegramId: BigInt(-(Date.now() % 1_000_000_000)),
            firstName: "ScenarioTester",
          },
        });

        // 1. Access to A, and one lesson watched yesterday.
        await tx.enrollment.create({
          data: { userId: user.id, courseId: A.id, status: "ACTIVE" },
        });

        await tx.lessonProgress.create({
          data: {
            userId: user.id,
            lessonId: A.modules[0].lessons[0].id,
            progress: 40,
            completed: false,
            lastWatchedAt: new Date(Date.now() - 86_400_000),
          },
        });

        // 2. Access to A revoked. The fixed login route records this; the old
        //    one silently left the row ACTIVE, which is the defect.
        if (MODE_NEW) {
          await tx.enrollment.updateMany({
            where: { userId: user.id, courseId: A.id, status: "ACTIVE" },
            data: { status: "INACTIVE", lastCheckedAt: new Date() },
          });
        }

        // 3. Access to B granted, just now.
        await tx.enrollment.create({
          data: {
            userId: user.id,
            courseId: B.id,
            status: "ACTIVE",
            lastVerifiedAt: new Date(),
          },
        });

        // 4. Replay getHomeLearningCard's branch order with the new predicate.
        const accessible = {
          isPublished: true,
          enrollments: {
            some: { userId: user.id, status: "ACTIVE" as const },
          },
        };

        const latest = await tx.lessonProgress.findFirst({
          where: {
            userId: user.id,
            lastWatchedAt: { not: null },
            lesson: { module: { course: accessible } },
          },
          orderBy: { lastWatchedAt: "desc" },
          include: {
            lesson: {
              include: {
                module: {
                  include: {
                    course: {
                      include: { modules: { include: { lessons: true } } },
                    },
                  },
                },
              },
            },
          },
        });

        let verdict = "no card";

        if (latest) {
          const course = latest.lesson.module.course;
          const total = course.modules.reduce(
            (n, m) => n + m.lessons.length,
            0
          );
          const rows = await tx.lessonProgress.findMany({
            where: {
              userId: user.id,
              lesson: { module: { courseId: course.id } },
            },
            select: { completed: true },
          });
          const done = rows.filter((r) => r.completed).length;
          verdict =
            done < total
              ? `continue -> ${course.slug}`
              : "finished, falls through";
        }

        if (!latest || verdict.startsWith("finished")) {
          const startable = await tx.course.findMany({
            where: accessible,
            orderBy: { createdAt: "desc" },
            include: { modules: { include: { lessons: true } } },
          });

          for (const c of startable) {
            const ids = c.modules.flatMap((m) =>
              m.lessons.map((l) => l.id)
            );
            if (!ids.length) continue;
            const started = await tx.lessonProgress.findFirst({
              where: { userId: user.id, lessonId: { in: ids } },
              select: { id: true },
            });
            if (!started) {
              verdict = `start -> ${c.slug}`;
              break;
            }
          }
        }

        const enrollments = await tx.enrollment.findMany({
          where: { userId: user.id },
          select: { status: true, course: { select: { slug: true } } },
        });

        const shortSlug = (s: string) => s.replace(`${STAMP}-`, "");

        const expected = `start -> ${STAMP}-b-new`;

        output = [
          `revocation recorded : ${MODE_NEW ? "YES (fixed login route)" : "NO (old behaviour)"}`,
          `enrollments         : ${enrollments
            .map((e) => `${shortSlug(e.course.slug)}=${e.status}`)
            .sort()
            .join(", ")}`,
          `home card           : ${verdict.replace(`${STAMP}-`, "")}`,
          verdict === expected
            ? "PASS — offers the course they actually have"
            : "FAIL — card points at a course the student cannot open",
        ].join("\n");

        // Undo everything above.
        throw new Rollback();
      },
      { timeout: 30_000 }
    );
  } catch (error) {
    if (!(error instanceof Rollback)) throw error;
  }

  console.log(output);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

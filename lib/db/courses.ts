export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function getCourses() {
  return prisma.course.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      modules: {
        include: {
          lessons: true,
        },
      },
    },
  });
}

export async function getCourse(slug: string) {
  const user = await getCurrentUser();

  console.log("================================");
  console.log("Looking for course slug:", slug);

  const course = await prisma.course.findUnique({
    where: {
      slug,
    },
    include: {
      modules: {
        orderBy: {
          order: "asc",
        },
        include: {
          lessons: {
            orderBy: {
              order: "asc",
            },
            include: {
              resources: true,

              progress: user
                ? {
                    where: {
                      userId: user.id,
                    },
                    select: {
                      progress: true,
                      completed: true,
                      currentTime: true,
                    },
                  }
                : false,
            },
          },
        },
      },

      files: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  console.log("Database result:");
  console.dir(course, { depth: null });
  console.log("================================");

  return course;
}

export async function getCourseProgress(
  courseId: string
) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      totalLessons: 0,
      completedLessons: 0,
      progress: 0,
    };
  }

  const lessons = await prisma.lesson.findMany({
    where: {
      module: {
        courseId,
      },
    },
    select: {
      id: true,
    },
  });

  const totalLessons = lessons.length;

  if (totalLessons === 0) {
    return {
      totalLessons: 0,
      completedLessons: 0,
      progress: 0,
    };
  }

  const lessonProgress =
    await prisma.lessonProgress.findMany({
      where: {
        userId: user.id,
        lessonId: {
          in: lessons.map((lesson) => lesson.id),
        },
      },
      select: {
        progress: true,
        completed: true,
      },
    });

  const completedLessons =
    lessonProgress.filter(
      (lesson) => lesson.completed
    ).length;

  const totalProgress =
    lessonProgress.reduce(
      (sum, lesson) => sum + lesson.progress,
      0
    );

  return {
    totalLessons,
    completedLessons,
    progress: Math.round(
      totalProgress / totalLessons
    ),
  };
}

export async function getHomeLearningCard() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  /*
   * Everything below is scoped to published courses.
   *
   * Unpublishing is how a course is withdrawn from students, so a card must
   * never point at one — previously only the "recommend" branch filtered on
   * isPublished, which left students staring at a "Continue Learning" card
   * that failed the access guard the moment they tapped it.
   */
  const publishedCourse = { isPublished: true } as const;

  function summarise(
    course: {
      modules: { lessons: { id: string }[] }[];
    },
    rows: { progress: number; completed: boolean }[]
  ) {
    const totalLessons = course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0
    );

    const completedLessons = rows.filter(
      (row) => row.completed
    ).length;

    const totalProgress = rows.reduce(
      (sum, row) => sum + row.progress,
      0
    );

    return {
      totalLessons,
      completedLessons,
      progress:
        totalLessons > 0
          ? Math.round(totalProgress / totalLessons)
          : 0,
    };
  }

  async function progressRowsFor(courseId: string) {
    return prisma.lessonProgress.findMany({
      where: {
        userId: user!.id,
        lesson: {
          module: { courseId },
        },
      },
      select: {
        progress: true,
        completed: true,
      },
    });
  }

  // ----------------------------
  // 1. CONTINUE LEARNING
  //
  // Checked before "start" so a student who is mid-course is always taken
  // back to where they stopped rather than to the top of another course.
  // ----------------------------

  const latestProgress =
    await prisma.lessonProgress.findFirst({
      where: {
        userId: user.id,
        lastWatchedAt: { not: null },
        lesson: {
          module: {
            course: publishedCourse,
          },
        },
      },
      orderBy: {
        lastWatchedAt: "desc",
      },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: {
                  include: {
                    modules: {
                      orderBy: { order: "asc" },
                      include: {
                        lessons: {
                          orderBy: { order: "asc" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

  if (latestProgress) {
    const course = latestProgress.lesson.module.course;

    const rows = await progressRowsFor(course.id);
    const stats = summarise(course, rows);

    // A finished course falls through to "start" or "recommend" instead of
    // inviting the student to continue something already complete.
    if (stats.completedLessons < stats.totalLessons) {
      return {
        mode: "continue",
        course,
        lesson: latestProgress.lesson,
        ...stats,
      };
    }
  }

  // ----------------------------
  // 2. START LEARNING
  //
  // Any published course the student can open but has not begun. This used
  // to require an Enrollment row, which only exists for Telegram-gated
  // courses — so an ungated course never produced a "start" card at all.
  // ----------------------------

  const startable = await prisma.course.findMany({
    where: {
      ...publishedCourse,
      OR: [
        // Explicitly granted, or unlocked via Telegram membership.
        {
          enrollments: {
            some: {
              userId: user.id,
              status: "ACTIVE",
            },
          },
        },
        // Open courses: no Telegram gate configured.
        { telegramChatId: null },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  for (const course of startable) {
    const firstLesson = course.modules
      .flatMap((module) => module.lessons)
      .at(0);

    if (!firstLesson) {
      continue;
    }

    const lessonIds = course.modules.flatMap((module) =>
      module.lessons.map((lesson) => lesson.id)
    );

    const started = await prisma.lessonProgress.findFirst({
      where: {
        userId: user.id,
        lessonId: { in: lessonIds },
      },
      select: { id: true },
    });

    if (started) {
      continue;
    }

    return {
      mode: "start",
      course,
      lesson: firstLesson,
      totalLessons: lessonIds.length,
      completedLessons: 0,
      progress: 0,
    };
  }

  // ----------------------------
  // 3. RECOMMENDED COURSE
  // ----------------------------

  const recommendedCourse = await prisma.course.findFirst({
    where: {
      ...publishedCourse,
      enrollments: {
        none: {
          userId: user.id,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (recommendedCourse) {
    const firstLesson = recommendedCourse.modules
      .flatMap((module) => module.lessons)
      .at(0);

    if (firstLesson) {
      return {
        mode: "recommend",
        course: recommendedCourse,
        lesson: firstLesson,
        totalLessons: recommendedCourse.modules.reduce(
          (sum, module) => sum + module.lessons.length,
          0
        ),
        completedLessons: 0,
        progress: 0,
      };
    }
  }

  // ----------------------------
  // 4. FALLBACK
  //
  // Every published course is finished. Send the student back to the most
  // recent one so the card still links somewhere useful.
  // ----------------------------

  if (latestProgress) {
    const course = latestProgress.lesson.module.course;

    const rows = await progressRowsFor(course.id);

    return {
      mode: "continue",
      course,
      lesson: latestProgress.lesson,
      ...summarise(course, rows),
    };
  }

  return null;
}
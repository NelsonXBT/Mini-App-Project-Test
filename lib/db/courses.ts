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

  /*
   * Where the resumed lesson actually sits in the course, 1-based.
   *
   * The card used to label this `completedLessons + 1`, which only lines up
   * when the student watches strictly in order — skip ahead and a student
   * resuming lesson 8 was told they were on lesson 4.
   */
  function lessonNumberIn(
    course: {
      modules: { lessons: { id: string }[] }[];
    },
    lessonId: string
  ) {
    const index = course.modules
      .flatMap((module) => module.lessons)
      .findIndex((lesson) => lesson.id === lessonId);

    return index === -1 ? 1 : index + 1;
  }

  if (latestProgress) {
    const course = latestProgress.lesson.module.course;

    const rows = await progressRowsFor(course.id);
    const stats = summarise(course, rows);

    // A finished course falls through to "start" or "recommend" instead of
    // inviting the student to continue something already complete.
    if (stats.completedLessons < stats.totalLessons) {
      return {
        mode: "continue" as const,
        course,
        lesson: latestProgress.lesson,
        lessonNumber: lessonNumberIn(
          course,
          latestProgress.lessonId
        ),
        ...stats,
      };
    }
  }

  // ----------------------------
  // 2. START LEARNING
  //
  // A published course the student can actually open but has not begun.
  //
  // "Can open" has to mean exactly what CourseGuard means by it, or the card
  // offers a course that the course page then refuses. The guard checks the
  // slug against the session's unlockedCourses, and /api/telegram-login only
  // ever puts a course in that list when it has a telegramChatId *and* the
  // membership check passes — which is precisely the set of ACTIVE
  // enrollments it writes on the way through.
  //
  // An earlier version also matched `telegramChatId: null` here on the theory
  // that ungated courses are open to everyone. They are not: the login route
  // skips them outright, so they never reach unlockedCourses, and every such
  // card landed the student on "You do not have access to this course yet."
  // ----------------------------

  const startable = await prisma.course.findMany({
    where: {
      ...publishedCourse,
      enrollments: {
        some: {
          userId: user.id,
          status: "ACTIVE",
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
      mode: "start" as const,
      course,
      lesson: firstLesson,
      totalLessons: lessonIds.length,
      completedLessons: 0,
      progress: 0,
    };
  }

  // ----------------------------
  // 3. RECOMMENDED COURSE
  //
  // An upsell, so this is the one mode that deliberately points at a course
  // the student cannot open yet — /courses/<slug> renders CourseGuard's
  // "Gain Access Now" screen for them.
  //
  // Matched on ACTIVE enrollments only. Matching any enrollment row meant a
  // student whose membership had lapsed to INACTIVE was never shown the
  // course again, even though they no longer had access to it.
  // ----------------------------

  const recommendable = await prisma.course.findMany({
    where: {
      ...publishedCourse,
      enrollments: {
        none: {
          userId: user.id,
          status: "ACTIVE",
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

  /*
   * Walk the candidates rather than taking only the newest one. findFirst
   * returned a single course, so if that one happened to have no lessons yet
   * — a course still being authored — the card vanished from the home page
   * entirely instead of recommending the next one down.
   */
  for (const course of recommendable) {
    const lessons = course.modules.flatMap(
      (module) => module.lessons
    );

    const firstLesson = lessons.at(0);

    if (!firstLesson) {
      continue;
    }

    return {
      mode: "recommend" as const,
      course,
      lesson: firstLesson,
      totalLessons: lessons.length,
      completedLessons: 0,
      progress: 0,
    };
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
      mode: "continue" as const,
      course,
      lesson: latestProgress.lesson,
      lessonNumber: lessonNumberIn(
        course,
        latestProgress.lessonId
      ),
      ...summarise(course, rows),
    };
  }

  return null;
}
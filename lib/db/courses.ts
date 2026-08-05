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

  // ----------------------------
  // Active enrollments (newest first)
  // ----------------------------

  const enrollments =
    await prisma.enrollment.findMany({
      where: {
        userId: user.id,
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        course: {
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
                },
              },
            },
          },
        },
      },
    });

  // ----------------------------
  // 1. START LEARNING
  // ----------------------------

  for (const enrollment of enrollments) {
    const lessonIds =
      enrollment.course.modules.flatMap(
        (module) =>
          module.lessons.map(
            (lesson) => lesson.id
          )
      );

    if (lessonIds.length === 0) {
      continue;
    }

    const hasStarted =
      await prisma.lessonProgress.findFirst({
        where: {
          userId: user.id,
          lessonId: {
            in: lessonIds,
          },
        },
      });

    if (!hasStarted) {
      const firstLesson =
        enrollment.course.modules[0]?.lessons[0];

      if (!firstLesson) {
        continue;
      }

      return {
        mode: "start",

        course: enrollment.course,
        lesson: firstLesson,

        totalLessons: lessonIds.length,
        completedLessons: 0,
        progress: 0,
      };
    }
  }

  // ----------------------------
  // 2. CONTINUE LEARNING
  // ----------------------------

  const latestProgress =
    await prisma.lessonProgress.findFirst({
      where: {
        userId: user.id,
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
                      include: {
                        lessons: true,
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
    const course =
      latestProgress.lesson.module.course;

    const totalLessons =
      course.modules.reduce(
        (sum, module) =>
          sum + module.lessons.length,
        0
      );

    const lessonProgress =
      await prisma.lessonProgress.findMany({
        where: {
          userId: user.id,
          lesson: {
            module: {
              courseId: course.id,
            },
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
        (sum, lesson) =>
          sum + lesson.progress,
        0
      );

    // If course isn't finished, continue learning.
    if (
      completedLessons < totalLessons
    ) {
      return {
        mode: "continue",

        course,
        lesson: latestProgress.lesson,

        totalLessons,
        completedLessons,

        progress: Math.round(
          totalProgress / totalLessons
        ),
      };
    }
  }

  // ----------------------------
  // 3. RECOMMENDED COURSE
  // ----------------------------

  const recommendedCourse =
    await prisma.course.findFirst({
      where: {
        isPublished: true,
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
          orderBy: {
            order: "asc",
          },
          include: {
            lessons: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });

  if (recommendedCourse) {
    const firstLesson =
  recommendedCourse.modules[0]?.lessons[0];

      if (!firstLesson) {
        return null;
      }

      return {
        mode: "recommend",

        course: recommendedCourse,
        lesson: firstLesson,

        totalLessons:
          recommendedCourse.modules.reduce(
            (sum, module) =>
              sum + module.lessons.length,
            0
          ),

        completedLessons: 0,
        progress: 0,
      };
        }

  // ----------------------------
  // 4. FALLBACK
  // ----------------------------

  if (latestProgress) {
    const course =
      latestProgress.lesson.module.course;

    const totalLessons =
      course.modules.reduce(
        (sum, module) =>
          sum + module.lessons.length,
        0
      );

    const lessonProgress =
      await prisma.lessonProgress.findMany({
        where: {
          userId: user.id,
          lesson: {
            module: {
              courseId: course.id,
            },
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
        (sum, lesson) =>
          sum + lesson.progress,
        0
      );

    return {
      mode: "continue",

      course,
      lesson: latestProgress.lesson,

      totalLessons,
      completedLessons,

      progress: Math.round(
        totalProgress / totalLessons
      ),
    };
  }

  return null;
}
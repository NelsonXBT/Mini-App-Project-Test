
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function getLesson(courseSlug: string, lessonId: string) {
  return prisma.lesson.findFirst({
    where: {
      id: lessonId,
      module: {
        course: {
          slug: courseSlug,
        },
      },
    },
    include: {
      resources: true,
      module: {
        include: {
          course: true,
          lessons: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
  });
}

export async function getLessonById(lessonId: string) {
  return prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
    include: {
      resources: true,
      module: {
        include: {
          course: true,
        },
      },
    },
  });
}

export async function getCourseLessons(courseSlug: string) {
  const course = await prisma.course.findUnique({
    where: {
      slug: courseSlug,
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

  if (!course) return null;

  return course.modules.flatMap((module) => module.lessons);
}

export async function getLessonProgress(
  lessonId: string
) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId,
      },
    },
    select: {
      currentTime: true,
      progress: true,
      completed: true,
    },
  });
}
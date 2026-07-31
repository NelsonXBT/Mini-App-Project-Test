import { prisma } from "@/lib/prisma";

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
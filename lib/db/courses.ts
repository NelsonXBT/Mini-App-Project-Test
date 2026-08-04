export const dynamic = "force-dynamic";


import { prisma } from "@/lib/prisma";

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
    },
  });

  console.log("Database result:");
  console.dir(course, { depth: null });
  console.log("================================");

  return course;
}


import { getCurrentUser } from "@/lib/auth";

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

  const completedLessons =
    await prisma.lessonProgress.count({
      where: {
        userId: user.id,
        completed: true,
        lessonId: {
          in: lessons.map(
            (lesson) => lesson.id
          ),
        },
      },
    });

  return {
    totalLessons,
    completedLessons,
    progress: Math.round(
      (completedLessons / totalLessons) * 100
    ),
  };
}
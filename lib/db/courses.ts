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
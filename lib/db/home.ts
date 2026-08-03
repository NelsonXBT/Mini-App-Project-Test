
  

import { prisma } from "../prisma";

export async function getContinueLearningCourse() {
  return prisma.course.findFirst({
    where: {
      isPublished: true,
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
}
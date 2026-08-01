import { prisma } from "@/lib/prisma";

export async function getLessonProgress(
  userId: string,
  lessonId: string
) {
  return prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
  });
}

export async function saveLessonProgress(
  userId: string,
  lessonId: string,
  currentTime: number,
  duration: number
) {
  const progress =
    duration > 0
      ? (currentTime / duration) * 100
      : 0;

  return prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },

    update: {
      currentTime: Math.floor(currentTime),
      progress,
      lastWatchedAt: new Date(),

      completed: progress >= 95,

      completedAt:
        progress >= 95
          ? new Date()
          : null,
    },

    create: {
      userId,
      lessonId,

      currentTime: Math.floor(currentTime),
      progress,

      completed: progress >= 95,

      completedAt:
        progress >= 95
          ? new Date()
          : null,

      lastWatchedAt: new Date(),
    },
  });
}
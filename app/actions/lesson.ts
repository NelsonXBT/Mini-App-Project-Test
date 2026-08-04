"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function completeLesson(lessonId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId,
      },
    },
    update: {
      completed: true,
      progress: 100,
      currentTime: 0,
      completedAt: new Date(),
      lastWatchedAt: new Date(),
    },
    create: {
      userId: user.id,
      lessonId,
      completed: true,
      progress: 100,
      currentTime: 0,
      completedAt: new Date(),
      lastWatchedAt: new Date(),
    },
  });

  console.log(
    `✅ ${user.firstName} completed lesson ${lessonId}`
  );
}
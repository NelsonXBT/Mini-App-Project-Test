"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";


export async function completeLesson(lessonId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const existingProgress =
    await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
    });

  if (!existingProgress) {
    await prisma.lessonProgress.create({
      data: {
        userId: user.id,
        lessonId,
        completed: true,
        progress: 100,
        currentTime: 0,
        completedAt: new Date(),
        lastWatchedAt: new Date(),
      },
    });
  } else {
    await prisma.lessonProgress.update({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
      data: {
        completed: true,
        progress: 100,
        currentTime: 0,
        lastWatchedAt: new Date(),
        completedAt:
          existingProgress.completedAt ??
          new Date(),
      },
    });
  }

  console.log(
    `✅ ${user.firstName} completed lesson ${lessonId}`
  );
}
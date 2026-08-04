"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type SaveLessonProgressInput = {
  lessonId: string;
  currentTime: number;
  progress: number;
};

    export async function saveLessonProgress({
    lessonId,
    currentTime,
    progress,
    }: SaveLessonProgressInput) {
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
  const completed = progress >= 99;

  await prisma.lessonProgress.create({
    data: {
      userId: user.id,
      lessonId,
      currentTime,
      progress,
      completed,
      completedAt: completed ? new Date() : null,
      lastWatchedAt: new Date(),
    },
  });
} else {
  const highestProgress = Math.max(
    existingProgress.progress,
    progress
  );

  const completed =
    existingProgress.completed ||
    highestProgress >= 99;

  await prisma.lessonProgress.update({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId,
      },
    },
    data: {
      currentTime,
      progress: highestProgress,
      completed,
      completedAt:
        existingProgress.completedAt ??
        (completed ? new Date() : null),
      lastWatchedAt: new Date(),
    },
  });
}

    console.log(
        `💾 Progress saved: ${Math.round(progress)}% (${Math.round(
        currentTime
        )}s)`
    );
}
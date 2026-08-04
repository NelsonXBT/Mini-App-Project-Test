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

    const completed = progress >= 99;

    await prisma.lessonProgress.upsert({
        // ...
        where: {
        userId_lessonId: {
            userId: user.id,
            lessonId,
        },
        },
        update: {
            currentTime,
            progress,
            completed,
            lastWatchedAt: new Date(),
            },
                create: {
            userId: user.id,
            lessonId,
            currentTime,
            progress,
            completed,
            completedAt: completed ? new Date() : null,
            lastWatchedAt: new Date(),
        },
    });

    console.log(
        `💾 Progress saved: ${Math.round(progress)}% (${Math.round(
        currentTime
        )}s)`
    );
}
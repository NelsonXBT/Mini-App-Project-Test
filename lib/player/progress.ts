import { saveLessonProgress } from "@/app/actions/progress";

type SaveProgressInput = {
  lessonId: string;
  currentTime: number;
  duration: number;
};

export async function saveProgress({
  lessonId,
  currentTime,
  duration,
}: SaveProgressInput) {
  if (!duration) return;

  await saveLessonProgress({
    lessonId,
    currentTime: Math.floor(currentTime),
    progress: (currentTime / duration) * 100,
  });
}
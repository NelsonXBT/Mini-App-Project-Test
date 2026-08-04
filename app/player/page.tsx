import { notFound } from "next/navigation";

import FullscreenVideoSection from "@/components/player/FullscreenVideoSection";
import {
  getLessonById,
  getLessonProgress,
} from "@/lib/db/lessons";

type Props = {
  searchParams: Promise<{
    lessonId?: string;
  }>;
};

export default async function PlayerPage({
  searchParams,
}: Props) {
  const { lessonId } = await searchParams;

  if (!lessonId) {
    notFound();
  }

  const lesson = await getLessonById(lessonId);
  const lessonProgress =
  await getLessonProgress(lessonId);

  if (!lesson) {
    notFound();
  }

  <FullscreenVideoSection
  lessonId={lesson.id}
  videoId={lesson.videoId}
  startTime={
    lessonProgress?.currentTime ?? 0
  }
/>
}
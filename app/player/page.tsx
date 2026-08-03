import { notFound } from "next/navigation";

import FullscreenPlayer from "@/components/player/FullscreenPlayer";
import { getLessonById } from "@/lib/db/lessons";

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

  if (!lesson) {
    notFound();
  }

  return (
    <FullscreenPlayer
      lessonId={lesson.id}
      src={lesson.videoId}
      onEnded={() => {}}
    />
  );
}
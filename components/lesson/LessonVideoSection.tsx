"use client";

import VideoPlayer from "./VideoPlayer";
import { completeLesson } from "@/app/actions/lesson";

type LessonVideoSectionProps = {
  lessonId: string;
  provider: string;
  videoId: string;
};

export default function LessonVideoSection({
  lessonId,
  provider,
  videoId,
}: LessonVideoSectionProps) {

  async function handleEnded() {
  console.log("Lesson finished 🎉");

  await completeLesson(lessonId);
}

  return (
    <VideoPlayer
  lessonId={lessonId}
  provider={provider}
  videoId={videoId}
  onEnded={handleEnded}
/>
  );
}
"use client";

import FullscreenPlayer from "./FullscreenPlayer";
import { completeLesson } from "@/app/actions/lesson";


type FullscreenVideoSectionProps = {
  lessonId: string;
  videoId: string;
  startTime: number;
};

export default function FullscreenVideoSection({
  lessonId,
  videoId,
  startTime,
}: FullscreenVideoSectionProps) {
  async function handleEnded() {
  console.log("Fullscreen lesson finished 🎉");

  await completeLesson(lessonId);
}

  return (
    <FullscreenPlayer
  lessonId={lessonId}
  src={videoId}
  startTime={startTime}
  onEnded={handleEnded}
  />
  );
}
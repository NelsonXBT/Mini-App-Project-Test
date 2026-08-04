"use client";

import FullscreenPlayer from "./FullscreenPlayer";
import { completeLesson } from "@/app/actions/lesson";


type FullscreenVideoSectionProps = {
  lessonId: string;
  videoId: string;
};

export default function FullscreenVideoSection({
  lessonId,
  videoId,
}: FullscreenVideoSectionProps) {
  async function handleEnded() {
  console.log("Fullscreen lesson finished 🎉");

  await completeLesson(lessonId);
}

  return (
    <FullscreenPlayer
      lessonId={lessonId}
      src={videoId}
      onEnded={handleEnded}
    />
  );
}
"use client";

import FullscreenPlayer from "./FullscreenPlayer";

type FullscreenVideoSectionProps = {
  lessonId: string;
  videoId: string;
};

export default function FullscreenVideoSection({
  lessonId,
  videoId,
}: FullscreenVideoSectionProps) {
  function handleEnded() {
    console.log("Fullscreen lesson finished 🎉");

    // Later:
    // - Mark lesson complete
    // - Save progress
    // - Unlock next lesson
    // - Auto-play next lesson
  }

  return (
    <FullscreenPlayer
      lessonId={lessonId}
      src={videoId}
      onEnded={handleEnded}
    />
  );
}
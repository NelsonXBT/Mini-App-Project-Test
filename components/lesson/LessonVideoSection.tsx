"use client";

import VideoPlayer from "./VideoPlayer";

type LessonVideoSectionProps = {
  provider: string;
  videoId: string;
};

export default function LessonVideoSection({
  provider,
  videoId,
}: LessonVideoSectionProps) {
  function handleEnded() {
    console.log("Lesson finished 🎉");

    // Later:
    // - Mark lesson complete
    // - Save progress
    // - Unlock next lesson
    // - Update progress bar
  }

  return (
    <VideoPlayer
      provider={provider}
      videoId={videoId}
      onEnded={handleEnded}
    />
  );
}
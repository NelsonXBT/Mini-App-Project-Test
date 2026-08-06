"use client";

import { useEffect, useState } from "react";

import FullscreenVideoSection from "./FullscreenVideoSection";

import {
  subscribe,
  getCurrentLesson,
  getCountdown,
} from "@/lib/player/store";

export default function PlayerClient() {
  const [lesson, setLesson] = useState(
    getCurrentLesson()
  );

  const [countdown, setCountdown] =
    useState(getCountdown());

  useEffect(() => {
    return subscribe(() => {
      setLesson(getCurrentLesson());
      setCountdown(getCountdown());
    });
  }, []);

  if (!lesson) {
    return null;
  }

  return (
    <FullscreenVideoSection
      lessonId={lesson.id}
      videoId={lesson.videoId}
      countdown={countdown}
    />
  );
}
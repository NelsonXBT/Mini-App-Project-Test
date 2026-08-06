"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { completeLesson } from "@/app/actions/lesson";

import CourseContent from "./CourseContent";
import VideoPlayer from "../lesson/VideoPlayer";

import {
  setCurrentLesson,
  setCountdown as setSharedCountdown,
  getFullscreen,
} from "@/lib/player/store";

type CourseLearningProps = {
  course: any;
};

export default function CourseLearning({
  course,
}: CourseLearningProps) {
    const router = useRouter();
  const lessons = useMemo(
    () =>
      course.modules.flatMap(
        (module: any) => module.lessons
      ),
    [course]
  );

  const [selectedLesson, setSelectedLesson] =
  useState(lessons[0]);

  const [autoPlay, setAutoPlay] = useState(false);

  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  setCurrentLesson({
    id: selectedLesson.id,
    videoId: selectedLesson.videoId,
  });
}, [selectedLesson]);

  const [countdown, setCountdown] =
  useState<number | null>(null);

const autoNextTimeout =
  useRef<NodeJS.Timeout | null>(null);

  const countdownInterval =
  useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
  if (autoNextTimeout.current) {
    clearTimeout(autoNextTimeout.current);
    autoNextTimeout.current = null;
  }
}, [selectedLesson.id]);

  // Stop the auto-advance countdown if the student leaves the course page
  // mid-countdown. Otherwise the interval keeps firing against an unmounted
  // tree and leaves a stale countdown behind in the shared store.
  useEffect(() => {
  return () => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }

    if (autoNextTimeout.current) {
      clearTimeout(autoNextTimeout.current);
      autoNextTimeout.current = null;
    }

    setSharedCountdown(null);
  };
}, []);


async function handleLessonCompleted() {
  // A duplicate "ended" event would otherwise stack a second interval on top
  // of the running one, double-decrementing the countdown.
  if (countdownInterval.current) {
    clearInterval(countdownInterval.current);
    countdownInterval.current = null;
  }

  // Mark lesson completed
  await completeLesson(selectedLesson.id);

  // Refresh progress/checkmarks


  // Find next lesson
  const currentIndex = lessons.findIndex(
    (lesson: any) =>
      lesson.id === selectedLesson.id
  );

  if (currentIndex === -1) return;

  const nextLesson =
    lessons[currentIndex + 1];

  // Last lesson? Stop here.
  if (!nextLesson) return;

  // Wait 5 seconds then switch lesson
  setCountdown(5);

  setSharedCountdown(5);

let seconds = 5;

countdownInterval.current =
  setInterval(() => {
  seconds--;

  if (seconds > 0) {
    setCountdown(seconds);
    setSharedCountdown(seconds);
  } else {
    if (countdownInterval.current) {
  clearInterval(countdownInterval.current);
  countdownInterval.current = null;
}

    setCountdown(null);
    setSharedCountdown(null);

    setSelectedLesson(nextLesson);
    setAutoPlay(true);

    router.refresh();

    autoNextTimeout.current = null;
  }
}, 1000);
}

function handleLessonSelect(
  lesson: any
) {
  if (countdownInterval.current) {
    clearInterval(countdownInterval.current);
    countdownInterval.current = null;
  }

  if (autoNextTimeout.current) {
    clearTimeout(autoNextTimeout.current);
    autoNextTimeout.current = null;
  }

  setCountdown(null);
  setSharedCountdown(null);

  setSelectedLesson(lesson);
  setAutoPlay(false);

  // Bring the player back into view so the student doesn't have to scroll up
  // from the lesson list. Pointless in fullscreen — the player already fills
  // the screen. rAF waits for the re-render so we scroll to the settled layout.
  if (!getFullscreen()) {
    requestAnimationFrame(() => {
      playerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }
}


  return (


    <>
      <div ref={playerRef}>
        <VideoPlayer
              key={selectedLesson.id}
              lessonId={selectedLesson.id}
              provider={selectedLesson.provider}
              videoId={selectedLesson.videoId}
              countdown={countdown}
              autoPlay={autoPlay}
              onEnded={handleLessonCompleted}
              />
      </div>
      <div className="player-page-content space-y-6">
        <h1
            className="
            text-[1.45rem]
            font-medium
            leading-tight
            tracking-[-0.015em]
            text-[var(--text)]
            "
        >
            {course.title}
        </h1>

        <CourseContent
            modules={course.modules}
            files={course.files}
            courseSlug={course.slug}
            selectedLessonId={selectedLesson.id}
            onLessonSelect={handleLessonSelect}
        />
        </div>
    </>
  );
}
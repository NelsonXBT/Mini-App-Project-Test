"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { completeLesson } from "@/app/actions/lesson";

import CourseContent from "./CourseContent";
import VideoPlayer from "../lesson/VideoPlayer";

import {
  setCurrentLesson,
  setCountdown as setSharedCountdown,
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


async function handleLessonCompleted() {
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
}


  return (


    <>
      <VideoPlayer
            key={selectedLesson.id}
            lessonId={selectedLesson.id}
            provider={selectedLesson.provider}
            videoId={selectedLesson.videoId}
            countdown={countdown}
            onEnded={handleLessonCompleted}
            />
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
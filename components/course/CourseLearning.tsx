"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { completeLesson } from "@/app/actions/lesson";

import CourseContent from "./CourseContent";
import VideoPlayer from "../lesson/VideoPlayer";

import {
  getFullscreen,
} from "@/lib/player/store";

type CourseLearningProps = {
  course: any;
};

export default function CourseLearning({
  course,
}: CourseLearningProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

  const lessons = useMemo(
    () =>
      course.modules.flatMap(
        (module: any) => module.lessons
      ),
    [course]
  );

  // "Continue Lesson" on the home card links here with ?lesson=<id> so the
  // student lands on the lesson they left off on. Everything else (including
  // "Start Learning") has no param and just opens the first lesson.
  const [selectedLesson, setSelectedLesson] =
  useState(() => {
    const requestedId = searchParams.get("lesson");

    return (
      lessons.find(
        (lesson: any) => lesson.id === requestedId
      ) ?? lessons[0]
    );
  });

  // Where to pick playback back up for the selected lesson. Skipped once the
  // lesson is completed, so a finished video doesn't reopen at the very end
  // and immediately fire "ended" into the auto-advance countdown.
  const resumeAt = useMemo(() => {
    const progress = selectedLesson?.progress?.[0];

    if (!progress || progress.completed) return 0;

    return progress.currentTime ?? 0;
  }, [selectedLesson]);

  const [autoPlay, setAutoPlay] = useState(false);

  const playerRef = useRef<HTMLDivElement>(null);

  const [countdown, setCountdown] =
  useState<number | null>(null);

  const countdownInterval =
  useRef<NodeJS.Timeout | null>(null);

  /*
   * Which auto-advance run is allowed to finish.
   *
   * handleLessonCompleted awaits completeLesson() before it arms the
   * countdown, so a lesson picked during that await had no interval to
   * cancel — the completion simply resumed afterwards and pulled the student
   * off the lesson they had just chosen. Each run claims a generation on
   * entry and re-checks it after the await and on every tick; anything that
   * supersedes the run bumps this, and the stale run drops out.
   *
   * A ref rather than state, because VideoCanvas attaches onEnded as a DOM
   * listener whose deps deliberately exclude callbacks: the handler that
   * fires is the closure captured at mount. A ref is read live through that
   * closure, where a state value would be frozen at its mount-time snapshot.
   */
  const advanceGeneration = useRef(0);

  /*
   * Stable identity: it touches nothing but the ref above, so the effects
   * below can depend on it without re-running.
   */
  const cancelAutoAdvance = useCallback(() => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
  }, []);

  /*
   * A lesson change cancels any pending auto-advance.
   *
   * This used to clear a timeout ref that was never armed anywhere, so it did
   * nothing at all — which is how a countdown survived a manual selection.
   */
  useEffect(() => {
    cancelAutoAdvance();
  }, [selectedLesson.id, cancelAutoAdvance]);

  // Stop the auto-advance countdown if the student leaves the course page
  // mid-countdown. Otherwise the interval keeps firing against an unmounted
  // tree and leaves a stale countdown behind in the shared store.
  useEffect(() => {
    return () => {
      cancelAutoAdvance();
    };
  }, [cancelAutoAdvance]);


async function handleLessonCompleted() {
  // A duplicate "ended" event would otherwise stack a second interval on top
  // of the running one, double-decrementing the countdown.
  cancelAutoAdvance();

  /*
   * Claim this run. Bumping on entry also retires any earlier run still
   * parked on the await below, so two "ended" events can never arm two
   * countdowns — the older run drops out instead of leaving behind an
   * interval that nothing holds a handle to.
   */
  const generation = ++advanceGeneration.current;

  // Mark lesson completed
  await completeLesson(selectedLesson.id);

  /*
   * The student picked a lesson — or another completion started — while that
   * write was in flight. Their choice wins; this run is stale.
   */
  if (generation !== advanceGeneration.current) return;

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

  let seconds = 5;

  /*
   * The interval holds its own handle and always clears that handle. Clearing
   * through the shared ref could orphan it: once a second countdown overwrote
   * the ref, the first one cleared the second and then kept ticking forever,
   * dragging the selection back to nextLesson once per second.
   */
  const interval = setInterval(() => {
    seconds--;

    if (seconds > 0) {
      setCountdown(seconds);
    } else {
      clearInterval(interval);

      // Manual selection (or a newer completion) retired this run while it
      // was ticking.
      if (generation !== advanceGeneration.current) return;

      setCountdown(null);

      setSelectedLesson(nextLesson);
      setAutoPlay(true);

      router.refresh();
    }
  }, 1000);

  countdownInterval.current = interval;
}

function handleLessonSelect(
  lesson: any
) {
  /*
   * Retire any auto-advance run, including one still awaiting completeLesson()
   * and therefore holding no interval yet. Clearing the interval alone was not
   * enough: such a run resumed after the await and pulled the student off the
   * lesson they had just picked.
   */
  advanceGeneration.current++;

  cancelAutoAdvance();

  setCountdown(null);

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
              resumeAt={resumeAt}
              onEnded={handleLessonCompleted}
              />
      </div>
      <div className="player-page-content space-y-5">
        <h1
            className="
            text-[1.375rem]
            font-semibold
            leading-tight
            tracking-[-0.025em]
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
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { completeLesson } from "@/app/actions/lesson";

import CourseContent from "./CourseContent";
import VideoPlayer from "../lesson/VideoPlayer";

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



  async function handleLessonCompleted() {
  await completeLesson(selectedLesson.id);

  router.refresh();
}

  return (
    <>
      <VideoPlayer
        key={selectedLesson.id}
        lessonId={selectedLesson.id}
        provider={selectedLesson.provider}
        videoId={selectedLesson.videoId}
        onEnded={handleLessonCompleted}
        />

      <>
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
            onLessonSelect={setSelectedLesson}
        />
        </>
    </>
  );
}
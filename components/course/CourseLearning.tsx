"use client";

import { useMemo, useState } from "react";

import CourseContent from "./CourseContent";
import VideoPlayer from "../lesson/VideoPlayer";

type CourseLearningProps = {
  course: any;
};

export default function CourseLearning({
  course,
}: CourseLearningProps) {
  const lessons = useMemo(
    () =>
      course.modules.flatMap(
        (module: any) => module.lessons
      ),
    [course]
  );

  const [selectedLesson, setSelectedLesson] =
  useState(lessons[0]);

  return (
    <>
      <VideoPlayer
        lessonId={selectedLesson.id}
        provider={selectedLesson.provider}
        videoId={selectedLesson.videoId}
      />

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">
          {selectedLesson.title}
        </h2>

        {selectedLesson.description && (
          <p className="text-sm leading-6 text-zinc-400">
            {selectedLesson.description}
          </p>

          
        )}

        <CourseContent
            modules={course.modules}
            files={course.files}
            courseSlug={course.slug}
            selectedLessonId={selectedLesson.id}
            onLessonSelect={setSelectedLesson}
            />
      </div>
    </>
  );
}
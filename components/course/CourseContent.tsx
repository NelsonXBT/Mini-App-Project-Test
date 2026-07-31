"use client";

import { useState } from "react";

import CourseTabs from "./CourseTabs";
import LessonCard from "./LessonCard";
import FileCard from "./FileCard";

import { courseFiles } from "@/lib/data";

type Lesson = {
  id: number;
  courseId: number;
  title: string;
  duration: string;
  completed: boolean;
};

type CourseContentProps = {
  lessons: Lesson[];
};

export default function CourseContent({
  lessons,
}: CourseContentProps) {
  const [activeTab, setActiveTab] = useState<
    "lessons" | "files"
  >("lessons");

  return (
    <>
      <CourseTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "lessons" ? (
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              courseId={lesson.courseId}
              lessonId={lesson.id}
              lessonNumber={index + 1}
              title={lesson.title}
              duration={lesson.duration}
              completed={lesson.completed}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {courseFiles.map((file) => (
            <FileCard
              key={file.id}
              icon={file.icon}
              title={file.title}
              files={file.files}
            />
          ))}
        </div>
      )}
    </>
  );
}
"use client";

import { useState } from "react";
import { Prisma } from "@prisma/client";

import CourseTabs from "./CourseTabs";
import ModuleCard from "./ModuleCard";
import FileCard from "./FileCard";

type Module = Prisma.ModuleGetPayload<{
  include: {
    lessons: {
      include: {
        resources: true;
        progress: {
          select: {
            progress: true;
            completed: true;
            currentTime: true;
          };
        };
      };
    };
  };
}>;

type CourseFile = Prisma.CourseFileGetPayload<{}>;

type CourseContentProps = {
  modules: Module[];
  files: CourseFile[];
  courseSlug: string;

  selectedLessonId: string;

  onLessonSelect: (
    lesson: Module["lessons"][number]
  ) => void;
};

export default function CourseContent({
  modules,
  files,
  courseSlug,
  selectedLessonId,
  onLessonSelect,
}: CourseContentProps) {
  const [activeTab, setActiveTab] = useState<
    "lessons" | "files"
  >("lessons");

  const hasFiles = files.length > 0;

  // Guard the panel as well as the tab: if the last file is removed while
  // the Files tab is open, fall back to lessons rather than render nothing.
  const showFiles = activeTab === "files" && hasFiles;

  /*
   * Accordion state.
   * Only one module can be expanded at a time.
   */
  const [expandedModuleId, setExpandedModuleId] =
    useState<string | null>(
      modules.length ? modules[0].id : null
    );

  let lessonOffset = 0;

  return (
    <>
      <CourseTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasFiles={hasFiles}
      />

      {!showFiles ? (
        <div
          className="
            animate-fade-in
            overflow-hidden
            rounded-[var(--radius)]
            border
            border-[var(--border)]
            bg-[var(--card)]
            shadow-[var(--shadow-card)]
          "
        >
          {modules.map((module) => {
            const currentOffset = lessonOffset;

            lessonOffset +=
              module.lessons.length;

            return (
              <ModuleCard
                key={module.id}
                module={module}
                lessonOffset={currentOffset}
                courseSlug={courseSlug}

                selectedLessonId={
                  selectedLessonId
                }
                onLessonSelect={
                  onLessonSelect
                }

                isExpanded={
                  expandedModuleId ===
                  module.id
                }

                onToggle={() =>
                  setExpandedModuleId(
                    (current) =>
                      current === module.id
                        ? null
                        : module.id
                  )
                }
              />
            );
          })}
        </div>
      ) : (
        <div className="animate-fade-in space-y-3">
          {/* Unreachable when empty: the Files tab is not rendered at all
              unless the course has at least one file. */}
          {files.map((file) => (
            <FileCard
              key={file.id}
              title={file.title}
              url={file.url}
              type={file.type}
            />
          ))}
        </div>
      )}
    </>
  );
}
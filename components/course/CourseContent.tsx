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
};

export default function CourseContent({
  modules,
  files,
  courseSlug,
}: CourseContentProps) {
      const [activeTab, setActiveTab] = useState<"lessons" | "files">("lessons");

    /*
    * Accordion state.
    * Only one module can be expanded at a time.
    */
    const [expandedModuleId, setExpandedModuleId] = useState<string | null>(
      modules.length ? modules[0].id : null
    );

  let lessonOffset = 0;

  return (
    <>
      <CourseTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "lessons" ? (
        <div className="space-y-5">
          {modules.map((module) => {
            const currentOffset = lessonOffset;

            lessonOffset += module.lessons.length;

            return (
              <ModuleCard
                key={module.id}
                module={module}
                lessonOffset={currentOffset}
                courseSlug={courseSlug}

                isExpanded={expandedModuleId === module.id}

                onToggle={() =>
                  setExpandedModuleId((current) =>
                    current === module.id ? null : module.id
                  )
                }
              />
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {files.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-center text-sm text-zinc-500">
              No files for this course yet.
            </div>
          ) : (
            files.map((file) => (
              <FileCard
                key={file.id}
                title={file.title}
                url={file.url}
                type={file.type}
              />
            ))
          )}
        </div>
      )}
    </>
  );
}
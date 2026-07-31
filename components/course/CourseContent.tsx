"use client";

import { useState } from "react";
import { Prisma } from "@prisma/client";

import CourseTabs from "./CourseTabs";
import ModuleCard from "./ModuleCard";
import FileCard from "./FileCard";

type Module = Prisma.ModuleGetPayload<{
  include: {
    lessons: true;
  };
}>;

type Resource = {
  id: string;
  title: string;
  files: number;
  icon: string;
};

type CourseContentProps = {
  modules: Module[];
  resources?: Resource[];
  courseSlug: string;
};

export default function CourseContent({
  modules,
  resources = [],
  courseSlug,
}: CourseContentProps) {
  const [activeTab, setActiveTab] = useState<"lessons" | "files">("lessons");

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
              />
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {resources.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-center text-sm text-zinc-500">
              No resources available yet.
            </div>
          ) : (
            resources.map((resource) => (
              <FileCard
                key={resource.id}
                icon={resource.icon}
                title={resource.title}
                files={resource.files}
              />
            ))
          )}
        </div>
      )}
    </>
  );
}
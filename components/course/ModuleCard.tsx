"use client";

import { Prisma } from "@prisma/client";
import { ChevronDown } from "lucide-react";

import LessonCard from "./LessonCard";

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

type ModuleCardProps = {
  module: Module;
  courseSlug: string;
  lessonOffset: number;

  isExpanded: boolean;
  onToggle: () => void;
};

export default function ModuleCard({
  module,
  courseSlug,
  lessonOffset,
  isExpanded,
  onToggle,
}: ModuleCardProps) {
  return (
    <section
      className="
        overflow-hidden
        rounded-3xl
        border
        border-[var(--border)]
        bg-[var(--card)]
      "
    >
      {/* Header */}

      <button
        onClick={onToggle}
        className="
          flex
          w-full
          items-center
          justify-between
          px-5
          py-4
          text-left
          transition-colors
          hover:bg-[var(--surface-secondary)]
        "
      >
        <div>
          <h2 className="text-base font-semibold text-[var(--text)]">
            {module.title}
          </h2>

          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {module.lessons.length} Lesson
            {module.lessons.length !== 1 ? "s" : ""}
          </p>
        </div>

        <ChevronDown
          className={`
            h-5
            w-5
            text-[var(--text-muted)]
            transition-transform
            duration-300
            ${isExpanded ? "rotate-180" : ""}
          `}
        />
      </button>

      {/* Lessons */}

      {isExpanded && (
        <div className="space-y-3 px-4 pb-4">
          {module.lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              lessonNumber={lessonOffset + index + 1}
              courseSlug={courseSlug}
            />
          ))}
        </div>
      )}
    </section>
  );
}
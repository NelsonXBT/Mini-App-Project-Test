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
        rounded-xl
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
          py-5
          text-left
        "
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Module
          </p>

          <h2 className="mt-1 text-xl font-semibold text-[var(--text)]">
            {module.title}
          </h2>

          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {module.lessons.length} Lesson
            {module.lessons.length !== 1 ? "s" : ""}
          </p>
        </div>

        <ChevronDown
          className={`
            h-5
            w-5
            transition-transform
            duration-300
            text-[var(--text-muted)]
            ${isExpanded ? "rotate-180" : ""}
          `}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-[var(--border)]">
          {module.lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              lessonNumber={lessonOffset + index + 1}
              courseSlug={courseSlug}
              isLast={index === module.lessons.length - 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}
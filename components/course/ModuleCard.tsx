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

  selectedLessonId: string;

  onLessonSelect: (
    lesson: Module["lessons"][number]
  ) => void;

  isExpanded: boolean;
  onToggle: () => void;
};

export default function ModuleCard({
  module,
  courseSlug,
  lessonOffset,

  selectedLessonId,
  onLessonSelect,

  isExpanded,
  onToggle,
}: ModuleCardProps) {
  return (
    <section
      className={`
        border-b
        border-[var(--border)]
        transition-colors
        duration-300
        last:border-b-0
        ${
          isExpanded
            ? "bg-[var(--surface-secondary)]"
            : "bg-[var(--card)]"
        }
      `}
    >
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
          <h2
            className="
              text-xl
              font-semibold
              uppercase
              tracking-[0.02em]
              text-[var(--text)]
            "
          >
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
            ${
              isExpanded
                ? "rotate-180 text-[var(--primary)]"
                : "text-[var(--text-muted)]"
            }
          `}
        />
      </button>

      {isExpanded && (
        <div
          className="
            overflow-hidden
            border-t
            border-[var(--border)]
            bg-[var(--card)]
          "
        >
          {module.lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              lessonNumber={lessonOffset + index + 1}
              courseSlug={courseSlug}
              isLast={index === module.lessons.length - 1}

              selected={
                selectedLessonId === lesson.id
              }

              onSelect={() =>
                onLessonSelect(lesson)
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
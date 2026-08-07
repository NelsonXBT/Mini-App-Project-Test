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
            currentTime: true;
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
        duration-200
        ease-out
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
          gap-4
          px-5
          py-4
          text-left
        "
      >
        <div>
          <h2
            className="
              text-[13.5px]
              font-bold
              uppercase
              tracking-[0.08em]
              text-[var(--text)]
            "
          >
            {module.title}
          </h2>

          <p className="mt-1 text-[13px] text-[var(--text-muted)]">
            {module.lessons.length} Lesson
            {module.lessons.length !== 1 ? "s" : ""}
          </p>
        </div>

        <ChevronDown
          className={`
            h-4.5
            w-4.5
            shrink-0
            transition-transform
            duration-200
            ease-out
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
            animate-panel-open
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
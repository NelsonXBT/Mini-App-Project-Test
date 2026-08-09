"use client";

import {
  CheckCircle2,
  ChevronRight,
  Clock3,
} from "lucide-react";
import { Prisma } from "@prisma/client";

type Lesson = Prisma.LessonGetPayload<{
  include: {
    progress: {
      select: {
        progress: true;
        completed: true;
        currentTime: true;
      };
    };
  };
}>;

type LessonCardProps = {
  lesson: Lesson;
  lessonNumber: number;
  courseSlug: string;

  isLast: boolean;

  selected: boolean;

  onSelect: () => void;
};

export default function LessonCard({
  lesson,
  lessonNumber,
  isLast,
  selected,
  onSelect,
}: LessonCardProps) {
  const duration =
    lesson.duration != null
      ? `${Math.ceil(lesson.duration / 60)} min`
      : "—";

  const completed =
    lesson.progress[0]?.completed ?? false;

  return (
    <button
      onClick={onSelect}
      className={`
        group
        relative
        block
        w-full
        px-5
        py-3.5
        text-left
        transition-colors
        duration-200
        ease-out

        ${
          selected
            ? "bg-[var(--primary-soft)]"
            : "hover:bg-[var(--surface-secondary)]"
        }

        ${
          !isLast
            ? "border-b border-[var(--border)]"
            : ""
        }
      `}
    >
      {/* Selected marker */}

      {selected && (
        <span
          className="absolute inset-y-0 left-0 w-0.5 bg-[var(--primary)]"
          aria-hidden="true"
        />
      )}

      <div className="flex items-center gap-3.5">

        {/* Lesson Number */}

        <div
          className={`
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            rounded-[var(--radius-pill)]
            text-[11px]
            font-semibold
            tabular-nums
            transition-colors
            duration-200
            ease-out

            ${
              selected
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--surface-secondary)] text-[var(--text-muted)]"
            }
          `}
        >
          {lessonNumber}
        </div>

        {/* Lesson Content */}

        <div className="min-w-0 flex-1">

          <h3
            className={`
              truncate
              text-[14px]
              font-medium
              tracking-tight

              ${
                selected
                  ? "text-[var(--primary-text)]"
                  : "text-[var(--text)]"
              }
            `}
          >
            {lesson.title}
          </h3>

          <div className="mt-0.5 flex items-center gap-1.5">

            <Clock3 className="h-3 w-3 text-[var(--text-subtle)]" />

            <span className="text-[11px] tabular-nums text-[var(--text-subtle)]">
              {duration}
            </span>

          </div>

        </div>

        {/* Right Status */}

        {completed ? (
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-[var(--success)]" />
        ) : (
          <ChevronRight
            className={`
              h-4.5
              w-4.5
              shrink-0
              transition-transform
              duration-200
              ease-out

              ${
                selected
                  ? "text-[var(--primary-text)]"
                  : "text-[var(--text-subtle)] group-hover:translate-x-0.5"
              }
            `}
          />
        )}

      </div>
    </button>
  );
}
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
        block
        w-full
        px-5
        py-4
        text-left
        transition-colors

        ${
          selected
            ? "bg-[var(--surface-secondary)]"
            : "hover:bg-[var(--surface-secondary)]"
        }

        ${
          !isLast
            ? "border-b border-[var(--border)]"
            : ""
        }
      `}
    >
      <div className="flex items-center gap-4">

        {/* Lesson Number */}

        <div
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            text-xs
            font-semibold

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
              text-[15px]
              font-medium

              ${
                selected
                  ? "text-[var(--primary)]"
                  : "text-[var(--text)]"
              }
            `}
          >
            {lesson.title}
          </h3>

          <div className="mt-1 flex items-center gap-2">

            <Clock3 className="h-3.5 w-3.5 text-[var(--text-muted)]" />

            <span className="text-xs text-[var(--text-muted)]">
              {duration}
            </span>

          </div>

        </div>

        {/* Right Status */}

        {completed ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
        ) : (
          <ChevronRight
            className={`
              h-5
              w-5
              shrink-0
              transition-transform
              duration-200

              ${
                selected
                  ? "text-[var(--primary)]"
                  : "text-[var(--text-muted)] group-hover:translate-x-0.5"
              }
            `}
          />
        )}

      </div>
    </button>
  );
}
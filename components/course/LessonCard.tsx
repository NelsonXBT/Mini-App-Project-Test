import Link from "next/link";
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
};

export default function LessonCard({
  lesson,
  lessonNumber,
  courseSlug,
}: LessonCardProps) {
  const duration =
    lesson.duration != null
      ? `${Math.ceil(lesson.duration / 60)} min`
      : "—";

  const completed =
    lesson.progress[0]?.completed ?? false;

  return (
    <Link
      href={`/courses/${courseSlug}/lessons/${lesson.id}`}
      className="
        group
        block
        rounded-2xl
        border
        border-[var(--border)]
        bg-[var(--card)]
        px-4
        py-4
        transition-all
        duration-200
        hover:border-[var(--primary)]
        hover:-translate-y-0.5
      "
    >
      <div className="flex items-center gap-4">

        {/* Lesson Number */}

        <div
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-[var(--surface-secondary)]
            text-xs
            font-semibold
            text-[var(--text-muted)]
          "
        >
          {lessonNumber}
        </div>

        {/* Content */}

        <div className="min-w-0 flex-1">

          <h3 className="truncate text-[15px] font-semibold text-[var(--text)]">
            {lesson.title}
          </h3>

          <div className="mt-2 flex items-center gap-2">

            <Clock3 className="h-3.5 w-3.5 text-[var(--text-muted)]" />

            <span className="text-xs text-[var(--text-muted)]">
              {duration}
            </span>

          </div>

        </div>

        {/* Status */}

        {completed ? (
          <CheckCircle2
            className="
              h-5
              w-5
              text-emerald-500
            "
          />
        ) : (
          <ChevronRight
            className="
              h-5
              w-5
              text-[var(--text-muted)]
              transition-transform
              duration-200
              group-hover:translate-x-0.5
            "
          />
        )}

      </div>
    </Link>
  );
}
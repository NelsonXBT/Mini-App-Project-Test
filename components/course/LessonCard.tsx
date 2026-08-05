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
      className="block rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-cyan-500 hover:bg-zinc-800"
    >
      <div className="flex items-center gap-4">
        {/* Lesson Number */}
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold">
          <span
            className={
              completed
                ? "text-emerald-400"
                : "text-cyan-400"
            }
          >
            {lessonNumber}
          </span>
        </div>

        {/* Lesson Info */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-white">
            {lesson.title}
          </h3>

          <div className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
            <Clock3 className="h-4 w-4" />

            <span>{duration}</span>

            {completed && (
              <span
                className="
                  ml-2
                  rounded-full
                  bg-emerald-500/15
                  px-2
                  py-0.5
                  text-xs
                  font-medium
                  text-emerald-400
                "
              >
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Status Icon */}
        {completed ? (
          <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-emerald-400" />
        ) : (
          <ChevronRight className="h-5 w-5 flex-shrink-0 text-zinc-500" />
        )}
      </div>
    </Link>
  );
}
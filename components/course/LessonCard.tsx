import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
} from "lucide-react";
import { Prisma } from "@prisma/client";

type Lesson = Prisma.LessonGetPayload<{}>;

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

  // Progress tracking comes later
  const completed = false;

  return (
    <Link
      href={`/courses/${courseSlug}/lessons/${lesson.id}`}
      className="block rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-cyan-500 hover:bg-zinc-800"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold">
          {completed ? (
            <CheckCircle2 className="h-6 w-6 text-green-400" />
          ) : (
            <span className="text-cyan-400">
              {lessonNumber}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-white">
            {lesson.title}
          </h3>

          <div className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
            <Clock3 className="h-4 w-4" />

            <span>{duration}</span>

            {completed && (
              <>
                <span>•</span>

                <span className="text-green-400">
                  Completed
                </span>
              </>
            )}
          </div>
        </div>

        {completed ? (
          <CheckCircle2 className="h-5 w-5 text-green-400" />
        ) : (
          <ChevronRight className="h-5 w-5 text-zinc-500" />
        )}
      </div>
    </Link>
  );
}
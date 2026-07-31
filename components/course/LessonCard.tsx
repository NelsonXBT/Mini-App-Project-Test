import Link from "next/link";
import {
  CheckCircle2,
  PlayCircle,
  Clock3,
  ChevronRight,
} from "lucide-react";

type LessonCardProps = {
  courseId: number;
  lessonId: number;
  lessonNumber: number;
  title: string;
  duration: string;
  completed: boolean;
};

export default function LessonCard({
  courseId,
  lessonId,
  lessonNumber,
  title,
  duration,
  completed,
}: LessonCardProps) {
  return (
    <Link
      href={`/courses/${courseId}/lessons/${lessonId}`}
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
            {title}
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
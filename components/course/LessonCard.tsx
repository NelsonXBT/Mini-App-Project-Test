import Link from "next/link";

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
  title,
  duration,
  completed,
  lessonNumber,
}: LessonCardProps) {
  return (
    <Link
      href={`/courses/${courseId}/lessons/${lessonId}`}
      className="block rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-cyan-500"
    >
      <div className="flex items-center gap-4">
  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-cyan-400">
    {lessonNumber}
  </div>

  <div className="min-w-0 flex-1">
    <h3 className="truncate font-semibold text-white">
      {title}
    </h3>

    <p className="mt-1 text-sm text-zinc-400">
      {duration}
    </p>
  </div>

  <div className="text-xl">
    {completed ? "✓" : "▶"}
  </div>
</div>
    </Link>
  );
}
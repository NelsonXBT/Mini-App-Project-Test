import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type LessonHeaderProps = {
  courseId: string;
  courseTitle: string;
};

export default function LessonHeader({
  courseId,
  courseTitle,
}: LessonHeaderProps) {
  return (
    <header className="mb-6 flex items-center gap-4">
      <Link
        href={`/courses/${courseId}`}
        aria-label="Back to course"
        className="rounded-full p-2 transition hover:bg-zinc-800 hover:text-cyan-400"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      <h1 className="flex-1 truncate text-lg font-semibold text-white">
        {courseTitle}
      </h1>
    </header>
  );
}
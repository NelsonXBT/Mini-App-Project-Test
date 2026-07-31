import Link from "next/link";

type LessonHeaderProps = {
  courseTitle: string;
};

export default function LessonHeader({
  courseTitle,
}: LessonHeaderProps) {
  return (
    <header className="mb-6 flex items-center gap-4">
      <Link
        href="/courses"
        className="text-2xl transition hover:text-cyan-400"
      >
        ←
      </Link>

      <h1 className="flex-1 text-lg font-semibold text-white truncate">
        {courseTitle}
      </h1>
    </header>
  );
}
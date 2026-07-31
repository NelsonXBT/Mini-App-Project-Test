import Link from "next/link";

type Lesson = {
  id: number;
  title: string;
};

type LessonNavigationProps = {
  courseId: string;
  previousLesson: Lesson | null;
  nextLesson: Lesson | null;
};

export default function LessonNavigation({
  courseId,
  previousLesson,
  nextLesson,
}: LessonNavigationProps) {
  return (
    <nav className="mt-12 border-t border-zinc-800 pt-8">
      <div className="mt-8 flex gap-4">
        {previousLesson ? (
          <Link
            href={`/courses/${courseId}/lessons/${previousLesson.id}`}
            className="flex-1"
          >
            ← Previous Lesson
          </Link>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Link
            href={`/courses/${courseId}/lessons/${nextLesson.id}`}
            className="flex-1"
          >
            Next Lesson →
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}
import CourseProgress from "@/components/course/CourseProgress";
import CourseLearning from "@/components/course/CourseLearning";
import CourseGuard from "@/components/guards/CourseGuard";

import {
  getCourse,
  getCourseProgress,
} from "@/lib/db/courses";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;

  const course = await getCourse(slug);

  if (!course) {
    return (
      <main>
        <h1 className="text-2xl font-bold">
          Course not found
        </h1>
      </main>
    );
  }

  const courseProgress = await getCourseProgress(course.id);

  /*
   * A course with nothing published yet.
   *
   * getCourse now hides unpublished lessons from students, so a course still
   * being authored can come back with empty modules. CourseLearning opens on
   * lessons[0] and reads its id unguarded, so rendering it here would throw —
   * this stays inside CourseGuard so the empty state is never a way to probe
   * a course the student has no access to.
   */
  const hasLessons = course.modules.some(
    (module) => module.lessons.length > 0
  );

  return (
    <CourseGuard course={course}>
      <main className="space-y-4">

        {hasLessons ? (
          <>
            <CourseProgress
              completed={courseProgress.completedLessons}
              total={courseProgress.totalLessons}
              progress={courseProgress.progress}
            />

            <CourseLearning
              course={course}
            />
          </>
        ) : (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <h1 className="text-[1.375rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--text)]">
              {course.title}
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
              Lessons for this course are on the way. Check back soon.
            </p>
          </div>
        )}

      </main>
    </CourseGuard>
  );
}
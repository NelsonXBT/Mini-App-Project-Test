
import CourseContent from "@/components/course/CourseContent";
import CourseProgress from "@/components/course/CourseProgress";
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

console.log("COURSE PROGRESS");
console.dir(courseProgress, { depth: null });

  if (!course) {
    return (
      <main>
        <h1 className="text-2xl font-bold">
          Course not found
        </h1>
      </main>
    );
  }

  const totalLessons = course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );

  return (
  <CourseGuard course={course}>
    <main className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold leading-tight">
          {course.title}
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          {totalLessons} Lesson{totalLessons !== 1 ? "s" : ""}
        </p>
      </div>

      <CourseProgress
        completed={0}
        total={totalLessons}
        progress={0}
      />

      <CourseContent
        modules={course.modules}
        courseSlug={course.slug}
      />
    </main>
  </CourseGuard>
);
}
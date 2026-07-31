import Link from "next/link";
import { allCourses, lessons } from "@/lib/data";
import CourseContent from "@/components/course/CourseContent";
import CourseProgress from "@/components/course/CourseProgress";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CoursePage({ params }: Props) {
  const { id } = await params;

  const course = allCourses.find(
    (course) => course.id === Number(id)
  );

  const courseLessons = lessons.filter(
    (lesson) => lesson.courseId === Number(id)
  );

  if (!course) {
    return (
      <main>
        <h1 className="text-2xl font-bold">
          Course not found
        </h1>
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold leading-tight">
          {course.title}
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          {course.lessons} Lessons
        </p>
      </div>

      <CourseProgress
        completed={12}
        total={42}
        progress={22}
      />

      <CourseContent
        lessons={courseLessons}
      />
    </main>
  );
}
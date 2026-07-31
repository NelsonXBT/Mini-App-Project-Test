
import Link from "next/link";
import { allCourses, lessons } from "@/lib/data";
import CourseContent from "@/components/course/CourseContent";




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
      <main className="min-h-screen p-6">
        <h1 className="text-3xl font-bold">
          Course not found
        </h1>
      </main>
    );
  }

  return (
  <main className="min-h-screen p-6">
    <h1 className="text-3xl font-bold">
      {course.title}
    </h1>

    <p className="mt-2 text-gray-400">
      {course.lessons} Lessons
    </p>

    

      <CourseContent
    lessons={courseLessons}
    />
    
  </main>
);
}
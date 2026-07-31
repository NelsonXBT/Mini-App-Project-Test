import { getCourses } from "@/lib/db/courses";
import CourseCard from "@/components/course/CourseCard";

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <main className="space-y-4">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-4 text-2xl font-bold">
          Courses
        </h1>

        <div className="space-y-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
import { allCourses } from "@/lib/data";
import CourseCard from "@/components/course/CourseCard";

export default function CoursesPage() {
  return (
    <main className="space-y-4">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-4 text-2xl font-bold">
          Courses
        </h1>

        <div className="space-y-4">
          {allCourses.map((course) => (
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
import { allCourses } from "@/lib/data";
import CourseCard from "@/components/course/CourseCard";

export default function CoursesPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-3xl font-bold">
          Courses
        </h1>

        <div className="space-y-6">
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
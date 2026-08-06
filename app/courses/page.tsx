export const dynamic = "force-dynamic";

import { getCourses } from "@/lib/db/courses";
import CourseCard from "@/components/course/CourseCard";
import { PageTitle } from "@/components/ui";

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <main>
      <div className="mx-auto max-w-5xl">
        <PageTitle className="mb-5">
          Explore Courses
        </PageTitle>

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
import type { Metadata } from "next";

import CourseTable from "@/components/admin/courses/CourseTable";
import CreateCourseButton from "@/components/admin/courses/CreateCourseButton";
import { getAdminCourses } from "@/lib/db/admin/courses";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Courses",
};

export default async function AdminCoursesPage() {
  const courses = await getAdminCourses();

  return (
    <div className="animate-rise-in space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[1.5rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--text)]">
            Courses
          </h1>

          <p className="mt-1 text-[14px] text-[var(--text-muted)]">
            {courses.length} course{courses.length === 1 ? "" : "s"}
          </p>
        </div>

        {courses.length > 0 && <CreateCourseButton />}
      </div>

      <CourseTable courses={courses} />
    </div>
  );
}

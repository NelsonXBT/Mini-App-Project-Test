import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import StudentProfile from "@/components/admin/students/StudentProfile";
import {
  getAdminStudent,
  getGrantableCourses,
} from "@/lib/db/admin/students";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Student",
};

export default async function AdminStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [student, grantableCourses] = await Promise.all([
    getAdminStudent(id),
    getGrantableCourses(id),
  ]);

  if (!student) {
    notFound();
  }

  return (
    <div className="animate-rise-in space-y-5">
      <Link
        href="/admin/students"
        className="
          inline-flex
          items-center
          gap-1
          text-[13px]
          font-medium
          text-[var(--text-muted)]
          transition-colors
          duration-200
          hover:text-[var(--text)]
        "
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.9} />
        Students
      </Link>

      <StudentProfile
        student={student}
        grantableCourses={grantableCourses}
      />
    </div>
  );
}

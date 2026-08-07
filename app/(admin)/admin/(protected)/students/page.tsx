import type { Metadata } from "next";

import StudentTable from "@/components/admin/students/StudentTable";
import { getAdminStudents } from "@/lib/db/admin/students";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Students",
};

export default async function AdminStudentsPage() {
  const students = await getAdminStudents();

  return (
    <div className="animate-rise-in space-y-5">
      <div>
        <h1 className="text-[1.375rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--text)]">
          Students
        </h1>

        <p className="mt-1 text-[13px] text-[var(--text-muted)]">
          {students.length} student{students.length === 1 ? "" : "s"}
        </p>
      </div>

      <StudentTable students={students} />
    </div>
  );
}

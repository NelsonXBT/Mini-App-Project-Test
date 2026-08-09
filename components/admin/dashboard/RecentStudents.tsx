import Link from "next/link";
import { Users } from "lucide-react";

import { Avatar, EmptyState } from "@/components/admin/ui";
import { getRecentStudents } from "@/lib/db/admin/stats";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function RecentStudents() {
  const students = await getRecentStudents(5);

  return (
    <section
      className="
        overflow-hidden
        rounded-[var(--radius)]
        border
        border-[var(--border)]
        bg-[var(--card)]
        shadow-[var(--shadow-panel)]
      "
    >
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3.5">
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--text)]">
          Recent Students
        </h2>

        <Link
          href="/admin/students"
          className="text-[13px] font-medium text-[var(--primary-text)] transition-opacity duration-200 hover:opacity-70"
        >
          View all
        </Link>
      </div>

      {students.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={Users}
            title="No students yet"
            description="Students appear here once they open the Mini App."
          />
        </div>
      ) : (
        <ul>
          {students.map((student) => (
            <li
              key={student.id}
              className="border-b border-[var(--border)] last:border-b-0"
            >
              <Link
                href={`/admin/students/${student.id}`}
                className="
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  transition-colors
                  duration-200
                  hover:bg-[var(--surface-secondary)]
                "
              >
                <Avatar
                  name={student.name}
                  photoUrl={student.photoUrl}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium tracking-tight text-[var(--text)]">
                    {student.name}
                  </p>

                  {student.username && (
                    <p className="truncate text-[12px] text-[var(--text-subtle)]">
                      @{student.username}
                    </p>
                  )}
                </div>

                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-[13px] tabular-nums text-[var(--text-muted)]">
                    {student.courseCount} course
                    {student.courseCount !== 1 ? "s" : ""}
                  </p>

                  <p className="text-[12px] text-[var(--text-subtle)]">
                    {formatDate(student.joinedAt)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

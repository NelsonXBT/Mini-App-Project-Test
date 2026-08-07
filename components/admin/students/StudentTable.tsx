"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";

import { Avatar, EmptyState } from "@/components/admin/ui";

export type StudentRow = {
  id: string;
  name: string;
  username: string | null;
  photoUrl: string | null;
  courseCount: number;
  progress: number;
  joinedAt: Date;
  lastActive: Date | null;
};

function formatDate(date: Date | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function StudentTable({
  students,
}: {
  students: StudentRow[];
}) {
  const [query, setQuery] = useState("");

  /*
   * Filtering is done in memory. The whole list is already fetched for the
   * table, so this is instant and avoids a round trip per keystroke.
   */
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return students;

    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(term) ||
        (student.username ?? "").toLowerCase().includes(term)
    );
  }, [query, students]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]"
          strokeWidth={1.9}
        />

        <input
          type="text"
          value={query}
          placeholder="Search students…"
          onChange={(e) => setQuery(e.target.value)}
          className="
            h-10
            w-full
            rounded-[var(--radius-control)]
            border
            border-[var(--border)]
            bg-[var(--card)]
            pl-9
            pr-3
            text-[14px]
            text-[var(--text)]
            outline-none
            transition-all
            duration-200
            ease-out
            placeholder:text-[var(--text-subtle)]
            focus:border-[var(--primary)]
            focus:ring-2
            focus:ring-[var(--primary-ring)]
          "
        />
      </div>

      {students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students yet"
          description="Students appear here once they open the Mini App."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches"
          description={`Nothing matched "${query}".`}
        />
      ) : (
        <div
          className="
            overflow-hidden
            rounded-[var(--radius)]
            border
            border-[var(--border)]
            bg-[var(--card)]
            shadow-[var(--shadow-card)]
          "
        >
          <div
            className="
              hidden
              items-center
              gap-4
              border-b
              border-[var(--border)]
              px-4
              py-2.5
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.1em]
              text-[var(--text-subtle)]
              lg:flex
            "
          >
            <span className="min-w-0 flex-1">Student</span>
            <span className="w-24 shrink-0 text-right">Courses</span>
            <span className="w-28 shrink-0 text-right">Progress</span>
            <span className="w-28 shrink-0 text-right">Joined</span>
            <span className="w-28 shrink-0 text-right">Last active</span>
          </div>

          <ul>
            {filtered.map((student) => (
              <li key={student.id}>
                <Link
                  href={`/admin/students/${student.id}`}
                  className="
                    flex
                    flex-col
                    gap-2
                    border-b
                    border-[var(--border)]
                    px-4
                    py-3
                    transition-colors
                    duration-200
                    last:border-b-0
                    hover:bg-[var(--surface-secondary)]
                    lg:flex-row
                    lg:items-center
                    lg:gap-4
                  "
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar
                      name={student.name}
                      photoUrl={student.photoUrl}
                    />

                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium tracking-tight text-[var(--text)]">
                        {student.name}
                      </p>

                      <p className="truncate text-[11px] text-[var(--text-subtle)]">
                        {student.username
                          ? `@${student.username}`
                          : "No username"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] tabular-nums text-[var(--text-muted)] lg:contents">
                    <span className="lg:w-24 lg:shrink-0 lg:text-right">
                      <span className="lg:hidden">Courses: </span>
                      {student.courseCount}
                    </span>

                    <span className="lg:w-28 lg:shrink-0 lg:text-right">
                      <span className="lg:hidden">Progress: </span>
                      {student.progress}%
                    </span>

                    <span className="lg:w-28 lg:shrink-0 lg:text-right">
                      <span className="lg:hidden">Joined: </span>
                      {formatDate(student.joinedAt)}
                    </span>

                    <span className="lg:w-28 lg:shrink-0 lg:text-right">
                      <span className="lg:hidden">Last active: </span>
                      {formatDate(student.lastActive)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { FormField, inputClasses } from "@/components/admin/ui";
import { findStudents } from "@/app/actions/admin/messages";

/**
 * Search-and-select one student.
 *
 * Shows only what identifies the person — name, username, active course count.
 * The Telegram ID is deliberately not surfaced: the server resolves it at send
 * time, and it is not needed to make a choice.
 */

type Student = {
  id: string;
  name: string;
  username: string | null;
  activeCourses: number;
};

export default function StudentPicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Debounced so typing does not fire a query per keystroke.
    const timer = setTimeout(() => {
      setLoading(true);

      findStudents(query)
        .then((rows) => {
          if (!cancelled) setStudents(rows);
        })
        .catch(() => {
          if (!cancelled) setStudents([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const selected = students.find((student) => student.id === value);

  return (
    <FormField label="Student" required>
      <div className="space-y-2">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]"
            strokeWidth={1.9}
          />

          <input
            value={query}
            placeholder="Search by name or username…"
            disabled={disabled}
            onChange={(e) => setQuery(e.target.value)}
            className={`${inputClasses} pl-9`}
          />
        </div>

        {selected && (
          <p className="text-[13px] text-[var(--text-muted)]">
            Selected:{" "}
            <span className="font-medium text-[var(--text)]">
              {selected.name}
            </span>
          </p>
        )}

        <div className="max-h-52 overflow-y-auto rounded-[var(--radius-control)] border border-[var(--border)]">
          {loading && students.length === 0 ? (
            <p className="px-3.5 py-3 text-[13px] text-[var(--text-subtle)]">
              Searching…
            </p>
          ) : students.length === 0 ? (
            <p className="px-3.5 py-3 text-[13px] text-[var(--text-subtle)]">
              No students found.
            </p>
          ) : (
            <ul>
              {students.map((student) => {
                const active = student.id === value;

                return (
                  <li key={student.id}>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onChange(student.id)}
                      className={`
                        block
                        w-full
                        border-b
                        border-[var(--border)]
                        px-3.5
                        py-2.5
                        text-left
                        transition-colors
                        last:border-b-0
                        disabled:opacity-50
                        ${
                          active
                            ? "bg-[var(--primary-soft)]"
                            : "hover:bg-[var(--surface-secondary)]"
                        }
                      `}
                    >
                      <span
                        className={`block text-[14px] font-medium ${
                          active
                            ? "text-[var(--primary-text)]"
                            : "text-[var(--text)]"
                        }`}
                      >
                        {student.name}
                      </span>

                      <span className="block text-[12.5px] text-[var(--text-subtle)]">
                        {student.username ? `@${student.username} · ` : ""}
                        {student.activeCourses} active{" "}
                        {student.activeCourses === 1 ? "course" : "courses"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </FormField>
  );
}

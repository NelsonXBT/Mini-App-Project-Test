"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Trash2, ImageOff, BookOpen } from "lucide-react";

import {
  ConfirmDialog,
  EmptyState,
  StatusBadge,
} from "@/components/admin/ui";
import { deleteCourse } from "@/app/actions/admin/courses";
import CreateCourseButton from "./CreateCourseButton";

export type AdminCourseRow = {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  manualDuration: string | null;
  isPublished: boolean;
  moduleCount: number;
  studentCount: number;
  lessonCount: number;
};

export default function CourseTable({
  courses,
}: {
  courses: AdminCourseRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [target, setTarget] = useState<AdminCourseRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  function confirmDelete() {
    if (!target) return;

    startTransition(async () => {
      const result = await deleteCourse(target.id);

      if (result.ok) {
        setTarget(null);
        router.refresh();
      } else {
        setError(result.error);
        setTarget(null);
      }
    });
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No courses yet"
        description="Create your first course to get started."
        action={<CreateCourseButton />}
      />
    );
  }

  return (
    <>
      {error && (
        <p className="mb-3 text-[13px] text-[var(--danger)]">{error}</p>
      )}

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
        {/* Column headings are desktop-only; each row becomes a stacked
            card below the lg breakpoint. */}
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
          <span className="w-[54px] shrink-0" />
          <span className="min-w-0 flex-1">Course</span>
          <span className="w-20 shrink-0 text-right">Students</span>
          <span className="w-20 shrink-0 text-right">Modules</span>
          <span className="w-20 shrink-0 text-right">Lessons</span>
          <span className="w-24 shrink-0 text-right">Duration</span>
          <span className="w-28 shrink-0 text-right">Status</span>
          <span className="w-20 shrink-0" />
        </div>

        <ul>
          {courses.map((course) => (
            <li
              key={course.id}
              className="
                flex
                flex-col
                gap-3
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
                <div
                  className="
                    relative
                    h-[38px]
                    w-[54px]
                    shrink-0
                    overflow-hidden
                    rounded-[var(--radius-control)]
                    border
                    border-[var(--border)]
                    bg-[var(--surface-secondary)]
                  "
                >
                  {course.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.thumbnail}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageOff
                        className="h-3.5 w-3.5 text-[var(--text-subtle)]"
                        strokeWidth={1.9}
                      />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="block truncate text-[14px] font-medium tracking-tight text-[var(--text)] hover:text-[var(--primary-text)]"
                  >
                    {course.title}
                  </Link>

                  <p className="truncate text-[11px] text-[var(--text-subtle)]">
                    /{course.slug}
                  </p>
                </div>
              </div>

              {/* Mobile: inline labelled stats. Desktop: fixed columns. */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 lg:contents">
                <Stat label="Students" value={course.studentCount} />
                <Stat label="Modules" value={course.moduleCount} />
                <Stat label="Lessons" value={course.lessonCount} />

                <span className="text-[12px] tabular-nums text-[var(--text-muted)] lg:w-24 lg:shrink-0 lg:text-right">
                  <span className="lg:hidden">Duration: </span>
                  {course.manualDuration ?? "—"}
                </span>

                <span className="lg:w-28 lg:shrink-0 lg:text-right">
                  <StatusBadge published={course.isPublished} />
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-1 lg:w-20 lg:justify-end">
                <Link
                  href={`/admin/courses/${course.id}`}
                  aria-label={`Edit ${course.title}`}
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-[var(--radius-control)]
                    text-[var(--text-muted)]
                    transition-colors
                    duration-200
                    hover:bg-[var(--card)]
                    hover:text-[var(--text)]
                  "
                >
                  <Pencil className="h-4 w-4" strokeWidth={1.9} />
                </Link>

                <button
                  onClick={() => setTarget(course)}
                  aria-label={`Delete ${course.title}`}
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-[var(--radius-control)]
                    text-[var(--text-muted)]
                    transition-colors
                    duration-200
                    hover:bg-[var(--danger)]/10
                    hover:text-[var(--danger)]
                  "
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.9} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <ConfirmDialog
        open={Boolean(target)}
        busy={pending}
        title="Delete course?"
        description={
          target
            ? `"${target.title}" and all ${target.moduleCount} module${target.moduleCount === 1 ? "" : "s"}, ${target.lessonCount} lesson${target.lessonCount === 1 ? "" : "s"} and their resources will be permanently deleted. Student progress for this course is also removed.`
            : undefined
        }
        confirmLabel="Delete course"
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <span className="text-[12px] tabular-nums text-[var(--text-muted)] lg:w-20 lg:shrink-0 lg:text-right">
      <span className="lg:hidden">{label}: </span>
      {value}
    </span>
  );
}

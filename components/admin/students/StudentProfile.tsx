"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2, RotateCcw, Plus, BookOpen } from "lucide-react";

import { Button } from "@/components/ui";
import {
  Avatar,
  ConfirmDialog,
  EmptyState,
  Select,
} from "@/components/admin/ui";
import {
  grantCourse,
  removeCourse,
  resetProgress,
} from "@/app/actions/admin/students";

type Enrollment = {
  id: string;
  courseId: string;
  courseTitle: string;
  status: string;
  enrolledAt: Date;
};

type StudentProfileProps = {
  student: {
    id: string;
    name: string;
    username: string | null;
    email: string | null;
    photoUrl: string | null;
    joinedAt: Date;
    lastActive: Date | null;
    completedLessons: number;
    progress: number;
    currentLesson: { title: string; course: string } | null;
    enrollments: Enrollment[];
  };
  grantableCourses: { id: string; title: string }[];
};

function formatDate(date: Date | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function StudentProfile({
  student,
  grantableCourses,
}: StudentProfileProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [courseToGrant, setCourseToGrant] = useState("");
  const [removeTarget, setRemoveTarget] = useState<Enrollment | null>(
    null
  );
  const [resetOpen, setResetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);

    startTransition(async () => {
      const result = await action();

      if (result.ok) {
        setRemoveTarget(null);
        setResetOpen(false);
        setCourseToGrant("");
        router.refresh();
      } else {
        setError(result.error ?? "Something went wrong.");
        setRemoveTarget(null);
        setResetOpen(false);
      }
    });
  }

  const facts = [
    { label: "Telegram", value: student.username ? `@${student.username}` : "—" },
    { label: "Email", value: student.email ?? "—" },
    { label: "Joined", value: formatDate(student.joinedAt) },
    { label: "Last active", value: formatDate(student.lastActive) },
    { label: "Completed lessons", value: String(student.completedLessons) },
    { label: "Overall progress", value: `${student.progress}%` },
  ];

  return (
    <div className="space-y-5">
      {/* Identity */}
      <section
        className="
          rounded-[var(--radius)]
          border
          border-[var(--border)]
          bg-[var(--card)]
          p-5
          shadow-[var(--shadow-card)]
        "
      >
        <div className="flex items-center gap-3.5">
          <Avatar name={student.name} photoUrl={student.photoUrl} />

          <div className="min-w-0">
            <h1 className="truncate text-[1.125rem] font-semibold tracking-tight text-[var(--text)]">
              {student.name}
            </h1>

            {student.currentLesson && (
              <p className="truncate text-[12px] text-[var(--text-muted)]">
                Currently on {student.currentLesson.title} ·{" "}
                {student.currentLesson.course}
              </p>
            )}
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--text-subtle)]">
                {fact.label}
              </dt>

              <dd className="mt-1 truncate text-[14px] font-medium tracking-tight text-[var(--text)]">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {error && (
        <p className="text-[13px] text-[var(--danger)]">{error}</p>
      )}

      {/* Courses */}
      <section
        className="
          rounded-[var(--radius)]
          border
          border-[var(--border)]
          bg-[var(--card)]
          p-5
          shadow-[var(--shadow-card)]
        "
      >
        <h2 className="mb-4 text-[15px] font-semibold tracking-tight text-[var(--text)]">
          Courses
        </h2>

        {student.enrollments.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses"
            description="This student has not been granted any courses yet."
          />
        ) : (
          <ul className="space-y-2">
            {student.enrollments.map((enrollment) => (
              <li
                key={enrollment.id}
                className="
                  flex
                  items-center
                  gap-3
                  rounded-[var(--radius-control)]
                  border
                  border-[var(--border)]
                  px-3
                  py-2.5
                "
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium tracking-tight text-[var(--text)]">
                    {enrollment.courseTitle}
                  </p>

                  <p className="text-[11px] text-[var(--text-subtle)]">
                    Since {formatDate(enrollment.enrolledAt)}
                  </p>
                </div>

                <button
                  onClick={() => setRemoveTarget(enrollment)}
                  aria-label={`Remove ${enrollment.courseTitle}`}
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
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
              </li>
            ))}
          </ul>
        )}

        {grantableCourses.length > 0 && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <Select
                value={courseToGrant}
                onChange={setCourseToGrant}
                options={grantableCourses.map((course) => ({
                  value: course.id,
                  label: course.title,
                }))}
                placeholder="Select a course…"
              />
            </div>

            <Button
              variant="secondary"
              disabled={pending || !courseToGrant}
              onClick={() =>
                run(() => grantCourse(student.id, courseToGrant))
              }
            >
              <Plus className="h-4 w-4" strokeWidth={2.1} />
              Grant course
            </Button>
          </div>
        )}
      </section>

      {/* Danger zone */}
      <section
        className="
          rounded-[var(--radius)]
          border
          border-[var(--border)]
          bg-[var(--card)]
          p-5
          shadow-[var(--shadow-card)]
        "
      >
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--text)]">
          Reset progress
        </h2>

        <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-muted)]">
          Clears every watched position and completion for this student.
          Course access is not affected.
        </p>

        <Button
          variant="secondary"
          className="mt-4"
          disabled={pending}
          onClick={() => setResetOpen(true)}
        >
          <RotateCcw className="h-4 w-4" strokeWidth={1.9} />
          Reset all progress
        </Button>
      </section>

      <ConfirmDialog
        open={Boolean(removeTarget)}
        busy={pending}
        title="Remove course access?"
        description={
          removeTarget
            ? `${student.name} will lose access to "${removeTarget.courseTitle}". Their progress is kept.`
            : undefined
        }
        confirmLabel="Remove access"
        onConfirm={() =>
          removeTarget &&
          run(() => removeCourse(student.id, removeTarget.courseId))
        }
        onCancel={() => setRemoveTarget(null)}
      />

      <ConfirmDialog
        open={resetOpen}
        busy={pending}
        title="Reset all progress?"
        description={`Every lesson position and completion for ${student.name} will be permanently deleted. This cannot be undone.`}
        confirmLabel="Reset progress"
        onConfirm={() => run(() => resetProgress(student.id))}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  );
}

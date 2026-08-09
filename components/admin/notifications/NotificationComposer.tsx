"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Bell, Pencil, Send, Trash2, EyeOff } from "lucide-react";

import { Button } from "@/components/ui";
import {
  ConfirmDialog,
  EmptyState,
  FormField,
  Select,
  StatusBadge,
  inputClasses,
  textareaClasses,
} from "@/components/admin/ui";
import type { NotificationInput } from "@/app/actions/admin/notifications";
import {
  createNotification,
  deleteNotification,
  setNotificationPublished,
  updateNotification,
} from "@/app/actions/admin/notifications";

export type NotificationRow = {
  id: string;
  title: string;
  body: string;
  linkUrl: string | null;
  audience: "ALL" | "COURSE";
  courseId: string | null;
  courseTitle: string | null;
  publishedAt: string | null;
  createdAt: string;
};

export type CourseOption = { value: string; label: string };

const emptyForm: NotificationInput = {
  title: "",
  body: "",
  linkUrl: "",
  audience: "ALL",
  courseId: "",
  publish: true,
};

export default function NotificationComposer({
  items,
  courses,
}: {
  items: NotificationRow[];
  courses: CourseOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [composing, setComposing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NotificationRow | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  function submit(input: NotificationInput, id?: string) {
    setError(null);

    startTransition(async () => {
      const result = id
        ? await updateNotification(id, input)
        : await createNotification(input);

      if (result.ok) {
        setComposing(false);
        setEditingId(null);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function togglePublished(row: NotificationRow) {
    setError(null);

    startTransition(async () => {
      const result = await setNotificationPublished(
        row.id,
        row.publishedAt === null
      );

      if (!result.ok) setError(result.error);

      router.refresh();
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;

    startTransition(async () => {
      const result = await deleteNotification(deleteTarget.id);

      if (!result.ok) setError(result.error);

      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {composing ? (
        <NotificationForm
          courses={courses}
          pending={pending}
          onSubmit={(input) => submit(input)}
          onCancel={() => setComposing(false)}
        />
      ) : (
        <Button onClick={() => setComposing(true)}>
          <Send className="h-4 w-4" strokeWidth={2.1} />
          New notification
        </Button>
      )}

      {error && <p className="text-[13px] text-[var(--danger)]">{error}</p>}

      {items.length === 0 && !composing ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="Post an update and it appears in every student's notification bell."
        />
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--card)] p-3.5"
            >
              {editingId === item.id ? (
                <NotificationForm
                  initial={item}
                  courses={courses}
                  pending={pending}
                  onSubmit={(input) => submit(input, item.id)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[14px] font-semibold tracking-tight text-[var(--text)]">
                        {item.title}
                      </p>

                      <StatusBadge published={item.publishedAt !== null} />
                    </div>

                    <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-[var(--text-muted)]">
                      {item.body}
                    </p>

                    <p className="mt-2 text-[12px] text-[var(--text-subtle)]">
                      {item.audience === "ALL"
                        ? "All students"
                        : `Only: ${item.courseTitle ?? "course removed"}`}
                      {" · "}
                      {new Date(
                        item.publishedAt ?? item.createdAt
                      ).toLocaleString(undefined, {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => togglePublished(item)}
                      disabled={pending}
                      aria-label={
                        item.publishedAt === null
                          ? `Publish ${item.title}`
                          : `Unpublish ${item.title}`
                      }
                      title={
                        item.publishedAt === null ? "Publish" : "Unpublish"
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--text)] disabled:opacity-50"
                    >
                      {item.publishedAt === null ? (
                        <Send className="h-3.5 w-3.5" strokeWidth={1.9} />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" strokeWidth={1.9} />
                      )}
                    </button>

                    <button
                      onClick={() => setEditingId(item.id)}
                      aria-label={`Edit ${item.title}`}
                      className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </button>

                    <button
                      onClick={() => setDeleteTarget(item)}
                      aria-label={`Delete ${item.title}`}
                      className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-muted)] transition-colors hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        busy={pending}
        title="Delete notification?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be removed for every student.`
            : undefined
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function NotificationForm({
  initial,
  courses,
  pending,
  onSubmit,
  onCancel,
}: {
  initial?: NotificationRow;
  courses: CourseOption[];
  pending: boolean;
  onSubmit: (input: NotificationInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<NotificationInput>({
    title: initial?.title ?? emptyForm.title,
    body: initial?.body ?? emptyForm.body,
    linkUrl: initial?.linkUrl ?? "",
    audience: initial?.audience ?? emptyForm.audience,
    courseId: initial?.courseId ?? "",
    // Editing a live notification must not silently unpublish it.
    publish: initial ? initial.publishedAt !== null : true,
  });

  function set<K extends keyof NotificationInput>(
    key: K,
    value: NotificationInput[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const audienceOptions = [
    { value: "ALL", label: "All students" },
    { value: "COURSE", label: "One course" },
  ];

  return (
    <div className="space-y-3">
      <FormField label="Title" required>
        <input
          autoFocus
          value={form.title}
          placeholder="New lessons added"
          onChange={(e) => set("title", e.target.value)}
          className={inputClasses}
        />
      </FormField>

      <FormField label="Message" required>
        <textarea
          rows={3}
          value={form.body}
          placeholder="Module 4 is live. Watch it from your course page."
          onChange={(e) => set("body", e.target.value)}
          className={textareaClasses}
        />
      </FormField>

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Audience">
          <Select
            value={form.audience}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                audience: value as "ALL" | "COURSE",
                // Drop a stale course when switching back to everyone.
                courseId: value === "ALL" ? "" : current.courseId,
              }))
            }
            options={audienceOptions}
          />
        </FormField>

        {form.audience === "COURSE" && (
          <FormField label="Course" required>
            <Select
              value={form.courseId}
              onChange={(value) => set("courseId", value)}
              options={courses}
              placeholder="Select a course"
            />
          </FormField>
        )}
      </div>

      <FormField
        label="Link"
        hint="Optional. Adds an “Open” action to the notification."
      >
        <input
          value={form.linkUrl}
          placeholder="https://…"
          onChange={(e) => set("linkUrl", e.target.value)}
          className={inputClasses}
        />
      </FormField>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => onSubmit({ ...form, publish: true })}
          disabled={pending}
        >
          <Send className="h-4 w-4" strokeWidth={2.1} />
          {pending ? "Saving…" : initial ? "Save" : "Publish"}
        </Button>

        {/* A draft lets an admin write now and publish deliberately later. */}
        {!initial && (
          <Button
            variant="secondary"
            onClick={() => onSubmit({ ...form, publish: false })}
            disabled={pending}
          >
            Save as draft
          </Button>
        )}

        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui";
import {
  FormField,
  Select,
  Toggle,
  inputClasses,
  textareaClasses,
} from "@/components/admin/ui";
import {
  createLesson,
  updateLesson,
  type LessonInput,
} from "@/app/actions/admin/lessons";
import type { LessonRow } from "./LessonEditor";

const providerOptions = [
  { value: "bunny", label: "Bunny" },
  { value: "youtube", label: "YouTube" },
];

/**
 * Shared create/edit form.
 *
 * Video is captured as provider + video ID rather than a single URL, because
 * that is what the schema stores and what Daluplayer feeds straight to hls.js
 * as its source — a free-text URL here would break playback.
 */
export default function LessonForm({
  moduleId,
  lesson,
  onDone,
  onCancel,
}: {
  moduleId: string;
  lesson?: LessonRow;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<LessonInput>({
    title: lesson?.title ?? "",
    description: lesson?.description ?? "",
    provider: lesson?.provider ?? "bunny",
    videoId: lesson?.videoId ?? "",
    // Stored in seconds, edited in minutes.
    duration:
      lesson?.duration != null
        ? String(Math.round(lesson.duration / 60))
        : "",
    isPublished: lesson?.isPublished ?? true,
    isPreview: lesson?.isPreview ?? false,
  });

  function set<K extends keyof LessonInput>(
    key: K,
    value: LessonInput[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = lesson
        ? await updateLesson(lesson.id, form)
        : await createLesson(moduleId, form);

      if (result.ok) {
        onDone();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="
        space-y-3
        rounded-[var(--radius-control)]
        border
        border-[var(--border)]
        bg-[var(--surface-secondary)]
        p-3
      "
    >
      <FormField label="Title" required>
        <input
          autoFocus
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className={inputClasses}
        />
      </FormField>

      <div className="grid gap-3 sm:grid-cols-3">
        <FormField label="Provider">
          <Select
            value={form.provider}
            onChange={(value) => set("provider", value)}
            options={providerOptions}
          />
        </FormField>

        <FormField
          label="Video ID"
          required
          className="sm:col-span-2"
          hint="Bunny playlist URL or YouTube ID."
        >
          <input
            value={form.videoId}
            onChange={(e) => set("videoId", e.target.value)}
            className={inputClasses}
          />
        </FormField>
      </div>

      <FormField label="Description">
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className={textareaClasses}
        />
      </FormField>

      <FormField label="Duration (minutes)">
        <input
          type="number"
          min={0}
          value={form.duration}
          onChange={(e) => set("duration", e.target.value)}
          className={inputClasses}
        />
      </FormField>

      <div className="space-y-2.5 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--card)] px-3 py-2.5">
        <Toggle
          checked={form.isPublished}
          onChange={(value) => set("isPublished", value)}
          label="Published"
          description="Drafts stay hidden from students."
        />

        <Toggle
          checked={form.isPreview}
          onChange={(value) => set("isPreview", value)}
          label="Free preview"
          description="Viewable without enrolment."
        />
      </div>

      {error && (
        <p className="text-[12px] text-[var(--danger)]">{error}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Saving…"
            : lesson
              ? "Save lesson"
              : "Add lesson"}
        </Button>

        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

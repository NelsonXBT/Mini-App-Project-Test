"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui";
import {
  FormField,
  ImageUrlField,
  Select,
  Toggle,
  inputClasses,
  textareaClasses,
} from "@/components/admin/ui";
import { updateCourse } from "@/app/actions/admin/courses";

type CourseDetailsFormProps = {
  course: {
    id: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    description: string | null;
    thumbnail: string | null;
    instructor: string | null;
    manualDuration: string | null;
    difficulty: string | null;
    isPublished: boolean;
  };
};

const difficultyOptions = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function CourseDetailsForm({
  course,
}: CourseDetailsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [form, setForm] = useState({
    title: course.title,
    slug: course.slug,
    shortDescription: course.shortDescription ?? "",
    description: course.description ?? "",
    thumbnail: course.thumbnail ?? "",
    instructor: course.instructor ?? "",
    manualDuration: course.manualDuration ?? "",
    difficulty: course.difficulty ?? "",
    isPublished: course.isPublished,
  });

  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateCourse({
        id: course.id,
        ...form,
      });

      if (result.ok) {
        setSaved(true);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Title" htmlFor="title" required>
          <input
            id="title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputClasses}
          />
        </FormField>

        <FormField
          label="Slug"
          htmlFor="slug"
          required
          hint="Used in the course URL."
        >
          <input
            id="slug"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            className={inputClasses}
          />
        </FormField>
      </div>

      <FormField
        label="Short description"
        htmlFor="shortDescription"
        hint="One line, shown in listings."
      >
        <input
          id="shortDescription"
          value={form.shortDescription}
          onChange={(e) => set("shortDescription", e.target.value)}
          className={inputClasses}
        />
      </FormField>

      <FormField label="Full description" htmlFor="description">
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className={textareaClasses}
        />
      </FormField>

      <FormField label="Thumbnail" htmlFor="thumbnail">
        <ImageUrlField
          id="thumbnail"
          value={form.thumbnail}
          onChange={(value) => set("thumbnail", value)}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Instructor" htmlFor="instructor">
          <input
            id="instructor"
            value={form.instructor}
            onChange={(e) => set("instructor", e.target.value)}
            className={inputClasses}
          />
        </FormField>

        <FormField
          label="Duration"
          htmlFor="manualDuration"
          hint="Free text, e.g. 8h 35m."
        >
          <input
            id="manualDuration"
            value={form.manualDuration}
            placeholder="8h 35m"
            onChange={(e) => set("manualDuration", e.target.value)}
            className={inputClasses}
          />
        </FormField>

        <FormField label="Difficulty" htmlFor="difficulty">
          <Select
            id="difficulty"
            value={form.difficulty}
            onChange={(value) => set("difficulty", value)}
            options={difficultyOptions}
            placeholder="Not set"
          />
        </FormField>
      </div>

      <div
        className="
          rounded-[var(--radius-control)]
          border
          border-[var(--border)]
          bg-[var(--surface-secondary)]
          px-4
          py-3
        "
      >
        <Toggle
          checked={form.isPublished}
          onChange={(value) => set("isPublished", value)}
          label="Published"
          description="Drafts stay hidden from students."
        />
      </div>

      {error && (
        <p className="text-[13px] text-[var(--danger)]">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>

        {saved && !pending && (
          <span className="text-[13px] text-[var(--success)]">
            Saved
          </span>
        )}
      </div>
    </form>
  );
}

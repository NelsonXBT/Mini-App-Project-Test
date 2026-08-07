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
    telegramChatId: string | null;
    telegramUsername: string | null;
    telegramInviteLink: string | null;
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
    telegramChatId: course.telegramChatId ?? "",
    telegramUsername: course.telegramUsername ?? "",
    telegramInviteLink: course.telegramInviteLink ?? "",
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

      {/*
        Access control. These feed the existing membership check — a student
        must belong to this chat to open the course. Leaving Chat ID empty
        means the course has no Telegram gate.
      */}
      <fieldset className="space-y-4 border-t border-[var(--border)] pt-5">
        <legend className="sr-only">Telegram access</legend>

        <div>
          <h3 className="text-[13px] font-semibold text-[var(--text)]">
            Telegram access
          </h3>
          <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">
            Which channel or group grants access to this course.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Channel / group name"
            htmlFor="telegramUsername"
            hint="For display, e.g. @dalucamp."
          >
            <input
              id="telegramUsername"
              value={form.telegramUsername}
              placeholder="@dalucamp"
              onChange={(e) => set("telegramUsername", e.target.value)}
              className={inputClasses}
            />
          </FormField>

          <FormField
            label="Chat ID"
            htmlFor="telegramChatId"
            hint="Used for verification, e.g. -1001234567890."
          >
            <input
              id="telegramChatId"
              value={form.telegramChatId}
              placeholder="-1001234567890"
              onChange={(e) => set("telegramChatId", e.target.value)}
              className={inputClasses}
            />
          </FormField>
        </div>

        <FormField
          label="Invite link"
          htmlFor="telegramInviteLink"
          hint="Optional, for reference."
        >
          <input
            id="telegramInviteLink"
            value={form.telegramInviteLink}
            placeholder="https://t.me/+…"
            onChange={(e) => set("telegramInviteLink", e.target.value)}
            className={inputClasses}
          />
        </FormField>
      </fieldset>

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

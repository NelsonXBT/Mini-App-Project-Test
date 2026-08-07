"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui";
import {
  FormField,
  ImageUrlField,
  inputClasses,
} from "@/components/admin/ui";
import {
  updateSettings,
  type SettingsInput,
} from "@/app/actions/admin/settings";

export default function SettingsForm({
  settings,
}: {
  settings: {
    platformName: string;
    logoUrl: string | null;
    supportEmail: string | null;
    telegramCommunityUrl: string | null;
    defaultCourseThumbnail: string | null;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [form, setForm] = useState<SettingsInput>({
    platformName: settings.platformName,
    logoUrl: settings.logoUrl ?? "",
    supportEmail: settings.supportEmail ?? "",
    telegramCommunityUrl: settings.telegramCommunityUrl ?? "",
    defaultCourseThumbnail: settings.defaultCourseThumbnail ?? "",
  });

  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof SettingsInput>(
    key: K,
    value: SettingsInput[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateSettings(form);

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
      <FormField label="Platform name" htmlFor="platformName" required>
        <input
          id="platformName"
          value={form.platformName}
          onChange={(e) => set("platformName", e.target.value)}
          className={inputClasses}
        />
      </FormField>

      <FormField label="Logo" htmlFor="logoUrl">
        <ImageUrlField
          id="logoUrl"
          aspect="square"
          value={form.logoUrl}
          onChange={(value) => set("logoUrl", value)}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Support email" htmlFor="supportEmail">
          <input
            id="supportEmail"
            type="email"
            value={form.supportEmail}
            onChange={(e) => set("supportEmail", e.target.value)}
            className={inputClasses}
          />
        </FormField>

        <FormField
          label="Telegram community"
          htmlFor="telegramCommunityUrl"
        >
          <input
            id="telegramCommunityUrl"
            type="url"
            placeholder="https://t.me/…"
            value={form.telegramCommunityUrl}
            onChange={(e) =>
              set("telegramCommunityUrl", e.target.value)
            }
            className={inputClasses}
          />
        </FormField>
      </div>

      <FormField
        label="Default course thumbnail"
        htmlFor="defaultCourseThumbnail"
        hint="Used when a course has no thumbnail of its own."
      >
        <ImageUrlField
          id="defaultCourseThumbnail"
          value={form.defaultCourseThumbnail}
          onChange={(value) => set("defaultCourseThumbnail", value)}
        />
      </FormField>

      {error && (
        <p className="text-[13px] text-[var(--danger)]">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
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

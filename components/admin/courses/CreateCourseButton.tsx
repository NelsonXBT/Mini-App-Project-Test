"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui";
import { createCourse } from "@/app/actions/admin/courses";

export default function CreateCourseButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onCreate() {
    setError(null);

    startTransition(async () => {
      const result = await createCourse();

      if (result.ok && result.id) {
        // Straight into the editor — the row is created with placeholder
        // values so there is no separate "new course" form to fill first.
        router.push(`/admin/courses/${result.id}`);
      } else if (!result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button onClick={onCreate} disabled={pending}>
        <Plus className="h-4 w-4" strokeWidth={2.1} />
        {pending ? "Creating…" : "Create Course"}
      </Button>

      {error && (
        <p className="text-[13px] text-[var(--danger)]">{error}</p>
      )}
    </div>
  );
}

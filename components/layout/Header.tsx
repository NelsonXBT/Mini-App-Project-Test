"use client";

import { Bell, ChevronLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import IconButton from "@/components/ui/IconButton";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const isCourseLearningPage =
    /^\/courses\/[^/]+$/.test(pathname);

  if (isCourseLearningPage) {
    return (
      <header className="mb-5 flex items-center">
        <IconButton
          aria-label="Go back"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5" />
        </IconButton>
      </header>
    );
  }

  return (
    <header className="player-header mb-7 flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)]">
          AI Learning Platform
        </p>

        <h1 className="mt-1.5 text-[1.625rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--text)]">
          IME Creative Lab
        </h1>
      </div>

      <IconButton aria-label="Notifications">
        <Bell className="h-5 w-5" />
      </IconButton>
    </header>
  );
}
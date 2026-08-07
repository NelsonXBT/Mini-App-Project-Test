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
      <header className="mb-4 flex items-center">
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
    <header className="player-header flex items-center justify-between gap-3 py-1">
      <h1 className="text-[1.125rem] font-semibold leading-tight tracking-[-0.02em] text-[var(--text)]">
        IME Creative Lab
      </h1>

      <IconButton aria-label="Notifications">
        <Bell className="h-[18px] w-[18px]" />
      </IconButton>
    </header>
  );
}
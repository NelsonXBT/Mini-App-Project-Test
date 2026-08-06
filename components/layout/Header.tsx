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
          <ChevronLeft className="h-6 w-6" />
        </IconButton>
      </header>
    );
  }

  return (
    <header className="player-header mb-8 flex items-start justify-between">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-stone-500">
          AI Learning Platform
        </p>

        <h1 className="mt-1 text-[2rem] font-bold tracking-tight text-stone-900">
          IME Creative Lab
        </h1>
      </div>

      <IconButton aria-label="Notifications">
        <Bell className="h-5 w-5" />
      </IconButton>
    </header>
  );
}
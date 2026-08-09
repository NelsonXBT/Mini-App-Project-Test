"use client";

import { ChevronLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import IconButton from "@/components/ui/IconButton";
import Logo from "@/components/ui/Logo";
import NotificationBell from "@/components/notifications/NotificationBell";

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
      <h1>
        <Logo size="sm" />
      </h1>

      <NotificationBell />
    </header>
  );
}

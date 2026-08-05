import { Bell } from "lucide-react";

import { Icon } from "@/components/ui";

export default function Header() {
  return (
    <header
      className="
        player-header
        mb-6
        flex
        items-center
        justify-between
      "
    >
      <div>
        <p className="text-xs font-medium tracking-[0.18em] uppercase text-[var(--text-muted)]">
          AI Learning Platform
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text)]">
          IME Creative Lab
        </h1>
      </div>

      <button
        aria-label="Notifications"
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-full
          border
          border-[var(--border)]
          bg-[var(--card)]
          shadow-[var(--shadow-card)]
          transition-all
          duration-200
          hover:scale-105
        "
      >
        <Icon
          icon={Bell}
          tone="muted"
          size="md"
          strokeWidth={2}
        />
      </button>
    </header>
  );
}
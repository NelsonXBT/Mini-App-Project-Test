"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";

import GlobalSearch from "./GlobalSearch";

type AdminHeaderProps = {
  onOpenSidebar: () => void;
  adminName: string;
};

export default function AdminHeader({
  onOpenSidebar,
  adminName,
}: AdminHeaderProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);

    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  const initials = adminName.trim().charAt(0).toUpperCase() || "A";

  return (
    <header
      className="
        sticky
        top-0
        z-30
        flex
        h-16
        items-center
        gap-3
        border-b
        border-[var(--border)]
        bg-[var(--surface)]/90
        px-4
        backdrop-blur-xl
        sm:px-6
      "
    >
      <button
        onClick={onOpenSidebar}
        aria-label="Open navigation"
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-[var(--radius-control)]
          border
          border-[var(--border)]
          text-[var(--text-muted)]
          transition-colors
          duration-200
          hover:bg-[var(--surface-secondary)]
          hover:text-[var(--text)]
          lg:hidden
        "
      >
        <Menu className="h-4.5 w-4.5" strokeWidth={1.9} />
      </button>

      <div className="flex-1">
        <GlobalSearch />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-[var(--radius-pill)]
            bg-[var(--primary-soft)]
            text-[13px]
            font-semibold
            text-[var(--primary-text)]
          "
          title={adminName}
        >
          {initials}
        </span>

        <button
          onClick={signOut}
          disabled={signingOut}
          aria-label="Sign out"
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-[var(--radius-control)]
            text-[var(--text-muted)]
            transition-colors
            duration-200
            hover:bg-[var(--surface-secondary)]
            hover:text-[var(--text)]
            disabled:opacity-50
          "
        >
          <LogOut className="h-4.5 w-4.5" strokeWidth={1.9} />
        </button>
      </div>
    </header>
  );
}

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  X,
  Bell,
  FolderOpen,
  MessagesSquare,
  Send,
} from "lucide-react";

import Logo from "@/components/ui/Logo";
import { BRAND_NAME } from "@/lib/admin/constants";

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/courses",
    label: "Courses",
    icon: BookOpen,
  },
  {
    href: "/admin/students",
    label: "Students",
    icon: Users,
  },
  {
    href: "/admin/community",
    label: "Community",
    icon: MessagesSquare,
  },
  {
    href: "/admin/resources",
    label: "Resources",
    icon: FolderOpen,
  },
  {
    href: "/admin/notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    href: "/admin/messaging",
    label: "Messaging",
    icon: Send,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
  },
];

type AdminSidebarProps = {
  open: boolean;
  onClose: () => void;
  platformName: string;
};

export default function AdminSidebar({
  open,
  onClose,
  platformName,
}: AdminSidebarProps) {
  const pathname = usePathname();

  /*
   * Settings can rename the platform. The wordmark is only correct while the
   * name is still ours — a renamed platform gets its own name as plain type.
   */
  const isBrand = platformName.trim() === BRAND_NAME;

  function isActive(href: string) {
    // "/admin" would otherwise match every nested route.
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="animate-fade-in fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-[248px]
          flex-col
          border-r
          border-[var(--border)]
          bg-[var(--surface)]
          shadow-[1px_0_2px_rgba(28,18,18,0.03),4px_0_20px_rgba(28,18,18,0.04)]
          transition-transform
          duration-200
          ease-out
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-[var(--border)] px-5">
          <Link
            href="/admin"
            className="flex min-w-0 flex-col items-start gap-1"
          >
            {isBrand ? (
              <Logo size="sm" />
            ) : (
              <span className="max-w-full truncate text-[15px] font-semibold tracking-tight text-[var(--text)]">
                {platformName}
              </span>
            )}

            {/*
             * Stacked beneath the mark, not inline beside it. It was inline
             * while the wordmark was two rows, because a third row would have
             * outgrown this 64px header — but the wordmark is one row now, so
             * the stack costs ~39px total and the inline form no longer fits:
             * the one-line mark, a hairline, the label and the mobile close
             * button together overrun the 208px of content this 248px rail
             * has.
             */}
            <span className="max-w-full truncate text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--text-subtle)]">
              Admin
            </span>
          </Link>

          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="
              -mr-1
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-[var(--radius-control)]
              text-[var(--text-muted)]
              transition-colors
              duration-200
              hover:bg-[var(--surface-secondary)]
              hover:text-[var(--text)]
              lg:hidden
            "
          >
            <X className="h-4.5 w-4.5" strokeWidth={1.9} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`
                  flex
                  items-center
                  gap-3
                  rounded-[var(--radius-control)]
                  px-3
                  py-2.5
                  text-[14.5px]
                  font-medium
                  tracking-tight
                  transition-colors
                  duration-200
                  ease-out
                  ${
                    active
                      ? "bg-[var(--primary-soft)] text-[var(--primary-text)] shadow-[inset_0_0_0_1px_var(--primary-ring)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]"
                  }
                `}
              >
                <Icon
                  className="h-[19px] w-[19px] shrink-0"
                  strokeWidth={active ? 2.2 : 1.9}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

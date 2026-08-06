"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  X,
} from "lucide-react";

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
          transition-transform
          duration-200
          ease-out
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-[var(--border)] px-5">
          <Link href="/admin" className="min-w-0">
            <p className="truncate text-[15px] font-semibold tracking-tight text-[var(--text)]">
              {platformName}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-subtle)]">
              Admin
            </p>
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
                  text-[14px]
                  font-medium
                  tracking-tight
                  transition-colors
                  duration-200
                  ease-out
                  ${
                    active
                      ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]"
                  }
                `}
              >
                <Icon
                  className="h-[18px] w-[18px] shrink-0"
                  strokeWidth={active ? 2.1 : 1.9}
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

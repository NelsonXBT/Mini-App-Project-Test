"use client";

import { usePathname } from "next/navigation";
import {
  BookOpen,
  FolderOpen,
  House,
  Users,
} from "lucide-react";

import SaveLink from "@/components/common/SaveLink";
import { Icon } from "@/components/ui";

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: House,
    },
    {
      href: "/courses",
      label: "Courses",
      icon: BookOpen,
    },
    {
      href: "/community",
      label: "Community",
      icon: Users,
    },
    {
      href: "/resources",
      label: "Resources",
      icon: FolderOpen,
    },
  ];

  return (
    <nav
      className="
        player-nav
        fixed
        bottom-0
        left-0
        right-0
        z-50
        border-t
        border-[var(--border)]
        bg-[var(--surface)]/90
        backdrop-blur-xl
        shadow-[var(--shadow-nav)]
        transition-all
        duration-300
      "
    >
      <div
            className="
              mx-auto
              flex
              max-w-md
              justify-around
              px-3
              pt-2.5
              pb-[calc(env(safe-area-inset-bottom)+10px)]
            "
          >
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" &&
              pathname.startsWith(item.href));

          return (
            <SaveLink
              key={item.href}
              href={item.href}
              className={`
                flex
                min-w-[68px]
                flex-col
                items-center
                gap-1
                rounded-[var(--radius-control)]
                px-3
                py-2
                transition-colors
                duration-200
                ${
                  active
                  ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }
              `}
            >
              <Icon
                icon={item.icon}
                size="md"
                tone={active ? "accent" : "muted"}
                strokeWidth={active ? 2.2 : 1.9}
              />

              <span className="text-[11.5px] font-semibold tracking-tight">
                {item.label}
              </span>
            </SaveLink>
          );
        })}
      </div>
    </nav>
  );
}
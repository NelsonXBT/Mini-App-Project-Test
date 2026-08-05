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

  if (pathname === "/player") {
    return null;
  }

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
        bottom-4
        left-1/2
        z-50
        w-[calc(100%-24px)]
        max-w-md
        -translate-x-1/2
        rounded-[26px]
        border
        border-[var(--border)]
        bg-[var(--card)]/95
        shadow-[var(--shadow-card)]
        backdrop-blur-xl
        transition-all
        duration-300
      "
    >
      <div className="flex justify-around px-2 py-2">
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
                rounded-2xl
                px-3
                py-2
                transition-all
                duration-200
                ${
                  active
                    ? "bg-[var(--surface-secondary)] text-[var(--primary)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }
              `}
            >
              <Icon
                icon={item.icon}
                tone={active ? "accent" : "muted"}
                strokeWidth={active ? 2.4 : 2}
              />

              <span className="text-[11px] font-medium">
                {item.label}
              </span>
            </SaveLink>
          );
        })}
      </div>
    </nav>
  );
}
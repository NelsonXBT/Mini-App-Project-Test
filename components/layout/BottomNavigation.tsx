"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  BookOpen,
  FolderOpen,
  Users,
} from "lucide-react";

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
    <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-md justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            (item.href !== "/" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition ${
                active
                  ? "text-cyan-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="h-5 w-5" />

              <span className="text-xs">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
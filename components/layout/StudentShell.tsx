"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/layout/BottomNavigation";

/*
 * Routes that render standalone — message only, no header, no bottom nav,
 * no max-width shell.
 *
 * /no-access is the dead end for a student who is inside Telegram but has
 * no course or channel access. Offering them Home / Courses / Community /
 * Resources there just loops them back into content they cannot open.
 *
 * Handled here rather than by moving the route out of the (student) group,
 * because it still has to render inside TelegramAuth — it is only reachable
 * once initData has been validated, and the gate redirects to it.
 */
const bareRoutes = ["/no-access"];

export default function StudentShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const isBare = bareRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isBare) {
    return <>{children}</>;
  }

  return (
    <>
      <main className="app-main mx-auto min-h-screen w-full max-w-md px-4 pt-3 pb-24 sm:px-5">
        <Header />

        <div className="animate-fade-in">{children}</div>
      </main>

      <BottomNavigation />
    </>
  );
}

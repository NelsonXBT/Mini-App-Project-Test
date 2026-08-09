"use client";

import { ReactNode, useState } from "react";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

type AdminShellProps = {
  children: ReactNode;
  adminName: string;
  platformName: string;
};

/**
 * Owns the only piece of state the chrome needs — whether the mobile drawer
 * is open. Keeping it here means the sidebar and header stay presentational
 * and the server layout above can remain a Server Component.
 */
export default function AdminShell({
  children,
  adminName,
  platformName,
}: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--admin-ground)]">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        platformName={platformName}
      />

      <div className="lg:pl-[248px]">
        <AdminHeader
          onOpenSidebar={() => setSidebarOpen(true)}
          adminName={adminName}
        />

        <main className="px-4 py-7 sm:px-8 sm:py-9">
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

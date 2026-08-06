import { ReactNode } from "react";
import { redirect } from "next/navigation";

import AdminShell from "@/components/admin/layout/AdminShell";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { getPlatformSettings } from "@/lib/db/admin/settings";

export const dynamic = "force-dynamic";

/**
 * The real access check.
 *
 * middleware.ts can only see whether a cookie exists; this verifies the
 * session actually resolves to an admin. Every admin server action repeats
 * the check via requireAdmin(), because a layout guard alone does not
 * protect a directly-invoked action.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  const settings = await getPlatformSettings();

  return (
    <AdminShell
      adminName={admin.name ?? admin.username}
      platformName={settings.platformName}
    >
      {children}
    </AdminShell>
  );
}

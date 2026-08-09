import type { Metadata } from "next";

import SettingsForm from "@/components/admin/settings/SettingsForm";
import { getPlatformSettings } from "@/lib/db/admin/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Settings",
};

export default async function AdminSettingsPage() {
  const settings = await getPlatformSettings();

  return (
    <div className="animate-rise-in space-y-5">
      <div>
        <h1 className="text-[1.375rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--text)]">
          Settings
        </h1>

        <p className="mt-1 text-[14px] text-[var(--text-muted)]">
          Platform-wide configuration.
        </p>
      </div>

      <section
        className="
          max-w-2xl
          rounded-[var(--radius)]
          border
          border-[var(--border)]
          bg-[var(--card)]
          p-5
          shadow-[var(--shadow-panel)]
        "
      >
        <SettingsForm settings={settings} />
      </section>
    </div>
  );
}

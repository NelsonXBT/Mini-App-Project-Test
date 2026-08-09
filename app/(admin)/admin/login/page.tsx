import type { Metadata } from "next";
import { Suspense } from "react";

import AdminLoginForm from "@/components/admin/AdminLoginForm";
import Logo from "@/components/ui/Logo";
import { BRAND_NAME } from "@/lib/admin/constants";
import { getPlatformSettings } from "@/lib/db/admin/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Sign in",
};

export default async function AdminLoginPage() {
  const settings = await getPlatformSettings();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-5">
      <div className="animate-rise-in w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          {settings.platformName.trim() === BRAND_NAME ? (
            <Logo size="md" />
          ) : (
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)]">
              {settings.platformName}
            </p>
          )}

          <h1 className="mt-4 text-[1.375rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--text)]">
            Admin sign in
          </h1>
        </div>

        <div
          className="
            rounded-[var(--radius)]
            border
            border-[var(--border)]
            bg-[var(--card)]
            p-5
            shadow-[var(--shadow-card)]
          "
        >
          {/* useSearchParams needs a Suspense boundary. */}
          <Suspense fallback={null}>
            <AdminLoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

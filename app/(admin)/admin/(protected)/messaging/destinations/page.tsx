import type { Metadata } from "next";
import Link from "next/link";

import DestinationManager from "@/components/admin/messaging/DestinationManager";
import { getDestinations } from "@/lib/db/admin/messages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Messaging destinations",
};

export default async function AdminDestinationsPage() {
  const destinations = await getDestinations();

  return (
    <div className="animate-rise-in space-y-5">
      <div>
        <h1 className="text-[1.5rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--text)]">
          Messaging
        </h1>

        <p className="mt-1 text-[14px] text-[var(--text-muted)]">
          Channels and groups the bot is allowed to post to.
        </p>
      </div>

      <nav className="flex gap-1 border-b border-[var(--border)]">
        <Link
          href="/admin/messaging"
          className="px-3 pb-2.5 text-[14px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
        >
          Compose
        </Link>

        <Link
          href="/admin/messaging/history"
          className="px-3 pb-2.5 text-[14px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
        >
          History
        </Link>

        <span className="border-b-2 border-[var(--primary)] px-3 pb-2.5 text-[14px] font-medium text-[var(--text)]">
          Destinations
        </span>
      </nav>

      {/*
        A destination is a messaging target only. Course access is gated by
        Course.telegramChatId, which is edited on the course page and is not
        touched by anything here.
      */}
      <section className="max-w-2xl">
        <DestinationManager items={destinations} />
      </section>
    </div>
  );
}

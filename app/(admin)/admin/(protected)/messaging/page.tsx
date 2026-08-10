import type { Metadata } from "next";
import Link from "next/link";

import MessageComposer from "@/components/admin/messaging/MessageComposer";
import {
  getCourseOptions,
  getDestinations,
} from "@/lib/db/admin/messages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Messaging",
};

export default async function AdminMessagingPage() {
  const [courses, destinations] = await Promise.all([
    getCourseOptions(),
    getDestinations(),
  ]);

  return (
    <div className="animate-rise-in space-y-5">
      <div>
        <h1 className="text-[1.5rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--text)]">
          Messaging
        </h1>

        <p className="mt-1 text-[14px] text-[var(--text-muted)]">
          Send a Telegram message to your students, a course, or a channel.
        </p>
      </div>

      <nav className="flex gap-1 border-b border-[var(--border)]">
        <span className="border-b-2 border-[var(--primary)] px-3 pb-2.5 text-[14px] font-medium text-[var(--text)]">
          Compose
        </span>

        <Link
          href="/admin/messaging/history"
          className="px-3 pb-2.5 text-[14px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
        >
          History
        </Link>

        <Link
          href="/admin/messaging/destinations"
          className="px-3 pb-2.5 text-[14px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
        >
          Destinations
        </Link>
      </nav>

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
        <MessageComposer
          courses={courses}
          destinations={destinations
            .filter((destination) => destination.isActive)
            .map((destination) => ({
              value: destination.id,
              label: `${destination.name} (${destination.type.toLowerCase()})`,
            }))}
        />
      </section>
    </div>
  );
}

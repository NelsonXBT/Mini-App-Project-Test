import type { Metadata } from "next";
import Link from "next/link";

import MessageHistory from "@/components/admin/messaging/MessageHistory";
import { getBroadcastHistory } from "@/lib/db/admin/messages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Message history",
};

export default async function AdminMessageHistoryPage() {
  const messages = await getBroadcastHistory();

  return (
    <div className="animate-rise-in space-y-5">
      <div>
        <h1 className="text-[1.5rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--text)]">
          Messaging
        </h1>

        <p className="mt-1 text-[14px] text-[var(--text-muted)]">
          Every message sent, with its delivery outcome.
        </p>
      </div>

      <nav className="flex gap-1 border-b border-[var(--border)]">
        <Link
          href="/admin/messaging"
          className="px-3 pb-2.5 text-[14px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
        >
          Compose
        </Link>

        <span className="border-b-2 border-[var(--primary)] px-3 pb-2.5 text-[14px] font-medium text-[var(--text)]">
          History
        </span>

        <Link
          href="/admin/messaging/destinations"
          className="px-3 pb-2.5 text-[14px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
        >
          Destinations
        </Link>
      </nav>

      {/* getBroadcastHistory already returns a flattened, JSON-safe shape
          (ISO date strings, denormalised course/destination names), so the
          rows pass straight through to the client component. */}
      <MessageHistory items={messages} />
    </div>
  );
}

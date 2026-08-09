import type { Metadata } from "next";

import CommunityEditor from "@/components/admin/community/CommunityEditor";
import { getAllCommunityChannels } from "@/lib/db/community";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Community",
};

export default async function AdminCommunityPage() {
  const channels = await getAllCommunityChannels();

  return (
    <div className="animate-rise-in space-y-5">
      <div>
        <h1 className="text-[1.5rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--text)]">
          Community
        </h1>

        <p className="mt-1 text-[14px] text-[var(--text-muted)]">
          Channels shown on the student community page. Drag to reorder.
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
        <CommunityEditor
          items={channels.map((channel) => ({
            id: channel.id,
            title: channel.title,
            description: channel.description,
            icon: channel.icon,
            cta: channel.cta,
            url: channel.url,
            isPublished: channel.isPublished,
          }))}
        />
      </section>
    </div>
  );
}

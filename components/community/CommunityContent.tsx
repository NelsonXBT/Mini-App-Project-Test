import CommunityBanner from "./CommunityBanner";
import CommunityCard from "./CommunityCard";

import { communityItems } from "@/lib/constants/community";

export default function CommunityContent() {
  return (
    <div className="space-y-6">

      {/* Telegram Banner */}
      <CommunityBanner />

      {/* Community Channels */}
      <div>

        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
          Community Channels
        </h3>

        <div className="space-y-3">
          {communityItems.map((item) => (
            <CommunityCard
              key={item.id}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>

      </div>

    </div>
  );
}
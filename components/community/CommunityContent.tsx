import CommunityBanner from "./CommunityBanner";
import CommunityCard from "./CommunityCard";

import { communityItems } from "@/lib/constants/community";

export default function CommunityContent() {
  return (
    <div className="space-y-5">

      {/* Telegram Banner */}
      <CommunityBanner />

      {/* Community Channels */}
      <div>

        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
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
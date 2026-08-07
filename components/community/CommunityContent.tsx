import CommunityBanner from "./CommunityBanner";
import CommunityCard from "./CommunityCard";

import { PageTitle } from "@/components/ui";
import { communityItems } from "@/lib/constants/community";

export default function CommunityContent() {
  return (
    <div className="space-y-4">

      {/* Telegram Banner */}
      <CommunityBanner />

      {/* Community Channels */}
      <div>

        <PageTitle as="h2">Community Channels</PageTitle>

        <div className="space-y-2.5">
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
import CommunityCard from "./CommunityCard";
import { communityItems } from "@/lib/constants/community";
import CommunityBanner from "./CommunityBanner";

export default function CommunityContent() {
  return (
  <div className="space-y-6">

    <CommunityBanner />

    <div>
      <h2 className="mb-3 text-lg font-semibold text-zinc-400">
        Community
      </h2>

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
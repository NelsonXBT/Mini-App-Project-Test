import CommunityBanner from "./CommunityBanner";
import CommunityCard from "./CommunityCard";

import { PageTitle } from "@/components/ui";
import { getPublishedCommunityChannels } from "@/lib/db/community";

export default async function CommunityContent() {
  const channels = await getPublishedCommunityChannels();

  return (
    <div className="space-y-4">

      {/* Telegram Banner */}
      <CommunityBanner />

      {/* Community Channels */}
      {channels.length > 0 && (
        <div>

          <PageTitle as="h2">Community Channels</PageTitle>

          <div className="space-y-2.5">
            {channels.map((channel) => (
              <CommunityCard
                key={channel.id}
                icon={channel.icon}
                title={channel.title}
                description={channel.description}
                cta={channel.cta}
                href={channel.url || undefined}
              />
            ))}
          </div>

        </div>
      )}

    </div>
  );
}

import CommunityCard from "./CommunityCard";
import { communityItems } from "@/lib/data";

export default function CommunityContent() {
  return (
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
  );
}
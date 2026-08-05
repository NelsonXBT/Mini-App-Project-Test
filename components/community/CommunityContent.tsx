import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";

import CommunityCard from "./CommunityCard";
import { communityItems } from "@/lib/constants/community";

export default function CommunityContent() {
  return (
    <div className="space-y-5">

      {/* Telegram Banner */}

      {/* Telegram Banner */}

<div
  className="
    overflow-hidden
    rounded-xl
    border
    border-cyan-900/40
    bg-gradient-to-r
    from-cyan-950
    via-cyan-900/80
    to-cyan-800/70
    px-6
    py-4
  "
>
  <h2 className="text-lg font-bold text-white">
    Join Our Telegram Community
  </h2>

  <p className="mt-1 text-xs text-cyan-100/75">
    Connect with creator, get updates and support
  </p>

  <Link
    href="https://t.me/yourcommunity"
    target="_blank"
    className="
      mt-3
      inline-flex
      items-center
      gap-2
      rounded-lg
      bg-cyan-500
      px-4
      py-2
      text-sm
      font-semibold
      text-black
      transition
      hover:bg-cyan-400
    "
  >
    <Send className="h-4 w-4" />
    Join Telegram
  </Link>
</div>

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
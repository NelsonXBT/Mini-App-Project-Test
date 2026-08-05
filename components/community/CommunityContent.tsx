import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";

import CommunityCard from "./CommunityCard";
import { communityItems } from "@/lib/constants/community";

export default function CommunityContent() {
  return (
    <div className="space-y-5">

      {/* Telegram Banner */}

      <div
        className="
          overflow-hidden
          rounded-3xl
          border
          border-cyan-900/40
          bg-gradient-to-r
          from-cyan-950
          via-cyan-900/80
          to-cyan-800/70
          px-6
          py-5
          min-h-[175px]
        "
      >

        <div className="flex items-start justify-between">

          <div>
            <h2 className="text-xl font-bold text-white">
              Join Our Telegram Community
            </h2>

            <p className="mt-2 text-sm leading-6 text-cyan-100/80">
              Connect with students, ask questions,
              receive updates and access exclusive
              announcements.
            </p>
          </div>

          <div className="rounded-2xl bg-cyan-500/15 p-2.5">
            <Send className="h-7 w-7 text-cyan-300" />
          </div>

        </div>

        <Link
          href="https://t.me/yourcommunity"
          target="_blank"
          className="
            mt-5
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-cyan-500
            px-5
            py-3
            font-semibold
            text-black
            transition
            hover:bg-cyan-400
          "
        >
          Join Telegram

          <ArrowRight className="h-4 w-4" />
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
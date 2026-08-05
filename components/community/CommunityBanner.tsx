import Link from "next/link";
import { Send } from "lucide-react";

export default function CommunityBanner() {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-cyan-500/20
        bg-gradient-to-r
        from-cyan-950
        via-cyan-900
        to-cyan-800
        px-6
        py-5
        shadow-[0_0_18px_rgba(6,182,212,.08)]
      "
    >
      {/* Soft background glow */}
      <div className="absolute -right-16 -top-12 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-cyan-300/5 blur-2xl" />

      <div className="relative">

        {/* Title */}

        <h2 className="text-2xl font-bold tracking-tight text-white">
          Join Our Telegram Community
        </h2>

        {/* Description */}

        <p className="mt-2 max-w-xs text-xs leading-5 text-cyan-100/75">
          Connect with creators, get updates and support.
        </p>

        {/* Button */}

        <Link
          href="https://t.me/yourcommunity"
          target="_blank"
          className="
            mt-4
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-cyan-500
            px-5
            py-2.5
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
    </section>
  );
}
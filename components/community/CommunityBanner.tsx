import Link from "next/link";
import { Send } from "lucide-react";

export default function CommunityBanner() {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-cyan-500/20
        bg-gradient-to-r
        from-cyan-950
        via-cyan-900
        to-cyan-800
        px-6
        py-3.5
        shadow-[0_0_20px_rgba(6,182,212,0.08)]
      "
    >
      {/* Background Glow */}
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute -bottom-12 -left-10 h-24 w-24 rounded-full bg-cyan-300/5 blur-2xl" />

      <div className="relative">
        <div className="max-w-full">

          <h2 className="text-lg font-bold text-white whitespace-nowrap">
            Join Our Telegram Community
          </h2>

          <p className="mt-1 text-xs text-cyan-100/80">
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
              rounded-xl
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
      </div>
    </section>
  );
}
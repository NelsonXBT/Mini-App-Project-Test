import Link from "next/link";
import { Send, ArrowRight } from "lucide-react";

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
        py-4
        shadow-[0_0_20px_rgba(6,182,212,0.08)]
      "
    >
      {/* Background Glow */}
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute -bottom-12 -left-10 h-24 w-24 rounded-full bg-cyan-300/5 blur-2xl" />

      <div className="relative flex items-start justify-between">

        {/* Left Content */}
        <div className="max-w-[72%]">

          <h2 className="text-xl font-bold leading-tight text-white">
            Join Our Telegram
            <br />
            Community
          </h2>

          <p className="mt-1.5 text-[13px] leading-5 text-cyan-100/80">
            Connect with students, ask questions,
            receive updates and exclusive course announcements.
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

            <ArrowRight className="h-4 w-4" />
          </Link>

        </div>

        {/* Telegram Icon */}
        <div
          className="
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-white/10
            backdrop-blur-sm
          "
        >
          <Send className="h-8 w-8 text-cyan-300" />
        </div>

      </div>
    </section>
  );
}
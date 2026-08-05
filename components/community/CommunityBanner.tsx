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
    border-cyan-400/30
    bg-gradient-to-r
    from-[#06394A]
    via-[#07546A]
    to-[#0A738D]
    px-4
    py-3

    shadow-[0_0_35px_rgba(34,211,238,0.18),0_10px_35px_rgba(0,0,0,0.45)]

    before:absolute
    before:inset-0
    before:bg-gradient-to-br
    before:from-white/8
    before:to-transparent
    before:pointer-events-none
  "
>
      {/* Background Glow */}
      {/* Background Glow */}

<div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />
<div className="absolute -left-12 -bottom-10 h-32 w-32 rounded-full bg-cyan-500/15 blur-3xl" />

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
            mt-5
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-cyan-400
            px-6
            py-3
            text-[15px]
            font-semibold
            text-black
            shadow-lg
            shadow-cyan-500/40
            transition-all
            duration-200
            hover:bg-cyan-300
            hover:shadow-cyan-400/60
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
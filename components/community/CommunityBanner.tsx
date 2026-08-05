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
        h-44
        px-6
        py-5
        shadow-[0_0_20px_rgba(6,182,212,0.10)]
      "
    >
      {/* Soft Glow */}
      <div className="absolute -right-14 -top-16 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute -left-12 bottom-0 h-28 w-28 rounded-full bg-cyan-300/5 blur-2xl" />

      <div className="relative flex h-full justify-between">

        {/* Left */}
        <div className="flex max-w-[68%] flex-col justify-between">

          <div>
            <h2 className="text-2xl font-bold leading-tight text-white">
              Join Our Telegram
              <br />
              Community
            </h2>

            <p className="mt-2 text-sm leading-5 text-cyan-100/80">
              Connect with students, ask questions and
              receive exclusive course updates.
            </p>
          </div>

          <Link
            href="https://t.me/yourcommunity"
            target="_blank"
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-xl
              bg-cyan-500
              px-5
              py-2.5
              font-semibold
              text-black
              transition
              hover:bg-cyan-400
            "
          >
            Join Telegram
          </Link>

        </div>

        {/* Right */}
        <div
          className="
            flex
            h-20
            w-20
            items-center
            justify-center
            self-start
            rounded-2xl
            bg-white/10
            backdrop-blur-sm
          "
        >
          <Send className="h-10 w-10 text-cyan-300" />
        </div>

      </div>
    </section>
  );
}
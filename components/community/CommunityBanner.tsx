import Link from "next/link";
import { Send } from "lucide-react";

export default function CommunityBanner() {
  /*
   * The one hero on this screen, so it is the one place the brand accent is
   * spent as a field rather than a hairline. The gradient runs oxblood →
   * deep, both already in the palette, so it reads as the same brand in
   * light and dark rather than as a second theme.
   *
   * Text and glyph are pinned to white with ! because --text inverts between
   * themes: left to the token, the copy would go near-black on this panel in
   * light mode and disappear.
   */
  return (
    <section
      className="
        relative
        isolate
        overflow-hidden
        rounded-[var(--radius)]
        bg-linear-to-br
        from-[var(--primary)]
        via-[var(--primary)]
        to-[var(--primary-deep)]
        p-5
        shadow-[var(--shadow-raised)]
      "
    >
      {/*
       * A soft highlight in the top-right corner, the one piece borrowed from
       * the mockup's look. It keeps a large flat fill from reading as a
       * printed block by suggesting a light source.
       */}
      <span
        className="
          pointer-events-none
          absolute
          -right-8
          -top-16
          h-40
          w-40
          rounded-full
          bg-white/10
          blur-2xl
        "
        aria-hidden="true"
      />

      <h2 className="relative text-[1.0625rem] font-semibold leading-snug tracking-[-0.015em] !text-white">
        Join Our Telegram Community
      </h2>

      <p className="relative mt-1.5 text-[13px] leading-relaxed !text-white/80">
        Connect with the creator, get updates and support.
      </p>

      <Link
        href="https://t.me/yourcommunity"
        target="_blank"
        className="
          relative
          mt-4
          inline-flex
          h-11
          items-center
          gap-2
          rounded-[var(--radius-control)]
          bg-white
          px-5
          text-sm
          font-semibold
          tracking-tight
          !text-[var(--primary-deep)]
          shadow-[0_2px_8px_rgba(0,0,0,0.12)]
          transition-all
          duration-200
          ease-out
          hover:bg-white/92
          active:scale-[0.98]
        "
      >
        <Send className="h-4 w-4" strokeWidth={2.1} />
        Join Telegram
      </Link>
    </section>
  );
}

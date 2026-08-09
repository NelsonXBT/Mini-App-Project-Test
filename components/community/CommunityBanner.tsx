import Link from "next/link";
import { Send } from "lucide-react";

export default function CommunityBanner() {
  /*
   * Previously a cyan gradient with two blurred glow orbs and a coloured
   * drop shadow. Reworked to a quiet surface with a single hairline accent,
   * so the gold CTA is the only thing competing for attention.
   */
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[var(--radius)]
        border
        border-[var(--border)]
        bg-[var(--card)]
        p-5
        shadow-[var(--shadow-card)]
      "
    >
      {/* Accent hairline */}

      <span
        className="absolute inset-x-0 top-0 h-px bg-[var(--accent-quiet)]/50"
        aria-hidden="true"
      />

      <h2 className="text-[1.0625rem] font-semibold leading-snug tracking-[-0.015em] text-[var(--text)]">
        Join Our Telegram Community
      </h2>

      <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-muted)]">
        Connect with the creator, get updates and support.
      </p>

      <Link
        href="https://t.me/yourcommunity"
        target="_blank"
        className="
          mt-4
          inline-flex
          h-11
          items-center
          gap-2
          rounded-[var(--radius-control)]
          bg-[var(--primary)]
          px-5
          text-sm
          font-medium
          tracking-tight
          !text-white
          transition-all
          duration-200
          ease-out
          hover:bg-[var(--primary-hover)]
          active:scale-[0.98]
        "
      >
        <Send className="h-4 w-4" strokeWidth={1.9} />
        Join Telegram
      </Link>
    </section>
  );
}

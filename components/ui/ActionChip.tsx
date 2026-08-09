import { ArrowUpRight, ChevronRight } from "lucide-react";

type ActionChipProps = {
  label: string;
  /*
   * External destinations get the outbound arrow, in-app ones the chevron.
   * The glyph is the only difference — a member should be able to tell
   * "this leaves the app" from "this opens a page here" before tapping.
   */
  external?: boolean;
  className?: string;
};

/*
 * The tappable affordance on list cards.
 *
 * These cards live in a Telegram Mini App, which is touch-only — every
 * hover: state the cards previously relied on (lift, raised shadow) never
 * fires there, so a bare chevron was the sole hint that anything was
 * interactive. A labelled chip with a verb and a border reads as a button
 * standing still, with no pointer required.
 *
 * Deliberately not a filled accent button: a list of five of these would
 * put five oxblood blocks on one screen. The chip stays neutral at rest
 * and warms to the accent on press, which is where the feedback matters
 * on touch.
 */
export default function ActionChip({
  label,
  external = false,
  className = "",
}: ActionChipProps) {
  const Glyph = external ? ArrowUpRight : ChevronRight;

  return (
    <span
      className={`
        inline-flex
        h-8
        shrink-0
        items-center
        gap-1
        rounded-[var(--radius-pill)]
        border
        border-[var(--border)]
        bg-[var(--surface-secondary)]
        pl-3
        pr-2.5
        text-[12.5px]
        font-semibold
        tracking-tight
        text-[var(--text)]
        transition-colors
        duration-200
        ease-out
        group-hover:border-[var(--primary-ring)]
        group-hover:bg-[var(--primary-soft)]
        group-hover:text-[var(--primary-text)]
        group-active:border-[var(--primary-ring)]
        group-active:bg-[var(--primary-soft)]
        group-active:text-[var(--primary-text)]
        ${className}
      `}
    >
      {label}

      <Glyph
        className="
          h-3.5
          w-3.5
          shrink-0
          transition-transform
          duration-200
          ease-out
          group-hover:translate-x-0.5
        "
        strokeWidth={2.2}
      />
    </span>
  );
}

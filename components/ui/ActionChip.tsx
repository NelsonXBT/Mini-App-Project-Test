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
 * Now filled in the brand accent rather than neutral-at-rest. The earlier
 * note here argued a filled accent would put five oxblood blocks on one
 * screen — true, but the cost of staying neutral was worse: the chip was the
 * one element meant to look tappable and it read as a static label. At this
 * size it registers as a control without approaching the weight of a
 * full-width button, and it is the only accent-filled thing on the row.
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
        bg-linear-to-b
        from-[var(--primary)]
        to-[var(--primary-deep)]
        pl-3
        pr-2.5
        text-[12.5px]
        font-semibold
        tracking-tight
        !text-white
        shadow-[0_1px_3px_rgba(0,0,0,0.14)]
        transition-all
        duration-200
        ease-out
        group-hover:shadow-[0_2px_8px_rgba(0,0,0,0.18)]
        group-active:scale-[0.97]
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

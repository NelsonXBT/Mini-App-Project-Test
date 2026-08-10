import { ActionChip } from "@/components/ui";
import { communityIcon } from "@/lib/constants/icon-map";

type CommunityCardProps = {
  icon: string;
  title: string;
  description: string;
  cta: string;
  href?: string;
};

export default function CommunityCard({
  icon,
  title,
  description,
  cta,
  href,
}: CommunityCardProps) {
  /*
   * The icon tile picks up a wash of the same hue as its glyph, so a channel
   * reads as having its own colour rather than a grey chip — which also stops
   * three stacked cards from looking like one repeated row.
   */
  const { Glyph, tint, tile, ring, sheen, edge } = communityIcon(icon);

  /*
   * Renders as a real anchor once a destination exists so Telegram opens it
   * natively and the row is reachable by keyboard; falls back to a disabled
   * button while a channel link is still unset, because a card that looks
   * tappable and goes nowhere is worse than one that shows it is not ready.
   */
  const Root = href ? "a" : "button";

  const linkProps = href
    ? { href, target: "_blank" as const, rel: "noopener noreferrer" }
    : { type: "button" as const, disabled: true };

  return (
    <Root
      {...linkProps}
      aria-label={`${cta} — ${title}`}
      className={`
        group
        relative
        isolate
        flex
        w-full
        items-center
        gap-3.5
        overflow-hidden
        rounded-[var(--radius)]
        border
        ${edge}
        bg-[var(--card)]
        px-4
        py-3.5
        text-left
        shadow-[var(--shadow-card)]
        transition-all
        duration-200
        ease-out
        hover:-translate-y-0.5
        hover:shadow-[var(--shadow-raised)]
        active:translate-y-0
        active:scale-[0.985]
        disabled:pointer-events-none
        disabled:opacity-60
      `}
    >
      {/*
       * The wash sits in its own layer rather than on the card.
       *
       * A gradient set as the card's own background would have to be redone
       * for every state — the press tint would land underneath it and never
       * be seen. As a -z-10 sibling it composites over the card's background
       * instead, so :active still reads through and the hue survives both
       * themes without a second definition.
       */}
      <span
        className={`absolute inset-0 -z-10 ${sheen}`}
        aria-hidden="true"
      />

      {/* Icon */}

      <div
        className={`
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-[var(--radius-control)]
          ${tile}
          ${ring}
        `}
      >
        <Glyph className={`h-5 w-5 ${tint}`} strokeWidth={1.9} />
      </div>

      {/* Text */}

      <div className="min-w-0 flex-1">
        {/* Wraps to a second line rather than truncating: on a 320px phone
            the chip leaves roughly 130px here, which clips a title like
            "WhatsApp Community" mid-word. */}
        <h3 className="text-[14px] font-semibold leading-snug tracking-tight text-[var(--text)]">
          {title}
        </h3>

        <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-[var(--text-muted)]">
          {description}
        </p>
      </div>

      <ActionChip label={cta} external />
    </Root>
  );
}

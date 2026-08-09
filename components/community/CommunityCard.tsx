import { MessageCircle, Users, MessageSquareText } from "lucide-react";

import { ActionChip } from "@/components/ui";

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
  const shared = "h-5 w-5";
  const stroke = 1.9;

  /*
   * The icon tile picks up a wash of the same hue as its glyph. It reads as
   * a channel's own colour rather than a grey chip, which also stops three
   * stacked cards from looking like one repeated row.
   */
  const tiles: Record<string, { tile: string; ring: string }> = {
    whatsapp: { tile: "bg-[#3f8f63]/10", ring: "shadow-[inset_0_0_0_1px_rgba(63,143,99,0.18)]" },
    community: { tile: "bg-[#4a6fa8]/10", ring: "shadow-[inset_0_0_0_1px_rgba(74,111,168,0.18)]" },
    support: { tile: "bg-[#c47a3d]/10", ring: "shadow-[inset_0_0_0_1px_rgba(196,122,61,0.18)]" },
  };

  const tile = tiles[icon] ?? {
    tile: "bg-[var(--surface-secondary)]",
    ring: "",
  };

  const renderIcon = () => {
    switch (icon) {
      case "whatsapp":
        return <MessageCircle className={`${shared} text-[#3f8f63]`} strokeWidth={stroke} />;

      case "community":
        return <Users className={`${shared} text-[#4a6fa8]`} strokeWidth={stroke} />;

      case "support":
        return <MessageSquareText className={`${shared} text-[#c47a3d]`} strokeWidth={stroke} />;
    }
  };

  /*
   * Renders as a real anchor once a destination exists so Telegram opens it
   * natively and the row is reachable by keyboard; falls back to a button
   * while a channel link is still unset.
   */
  const Root = href ? "a" : "button";

  const linkProps = href
    ? { href, target: "_blank" as const, rel: "noopener noreferrer" }
    : { type: "button" as const, disabled: true };

  return (
    <Root
      {...linkProps}
      aria-label={`${cta} — ${title}`}
      className="
        group
        flex
        w-full
        items-center
        gap-3.5
        rounded-[var(--radius)]
        border
        border-[var(--border)]
        bg-[var(--card)]
        px-4
        py-3.5
        text-left
        shadow-[var(--shadow-card)]
        transition-all
        duration-200
        ease-out
        hover:-translate-y-0.5
        hover:border-[var(--border-strong)]
        hover:shadow-[var(--shadow-raised)]
        active:translate-y-0
        active:scale-[0.985]
        active:bg-[var(--surface-secondary)]
        disabled:pointer-events-none
        disabled:opacity-60
      "
    >
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
          ${tile.tile}
          ${tile.ring}
        `}
      >
        {renderIcon()}
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

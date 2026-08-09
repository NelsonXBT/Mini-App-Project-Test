import {
  Package,
  ClipboardList,
  FolderOpen,
  Palette,
  Images,
  Rabbit,
  Coins,
  TrendingUp,
  ChartColumn,
} from "lucide-react";

import { ActionChip } from "@/components/ui";

type ResourceCardProps = {
  title: string;
  description: string;
  icon: string;
  /* Sits under the title as quiet meta — file counts, affiliate disclosure. */
  meta?: string;
  cta: string;
  /* Tools leave the app; packs open in it. Drives the chip's glyph. */
  external?: boolean;
  href?: string;
};

export default function ResourceCard({
  title,
  description,
  icon,
  meta,
  cta,
  external = false,
  href,
}: ResourceCardProps) {
  // One size and stroke weight for every icon; the hue is the only variable.
  const shared = "h-5 w-5";
  const stroke = 1.9;

  const renderIcon = () => {
    switch (icon) {
      case "package":
        return <Package className={`${shared} text-[var(--text-muted)]`} strokeWidth={stroke} />;

      case "clipboard":
        return <ClipboardList className={`${shared} text-[#3f8f63]`} strokeWidth={stroke} />;

      case "folder":
        return <FolderOpen className={`${shared} text-[#b8802a]`} strokeWidth={stroke} />;

      case "palette":
        return <Palette className={`${shared} text-[#7a5cc0]`} strokeWidth={stroke} />;

      case "images":
        return <Images className={`${shared} text-[#c47a3d]`} strokeWidth={stroke} />;

      case "rabbit":
        return <Rabbit className={`${shared} text-[var(--text)]`} strokeWidth={stroke} />;

      case "coins":
        return <Coins className={`${shared} text-[#b8802a]`} strokeWidth={stroke} />;

      case "trending":
        return <TrendingUp className={`${shared} text-[#3f8f63]`} strokeWidth={stroke} />;

      case "chart":
        return <ChartColumn className={`${shared} text-[#4a72b8]`} strokeWidth={stroke} />;

      default:
        return <Package className={`${shared} text-[var(--text-muted)]`} strokeWidth={stroke} />;
    }
  };

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
      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-[var(--radius-control)]
          bg-[var(--surface-secondary)]
        "
      >
        {renderIcon()}
      </div>

      <div className="min-w-0 flex-1">
        {/* Wraps rather than truncates — see CommunityCard. */}
        <h3 className="text-[14px] font-semibold leading-snug tracking-tight text-[var(--text)]">
          {title}
        </h3>

        <p className="mt-0.5 line-clamp-1 text-[12px] leading-relaxed text-[var(--text-muted)]">
          {description}
        </p>

        {/*
         * Meta moved under the description and out of the trailing slot.
         * It used to be a pill sitting where the action belongs, which made
         * "Affiliate" look like the thing to tap — it is disclosure, not a
         * call to action, and it now reads as the label it always was.
         */}
        {meta && (
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-subtle)]">
            {meta}
          </p>
        )}
      </div>

      <ActionChip label={cta} external={external} />
    </Root>
  );
}

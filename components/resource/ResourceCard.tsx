import { ActionChip } from "@/components/ui";
import { resourceIcon } from "@/lib/constants/icon-map";

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
  /*
   * Resolved from the shared icon map rather than a switch here.
   *
   * This file used to carry its own copy of the hue table, which meant the
   * admin preview and the student card could drift apart — and it rendered
   * every tile on the same grey, so the colour the map already defined was
   * thrown away. One source now feeds both.
   */
  const { Glyph, tint, tile, ring, sheen, edge } = resourceIcon(icon);

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
      {/* Own layer so the press state still reads through — see CommunityCard. */}
      <span
        className={`absolute inset-0 -z-10 ${sheen}`}
        aria-hidden="true"
      />

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

import { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
  tone?: "default" | "accent";
};

export default function Badge({
  children,
  className = "",
  tone = "default",
}: BadgeProps) {
  /*
   * Badges are the one place a pill shape is intentional —
   * everything else follows the shared card radius.
   *
   * Tone is a prop rather than something callers override via className:
   * two plain utilities of equal specificity are resolved by stylesheet
   * order, not by the order they appear in the attribute, so an appended
   * `text-white` silently lost to the base `text-[var(--text-muted)]` and
   * left accent badges near-unreadable.
   */
  const tones = {
    default:
      "border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-muted)]",
    accent:
      "border-transparent bg-[var(--primary)] text-white",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        rounded-[var(--radius-pill)]
        border
        px-2.5
        py-1
        text-[11px]
        font-semibold
        uppercase
        leading-none
        tracking-[0.04em]
        whitespace-nowrap
        ${tones[tone]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

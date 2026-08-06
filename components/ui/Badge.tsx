import { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export default function Badge({
  children,
  className = "",
}: BadgeProps) {
  /*
   * Badges are the one place a pill shape is intentional —
   * everything else follows the shared card radius.
   */
  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        rounded-[var(--radius-pill)]
        border
        border-[var(--border)]
        bg-[var(--surface-secondary)]
        px-2.5
        py-1
        text-[11px]
        font-medium
        uppercase
        leading-none
        tracking-[0.04em]
        text-[var(--text-muted)]
        whitespace-nowrap
        ${className}
      `}
    >
      {children}
    </span>
  );
}

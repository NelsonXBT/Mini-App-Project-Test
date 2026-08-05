import { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export default function Badge({
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        rounded-lg
        border
        border-[var(--border)]
        bg-[var(--surface-secondary)]
        px-3
        py-1
        text-xs
        font-medium
        leading-none
        text-[var(--text-muted)]
        whitespace-nowrap
        ${className}
      `}
    >
      {children}
    </span>
  );
}
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
        rounded-full
        border
        border-[var(--border)]
        bg-[var(--surface-secondary)]
        px-3
        py-1
        text-xs
        font-medium
        text-[var(--text-muted)]
        ${className}
      `}
    >
      {children}
    </span>
  );
}
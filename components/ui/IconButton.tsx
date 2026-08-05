import { ButtonHTMLAttributes } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function IconButton({
  className = "",
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      className={`
        inline-flex
        h-11
        w-11
        items-center
        justify-center
        rounded-lg
        border
        border-[var(--border)]
        bg-[var(--card)]
        text-[var(--text-muted)]
        transition-colors
        duration-200
        hover:bg-[var(--surface-secondary)]
        hover:text-[var(--text)]
        disabled:pointer-events-none
        disabled:opacity-50
        ${className}
      `}
    >
      {children}
    </button>
  );
}
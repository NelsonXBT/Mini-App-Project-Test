import Link from "next/link";
import { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

export default function Button({
  children,
  href,
  onClick,
  className = "",
  variant = "primary",
  disabled = false,
  type = "button",
}: ButtonProps) {
  /*
   * One height (44px), one radius, one padding scale for every
   * variant so buttons line up wherever they sit next to each other.
   * active:scale is set here as well as globally, because the href
   * form renders an <a> and never picks up the global button rule.
   */
  const baseStyles = `
    inline-flex
    h-11
    items-center
    justify-center
    gap-2
    rounded-[var(--radius-control)]
    px-5
    text-sm
    font-medium
    tracking-tight
    transition-all
    duration-200
    ease-out
    active:scale-[0.98]
    disabled:opacity-50
    disabled:pointer-events-none
  `;

  const variants = {
    primary: `
      bg-[var(--primary)]
      text-white
      hover:bg-[var(--primary-hover)]
    `,

    secondary: `
      border
      border-[var(--border)]
      bg-[var(--card)]
      text-[var(--text)]
      hover:border-[var(--border-strong)]
      hover:bg-[var(--surface-secondary)]
    `,

    ghost: `
      bg-transparent
      text-[var(--text-muted)]
      hover:bg-[var(--surface-secondary)]
      hover:text-[var(--text)]
    `,
  };

  const styles = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={styles}
    >
      {children}
    </button>
  );
}

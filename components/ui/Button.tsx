import Link from "next/link";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
};

export default function Button({
  children,
  href,
  onClick,
  className = "",
  variant = "primary",
  disabled = false,
  loading = false,
  type = "button",
}: ButtonProps) {
  /*
   * One height, one radius, one padding scale across variants so buttons
   * align wherever they sit together.
   *
   * The press feedback is set here rather than relying on the global
   * button:active rule, because the href form renders an <a> and never
   * picks that rule up.
   */
  const baseStyles = `
    inline-flex
    h-11
    select-none
    items-center
    justify-center
    gap-2
    rounded-[var(--radius-control)]
    px-5
    text-[14px]
    font-medium
    tracking-tight
    transition-all
    duration-150
    ease-out
    active:scale-[0.97]
    disabled:pointer-events-none
    disabled:opacity-45
  `;

  const variants = {
    // Inset highlight on top, tighter shadow below: reads as a physical
    // surface rather than a filled rectangle.
    //
    // text-white is marked !important because the href form renders an <a>,
    // and the base link reset (`color: inherit`) would otherwise leave the
    // label inheriting the card's dark text on the oxblood fill.
    primary: `
      bg-[var(--primary)]
      !text-white
      shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_1px_2px_rgba(28,18,18,0.18)]
      hover:bg-[var(--primary-hover)]
      active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.14)]
    `,

    secondary: `
      border
      border-[var(--border)]
      bg-[var(--card)]
      text-[var(--text)]
      shadow-[var(--shadow-card)]
      hover:border-[var(--border-strong)]
      active:bg-[var(--surface-secondary)]
      active:shadow-none
    `,

    ghost: `
      bg-transparent
      text-[var(--text-muted)]
      hover:text-[var(--text)]
      active:bg-[var(--surface-secondary)]
    `,
  };

  const styles = `${baseStyles} ${variants[variant]} ${className}`;

  const content = loading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.2} />
      {children}
    </>
  ) : (
    children
  );

  if (href) {
    return (
      <Link href={href} className={styles}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={styles}
    >
      {content}
    </button>
  );
}

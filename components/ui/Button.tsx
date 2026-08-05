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
  const baseStyles = `
    inline-flex
    items-center
    justify-center
    gap-2
    rounded-lg
    px-5
    py-3
    text-sm
    font-medium
    transition-colors
    duration-200
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
      hover:bg-[var(--surface-secondary)]
    `,

    ghost: `
      bg-transparent
      text-[var(--text)]
      hover:bg-[var(--surface-secondary)]
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
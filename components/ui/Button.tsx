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
    rounded-[18px]
    px-5
    py-3
    text-sm
    font-semibold
    transition-all
    duration-200
    active:scale-[0.98]
  `;

  const variants = {
    primary: `
      bg-[var(--primary)]
      text-white
      hover:bg-[var(--primary-hover)]
      shadow-[var(--shadow-button)]
    `,

    secondary: `
      bg-[var(--surface-secondary)]
      text-[var(--text)]
      border
      border-[var(--border)]
      hover:bg-[var(--card-hover)]
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
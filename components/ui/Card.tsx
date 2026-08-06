import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        rounded-[var(--radius)]
        border
        border-[var(--border)]
        bg-[var(--card)]
        shadow-[var(--shadow-card)]
        transition-all
        duration-200
        ease-out
        ${className}
      `}
    >
      {children}
    </div>
  );
}

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
        rounded-[24px]
        border
        border-[var(--border)]
        bg-[var(--card)]
        shadow-[var(--shadow-card)]
        transition-all
        duration-200
        ${className}
      `}
    >
      {children}
    </div>
  );
}
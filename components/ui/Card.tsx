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
        rounded-xl
        border
        border-[var(--border)]
        bg-[var(--card)]
        transition-colors
        duration-200
        ${className}
      `}
    >
      {children}
    </div>
  );
}
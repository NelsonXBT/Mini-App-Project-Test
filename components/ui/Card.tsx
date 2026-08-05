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
        rounded-[28px]
        border
        border-stone-200/80
        bg-white
        shadow-[0_12px_40px_rgba(15,23,42,0.06)]
        transition-all
        duration-300
        hover:-translate-y-[1px]
        hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}
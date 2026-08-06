import { ReactNode } from "react";

type SectionTitleProps = {
  children: ReactNode;
  className?: string;
};

export default function SectionTitle({
  children,
  className = "",
}: SectionTitleProps) {
  return (
    <h2
      className={`
        text-[1.0625rem]
        font-semibold
        leading-snug
        tracking-[-0.015em]
        text-[var(--text)]
        ${className}
      `}
    >
      {children}
    </h2>
  );
}

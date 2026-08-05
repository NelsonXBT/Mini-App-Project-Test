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
        text-lg
        font-semibold
        tracking-tight
        text-[var(--text)]
        ${className}
      `}
    >
      {children}
    </h2>
  );
}
import { ReactNode } from "react";

type PageTitleProps = {
  children: ReactNode;
  className?: string;
};

export default function PageTitle({
  children,
  className = "",
}: PageTitleProps) {
  return (
    <h1
      className={`
        text-[1.625rem]
        font-semibold
        leading-tight
        tracking-[-0.025em]
        text-[var(--text)]
        ${className}
      `}
    >
      {children}
    </h1>
  );
}

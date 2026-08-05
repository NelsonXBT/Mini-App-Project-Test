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
        text-4xl
        font-bold
        tracking-tight
        text-[var(--text)]
        ${className}
      `}
    >
      {children}
    </h1>
  );
}
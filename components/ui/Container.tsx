import { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "full";
};

export default function Container({
  children,
  className = "",
  size = "lg",
}: ContainerProps) {
  const widths = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-3xl",
    full: "max-w-none",
  };

  return (
    <div
      className={`
        mx-auto
        w-full
        ${widths[size]}
        px-5
        ${className}
      `}
    >
      {children}
    </div>
  );
}
import { HTMLAttributes } from "react";

type SurfaceProps = HTMLAttributes<HTMLDivElement>;

export default function Surface({
  className = "",
  children,
  ...props
}: SurfaceProps) {
  return (
    <div
      {...props}
      className={`
        rounded-3xl
        border
        border-stone-200
        bg-white
        shadow-[0_10px_35px_rgba(0,0,0,0.06)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}
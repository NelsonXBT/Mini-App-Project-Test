import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

/*
 * The single card primitive for the whole app. Elevation comes from the
 * --shadow-card token (hairline ring + soft depth), not from the border, so
 * cards sit a layer above the background instead of drawing rectangles on it.
 */
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

import { ReactNode } from "react";

type PageTitleProps = {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2";
};

/*
 * The section label used at the top of every student surface and above each
 * group within one.
 *
 * Deliberately small and quiet: the cards below carry the visual weight, and
 * a full-size page heading on a phone costs a chunk of vertical space while
 * repeating what the bottom nav already says. Grouping comes from the label
 * sitting tight against its content (mb-2.5), not from its size.
 */
export default function PageTitle({
  children,
  className = "",
  as: Tag = "h1",
}: PageTitleProps) {
  return (
    <Tag
      className={`
        mb-2.5
        px-0.5
        text-[13px]
        font-semibold
        uppercase
        tracking-[0.08em]
        text-[var(--text-subtle)]
        ${className}
      `}
    >
      {children}
    </Tag>
  );
}

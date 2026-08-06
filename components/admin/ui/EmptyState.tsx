import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`
        flex
        flex-col
        items-center
        justify-center
        rounded-[var(--radius)]
        border
        border-dashed
        border-[var(--border-strong)]
        bg-[var(--surface-secondary)]
        px-6
        py-10
        text-center
        ${className}
      `}
    >
      {Icon && (
        <div
          className="
            mb-3
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-[var(--radius-control)]
            border
            border-[var(--border)]
            bg-[var(--card)]
          "
        >
          <Icon
            className="h-[18px] w-[18px] text-[var(--text-subtle)]"
            strokeWidth={1.9}
          />
        </div>
      )}

      <p className="text-[14px] font-medium tracking-tight text-[var(--text)]">
        {title}
      </p>

      {description && (
        <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-[var(--text-muted)]">
          {description}
        </p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

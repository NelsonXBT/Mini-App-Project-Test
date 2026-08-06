import { LucideIcon } from "lucide-react";

type StatsCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
};

export default function StatsCard({
  label,
  value,
  icon: Icon,
  hint,
}: StatsCardProps) {
  return (
    <div
      className="
        rounded-[var(--radius)]
        border
        border-[var(--border)]
        bg-[var(--card)]
        p-4
        shadow-[var(--shadow-card)]
        transition-all
        duration-200
        ease-out
        hover:border-[var(--border-strong)]
        hover:shadow-[var(--shadow-raised)]
      "
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-[var(--text-subtle)]">
          {label}
        </p>

        <span
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-[var(--radius-control)]
            bg-[var(--primary-soft)]
          "
        >
          <Icon
            className="h-4 w-4 text-[var(--primary)]"
            strokeWidth={1.9}
          />
        </span>
      </div>

      <p className="mt-3 text-[1.75rem] font-semibold leading-none tracking-[-0.025em] tabular-nums text-[var(--text)]">
        {value}
      </p>

      {hint && (
        <p className="mt-1.5 text-[12px] text-[var(--text-subtle)]">
          {hint}
        </p>
      )}
    </div>
  );
}

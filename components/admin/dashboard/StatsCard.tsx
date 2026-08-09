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
        p-5
        shadow-[var(--shadow-panel)]
        transition-all
        duration-200
        ease-out
        hover:-translate-y-px
        hover:border-[var(--border-strong)]
        hover:shadow-[var(--shadow-panel-raised)]
      "
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12.5px] font-semibold uppercase tracking-[0.1em] text-[var(--text-subtle)]">
          {label}
        </p>

        <span
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-[var(--radius-control)]
            bg-[var(--primary-soft)]
            shadow-[inset_0_0_0_1px_var(--primary-ring)]
          "
        >
          <Icon
            className="h-[17px] w-[17px] text-[var(--primary-text)]"
            strokeWidth={2}
          />
        </span>
      </div>

      <p className="mt-3.5 text-[2rem] font-bold leading-none tracking-[-0.03em] tabular-nums text-[var(--text)]">
        {value}
      </p>

      {hint && (
        <p className="mt-2 text-[12.5px] text-[var(--text-subtle)]">
          {hint}
        </p>
      )}
    </div>
  );
}

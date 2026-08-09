type StatusBadgeProps = {
  published: boolean;
  className?: string;
};

export default function StatusBadge({
  published,
  className = "",
}: StatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-[var(--radius-pill)]
        border
        px-2.5
        py-1
        text-[12px]
        font-medium
        uppercase
        leading-none
        tracking-[0.04em]
        whitespace-nowrap
        ${
          published
            ? "border-[var(--success)]/25 bg-[var(--success)]/10 text-[var(--success)]"
            : "border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-muted)]"
        }
        ${className}
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-[var(--radius-pill)]
          ${published ? "bg-[var(--success)]" : "bg-[var(--text-subtle)]"}
        `}
        aria-hidden="true"
      />
      {published ? "Published" : "Draft"}
    </span>
  );
}

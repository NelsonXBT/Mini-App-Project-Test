type ProgressProps = {
  value: number;
  className?: string;
};

export default function Progress({
  value,
  className = "",
}: ProgressProps) {
  const progress = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className={`
        h-1.5
        w-full
        overflow-hidden
        rounded-[var(--radius-pill)]
        bg-[var(--surface-secondary)]
        ${className}
      `}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="
          h-full
          rounded-[var(--radius-pill)]
          bg-[var(--primary)]
          transition-[width]
          duration-500
          ease-out
        "
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}

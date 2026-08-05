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
        h-2
        w-full
        overflow-hidden
        rounded-full
        bg-[var(--surface-secondary)]
        ${className}
      `}
    >
      <div
        className="
          h-full
          rounded-full
          bg-[var(--primary)]
          transition-all
          duration-500
        "
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}
type CourseProgressProps = {
  completed: number;
  total: number;
  progress: number;
};

export default function CourseProgress({
  completed,
  total,
  progress,
}: CourseProgressProps) {
  return (
    <section className="flex items-center gap-3">
      {/* Progress Bar */}

      <div
        className="h-1.5 flex-1 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--surface-secondary)]"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-[var(--radius-pill)] bg-[var(--primary)] transition-[width] duration-500 ease-out"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      {/* Percentage */}

      <span
        className="
          min-w-[38px]
          text-right
          text-[13px]
          font-semibold
          tabular-nums
          text-[var(--text-muted)]
        "
      >
        {progress}%
      </span>
    </section>
  );
}
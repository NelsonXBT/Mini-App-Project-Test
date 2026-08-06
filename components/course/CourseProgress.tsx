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
    <section className="flex items-center gap-3 pt-1">
      {/* Progress Bar */}

      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      {/* Percentage */}

      <span
        className="
          min-w-[42px]
          text-right
          text-sm
          font-semibold
          text-[var(--text)]
        "
      >
        {progress}%
      </span>
    </section>
  );
}
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
    <section
      className="
        rounded-xl
        border
        border-[var(--border)]
        bg-[var(--card)]
        px-5
        py-4
      "
    >
      {/* Header */}

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--text-muted)]">
          Course Progress
        </p>

        <span className="text-base font-semibold text-[var(--text)]">
          {progress}%
        </span>
      </div>

      {/* Progress Bar */}

      <div className="h-2 overflow-hidden rounded-full bg-stone-200">
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      {/* Footer */}

      <p className="mt-3 text-sm text-[var(--text-muted)]">
        {completed} of {total} lessons completed
      </p>
    </section>
  );
}
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
        rounded-3xl
        border
        border-[var(--border)]
        bg-[var(--card)]
        p-5
      "
    >
      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-[var(--text-muted)]">
            Course Progress
          </p>

          <h3 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--text)]">
            {progress}%
          </h3>
        </div>

        <div
          className="
            rounded-full
            bg-[var(--surface-secondary)]
            px-3
            py-1
          "
        >
          <span className="text-xs font-medium text-[var(--text-muted)]">
            {completed}/{total} Lessons
          </span>
        </div>

      </div>

      <div className="mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-stone-200">
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <p className="mt-4 text-sm text-[var(--text-muted)]">
        {completed} of {total} lessons completed
      </p>
    </section>
  );
}
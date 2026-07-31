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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-300">
          Course Progress
        </span>

        <span className="text-sm font-semibold text-cyan-400">
          {progress}%
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-cyan-400"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-zinc-500">
        {completed} of {total} lessons completed
      </p>
    </div>
  );
}
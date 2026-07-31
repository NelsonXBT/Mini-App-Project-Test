type LessonMetaProps = {
  duration: number;
  completed: boolean;
};

export default function LessonMeta({
  duration,
  completed,
}: LessonMetaProps) {
  const formattedDuration =
    duration > 0
      ? `${Math.ceil(duration / 60)} min`
      : "—";

  return (
    <div className="mt-6 flex gap-6 text-sm text-gray-400">
      <span>⏱ {formattedDuration}</span>

      <span>
        {completed
          ? "✅ Completed"
          : "⭕ Not Completed"}
      </span>
    </div>
  );
}
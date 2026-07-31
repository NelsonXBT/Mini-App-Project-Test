type LessonMetaProps = {
  duration: string;
  completed: boolean;
};

export default function LessonMeta({
  duration,
  completed,
}: LessonMetaProps) {
  return (
    <div className="mt-6 flex gap-6 text-sm text-gray-400">
      <span>⏱ {duration}</span>

      <span>
        {completed
          ? "✅ Completed"
          : "⭕ Not Completed"}
      </span>
    </div>
  );
}
type LessonInfoProps = {
  lessonNumber: number;
  totalLessons: number;
  title: string;
};

export default function LessonInfo({
  lessonNumber,
  totalLessons,
  title,
}: LessonInfoProps) {
  return (
    <section className="space-y-2">
      <p className="text-sm font-medium text-cyan-400">
        Lesson {lessonNumber}/{totalLessons}
      </p>

      <h2 className="text-2xl font-bold leading-tight text-white">
        {title}
      </h2>
    </section>
  );
}
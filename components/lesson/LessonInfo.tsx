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
    <section className="mt-6">
      <p className="text-sm text-zinc-400">
        Lesson {lessonNumber} of {totalLessons}
      </p>

      <h2 className="mt-2 text-3xl font-bold text-white">
        {title}
      </h2>
    </section>
  );
}
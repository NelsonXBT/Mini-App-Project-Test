import { Badge } from "@/components/ui";

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
    <section className="space-y-3">

      <Badge>
        LESSON {lessonNumber} OF {totalLessons}
      </Badge>

      <h2
        className="
          text-[1.65rem]
          font-semibold
          leading-tight
          tracking-tight
          text-[var(--text)]
        "
      >
        {title}
      </h2>

    </section>
  );
}
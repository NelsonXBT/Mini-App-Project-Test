import { SectionTitle } from "@/components/ui";

type LessonDescriptionProps = {
  description: string;
};

export default function LessonDescription({
  description,
}: LessonDescriptionProps) {
  if (!description.trim()) {
    return null;
  }

  return (
    <section className="space-y-3">
      <SectionTitle>Description</SectionTitle>

      <p
        className="
          text-[15px]
          leading-7
          text-[var(--text-muted)]
        "
      >
        {description}
      </p>
    </section>
  );
}
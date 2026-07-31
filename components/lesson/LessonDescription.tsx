type LessonDescriptionProps = {
  description: string;
};

export default function LessonDescription({
  description,
}: LessonDescriptionProps) {
  return (
    <section className="space-y-2">
      <p className="text-[15px] leading-6 text-zinc-400">
        {description}
      </p>
    </section>
  );
}
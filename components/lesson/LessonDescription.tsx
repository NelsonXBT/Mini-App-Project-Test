export default function LessonDescription({
  description,
}: {
  description: string;
}) {
  return (
    <section>
      <h3 className="mb-3 text-lg font-semibold text-white">
        Description
      </h3>

      <p className="leading-7 text-zinc-400">
        {description}
      </p>
    </section>
  );
}
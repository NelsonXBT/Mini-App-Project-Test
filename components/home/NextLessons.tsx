import { nextLessons } from "@/lib/data";

export default function NextLessons() {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold mb-4">
        Next Lessons
      </h2>

      <div className="space-y-3">
        {nextLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-zinc-900 rounded-xl p-4"
          >
            <p className="font-semibold">
              {lesson.title}
            </p>

            <p className="text-sm text-gray-400">
              {lesson.lesson}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
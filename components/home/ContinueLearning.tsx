import { currentCourse } from "@/lib/data";
import Link from "next/link";



export default function ContinueLearning() {
  return (
    <Link href="/courses/1">
    <section className="mt-2 rounded-2xl bg-zinc-900 p-5 cursor-pointer">

      <p className="text-sm text-gray-400">
        Continue Learning
      </p>

      <h2 className="mt-2 text-xl font-bold">
        {currentCourse.title}
      </h2>

      <p className="mt-4 text-gray-400">
        {currentCourse.currentLesson}
      </p>

      <p className="mt-4 text-cyan-400">
        {currentCourse.progress}% ━━━━━━━━━━
      </p>

      <button className="mt-5 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-black">
        Continue
      </button>

    </section>
</Link>
  );
}
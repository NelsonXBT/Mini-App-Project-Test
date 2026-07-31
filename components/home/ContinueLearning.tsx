import Image from "next/image";
import Link from "next/link";
import { currentCourse } from "@/lib/data";

export default function ContinueLearning() {
  return (
    <section className="mt-3">
      <h2 className="mb-4 text-lg font-semibold text-zinc-400">
        Continue Learning
      </h2>

      <div className="rounded-3xl bg-zinc-900 p-4">
        {/* Top Section */}
        <div className="flex gap-4">
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
            <Image
              src={currentCourse.thumbnail}
              alt={currentCourse.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-1 flex-col">
            <h3 className="line-clamp-2 text-lg font-semibold text-white">
              {currentCourse.title}
            </h3>

           <p className="mt-2 line-clamp-2 text-sm text-zinc-300">
                {currentCourse.currentLesson}
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Lesson {currentCourse.lesson} of{" "}
                {currentCourse.totalLessons}
              </p>

            <div className="mt-auto flex items-center gap-2 pt-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-700">
                <div
                  className="h-full rounded-full bg-cyan-500"
                  style={{
                    width: `${currentCourse.progress}%`,
                  }}
                />
              </div>

              <span className="text-sm font-medium text-cyan-400">
                {currentCourse.progress}%
              </span>
            </div>
          </div>
        </div>

        {/* Button */}
        <Link
          href={`/courses/${currentCourse.id}`}
          className="mt-5 block rounded-xl bg-cyan-500 py-3 text-center font-semibold text-black transition hover:bg-cyan-400"
        >
          Continue Lesson
        </Link>
      </div>
    </section>
  );
}
import Image from "next/image";
import Link from "next/link";

import { getHomeLearningCard } from "@/lib/db/home";

export default async function HomeLearningCard() {
  const learningCard =
    await getHomeLearningCard();

  if (!learningCard) {
    return null;
  }

  const {
    mode,
    course,
    lesson,
    totalLessons,
    completedLessons,
    progress,
  } = learningCard;

  

  switch (mode) {
    case "start":
      return (
        <section className="mt-3">
          {/* <h2 className="mb-4 text-lg font-semibold text-zinc-400">
            Start Learning
          </h2> */}

          <div className="rounded-3xl bg-zinc-900 p-4">
            <div className="flex gap-4">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={
                    course.thumbnail ??
                    "/thumbnails/coursethumbnail.png"
                  }
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col">
                <h3 className="line-clamp-2 text-lg font-semibold text-white">
                  {course.title}
                </h3>

                <p className="mt-2 text-sm text-zinc-400">
                  {totalLessons} Lessons
                </p>

                <div className="mt-auto pt-3">
                  <span className="text-sm font-medium text-cyan-400">
                    Ready to begin
                  </span>
                </div>
              </div>
            </div>

            <Link
              href={`/courses/${course.slug}/lessons/${lesson.id}`}
              className="mt-5 block rounded-xl bg-cyan-500 py-3 text-center font-semibold text-black transition hover:bg-cyan-400"
            >
              Start Learning
            </Link>
          </div>
        </section>
      );

    case "recommend":
          return (
            <section className="mt-3">
              <h2 className="mb-4 text-lg font-semibold text-zinc-400">
                Recommended For You
              </h2>

              <div className="rounded-3xl bg-zinc-900 p-4">
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={
                        course.thumbnail ??
                        "/thumbnails/coursethumbnail.png"
                      }
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col">
                    <h3 className="line-clamp-2 text-lg font-semibold text-white">
                      {course.title}
                    </h3>

                    <p className="mt-2 text-sm text-zinc-400">
                      {totalLessons} Lessons
                    </p>

                    <div className="mt-auto pt-3">
                      <span className="text-sm font-medium text-cyan-400">
                        Expand your AI filmmaking skills
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/courses/${course.slug}`}
                  className="mt-5 block rounded-xl bg-cyan-500 py-3 text-center font-semibold text-black transition hover:bg-cyan-400"
                >
                  Explore Course
                </Link>
              </div>
            </section>
          );

    case "continue":
    default:
      return (
        <section className="mt-3">
          <h2 className="mb-4 text-lg font-semibold text-zinc-400">
              {mode === "start"
                ? "Start Learning"
                : mode === "recommend"
                ? "Recommended For You"
                : "Continue Learning"}
            </h2>

          <div className="rounded-3xl bg-zinc-900 p-4">
            <div className="flex gap-4">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={
                    course.thumbnail ??
                    "/thumbnails/coursethumbnail.png"
                  }
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col">
                {/* <h3 className="line-clamp-2 text-lg font-semibold text-white">
                  {course.title}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm text-zinc-300">
                  {mode === "start"
                    ? `${totalLessons} Lessons`
                    : mode === "recommend"
                    ? "Discover something new"
                    : lesson.title}
                </p> */}

                {mode === "continue" ? (
                    <p className="mt-2 text-sm text-zinc-500">
                      Lesson {completedLessons + 1} of {totalLessons}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm font-medium text-cyan-400">
                      {mode === "start"
                        ? "Ready to begin"
                        : "Available now"}
                    </p>
                  )}

                <div className="mt-auto flex items-center gap-2 pt-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-700">
                    <div
                      className="h-full rounded-full bg-cyan-500"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  <span className="text-sm font-medium text-cyan-400">
                    {progress}%
                  </span>
                </div>
              </div>
            </div>

            <Link
              href={`/courses/${course.slug}/lessons/${lesson.id}`}
              className="mt-5 block rounded-xl bg-cyan-500 py-3 text-center font-semibold text-black transition hover:bg-cyan-400"
            >
              Continue Lesson
            </Link>
          </div>
        </section>
      );
  }
}
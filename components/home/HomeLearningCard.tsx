import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";

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

          <div
                className="
                  overflow-hidden
                  rounded-3xl
                  border
                  border-zinc-800
                  bg-zinc-900
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-cyan-500
                  hover:shadow-[0_0_25px_rgba(6,182,212,.12)]
                "
              >

            {/* Thumbnail */}
            <div className="relative h-36 w-full overflow-hidden">
              <Image
                src={
                  course.thumbnail ??
                  "/thumbnails/coursethumbnail.png"
                }
                alt={course.title}
                fill
                className="object-cover object-center"
              />
            </div>

            <div className="p-4">

              <h3 className="line-clamp-2 text-lg font-semibold text-white">
                {course.title}
              </h3>

              <div className="mt-4 flex items-center justify-between">

                <div className="flex items-center gap-2 text-zinc-400">
                  <BookOpen className="h-5 w-5 text-cyan-400" />

                  <span className="text-sm">
                    {totalLessons} Lessons
                  </span>
                </div>

                <span
                  className="
                    rounded-full
                    border
                    border-cyan-500
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-cyan-400
                    shadow-[0_0_14px_rgba(6,182,212,.18)]
                  "
                >
                  Ready
                </span>

              </div>

              <Link
                href={`/courses/${course.slug}/lessons/${lesson.id}`}
                className="
                  mt-5
                  block
                  rounded-xl
                  bg-cyan-500
                  py-3
                  text-center
                  font-semibold
                  text-black
                "
              >
                Start Learning
              </Link>

            </div>

          </div>
        </section>
      );

    case "recommend":
          return (
  <section className="mt-3">

    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-cyan-500
        hover:shadow-[0_0_25px_rgba(6,182,212,.12)]
      "
    >

      <div className="relative h-36 w-full overflow-hidden">
        <Image
          src={
            course.thumbnail ??
            "/thumbnails/coursethumbnail.png"
          }
          alt={course.title}
          fill
          className="object-cover object-center"
        />
      </div>

      <div className="p-4">

        <h3 className="line-clamp-2 text-lg font-semibold text-white">
          {course.title}
        </h3>

        <div className="mt-4 flex items-center justify-between">

          <div className="flex items-center gap-2 text-zinc-400">
            <BookOpen className="h-5 w-5 text-cyan-400" />

            <span className="text-sm">
              {totalLessons} Lessons
            </span>
          </div>

          <span
            className="
              rounded-full
              border
              border-cyan-500
              px-3
              py-1
              text-xs
              font-semibold
              text-cyan-400
              shadow-[0_0_14px_rgba(6,182,212,.18)]
            "
          >
            New
          </span>

        </div>

        <Link
          href={`/courses/${course.slug}`}
          className="
            mt-5
            block
            rounded-xl
            bg-cyan-500
            py-3
            text-center
            font-semibold
            text-black
          "
        >
          Open Course
        </Link>

      </div>

    </div>

  </section>
);

    case "continue":
    default:
      return (
  <section className="mt-3">

    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-cyan-500
        hover:shadow-[0_0_25px_rgba(6,182,212,.12)]
      "
    >

      <div className="relative h-36 w-full overflow-hidden">
        <Image
          src={
            course.thumbnail ??
            "/thumbnails/coursethumbnail.png"
          }
          alt={course.title}
          fill
          className="object-cover object-center"
        />
      </div>

      <div className="p-4">

        <h3 className="line-clamp-2 text-lg font-semibold text-white">
          {course.title}
        </h3>

        <div className="mt-4 flex items-center justify-between">

          <div className="flex items-center gap-2 text-zinc-400">
            <BookOpen className="h-5 w-5 text-cyan-400" />

            <span className="text-sm">
              Lesson {completedLessons + 1} of {totalLessons}
            </span>
          </div>

          <span className="text-sm font-semibold text-cyan-400">
            {progress}%
          </span>

        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-cyan-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <Link
          href={`/courses/${course.slug}/lessons/${lesson.id}`}
          className="
            mt-5
            block
            rounded-xl
            bg-cyan-500
            py-3
            text-center
            font-semibold
            text-black
          "
        >
          Continue Lesson
        </Link>

      </div>

    </div>

  </section>
);  }
}
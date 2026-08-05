import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@prisma/client";

type Course = Prisma.CourseGetPayload<{
  include: {
    modules: {
      include: {
        lessons: true;
      };
    };
  };
}>;

type CourseCardProps = {
  course: Course;
};

export default function CourseCard({
  course,
}: CourseCardProps) {
  const lessonCount = course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );

  
   return (
  <Link
    href={`/courses/${course.slug}`}
    className="block"
  >
    <article
      className="
        overflow-hidden
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900
        transition-all
        duration-300
        hover:border-cyan-500
        hover:shadow-[0_0_25px_rgba(6,182,212,.12)]
      "
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden">
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

      {/* Content */}
      <div className="p-5">
        <h2 className="text-2xl font-bold leading-tight text-white">
          {course.title}
        </h2>

        <div className="mt-5 flex items-center justify-between">

          <div className="text-sm font-medium text-zinc-400">
            📖 {lessonCount} Lesson
            {lessonCount !== 1 ? "s" : ""}
          </div>

          <div
            className={`
              rounded-full
              border
              px-4
              py-1.5
              text-sm
              font-semibold
              ${
                course.isFree
                  ? "border-cyan-500 text-cyan-400 shadow-[0_0_16px_rgba(6,182,212,.18)]"
                  : "border-zinc-700 text-zinc-400"
              }
            `}
          >
            {course.isFree ? "Open" : "Locked"}
          </div>

        </div>
      </div>
    </article>
  </Link>
);
  
}
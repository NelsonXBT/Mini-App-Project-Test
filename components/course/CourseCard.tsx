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
      <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3 transition-all duration-300 hover:border-cyan-500 hover:bg-zinc-800">
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="relative h-24 w-28 flex-shrink-0 overflow-hidden rounded-xl">
            <Image
              src={course.thumbnail ?? "/thumbnails/coursethumbnail.png"}
              alt={course.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col">
            <h2 className="line-clamp-2 text-lg font-bold leading-tight text-white">
              {course.title}
            </h2>

            <p className="mt-1 line-clamp-2 text-sm leading-5 text-zinc-400">
              {course.description ?? "No description available."}
            </p>

            <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
              <span>
                {lessonCount} Lesson{lessonCount !== 1 ? "s" : ""}
              </span>

              <span>
                {course.isFree
                  ? "Free"
                  : `₦${course.price?.toString() ?? "0"}`}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { BookOpen, Lock, LockOpen } from "lucide-react";

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

  // Temporary
  const isOpen = course.isFree;

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
          hover:-translate-y-0.5
          hover:border-cyan-500
          hover:shadow-[0_0_25px_rgba(6,182,212,.12)]
        "
      >
        {/* Thumbnail */}
        <div className="relative h-40 w-full overflow-hidden">
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
        <div className="p-4">
          <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-white">
            {course.title}
          </h2>

          <div className="mt-4 flex items-center justify-between">

            <div className="flex items-center gap-2 text-zinc-400">
              <BookOpen className="h-5 w-5 text-cyan-400" />

              <span className="text-sm font-medium">
                {lessonCount} Lesson
                {lessonCount !== 1 ? "s" : ""}
              </span>
            </div>

            <div
              className={`
                flex items-center gap-1.5
                rounded-full
                border
                px-3
                py-1
                text-sm
                font-semibold
                transition-all

                ${
                  isOpen
                    ? `
                      border-cyan-500
                      text-cyan-400
                      shadow-[0_0_18px_rgba(6,182,212,.22)]
                    `
                    : `
                      border-fuchsia-500
                      text-fuchsia-400
                      shadow-[0_0_18px_rgba(192,38,211,.22)]
                    `
                }
              `}
            >
              {isOpen ? (
                <LockOpen className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}

              {isOpen ? "Open" : "Locked"}
            </div>

          </div>
        </div>
      </article>
    </Link>
  );
}
import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { ArrowRight, BookOpen } from "lucide-react";

import { Card, Icon } from "@/components/ui";

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
      <Card
        className="
          overflow-hidden
          transition-colors
          duration-200
          hover:border-[var(--primary)]
        "
      >
        {/* Thumbnail */}

        <div className="relative h-44 w-full">
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

        {/* Content */}

        <div className="p-5">

          <h2
            className="
              text-[18px]
              font-semibold
              leading-snug
              text-[var(--text)]
            "
          >
            {course.title}
          </h2>

          <div className="mt-5 flex items-center justify-between">

            <div className="flex items-center gap-2">

              <Icon
                icon={BookOpen}
                tone="accent"
                size="sm"
              />

              <span className="text-sm text-[var(--text-muted)]">
                {lessonCount} Lesson
                {lessonCount !== 1 ? "s" : ""}
              </span>

            </div>

            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                border
                border-[var(--border)]
                px-3
                py-2
                text-sm
                font-medium
                text-[var(--text)]
                transition-colors
                duration-200
                group-hover:border-[var(--primary)]
              "
            >
              Open

              <ArrowRight
                className="
                  h-4
                  w-4
                  text-[var(--primary)]
                "
              />
            </div>

          </div>

        </div>
      </Card>
    </Link>
  );
}
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
      className="group block"
    >
      <Card
        className="
          overflow-hidden
          hover:-translate-y-0.5
          hover:border-[var(--border-strong)]
          hover:shadow-[var(--shadow-raised)]
        "
      >
        {/* Thumbnail */}

        <div className="relative h-36 w-full overflow-hidden bg-[var(--surface-secondary)]">
          <Image
            src={
              course.thumbnail ??
              "/thumbnails/coursethumbnail.png"
            }
            alt={course.title}
            fill
            className="object-cover"
            unoptimized={!course.thumbnail?.startsWith("/")}
          />

          <div
            className="absolute inset-x-0 bottom-0 h-px bg-[var(--border)]"
            aria-hidden="true"
          />
        </div>

        {/* Content */}

        <div className="space-y-3 p-4">

          <h2
            className="
              line-clamp-2
              text-[1.0625rem]
              font-semibold
              leading-snug
              tracking-[-0.015em]
              text-[var(--text)]
            "
          >
            {course.title}
          </h2>

          <div className="flex items-center justify-between gap-3">

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
                h-9
                items-center
                gap-1.5
                rounded-[var(--radius-control)]
                border
                border-[var(--border)]
                px-3
                text-sm
                font-medium
                text-[var(--text)]
                transition-colors
                duration-200
                ease-out
                group-hover:border-[var(--primary)]
              "
            >
              Open

              <ArrowRight
                className="
                  h-4
                  w-4
                  text-[var(--primary-text)]
                  transition-transform
                  duration-200
                  ease-out
                  group-hover:translate-x-0.5
                "
              />
            </div>

          </div>

        </div>
      </Card>
    </Link>
  );
}
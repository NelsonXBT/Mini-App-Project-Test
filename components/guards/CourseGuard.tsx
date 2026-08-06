"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Course } from "@prisma/client";

import { useSession } from "@/contexts/SessionContext";

type CourseGuardProps = {
  course: Course;
  children: ReactNode;
};

export default function CourseGuard({
  course,
  children,
}: CourseGuardProps) {
  const { unlockedCourses } = useSession();

  const hasCourse = unlockedCourses.includes(course.slug);

  if (hasCourse) {
    return <>{children}</>;
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center text-center">
      <h1 className="text-[1.375rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--text)]">
        {course.title}
      </h1>

      <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
        You do not have access to this course yet.
        Click the button below to gain access and start learning!
      </p>

      <Link
        href={course.purchaseUrl ?? "#"}
        className="
          mt-7
          inline-flex
          h-11
          items-center
          justify-center
          rounded-[var(--radius-control)]
          bg-[var(--primary)]
          px-6
          text-sm
          font-medium
          tracking-tight
          text-white
          transition-all
          duration-200
          ease-out
          hover:bg-[var(--primary-hover)]
          active:scale-[0.98]
        "
      >
        Gain Access Now
      </Link>
    </main>
  );
}
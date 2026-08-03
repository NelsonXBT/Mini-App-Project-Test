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
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold text-white">
        {course.title}
        </h1>

      <p className="mt-4 text-zinc-400">
        You do not have access to this course yet.
        Click the button below to gain access and start learning!
        </p>

      <Link
        href={course.purchaseUrl ?? "#"}
        className="mt-8 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black"
      >
        Gain Access Now
      </Link>
    </main>
  );
}
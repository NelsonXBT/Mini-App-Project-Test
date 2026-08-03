"use client";

import { ReactNode } from "react";
import Link from "next/link";

import { useSession } from "@/contexts/SessionContext";

type CourseGuardProps = {
  courseSlug: string;
  purchaseUrl: string;
  children: ReactNode;
};

export default function CourseGuard({
  courseSlug,
  purchaseUrl,
  children,
}: CourseGuardProps) {
  const { unlockedCourses } = useSession();

  const hasCourse = unlockedCourses.includes(courseSlug);

  if (hasCourse) {
    return <>{children}</>;
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold text-white">
        Course Locked
      </h1>

      <p className="mt-4 text-zinc-400">
        You haven't enrolled in this course yet.
      </p>

      <Link
        href={purchaseUrl}
        className="mt-8 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black"
      >
        Enroll Now
      </Link>
    </main>
  );
}
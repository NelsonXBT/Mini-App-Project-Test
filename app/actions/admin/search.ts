"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";

export type SearchResult = {
  id: string;
  kind: "course" | "student";
  title: string;
  subtitle: string | null;
  href: string;
  image: string | null;
};

/**
 * One query powering the admin's global search.
 *
 * Capped at 5 per kind — this feeds a dropdown, not a results page, and
 * keeps the round trip cheap enough to run on every keystroke (debounced
 * client-side).
 */
export async function searchAdmin(
  query: string
): Promise<SearchResult[]> {
  await requireAdmin();

  const term = query.trim();

  if (term.length < 2) {
    return [];
  }

  const [courses, students] = await Promise.all([
    prisma.course.findMany({
      where: {
        OR: [
          { title: { contains: term, mode: "insensitive" } },
          { slug: { contains: term, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnail: true,
        isPublished: true,
      },
      take: 5,
    }),

    prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: term, mode: "insensitive" } },
          { lastName: { contains: term, mode: "insensitive" } },
          { username: { contains: term, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        photoUrl: true,
      },
      take: 5,
    }),
  ]);

  return [
    ...courses.map((course) => ({
      id: course.id,
      kind: "course" as const,
      title: course.title,
      subtitle: course.isPublished ? "Published" : "Draft",
      href: `/admin/courses/${course.id}`,
      image: course.thumbnail,
    })),

    ...students.map((student) => ({
      id: student.id,
      kind: "student" as const,
      title: [student.firstName, student.lastName]
        .filter(Boolean)
        .join(" "),
      subtitle: student.username ? `@${student.username}` : null,
      href: `/admin/students/${student.id}`,
      image: student.photoUrl,
    })),
  ];
}

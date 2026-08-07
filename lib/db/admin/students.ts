import { prisma } from "@/lib/prisma";

/**
 * Student list for the admin table.
 *
 * "Last active" and overall progress are derived from LessonProgress rather
 * than stored on User — the data already exists, so there is nothing to keep
 * in sync and no migration needed.
 */
export async function getAdminStudents() {
  const students = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      photoUrl: true,
      createdAt: true,
      _count: { select: { enrollments: true } },
      progress: {
        select: {
          progress: true,
          lastWatchedAt: true,
        },
      },
    },
  });

  return students.map((student) => {
    const rows = student.progress;

    const averageProgress =
      rows.length > 0
        ? Math.round(
            rows.reduce((sum, row) => sum + row.progress, 0) /
              rows.length
          )
        : 0;

    const lastActive = rows.reduce<Date | null>((latest, row) => {
      if (!row.lastWatchedAt) return latest;
      if (!latest || row.lastWatchedAt > latest) {
        return row.lastWatchedAt;
      }
      return latest;
    }, null);

    return {
      id: student.id,
      name: [student.firstName, student.lastName]
        .filter(Boolean)
        .join(" "),
      username: student.username,
      photoUrl: student.photoUrl,
      courseCount: student._count.enrollments,
      progress: averageProgress,
      joinedAt: student.createdAt,
      lastActive,
    };
  });
}

export async function getAdminStudent(id: string) {
  const student = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      photoUrl: true,
      createdAt: true,
      enrollments: {
        select: {
          id: true,
          status: true,
          createdAt: true,
          course: {
            select: { id: true, title: true, slug: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      progress: {
        select: {
          progress: true,
          completed: true,
          lastWatchedAt: true,
          lesson: {
            select: {
              id: true,
              title: true,
              module: {
                select: {
                  course: { select: { title: true } },
                },
              },
            },
          },
        },
        orderBy: { lastWatchedAt: "desc" },
      },
    },
  });

  if (!student) return null;

  const rows = student.progress;

  // The most recently watched lesson doubles as "where they are now".
  const current = rows.find((row) => row.lastWatchedAt) ?? null;

  return {
    id: student.id,
    name: [student.firstName, student.lastName]
      .filter(Boolean)
      .join(" "),
    username: student.username,
    email: student.email,
    photoUrl: student.photoUrl,
    joinedAt: student.createdAt,
    lastActive: current?.lastWatchedAt ?? null,

    completedLessons: rows.filter((row) => row.completed).length,
    totalTracked: rows.length,

    progress:
      rows.length > 0
        ? Math.round(
            rows.reduce((sum, row) => sum + row.progress, 0) /
              rows.length
          )
        : 0,

    currentLesson: current
      ? {
          title: current.lesson.title,
          course: current.lesson.module.course.title,
        }
      : null,

    enrollments: student.enrollments.map((enrollment) => ({
      id: enrollment.id,
      status: enrollment.status,
      courseId: enrollment.course.id,
      courseTitle: enrollment.course.title,
      enrolledAt: enrollment.createdAt,
    })),
  };
}

export async function getGrantableCourses(studentId: string) {
  const enrolled = await prisma.enrollment.findMany({
    where: { userId: studentId },
    select: { courseId: true },
  });

  return prisma.course.findMany({
    where: {
      id: { notIn: enrolled.map((row) => row.courseId) },
    },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
}

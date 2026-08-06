import { prisma } from "@/lib/prisma";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function getDashboardStats() {
  const today = startOfToday();

  const [
    totalStudents,
    totalCourses,
    totalLessons,
    activeToday,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.course.count(),
    prisma.lesson.count(),

    // Distinct students with playback activity since midnight. `distinct`
    // on findMany rather than groupBy, which would additionally require an
    // orderBy clause to satisfy Prisma's types.
    prisma.lessonProgress.findMany({
      where: {
        lastWatchedAt: {
          gte: today,
        },
      },
      distinct: ["userId"],
      select: { userId: true },
    }),
  ]);

  return {
    totalStudents,
    totalCourses,
    totalLessons,
    activeToday: activeToday.length,
  };
}

export async function getRecentStudents(limit = 5) {
  const students = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      photoUrl: true,
      createdAt: true,
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });

  return students.map((student) => ({
    id: student.id,
    name: [student.firstName, student.lastName]
      .filter(Boolean)
      .join(" "),
    username: student.username,
    photoUrl: student.photoUrl,
    joinedAt: student.createdAt,
    courseCount: student._count.enrollments,
  }));
}

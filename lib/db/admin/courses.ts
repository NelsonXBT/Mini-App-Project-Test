import { prisma } from "@/lib/prisma";

/**
 * Course list for the admin table, with the counts the table columns need.
 */
export async function getAdminCourses() {
  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnail: true,
      manualDuration: true,
      isPublished: true,
      _count: {
        select: {
          modules: true,
          enrollments: true,
        },
      },
      modules: {
        select: {
          _count: {
            select: {
              lessons: true,
            },
          },
        },
      },
    },
  });

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    thumbnail: course.thumbnail,
    manualDuration: course.manualDuration,
    isPublished: course.isPublished,
    moduleCount: course._count.modules,
    studentCount: course._count.enrollments,
    lessonCount: course.modules.reduce(
      (total, module) => total + module._count.lessons,
      0
    ),
  }));
}

/**
 * Full course tree for the editor: modules → lessons → resources, plus files.
 */
export async function getAdminCourse(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              resources: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      },
      files: {
        orderBy: { sortOrder: "asc" },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });
}

/**
 * Statistics for the editor header. Everything is derived except duration,
 * which the admin types by hand and is read straight off the course row.
 */
export async function getCourseStatistics(courseId: string) {
  const [course, moduleCount, lessons] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId },
      select: {
        manualDuration: true,
        isPublished: true,
        _count: { select: { enrollments: true } },
      },
    }),

    prisma.module.count({ where: { courseId } }),

    prisma.lesson.findMany({
      where: { module: { courseId } },
      select: { id: true },
    }),
  ]);

  if (!course) return null;

  const lessonIds = lessons.map((lesson) => lesson.id);

  // Average completion across every progress row for this course's lessons.
  const aggregate =
    lessonIds.length > 0
      ? await prisma.lessonProgress.aggregate({
          where: { lessonId: { in: lessonIds } },
          _avg: { progress: true },
        })
      : null;

  return {
    studentCount: course._count.enrollments,
    lessonCount: lessonIds.length,
    moduleCount,
    manualDuration: course.manualDuration,
    isPublished: course.isPublished,
    averageCompletion: Math.round(aggregate?._avg.progress ?? 0),
  };
}

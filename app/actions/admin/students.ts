"use server";

import { revalidatePath } from "next/cache";
import { ActivityType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import type { ActionResult } from "./courses";

function revalidateStudent(studentId: string) {
  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/admin/students");
  revalidatePath("/admin");
}

async function describe(studentId: string, courseId: string) {
  const [student, course] = await Promise.all([
    prisma.user.findUnique({
      where: { id: studentId },
      select: { firstName: true, lastName: true },
    }),
    prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true },
    }),
  ]);

  const name = student
    ? [student.firstName, student.lastName].filter(Boolean).join(" ")
    : "Unknown student";

  return { name, courseTitle: course?.title ?? "Unknown course" };
}

export async function grantCourse(
  studentId: string,
  courseId: string
): Promise<ActionResult> {
  const admin = await requireAdmin();

  if (!courseId) {
    return { ok: false, error: "Pick a course first." };
  }

  try {
    const { name, courseTitle } = await describe(studentId, courseId);

    // Unique on (userId, courseId), so an existing enrolment is reactivated
    // rather than duplicated.
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId: studentId, courseId },
      },
      update: { status: "ACTIVE" },
      create: { userId: studentId, courseId, status: "ACTIVE" },
    });

    await logActivity({
      type: ActivityType.STUDENT_ENROLLED,
      summary: `${name} was granted access to ${courseTitle}`,
      entityType: "user",
      entityId: studentId,
      actorId: admin.id,
    });

    revalidateStudent(studentId);

    return { ok: true };
  } catch (error) {
    console.error("grantCourse failed:", error);
    return { ok: false, error: "Could not grant the course." };
  }
}

export async function removeCourse(
  studentId: string,
  courseId: string
): Promise<ActionResult> {
  const admin = await requireAdmin();

  try {
    const { name, courseTitle } = await describe(studentId, courseId);

    await prisma.enrollment.deleteMany({
      where: { userId: studentId, courseId },
    });

    await logActivity({
      type: ActivityType.STUDENT_UNENROLLED,
      summary: `${name} lost access to ${courseTitle}`,
      entityType: "user",
      entityId: studentId,
      actorId: admin.id,
    });

    revalidateStudent(studentId);

    return { ok: true };
  } catch (error) {
    console.error("removeCourse failed:", error);
    return { ok: false, error: "Could not remove the course." };
  }
}

/**
 * Clears playback and completion for one course, or for everything when no
 * course is given. Enrolments are left intact — this resets progress, it does
 * not revoke access.
 */
export async function resetProgress(
  studentId: string,
  courseId?: string
): Promise<ActionResult> {
  const admin = await requireAdmin();

  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { firstName: true, lastName: true },
    });

    if (!student) {
      return { ok: false, error: "Student not found." };
    }

    const name = [student.firstName, student.lastName]
      .filter(Boolean)
      .join(" ");

    const deleted = await prisma.lessonProgress.deleteMany({
      where: {
        userId: studentId,
        ...(courseId
          ? { lesson: { module: { courseId } } }
          : {}),
      },
    });

    await logActivity({
      type: ActivityType.PROGRESS_RESET,
      summary: `Progress reset for ${name} (${deleted.count} lesson${deleted.count === 1 ? "" : "s"})`,
      entityType: "user",
      entityId: studentId,
      actorId: admin.id,
    });

    revalidateStudent(studentId);

    return { ok: true };
  } catch (error) {
    console.error("resetProgress failed:", error);
    return { ok: false, error: "Could not reset progress." };
  }
}

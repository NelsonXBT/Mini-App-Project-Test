"use server";

import { revalidatePath } from "next/cache";
import { ActivityType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import type { ActionResult } from "./courses";

async function revalidateForCourse(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { slug: true },
  });

  revalidatePath(`/admin/courses/${courseId}`);

  if (course) {
    revalidatePath(`/courses/${course.slug}`);
  }
}

export async function createModule(
  courseId: string,
  title: string
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const trimmed = title.trim();

  if (!trimmed) {
    return { ok: false, error: "Module title is required." };
  }

  try {
    // Append: take the current highest order rather than counting rows,
    // so gaps left by deletions can't cause a collision.
    const last = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const created = await prisma.module.create({
      data: {
        courseId,
        title: trimmed,
        order: (last?.order ?? 0) + 1,
      },
    });

    await logActivity({
      type: ActivityType.MODULE_CREATED,
      summary: `Module created: ${trimmed}`,
      entityType: "module",
      entityId: created.id,
      actorId: admin.id,
    });

    await revalidateForCourse(courseId);

    return { ok: true, id: created.id };
  } catch (error) {
    console.error("createModule failed:", error);
    return { ok: false, error: "Could not create the module." };
  }
}

export async function renameModule(
  moduleId: string,
  title: string
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const trimmed = title.trim();

  if (!trimmed) {
    return { ok: false, error: "Module title is required." };
  }

  try {
    const updated = await prisma.module.update({
      where: { id: moduleId },
      data: { title: trimmed },
      select: { courseId: true },
    });

    await logActivity({
      type: ActivityType.MODULE_UPDATED,
      summary: `Module renamed: ${trimmed}`,
      entityType: "module",
      entityId: moduleId,
      actorId: admin.id,
    });

    await revalidateForCourse(updated.courseId);

    return { ok: true };
  } catch (error) {
    console.error("renameModule failed:", error);
    return { ok: false, error: "Could not rename the module." };
  }
}

export async function deleteModule(
  moduleId: string
): Promise<ActionResult> {
  const admin = await requireAdmin();

  try {
    const existing = await prisma.module.findUnique({
      where: { id: moduleId },
      select: {
        title: true,
        courseId: true,
        _count: { select: { lessons: true } },
      },
    });

    if (!existing) {
      return { ok: false, error: "Module not found." };
    }

    // Lessons (and their resources and progress) cascade from the schema.
    await prisma.module.delete({ where: { id: moduleId } });

    await logActivity({
      type: ActivityType.MODULE_DELETED,
      summary: `Module deleted: ${existing.title} (${existing._count.lessons} lesson${existing._count.lessons === 1 ? "" : "s"})`,
      entityType: "module",
      entityId: moduleId,
      actorId: admin.id,
    });

    await revalidateForCourse(existing.courseId);

    return { ok: true };
  } catch (error) {
    console.error("deleteModule failed:", error);
    return { ok: false, error: "Could not delete the module." };
  }
}

/**
 * Persist a whole new ordering at once. Written in a transaction so the list
 * can never be left half-renumbered if one update fails.
 */
export async function reorderModules(
  courseId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  await requireAdmin();

  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.module.update({
          where: { id },
          data: { order: index + 1 },
        })
      )
    );

    await revalidateForCourse(courseId);

    return { ok: true };
  } catch (error) {
    console.error("reorderModules failed:", error);
    return { ok: false, error: "Could not save the new order." };
  }
}

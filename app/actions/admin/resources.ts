"use server";

import { revalidatePath } from "next/cache";
import { ActivityType, ResourceType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import type { ActionResult } from "./courses";

/*
 * Lesson resources and course files are separate concepts with the same
 * shape: a titled, typed link with a sort order. Lesson resources hang off a
 * lesson; course files belong to the whole course.
 */

export type ResourceInput = {
  title: string;
  url: string;
  type: string;
};

function parseType(value: string): ResourceType {
  return Object.values(ResourceType).includes(value as ResourceType)
    ? (value as ResourceType)
    : ResourceType.other;
}

function validate(input: ResourceInput): string | null {
  if (!input.title.trim()) return "Title is required.";
  if (!input.url.trim()) return "URL is required.";
  return null;
}

async function revalidateForLesson(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      module: {
        select: {
          courseId: true,
          course: { select: { slug: true } },
        },
      },
    },
  });

  if (!lesson) return;

  revalidatePath(`/admin/courses/${lesson.module.courseId}`);
  revalidatePath(`/courses/${lesson.module.course.slug}`);
}

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

// ── Lesson resources ────────────────────────────────────────────

export async function createResource(
  lessonId: string,
  input: ResourceInput
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  try {
    const last = await prisma.resource.findFirst({
      where: { lessonId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const created = await prisma.resource.create({
      data: {
        lessonId,
        title: input.title.trim(),
        url: input.url.trim(),
        type: parseType(input.type),
        sortOrder: (last?.sortOrder ?? 0) + 1,
      },
    });

    await logActivity({
      type: ActivityType.RESOURCE_CREATED,
      summary: `Resource added: ${created.title}`,
      entityType: "resource",
      entityId: created.id,
      actorId: admin.id,
    });

    await revalidateForLesson(lessonId);

    return { ok: true, id: created.id };
  } catch (error) {
    console.error("createResource failed:", error);
    return { ok: false, error: "Could not add the resource." };
  }
}

export async function updateResource(
  resourceId: string,
  input: ResourceInput
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  try {
    const updated = await prisma.resource.update({
      where: { id: resourceId },
      data: {
        title: input.title.trim(),
        url: input.url.trim(),
        type: parseType(input.type),
      },
      select: { lessonId: true, title: true },
    });

    await logActivity({
      type: ActivityType.RESOURCE_UPDATED,
      summary: `Resource updated: ${updated.title}`,
      entityType: "resource",
      entityId: resourceId,
      actorId: admin.id,
    });

    await revalidateForLesson(updated.lessonId);

    return { ok: true };
  } catch (error) {
    console.error("updateResource failed:", error);
    return { ok: false, error: "Could not save the resource." };
  }
}

export async function deleteResource(
  resourceId: string
): Promise<ActionResult> {
  const admin = await requireAdmin();

  try {
    const existing = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { title: true, lessonId: true },
    });

    if (!existing) {
      return { ok: false, error: "Resource not found." };
    }

    await prisma.resource.delete({ where: { id: resourceId } });

    await logActivity({
      type: ActivityType.RESOURCE_DELETED,
      summary: `Resource deleted: ${existing.title}`,
      entityType: "resource",
      entityId: resourceId,
      actorId: admin.id,
    });

    await revalidateForLesson(existing.lessonId);

    return { ok: true };
  } catch (error) {
    console.error("deleteResource failed:", error);
    return { ok: false, error: "Could not delete the resource." };
  }
}

export async function reorderResources(
  lessonId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  await requireAdmin();

  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.resource.update({
          where: { id },
          data: { sortOrder: index + 1 },
        })
      )
    );

    await revalidateForLesson(lessonId);

    return { ok: true };
  } catch (error) {
    console.error("reorderResources failed:", error);
    return { ok: false, error: "Could not save the new order." };
  }
}

// ── Course files ────────────────────────────────────────────────

export async function createCourseFile(
  courseId: string,
  input: ResourceInput
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  try {
    const last = await prisma.courseFile.findFirst({
      where: { courseId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const created = await prisma.courseFile.create({
      data: {
        courseId,
        title: input.title.trim(),
        url: input.url.trim(),
        type: parseType(input.type),
        sortOrder: (last?.sortOrder ?? 0) + 1,
      },
    });

    await logActivity({
      type: ActivityType.COURSE_FILE_CREATED,
      summary: `Course file added: ${created.title}`,
      entityType: "courseFile",
      entityId: created.id,
      actorId: admin.id,
    });

    await revalidateForCourse(courseId);

    return { ok: true, id: created.id };
  } catch (error) {
    console.error("createCourseFile failed:", error);
    return { ok: false, error: "Could not add the file." };
  }
}

export async function updateCourseFile(
  fileId: string,
  input: ResourceInput
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  try {
    const updated = await prisma.courseFile.update({
      where: { id: fileId },
      data: {
        title: input.title.trim(),
        url: input.url.trim(),
        type: parseType(input.type),
      },
      select: { courseId: true, title: true },
    });

    await logActivity({
      type: ActivityType.COURSE_FILE_UPDATED,
      summary: `Course file updated: ${updated.title}`,
      entityType: "courseFile",
      entityId: fileId,
      actorId: admin.id,
    });

    await revalidateForCourse(updated.courseId);

    return { ok: true };
  } catch (error) {
    console.error("updateCourseFile failed:", error);
    return { ok: false, error: "Could not save the file." };
  }
}

export async function deleteCourseFile(
  fileId: string
): Promise<ActionResult> {
  const admin = await requireAdmin();

  try {
    const existing = await prisma.courseFile.findUnique({
      where: { id: fileId },
      select: { title: true, courseId: true },
    });

    if (!existing) {
      return { ok: false, error: "File not found." };
    }

    await prisma.courseFile.delete({ where: { id: fileId } });

    await logActivity({
      type: ActivityType.COURSE_FILE_DELETED,
      summary: `Course file deleted: ${existing.title}`,
      entityType: "courseFile",
      entityId: fileId,
      actorId: admin.id,
    });

    await revalidateForCourse(existing.courseId);

    return { ok: true };
  } catch (error) {
    console.error("deleteCourseFile failed:", error);
    return { ok: false, error: "Could not delete the file." };
  }
}

export async function reorderCourseFiles(
  courseId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  await requireAdmin();

  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.courseFile.update({
          where: { id },
          data: { sortOrder: index + 1 },
        })
      )
    );

    await revalidateForCourse(courseId);

    return { ok: true };
  } catch (error) {
    console.error("reorderCourseFiles failed:", error);
    return { ok: false, error: "Could not save the new order." };
  }
}

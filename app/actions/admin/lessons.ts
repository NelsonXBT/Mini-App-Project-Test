"use server";

import { revalidatePath } from "next/cache";
import { ActivityType, VideoProvider } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import type { ActionResult } from "./courses";

/**
 * Lessons are reached through their module, so the owning course has to be
 * looked up before anything student-facing can be revalidated.
 */
async function revalidateForModule(moduleId: string) {
  const found = await prisma.module.findUnique({
    where: { id: moduleId },
    select: {
      courseId: true,
      course: { select: { slug: true } },
    },
  });

  if (!found) return;

  revalidatePath(`/admin/courses/${found.courseId}`);
  revalidatePath(`/courses/${found.course.slug}`);
}

export type LessonInput = {
  title: string;
  description: string;
  provider: string;
  videoId: string;
  duration: string;
  isPublished: boolean;
  isPreview: boolean;
};

function parseProvider(value: string): VideoProvider {
  return value === "youtube"
    ? VideoProvider.youtube
    : VideoProvider.bunny;
}

/**
 * Duration is entered in minutes for convenience but stored in seconds,
 * matching what LessonCard already divides back down for display.
 */
function parseDuration(value: string): number | null {
  const minutes = Number(value);

  if (!value.trim() || Number.isNaN(minutes) || minutes <= 0) {
    return null;
  }

  return Math.round(minutes * 60);
}

export async function createLesson(
  moduleId: string,
  input: LessonInput
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const title = input.title.trim();

  if (!title) {
    return { ok: false, error: "Lesson title is required." };
  }

  if (!input.videoId.trim()) {
    return { ok: false, error: "Video ID is required." };
  }

  try {
    const last = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const created = await prisma.lesson.create({
      data: {
        moduleId,
        title,
        description: input.description.trim() || null,
        provider: parseProvider(input.provider),
        videoId: input.videoId.trim(),
        duration: parseDuration(input.duration),
        isPublished: input.isPublished,
        isPreview: input.isPreview,
        order: (last?.order ?? 0) + 1,
      },
    });

    await logActivity({
      type: ActivityType.LESSON_CREATED,
      summary: `Lesson added: ${title}`,
      entityType: "lesson",
      entityId: created.id,
      actorId: admin.id,
    });

    await revalidateForModule(moduleId);

    return { ok: true, id: created.id };
  } catch (error) {
    console.error("createLesson failed:", error);
    return { ok: false, error: "Could not create the lesson." };
  }
}

export async function updateLesson(
  lessonId: string,
  input: LessonInput
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const title = input.title.trim();

  if (!title) {
    return { ok: false, error: "Lesson title is required." };
  }

  if (!input.videoId.trim()) {
    return { ok: false, error: "Video ID is required." };
  }

  try {
    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title,
        description: input.description.trim() || null,
        provider: parseProvider(input.provider),
        videoId: input.videoId.trim(),
        duration: parseDuration(input.duration),
        isPublished: input.isPublished,
        isPreview: input.isPreview,
      },
      select: { moduleId: true },
    });

    await logActivity({
      type: ActivityType.LESSON_UPDATED,
      summary: `Lesson updated: ${title}`,
      entityType: "lesson",
      entityId: lessonId,
      actorId: admin.id,
    });

    await revalidateForModule(updated.moduleId);

    return { ok: true };
  } catch (error) {
    console.error("updateLesson failed:", error);
    return { ok: false, error: "Could not save the lesson." };
  }
}

export async function deleteLesson(
  lessonId: string
): Promise<ActionResult> {
  const admin = await requireAdmin();

  try {
    const existing = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { title: true, moduleId: true },
    });

    if (!existing) {
      return { ok: false, error: "Lesson not found." };
    }

    await prisma.lesson.delete({ where: { id: lessonId } });

    await logActivity({
      type: ActivityType.LESSON_DELETED,
      summary: `Lesson deleted: ${existing.title}`,
      entityType: "lesson",
      entityId: lessonId,
      actorId: admin.id,
    });

    await revalidateForModule(existing.moduleId);

    return { ok: true };
  } catch (error) {
    console.error("deleteLesson failed:", error);
    return { ok: false, error: "Could not delete the lesson." };
  }
}

/**
 * Copies every field and all attached resources. The title gains a "(Copy)"
 * suffix and the copy is appended to the end of its module; progress rows are
 * deliberately not carried over, since they belong to the original lesson.
 */
export async function duplicateLesson(
  lessonId: string
): Promise<ActionResult> {
  const admin = await requireAdmin();

  try {
    const source = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        resources: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!source) {
      return { ok: false, error: "Lesson not found." };
    }

    const last = await prisma.lesson.findFirst({
      where: { moduleId: source.moduleId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const copy = await prisma.lesson.create({
      data: {
        moduleId: source.moduleId,
        title: `${source.title} (Copy)`,
        description: source.description,
        provider: source.provider,
        videoId: source.videoId,
        duration: source.duration,
        isPublished: source.isPublished,
        isPreview: source.isPreview,
        order: (last?.order ?? 0) + 1,

        resources: {
          create: source.resources.map((resource) => ({
            title: resource.title,
            type: resource.type,
            url: resource.url,
            sortOrder: resource.sortOrder,
          })),
        },
      },
    });

    await logActivity({
      type: ActivityType.LESSON_DUPLICATED,
      summary: `Lesson duplicated: ${source.title}`,
      entityType: "lesson",
      entityId: copy.id,
      actorId: admin.id,
    });

    await revalidateForModule(source.moduleId);

    return { ok: true, id: copy.id };
  } catch (error) {
    console.error("duplicateLesson failed:", error);
    return { ok: false, error: "Could not duplicate the lesson." };
  }
}

export async function reorderLessons(
  moduleId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  await requireAdmin();

  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.lesson.update({
          where: { id },
          data: { order: index + 1 },
        })
      )
    );

    await revalidateForModule(moduleId);

    return { ok: true };
  } catch (error) {
    console.error("reorderLessons failed:", error);
    return { ok: false, error: "Could not save the new order." };
  }
}

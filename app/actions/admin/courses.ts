"use server";

import { revalidatePath } from "next/cache";
import { ActivityType, Difficulty } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Both the student course page and the admin views read this data, so a
 * write has to clear both. revalidatePath("/", "layout") is deliberately
 * broad — course edits are infrequent and correctness matters more here
 * than avoiding a cache miss.
 */
function revalidateCourse(slug?: string) {
  revalidatePath("/admin/courses");
  revalidatePath("/admin");

  if (slug) {
    revalidatePath(`/courses/${slug}`);
  }

  revalidatePath("/courses");
}

export async function createCourse(): Promise<ActionResult> {
  const admin = await requireAdmin();

  // Seeded with a unique placeholder slug so the row can be created before
  // the admin has typed anything, then edited in place.
  const stamp = Date.now().toString(36);

  try {
    const course = await prisma.course.create({
      data: {
        title: "Untitled course",
        slug: `untitled-course-${stamp}`,
        isPublished: false,
      },
    });

    await logActivity({
      type: ActivityType.COURSE_CREATED,
      summary: "Course created: Untitled course",
      entityType: "course",
      entityId: course.id,
      actorId: admin.id,
    });

    revalidateCourse();

    return { ok: true, id: course.id };
  } catch (error) {
    console.error("createCourse failed:", error);
    return { ok: false, error: "Could not create the course." };
  }
}

type UpdateCourseInput = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  instructor: string;
  manualDuration: string;
  difficulty: string;
  isPublished: boolean;
};

export async function updateCourse(
  input: UpdateCourseInput
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const title = input.title.trim();

  if (!title) {
    return { ok: false, error: "Title is required." };
  }

  const slug = slugify(input.slug || title);

  if (!slug) {
    return { ok: false, error: "Slug is required." };
  }

  try {
    // Slug is the student-facing URL key and is unique in the schema, so
    // check it before writing to return a readable error instead of a
    // constraint violation.
    const clash = await prisma.course.findFirst({
      where: {
        slug,
        NOT: { id: input.id },
      },
      select: { id: true },
    });

    if (clash) {
      return {
        ok: false,
        error: "That slug is already used by another course.",
      };
    }

    const difficulty =
      input.difficulty &&
      Object.values(Difficulty).includes(
        input.difficulty as Difficulty
      )
        ? (input.difficulty as Difficulty)
        : null;

    const course = await prisma.course.update({
      where: { id: input.id },
      data: {
        title,
        slug,
        shortDescription: input.shortDescription.trim() || null,
        description: input.description.trim() || null,
        thumbnail: input.thumbnail.trim() || null,
        instructor: input.instructor.trim() || null,
        manualDuration: input.manualDuration.trim() || null,
        difficulty,
        isPublished: input.isPublished,
      },
    });

    await logActivity({
      type: ActivityType.COURSE_UPDATED,
      summary: `Course updated: ${course.title}`,
      entityType: "course",
      entityId: course.id,
      actorId: admin.id,
    });

    revalidateCourse(course.slug);
    revalidatePath(`/admin/courses/${course.id}`);

    return { ok: true };
  } catch (error) {
    console.error("updateCourse failed:", error);
    return { ok: false, error: "Could not save the course." };
  }
}

export async function deleteCourse(
  id: string
): Promise<ActionResult> {
  const admin = await requireAdmin();

  try {
    // Read the title first so the log entry survives the row.
    const course = await prisma.course.findUnique({
      where: { id },
      select: { title: true, slug: true },
    });

    if (!course) {
      return { ok: false, error: "Course not found." };
    }

    // Modules, lessons, resources, files and enrolments all cascade.
    await prisma.course.delete({ where: { id } });

    await logActivity({
      type: ActivityType.COURSE_DELETED,
      summary: `Course deleted: ${course.title}`,
      entityType: "course",
      entityId: id,
      actorId: admin.id,
    });

    revalidateCourse(course.slug);

    return { ok: true };
  } catch (error) {
    console.error("deleteCourse failed:", error);
    return { ok: false, error: "Could not delete the course." };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { ActivityType, ResourceSection } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { RESOURCE_ICON_KEYS } from "@/lib/constants/icon-keys";
import type { ActionResult } from "./courses";

/*
 * The two tabs of the student resources page. They share a table because they
 * share a shape — a titled, described, linked card — and differ only in the
 * meta each one shows: packs carry a file count, tools carry an affiliate
 * disclosure.
 */

export type ResourceItemInput = {
  section: string;
  title: string;
  description: string;
  icon: string;
  cta: string;
  url: string;
  fileCount: number | null;
  isAffiliate: boolean;
  isPublished: boolean;
};

function parseSection(value: string): ResourceSection {
  return value === ResourceSection.tools
    ? ResourceSection.tools
    : ResourceSection.packs;
}

function parseIcon(value: string): string {
  return RESOURCE_ICON_KEYS.includes(value) ? value : "folder";
}

function validate(input: ResourceItemInput): string | null {
  if (!input.title.trim()) return "Title is required.";
  if (!input.description.trim()) return "Description is required.";
  if (!input.cta.trim()) return "Button label is required.";

  if (input.cta.trim().length > 12) {
    return "Button label must be 12 characters or fewer.";
  }

  if (input.fileCount !== null && input.fileCount < 0) {
    return "File count cannot be negative.";
  }

  return null;
}

function revalidateResources() {
  revalidatePath("/resources");
  revalidatePath("/admin/resources");
}

/*
 * fileCount and isAffiliate are cleared rather than carried over when an item
 * changes section: "45 files" on a crypto exchange, or an affiliate
 * disclosure on an in-house prompt pack, would both be wrong.
 */
function fieldsForSection(
  section: ResourceSection,
  input: ResourceItemInput,
) {
  const isPack = section === ResourceSection.packs;

  return {
    fileCount: isPack ? input.fileCount : null,
    isAffiliate: isPack ? false : input.isAffiliate,
  };
}

export async function createResourceItem(
  input: ResourceItemInput,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  const section = parseSection(input.section);

  try {
    // Sort order is per-section, so the two tabs number independently.
    const last = await prisma.resourceItem.findFirst({
      where: { section },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const created = await prisma.resourceItem.create({
      data: {
        section,
        title: input.title.trim(),
        description: input.description.trim(),
        icon: parseIcon(input.icon),
        cta: input.cta.trim(),
        url: input.url.trim(),
        isPublished: input.isPublished,
        sortOrder: (last?.sortOrder ?? 0) + 1,
        ...fieldsForSection(section, input),
      },
    });

    await logActivity({
      type: ActivityType.RESOURCE_ITEM_CREATED,
      summary: `Resource item added: ${created.title}`,
      entityType: "resourceItem",
      entityId: created.id,
      actorId: admin.id,
    });

    revalidateResources();

    return { ok: true, id: created.id };
  } catch (error) {
    console.error("createResourceItem failed:", error);
    return { ok: false, error: "Could not add the item." };
  }
}

export async function updateResourceItem(
  itemId: string,
  input: ResourceItemInput,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  const section = parseSection(input.section);

  try {
    const updated = await prisma.resourceItem.update({
      where: { id: itemId },
      data: {
        section,
        title: input.title.trim(),
        description: input.description.trim(),
        icon: parseIcon(input.icon),
        cta: input.cta.trim(),
        url: input.url.trim(),
        isPublished: input.isPublished,
        ...fieldsForSection(section, input),
      },
      select: { title: true },
    });

    await logActivity({
      type: ActivityType.RESOURCE_ITEM_UPDATED,
      summary: `Resource item updated: ${updated.title}`,
      entityType: "resourceItem",
      entityId: itemId,
      actorId: admin.id,
    });

    revalidateResources();

    return { ok: true };
  } catch (error) {
    console.error("updateResourceItem failed:", error);
    return { ok: false, error: "Could not save the item." };
  }
}

export async function deleteResourceItem(
  itemId: string,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  try {
    const existing = await prisma.resourceItem.findUnique({
      where: { id: itemId },
      select: { title: true },
    });

    if (!existing) {
      return { ok: false, error: "Item not found." };
    }

    await prisma.resourceItem.delete({ where: { id: itemId } });

    await logActivity({
      type: ActivityType.RESOURCE_ITEM_DELETED,
      summary: `Resource item deleted: ${existing.title}`,
      entityType: "resourceItem",
      entityId: itemId,
      actorId: admin.id,
    });

    revalidateResources();

    return { ok: true };
  } catch (error) {
    console.error("deleteResourceItem failed:", error);
    return { ok: false, error: "Could not delete the item." };
  }
}

export async function reorderResourceItems(
  orderedIds: string[],
): Promise<ActionResult> {
  await requireAdmin();

  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.resourceItem.update({
          where: { id },
          data: { sortOrder: index + 1 },
        }),
      ),
    );

    revalidateResources();

    return { ok: true };
  } catch (error) {
    console.error("reorderResourceItems failed:", error);
    return { ok: false, error: "Could not save the new order." };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { ActivityType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { COMMUNITY_ICON_KEYS } from "@/lib/constants/icon-keys";
import type { ActionResult } from "./courses";

export type CommunityChannelInput = {
  title: string;
  description: string;
  icon: string;
  cta: string;
  url: string;
  isPublished: boolean;
};

/*
 * An unrecognised icon key would render as a blank tile on the student card,
 * so anything unknown is coerced to the neutral default instead of stored.
 */
function parseIcon(value: string): string {
  return COMMUNITY_ICON_KEYS.includes(value) ? value : "community";
}

function validate(input: CommunityChannelInput): string | null {
  if (!input.title.trim()) return "Title is required.";
  if (!input.description.trim()) return "Description is required.";
  if (!input.cta.trim()) return "Button label is required.";

  // The chip is sized for a short verb; a long label truncates the title
  // beside it on a narrow phone.
  if (input.cta.trim().length > 12) {
    return "Button label must be 12 characters or fewer.";
  }

  return null;
}

/*
 * The community page is the only student surface that reads these rows, and
 * every mutation here changes it.
 */
function revalidateCommunity() {
  revalidatePath("/community");
  revalidatePath("/admin/community");
}

export async function createCommunityChannel(
  input: CommunityChannelInput,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  try {
    const last = await prisma.communityChannel.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const created = await prisma.communityChannel.create({
      data: {
        title: input.title.trim(),
        description: input.description.trim(),
        icon: parseIcon(input.icon),
        cta: input.cta.trim(),
        url: input.url.trim(),
        isPublished: input.isPublished,
        sortOrder: (last?.sortOrder ?? 0) + 1,
      },
    });

    await logActivity({
      type: ActivityType.COMMUNITY_CHANNEL_CREATED,
      summary: `Community channel added: ${created.title}`,
      entityType: "communityChannel",
      entityId: created.id,
      actorId: admin.id,
    });

    revalidateCommunity();

    return { ok: true, id: created.id };
  } catch (error) {
    console.error("createCommunityChannel failed:", error);
    return { ok: false, error: "Could not add the channel." };
  }
}

export async function updateCommunityChannel(
  channelId: string,
  input: CommunityChannelInput,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  try {
    const updated = await prisma.communityChannel.update({
      where: { id: channelId },
      data: {
        title: input.title.trim(),
        description: input.description.trim(),
        icon: parseIcon(input.icon),
        cta: input.cta.trim(),
        url: input.url.trim(),
        isPublished: input.isPublished,
      },
      select: { title: true },
    });

    await logActivity({
      type: ActivityType.COMMUNITY_CHANNEL_UPDATED,
      summary: `Community channel updated: ${updated.title}`,
      entityType: "communityChannel",
      entityId: channelId,
      actorId: admin.id,
    });

    revalidateCommunity();

    return { ok: true };
  } catch (error) {
    console.error("updateCommunityChannel failed:", error);
    return { ok: false, error: "Could not save the channel." };
  }
}

export async function deleteCommunityChannel(
  channelId: string,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  try {
    const existing = await prisma.communityChannel.findUnique({
      where: { id: channelId },
      select: { title: true },
    });

    if (!existing) {
      return { ok: false, error: "Channel not found." };
    }

    await prisma.communityChannel.delete({ where: { id: channelId } });

    await logActivity({
      type: ActivityType.COMMUNITY_CHANNEL_DELETED,
      summary: `Community channel deleted: ${existing.title}`,
      entityType: "communityChannel",
      entityId: channelId,
      actorId: admin.id,
    });

    revalidateCommunity();

    return { ok: true };
  } catch (error) {
    console.error("deleteCommunityChannel failed:", error);
    return { ok: false, error: "Could not delete the channel." };
  }
}

export async function reorderCommunityChannels(
  orderedIds: string[],
): Promise<ActionResult> {
  await requireAdmin();

  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.communityChannel.update({
          where: { id },
          data: { sortOrder: index + 1 },
        }),
      ),
    );

    revalidateCommunity();

    return { ok: true };
  } catch (error) {
    console.error("reorderCommunityChannels failed:", error);
    return { ok: false, error: "Could not save the new order." };
  }
}

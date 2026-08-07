"use server";

import { revalidatePath } from "next/cache";
import { ActivityType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { SETTINGS_ID } from "@/lib/db/admin/settings";
import type { ActionResult } from "./courses";

export type SettingsInput = {
  platformName: string;
  logoUrl: string;
  supportEmail: string;
  telegramCommunityUrl: string;
  defaultCourseThumbnail: string;
};

export async function updateSettings(
  input: SettingsInput
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const platformName = input.platformName.trim();

  if (!platformName) {
    return { ok: false, error: "Platform name is required." };
  }

  try {
    const data = {
      platformName,
      logoUrl: input.logoUrl.trim() || null,
      supportEmail: input.supportEmail.trim() || null,
      telegramCommunityUrl: input.telegramCommunityUrl.trim() || null,
      defaultCourseThumbnail:
        input.defaultCourseThumbnail.trim() || null,
    };

    await prisma.platformSettings.upsert({
      where: { id: SETTINGS_ID },
      update: data,
      create: { id: SETTINGS_ID, ...data },
    });

    await logActivity({
      type: ActivityType.SETTINGS_UPDATED,
      summary: "Platform settings updated",
      entityType: "settings",
      entityId: SETTINGS_ID,
      actorId: admin.id,
    });

    // The platform name renders in the admin sidebar, so the whole admin
    // layout needs revalidating, not just this page.
    revalidatePath("/admin", "layout");

    return { ok: true };
  } catch (error) {
    console.error("updateSettings failed:", error);
    return { ok: false, error: "Could not save settings." };
  }
}

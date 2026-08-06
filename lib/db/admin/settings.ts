import { prisma } from "@/lib/prisma";

export const SETTINGS_ID = "singleton";

export const DEFAULT_PLATFORM_NAME = "IME Creative Lab";

/**
 * Reads the single settings row, creating it on first access so callers never
 * have to handle a null. Safe to call from any Server Component.
 */
export async function getPlatformSettings() {
  return prisma.platformSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: {
      id: SETTINGS_ID,
      platformName: DEFAULT_PLATFORM_NAME,
    },
  });
}

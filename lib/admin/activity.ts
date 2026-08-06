import { ActivityType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type LogInput = {
  type: ActivityType;
  summary: string;
  entityType?: string;
  entityId?: string;
  actorId?: string;
};

/**
 * Append to the activity feed.
 *
 * `summary` is written out in full at call time rather than being assembled
 * later from a join, because the feed has to keep describing things after
 * they're deleted ("Lesson Deleted" outlives the lesson row).
 *
 * Logging must never take down the operation it describes, so failures are
 * swallowed and reported to the server console only.
 */
export async function logActivity({
  type,
  summary,
  entityType,
  entityId,
  actorId,
}: LogInput) {
  try {
    await prisma.activityLog.create({
      data: {
        type,
        summary,
        entityType,
        entityId,
        actorId,
      },
    });
  } catch (error) {
    console.error("Failed to write activity log:", error);
  }
}

export async function getRecentActivity(limit = 8) {
  return prisma.activityLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    include: {
      actor: {
        select: {
          username: true,
          name: true,
        },
      },
    },
  });
}

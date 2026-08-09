import { prisma } from "@/lib/prisma";

/**
 * Channels for the student community page.
 *
 * Unpublished rows are filtered out here rather than hidden in the component,
 * so a draft channel never reaches the client payload.
 */
export async function getPublishedCommunityChannels() {
  return prisma.communityChannel.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      description: true,
      icon: true,
      cta: true,
      url: true,
    },
  });
}

/** Every channel, published or not, for the admin editor. */
export async function getAllCommunityChannels() {
  return prisma.communityChannel.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export type AdminCommunityChannel = Awaited<
  ReturnType<typeof getAllCommunityChannels>
>[number];

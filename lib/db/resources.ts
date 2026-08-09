import { ResourceSection } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/*
 * The shape the student card consumes.
 *
 * `meta` is derived here rather than in the component because the two
 * sections describe themselves differently — packs by file count, tools by
 * affiliate disclosure — and that rule belongs with the data, not duplicated
 * in the rendering layer.
 */
export type ResourceItemView = {
  id: string;
  section: ResourceSection;
  title: string;
  description: string;
  icon: string;
  cta: string;
  url: string;
  meta?: string;
};

function toView(item: {
  id: string;
  section: ResourceSection;
  title: string;
  description: string;
  icon: string;
  cta: string;
  url: string;
  fileCount: number | null;
  isAffiliate: boolean;
}): ResourceItemView {
  const meta =
    item.section === ResourceSection.packs
      ? item.fileCount !== null
        ? `${item.fileCount} ${item.fileCount === 1 ? "file" : "files"}`
        : undefined
      : item.isAffiliate
        ? "Affiliate link"
        : undefined;

  return {
    id: item.id,
    section: item.section,
    title: item.title,
    description: item.description,
    icon: item.icon,
    cta: item.cta,
    url: item.url,
    meta,
  };
}

/**
 * Both tabs of the student resources page in one query.
 *
 * Fetching once and splitting in memory keeps this to a single round trip —
 * the two sections are small and always rendered together, so two queries
 * would double the latency for no benefit.
 */
export async function getPublishedResourceItems() {
  const items = await prisma.resourceItem.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      section: true,
      title: true,
      description: true,
      icon: true,
      cta: true,
      url: true,
      fileCount: true,
      isAffiliate: true,
    },
  });

  return {
    packs: items
      .filter((item) => item.section === ResourceSection.packs)
      .map(toView),
    tools: items
      .filter((item) => item.section === ResourceSection.tools)
      .map(toView),
  };
}

/** Every item, published or not, for the admin editor. */
export async function getAllResourceItems() {
  return prisma.resourceItem.findMany({
    orderBy: [{ section: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export type AdminResourceItem = Awaited<
  ReturnType<typeof getAllResourceItems>
>[number];

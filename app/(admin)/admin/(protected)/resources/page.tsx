import type { Metadata } from "next";
import { ResourceSection } from "@prisma/client";

import ResourceItemsEditor, {
  type ResourceRow,
} from "@/components/admin/resources/ResourceItemsEditor";
import { getAllResourceItems } from "@/lib/db/resources";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Resources",
};

const panelClasses = `
  rounded-[var(--radius)]
  border
  border-[var(--border)]
  bg-[var(--card)]
  p-5
  shadow-[var(--shadow-panel)]
`;

export default async function AdminResourcesPage() {
  const items = await getAllResourceItems();

  const toRow = (item: (typeof items)[number]): ResourceRow => ({
    id: item.id,
    section: item.section === ResourceSection.packs ? "packs" : "tools",
    title: item.title,
    description: item.description,
    icon: item.icon,
    cta: item.cta,
    url: item.url,
    fileCount: item.fileCount,
    isAffiliate: item.isAffiliate,
    isPublished: item.isPublished,
  });

  const rows = items.map(toRow);

  const tools = rows.filter((row) => row.section === "tools");
  const packs = rows.filter((row) => row.section === "packs");

  const publishedPacks = packs.filter((row) => row.isPublished).length;

  return (
    <div className="animate-rise-in space-y-5">
      <div>
        <h1 className="text-[1.5rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--text)]">
          Resources
        </h1>

        <p className="mt-1 text-[14px] text-[var(--text-muted)]">
          The two tabs of the student resources page. Drag to reorder within a
          tab.
        </p>
      </div>

      <div className="grid max-w-5xl gap-4 lg:grid-cols-2">
        <section className={panelClasses}>
          <ResourceItemsEditor section="tools" items={tools} />
        </section>

        <section className={panelClasses}>
          <ResourceItemsEditor section="packs" items={packs} />

          {/*
           * The Packs tab used to be locked in code. It now opens as soon as
           * anything is published there, so this states the rule rather than
           * leaving an admin wondering why their pack is invisible.
           */}
          {publishedPacks === 0 && (
            <p className="mt-4 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2.5 text-[12.5px] leading-relaxed text-[var(--text-muted)]">
              The Packs tab stays locked for students until at least one pack
              is visible.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

import ResourceContent from "@/components/resource/ResourceContent";
import { getPublishedResourceItems } from "@/lib/db/resources";

export default async function ResourcesPage() {
  const { packs, tools } = await getPublishedResourceItems();

  return (
    <main>
      {/*
       * No "Resources" heading. The title was a section label that told the
       * student what page they are on — something the bottom nav already
       * communicates at a glance — rather than what to do next. A one-line
       * description does the job better: it gives the section a purpose
       * without costing a row for a label that repeated the navigation.
       */}
      <p className="mb-5 px-0.5 text-[13px] leading-relaxed text-[var(--text-muted)]">
        Check out our recommended tools and Creative packs
      </p>

      <ResourceContent packs={packs} tools={tools} />
    </main>
  );
}

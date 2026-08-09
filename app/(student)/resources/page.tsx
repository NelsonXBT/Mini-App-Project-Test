import ResourceContent from "@/components/resource/ResourceContent";
import { PageTitle } from "@/components/ui";
import { getPublishedResourceItems } from "@/lib/db/resources";

export default async function ResourcesPage() {
  const { packs, tools } = await getPublishedResourceItems();

  return (
    <main>
      <PageTitle>Resources</PageTitle>

      <ResourceContent packs={packs} tools={tools} />
    </main>
  );
}

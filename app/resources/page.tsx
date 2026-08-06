import ResourceContent from "@/components/resource/ResourceContent";
import { PageTitle } from "@/components/ui";

export default function ResourcesPage() {
  return (
    <main>
      <div className="mx-auto max-w-3xl">
        <PageTitle className="mb-5">
          Resources
        </PageTitle>

        <ResourceContent />
      </div>
    </main>
  );
}
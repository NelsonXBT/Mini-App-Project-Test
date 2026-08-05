import ResourceContent from "@/components/resource/ResourceContent";

export default function ResourcesPage() {
  return (
    <main className="space-y-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-2xl font-bold text-white">
          Resources
        </h1>

        <ResourceContent />
      </div>
    </main>
  );
}
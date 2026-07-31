import ResourceContent from "@/components/resource/ResourceContent";

export default function ResourcesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-6 text-3xl font-bold text-white">
        Resources
      </h1>

      <ResourceContent />
    </main>
  );
}
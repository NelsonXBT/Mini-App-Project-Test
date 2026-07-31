import CommunityContent from "@/components/community/CommunityContent";

export default function CommunityPage() {
  return (
    <main className="space-y-4">
      <div className="mx-auto max-w-md">
        <h1 className="mb-3 text-2xl font-bold text-white">
          Community
        </h1>

        <CommunityContent />
      </div>
    </main>
  );
}
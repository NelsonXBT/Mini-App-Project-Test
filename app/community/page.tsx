import CommunityContent from "@/components/community/CommunityContent";

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-6">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-3xl font-bold text-white">
          Community
        </h1>

        <CommunityContent />
      </div>
    </main>
  );
}
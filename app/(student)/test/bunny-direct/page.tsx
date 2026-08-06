export default function BunnyDirectTest() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">
        Bunny Direct Player
      </h1>

      <iframe
        src="https://player.mediadelivery.net/play/717891/b46ce3e3-a752-42eb-af1c-a14800d344d9"
        className="aspect-video w-full rounded-xl"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </main>
  );
}
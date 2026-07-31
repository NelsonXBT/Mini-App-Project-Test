export default function BunnyIframeTest() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">
        Bunny Embed Test
      </h1>

      <div className="relative aspect-video overflow-hidden rounded-xl">
        <iframe
          src="https://player.mediadelivery.net/embed/717891/b46ce3e3-a752-42eb-af1c-a14800d344d9?autoplay=false"
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen;"
          allowFullScreen
        />
      </div>
    </main>
  );
}
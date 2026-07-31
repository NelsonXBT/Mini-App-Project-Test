"use client";

export default function BunnyHlsTest() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">
        Test 3 — Native HTML5 (HLS)
      </h1>

      <div className="overflow-hidden rounded-xl bg-black">
        <video
          src="https://vz-4b93e9b4-6e7.b-cdn.net/b46ce3e3-a752-42eb-af1c-a14800d344d9/playlist.m3u8"
          autoPlay
          muted
          playsInline
          controls={false}
          className="w-full"
        />
      </div>

      <p className="mt-4 text-sm text-zinc-400">
        Native HTML5 player with controls hidden.
      </p>
    </main>
  );
}
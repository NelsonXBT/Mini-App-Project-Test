import IMEPlayer from "@/components/player/IMEPlayer";

export default function ResourcesPage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      {/* <h1 className="mb-6 text-3xl font-bold">
        IME Player Test
      </h1> */}

      <IMEPlayer
        src="https://vz-4b93e9b4-6e7.b-cdn.net/b46ce3e3-a752-42eb-af1c-a14800d344d9/playlist.m3u8"
      />
    </main>
  );
}
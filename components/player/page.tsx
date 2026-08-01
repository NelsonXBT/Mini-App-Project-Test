import IMEPlayer from "@/components/player/IMEPlayer";

export default function PlayerPage() {
  return (
    <div className="fixed inset-0 bg-black">
      <IMEPlayer
        src="https://vz-4b93e9b4-6e7.b-cdn.net/b46ce3e3-a752-42eb-af1c-a14800d344d9/playlist.m3u8"
      />
    </div>
  );
}
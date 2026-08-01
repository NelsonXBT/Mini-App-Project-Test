import IMEPlayer from "@/components/player/IMEPlayer";

type VideoPlayerProps = {
  provider: string;
  videoId: string;
};

export default function VideoPlayer({
  provider,
  videoId,
}: VideoPlayerProps) {
  if (provider === "bunny") {
    return (
      <div className="mb-3 overflow-hidden rounded-xl border border-zinc-800 bg-black">
        <IMEPlayer src={videoId} />
      </div>
    );
  }

  return (
    <div className="mb-3 overflow-hidden rounded-xl border border-red-900 bg-red-950 p-6 text-center text-red-300">
      Unsupported video provider: {provider}
    </div>
  );
}
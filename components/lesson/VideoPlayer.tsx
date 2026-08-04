import IMEPlayer from "@/components/player/IMEPlayer";

type VideoPlayerProps = {
  lessonId: string;
  provider: string;
  videoId: string;
  startTime: number;
  onEnded?: () => void;
};

export default function VideoPlayer({
  lessonId,
  provider,
  videoId,
  startTime,
  onEnded,
}: VideoPlayerProps) {
  if (provider === "bunny") {
    return (
      <div className="mb-3 overflow-hidden rounded-xl border border-zinc-800 bg-black">
        <IMEPlayer
      lessonId={lessonId}
      src={videoId}
      startTime={startTime}
      onEnded={onEnded}
    />
      </div>
    );
  }

  return (
    <div className="mb-3 overflow-hidden rounded-xl border border-red-900 bg-red-950 p-6 text-center text-red-300">
      Unsupported video provider: {provider}
    </div>
  );
}
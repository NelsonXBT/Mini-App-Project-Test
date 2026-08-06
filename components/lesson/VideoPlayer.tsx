import IMEPlayer from "@/components/player/IMEPlayer";

type VideoPlayerProps = {
  lessonId: string;
  provider: string;
  videoId: string;
  onEnded?: () => void;
};

export default function VideoPlayer({
  lessonId,
  provider,
  videoId,
  onEnded,
}: VideoPlayerProps) {
  if (provider === "bunny") {
    return (
      <div
        className="
          overflow-hidden
          rounded-xl
          border
          border-[var(--border)]
          bg-black
        "
      >
        <IMEPlayer
          lessonId={lessonId}
          src={videoId}
          onEnded={onEnded}
        />
      </div>
    );
  }

  return (
    <div
      className="
        rounded-xl
        border
        border-[var(--border)]
        bg-[var(--card)]
        p-6
        text-center
      "
    >
      <p className="font-medium text-[var(--text)]">
        Unsupported video provider
      </p>

      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Provider: {provider}
      </p>
    </div>
  );
}
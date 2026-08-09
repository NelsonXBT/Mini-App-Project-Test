import Daluplayer from "@/components/player/Daluplayer";
import { lessonPosterUrl } from "@/lib/player/poster";

type VideoPlayerProps = {
  lessonId: string;
  provider: string;
  videoId: string;
  countdown?: number | null;
  autoPlay?: boolean;
  resumeAt?: number;
  onEnded?: () => void;
};

export default function VideoPlayer({
  lessonId,
  provider,
  videoId,
  countdown,
  autoPlay,
  resumeAt,
  onEnded,
}: VideoPlayerProps) {
  if (provider === "bunny") {
    /*
     * Derived here rather than in Daluplayer: this is the one component that
     * already holds both provider and videoId, and it keeps the player itself
     * unaware of where any particular host puts its thumbnails.
     */
    const poster = lessonPosterUrl({ provider, videoId });

    return (
      <div
        className="
          overflow-hidden
          rounded-[var(--radius)]
          border
          border-[var(--border)]
          bg-black
        "
      >
        <Daluplayer
        lessonId={lessonId}
        src={videoId}
        poster={poster}
        countdown={countdown}
        autoPlay={autoPlay}
        resumeAt={resumeAt}
        onEnded={onEnded}
      />
      </div>
    );
  }

  return (
    <div
      className="
        rounded-[var(--radius)]
        border
        border-[var(--border)]
        bg-[var(--card)]
        p-6
        text-center
        shadow-[var(--shadow-card)]
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
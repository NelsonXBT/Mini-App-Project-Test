type VideoPlayerProps = {
  provider: string;
  videoId: string;
};

export default function VideoPlayer({
  provider,
  videoId,
}: VideoPlayerProps) {
  if (provider === "youtube") {
    return (
      <div className="mb-3 overflow-hidden rounded-xl border border-zinc-800 bg-black">
        <div className="aspect-video">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Lesson Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (provider === "bunny") {
    return (
      <div className="mb-3 overflow-hidden rounded-xl border border-zinc-800 bg-black">
        <div className="aspect-video flex items-center justify-center text-zinc-400">
          Bunny Stream player coming soon.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3 overflow-hidden rounded-xl border border-red-900 bg-red-950 p-6 text-center text-red-300">
      Unsupported video provider: {provider}
    </div>
  );
}
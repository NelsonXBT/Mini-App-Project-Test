"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type VideoPlayerProps = {
  videoUrl: string;
  thumbnail: string;
};

export default function VideoPlayer({
  videoUrl,
  thumbnail,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const handlePlay = () => {
    setStarted(true);

    setTimeout(() => {
      videoRef.current?.play();
    }, 50);
  };

  return (
    <div className="mb-3 overflow-hidden rounded-xl border border-zinc-800 bg-black">
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          src={videoUrl}
          controls={started}
          controlsList="nodownload"
          className="h-full w-full object-cover"
        />

        {!started && (
          <>
            <Image
              src={thumbnail}
              alt="Lesson Thumbnail"
              fill
              priority
              className="object-cover"
            />

            <button
              onClick={handlePlay}
              aria-label="Play lesson"
              className="absolute inset-0 flex items-center justify-center bg-black/25 transition hover:bg-black/35"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500 text-3xl text-black shadow-lg transition-transform hover:scale-105">
                ▶
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
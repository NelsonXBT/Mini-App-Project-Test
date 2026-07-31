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
    videoRef.current?.play();
  };

  return (
    <div className="mb-6 overflow-hidden rounded-2xl bg-black">
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          src={videoUrl}
          controls={started}
          className="h-full w-full"
          controlsList="nodownload"
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
              className="absolute inset-0 flex items-center justify-center bg-black/30"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500 text-4xl text-black">
                ▶
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
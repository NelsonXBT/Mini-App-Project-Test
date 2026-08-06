"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function BunnyHTML5Test() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const source =
      "https://vz-4b93e9b4-6e7.b-cdn.net/b46ce3e3-a752-42eb-af1c-a14800d344d9/playlist.m3u8";

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (Hls.isSupported()) {
      const hls = new Hls();

      hls.loadSource(source);
      hls.attachMedia(video);

      return () => {
        hls.destroy();
      };
    }
  }, []);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold">
        Bunny HTML5 HLS Test
      </h1>

      <video
        ref={videoRef}
        controls
        playsInline
        className="aspect-video w-full rounded-xl bg-black"
      />
    </main>
  );
}
"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function VideoLabPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const source =
      "https://vz-4b93e9b4-6e7.b-cdn.net/b46ce3e3-a752-42eb-af1c-a14800d344d9/playlist.m3u8";

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls();

      hls.loadSource(source);
      hls.attachMedia(video);

      return () => {
        hls.destroy();
      };
    }
  }, []);

  return (
    <main className="mx-auto max-w-5xl space-y-10 p-6">

      <h1 className="text-3xl font-bold">
        Bunny Stream Test Lab
      </h1>

      {/* Test 1 */}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          Test 1 — Bunny Embed Player
        </h2>

        <div className="aspect-video overflow-hidden rounded-xl border border-zinc-700">
          <iframe
            src="https://player.mediadelivery.net/embed/717891/b46ce3e3-a752-42eb-af1c-a14800d344d9"
            className="h-full w-full"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen;"
            allowFullScreen
          />
        </div>
      </section>

      {/* Test 2 */}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          Test 2 — Bunny Direct Player
        </h2>

        <div className="aspect-video overflow-hidden rounded-xl border border-zinc-700">
          <iframe
            src="https://player.mediadelivery.net/play/717891/b46ce3e3-a752-42eb-af1c-a14800d344d9"
            className="h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      {/* Test 3 */}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          Test 3 — Native HTML5 (HLS)
        </h2>

        <video
          ref={videoRef}
          controls
          playsInline
          className="aspect-video w-full rounded-xl border border-zinc-700 bg-black"
        />
      </section>

    </main>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        version: string;
        platform: string;
        isExpanded?: boolean;
        requestFullscreen?: () => void;
        exitFullscreen?: () => void;
        expand?: () => void;
      };
    };
  }
}

export default function VideoLabPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [platform, setPlatform] = useState("Unknown");
  const [version, setVersion] = useState("Unknown");
  const [supportsFullscreen, setSupportsFullscreen] =
    useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      const source =
        "https://vz-4b93e9b4-6e7.b-cdn.net/b46ce3e3-a752-42eb-af1c-a14800d344d9/playlist.m3u8";

      if (
        video.canPlayType(
          "application/vnd.apple.mpegurl"
        )
      ) {
        video.src = source;
      } else if (Hls.isSupported()) {
        const hls = new Hls();

        hls.loadSource(source);
        hls.attachMedia(video);

        return () => hls.destroy();
      }
    }

    const tg = window.Telegram?.WebApp;

    if (tg) {
      setPlatform(tg.platform);
      setVersion(tg.version);
      setSupportsFullscreen(
        typeof tg.requestFullscreen === "function"
      );
    }
  }, []);

  function enterFullscreen() {
    const tg = window.Telegram?.WebApp;

    if (!tg) {
      alert("Telegram WebApp not detected.");
      return;
    }

    if (typeof tg.requestFullscreen === "function") {
      tg.requestFullscreen();
    } else {
      alert(
        "requestFullscreen() is not supported on this Telegram version."
      );
    }
  }

  function expandMiniApp() {
    const tg = window.Telegram?.WebApp;

    if (!tg) {
      alert("Telegram WebApp not detected.");
      return;
    }

    if (typeof tg.expand === "function") {
      tg.expand();
    } else {
      alert("expand() is unavailable.");
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-10 p-6">
      <h1 className="text-3xl font-bold">
        Bunny Stream Test Lab
      </h1>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-2">
        <p>
          <strong>Platform:</strong> {platform}
        </p>

        <p>
          <strong>Telegram Version:</strong> {version}
        </p>

        <p>
          <strong>requestFullscreen():</strong>{" "}
          {supportsFullscreen
            ? "✅ Supported"
            : "❌ Not Supported"}
        </p>

        <div className="flex flex-col gap-3 pt-3">
          <button
            onClick={enterFullscreen}
            className="rounded-xl bg-cyan-500 px-5 py-4 text-lg font-bold text-black"
          >
            Enter Telegram Fullscreen
          </button>

          <button
            onClick={expandMiniApp}
            className="rounded-xl border border-cyan-500 px-5 py-4 font-semibold text-cyan-400"
          >
            Expand Mini App
          </button>
        </div>
      </div>

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
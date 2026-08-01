"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        version: string;
        platform: string;
        viewportHeight?: number;
        viewportStableHeight?: number;
        requestFullscreen?: () => Promise<void>;
        exitFullscreen?: () => Promise<void>;
      };
    };
  }
}

export default function VideoLabPage() {
  const [theaterMode, setTheaterMode] = useState(false);

  const [info, setInfo] = useState({
    platform: "",
    version: "",
    viewportHeight: 0,
    viewportStableHeight: 0,
  });

  function refreshInfo() {
    const tg = window.Telegram?.WebApp;

    if (!tg) return;

    setInfo({
      platform: tg.platform,
      version: tg.version,
      viewportHeight: tg.viewportHeight ?? 0,
      viewportStableHeight:
        tg.viewportStableHeight ?? 0,
    });
  }

  useEffect(() => {
    refreshInfo();

    window.addEventListener("resize", refreshInfo);

    return () =>
      window.removeEventListener(
        "resize",
        refreshInfo
      );
  }, []);

  async function enterPlayer() {
    const tg = window.Telegram?.WebApp;

    if (tg?.requestFullscreen) {
      await tg.requestFullscreen();
    }

    refreshInfo();

    setTheaterMode(true);
  }

  async function exitPlayer() {
    const tg = window.Telegram?.WebApp;

    if (tg?.exitFullscreen) {
      await tg.exitFullscreen();
    }

    refreshInfo();

    setTheaterMode(false);
  }

  if (theaterMode) {
    return (
      <div className="fixed inset-0 z-[99999] bg-black">

        {/* Exit Button */}

        <button
          onClick={exitPlayer}
          className="
            absolute
            right-4
            top-4
            z-50
            rounded-full
            bg-red-600/90
            px-5
            py-3
            font-bold
            text-white
            backdrop-blur
          "
        >
          Exit
        </button>

        {/* Player */}

        <div className="flex h-full w-full items-center justify-center p-2">

          <div
            className="
              aspect-video
              w-full
              max-w-full
              max-h-full
            "
          >
            <iframe
              src="https://player.mediadelivery.net/embed/717891/b46ce3e3-a752-42eb-af1c-a14800d344d9"
              className="h-full w-full rounded-xl"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>

        </div>

      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-6">

      <h1 className="text-3xl font-bold">
        Bunny Fullscreen Prototype
      </h1>

      <div className="rounded-xl bg-zinc-900 p-5">

        <p>
          <strong>Platform:</strong>{" "}
          {info.platform}
        </p>

        <p>
          <strong>Telegram:</strong>{" "}
          {info.version}
        </p>

        <p>
          <strong>Viewport:</strong>{" "}
          {info.viewportHeight}
        </p>

        <p>
          <strong>Stable Height:</strong>{" "}
          {info.viewportStableHeight}
        </p>

      </div>

      <div className="aspect-video overflow-hidden rounded-xl">

        <iframe
          src="https://player.mediadelivery.net/embed/717891/b46ce3e3-a752-42eb-af1c-a14800d344d9"
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />

      </div>

      <button
        onClick={enterPlayer}
        className="w-full rounded-xl bg-cyan-500 py-4 text-xl font-bold text-black"
      >
        Watch Fullscreen
      </button>

    </main>
  );
}
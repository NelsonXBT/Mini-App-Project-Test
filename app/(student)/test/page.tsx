"use client";

import { useEffect, useState } from "react";


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
      <div className="fixed inset-0 z-[9999] flex flex-col bg-black">

        <div className="flex items-center justify-between p-4">

          <h2 className="font-bold text-white">
            Fullscreen Test
          </h2>

          <button
            onClick={exitPlayer}
            className="rounded-lg bg-red-500 px-4 py-2 font-semibold"
          >
            Exit
          </button>

        </div>

        <div className="flex-1 flex items-center justify-center">

          <div className="aspect-video w-full">

            <iframe
              src="https://player.mediadelivery.net/embed/717891/b46ce3e3-a752-42eb-af1c-a14800d344d9"
              className="h-full w-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />

          </div>

        </div>

        <div className="border-t border-zinc-800 p-4 text-sm text-zinc-400">

          <p>Viewport: {info.viewportHeight}</p>

          <p>
            Stable Height:{" "}
            {info.viewportStableHeight}
          </p>

        </div>

      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">

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
        className="w-full rounded-xl bg-cyan-500 py-4 text-lg font-bold text-black"
      >
        Watch Fullscreen
      </button>

    </main>
  );
}
"use client";

import { useEffect, useState } from "react";

export default function ResourceContent() {
  const [info, setInfo] = useState<any>(null);

  function updateInfo() {
    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      setInfo({
        detected: false,
        message: "Telegram WebApp API not detected",
      });
      return;
    }

    setInfo({
      detected: true,
      platform: tg.platform,
      version: tg.version,

      isExpanded: tg.isExpanded,

      requestFullscreen:
        typeof tg.requestFullscreen === "function",

      exitFullscreen:
        typeof tg.exitFullscreen === "function",

      expand:
        typeof tg.expand === "function",

      lockOrientation:
        typeof tg.lockOrientation === "function",

      viewportHeight: tg.viewportHeight,

      viewportStableHeight:
        tg.viewportStableHeight,
    });
  }

  useEffect(() => {
    updateInfo();

    const tg = (window as any).Telegram?.WebApp;

    if (!tg) return;

    const handleViewport = () => {
      console.log("Viewport Changed");

      updateInfo();
    };

    tg.onEvent?.("viewportChanged", handleViewport);

    return () => {
      tg.offEvent?.("viewportChanged", handleViewport);
    };
  }, []);

  async function requestFullscreen() {
    const tg = (window as any).Telegram?.WebApp;

    if (!tg?.requestFullscreen) {
      alert("Fullscreen unavailable");
      return;
    }

    try {
      console.log("Calling requestFullscreen()...");

      const result = await tg.requestFullscreen();

      console.log("Result:", result);

      updateInfo();

      alert("requestFullscreen() finished successfully.");
    } catch (err: any) {
      console.error(err);

      alert(
        "Fullscreen failed:\n\n" +
          JSON.stringify(err, null, 2)
      );
    }
  }

  async function exitFullscreen() {
    const tg = (window as any).Telegram?.WebApp;

    if (!tg?.exitFullscreen) {
      alert("Exit Fullscreen unavailable");
      return;
    }

    try {
      const result = await tg.exitFullscreen();

      console.log("Exit Result:", result);

      updateInfo();

      alert("exitFullscreen() finished.");
    } catch (err: any) {
      console.error(err);

      alert(
        "Exit failed:\n\n" +
          JSON.stringify(err, null, 2)
      );
    }
  }

  function expandApp() {
    const tg = (window as any).Telegram?.WebApp;

    if (!tg?.expand) {
      alert("Expand unavailable");
      return;
    }

    tg.expand();

    updateInfo();
  }

  function lockLandscape() {
    const tg = (window as any).Telegram?.WebApp;

    if (!tg?.lockOrientation) {
      alert("Landscape unavailable");
      return;
    }

    try {
      tg.lockOrientation("landscape");

      alert("Landscape requested.");
    } catch (err: any) {
      console.error(err);

      alert(JSON.stringify(err, null, 2));
    }
  }

  return (
    <div className="space-y-5">

      <h2 className="text-2xl font-bold">
        Telegram Fullscreen Diagnostics
      </h2>

      <div className="rounded-xl bg-zinc-900 p-5">
        <pre className="whitespace-pre-wrap text-sm text-zinc-300">
          {JSON.stringify(info, null, 2)}
        </pre>
      </div>

      <div className="grid gap-3">

        <button
          onClick={requestFullscreen}
          className="rounded-xl bg-cyan-500 p-4 font-bold text-black"
        >
          Request Fullscreen
        </button>

        <button
          onClick={expandApp}
          className="rounded-xl border border-cyan-500 p-4"
        >
          Expand Mini App
        </button>

        <button
          onClick={lockLandscape}
          className="rounded-xl border border-green-500 p-4"
        >
          Lock Landscape
        </button>

        <button
          onClick={exitFullscreen}
          className="rounded-xl border border-red-500 p-4"
        >
          Exit Fullscreen
        </button>

      </div>
    </div>
  );
}
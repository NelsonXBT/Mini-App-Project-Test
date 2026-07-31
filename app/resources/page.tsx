"use client";

import { useEffect, useState } from "react";

export default function ResourceContent() {
  const [info, setInfo] = useState<any>(null);


  useEffect(() => {
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

      viewportHeight:
        tg.viewportHeight,

      viewportStableHeight:
        tg.viewportStableHeight,
    });

  }, []);



  function requestFullscreen() {
    const tg = (window as any).Telegram?.WebApp;

    if (tg?.requestFullscreen) {
      tg.requestFullscreen();
    } else {
      alert("Fullscreen unavailable");
    }
  }



  function expandApp() {
    const tg = (window as any).Telegram?.WebApp;

    if (tg?.expand) {
      tg.expand();
    } else {
      alert("Expand unavailable");
    }
  }



  function lockLandscape() {
    const tg = (window as any).Telegram?.WebApp;

    if (tg?.lockOrientation) {
      tg.lockOrientation("landscape");
    } else {
      alert("Landscape lock unavailable");
    }
  }



  function exitFullscreen() {
    const tg = (window as any).Telegram?.WebApp;

    if (tg?.exitFullscreen) {
      tg.exitFullscreen();
    } else {
      alert("Exit fullscreen unavailable");
    }
  }



  return (
    <div className="space-y-5">

      <h2 className="text-2xl font-bold">
        Telegram Fullscreen Test
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
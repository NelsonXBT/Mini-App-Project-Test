"use client";

import { useEffect, useRef, useState } from "react";
import {
  Minimize2,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

import LoadingSpinner from "./LoadingSpinner";
import PlayButton from "./PlayButton";
import VideoCanvas from "./VideoCanvas";
import PlayerControls from "./PlayerControls";

import type { IMEPlayerProps } from "./types";

export default function FullscreenPlayer({
  src,
}: IMEPlayerProps) {
  const router = useRouter();

  const videoRef =
    useRef<HTMLVideoElement>(null);

  const controlsTimeout =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const [playing, setPlaying] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [duration, setDuration] =
    useState(0);

  const [current, setCurrent] =
    useState(0);

  const [volume, setVolume] =
    useState(1);

  const [controlsVisible, setControlsVisible] =
    useState(true);

  const [isMobile, setIsMobile] =
    useState(false);

  const [showRotateOverlay, setShowRotateOverlay] =
    useState(false);

  function showControls() {
  setControlsVisible(true);

  if (controlsTimeout.current) {
    clearTimeout(controlsTimeout.current);
  }

  if (playing) {
    controlsTimeout.current = setTimeout(() => {
      setControlsVisible(false);
    }, 2000);
  }
}

  useEffect(() => {
    const keyboard = (e: KeyboardEvent) => {
      const video = videoRef.current;

      if (!video) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;

        case "ArrowRight":
          video.currentTime += 10;
          break;

        case "ArrowLeft":
          video.currentTime -= 10;
          break;
      }
    };

    window.addEventListener(
      "keydown",
      keyboard
    );

    return () => {
      window.removeEventListener(
        "keydown",
        keyboard
      );

      if (controlsTimeout.current) {
        clearTimeout(
          controlsTimeout.current
        );
      }
    };
  }, [playing]);

  useEffect(() => {
    async function setupPlayer() {
      const tg =
        (window as any).Telegram?.WebApp;

      if (tg?.requestFullscreen) {
        try {
          await tg.requestFullscreen();
        } catch {}
      }

      try {
        await (
          screen.orientation as ScreenOrientation & {
            lock: (
              orientation: string
            ) => Promise<void>;
          }
        ).lock("landscape");
      } catch {}

      const mobile =
        window.innerWidth < 768;

      const landscape =
        window.innerWidth >
        window.innerHeight;

      setIsMobile(mobile);

      setShowRotateOverlay(
        mobile && !landscape
      );
    }

    setupPlayer();

    const updateLayout = () => {
      const mobile =
        window.innerWidth < 768;

      const landscape =
        window.innerWidth >
        window.innerHeight;

      setIsMobile(mobile);

      setShowRotateOverlay(
        mobile && !landscape
      );
    };

    window.addEventListener(
      "resize",
      updateLayout
    );

    window.addEventListener(
      "orientationchange",
      updateLayout
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateLayout
      );

      window.removeEventListener(
        "orientationchange",
        updateLayout
      );
    };
  }, []);

  function togglePlay() {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  function backward10() {
  const video = videoRef.current;

  if (!video) return;

  video.currentTime = Math.max(
    0,
    video.currentTime - 10
  );
}

function forward10() {
  const video = videoRef.current;

  if (!video) return;

  video.currentTime = Math.min(
    video.duration,
    video.currentTime + 10
  );
}

  function toggleControls() {
  if (controlsVisible) {
    setControlsVisible(false);

    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
  } else {
    showControls();

    if (playing) {
      controlsTimeout.current = setTimeout(() => {
        setControlsVisible(false);
      }, 2000);
    }
  }
}

  function seek(time: number) {
    const video = videoRef.current;

    if (!video) return;

    video.currentTime = time;
  }

  function changeVolume(value: number) {
    const video = videoRef.current;

    if (!video) return;

    video.volume = value;

    setVolume(value);
  }

  async function exitPlayer() {
  try {
    screen.orientation.unlock();
  } catch {}

  const tg =
    (window as any).Telegram?.WebApp;

  if (tg?.exitFullscreen) {
    try {
      await tg.exitFullscreen();
    } catch {}
  }

  router.back();
}  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">

      <VideoCanvas
        ref={videoRef}
        src={src}
        onLoaded={(duration) => {
          setDuration(duration);
          setLoading(false);
        }}
        onTimeUpdate={setCurrent}
        onPlay={() => {
          setPlaying(true);
          showControls();
        }}
        onPause={() => {
          setPlaying(false);
          setControlsVisible(true);
        }}
        onLoading={setLoading}
        onClick={toggleControls}
      />

      {loading && <LoadingSpinner />}

     {showRotateOverlay && (
        <div
          onClick={exitPlayer}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[2px]"
        >
          <div
            className="flex flex-col items-center text-white"
            onClick={(e) => e.stopPropagation()}
          >

            <p className="text-xl font-semibold">
              Rotate your phone
            </p>

            <p className="mt-2 text-sm text-white/70">
              or tap below to exit fullscreen
            </p>

            <button
              onClick={exitPlayer}
              className="
                mt-6
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-white/10
                backdrop-blur-md
                transition
                hover:bg-white/20
              "
            >
              <Minimize2
                size={28}
                strokeWidth={2.8}
                className="text-white"
              />
            </button>
          </div>
        </div>
      )}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          controlsVisible
            ? "opacity-100"
            : "opacity-0"
        }`}
        onMouseMove={showControls}
        onTouchStart={toggleControls}
      >
        {/* Center Play Button */}

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

  <div className="pointer-events-auto flex items-center gap-8">

    {/* Back 10 seconds */}

    <button
      onClick={backward10}
      className="
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-full
        bg-black/25
        backdrop-blur-sm
        text-white
        transition
        active:scale-95
      "
    >
      <div className="relative">

        <RotateCcw
          size={24}
          strokeWidth={2.4}
        />

        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">
          10
        </span>

      </div>
    </button>

    {/* Play */}

    <PlayButton
      playing={playing}
      onClick={togglePlay}
    />

    {/* Forward 10 seconds */}

    <button
      onClick={forward10}
      className="
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-full
        bg-black/25
        backdrop-blur-sm
        text-white
        transition
        active:scale-95
      "
    >
      <div className="relative">

                <RotateCw
                  size={24}
                  strokeWidth={2.4}
                />

              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">
                10
              </span>

            </div>
          </button>

        </div>

      </div>
          {/* Top Bar */}

        {/* <div className="absolute left-4 top-4 z-40">

          <button
            onClick={exitPlayer}
            className="rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur"
          >
            ← Back
          </button>

        </div> */}

        {/* Bottom Controls */}

        <PlayerControls
          current={current}
          duration={duration}
          volume={volume}
          isMobile={isMobile}
          isFullscreen
          onSeek={seek}
          onVolume={changeVolume}
          onFullscreen={exitPlayer}
        />

      </div>

    </div>
  );
}
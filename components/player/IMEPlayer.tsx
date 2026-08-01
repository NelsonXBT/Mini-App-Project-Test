"use client";

import { useEffect, useRef, useState } from "react";

import LoadingSpinner from "./LoadingSpinner";
import PlayButton from "./PlayButton";
import VideoCanvas from "./VideoCanvas";
import PlayerControls from "./PlayerControls";

import type { IMEPlayerProps } from "./types";

export default function IMEPlayer({
  src,
}: IMEPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const controlsTimeout =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  const [volume, setVolume] = useState(1);

  const [controlsVisible, setControlsVisible] =
    useState(true);

  const [isMobile, setIsMobile] =
    useState(false);

  const [showRotateOverlay, setShowRotateOverlay] =
    useState(false);

  const [fullscreenRequested, setFullscreenRequested] =
    useState(false);
  const [isFullscreen, setIsFullscreen] =
    useState(false);

  function showControls() {
    setControlsVisible(true);

    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }

    controlsTimeout.current = setTimeout(() => {
      if (playing) {
        setControlsVisible(false);
      }
    }, 3000);
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
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [playing]);

  useEffect(() => {
    const updateLayout = () => {
      const mobile =
        window.innerWidth < 768;

      const landscape =
        window.innerWidth >
        window.innerHeight;

      setIsMobile(mobile);

      if (fullscreenRequested) {
        setShowRotateOverlay(
          mobile && !landscape
        );
      }
    };

    updateLayout();

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
  }, [fullscreenRequested]);


    useEffect(() => {
    if (showRotateOverlay) {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
    }

    return () => {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
    };
    }, [showRotateOverlay]);

  function togglePlay() {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
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

  async function fullscreen()  {

    if (isFullscreen) {
        const tg = (window as any).Telegram?.WebApp;

        if (tg?.exitFullscreen) {
            await tg.exitFullscreen();
        }

        document.documentElement.classList.remove("player-fullscreen");

        setIsFullscreen(false);
        setFullscreenRequested(false);
        setShowRotateOverlay(false);

        return;
        }

    setFullscreenRequested(true);

    const tg = (window as any).Telegram?.WebApp;

    if (tg?.requestFullscreen) {
      await tg.requestFullscreen();
      setIsFullscreen(true);
      document.documentElement.classList.add("player-fullscreen");

      try {
        await (
            screen.orientation as ScreenOrientation & {
            lock: (orientation: string) => Promise<void>;
            }
        ).lock("landscape");
        } catch {
        // Ignore if orientation lock isn't supported
        }

      setTimeout(() => {
        const landscape =
            window.innerWidth >
            window.innerHeight;

        setShowRotateOverlay(
            isMobile &&
            !landscape
        );
        }, 300);

      return;
    }

    if (wrapperRef.current?.requestFullscreen) {
      await wrapperRef.current.requestFullscreen();
    }
  }

  return (
    <>
      <div
            ref={wrapperRef}
            className={`relative overflow-hidden bg-black ${
                showRotateOverlay
                ? "fixed inset-0 z-50 rounded-none overflow-hidden touch-none"
                : "aspect-video w-full rounded-2xl"
            }`}
            onMouseMove={showControls}
            onTouchStart={showControls}
            >
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
          onClick={togglePlay}
        />

        {loading && <LoadingSpinner />}

        {showRotateOverlay && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90">
            <div className="flex flex-col items-center gap-4 text-white">

              <div className="text-5xl">
                🔄
              </div>

              <p className="text-center text-sm font-semibold">
                Rotate your phone to landscape
              </p>

            </div>
          </div>
        )}

        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            controlsVisible
              ? "opacity-100"
              : "opacity-0"
          }`}
        >
          {/* Center Play Button */}

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

            <div className="pointer-events-auto">

              <PlayButton
                playing={playing}
                onClick={togglePlay}
              />

            </div>

          </div>

          {/* Bottom Controls */}

          <PlayerControls
        current={current}
        duration={duration}
        volume={volume}
        isMobile={isMobile}
        isFullscreen={isFullscreen}
        onSeek={seek}
        onVolume={changeVolume}
        onFullscreen={fullscreen}
        />

        </div>

      </div>

      {/* Temporary fullscreen button below player */}

      
    </>
  );
}
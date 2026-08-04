"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import LoadingSpinner from "./LoadingSpinner";
import PlayButton from "./PlayButton";
import VideoCanvas from "./VideoCanvas";
import PlayerControls from "./PlayerControls";
import { saveLessonProgress } from "@/app/actions/progress";
import { saveAndNavigate } from "@/lib/player/navigation";

import type { IMEPlayerProps } from "./types";

export default function IMEPlayer({
  lessonId,
  src,
  onEnded,
}: IMEPlayerProps) {
const router = useRouter();
const pathname = usePathname();
const isPlayerPage = pathname === "/player";

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


      useEffect(() => {
        function handlePageHide() {
          saveProgress();
        }

        function handleVisibilityChange() {
          if (document.visibilityState === "hidden") {
            saveProgress();
          }
        }

        window.addEventListener("pagehide", handlePageHide);

        document.addEventListener(
          "visibilitychange",
          handleVisibilityChange
        );

        return () => {
          window.removeEventListener(
            "pagehide",
            handlePageHide
          );

          document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange
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


async function saveProgress() {
  const video = videoRef.current;

  if (!video) return;

  if (!video.duration) return;

  await saveLessonProgress({
    lessonId,
    currentTime: Math.floor(video.currentTime),
    progress:
      (video.currentTime / video.duration) * 100,
  });
}


  async function fullscreen() {
  await saveAndNavigate(
    saveProgress,
    () => {
      router.push(`/player?lessonId=${lessonId}`);
    }
  );
}

  return (
    <>
      <div
            ref={wrapperRef}
            className={`relative overflow-hidden bg-black ${
                showRotateOverlay
                ? "fixed left-0 right-0 top-12 bottom-0 z-50 rounded-none overflow-hidden touch-none flex items-center justify-center"
                : "aspect-video w-full rounded-2xl"
            }`}
            onMouseMove={showControls}
            
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

            saveProgress();
          }}
          onLoading={setLoading}
          onEnded={onEnded}
          onClick={toggleControls}
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
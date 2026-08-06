"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { LoaderCircle, RotateCcw, RotateCw, Minimize2 } from "lucide-react";

import LoadingSpinner from "./LoadingSpinner";
import PlayButton from "./PlayButton";
import VideoCanvas from "./VideoCanvas";
import PlayerControls from "./PlayerControls";
import { saveProgress } from "@/lib/player/progress";

export interface DaluplayerProps {
  lessonId: string;
  src: string;
  countdown?: number | null;
  onEnded?: () => void;
  title?: string;
  poster?: string;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

/**
 * Daluplayer - Unified video player for Telegram Mini Apps
 * Handles both normal and fullscreen modes seamlessly within Telegram
 *
 * Key features:
 * - Works in normal embedded mode (aspect-video)
 * - Fullscreen mode using Telegram's native WebApp API (bypasses iframe restrictions)
 * - Maintains playback state across mode transitions
 * - Auto-hides controls during playback
 * - Landscape orientation lock in fullscreen
 * - Keyboard shortcuts (Space, Arrow keys)
 * - Progress auto-save
 */
export default function Daluplayer({
  lessonId,
  src,
  countdown,
  onEnded,
  title,
  poster,
  onFullscreenChange,
}: DaluplayerProps) {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Playback state
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  // UI state
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showRotateOverlay, setShowRotateOverlay] = useState(false);

  const CONTROLS_TIMEOUT = 2000;

  // Show controls and auto-hide after timeout
  const showControls = useCallback(() => {
    setControlsVisible(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (playing) {
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, CONTROLS_TIMEOUT);
    }
  }, [playing]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, []);

  // Toggle controls visibility
  const toggleControls = useCallback(() => {
    if (controlsVisible) {
      setControlsVisible(false);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
      showControls();
    }
  }, [controlsVisible, showControls]);

  // Seek to specific time
  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
  }, []);

  // Skip backward 10 seconds
  const backward10 = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 10);
  }, []);

  // Skip forward 10 seconds
  const forward10 = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
  }, []);

  // Change volume
  const changeVolume = useCallback((value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    setVolume(value);
  }, []);

  // Save progress to database
  const saveCurrentProgress = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    await saveProgress({
      lessonId,
      currentTime: video.currentTime,
      duration: video.duration,
    });
  }, [lessonId]);

  // Enter fullscreen mode
  const enterFullscreen = useCallback(async () => {
    await saveCurrentProgress();

    const tg = (window as any).Telegram?.WebApp;

    // Request Telegram's native fullscreen (bypasses iframe restrictions)
    if (tg?.requestFullscreen) {
      try {
        await tg.requestFullscreen();
      } catch (err) {
        console.warn("Telegram requestFullscreen failed:", err);
      }
    }

    // Lock to landscape orientation
    try {
      await (
        screen.orientation as ScreenOrientation & {
          lock: (orientation: string) => Promise<void>;
        }
      ).lock("landscape");
    } catch (err) {
      console.warn("Screen orientation lock failed:", err);
    }

    setIsFullscreen(true);
    onFullscreenChange?.(true);
  }, [saveCurrentProgress, onFullscreenChange]);

  // Exit fullscreen mode
  const exitFullscreen = useCallback(async () => {
    try {
      screen.orientation.unlock();
    } catch (err) {
      console.warn("Screen orientation unlock failed:", err);
    }

    const tg = (window as any).Telegram?.WebApp;

    if (tg?.exitFullscreen) {
      try {
        await tg.exitFullscreen();
      } catch (err) {
        console.warn("Telegram exitFullscreen failed:", err);
      }
    }

    await saveCurrentProgress();

    setIsFullscreen(false);
    setShowRotateOverlay(false);
    onFullscreenChange?.(false);
  }, [saveCurrentProgress, onFullscreenChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
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

        case "KeyF":
          if (isFullscreen) {
            exitFullscreen();
          } else {
            enterFullscreen();
          }
          break;

        case "Escape":
          if (isFullscreen) {
            exitFullscreen();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);

      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [playing, isFullscreen, togglePlay, enterFullscreen, exitFullscreen]);

  // Handle layout changes (orientation, resize)
  useEffect(() => {
    const updateLayout = () => {
      const mobile = window.innerWidth < 768;
      const landscape = window.innerWidth > window.innerHeight;

      setIsMobile(mobile);

      // Show rotate overlay in fullscreen on mobile portrait
      if (isFullscreen) {
        setShowRotateOverlay(mobile && !landscape);
      }
    };

    updateLayout();

    window.addEventListener("resize", updateLayout);
    window.addEventListener("orientationchange", updateLayout);

    return () => {
      window.removeEventListener("resize", updateLayout);
      window.removeEventListener("orientationchange", updateLayout);
    };
  }, [isFullscreen]);

  // Prevent body scroll when rotate overlay is shown
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

  // Auto-save progress on page hide/visibility change
  useEffect(() => {
    const handlePageHide = () => {
      saveCurrentProgress();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        saveCurrentProgress();
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [saveCurrentProgress]);

  return (
    <div
      ref={wrapperRef}
      onMouseMove={showControls}
      className={`relative overflow-hidden bg-black ${
        isFullscreen
          ? "fixed inset-0 z-[9999] flex items-center justify-center rounded-none"
          : "aspect-video w-full rounded-xl"
      }`}
    >
      <VideoCanvas
        ref={videoRef}
        src={src}
        onLoaded={(videoDuration) => {
          setDuration(videoDuration);
          setLoading(false);
        }}
        onTimeUpdate={setCurrentTime}
        onPlay={() => {
          setPlaying(true);
          showControls();
        }}
        onPause={() => {
          setPlaying(false);
          setControlsVisible(true);
          saveCurrentProgress();
        }}
        onLoading={setLoading}
        onEnded={onEnded}
        onClick={toggleControls}
      />

      {loading && <LoadingSpinner />}

      {/* Countdown overlay for next lesson */}
      {countdown !== null && countdown !== undefined && (
        <div className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-black/20 backdrop-blur-[1px]">
          <LoaderCircle className="h-8 w-8 animate-spin text-white/80" />

          <span className="text-lg font-semibold text-white drop-shadow-lg">
            Next lesson in ({countdown})
          </span>
        </div>
      )}

      {/* Rotate device overlay (fullscreen + mobile portrait) */}
      {showRotateOverlay && (
        <div
          onClick={exitFullscreen}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[2px]"
        >
          <div
            className="flex flex-col items-center text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xl font-semibold">Rotate your phone</p>

            <p className="mt-2 text-sm text-white/70">
              or tap below to exit fullscreen
            </p>

            <button
              onClick={exitFullscreen}
              className="mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition hover:bg-white/20"
            >
              <Minimize2 size={28} strokeWidth={2.8} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Controls layer */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Center controls */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className={`pointer-events-auto flex items-center ${
              isFullscreen ? "gap-8" : ""
            }`}
          >
            {/* Skip back 10s — fullscreen only */}
            {isFullscreen && (
              <button
                onClick={backward10}
                aria-label="Rewind 10 seconds"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition active:scale-95"
              >
                <div className="relative">
                  <RotateCcw size={24} strokeWidth={2.4} />

                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">
                    10
                  </span>
                </div>
              </button>
            )}

            <PlayButton playing={playing} onClick={togglePlay} />

            {/* Skip forward 10s — fullscreen only */}
            {isFullscreen && (
              <button
                onClick={forward10}
                aria-label="Forward 10 seconds"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition active:scale-95"
              >
                <div className="relative">
                  <RotateCw size={24} strokeWidth={2.4} />

                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">
                    10
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Bottom controls */}
        <PlayerControls
          current={currentTime}
          duration={duration}
          volume={volume}
          isMobile={isMobile}
          isFullscreen={isFullscreen}
          onSeek={seek}
          onVolume={changeVolume}
          onFullscreen={isFullscreen ? exitFullscreen : enterFullscreen}
        />
      </div>
    </div>
  );
}

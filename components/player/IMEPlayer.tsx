"use client";

import { useEffect, useRef, useState } from "react";

import LoadingSpinner from "./LoadingSpinner";
import PlayButton from "./PlayButton";
import ProgressBar from "./ProgressBar";
import TimeDisplay from "./TimeDisplay";
import VolumeControl from "./VolumeControl";
import FullscreenButton from "./FullscreenButton";
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
    const [isMobile, setIsMobile] = useState(false);

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
    // keyboard shortcuts

}, [playing]);

        useEffect(() => {
            const updateLayout = () => {
                setIsMobile(window.innerWidth < 768);
            };

            updateLayout();

            window.addEventListener(
                "resize",
                updateLayout
            );

            return () => {
                window.removeEventListener(
                    "resize",
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

  async function fullscreen() {
    const tg = (window as any).Telegram?.WebApp;

    if (tg?.requestFullscreen) {
      await tg.requestFullscreen();
      return;
    }

    if (
      wrapperRef.current?.requestFullscreen
    ) {
      await wrapperRef.current.requestFullscreen();
    }
  }

return (
  <>
    <div
      ref={wrapperRef}
      className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black"
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

      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0"
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
          onSeek={seek}
          onVolume={changeVolume}
          onFullscreen={fullscreen}
        />
      </div>
    </div>

    {/* TEMPORARY FULLSCREEN BUTTON BELOW PLAYER */}

    <div className="mt-3 flex justify-center">
      <FullscreenButton
        mobile
        onClick={fullscreen}
      />
    </div>
  </>
);
}


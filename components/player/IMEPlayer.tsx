"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

import LoadingSpinner from "./LoadingSpinner";
import PlayButton from "./PlayButton";
import ProgressBar from "./ProgressBar";
import TimeDisplay from "./TimeDisplay";
import VolumeControl from "./VolumeControl";
import FullscreenButton from "./FullscreenButton";

import type { IMEPlayerProps } from "./types";




export default function IMEPlayer({
  src,
}: IMEPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  const [controlsVisible, setControlsVisible] =
    useState(true);

  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const video = videoRef.current;

    if (!video) return;

    let hls: Hls | undefined;

    if (
      video.canPlayType(
        "application/vnd.apple.mpegurl"
      )
    ) {
      video.src = src;
    } else if (Hls.isSupported()) {
      hls = new Hls();

      hls.loadSource(src);

      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_, data) => {
        console.error("HLS Error:", data);
        setLoading(false);
        });
    }

    const loaded = () => {
      setLoading(false);

      setDuration(video.duration);
    };

    const update = () => {
      setCurrent(video.currentTime);
    };

    const play = () => {
      setPlaying(true);

      showControls();
    };

    const pause = () => {
      setPlaying(false);

      setControlsVisible(true);
    };

    video.addEventListener(
      "loadedmetadata",
      loaded
    );

    video.addEventListener(
      "timeupdate",
      update
    );

    video.addEventListener("play", play);

    video.addEventListener("pause", pause);
    const keyboard = (e: KeyboardEvent) => {
  if (e.code === "Space") {
    e.preventDefault();
    togglePlay();
  }

  if (e.code === "ArrowRight") {
    video.currentTime += 10;
  }

  if (e.code === "ArrowLeft") {
    video.currentTime -= 10;
  }
};

window.addEventListener("keydown", keyboard);

    return () => {
      hls?.destroy();

      video.removeEventListener(
        "loadedmetadata",
        loaded
      );

      video.removeEventListener(
        "timeupdate",
        update
      );

      video.removeEventListener("play", play);

      video.removeEventListener("pause", pause);
      window.removeEventListener(
    "keydown",
    keyboard
    );
    if (controlsTimeout.current) {
    clearTimeout(controlsTimeout.current);
    }
    };
  }, [src]);

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

  function changeVolume(v: number) {
    const video = videoRef.current;

    if (!video) return;

    video.volume = v;

    setVolume(v);
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
      wrapperRef.current.requestFullscreen();
    }
  }

  return (
    <div
      ref={wrapperRef}
      onMouseMove={showControls}
      onTouchStart={showControls}
      className="relative overflow-hidden rounded-2xl bg-black"
    >
      <video
        ref={videoRef}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        className="aspect-video w-full bg-black"
        />

      {loading && <LoadingSpinner />}

      <div
  className={`
    absolute inset-0
    transition-opacity
    duration-300
    ${controlsVisible ? "opacity-100" : "opacity-0"}
  `}
>
  {/* Center Button */}

  <div className="absolute inset-0 flex items-center justify-center">
    <PlayButton
      playing={playing}
      onClick={togglePlay}
    />
  </div>

  {/* Bottom Controls */}

  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 space-y-3">

    <ProgressBar
      current={current}
      duration={duration}
      onSeek={seek}
    />

    <div className="flex items-center justify-between gap-4">

      <TimeDisplay
        current={current}
        duration={duration}
      />

      <div className="flex items-center gap-3">

        <VolumeControl
          volume={volume}
          onChange={changeVolume}
        />

        <FullscreenButton
          onClick={fullscreen}
        />

      </div>

    </div>

  </div>

</div>
    </div>
  );
}
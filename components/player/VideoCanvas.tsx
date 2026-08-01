"use client";

import { forwardRef, useEffect } from "react";
import Hls from "hls.js";

interface Props {
  src: string;
  onLoaded: (duration: number) => void;
  onTimeUpdate: (time: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onLoading: (loading: boolean) => void;
  onClick?: () => void;
}

const VideoCanvas = forwardRef<HTMLVideoElement, Props>(
  (
    {
      src,
      onLoaded,
      onTimeUpdate,
      onPlay,
      onPause,
      onLoading,
      onClick,
    },
    ref
  ) => {
    useEffect(() => {
      const videoRef = ref as React.RefObject<HTMLVideoElement>;
        const video = videoRef.current;

      if (!video) return;

      let hls: Hls | undefined;

      onLoading(true);

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
          console.error(data);

          onLoading(false);
        });
      }

      const loaded = () => {
        onLoading(false);

        onLoaded(video.duration);
      };

      const update = () => {
        onTimeUpdate(video.currentTime);
      };

      video.addEventListener(
        "loadedmetadata",
        loaded
      );

      video.addEventListener(
        "timeupdate",
        update
      );

      video.addEventListener("play", onPlay);

      video.addEventListener("pause", onPause);

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

        video.removeEventListener(
          "play",
          onPlay
        );

        video.removeEventListener(
          "pause",
          onPause
        );
      };
    }, [src]);

    return (
      <video
        ref={ref}
        playsInline
        preload="metadata"
        autoPlay
        muted
        onClick={onClick}
        className="absolute inset-0 h-full w-full object-contain bg-black"
        />
    );
  }
);

VideoCanvas.displayName = "VideoCanvas";

export default VideoCanvas;
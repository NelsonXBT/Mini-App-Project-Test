"use client";

import { forwardRef, useEffect } from "react";
import Hls from "hls.js";

interface Props {
  src: string;
  poster?: string | null;
  onLoaded: (duration: number) => void;
  onTimeUpdate: (time: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onLoading: (loading: boolean) => void;
  onEnded?: () => void;
  onClick?: () => void;
}

const VideoCanvas = forwardRef<HTMLVideoElement, Props>(
  (
    {
      src,
      poster,
      onLoaded,
      onTimeUpdate,
      onPlay,
      onPause,
      onLoading,
      onEnded,
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

     if (onEnded) {
          video.addEventListener("ended", onEnded);
        }

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

        if (onEnded) {
          video.removeEventListener("ended", onEnded);
        }

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
        /*
         * The native attribute rather than an overlaid <img>: the browser
         * clears it on the first decoded frame with no play-state tracking of
         * ours, and a poster that fails to load falls back to the black
         * background the player showed before this existed — where an <img>
         * would leave a broken-image icon over the video.
         *
         * object-contain on the element letterboxes the poster the same way
         * it letterboxes the video, so the still and the first frame occupy
         * exactly the same box and playback starts without a visible jump.
         */
        poster={poster ?? undefined}
        onClick={onClick}
        className="absolute inset-0 w-full h-full object-contain bg-black"
        />
    );
  }
);

VideoCanvas.displayName = "VideoCanvas";

export default VideoCanvas;
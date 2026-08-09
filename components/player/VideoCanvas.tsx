"use client";

import { forwardRef, useEffect } from "react";
import Hls from "hls.js";

interface Props {
  src: string;
  poster?: string | null;
  /*
   * Bump to force a full teardown and re-attach. This is what the retry
   * button drives: `src` is unchanged on a retry, so without a second value
   * in the dependency array the effect would not re-run and the button would
   * do nothing.
   */
  reloadNonce?: number;
  onLoaded: (duration: number) => void;
  onTimeUpdate: (time: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onLoading: (loading: boolean) => void;
  onError: (message: string) => void;
  onEnded?: () => void;
  onClick?: () => void;
}

/*
 * How many times to let hls.js heal itself before showing the student an
 * error. Network blips and media-decoder hiccups are routine on mobile and
 * usually clear on the first retry; past a couple of attempts we are looping
 * rather than recovering, and silence is worse than a message.
 */
const MAX_RECOVERIES = 2;

const NETWORK_MESSAGE =
  "We couldn't reach this video. Check your connection and try again.";
const MEDIA_MESSAGE =
  "This video didn't load properly. Try again — it usually works.";

const VideoCanvas = forwardRef<HTMLVideoElement, Props>(
  (
    {
      src,
      poster,
      reloadNonce = 0,
      onLoaded,
      onTimeUpdate,
      onPlay,
      onPause,
      onLoading,
      onError,
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
      let recoveries = 0;

      onLoading(true);

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS (Safari, iOS). hls.js never loads here, so the only
        // failure signal is the element's own error event — handled below.
        video.src = src;
      } else if (Hls.isSupported()) {
        hls = new Hls();

        hls.loadSource(src);

        hls.attachMedia(video);

        hls.on(Hls.Events.ERROR, (_, data) => {
          /*
           * Non-fatal errors are hls.js reporting that it already retried a
           * fragment and carried on. Surfacing those would flash an error
           * over a video that is still playing perfectly well.
           */
          if (!data.fatal) return;

          if (recoveries < MAX_RECOVERIES) {
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              recoveries += 1;
              hls?.startLoad();
              return;
            }

            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              recoveries += 1;
              hls?.recoverMediaError();
              return;
            }
          }

          // Out of retries, or an error type neither call can heal.
          hls?.destroy();
          hls = undefined;

          onLoading(false);
          onError(
            data.type === Hls.ErrorTypes.NETWORK_ERROR
              ? NETWORK_MESSAGE
              : MEDIA_MESSAGE
          );
        });
      } else {
        onLoading(false);
        onError("This browser can't play this video.");

        return;
      }

      const loaded = () => {
        onLoading(false);

        onLoaded(video.duration);
      };

      const update = () => {
        onTimeUpdate(video.currentTime);
      };

      /*
       * Covers the native path, and anything that kills the element after
       * hls.js has handed playback over. Without it an iOS failure left the
       * spinner turning with nothing behind it.
       */
      const failed = () => {
        onLoading(false);
        onError(NETWORK_MESSAGE);
      };

      video.addEventListener("loadedmetadata", loaded);

      if (onEnded) {
        video.addEventListener("ended", onEnded);
      }

      video.addEventListener("timeupdate", update);

      video.addEventListener("play", onPlay);

      video.addEventListener("pause", onPause);

      video.addEventListener("error", failed);

      return () => {
        hls?.destroy();

        video.removeEventListener("loadedmetadata", loaded);

        if (onEnded) {
          video.removeEventListener("ended", onEnded);
        }

        video.removeEventListener("timeupdate", update);

        video.removeEventListener("play", onPlay);

        video.removeEventListener("pause", onPause);

        video.removeEventListener("error", failed);
      };
      /*
       * The callbacks are intentionally not dependencies. Daluplayer defines
       * them inline, so they are new objects on every render — listing them
       * would tear down and re-attach hls.js on each one, which restarts the
       * download and drops playback. src and reloadNonce are the only inputs
       * that should ever cause a re-attach.
       */
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src, reloadNonce]);

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

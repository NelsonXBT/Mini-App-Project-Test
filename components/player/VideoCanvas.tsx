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

/*
 * How long to wait for a stream to produce metadata before calling it dead.
 *
 * hls.js does not report a second fatal error after startLoad(): it retries
 * internally with backoff and stays silent, so a permanently broken URL (a
 * deleted Bunny video, a typo'd playlist) emits exactly one fatal event and
 * then nothing. Without this timer the retry path would leave the student on
 * the same endless spinner this error handling exists to remove.
 *
 * Generous on purpose — a slow mobile connection should be given every chance
 * before being told the video is broken.
 */
const STALL_TIMEOUT_MS = 20000;

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
      let watchdog: ReturnType<typeof setTimeout> | undefined;
      let reported = false;

      /*
       * Every failure path funnels through here, so the spinner can never
       * outlive the stream and the student can never be shown two errors for
       * one broken video.
       */
      const fail = (message: string) => {
        if (reported) return;
        reported = true;

        clearTimeout(watchdog);

        hls?.destroy();
        hls = undefined;

        onLoading(false);
        onError(message);
      };

      /*
       * (Re)start the deadline for the stream to prove it is alive. Armed on
       * first load and again after each recovery attempt, since a recovery
       * that silently fails is indistinguishable from one still in progress.
       */
      const armWatchdog = () => {
        clearTimeout(watchdog);
        watchdog = setTimeout(() => fail(NETWORK_MESSAGE), STALL_TIMEOUT_MS);
      };

      onLoading(true);
      armWatchdog();

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS (Safari, iOS). hls.js never loads here, so the only
        // failure signal is the element's own error event — handled below.
        video.src = src;
      } else if (Hls.isSupported()) {
        hls = new Hls();

        hls.loadSource(src);

        hls.attachMedia(video);

        /*
         * A parsed manifest proves the URL is reachable and valid, which is
         * exactly what the initial deadline is testing for. Cleared here
         * rather than waiting for playback, so a device that can fetch the
         * stream but is slow to decode is never told the video is broken.
         *
         * Safe to clear this early: any later failure re-arms the deadline
         * before retrying, so a manifest that parses and then serves dead
         * fragments is still caught.
         */
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          clearTimeout(watchdog);
        });

        /*
         * A buffered fragment is the proof used after a recovery attempt,
         * when the manifest has long since parsed: loadedmetadata does not
         * fire a second time, and timeupdate needs playback to be running.
         */
        hls.on(Hls.Events.FRAG_BUFFERED, () => {
          clearTimeout(watchdog);
        });

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
              armWatchdog();
              hls?.startLoad();
              return;
            }

            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              recoveries += 1;
              armWatchdog();
              hls?.recoverMediaError();
              return;
            }
          }

          // Out of retries, or an error type neither call can heal.
          fail(
            data.type === Hls.ErrorTypes.NETWORK_ERROR
              ? NETWORK_MESSAGE
              : MEDIA_MESSAGE
          );
        });
      } else {
        clearTimeout(watchdog);
        onLoading(false);
        onError("This browser can't play this video.");

        return;
      }

      const loaded = () => {
        clearTimeout(watchdog);

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
        fail(NETWORK_MESSAGE);
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
        /*
         * Cleared before destroy so a pending deadline cannot fire against an
         * unmounted player — on lesson auto-advance this component is torn
         * down and rebuilt immediately, and a stale timer would post an error
         * over the next lesson.
         */
        clearTimeout(watchdog);

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

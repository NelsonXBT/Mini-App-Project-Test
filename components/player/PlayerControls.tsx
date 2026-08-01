"use client";

import ProgressBar from "./ProgressBar";
import TimeDisplay from "./TimeDisplay";
import VolumeControl from "./VolumeControl";
import FullscreenButton from "./FullscreenButton";

interface Props {
  current: number;
  duration: number;
  volume: number;
  isMobile: boolean;

  onSeek: (time: number) => void;
  onVolume: (volume: number) => void;
  onFullscreen: () => void;
}

export default function PlayerControls({
  current,
  duration,
  volume,
  isMobile,
  onSeek,
  onVolume,
  onFullscreen,
}: Props) {
  return (
    <div className="absolute inset-x-0 bottom-0">

      <div className="bg-gradient-to-t from-black/80 via-black/30 to-transparent px-3 py-2">

        {/* Time + Fullscreen */}

        <div className="flex items-center justify-between">

          <TimeDisplay
            current={current}
            duration={duration}
          />

          <FullscreenButton
            mobile={isMobile}
            onClick={onFullscreen}
          />

        </div>

        {/* Progress */}

        <div className="mt-2">

          <ProgressBar
            current={current}
            duration={duration}
            onSeek={onSeek}
          />

        </div>

      </div>

    </div>
  );
}
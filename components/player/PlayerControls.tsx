"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";

import ProgressBar from "./ProgressBar";
import TimeDisplay from "./TimeDisplay";
import VolumeControl from "./VolumeControl";
import FullscreenButton from "./FullscreenButton";

interface Props {
  current: number;
  duration: number;
  volume: number;
  isMobile: boolean;
  isFullscreen: boolean;

  onSeek: (time: number) => void;
  onVolume: (volume: number) => void;
  onFullscreen: () => void;
}

export default function PlayerControls({
  current,
  duration,
  volume,
  isMobile,
  isFullscreen,
  onSeek,
  onVolume,
  onFullscreen,
}: Props) {
  const [showVolume, setShowVolume] = useState(false);

  useEffect(() => {
    if (!showVolume) return;

    const timer = setTimeout(() => {
      setShowVolume(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [showVolume]);

  return (
    <div className="absolute inset-x-0 bottom-0 z-50 pointer-events-auto">

      <div className="bg-gradient-to-t from-black/80 via-black/30 to-transparent px-6 pb-5 pt-2">

        {/* Time + Controls */}

        <div className="flex items-center justify-between gap-3">

          <TimeDisplay
            current={current}
            duration={duration}
          />

          <div className="flex items-center gap-3">

            {showVolume && (
              <VolumeControl
                volume={volume}
                onChange={onVolume}
              />
            )}

            {/* <button
            onClick={() => setShowVolume(!showVolume)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/25 backdrop-blur-sm text-white transition hover:bg-black/40 hover:text-white"
            >
            <Volume2 size={18} strokeWidth={2.6} />
            </button> */}

           <FullscreenButton
                mobile={true}
                isFullscreen={isFullscreen}
                onClick={onFullscreen}
            />

          </div>

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
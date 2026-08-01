"use client";

interface Props {
  current: number;
  duration: number;
  onSeek: (time: number) => void;
}

export default function ProgressBar({
  current,
  duration,
  onSeek,
}: Props) {
  return (
    <input
      type="range"
      min={0}
      max={duration || 0}
      value={current}
      onChange={(e) =>
        onSeek(Number(e.target.value))
      }
      className="w-full accent-cyan-500"
    />
  );
}
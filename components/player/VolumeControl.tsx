"use client";

interface Props {
  volume: number;
  onChange: (v: number) => void;
}

export default function VolumeControl({
  volume,
  onChange,
}: Props) {
  return (
    <input
      type="range"
      min={0}
      max={1}
      step={0.01}
      value={volume}
      onChange={(e) =>
        onChange(Number(e.target.value))
      }
      className="w-20 accent-cyan-500"
    />
  );
}
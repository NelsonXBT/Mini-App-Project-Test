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
  const percent =
    duration > 0
      ? (current / duration) * 100
      : 0;

  function handleClick(
    e: React.MouseEvent<HTMLDivElement>
  ) {
    const rect =
      e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.left;

    const progress =
      x / rect.width;

    onSeek(progress * duration);
  }

  return (
    <div
      onClick={handleClick}
      className="
        relative
        h-1.5
        w-full
        cursor-pointer
        rounded-full
        bg-white/30
      "
    >
      {/* Played */}

      <div
        className="absolute left-0 top-0 h-full rounded-full bg-cyan-500"
        style={{
          width: `${percent}%`,
        }}
      />

      {/* Thumb */}

      <div
        className="
          absolute
          top-1/2
          h-3
          w-3
          -translate-y-1/2
          -translate-x-1/2
          rounded-full
          bg-cyan-500
        "
        style={{
          left: `${percent}%`,
        }}
      />
    </div>
  );
}
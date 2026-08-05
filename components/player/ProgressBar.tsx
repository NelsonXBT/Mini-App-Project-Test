"use client";

import { useRef } from "react";

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
  const barRef = useRef<HTMLDivElement>(null);

  const percent =
    duration > 0
      ? (current / duration) * 100
      : 0;

  function update(clientX: number) {
    if (!barRef.current) return;

    const rect =
      barRef.current.getBoundingClientRect();

    let progress =
      (clientX - rect.left) / rect.width;

    progress = Math.max(
      0,
      Math.min(progress, 1)
    );

    onSeek(progress * duration);
  }

  function handlePointerDown(
    e: React.PointerEvent<HTMLDivElement>
  ) {
    e.preventDefault();

    update(e.clientX);

    const move = (ev: PointerEvent) => {
      update(ev.clientX);
    };

    const up = () => {
      window.removeEventListener(
        "pointermove",
        move
      );

      window.removeEventListener(
        "pointerup",
        up
      );
    };

    window.addEventListener(
      "pointermove",
      move
    );

    window.addEventListener(
      "pointerup",
      up
    );
  }

  return (
    <div
      ref={barRef}
      onPointerDown={handlePointerDown}
      style={{
        touchAction: "none",
        }}
      className="
        relative
        h-1.5
        w-full
        cursor-pointer
        touch-none
        rounded-full
        bg-stone-200
      "
    >
      {/* Played */}

      <div
        className="
          absolute
          inset-y-0
          left-0
          rounded-full
          bg-[var(--primary)]
        "
        style={{
          width: `${percent}%`,
        }}
      />

      {/* Thumb */}

      <div
        className="
            absolute
            top-1/2
            h-4
            w-4
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            border-2
            border-white
            bg-[var(--primary)]
            shadow-md
          "
        style={{
          left: `${percent}%`,
        }}
      />
    </div>
  );
}
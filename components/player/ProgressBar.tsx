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

    progress = Math.max(0, Math.min(1, progress));

    onSeek(progress * duration);
  }

  function handleMouseDown(
    e: React.MouseEvent<HTMLDivElement>
  ) {
    update(e.clientX);

    function move(ev: MouseEvent) {
      update(ev.clientX);
    }

    function up() {
      window.removeEventListener(
        "mousemove",
        move
      );

      window.removeEventListener(
        "mouseup",
        up
      );
    }

    window.addEventListener(
      "mousemove",
      move
    );

    window.addEventListener(
      "mouseup",
      up
    );
  }

  function handleTouchStart(
    e: React.TouchEvent<HTMLDivElement>
  ) {
    update(e.touches[0].clientX);

    function move(ev: TouchEvent) {
      update(ev.touches[0].clientX);
    }

    function end() {
      window.removeEventListener(
        "touchmove",
        move
      );

      window.removeEventListener(
        "touchend",
        end
      );
    }

    window.addEventListener(
      "touchmove",
      move
    );

    window.addEventListener(
      "touchend",
      end
    );
  }

  return (
    <div
      ref={barRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className="
        relative
        h-1
        w-full
        cursor-pointer
        rounded-full
        bg-white/20
      "
    >
      {/* Played */}

      <div
        className="
          absolute
          left-0
          top-0
          h-full
          rounded-full
          bg-cyan-500
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
          h-2.5
          w-2.5
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-cyan-500
          shadow
        "
        style={{
          left: `${percent}%`,
        }}
      />
    </div>
  );
}
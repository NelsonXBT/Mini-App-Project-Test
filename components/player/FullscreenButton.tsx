"use client";


import { Maximize2, Minimize2 } from "lucide-react";

interface Props {
  onClick: () => void;
  mobile?: boolean;
  isFullscreen?: boolean;
}

export default function FullscreenButton({
  onClick,
  mobile = false,
  isFullscreen = false,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={
        mobile
          ? "flex h-9 w-9 items-center justify-center rounded-[var(--radius-pill)] bg-black/25 text-white backdrop-blur-sm transition duration-200 ease-out hover:bg-black/40 active:scale-95"
          : "inline-flex h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--primary)] px-4 text-sm font-medium tracking-tight text-white transition-all duration-200 ease-out hover:bg-[var(--primary-hover)] active:scale-[0.98]"
      }
    >
      {isFullscreen ? (
        <Minimize2 size={22} strokeWidth={2.7} />
        ) : (
        <Maximize2 size={22} strokeWidth={2.7} />
        )}
    </button>
  );
}
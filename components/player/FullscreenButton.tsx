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
          ? "flex h-9 w-9 items-center justify-center rounded-full bg-black/10 backdrop-blur-md text-white transition hover:bg-black/40 hover:text-white"
          : "rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black"
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
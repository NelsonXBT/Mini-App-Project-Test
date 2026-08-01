"use client";

interface Props {
  onClick: () => void;
}

export default function FullscreenButton({
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black"
    >
      Fullscreen
    </button>
  );
}
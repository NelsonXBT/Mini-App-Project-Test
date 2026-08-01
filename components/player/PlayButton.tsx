"use client";

interface Props {
  playing: boolean;
  onClick: () => void;
}

export default function PlayButton({
  playing,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="
      flex
      h-16
      w-16
      items-center
      justify-center
      rounded-full
      bg-cyan-500
      shadow-xl
      transition
      hover:scale-105
    "
    >
      {playing ? (
        <svg
          width="26"
          height="26"
          fill="black"
          viewBox="0 0 24 24"
        >
          <rect x="5" y="4" width="5" height="16" />
          <rect x="14" y="4" width="5" height="16" />
        </svg>
      ) : (
        <svg
          width="26"
          height="26"
          fill="black"
          viewBox="0 0 24 24"
        >
          <polygon points="6,4 20,12 6,20" />
        </svg>
      )}
    </button>
  );
}
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
      className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/90 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
    >
      {playing ? (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="black"
          aria-hidden="true"
        >
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg
            width="26"
            height="26"
            fill="black"
            viewBox="0 0 24 24"
            >
            <polygon
                points="6,4 20,12 6,20"
                transform="translate(1 0)"
            />
            </svg>
      )}
    </button>
  );
}
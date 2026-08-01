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
      type="button"
      onClick={onClick}
      aria-label={playing ? "Pause video" : "Play video"}
      className="
        flex
        h-14
        w-14
        items-center
        justify-center
        rounded-full
        bg-cyan-500
        shadow-xl
        transition-transform
        duration-200
        hover:scale-105
        active:scale-95
        cursor-pointer
        select-none
      "
    >
      {playing ? (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="black"
        >
          <rect x="5" y="4" width="5" height="16" />
          <rect x="14" y="4" width="5" height="16" />
        </svg>
      ) : (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="black"
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
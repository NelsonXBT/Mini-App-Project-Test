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
          h-16
          w-16
          items-center
          justify-center
          rounded-full
          border
          border-white/10
          bg-black/20
          text-white
          backdrop-blur-md
          transition-all
          duration-200
          hover:bg-black/30
          active:scale-95
          cursor-pointer
          select-none
        "
    >
      {playing ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <rect
            x="5"
            y="4"
            width="5"
            height="16"
            rx="1"
          />
          <rect
            x="14"
            y="4"
            width="5"
            height="16"
            rx="1"
          />
        </svg>
      ) : (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <polygon
            points="7,4 20,12 7,20"
          />
        </svg>
      )}
    </button>
  );
}
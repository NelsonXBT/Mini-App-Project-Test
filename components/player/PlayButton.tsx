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
  bg-white/[0.25]
  text-white
  transition-all
  duration-200
  hover:bg-black/[0.04]
  active:scale-95
  cursor-pointer
  select-none
"
    >
      {playing ? (
        <svg
          width="22"
          height="22"
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
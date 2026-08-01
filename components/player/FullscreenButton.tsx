"use client";

interface Props {
  onClick: () => void;
  mobile?: boolean;
}

export default function FullscreenButton({
  onClick,
  mobile = false,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={
        mobile
          ? "m-0 p-0 leading-none text-[10px] text-white"
          : "rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black"
      }
    >
      ⛶
    </button>
  );
}
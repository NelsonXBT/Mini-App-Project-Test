"use client";

export default function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
      <div
        className="
          h-10
          w-10
          animate-spin
          rounded-full
          border-2
          border-white/15
          border-t-[var(--primary)]
        "
      />
    </div>
  );
}
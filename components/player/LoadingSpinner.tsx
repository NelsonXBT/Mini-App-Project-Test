"use client";

export default function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
      <div className="h-14 w-14 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
    </div>
  );
}
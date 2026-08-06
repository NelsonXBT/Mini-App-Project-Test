"use client";

function format(seconds: number) {
  if (!seconds || Number.isNaN(seconds)) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function TimeDisplay({
  current,
  duration,
}: {
  current: number;
  duration: number;
}) {
  return (
    <span className="text-[11px] font-medium tabular-nums tracking-tight text-white/90">
      {format(current)} / {format(duration)}
    </span>
  );
}
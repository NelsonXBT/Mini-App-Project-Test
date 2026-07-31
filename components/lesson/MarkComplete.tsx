"use client";

import { CheckCircle2 } from "lucide-react";

type MarkCompleteProps = {
  completed: boolean;
};

export default function MarkComplete({
  completed,
}: MarkCompleteProps) {
  return (
    <button
      disabled={completed}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
        completed
          ? "cursor-not-allowed bg-green-600 text-white"
          : "bg-cyan-500 text-black hover:bg-cyan-400 active:scale-[0.98]"
      }`}
    >
      <CheckCircle2 size={18} />

      {completed ? "Lesson Completed" : "Mark as Complete"}
    </button>
  );
}
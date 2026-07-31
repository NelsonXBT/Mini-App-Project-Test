"use client";

type MarkCompleteProps = {
  completed: boolean;
};

export default function MarkComplete({
  completed,
}: MarkCompleteProps) {
  return (
    <button
      disabled={completed}
      className={`mt-8 w-full rounded-xl px-5 py-4 text-base font-semibold transition ${
        completed
            ? "cursor-not-allowed bg-green-600 text-white"
            : "bg-cyan-500 text-black hover:bg-cyan-400"
        }`}
    >
      {completed ? "✓ Lesson Completed" : "Mark as Complete"}
    </button>
  );
}
"use client";

import { RotateCw } from "lucide-react";

/**
 * The one failure screen, shared by every error boundary in the app.
 *
 * Kept in one place so a student meets the same surface whether the course
 * page threw, the admin dashboard threw, or the root layout itself did — and
 * so the copy stays free of stack traces. In production Next.js already
 * strips server error messages before they reach the client, but the digest
 * is deliberately shown: it is the only handle that ties what the student is
 * looking at to the matching line in the server logs, and it costs nothing.
 *
 * Deliberately dependency-free apart from the icon. global-error.tsx renders
 * this when the root layout is the thing that broke, and anything imported
 * here has to survive that.
 */
export default function ErrorState({
  digest,
  onRetry,
  title = "Something went wrong",
  description = "This is on our side, not yours. Try again — it usually works.",
}: {
  digest?: string;
  onRetry: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-[1.375rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--text)]">
        {title}
      </h1>

      <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
        {description}
      </p>

      <button
        onClick={onRetry}
        className="
          mt-7
          inline-flex
          h-11
          select-none
          items-center
          justify-center
          gap-2
          rounded-[var(--radius-control)]
          bg-[var(--primary)]
          px-5
          text-[14px]
          font-medium
          tracking-tight
          !text-white
          transition-all
          duration-150
          ease-out
          hover:bg-[var(--primary-hover)]
          active:scale-[0.97]
        "
      >
        <RotateCw className="h-4 w-4" strokeWidth={2.2} />
        Try again
      </button>

      {digest && (
        <p className="mt-6 font-mono text-[11px] text-[var(--text-subtle)]">
          Reference: {digest}
        </p>
      )}
    </main>
  );
}

import Link from "next/link";

/**
 * Shown for unmatched URLs and for any `notFound()` call without a closer
 * not-found file — including the two admin detail pages that already throw it
 * for a missing student or course and, until now, fell through to the
 * unstyled Next.js default.
 *
 * A Server Component: nothing here is interactive, so there is no reason to
 * ship it as client JavaScript.
 *
 * It renders inside the root layout, which supplies <html>, the stylesheet
 * and the font — so unlike global-error.tsx this file needs none of them.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-[13px] tracking-[0.18em] text-[var(--text-subtle)]">
        404
      </p>

      <h1 className="mt-3 text-[1.375rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--text)]">
        We can&apos;t find that page
      </h1>

      <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
        The link may be out of date, or the page may have moved.
      </p>

      <Link
        href="/"
        className="
          mt-7
          inline-flex
          h-11
          select-none
          items-center
          justify-center
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
        Back to home
      </Link>
    </main>
  );
}

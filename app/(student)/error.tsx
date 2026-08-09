"use client";

import { useEffect } from "react";

import ErrorState from "@/components/common/ErrorState";

/**
 * Catches anything thrown while rendering a student route.
 *
 * Every student page is force-dynamic, so each one reaches Neon on every
 * load. A cold start or a dropped connection is a normal event rather than an
 * exceptional one, and without this file it surfaced as an unstyled Next.js
 * error page — the ugliest screen in the app, shown to the students most
 * likely to be paying for it.
 *
 * This boundary sits inside (student)/layout.tsx, so the header and bottom
 * navigation stay rendered around it and the student can navigate out instead
 * of being stranded.
 */
export default function StudentError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[student] render failed", error);
  }, [error]);

  return <ErrorState digest={error.digest} onRetry={unstable_retry} />;
}

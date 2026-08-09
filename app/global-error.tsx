"use client";

import { Geist } from "next/font/google";
import { useEffect } from "react";

import "./globals.css";

import ErrorState from "@/components/common/ErrorState";

/*
 * Last resort: this renders when the root layout itself throws, which means
 * app/layout.tsx never ran. Nothing it normally provides exists here, so this
 * file has to supply its own <html>, <body>, stylesheet, and font — that is
 * why globals.css and Geist are imported again rather than inherited.
 *
 * Being a Client Component, it cannot export metadata; React's <title> is the
 * documented substitute.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[root] layout failed", error);
  }, [error]);

  return (
    /*
     * data-theme is not set here. The app's theme toggle lives above this
     * boundary and cannot reach a document that replaced the root layout, so
     * the tokens in globals.css follow the OS colour scheme on their own —
     * which is the correct behaviour for a screen with no session to read.
     */
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-screen bg-[var(--background)] text-[var(--text)]">
        <title>Something went wrong · Nadi Academy</title>

        <ErrorState
          digest={error.digest}
          onRetry={unstable_retry}
          description="The app failed to start. Try again — if this keeps happening, the reference below will be in the server logs."
        />
      </body>
    </html>
  );
}

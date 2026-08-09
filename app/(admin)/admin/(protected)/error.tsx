"use client";

import { useEffect } from "react";

import ErrorState from "@/components/common/ErrorState";

/**
 * Catches anything thrown inside the authenticated admin tree.
 *
 * Scoped to (protected) rather than the admin root on purpose: the login page
 * sits outside it, so a failure here can never hide or replace the form an
 * admin needs to sign in with.
 */
export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[admin] render failed", error);
  }, [error]);

  return (
    <ErrorState
      digest={error.digest}
      onRetry={unstable_retry}
      description="The dashboard hit an error. Retrying usually clears it — if it doesn't, the reference below will be in the server logs."
    />
  );
}

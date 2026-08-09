"use client";

import Link from "next/link";

import { savePlayerProgress } from "@/lib/player/controller";

type SaveLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

/*
 * A <Link> that flushes the player's watch position on the way out.
 *
 * The save is deliberately not awaited and the click is not intercepted. An
 * earlier version called preventDefault() and awaited the server action before
 * router.push(), which made every tap of the bottom nav wait on a database
 * round trip — and, because the default was cancelled, also stopped Next from
 * prefetching any nav destination.
 *
 * Letting <Link> handle the click keeps navigation instant and restores
 * prefetching; the write continues in the background. Progress is also saved
 * on an interval while watching, so the worst case if this request is cut off
 * mid-flight is losing the last few seconds of position — cheaper than making
 * every navigation feel broken.
 */
export default function SaveLink({
  href,
  children,
  className,
}: SaveLinkProps) {
  function handleClick() {
    void savePlayerProgress().catch((error) => {
      console.error(error);
    });
  }

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

"use client";

import { ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  className?: string;
};

/*
 * Backed by the rise-in keyframe in globals.css. This previously used
 * tailwindcss-animate class names (animate-in / fade-in / slide-in-from-*),
 * which silently did nothing because that plugin isn't a dependency.
 */
export default function FadeIn({
  children,
  className = "",
}: FadeInProps) {
  return (
    <div className={`animate-rise-in ${className}`}>
      {children}
    </div>
  );
}

"use client";

import { ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  className?: string;
};

export default function FadeIn({
  children,
  className = "",
}: FadeInProps) {
  return (
    <div
      className={`
        animate-in
        fade-in
        slide-in-from-bottom-1
        duration-300
        ease-out
        ${className}
      `}
    >
      {children}
    </div>
  );
}
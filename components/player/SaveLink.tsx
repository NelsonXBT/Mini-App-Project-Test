"use client";

import Link from "next/link";
import { saveAndNavigate } from "@/lib/player/navigation";

type SaveLinkProps = {
  href: string;
  save: () => Promise<void>;
  className?: string;
  children: React.ReactNode;
};

export default function SaveLink({
  href,
  save,
  className,
  children,
}: SaveLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={async (e) => {
        e.preventDefault();

        await saveAndNavigate(
          save,
          () => {
            window.location.href = href;
          }
        );
      }}
    >
      {children}
    </Link>
  );
}
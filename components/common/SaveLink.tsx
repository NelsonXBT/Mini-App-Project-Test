"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

type SaveLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  onBeforeNavigate: () => Promise<void>;
};

export default function SaveLink({
  href,
  children,
  className,
  onBeforeNavigate,
}: SaveLinkProps) {
  const router = useRouter();

  async function handleClick(
    e: React.MouseEvent<HTMLAnchorElement>
  ) {
    e.preventDefault();

    try {
      await onBeforeNavigate();
    } catch (error) {
      console.error(error);
    }

    router.push(href);
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
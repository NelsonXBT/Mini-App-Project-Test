"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { savePlayerProgress } from "@/lib/player/controller";

type SaveLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export default function SaveLink({
  href,
  children,
  className,
}: SaveLinkProps) {
  const router = useRouter();

  async function handleClick(
    e: React.MouseEvent<HTMLAnchorElement>
  ) {
    e.preventDefault();

    try {
      await savePlayerProgress();
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
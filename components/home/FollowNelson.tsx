import Link from "next/link";
import {
  FaYoutube,
  FaInstagram,
  FaFacebook,
  FaTiktok,
} from "react-icons/fa6";

import { Card } from "@/components/ui";

export default function FollowNelson() {
  return (
    <Card className="p-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text)]">
          Stay Connected
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
          Follow for AI filmmaking tutorials, creative tips and course updates.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          href="#"
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-stone-200
            bg-stone-50
            px-4
            py-3
            transition-all
            duration-200
            hover:border-[var(--primary)]
            hover:bg-white
          "
        >
          <FaYoutube className="h-5 w-5 text-[var(--primary)]" />

          <span className="text-sm font-medium text-[var(--text)]">
            YouTube
          </span>
        </Link>

        <Link
          href="#"
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-stone-200
            bg-stone-50
            px-4
            py-3
            transition-all
            duration-200
            hover:border-[var(--primary)]
            hover:bg-white
          "
        >
          <FaInstagram className="h-5 w-5 text-[var(--primary)]" />

          <span className="text-sm font-medium text-[var(--text)]">
            Instagram
          </span>
        </Link>

        <Link
          href="#"
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-stone-200
            bg-stone-50
            px-4
            py-3
            transition-all
            duration-200
            hover:border-[var(--primary)]
            hover:bg-white
          "
        >
          <FaFacebook className="h-5 w-5 text-[var(--primary)]" />

          <span className="text-sm font-medium text-[var(--text)]">
            Facebook
          </span>
        </Link>

        <Link
          href="#"
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-stone-200
            bg-stone-50
            px-4
            py-3
            transition-all
            duration-200
            hover:border-[var(--primary)]
            hover:bg-white
          "
        >
          <FaTiktok className="h-5 w-5 text-[var(--primary)]" />

          <span className="text-sm font-medium text-[var(--text)]">
            TikTok
          </span>
        </Link>
      </div>
    </Card>
  );
}
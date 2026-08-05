import Link from "next/link";
import {
  FaYoutube,
  FaInstagram,
  FaFacebook,
  FaTiktok,
} from "react-icons/fa6";

import { Card } from "@/components/ui";

const socials = [
  {
    name: "YouTube",
    href: "#",
    icon: FaYoutube,
  },
  {
    name: "Instagram",
    href: "#",
    icon: FaInstagram,
  },
  {
    name: "Facebook",
    href: "#",
    icon: FaFacebook,
  },
  {
    name: "TikTok",
    href: "#",
    icon: FaTiktok,
  },
];

export default function FollowNelson() {
  return (
    <Card className="overflow-hidden p-7">

      <div className="text-center">

        <div
          className="
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-[var(--primary)]/10
            text-xl
            font-semibold
            text-[var(--primary)]
          "
        >
          N
        </div>

        <h2 className="mt-4 text-xl font-semibold text-[var(--text)]">
          Nelson Edeh
        </h2>

        <p className="mt-1 text-sm text-[var(--text-muted)]">
          AI Filmmaker • Educator • Content Creator
        </p>

      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">

        {socials.map((social) => {
          const Icon = social.icon;

          return (
            <Link
              key={social.name}
              href={social.href}
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-stone-200
                bg-white
                py-3
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-[var(--primary)]
                hover:shadow-sm
              "
            >
              <Icon
                className="
                  h-5
                  w-5
                  text-[var(--primary)]
                "
              />

              <span
                className="
                  text-sm
                  font-medium
                  text-[var(--text)]
                "
              >
                {social.name}
              </span>

            </Link>
          );
        })}

      </div>

    </Card>
  );
}
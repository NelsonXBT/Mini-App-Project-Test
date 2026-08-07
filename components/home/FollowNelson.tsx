import Link from "next/link";
import {
  FaYoutube,
  FaInstagram,
  FaFacebook,
  FaTiktok,
} from "react-icons/fa6";

import { PageTitle } from "@/components/ui";

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
    <section>
      <PageTitle as="h2">Connect</PageTitle>

      <div className="grid grid-cols-2 gap-2">
        {socials.map((social) => {
          const Icon = social.icon;

          return (
            <Link
              key={social.name}
              href={social.href}
              className="
                flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-[var(--radius-control)]
                border
                border-[var(--border)]
                bg-[var(--card)]
                px-3
                shadow-[var(--shadow-card)]
                transition-all
                duration-200
                ease-out
                active:scale-[0.98]
                active:bg-[var(--surface-secondary)]
              "
            >
              <Icon
                className="
                  h-[15px]
                  w-[15px]
                  text-[var(--primary)]
                "
              />

              <span
                className="
                  text-[13px]
                  font-medium
                  tracking-tight
                  text-[var(--text)]
                "
              >
                {social.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
import Link from "next/link";
import {
  FaYoutube,
  FaInstagram,
  FaFacebook,
  FaTiktok,
} from "react-icons/fa6";

import { PageTitle } from "@/components/ui";

/*
 * Each icon keeps its own platform tone, muted a step or two from the
 * official hue so the row sits quietly in the page. Deliberately not the
 * brand accent: four oxblood glyphs beside the accent used for actions
 * would spend the colour on something that is not an action.
 */
const socials = [
  {
    name: "YouTube",
    href: "#",
    icon: FaYoutube,
    tone: "text-[#b8443c]",
  },
  {
    name: "Instagram",
    href: "#",
    icon: FaInstagram,
    tone: "text-[#a8557f]",
  },
  {
    name: "Facebook",
    href: "#",
    icon: FaFacebook,
    tone: "text-[#4a6fa8]",
  },
  {
    name: "TikTok",
    href: "#",
    icon: FaTiktok,
    tone: "text-[var(--text)]",
  },
];

export default function FollowNelson() {
  return (
    <section>
      <PageTitle as="h2">Connect With Nelson Edeh</PageTitle>

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
                className={`
                  h-[15px]
                  w-[15px]
                  ${social.tone}
                `}
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
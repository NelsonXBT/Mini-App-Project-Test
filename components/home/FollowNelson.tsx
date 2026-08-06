import Link from "next/link";
import {
  FaYoutube,
  FaInstagram,
  FaFacebook,
  FaTiktok,
} from "react-icons/fa6";

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
      <div>
        <h2 className="text-[1.0625rem] font-semibold leading-snug tracking-[-0.015em] text-[var(--text)]">
          Connect with Nelson Edeh
        </h2>

        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Tutorials, updates and behind the scenes.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {socials.map((social) => {
          const Icon = social.icon;

          return (
            <Link
              key={social.name}
              href={social.href}
              className="
                group
                flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-[var(--radius-control)]
                border
                border-[var(--border)]
                bg-[var(--card)]
                px-4
                shadow-[var(--shadow-card)]
                transition-all
                duration-200
                ease-out
                hover:-translate-y-0.5
                hover:border-[var(--border-strong)]
                hover:shadow-[var(--shadow-raised)]
                active:scale-[0.98]
              "
            >
              <Icon
                className="
                  h-4
                  w-4
                  text-[var(--primary)]
                "
              />

              <span
                className="
                  text-sm
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
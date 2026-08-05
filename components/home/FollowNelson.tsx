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
    <section className="pt-2">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text)]">
          Connect with Nelson
        </h2>

        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Tutorials, updates and behind the scenes.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {socials.map((social) => {
          const Icon = social.icon;

          return (
            <Link
              key={social.name}
              href={social.href}
              className="
                group
                flex
                items-center
                justify-center
                gap-2
                rounded-full
                border
                border-[var(--border)]
                bg-[var(--card)]
                px-4
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
                  h-4.5
                  w-4.5
                  text-[var(--primary)]
                  transition-transform
                  duration-200
                  group-hover:scale-110
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
    </section>
  );
}
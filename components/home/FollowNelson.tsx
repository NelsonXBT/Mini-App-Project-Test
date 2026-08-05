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
    <section className="pt-3">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text)]">
          Connect with Nelson
        </h2>

        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Tutorials, updates and behind the scenes.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-10 gap-y-5">
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
                gap-3
                transition-all
                duration-200
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--surface-secondary)]
                  transition-all
                  duration-200
                  group-hover:bg-[var(--primary)]
                  group-hover:text-white
                "
              >
                <Icon className="h-5 w-5" />
              </div>

              <span
                className="
                  text-sm
                  font-medium
                  text-[var(--text)]
                  transition-colors
                  group-hover:text-[var(--primary)]
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
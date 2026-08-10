import Link from "next/link";
import {
  FaYoutube,
  FaInstagram,
  FaFacebook,
  FaTiktok,
} from "react-icons/fa6";

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
      {/*
       * Deliberately not PageTitle.
       *
       * PageTitle is the system's quiet label — 13px, uppercase, --text-subtle
       * — built to recede so the cards under it carry the weight. That is
       * right for an inventory heading like "Recommended For You", and wrong
       * here, where the heading is the only thing inviting the tap: the icon
       * tiles below are plain and name a platform, so if the heading recedes
       * the whole section reads as a footer.
       *
       * The lift is size, weight and contrast rather than colour. Red is
       * spoken for by the learning card's button — the one primary action on
       * this page — and a second red heading would split that signal. At full
       * --text contrast and the same 1.0625rem as the card title, this reads
       * as a peer section header while leaving red uncontested.
       */}
      <h2
        className="
          px-0.5
          text-[1.0625rem]
          font-semibold
          leading-snug
          tracking-[-0.02em]
          text-[var(--text)]
        "
      >
        Connect With Nelson Edeh
      </h2>

      {/*
       * Gives the heading a reason to be looked at. A bare name states who;
       * this states what the student gets by tapping, which is the part that
       * turns a label into an invitation — without needing colour to do it.
       */}
      <p className="mb-3 mt-1 px-0.5 text-[13px] leading-relaxed text-[var(--text-muted)]">
        Follow for tutorials, behind-the-scenes and drops.
      </p>

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
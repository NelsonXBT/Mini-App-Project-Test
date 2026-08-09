"use client";

type AvatarProps = {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md";
};

/**
 * Telegram photo URLs expire, so a broken image has to degrade to initials
 * rather than a torn-image icon. Plain <img> is used because the host is
 * arbitrary and would otherwise need allow-listing in next.config.
 *
 * Must stay a Client Component: the onError fallback below is a function, and
 * this renders from RecentStudents, which is an async Server Component. Passing
 * a handler across that boundary throws at render time.
 */
export default function Avatar({
  name,
  photoUrl,
  size = "md",
}: AvatarProps) {
  const dimensions = size === "sm" ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-[13px]";

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "?";

  return (
    <span
      className={`
        relative
        inline-flex
        shrink-0
        items-center
        justify-center
        overflow-hidden
        rounded-[var(--radius-pill)]
        bg-[var(--primary-soft)]
        font-semibold
        text-[var(--primary-text)]
        ${dimensions}
      `}
    >
      {initials}

      {photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            // Reveal the initials underneath.
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </span>
  );
}

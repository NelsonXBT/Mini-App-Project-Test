type LogoSize = "sm" | "md" | "lg";

type LogoProps = {
  size?: LogoSize;
  className?: string;
  /*
   * Tints the wordmark oxblood. Off by default — the mark reads as
   * type, not as an accent, everywhere except the splash screen.
   */
  accent?: boolean;
};

/*
 * NADI / ACADEMY locked into a single block.
 *
 * ACADEMY is spread with justify-between rather than a tracking value so
 * it measures exactly as wide as NADI at any size, in any font, without
 * a magic number to retune. The letters are separate spans for that
 * reason alone; aria-label carries the real name to assistive tech and
 * aria-hidden keeps the split letters from being announced one by one.
 *
 * leading-none on both rows plus a small negative offset closes the gap
 * so the pair reads as one unit and costs almost no vertical space.
 */

const sizes: Record<LogoSize, { word: string; sub: string; pull: string }> = {
  sm: {
    word: "text-[1.0625rem] tracking-[0.16em]",
    sub: "text-[0.4375rem]",
    pull: "-mt-[1px]",
  },
  md: {
    word: "text-[1.375rem] tracking-[0.17em]",
    sub: "text-[0.5rem]",
    pull: "-mt-[1.5px]",
  },
  lg: {
    word: "text-[1.875rem] tracking-[0.18em]",
    sub: "text-[0.625rem]",
    pull: "-mt-[2px]",
  },
};

export default function Logo({
  size = "sm",
  className = "",
  accent = false,
}: LogoProps) {
  const s = sizes[size];
  const color = accent ? "text-[var(--primary-text)]" : "text-[var(--text)]";

  return (
    <span
      aria-label="Nadi Academy"
      role="img"
      className={`inline-flex select-none flex-col items-stretch ${color} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`
          font-semibold
          leading-none
          ${s.word}
        `}
      >
        NADI
      </span>

      {/*
       * pr matches the trailing letter-space the tracking above adds after
       * the final I, so the spread row aligns flush with the N and the I
       * instead of overhanging the right edge.
       */}
      <span
        aria-hidden="true"
        className={`
          flex
          justify-between
          font-medium
          uppercase
          leading-none
          ${s.pull}
          ${s.sub}
          pr-[0.16em]
          opacity-70
        `}
      >
        {"ACADEMY".split("").map((letter, index) => (
          <span key={`${letter}-${index}`}>{letter}</span>
        ))}
      </span>
    </span>
  );
}

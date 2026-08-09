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
 *
 * NADI is set a weight heavier than the UI around it so the mark is the
 * first thing read in its corner. That weight — not size — is what does
 * the work: the mark has to sit inside a 64px header on both surfaces,
 * and going much bigger would turn a wordmark into a banner. ACADEMY
 * stays quieter beneath it, and the contrast between the two rows is
 * what makes the pair feel deliberate rather than merely small.
 *
 * `pr` cancels the trailing letter-space that `tracking` adds after the
 * final I, so the spread row sits flush with the N and the I above it.
 * It must equal that size's tracking value — they are defined together
 * here for exactly that reason.
 */

const sizes: Record<
  LogoSize,
  { word: string; sub: string; pull: string; pr: string; subOpacity: string }
> = {
  sm: {
    word: "text-[1.1875rem] tracking-[0.15em]",
    sub: "text-[0.5rem]",
    pull: "-mt-[0.5px]",
    pr: "pr-[0.15em]",
    subOpacity: "opacity-75",
  },
  md: {
    word: "text-[1.5625rem] tracking-[0.16em]",
    sub: "text-[0.5625rem]",
    pull: "-mt-[1px]",
    pr: "pr-[0.16em]",
    subOpacity: "opacity-75",
  },
  lg: {
    word: "text-[2.125rem] tracking-[0.17em]",
    sub: "text-[0.6875rem]",
    pull: "-mt-[1.5px]",
    pr: "pr-[0.17em]",
    subOpacity: "opacity-70",
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
          font-bold
          leading-none
          ${s.word}
        `}
      >
        NADI
      </span>

      <span
        aria-hidden="true"
        className={`
          flex
          justify-between
          font-semibold
          uppercase
          leading-none
          ${s.pull}
          ${s.sub}
          ${s.pr}
          ${s.subOpacity}
        `}
      >
        {"ACADEMY".split("").map((letter, index) => (
          <span key={`${letter}-${index}`}>{letter}</span>
        ))}
      </span>
    </span>
  );
}

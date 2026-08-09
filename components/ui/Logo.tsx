type LogoSize = "sm" | "md" | "lg";

/*
 * "inline" sets the name on one line; "stacked" puts ACADEMY on its own row
 * beneath NADI. Two forms of one mark, for two shapes of space: the header
 * and the admin rail are wide and short, the splash ring is square.
 */
type LogoLayout = "inline" | "stacked";

type LogoProps = {
  size?: LogoSize;
  layout?: LogoLayout;
  className?: string;
  /*
   * Tints the wordmark oxblood. Off by default — the mark reads as
   * type, not as an accent, everywhere except the splash screen.
   */
  accent?: boolean;
};

/*
 * NADI is identical in both layouts — same size, same weight, same tracking
 * per variant — so the mark carries the same presence wherever it lands and
 * only ACADEMY moves. Anything retuned on one form should be retuned on the
 * other, or the two will drift apart.
 */

/*
 * INLINE — the default, and what the student header and the admin rail use.
 *
 * ACADEMY sits on NADI's baseline, set small, spread wide and dimmed. Scale
 * and weight carry the hierarchy, so a name three times as long does not read
 * three times as loud, and the pair still resolves as one drawn mark rather
 * than a heading. It is sized in em against the root, so a single font-size
 * per variant drives the whole lockup and the words cannot fall out of
 * proportion when one is retuned.
 *
 * letter-spacing lands after the final glyph as well as between glyphs, so
 * each word cancels its own with a negative right margin. On NADI that makes
 * the ml on ACADEMY the real gap rather than the gap plus a per-variant
 * tracking value; on ACADEMY it squares the right edge of the lockup, which
 * the admin sign-in centres. NADI's tracking and the margin cancelling it are
 * defined together for that reason.
 *
 * items-baseline, not items-center: two sizes sharing a baseline is what
 * makes this read as set type instead of two adjacent spans. whitespace-nowrap
 * holds the name on the one line it is meant to be.
 */
const inlineSizes: Record<LogoSize, { root: string; pull: string }> = {
  sm: { root: "text-[1.1875rem] tracking-[0.15em]", pull: "-mr-[0.15em]" },
  md: { root: "text-[1.5625rem] tracking-[0.16em]", pull: "-mr-[0.16em]" },
  lg: { root: "text-[2.125rem] tracking-[0.17em]", pull: "-mr-[0.17em]" },
};

/*
 * STACKED — the splash screen, where the mark has to fit a rotating ring.
 *
 * What must clear that ring is the corner of the mark's bounding box, not its
 * width, so the near-square stack fits a 96px circle where the inline form —
 * six times wider than it is tall — would need roughly 200px. SplashScreen
 * documents the exact pairing; changing this without reading it will put the
 * text back through the circle.
 *
 * ACADEMY is spread with justify-between rather than a tracking value so it
 * measures exactly as wide as NADI at any size, in any font, without a magic
 * number to retune. The letters are separate spans for that reason alone;
 * aria-label carries the real name to assistive tech and aria-hidden keeps
 * the split letters from being announced one by one.
 *
 * leading-none on both rows plus a small negative offset closes the gap so
 * the pair reads as one unit and costs almost no vertical space.
 *
 * `pr` cancels the trailing letter-space that `tracking` adds after the final
 * I, so the spread row sits flush with the N and the I above it. It must
 * equal that size's tracking value — they are defined together here for
 * exactly that reason.
 */
const stackedSizes: Record<
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
  layout = "inline",
  className = "",
  accent = false,
}: LogoProps) {
  const color = accent ? "text-[var(--primary-text)]" : "text-[var(--text)]";

  if (layout === "stacked") {
    const s = stackedSizes[size];

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

  const s = inlineSizes[size];

  return (
    <span
      aria-label="Nadi Academy"
      role="img"
      className={`
        inline-flex
        select-none
        items-baseline
        whitespace-nowrap
        leading-none
        ${color}
        ${s.root}
        ${className}
      `}
    >
      <span aria-hidden="true" className={`font-bold ${s.pull}`}>
        NADI
      </span>

      <span
        aria-hidden="true"
        className="
          ml-[0.72em]
          -mr-[0.26em]
          text-[0.56em]
          font-medium
          tracking-[0.26em]
          opacity-70
        "
      >
        ACADEMY
      </span>
    </span>
  );
}

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
 * NADI ACADEMY as a single-line lockup.
 *
 * NADI is unchanged from the stacked mark this replaces: same size, same
 * weight, same tracking at every variant. That is deliberate — the mark had
 * to keep the presence it already held in a 64px header, so the full name
 * arrives without the corner getting louder.
 *
 * ACADEMY is what moved. It sits on NADI's baseline rather than on its own
 * row, set small, spread wide and dimmed. Scale and weight carry the
 * hierarchy, so a name three times as long does not read three times as
 * loud, and the pair still resolves as one drawn mark rather than a heading.
 *
 * ACADEMY is sized in em against the root, so a single font-size per variant
 * drives the whole lockup and the two words cannot drift out of proportion
 * when one is retuned.
 *
 * letter-spacing is applied after the final glyph as well as between glyphs,
 * so each word cancels its own with a negative right margin. On NADI that
 * makes the ml on ACADEMY the real gap rather than the gap plus a tracking
 * value that changes per variant; on ACADEMY it squares the right edge of
 * the lockup, which the splash and the admin sign-in both centre. NADI's
 * tracking and the margin cancelling it are defined together for that reason.
 *
 * items-baseline, not items-center: two sizes sharing a baseline is what
 * makes this read as set type instead of two spans that happen to be
 * adjacent. whitespace-nowrap keeps the name on the one line it now is.
 */

const sizes: Record<LogoSize, { root: string; pull: string }> = {
  sm: { root: "text-[1.1875rem] tracking-[0.15em]", pull: "-mr-[0.15em]" },
  md: { root: "text-[1.5625rem] tracking-[0.16em]", pull: "-mr-[0.16em]" },
  lg: { root: "text-[2.125rem] tracking-[0.17em]", pull: "-mr-[0.17em]" },
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

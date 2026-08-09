import Logo from "@/components/ui/Logo";

/*
 * The first thing a student sees on open, so it is the one place the
 * wordmark carries the brand colour.
 *
 * Ring and mark are sized as a pair. The wordmark is wider than it is
 * tall, so what has to clear the ring is the corner of its bounding box
 * (half-diagonal), not its width — at the previous lg/112px pairing that
 * corner reached ~55.7px against a 54px inner radius and the text broke
 * the circle. The md mark inside a 96px ring reaches ~40.8px against a
 * 46px radius, leaving a few px of breathing room on every side.
 *
 * Changing either value alone will reintroduce the overlap.
 */
export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]">
      <div className="relative flex h-24 w-24 items-center justify-center">
        {/* Rotating ring */}
        <div
          className="
            absolute
            inset-0
            animate-spin
            rounded-[var(--radius-pill)]
            border-2
            border-[var(--border)]
            border-t-[var(--primary)]
          "
          aria-hidden="true"
        />

        <Logo size="md" layout="stacked" accent />
      </div>
    </div>
  );
}

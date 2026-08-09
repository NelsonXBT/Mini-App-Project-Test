import Logo from "@/components/ui/Logo";

/*
 * The first thing a student sees on open, so it is the one place the
 * wordmark carries the brand colour.
 *
 * The spinner sits beneath the mark rather than around it. It used to be a
 * ring circumscribing the wordmark, sized as a pair with it — that worked
 * while the mark was stacked and roughly as wide as it was tall. The
 * single-line lockup is about six times wider than it is tall, and what has
 * to clear a ring is the corner of the mark's bounding box: at md that
 * corner is ~91px out, so containing it would have taken a ~200px circle
 * and turned the loading state into the largest thing on the screen.
 *
 * Stacking them instead decouples the two. The mark can be retuned at any
 * width now without the spinner having to be recomputed to match it.
 */
export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-6">
        <Logo size="md" accent />

        <div
          className="
            h-5
            w-5
            animate-spin
            rounded-[var(--radius-pill)]
            border-2
            border-[var(--border)]
            border-t-[var(--primary)]
          "
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

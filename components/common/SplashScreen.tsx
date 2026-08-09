import Logo from "@/components/ui/Logo";

/*
 * The first thing a student sees on open, so it is the one place the
 * wordmark carries the brand colour. The ring sits behind the mark at a
 * width that clears it rather than encircling it tightly.
 */
export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]">
      <div className="relative flex items-center justify-center">
        {/* Rotating ring */}
        <div
          className="
            absolute
            h-28
            w-28
            animate-spin
            rounded-[var(--radius-pill)]
            border-2
            border-[var(--border)]
            border-t-[var(--primary)]
          "
          aria-hidden="true"
        />

        <Logo size="lg" accent />
      </div>
    </div>
  );
}

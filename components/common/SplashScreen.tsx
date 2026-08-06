export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]">
      <div className="relative flex items-center justify-center">
        {/* Rotating Ring */}
        <div
          className="
            absolute
            h-20
            w-20
            animate-spin
            rounded-[var(--radius-pill)]
            border-2
            border-[var(--border)]
            border-t-[var(--primary)]
          "
        />

        {/* IME Logo */}
        <h1 className="text-[1.75rem] font-semibold tracking-[0.12em] text-[var(--primary)]">
          IME
        </h1>
      </div>
    </div>
  );
}

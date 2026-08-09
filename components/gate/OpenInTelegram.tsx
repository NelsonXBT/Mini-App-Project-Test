/*
 * Shown when the app is opened outside Telegram — no initData on the
 * WebApp object, so there is nothing to validate against the bot token.
 *
 * Deliberately self-contained: no Header, no BottomNavigation, no Logo, no
 * shared layout wrapper. Nothing here imports app chrome, so none of it can
 * mount in a plain browser tab. Keep it that way.
 */
export default function OpenInTelegram() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-[1.375rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--text)]">
        Open this in Telegram
      </h1>

      <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
        This app runs inside Telegram. Launch it from the bot to continue.
      </p>
    </main>
  );
}

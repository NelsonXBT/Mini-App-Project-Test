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
      {/*
       * One line, held there by whitespace-nowrap — so the size is what has
       * to give, not the line count. This sentence is half again as long as
       * the heading it replaced, and at the old 1.375rem it measures ~321px
       * against the 272px a 320px phone leaves inside these gutters. 1.0625rem
       * lands at ~257px and clears on the narrowest screen Telegram opens on.
       *
       * Bumped to bold rather than up in size for the same reason: weight is
       * the only axis here that costs no width.
       */}
      <h1 className="whitespace-nowrap text-[1.0625rem] font-bold leading-tight tracking-[-0.025em] text-[var(--text)]">
        Access this platform in Telegram.
      </h1>
    </main>
  );
}

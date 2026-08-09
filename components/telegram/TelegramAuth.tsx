"use client";

import {
  ReactNode,
  useEffect,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import SplashScreen from "@/components/common/SplashScreen";
import OpenInTelegram from "@/components/gate/OpenInTelegram";
import { useSession } from "@/contexts/SessionContext";


/*
 * "/no-access" has to be public. It renders inside this same gate, so
 * without it a user lacking access would be redirected to it, fail the
 * check again, and redirect forever.
 */
const publicRoutes = ["/courses", "/no-access"];

/*
 * Load order, and it is strictly ordered:
 *
 *   1. Telegram context — is there initData at all? Decided during render by
 *      useSyncExternalStore, before the first paint.
 *   2. Backend HMAC validation — only started once step 1 passes.
 *   3. Course/channel access — only consulted once step 2 succeeds.
 *
 * Step 1 gates everything. An unvalidated visitor cannot reach the access
 * gate, let alone the app shell.
 */
type Validation =
  // Not started, or waiting on the backend.
  | "pending"
  // initData rejected, or the request never completed. Sealed.
  | "rejected"
  // HMAC verified; the access gate takes over from here.
  | "verified";

/*
 * The Telegram-context check.
 *
 * initData is injected synchronously by telegram-web-app.js, so this is a
 * plain read of an external value rather than anything async — which is why
 * it belongs in useSyncExternalStore and not an effect. React reads it during
 * render, so the very first painted frame in a plain browser tab is already
 * the "Open in Telegram" message: no splash, no logo, no chrome, not even for
 * a frame.
 *
 * The value never changes for the lifetime of the page, so subscribe is a
 * no-op. getServerSnapshot returns false because the server cannot see
 * window — the server HTML is the brand-free "checking" state, and hydration
 * then commits the real answer.
 */
const subscribeToTelegram = () => () => {};

const hasInitData = () =>
  Boolean(window.Telegram?.WebApp?.initData);

/*
 * null, not false: the server cannot see window, so it does not know. The
 * browser paints the server HTML before React hydrates, so answering "false"
 * here would flash "Open in Telegram" at a genuine Mini App user. null renders
 * a bare background instead — brand-free for a plain tab, and not a lie to a
 * real one. Hydration then commits the true answer before the next paint.
 */
const hasInitDataOnServer = () => null;

export default function TelegramAuth({
  children,
}: {
  children: ReactNode;
}) {
  // true / false once known on the client; null in the server HTML.
  const inTelegram = useSyncExternalStore<boolean | null>(
    subscribeToTelegram,
    hasInitData,
    hasInitDataOnServer
  );

  const [validation, setValidation] =
    useState<Validation>("pending");

  /*
   * router.refresh() returns void, so the transition is what tells us when
   * the re-rendered server payload has actually landed. Used to hold the
   * splash instead of flashing an empty page.
   */
  const [refreshing, startRefresh] = useTransition();

  const { hasAccess, setSession } = useSession();

  const pathname = usePathname();
  const router = useRouter();

  /*
   * Backend HMAC validation. Gated on inTelegram, so it can only ever fire
   * once the client-side initData check has passed — the two used to be one
   * pass that fell through to the access gate either way, which is how a
   * plain browser tab reached /no-access with the full shell around it.
   */
  useEffect(() => {
    if (!inTelegram) {
      return;
    }

    const tg = window.Telegram?.WebApp;

    tg?.ready();

    async function authenticate() {
      // Non-null: inTelegram is exactly the assertion that this is set.
      const initData = window.Telegram!.WebApp!.initData;

      try {
        const response = await fetch("/api/telegram-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            initData,
          }),
        });

        const data = await response.json();

        console.log("Telegram Auth:", data);

        setSession({
            user: data.user ?? null,
            hasAccess: data.hasAccess,
            unlockedCourses: data.unlockedCourses ?? [],
            });

            console.log("Session saved:", {
              user: data.user,
              hasAccess: data.hasAccess,
              unlockedCourses: data.unlockedCourses,
              });

        /*
         * A rejected HMAC means the initData did not come from Telegram, so
         * this is not a validated Mini App context either — treat it the
         * same as having no initData at all rather than handing the visitor
         * to the access gate.
         */
        if (!response.ok || !data.success) {
          console.error("Authentication failed:", data);
          setValidation("rejected");
          return;
        }

        /*
         * The session cookie only exists once the response above lands, but
         * the server components on this page already rendered without it:
         * getCurrentUser() found no cookie, so every user-scoped query came
         * back empty. That is why the home card stayed blank until a manual
         * reload. Re-run the server tree now that the cookie is attached.
         *
         * Skipped when access was refused — no session is created in that
         * case, and the gate is about to redirect to /no-access anyway.
         */
        if (data.hasAccess) {
          startRefresh(() => {
            router.refresh();
          });
        }
        setValidation("verified");
      } catch (error) {
        console.error("Telegram auth failed:", error);

        // Network or parse failure — validation never completed, so the app
        // stays sealed rather than opening on an unvalidated session.
        setValidation("rejected");
      }
    }

    authenticate();
  }, [inTelegram, router, setSession]);

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  /*
   * Course/channel access — unchanged logic, but now downstream of the
   * Telegram check: gated on validation === "verified", so it is only ever
   * consulted for a visitor whose initData the backend has validated.
   */
  const blocked =
    validation === "verified" &&
    !hasAccess &&
    !isPublicRoute;

  // Navigate to the real /no-access route rather than rendering its page
  // component inline. Importing a page module directly couples this to the
  // app directory layout, which is what broke when routes moved into the
  // (student) group.
  useEffect(() => {
    if (blocked) {
      router.replace("/no-access");
    }
  }, [blocked, router]);

  /*
   * The server HTML, before hydration has resolved the question either way.
   * Deliberately brand-free and chrome-free: a bare background is the only
   * thing safe to show a visitor we cannot yet classify.
   */
  if (inTelegram === null) {
    return (
      <div className="fixed inset-0 bg-[var(--background)]" />
    );
  }

  /*
   * Not a Telegram context, or initData Telegram would not vouch for.
   *
   * Returns before any chrome is reachable, so no nav, header, or logo mounts
   * in a plain browser tab — and because inTelegram is resolved during render,
   * this is the first frame such a visitor sees after hydration.
   */
  if (!inTelegram || validation === "rejected") {
    return <OpenInTelegram />;
  }

  /*
   * Past the Telegram check, so this visitor is in a real Mini App context and
   * the branded splash is appropriate. Held through the post-login refresh
   * too: dropping it the moment validation returns would paint one frame of
   * the stale, user-less server render — the blank card this fixes.
   */
  if (validation === "pending" || refreshing) {
    return <SplashScreen />;
  }

  // Hold the splash while the redirect is in flight so gated content is
  // never painted, even for a frame.
  if (blocked) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
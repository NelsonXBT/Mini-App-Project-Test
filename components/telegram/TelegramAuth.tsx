"use client";

import {
  ReactNode,
  useEffect,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import SplashScreen from "@/components/common/SplashScreen";
import { useSession } from "@/contexts/SessionContext";


/*
 * "/no-access" has to be public. It renders inside this same gate, so
 * without it a user lacking access would be redirected to it, fail the
 * check again, and redirect forever.
 */
const publicRoutes = ["/courses", "/no-access"];

export default function TelegramAuth({
  children,
}: {
  children: ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  /*
   * router.refresh() returns void, so the transition is what tells us when
   * the re-rendered server payload has actually landed. Used to hold the
   * splash instead of flashing an empty page.
   */
  const [refreshing, startRefresh] = useTransition();

  const {
        hasAccess,
        setSession,
      } = useSession();

      const pathname = usePathname();
      const router = useRouter();

  useEffect(() => {
    async function authenticate() {
      const tg = (window as any).Telegram?.WebApp;

      if (!tg) {
        setLoading(false);
        return;
      }

      tg.ready();

      const initData = tg.initData;

      if (!initData) {
        setLoading(false);
        return;
      }

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

        if (!response.ok || !data.success) {
          console.error("Authentication failed:", data);
          setLoading(false);
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
      } catch (error) {
        console.error("Telegram auth failed:", error);
      } finally {
        setLoading(false);
      }
    }

    authenticate();
  }, [router]);

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const blocked = !loading && !hasAccess && !isPublicRoute;

  // Navigate to the real /no-access route rather than rendering its page
  // component inline. Importing a page module directly couples this to the
  // app directory layout, which is what broke when routes moved into the
  // (student) group.
  useEffect(() => {
    if (blocked) {
      router.replace("/no-access");
    }
  }, [blocked, router]);

  // Keep the splash up through the post-login refresh too. Dropping it the
  // moment authenticate() returns would paint one frame of the stale,
  // user-less server render — the very blank card this fixes.
  if (loading || refreshing) {
    return <SplashScreen />;
  }

  // Hold the splash while the redirect is in flight so gated content is
  // never painted, even for a frame.
  if (blocked) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
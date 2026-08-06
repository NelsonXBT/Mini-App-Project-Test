"use client";

import { ReactNode, useEffect, useState } from "react";
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

        
      } catch (error) {
        console.error("Telegram auth failed:", error);
      } finally {
        setLoading(false);
      }
    }

    authenticate();
  }, []);

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

  if (loading) {
    return <SplashScreen />;
  }

  // Hold the splash while the redirect is in flight so gated content is
  // never painted, even for a frame.
  if (blocked) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
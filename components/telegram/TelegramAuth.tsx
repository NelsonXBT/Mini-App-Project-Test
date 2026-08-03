"use client";

import { ReactNode, useEffect, useState } from "react";
import SplashScreen from "@/components/common/SplashScreen";
import NoAccessPage from "@/app/no-access/page";
import { useSession } from "@/contexts/SessionContext";

export default function TelegramAuth({
  children,
}: {
  children: ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  // const [hasAccess, setHasAccess] = useState(false);
  const {
        hasAccess,
        setSession,
      } = useSession();

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

  if (loading) {
  return <SplashScreen />;
}

if (!hasAccess) {
  return <NoAccessPage />;
}

return <>{children}</>;
}
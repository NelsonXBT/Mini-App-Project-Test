"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import SplashScreen from "@/components/common/SplashScreen";

export default function TelegramAuth() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

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

        if (!response.ok || !data.success) {
          console.error("Authentication failed:", data);
          setLoading(false);
          return;
        }

        if (!data.hasAccess) {
          router.replace("/no-access");
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error("Telegram auth failed:", error);
        setLoading(false);
      }
    }

    authenticate();
  }, [router]);

  if (loading) {
    return <SplashScreen />;
  }

  return null;
}
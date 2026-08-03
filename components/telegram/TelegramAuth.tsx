"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TelegramAuth() {
  const router = useRouter();

  useEffect(() => {
    async function authenticate() {
      const tg = (window as any).Telegram?.WebApp;

      if (!tg) return;

      tg.ready();

      const initData = tg.initData;

      if (!initData) return;

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
          return;
        }

        if (!data.hasAccess) {
          router.replace("/no-access");
        }
      } catch (error) {
        console.error("Telegram auth failed:", error);
      }
    }

    authenticate();
  }, [router]);

  return null;
}
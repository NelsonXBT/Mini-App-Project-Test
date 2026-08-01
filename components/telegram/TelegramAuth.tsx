"use client";

import { useEffect } from "react";

export default function TelegramAuth() {
  useEffect(() => {
    async function authenticate() {
      const tg = (window as any).Telegram?.WebApp;

      if (!tg) return;

      tg.ready();

      const initData = tg.initData;

      if (!initData) return;

      try {
        const response = await fetch(
          "/api/auth/telegram/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              initData,
            }),
          }
        );

        const data = await response.json();

        console.log("Telegram Auth:", data);
      } catch (error) {
        console.error("Telegram auth failed:", error);
      }
    }

    authenticate();
  }, []);

  return null;
}
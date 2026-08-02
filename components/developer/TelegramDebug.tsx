"use client";

import { useEffect, useState } from "react";

type TelegramInfo = {
  loaded: boolean;
  version?: string;
  platform?: string;
  colorScheme?: string;
  language?: string;
  isExpanded?: boolean;
  viewportHeight?: number;
  viewportStableHeight?: number;
  initData?: boolean;
  user?: {
    id?: number;
    first_name?: string;
    last_name?: string;
    username?: string;
  };
};

export default function TelegramDebug() {
  const [info, setInfo] = useState<TelegramInfo | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (!tg) {
      setInfo({
        loaded: false,
      });

      return;
    }

    tg.ready();

    setInfo({
      loaded: true,
      version: tg.version,
      platform: tg.platform,
      colorScheme: tg.colorScheme,
      language: tg.initDataUnsafe?.user?.language_code,
      isExpanded: tg.isExpanded,
      viewportHeight: tg.viewportHeight,
      viewportStableHeight: tg.viewportStableHeight,
      initData: Boolean(tg.initData),
      user: tg.initDataUnsafe?.user,
    });
  }, []);

  if (!info) {
    return (
      <p className="text-zinc-400">
        Loading Telegram...
      </p>
    );
  }

  return (
    <div className="space-y-2 text-sm">
      <p>
        SDK:{" "}
        {info.loaded ? "✅ Loaded" : "❌ Missing"}
      </p>

      <p>
        Version:{" "}
        {info.version ?? "--"}
      </p>

      <p>
        Platform:{" "}
        {info.platform ?? "--"}
      </p>

      <p>
        Color Scheme:{" "}
        {info.colorScheme ?? "--"}
      </p>

      <p>
        Language:{" "}
        {info.language ?? "--"}
      </p>

      <p>
        Expanded:{" "}
        {info.isExpanded ? "Yes" : "No"}
      </p>

      <p>
        Viewport Height:{" "}
        {info.viewportHeight ?? "--"}
      </p>

      <p>
        Stable Height:{" "}
        {info.viewportStableHeight ?? "--"}
      </p>

      <p>
        InitData:{" "}
        {info.initData ? "✅ Present" : "❌ Missing"}
      </p>

      <p>
        Telegram User:{" "}
        {info.user?.username ?? "--"}
      </p>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";

type TelegramData = {
  loaded: boolean;
  version?: string;
  platform?: string;
  colorScheme?: string;
  isExpanded?: boolean;
  viewportHeight?: number;
  initData?: string;
  user?: {
    id?: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  };
};

export default function ResourcesPage() {
  const [tgData, setTgData] = useState<TelegramData | null>(null);

  const [loginResult, setLoginResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (!tg) {
      setTgData({
        loaded: false,
      });

      return;
    }

    tg.ready();

    setTgData({
      loaded: true,
      version: tg.version,
      platform: tg.platform,
      colorScheme: tg.colorScheme,
      isExpanded: tg.isExpanded,
      viewportHeight: tg.viewportHeight,
      initData: tg.initData,
      user: tg.initDataUnsafe?.user,
    });
  }, []);

  async function verifyLogin() {
  const tg = window.Telegram?.WebApp;

  if (!tg?.initData) {
    setLoginResult({
      success: false,
      error: "Telegram initData missing.",
    });
    return;
  }

  try {
    setLoading(true);

    const res = await fetch("/api/auth/telegram/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        initData: tg.initData,
      }),
    });

    const text = await res.text();

    let json;

    try {
      json = JSON.parse(text);
    } catch {
      json = {
        status: res.status,
        body: text,
      };
    }

    setLoginResult(json);
  } catch (err: any) {
    console.error(err);

    setLoginResult({
      success: false,
      error: err?.message ?? "Unknown fetch error",
    });
  } finally {
    setLoading(false);
  }
}

  if (!tgData) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <p className="text-zinc-400">
          Loading Telegram...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">

      <h1 className="text-3xl font-bold text-cyan-400">
        Telegram Integration Test
      </h1>

      <div className="rounded-xl bg-zinc-900 p-5 space-y-3">

        <p>
          <strong>SDK Loaded:</strong>{" "}
          {tgData.loaded ? "✅ Yes" : "❌ No"}
        </p>

        <p>
          <strong>Version:</strong>{" "}
          {tgData.version ?? "--"}
        </p>

        <p>
          <strong>Platform:</strong>{" "}
          {tgData.platform ?? "--"}
        </p>

        <p>
          <strong>Theme:</strong>{" "}
          {tgData.colorScheme ?? "--"}
        </p>

        <p>
          <strong>Expanded:</strong>{" "}
          {tgData.isExpanded ? "Yes" : "No"}
        </p>

        <p>
          <strong>Viewport Height:</strong>{" "}
          {tgData.viewportHeight ?? "--"}
        </p>

        <p>
          <strong>InitData:</strong>{" "}
          {tgData.initData ? "✅ Present" : "❌ Missing"}
        </p>

      </div>

      <div className="rounded-xl bg-zinc-900 p-5 space-y-3">

        <h2 className="text-xl font-semibold text-cyan-400">
          Telegram User
        </h2>

        <p>
          <strong>ID:</strong>{" "}
          {tgData.user?.id ?? "--"}
        </p>

        <p>
          <strong>First Name:</strong>{" "}
          {tgData.user?.first_name ?? "--"}
        </p>

        <p>
          <strong>Last Name:</strong>{" "}
          {tgData.user?.last_name ?? "--"}
        </p>

        <p>
          <strong>Username:</strong>{" "}
          {tgData.user?.username ?? "--"}
        </p>

        <p>
          <strong>Language:</strong>{" "}
          {tgData.user?.language_code ?? "--"}
        </p>

      </div>

      <div className="rounded-xl bg-zinc-900 p-5">

        <h2 className="mb-3 text-xl font-semibold text-cyan-400">
          Raw Init Data
        </h2>

        <textarea
          readOnly
          value={tgData.initData ?? ""}
          className="h-48 w-full rounded-lg bg-black p-3 text-xs text-green-400"
        />

      </div>

      <div className="rounded-xl bg-zinc-900 p-5 space-y-4">

        <h2 className="text-xl font-semibold text-cyan-400">
          Backend Login Test
        </h2>

        <button
          onClick={verifyLogin}
          disabled={loading}
          className="rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify Login"}
        </button>

        {loginResult && (
          <pre className="overflow-auto rounded-lg bg-black p-4 text-xs text-green-400">
            {JSON.stringify(loginResult, null, 2)}
          </pre>
        )}

      </div>

    </main>
  );
}
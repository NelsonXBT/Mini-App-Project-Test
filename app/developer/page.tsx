"use client";

import { useEffect, useState } from "react";

import DebugCard from "@/components/developer/DebugCard";
import DebugRow from "@/components/developer/DebugRow";
import DebugStatus from "@/components/developer/DebugStatus";
import TelegramDebug from "@/components/developer/TelegramDebug";

export default function DeveloperPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadDebug() {
      try {
        const res = await fetch("/api/developer/debug");

        const json = await res.json();

        setData(json);
      } catch (err) {
        console.error(err);
      }
    }

    loadDebug();
  }, []);

  if (!data) {
    return (
      <main className="mx-auto max-w-5xl">
        <p className="text-zinc-400">
          Loading developer dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400">
          Developer Dashboard
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Internal diagnostics for IME Creative Lab
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">

        {/* Authentication */}

        <DebugCard title="Authentication">
          <DebugRow
            label="Authenticated"
            value={data.authenticated ? "✅ Yes" : "❌ No"}
          />
        </DebugCard>

        {/* Telegram SDK */}

        <DebugCard title="Telegram SDK">
          <TelegramDebug />
        </DebugCard>

        {/* User */}

        <DebugCard title="User">
          <DebugRow
            label="User ID"
            value={data.user?.id ?? "--"}
          />

          <DebugRow
            label="Telegram ID"
            value={data.user?.telegramId ?? "--"}
          />

          <DebugRow
            label="Username"
            value={data.user?.username ?? "--"}
          />

          <DebugRow
            label="Name"
            value={
              data.user
                ? `${data.user.firstName} ${data.user.lastName ?? ""}`
                : "--"
            }
          />
        </DebugCard>

        {/* Database */}

        <DebugCard title="Database">
          <DebugStatus
            label="Database"
            status={data.database.connected}
          />

          <DebugRow
            label="Users"
            value={data.database.users}
          />

          <DebugRow
            label="Sessions"
            value={data.database.sessions}
          />

          <DebugRow
            label="Courses"
            value={data.database.courses}
          />

          <DebugRow
            label="Lessons"
            value={data.database.lessons}
          />
        </DebugCard>

        {/* Environment */}

        <DebugCard title="Environment">
          <DebugRow
            label="Node"
            value={data.environment.nodeEnv}
          />

          <DebugStatus
            label="Bot Token"
            status={data.environment.botTokenLoaded}
          />
        </DebugCard>

      </section>
    </main>
  );
}
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui";
import { FormField, inputClasses } from "@/components/admin/ui";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error ?? "Invalid credentials.");
        setBusy(false);
        return;
      }

      // Only allow relative paths back, so ?next= can't be used to bounce
      // someone to another origin after a successful login.
      const next = searchParams.get("next");
      const target =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : "/admin";

      router.replace(target);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField label="Username" htmlFor="username">
        <input
          id="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={inputClasses}
        />
      </FormField>

      <FormField label="Password" htmlFor="password">
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClasses}
        />
      </FormField>

      {error && (
        <p
          role="alert"
          className="
            rounded-[var(--radius-control)]
            border
            border-[var(--danger)]/25
            bg-[var(--danger)]/10
            px-3
            py-2.5
            text-[14px]
            text-[var(--danger)]
          "
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={busy}
        className="w-full"
      >
        {busy ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

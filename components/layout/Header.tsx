import { Bell } from "lucide-react";

export default function Header() {
  return (
    <header className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-wide text-cyan-400">
          IME
        </h1>

        <p className="text-xs text-zinc-500">
          Creative Lab
        </p>
      </div>

      <button
        aria-label="Notifications"
        className="rounded-full p-2 transition-colors hover:bg-zinc-800"
      >
        <Bell className="h-5 w-5 text-zinc-300" />
      </button>
    </header>
  );
}
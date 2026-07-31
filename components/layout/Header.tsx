import { Bell } from "lucide-react";

export default function Header() {
  return (
    <header className="mb-3 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-wide text-cyan-400 leading-none">
          IME
        </h1>
      </div>

      <button
        aria-label="Notifications"
        className="rounded-full p-1.5 transition-colors hover:bg-zinc-800"
      >
        <Bell className="h-5 w-5 text-zinc-300" />
      </button>
    </header>
  );
}
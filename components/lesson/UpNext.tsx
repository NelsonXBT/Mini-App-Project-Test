import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";

type UpNextProps = {
  title: string;
  duration: number;
  href: string;
};

export default function UpNext({
  title,
  duration,
  href,
}: UpNextProps) {
  const formattedDuration =
    duration > 0
      ? `${Math.ceil(duration / 60)} min`
      : "—";

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900">
      <Link
        href={href}
        className="flex items-center justify-between p-4 transition-colors hover:bg-zinc-800/40"
      >
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-cyan-400">
            Up Next
          </p>

          <h3 className="truncate text-base font-semibold text-white transition-colors hover:text-cyan-400">
            {title}
          </h3>

          <div className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
            <Clock size={14} />
            <span>{formattedDuration}</span>
          </div>
        </div>

        <ChevronRight
          size={22}
          className="ml-4 shrink-0 text-zinc-500"
        />
      </Link>
    </section>
  );
}
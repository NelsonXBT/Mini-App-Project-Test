import Link from "next/link";

type UpNextProps = {
  title: string;
  duration: string;
  href: string;
};

export default function UpNext({
  title,
  duration,
  href,
}: UpNextProps) {
  return (
    <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Up Next
            </p>

      <Link
        href={href}
        className="mt-3 block"
      >
        <h3 className="mt-3 text-lg font-semibold text-white transition hover:text-cyan-400">
        {title}
        </h3>

        <p className="mt-2 text-sm text-zinc-500">
        {duration}
        </p>
      </Link>
    </section>
  );
}
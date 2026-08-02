interface Props {
  title: string;
  children: React.ReactNode;
}

export default function DebugCard({
  title,
  children,
}: Props) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

      <h2 className="mb-4 text-lg font-semibold text-cyan-400">
        {title}
      </h2>

      <div className="space-y-2 text-sm">
        {children}
      </div>

    </div>
  );
}
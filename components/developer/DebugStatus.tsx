interface Props {
  label: string;
  status: boolean;
}

export default function DebugStatus({
  label,
  status,
}: Props) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-900 pb-2">

      <span className="text-zinc-400">
        {label}
      </span>

      <span
        className={`rounded-full px-2 py-1 text-xs font-semibold ${
          status
            ? "bg-green-500/20 text-green-400"
            : "bg-red-500/20 text-red-400"
        }`}
      >
        {status ? "Healthy" : "Failed"}
      </span>

    </div>
  );
}
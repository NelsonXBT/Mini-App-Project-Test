interface Props {
  label: string;
  value: React.ReactNode;
}

export default function DebugRow({
  label,
  value,
}: Props) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-900 pb-2">

      <span className="text-zinc-400">
        {label}
      </span>

      <span className="font-medium text-white">
        {value}
      </span>

    </div>
  );
}
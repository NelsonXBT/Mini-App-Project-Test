type FileCardProps = {
  icon: string;
  title: string;
  files: number;
};

export default function FileCard({
  icon,
  title,
  files,
}: FileCardProps) {
  return (
    <button
      className="flex w-full items-center rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-cyan-500 hover:bg-zinc-800"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 text-2xl">
        {icon}
      </div>

      <div className="ml-4 flex-1 text-left">
        <h3 className="font-semibold text-white">
          {title}
        </h3>

        <p className="text-sm text-zinc-400">
          {files} Files
        </p>
      </div>

      <span className="text-xl text-zinc-500">
        ›
      </span>
    </button>
  );
}
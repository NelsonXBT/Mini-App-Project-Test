type ResourceCardProps = {
  icon: string;
  title: string;
  description: string;
  badge?: string;
};

export default function ResourceCard({
  icon,
  title,
  description,
  badge,
}: ResourceCardProps) {
  return (
    <button className="flex w-full items-center rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-all duration-200 hover:border-cyan-500 hover:bg-zinc-800">
      {/* Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 text-2xl">
        {icon}
      </div>

      {/* Content */}
      <div className="ml-4 flex-1 text-left">
        <h3 className="font-semibold text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm text-zinc-400">
          {description}
        </p>
      </div>

      {/* Badge */}
      {badge && (
        <span className="mr-3 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-400">
          {badge}
        </span>
      )}

      {/* Arrow */}
      <span className="text-xl text-zinc-500">
        ›
      </span>
    </button>
  );
}
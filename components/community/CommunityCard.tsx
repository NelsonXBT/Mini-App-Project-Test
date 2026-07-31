type CommunityCardProps = {
  icon: string;
  title: string;
  description: string;
};

export default function CommunityCard({
  icon,
  title,
  description,
}: CommunityCardProps) {
  return (
    <button className="flex w-full items-center rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-all duration-200 hover:border-cyan-500 hover:bg-zinc-800">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 text-2xl">
        {icon}
      </div>

      <div className="ml-4 flex-1 text-left">
        <h3 className="font-semibold text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm text-zinc-400">
          {description}
        </p>
      </div>

      <span className="text-xl text-zinc-500">
        ›
      </span>
    </button>
  );
}
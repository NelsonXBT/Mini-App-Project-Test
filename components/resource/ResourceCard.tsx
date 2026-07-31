import {
  Package,
  ClipboardList,
  FolderOpen,
  Palette,
  Images,
  Rabbit,
  Coins,
  TrendingUp,
  ChartColumn,
  ChevronRight,
} from "lucide-react";

type ResourceCardProps = {
  title: string;
  description: string;
  icon: string;
  badge?: string;
};

export default function ResourceCard({
  title,
  description,
  icon,
  badge,
}: ResourceCardProps) {
  const renderIcon = () => {
    switch (icon) {
      case "package":
        return <Package className="h-6 w-6 text-cyan-400" />;

      case "clipboard":
        return (
          <ClipboardList className="h-6 w-6 text-green-400" />
        );

      case "folder":
        return (
          <FolderOpen className="h-6 w-6 text-amber-400" />
        );

      case "palette":
        return (
          <Palette className="h-6 w-6 text-violet-400" />
        );

      case "images":
        return (
          <Images className="h-6 w-6 text-orange-400" />
        );

      case "rabbit":
        return (
          <Rabbit className="h-6 w-6 text-white" />
        );

      case "coins":
        return (
          <Coins className="h-6 w-6 text-yellow-400" />
        );

      case "trending":
        return (
          <TrendingUp className="h-6 w-6 text-emerald-400" />
        );

      case "chart":
        return (
          <ChartColumn className="h-6 w-6 text-sky-400" />
        );

      default:
        return (
          <Package className="h-6 w-6 text-zinc-400" />
        );
    }
  };

  return (
    <button className="flex w-full items-center rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-cyan-500 hover:bg-zinc-800">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800">
        {renderIcon()}
      </div>

      <div className="ml-4 flex-1 text-left">
        <h3 className="font-medium text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm text-zinc-400">
          {description}
        </p>
      </div>

      {badge && (
        <span className="mr-3 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-400">
          {badge}
        </span>
      )}

      <ChevronRight className="h-5 w-5 text-zinc-500" />
    </button>
  );
}
import {
  Folder,
  Film,
  BookOpen,
  Palette,
  Blocks,
  ChevronRight,
} from "lucide-react";

type FileCardProps = {
  title: string;
  files: number;
  icon: string;
};

export default function FileCard({
  title,
  files,
  icon,
}: FileCardProps) {
  const renderIcon = () => {
    switch (icon) {
      case "folder":
        return <Folder className="h-6 w-6 text-amber-400" />;

      case "film":
        return <Film className="h-6 w-6 text-sky-400" />;

      case "book":
        return <BookOpen className="h-6 w-6 text-red-400" />;

      case "palette":
        return <Palette className="h-6 w-6 text-violet-400" />;

      case "blocks":
        return <Blocks className="h-6 w-6 text-green-400" />;

      default:
        return <Folder className="h-6 w-6 text-zinc-400" />;
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
          {files} Files
        </p>
      </div>

      <ChevronRight className="h-5 w-5 text-zinc-500" />
    </button>
  );
}
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
  // One size and stroke weight for every icon; the hue is the only variable.
  const shared = "h-5 w-5";
  const stroke = 1.9;

  const renderIcon = () => {
    switch (icon) {
      case "package":
        return <Package className={`${shared} text-[var(--primary)]`} strokeWidth={stroke} />;

      case "clipboard":
        return <ClipboardList className={`${shared} text-[#3f8f63]`} strokeWidth={stroke} />;

      case "folder":
        return <FolderOpen className={`${shared} text-[var(--primary)]`} strokeWidth={stroke} />;

      case "palette":
        return <Palette className={`${shared} text-[#7a5cc0]`} strokeWidth={stroke} />;

      case "images":
        return <Images className={`${shared} text-[#c47a3d]`} strokeWidth={stroke} />;

      case "rabbit":
        return <Rabbit className={`${shared} text-[var(--text)]`} strokeWidth={stroke} />;

      case "coins":
        return <Coins className={`${shared} text-[var(--primary)]`} strokeWidth={stroke} />;

      case "trending":
        return <TrendingUp className={`${shared} text-[#3f8f63]`} strokeWidth={stroke} />;

      case "chart":
        return <ChartColumn className={`${shared} text-[#4a72b8]`} strokeWidth={stroke} />;

      default:
        return <Package className={`${shared} text-[var(--text-muted)]`} strokeWidth={stroke} />;
    }
  };

  return (
    <button
      className="
        group
        flex
        w-full
        items-center
        gap-4
        rounded-[var(--radius)]
        border
        border-[var(--border)]
        bg-[var(--card)]
        px-4
        py-3.5
        text-left
        shadow-[var(--shadow-card)]
        transition-all
        duration-200
        ease-out
        hover:-translate-y-0.5
        hover:border-[var(--border-strong)]
        hover:shadow-[var(--shadow-raised)]
      "
    >
      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-[var(--radius-control)]
          bg-[var(--surface-secondary)]
        "
      >
        {renderIcon()}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[14px] font-medium tracking-tight text-[var(--text)]">
          {title}
        </h3>

        <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-[var(--text-muted)]">
          {description}
        </p>
      </div>

      {badge && (
        <span
          className="
            shrink-0
            rounded-[var(--radius-pill)]
            border
            border-[var(--border)]
            bg-[var(--surface-secondary)]
            px-2.5
            py-1
            text-[10px]
            font-medium
            uppercase
            leading-none
            tracking-[0.04em]
            text-[var(--text-muted)]
            whitespace-nowrap
          "
        >
          {badge}
        </span>
      )}

      <ChevronRight
        className="
          h-4.5
          w-4.5
          shrink-0
          text-[var(--text-subtle)]
          transition-transform
          duration-200
          ease-out
          group-hover:translate-x-0.5
        "
        strokeWidth={1.9}
      />
    </button>
  );
}

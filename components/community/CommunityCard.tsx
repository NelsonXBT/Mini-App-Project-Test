import {
  MessageCircle,
  Users,
  ChevronRight,
  MessageSquareText,
} from "lucide-react";

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
  const shared = "h-5 w-5";
  const stroke = 1.9;

  const renderIcon = () => {
    switch (icon) {
      case "whatsapp":
        return <MessageCircle className={`${shared} text-[#3f8f63]`} strokeWidth={stroke} />;

      case "community":
        return <Users className={`${shared} text-[#4a6fa8]`} strokeWidth={stroke} />;

      case "support":
        return <MessageSquareText className={`${shared} text-[#c47a3d]`} strokeWidth={stroke} />;
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
      {/* Icon */}

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

      {/* Text */}

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[14px] font-medium tracking-tight text-[var(--text)]">
          {title}
        </h3>

        <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-[var(--text-muted)]">
          {description}
        </p>
      </div>

      {/* Arrow */}

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


import {
  MessageCircle,
  Users,
  LifeBuoy,
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
  const renderIcon = () => {
  switch (icon) {
    case "whatsapp":
  return (
    <MessageCircle className="h-6 w-6 text-green-400" />
  );

case "community":
  return (
    <Users className="h-6 w-6 text-cyan-400" />
  );

case "support":
  return (
    <MessageSquareText className="h-6 w-6 text-orange-400" />
  );
  }
};
  return (
  <button
    className="
      flex
      w-full
      items-center
      rounded-2xl
      border
      border-zinc-800
      bg-zinc-900
      p-4
      transition-all
      duration-300
      hover:border-cyan-500
      hover:bg-zinc-800
      hover:shadow-[0_0_20px_rgba(6,182,212,.10)]
    "
  >
    {/* Icon */}

    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800">
      {renderIcon()}
    </div>

    {/* Text */}

    <div className="ml-4 flex-1 text-left">

      <h3 className="font-semibold text-white">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-5 text-zinc-400">
        {description}
      </p>

    </div>

    {/* Arrow */}

    <ChevronRight className="h-5 w-5 text-zinc-600" />
  </button>
);
}



import {
  MessageCircle,
  Users,
  LifeBuoy,
  ChevronRight,
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
        <LifeBuoy className="h-6 w-6 text-orange-400" />
      );

    default:
      return (
        <Users className="h-6 w-6 text-zinc-400" />
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

      <ChevronRight className="h-5 w-5 text-zinc-500" />
    </button>
  );
}

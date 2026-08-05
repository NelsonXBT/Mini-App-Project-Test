import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  Icon,
  Progress,
} from "@/components/ui";

type LearningCardProps = {
  thumbnail: string;
  title: string;

  lessonText: string;

  badge: string;

  badgeTone?: "default" | "accent";

  buttonText: string;

  buttonHref: string;

  progress?: number;
};

export default function LearningCard({
  thumbnail,
  title,
  lessonText,
  badge,
  badgeTone = "default",
  buttonText,
  buttonHref,
  progress,
}: LearningCardProps) {
  return (
    <Card className="overflow-hidden">

      {/* Thumbnail */}

      <div className="relative h-44 w-full">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}

      <div className="space-y-5 p-5">

        <h2 className="line-clamp-2 text-xl font-semibold leading-tight text-[var(--text)]">
          {title}
        </h2>

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <Icon
              icon={BookOpen}
              tone="accent"
              size="sm"
            />

            <span className="text-sm text-[var(--text-muted)]">
              {lessonText}
            </span>

          </div>

          <Badge
            className={
              badgeTone === "accent"
                ? "bg-[var(--primary)] text-white border-transparent"
                : ""
            }
          >
            {badge}
          </Badge>

        </div>

        {progress !== undefined && (
          <Progress value={progress} />
        )}

        <Button
          href={buttonHref}
          className="w-full"
        >
          {buttonText}
        </Button>

      </div>

    </Card>
  );
}
import Image from "next/image";
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

      <div className="relative h-40 w-full bg-[var(--surface-secondary)]">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover"
        />

        {/* Seats the image against the content instead of butting two
            flat planes together. */}
        <div
          className="absolute inset-x-0 bottom-0 h-px bg-[var(--border)]"
          aria-hidden="true"
        />
      </div>

      {/* Content */}

      <div className="space-y-3 p-4">

        <h2 className="line-clamp-2 text-[1.0625rem] font-semibold leading-snug tracking-[-0.02em] text-[var(--text)]">
          {title}
        </h2>

        <div className="flex items-center justify-between gap-3">

          <div className="flex items-center gap-1.5">

            <Icon
              icon={BookOpen}
              tone="accent"
              size="sm"
            />

            <span className="text-[13px] text-[var(--text-muted)]">
              {lessonText}
            </span>

          </div>

          <Badge
            className={
              badgeTone === "accent"
                ? "border-transparent bg-[var(--primary)] text-white"
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
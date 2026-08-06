import SaveLink from "@/components/common/SaveLink";
import { ChevronRight, Clock } from "lucide-react";

import { Icon, SectionTitle } from "@/components/ui";

type UpNextProps = {
  title: string;
  duration: number;
  href: string;
};

export default function UpNext({
  title,
  duration,
  href,
}: UpNextProps) {
  const formattedDuration =
    duration > 0
      ? `${Math.ceil(duration / 60)} min`
      : "—";

  return (
    <section className="space-y-3">
      <SectionTitle>Up Next</SectionTitle>

      <SaveLink
        href={href}
        className="
          group
          flex
          items-center
          justify-between
          rounded-xl
          border
          border-[var(--border)]
          bg-[var(--card)]
          p-5
          transition-colors
          duration-200
          hover:bg-[var(--surface-secondary)]
        "
      >
        <div className="min-w-0 flex-1">

          <h3
            className="
              truncate
              text-[16px]
              font-semibold
              text-[var(--text)]
            "
          >
            {title}
          </h3>

          <div className="mt-2 flex items-center gap-2">

            <Icon
              icon={Clock}
              size="xs"
              tone="muted"
            />

            <span className="text-sm text-[var(--text-muted)]">
              {formattedDuration}
            </span>

          </div>

        </div>

        <ChevronRight
          className="
            ml-4
            h-5
            w-5
            shrink-0
            text-[var(--text-muted)]
            transition-transform
            duration-200
            group-hover:translate-x-0.5
          "
        />
      </SaveLink>
    </section>
  );
}
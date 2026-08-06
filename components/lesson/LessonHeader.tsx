import SaveLink from "@/components/common/SaveLink";
import { ArrowLeft } from "lucide-react";

import { Icon } from "@/components/ui";

type LessonHeaderProps = {
  courseSlug: string;
  courseTitle: string;
};

export default function LessonHeader({
  courseSlug,
  courseTitle,
}: LessonHeaderProps) {
  return (
    <header
      className="
        flex
        items-center
        gap-4
      "
    >
      <SaveLink
        href={`/courses/${courseSlug}`}
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-lg
          border
          border-[var(--border)]
          bg-[var(--card)]
          transition-colors
          duration-200
          hover:bg-[var(--surface-secondary)]
        "
      >
        <Icon
          icon={ArrowLeft}
          size="sm"
        />
      </SaveLink>

      <h1
        className="
          flex-1
          truncate
          text-[17px]
          font-semibold
          text-[var(--text)]
        "
      >
        {courseTitle}
      </h1>
    </header>
  );
}
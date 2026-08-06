import SaveLink from "@/components/common/SaveLink";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Prisma } from "@prisma/client";

type Lesson = Prisma.LessonGetPayload<{}>;

type LessonNavigationProps = {
  courseSlug: string;
  lessonId: string;
  previousLesson: Lesson | null;
  nextLesson: Lesson | null;
};

export default function LessonNavigation({
  courseSlug,
  previousLesson,
  nextLesson,
}: LessonNavigationProps) {
  return (
    <nav className="pt-2">
      <div className="grid grid-cols-2 gap-3">

        {previousLesson ? (
          <SaveLink
            href={`/courses/${courseSlug}/lessons/${previousLesson.id}`}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-[var(--border)]
              bg-[var(--card)]
              px-4
              py-3
              text-sm
              font-medium
              text-[var(--text)]
              transition-colors
              duration-200
              hover:bg-[var(--surface-secondary)]
            "
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </SaveLink>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <SaveLink
            href={`/courses/${courseSlug}/lessons/${nextLesson.id}`}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-[var(--primary)]
              px-4
              py-3
              text-sm
              font-medium
              text-white
              transition-colors
              duration-200
              hover:bg-[var(--primary-hover)]
            "
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </SaveLink>
        ) : (
          <div />
        )}

      </div>
    </nav>
  );
}



import SaveLink from "@/components/player/SaveLink";
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
            save={() => Promise.resolve()}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:border-cyan-500 hover:text-cyan-400"
          >
            <ChevronLeft size={18} />
            Previous
          </SaveLink>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <SaveLink
            href={`/courses/${courseSlug}/lessons/${nextLesson.id}`}
            save={() => Promise.resolve()}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-cyan-400"
          >
            Next
            <ChevronRight size={18} />
          </SaveLink>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}
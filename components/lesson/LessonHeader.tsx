

import SaveLink from "@/components/common/SaveLink";
import { ArrowLeft } from "lucide-react";

type LessonHeaderProps = {
  courseSlug: string;
  courseTitle: string;
};

export default function LessonHeader({
  courseSlug,
  courseTitle,
}: LessonHeaderProps) {
  return (
    <header className="mb-6 flex items-center gap-4">
      <SaveLink
          href={`/courses/${courseSlug}`}
          className="rounded-full p-2 transition hover:bg-zinc-800 hover:text-cyan-400"
        >
        <ArrowLeft className="h-5 w-5" />
      </SaveLink>

      <h1 className="flex-1 truncate text-lg font-semibold text-white">
        {courseTitle}
      </h1>
    </header>
  );
}
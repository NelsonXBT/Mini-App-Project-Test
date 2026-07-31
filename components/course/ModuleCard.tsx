import { ChevronDown } from "lucide-react";
import LessonCard from "./LessonCard";
import { Prisma } from "@prisma/client";

type Module = Prisma.ModuleGetPayload<{
  include: {
    lessons: true;
  };
}>;

type ModuleCardProps = {
  module: Module;
  courseSlug: string;
  lessonOffset: number;
};

export default function ModuleCard({
  module,
  courseSlug,
  lessonOffset,
}: ModuleCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <h2 className="font-semibold text-white">
          {module.title}
        </h2>

        <ChevronDown className="h-5 w-5 text-zinc-500" />
      </div>

      <div className="space-y-2 p-3">
        {module.lessons.map((lesson, index) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            lessonNumber={lessonOffset + index + 1}
            courseSlug={courseSlug}
          />
        ))}
      </div>
    </section>
  );
}
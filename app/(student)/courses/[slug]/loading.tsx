import { Skeleton } from "@/components/ui";

/*
 * The course page is the heaviest query in the app — course, modules, lessons,
 * resources and per-user progress in one tree — so it is the surface where a
 * loading boundary matters most.
 *
 * Stands in for CourseProgress above CourseLearning's module list.
 */
export default function CourseLoading() {
  return (
    <div className="space-y-4">

      {/* Progress bar */}

      <section className="flex items-center gap-3">
        <Skeleton className="h-1.5 flex-1 rounded-[var(--radius-pill)]" />
        <Skeleton className="h-4 w-[38px]" />
      </section>

      {/* Player */}

      <Skeleton className="aspect-video w-full rounded-[var(--radius)]" />

      {/* Module list */}

      <div className="space-y-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-card)]"
          >
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="mt-3 h-4 w-1/3" />
          </div>
        ))}
      </div>

    </div>
  );
}

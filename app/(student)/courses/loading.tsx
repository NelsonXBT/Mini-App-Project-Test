import { PageTitle, Skeleton } from "@/components/ui";

/*
 * Mirrors CourseCard so the list does not reflow when the real cards arrive.
 * Three placeholders is roughly a phone viewport — enough to fill the screen
 * without implying a specific course count.
 */
export default function CoursesLoading() {
  return (
    <div>
      <PageTitle>Explore Courses</PageTitle>

      <div className="space-y-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-card)]"
          >
            <Skeleton className="h-36 w-full rounded-none" />

            <div className="space-y-3 p-4">
              <Skeleton className="h-5 w-2/3" />

              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

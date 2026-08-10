import { Skeleton } from "@/components/ui";

/*
 * Shown while a student page's server render is in flight.
 *
 * Without a loading boundary Next holds the whole navigation until the render
 * settles, so a tap produces no feedback at all until the queries return —
 * which reads as an unresponsive app rather than a loading one.
 *
 * This mirrors the home page (greeting, learning card, connect grid) because
 * that is the DB-backed surface in this group; /community and /resources are
 * static and settle before this is visible.
 */
export default function StudentLoading() {
  return (
    <div className="space-y-4">

      {/* Greeting */}

      <section className="pt-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-1.5 h-6 w-24" />
      </section>

      {/* Learning card
          No heading placeholder: only the recommendation branch renders a
          title now, so reserving a line here would flash a bar that the
          loaded card usually does not have, and shift the layout. */}

      <section>
        <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-card)]">
          <Skeleton className="h-40 w-full rounded-none" />

          <div className="space-y-3 p-4">
            <Skeleton className="h-5 w-3/4" />

            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-12 rounded-[var(--radius-pill)]" />
            </div>

            <Skeleton className="h-1.5 w-full rounded-[var(--radius-pill)]" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </section>

      {/* Connect */}

      <section>
        {/* Heading is now full-size with a subtitle line beneath it. */}
        <Skeleton className="h-5 w-56" />
        <Skeleton className="mb-3 mt-1.5 h-3.5 w-64" />

        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>
      </section>

    </div>
  );
}

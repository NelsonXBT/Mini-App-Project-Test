import { Activity } from "lucide-react";
import { ActivityType } from "@prisma/client";

import { EmptyState } from "@/components/admin/ui";
import { getRecentActivity } from "@/lib/admin/activity";

/*
 * Deletions are shown in the danger tone, creations in the accent tone,
 * everything else stays neutral — so the feed can be scanned by colour
 * without reading every line.
 */
function toneFor(type: ActivityType) {
  if (type.endsWith("_DELETED") || type === "PROGRESS_RESET") {
    return "bg-[var(--danger)]";
  }

  if (type.endsWith("_CREATED") || type === "STUDENT_ENROLLED") {
    return "bg-[var(--primary)]";
  }

  return "bg-[var(--text-subtle)]";
}

function relativeTime(date: Date) {
  const seconds = Math.floor(
    (Date.now() - date.getTime()) / 1000
  );

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export default async function RecentActivity() {
  const activity = await getRecentActivity(8);

  return (
    <section
      className="
        overflow-hidden
        rounded-[var(--radius)]
        border
        border-[var(--border)]
        bg-[var(--card)]
        shadow-[var(--shadow-card)]
      "
    >
      <div className="border-b border-[var(--border)] px-4 py-3.5">
        <h2 className="text-[14px] font-semibold tracking-tight text-[var(--text)]">
          Recent Activity
        </h2>
      </div>

      {activity.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Changes you make to courses, lessons and students will show up here."
          />
        </div>
      ) : (
        <ul className="p-2">
          {activity.map((entry) => (
            <li
              key={entry.id}
              className="flex items-start gap-3 rounded-[var(--radius-control)] px-2 py-2.5"
            >
              <span
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-[var(--radius-pill)] ${toneFor(entry.type)}`}
                aria-hidden="true"
              />

              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-snug text-[var(--text)]">
                  {entry.summary}
                </p>

                <p className="mt-0.5 text-[11px] text-[var(--text-subtle)]">
                  {relativeTime(entry.createdAt)}
                  {entry.actor
                    ? ` · ${entry.actor.name ?? entry.actor.username}`
                    : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

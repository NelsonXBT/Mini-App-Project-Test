import {
  Users,
  PlayCircle,
  FolderTree,
  Clock,
  TrendingUp,
} from "lucide-react";

import { StatusBadge } from "@/components/admin/ui";

type CourseStatisticsProps = {
  title: string;
  studentCount: number;
  lessonCount: number;
  moduleCount: number;
  manualDuration: string | null;
  averageCompletion: number;
  isPublished: boolean;
};

/**
 * Header strip for the course editor. Every figure is derived from the data
 * except duration, which the admin types by hand — lesson durations are
 * optional and would produce a misleading total.
 */
export default function CourseStatistics({
  title,
  studentCount,
  lessonCount,
  moduleCount,
  manualDuration,
  averageCompletion,
  isPublished,
}: CourseStatisticsProps) {
  const stats = [
    { icon: Users, label: "Students", value: studentCount },
    { icon: PlayCircle, label: "Lessons", value: lessonCount },
    { icon: FolderTree, label: "Modules", value: moduleCount },
    { icon: Clock, label: "Duration", value: manualDuration ?? "—" },
    {
      icon: TrendingUp,
      label: "Avg. completion",
      value: `${averageCompletion}%`,
    },
  ];

  return (
    <section
      className="
        rounded-[var(--radius)]
        border
        border-[var(--border)]
        bg-[var(--card)]
        p-5
        shadow-[var(--shadow-panel)]
      "
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-[1.25rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--text)]">
          {title}
        </h1>

        <StatusBadge published={isPublished} />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.label}>
              <dt className="flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.1em] text-[var(--text-subtle)]">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
                {stat.label}
              </dt>

              <dd className="mt-1 text-[1.0625rem] font-semibold tabular-nums tracking-tight text-[var(--text)]">
                {stat.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

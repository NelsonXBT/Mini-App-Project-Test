import type { Metadata } from "next";
import { Suspense } from "react";
import {
  Users,
  BookOpen,
  PlayCircle,
  Activity as ActivityIcon,
} from "lucide-react";

import StatsCard from "@/components/admin/dashboard/StatsCard";
import RecentStudents from "@/components/admin/dashboard/RecentStudents";
import RecentActivity from "@/components/admin/dashboard/RecentActivity";
import { getDashboardStats } from "@/lib/db/admin/stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Dashboard",
};

async function Stats() {
  const stats = await getDashboardStats();

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatsCard
        label="Students"
        value={stats.totalStudents}
        icon={Users}
      />

      <StatsCard
        label="Courses"
        value={stats.totalCourses}
        icon={BookOpen}
      />

      <StatsCard
        label="Lessons"
        value={stats.totalLessons}
        icon={PlayCircle}
      />

      <StatsCard
        label="Active Today"
        value={stats.activeToday}
        icon={ActivityIcon}
        hint="Watched a lesson today"
      />
    </div>
  );
}

function PanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div
      className="
        rounded-[var(--radius)]
        border
        border-[var(--border)]
        bg-[var(--card)]
        p-4
        shadow-[var(--shadow-panel)]
      "
    >
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-9 animate-pulse rounded-[var(--radius-control)] bg-[var(--surface-secondary)]"
          />
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="animate-rise-in space-y-6">
      <div>
        <h1 className="text-[1.375rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--text)]">
          Dashboard
        </h1>

        <p className="mt-1 text-[14px] text-[var(--text-muted)]">
          An overview of your platform.
        </p>
      </div>

      {/* Each panel streams in independently so one slow query
          doesn't hold up the whole page. */}
      <Suspense fallback={<PanelSkeleton rows={2} />}>
        <Stats />
      </Suspense>

      <div className="grid gap-4 lg:grid-cols-2">
        <Suspense fallback={<PanelSkeleton />}>
          <RecentStudents />
        </Suspense>

        <Suspense fallback={<PanelSkeleton />}>
          <RecentActivity />
        </Suspense>
      </div>
    </div>
  );
}

import type { Metadata } from "next";

import NotificationComposer, {
  type NotificationRow,
} from "@/components/admin/notifications/NotificationComposer";
import { getAllNotifications } from "@/lib/db/notifications";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Notifications",
};

export default async function AdminNotificationsPage() {
  const [notifications, courses] = await Promise.all([
    getAllNotifications(),
    prisma.course.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  const rows: NotificationRow[] = notifications.map((item) => ({
    id: item.id,
    title: item.title,
    body: item.body,
    linkUrl: item.linkUrl,
    audience: item.audience,
    courseId: item.courseId,
    courseTitle: item.course?.title ?? null,
    // Dates cross to a client component, so they travel as ISO strings.
    publishedAt: item.publishedAt?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
  }));

  return (
    <div className="animate-rise-in space-y-5">
      <div>
        <h1 className="text-[1.5rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--text)]">
          Notifications
        </h1>

        <p className="mt-1 text-[14px] text-[var(--text-muted)]">
          Post an update to every student, or only to one course.
        </p>
      </div>

      <section
        className="
          max-w-2xl
          rounded-[var(--radius)]
          border
          border-[var(--border)]
          bg-[var(--card)]
          p-5
          shadow-[var(--shadow-panel)]
        "
      >
        <NotificationComposer
          items={rows}
          courses={courses.map((course) => ({
            value: course.id,
            label: course.title,
          }))}
        />
      </section>
    </div>
  );
}

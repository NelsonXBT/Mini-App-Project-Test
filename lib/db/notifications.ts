import { NotificationAudience } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type NotificationView = {
  id: string;
  title: string;
  body: string;
  linkUrl: string | null;
  courseTitle: string | null;
  publishedAt: string;
  isUnread: boolean;
};

const FEED_LIMIT = 20;

/**
 * The notification feed for one student, plus their unread count.
 *
 * Two things are filtered here rather than in the UI:
 *
 *  - Drafts. `publishedAt: null` means an admin is still writing it, so it
 *    must never reach a student payload.
 *  - Audience. A COURSE notification is only for students with an ACTIVE
 *    enrollment in that course. Enrollment is revocable — it tracks Telegram
 *    group membership — so this is evaluated per request rather than fanned
 *    out to recipient rows at publish time. A student who leaves the group
 *    stops seeing that course's notifications, which is the behaviour you
 *    want from a membership-gated platform.
 *
 * Unread is a timestamp comparison against the student's last visit, so the
 * feed needs no per-user rows and marking all read is a single write.
 */
export async function getNotificationsForUser(userId: string) {
  const [user, enrollments] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { notificationsSeenAt: true },
    }),
    prisma.enrollment.findMany({
      where: { userId, status: "ACTIVE" },
      select: { courseId: true },
    }),
  ]);

  if (!user) {
    return { items: [] as NotificationView[], unreadCount: 0 };
  }

  const courseIds = enrollments.map((e) => e.courseId);

  const notifications = await prisma.notification.findMany({
    where: {
      publishedAt: { not: null },
      OR: [
        { audience: NotificationAudience.ALL },
        {
          audience: NotificationAudience.COURSE,
          courseId: { in: courseIds },
        },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: FEED_LIMIT,
    select: {
      id: true,
      title: true,
      body: true,
      linkUrl: true,
      publishedAt: true,
      course: { select: { title: true } },
    },
  });

  const seenAt = user.notificationsSeenAt;

  const items: NotificationView[] = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    linkUrl: n.linkUrl,
    courseTitle: n.course?.title ?? null,
    // Serialised for the client payload; the bell renders it as relative time.
    publishedAt: n.publishedAt!.toISOString(),
    isUnread: !seenAt || n.publishedAt! > seenAt,
  }));

  return {
    items,
    unreadCount: items.filter((item) => item.isUnread).length,
  };
}

/** Stamp "now" as the student's last visit to the feed. */
export async function markNotificationsSeen(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { notificationsSeenAt: new Date() },
  });
}

/** Every notification, drafts included, for the admin list. */
export async function getAllNotifications() {
  return prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      course: { select: { title: true } },
      actor: { select: { name: true, username: true } },
    },
  });
}

export type AdminNotification = Awaited<
  ReturnType<typeof getAllNotifications>
>[number];

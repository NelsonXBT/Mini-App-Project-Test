"use server";

import { revalidatePath } from "next/cache";
import { ActivityType, NotificationAudience } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import type { ActionResult } from "./courses";

export type NotificationInput = {
  title: string;
  body: string;
  audience: string;
  courseId: string;
  linkUrl: string;
  /* Publish immediately, or save as a draft students cannot see. */
  publish: boolean;
};

function parseAudience(value: string): NotificationAudience {
  return value === NotificationAudience.COURSE
    ? NotificationAudience.COURSE
    : NotificationAudience.ALL;
}

function validate(input: NotificationInput): string | null {
  if (!input.title.trim()) return "Title is required.";
  if (!input.body.trim()) return "Message is required.";

  if (
    parseAudience(input.audience) === NotificationAudience.COURSE &&
    !input.courseId
  ) {
    return "Choose a course for this audience.";
  }

  return null;
}

/*
 * Students read notifications through an API route rather than a cached page,
 * so only the admin list needs revalidating.
 */
function revalidateNotifications() {
  revalidatePath("/admin/notifications");
}

function dataFor(input: NotificationInput) {
  const audience = parseAudience(input.audience);

  return {
    title: input.title.trim(),
    body: input.body.trim(),
    audience,
    // Cleared when the audience is everyone, so a stale course id cannot
    // silently narrow a platform-wide notification later.
    courseId:
      audience === NotificationAudience.COURSE ? input.courseId : null,
    linkUrl: input.linkUrl.trim() || null,
  };
}

export async function createNotification(
  input: NotificationInput,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  try {
    const created = await prisma.notification.create({
      data: {
        ...dataFor(input),
        publishedAt: input.publish ? new Date() : null,
        actorId: admin.id,
      },
    });

    await logActivity({
      type: ActivityType.NOTIFICATION_CREATED,
      summary: `Notification ${input.publish ? "published" : "drafted"}: ${created.title}`,
      entityType: "notification",
      entityId: created.id,
      actorId: admin.id,
    });

    revalidateNotifications();

    return { ok: true, id: created.id };
  } catch (error) {
    console.error("createNotification failed:", error);
    return { ok: false, error: "Could not create the notification." };
  }
}

export async function updateNotification(
  notificationId: string,
  input: NotificationInput,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  try {
    const existing = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { publishedAt: true },
    });

    if (!existing) {
      return { ok: false, error: "Notification not found." };
    }

    /*
     * An already-published notification keeps its original publishedAt when
     * edited. Refreshing it would re-mark it unread for every student who had
     * already seen it, since unread state is a timestamp comparison.
     */
    const publishedAt = input.publish
      ? (existing.publishedAt ?? new Date())
      : null;

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { ...dataFor(input), publishedAt },
      select: { title: true },
    });

    await logActivity({
      type: ActivityType.NOTIFICATION_UPDATED,
      summary: `Notification updated: ${updated.title}`,
      entityType: "notification",
      entityId: notificationId,
      actorId: admin.id,
    });

    revalidateNotifications();

    return { ok: true };
  } catch (error) {
    console.error("updateNotification failed:", error);
    return { ok: false, error: "Could not save the notification." };
  }
}

/** Publish a draft, or withdraw a published notification back to draft. */
export async function setNotificationPublished(
  notificationId: string,
  publish: boolean,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  try {
    const existing = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { title: true, publishedAt: true },
    });

    if (!existing) {
      return { ok: false, error: "Notification not found." };
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        publishedAt: publish
          ? (existing.publishedAt ?? new Date())
          : null,
      },
    });

    await logActivity({
      type: ActivityType.NOTIFICATION_UPDATED,
      summary: `Notification ${publish ? "published" : "withdrawn"}: ${existing.title}`,
      entityType: "notification",
      entityId: notificationId,
      actorId: admin.id,
    });

    revalidateNotifications();

    return { ok: true };
  } catch (error) {
    console.error("setNotificationPublished failed:", error);
    return { ok: false, error: "Could not change the status." };
  }
}

export async function deleteNotification(
  notificationId: string,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  try {
    const existing = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { title: true },
    });

    if (!existing) {
      return { ok: false, error: "Notification not found." };
    }

    await prisma.notification.delete({ where: { id: notificationId } });

    await logActivity({
      type: ActivityType.NOTIFICATION_DELETED,
      summary: `Notification deleted: ${existing.title}`,
      entityType: "notification",
      entityId: notificationId,
      actorId: admin.id,
    });

    revalidateNotifications();

    return { ok: true };
  } catch (error) {
    console.error("deleteNotification failed:", error);
    return { ok: false, error: "Could not delete the notification." };
  }
}

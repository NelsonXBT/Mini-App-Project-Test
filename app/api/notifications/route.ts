import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import {
  getNotificationsForUser,
  markNotificationsSeen,
} from "@/lib/db/notifications";

export const dynamic = "force-dynamic";

/*
 * The student notification feed.
 *
 * A route rather than server-rendered props because the bell lives in the
 * layout header on every page: fetching on open keeps the count fresh without
 * making every student page dynamic.
 */
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    // Not an error — a student who has not completed Telegram auth simply has
    // no feed yet, and the bell renders empty rather than broken.
    return NextResponse.json({ items: [], unreadCount: 0 });
  }

  const feed = await getNotificationsForUser(user.id);

  return NextResponse.json(feed);
}

/** Marks the feed read. Called when the student opens the panel. */
export async function POST() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  await markNotificationsSeen(user.id);

  return NextResponse.json({ ok: true });
}

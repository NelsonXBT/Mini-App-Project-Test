import { cookies } from "next/headers";
import { randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_DAYS,
} from "@/lib/admin/constants";

/*
 * Admin sessions.
 *
 * Modelled on lib/auth.ts so the mechanics stay familiar, but backed by
 * AdminSession/AdminUser rather than the Telegram-keyed User table.
 */

export { ADMIN_COOKIE };

export async function getCurrentAdmin() {
  const cookieStore = await cookies();

  const token = cookieStore.get(ADMIN_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.adminSession.findUnique({
    where: {
      token,
    },
    include: {
      admin: true,
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    // Expired sessions are swept on next login rather than here, so this
    // stays a pure read and is safe to call from a Server Component.
    return null;
  }

  return session.admin;
}

/**
 * Every admin server action must call this before touching data.
 * The middleware redirect is a convenience only — it cannot reach the
 * database, so it can never be the real access check.
 */
export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    throw new Error("Not authorised.");
  }

  return admin;
}

export async function createAdminSession(adminId: string) {
  const token = randomBytes(32).toString("hex");

  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() + ADMIN_SESSION_DAYS
  );

  // Clear out anything already expired for this admin so the table
  // doesn't grow without bound.
  await prisma.adminSession.deleteMany({
    where: {
      adminId,
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  await prisma.adminSession.create({
    data: {
      token,
      adminId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();

  const token = cookieStore.get(ADMIN_COOKIE)?.value;

  if (token) {
    await prisma.adminSession.deleteMany({
      where: {
        token,
      },
    });
  }

  cookieStore.delete(ADMIN_COOKIE);
}

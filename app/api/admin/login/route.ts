import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/admin/password";
import { createAdminSession } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username ||
      !password
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials." },
        { status: 400 }
      );
    }

    const admin = await prisma.adminUser.findUnique({
      where: {
        username: username.trim().toLowerCase(),
      },
    });

    /*
     * The same message and status is returned whether the username is
     * unknown or the password is wrong, so this endpoint can't be used to
     * work out which usernames exist.
     */
    const invalid = NextResponse.json(
      { success: false, error: "Invalid credentials." },
      { status: 401 }
    );

    if (!admin) {
      return invalid;
    }

    if (!verifyPassword(password, admin.passwordHash)) {
      return invalid;
    }

    await createAdminSession(admin.id);

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin login failed:", error);

    return NextResponse.json(
      { success: false, error: "Something went wrong." },
      { status: 500 }
    );
  }
}

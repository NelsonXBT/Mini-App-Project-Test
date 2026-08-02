import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyTelegramInitData } from "@/lib/telegram/verify";
import { checkMembership } from "@/lib/telegram/checkMembership";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    console.log("TELEGRAM LOGIN ROUTE HIT");

    const { initData } = await req.json();

    if (!initData) {
      return NextResponse.json(
        { success: false, error: "Missing initData." },
        { status: 400 }
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error("Missing TELEGRAM_BOT_TOKEN");
    }

    const telegramUser = verifyTelegramInitData(initData, botToken);

    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(telegramUser.id) },
      update: {
        username: telegramUser.username ?? null,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name ?? null,
        photoUrl: telegramUser.photo_url ?? null,
      },
      create: {
        telegramId: BigInt(telegramUser.id),
        username: telegramUser.username ?? null,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name ?? null,
        photoUrl: telegramUser.photo_url ?? null,
      },
    });

    const courses = await prisma.course.findMany({
      where: { isPublished: true },
    });

    const unlockedCourses: string[] = [];

    for (const course of courses) {
      if (!course.telegramChatId) continue;

      const member = await checkMembership(
        course.telegramChatId,
        telegramUser.id
      );

      if (!member) continue;

      await prisma.enrollment.upsert({
        where: {
          userId_courseId: { userId: user.id, courseId: course.id },
        },
        update: { status: "ACTIVE", lastVerifiedAt: new Date() },
        create: {
          userId: user.id,
          courseId: course.id,
          status: "ACTIVE",
          lastVerifiedAt: new Date(),
        },
      });

      unlockedCourses.push(course.slug);
    }

    return NextResponse.json({
    success: true,
    unlockedCourses,
    });
  } catch (error) {
    console.error("TELEGRAM LOGIN ERROR", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 401 }
    );
  }
}
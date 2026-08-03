import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyTelegramInitData } from "@/lib/telegram/verify";
import { checkMembership } from "@/lib/telegram/checkMembership";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    console.log("========== TELEGRAM LOGIN ==========");

    const { initData } = await req.json();

    if (!initData) {
      console.log("❌ Missing initData");

      return NextResponse.json(
        {
          success: false,
          error: "Missing initData.",
        },
        { status: 400 }
      );
    }

    console.log("✅ initData received");

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      throw new Error("Missing TELEGRAM_BOT_TOKEN");
    }

    console.log("✅ Bot token found");

    const telegramUser = verifyTelegramInitData(
      initData,
      botToken
    );

    console.log("✅ Telegram verified");
    console.log(telegramUser);

    console.log("Saving user...");

    const user = await prisma.user.upsert({
      where: {
        telegramId: BigInt(telegramUser.id),
      },
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

    console.log("✅ User saved");

    console.log("Loading published courses...");

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
      },
    });

    console.log("Published courses:", courses.length);

    const unlockedCourses: string[] = [];

    for (const course of courses) {
      console.log("--------------------------------");
      console.log("Course:", course.title);
      console.log("Slug:", course.slug);
      console.log("Published:", course.isPublished);
      console.log("Chat ID:", course.telegramChatId);

      if (!course.telegramChatId) {
        console.log("⏭ Skipped (No Telegram Chat ID)");
        continue;
      }

      console.log("Calling checkMembership()...");

      const member = await checkMembership(
        course.telegramChatId,
        telegramUser.id
      );

      console.log("Membership result:", member);

      if (!member) {
        console.log("❌ User not a member");
        continue;
      }

      console.log("Creating enrollment...");

      await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: course.id,
          },
        },
        update: {
          status: "ACTIVE",
          lastVerifiedAt: new Date(),
        },
        create: {
          userId: user.id,
          courseId: course.id,
          status: "ACTIVE",
          lastVerifiedAt: new Date(),
        },
      });

      console.log("✅ Enrollment created");

      unlockedCourses.push(course.slug);
    }

    console.log("Unlocked Courses:");
    console.log(unlockedCourses);

    console.log("========== LOGIN COMPLETE ==========");

    return NextResponse.json({
  success: true,

  hasAccess: unlockedCourses.length > 0,

  unlockedCourses,
});

  } catch (error) {
    console.error("========== LOGIN FAILED ==========");
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 401,
      }
    );
  }
}
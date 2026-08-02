import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { verifyTelegramInitData } from "@/lib/telegram/verify";
import { checkMembership } from "@/lib/telegram/checkMembership";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    console.log("=================================");
    console.log("AUTH ROUTE HIT");
    console.log("=================================");

    const { initData } = await req.json();

    console.log("Received initData:");
    console.log(initData);

    if (!initData) {
      console.log("❌ Missing initData");

      return NextResponse.json(
        {
          success: false,
          error: "Missing initData.",
        },
        {
          status: 400,
        }
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      throw new Error("Missing TELEGRAM_BOT_TOKEN");
    }

    console.log("✅ Verifying Telegram signature...");

    // Verify Telegram signature
    const telegramUser = verifyTelegramInitData(
      initData,
      botToken
    );

    console.log("✅ Telegram verified");
    console.log(telegramUser);

    console.log("Saving user...");

    // Create or update the user
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

    console.log("✅ User synchronized");
    console.log(user);

    console.log("Loading published courses...");

    // Get every published course
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
      },
    });

    console.log(`Found ${courses.length} published courses`);

    const unlockedCourses: string[] = [];

    for (const course of courses) {
      console.log("---------------------------------");
      console.log(`Checking course: ${course.title}`);

      if (!course.telegramChatId) {
        console.log("No Telegram Chat ID. Skipping.");
        continue;
      }

      const member = await checkMembership(
        course.telegramChatId,
        telegramUser.id
      );

      console.log("Membership:", member);

      if (!member) {
        console.log("User is NOT a member.");
        continue;
      }

      console.log("Creating/updating enrollment...");

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

      console.log("Enrollment synchronized.");

      unlockedCourses.push(course.slug);
    }

    console.log("=================================");
    console.log("AUTH COMPLETE");
    console.log(unlockedCourses);
    console.log("=================================");

    return NextResponse.json({
      success: true,
      user,
      unlockedCourses,
    });

  } catch (error) {
    console.error("=================================");
    console.error("AUTH ERROR");
    console.error(error);
    console.error("=================================");

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
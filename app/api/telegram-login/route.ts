import { NextRequest, NextResponse } from "next/server";



import crypto from "crypto";
import { cookies } from "next/headers";
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

    
    console.log("Loading published courses...");

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
      },
    });

    console.log("Published courses:", courses.length);

    const unlockedCourses: {
          id: string;
          slug: string;
        }[] = [];

    /*
     * Gated courses this student is NOT in the chat for.
     *
     * The loop below used to just `continue` past a failed membership check,
     * which meant losing access was never written down: the Enrollment row
     * stayed ACTIVE forever, and nothing else in the app ever set INACTIVE.
     * A student who lost access to one course and gained another then had two
     * ACTIVE rows, and the home card happily offered the one they could no
     * longer open.
     */
    const revokedCourseIds: string[] = [];

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
        revokedCourseIds.push(course.id);
        continue;
      }


      unlockedCourses.push({
        id: course.id,
        slug: course.slug,
      });
          }

/*
 * Write the revocations down before deciding anything else.
 *
 * Only for a student we already know about — looking them up rather than
 * upserting keeps the existing behaviour of never creating a User row for
 * someone who has never had access.
 *
 * Scoped to courses we actually checked, so a manual grant from the admin
 * panel for an ungated course is left alone: those are skipped above and
 * never reach revokedCourseIds.
 */
const existingUser = await prisma.user.findUnique({
  where: {
    telegramId: BigInt(telegramUser.id),
  },
  select: { id: true },
});

if (existingUser && revokedCourseIds.length > 0) {
  const { count } = await prisma.enrollment.updateMany({
    where: {
      userId: existingUser.id,
      courseId: { in: revokedCourseIds },
      status: "ACTIVE",
    },
    data: {
      status: "INACTIVE",
      lastCheckedAt: new Date(),
    },
  });

  console.log(`Deactivated ${count} revoked enrollment(s)`);
}


if (unlockedCourses.length === 0) {
  console.log("❌ No accessible courses");

  return NextResponse.json({
    success: true,
    hasAccess: false,
    unlockedCourses: [],
  });
}


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


    console.log("Creating enrollments...");

for (const course of unlockedCourses) {
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
}

console.log("✅ Enrollments created");



    console.log("Unlocked Courses:");
    console.log(unlockedCourses);

    console.log("========== LOGIN COMPLETE ==========");

    const token = crypto.randomUUID();

const expiresAt = new Date(
  Date.now() + 30 * 24 * 60 * 60 * 1000
);

await prisma.session.create({
  data: {
    token,
    userId: user.id,
    expiresAt,
  },
});

const cookieStore = await cookies();

cookieStore.set("session", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  expires: expiresAt,
  path: "/",
});


    return NextResponse.json({
    success: true,
    hasAccess: unlockedCourses.length > 0,
    unlockedCourses: unlockedCourses.map(
      (course) => course.slug
      ),
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
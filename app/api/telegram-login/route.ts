import { NextRequest, NextResponse } from "next/server";



import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyTelegramInitData } from "@/lib/telegram/verify";
import { checkMembership } from "@/lib/telegram/checkMembership";

export const dynamic = "force-dynamic";

/*
 * Login tracing, development only.
 *
 * This route logged every step at full volume in production, including the
 * decoded Telegram user object — name, username, telegram id, photo URL — on
 * every single app open. That is student PII sitting in the hosting provider's
 * log retention for no operational benefit; the flow is either working or it
 * throws, and the catch block below still reports real failures at all times.
 *
 * Kept rather than deleted because the step-by-step trace is genuinely useful
 * when wiring up a new course channel locally.
 */
const debug = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(...args);
  }
};

export async function POST(req: NextRequest) {
  try {
    debug("========== TELEGRAM LOGIN ==========");

    const { initData } = await req.json();

    if (!initData) {
      debug("❌ Missing initData");

      return NextResponse.json(
        {
          success: false,
          error: "Missing initData.",
        },
        { status: 400 }
      );
    }

    debug("✅ initData received");

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      throw new Error("Missing TELEGRAM_BOT_TOKEN");
    }

    debug("✅ Bot token found");

    const telegramUser = verifyTelegramInitData(
      initData,
      botToken
    );

    debug("✅ Telegram verified");
    debug(telegramUser);

    
    debug("Loading published courses...");

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
      },
    });

    debug("Published courses:", courses.length);

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
      debug("--------------------------------");
      debug("Course:", course.title);
      debug("Slug:", course.slug);
      debug("Published:", course.isPublished);
      debug("Chat ID:", course.telegramChatId);

      if (!course.telegramChatId) {
        debug("⏭ Skipped (No Telegram Chat ID)");
        continue;
      }

      debug("Calling checkMembership()...");

      const member = await checkMembership(
        course.telegramChatId,
        telegramUser.id
      );

      debug("Membership result:", member);

      if (!member) {
        debug("❌ User not a member");
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

  /*
   * Kept at production volume, unlike the tracing above: this is a state
   * change, not a step marker. If a student reports losing a course, this
   * line is the record of when it happened. No PII — a count and an id.
   */
  if (count > 0) {
    console.info(
      `[telegram-login] deactivated ${count} enrollment(s) for user ${existingUser.id}`
    );
  }
}


if (unlockedCourses.length === 0) {
  debug("❌ No accessible courses");

  return NextResponse.json({
    success: true,
    hasAccess: false,
    unlockedCourses: [],
  });
}


debug("Saving user...");

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

    debug("✅ User saved");


    debug("Creating enrollments...");

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

debug("✅ Enrollments created");



    debug("Unlocked Courses:");
    debug(unlockedCourses);

    debug("========== LOGIN COMPLETE ==========");

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

    /*
     * Generic message to the client, real one to the server log above.
     *
     * This used to return error.message verbatim, which handed the caller
     * internals like "Missing TELEGRAM_BOT_TOKEN" and Prisma's connection
     * strings. Nothing consumes the text — TelegramAuth branches on `success`
     * and only logs the body — so the shape is unchanged, and the detail is
     * still there in development.
     */
    return NextResponse.json(
      {
        success: false,
        error:
          process.env.NODE_ENV === "production"
            ? "Authentication failed."
            : error instanceof Error
              ? error.message
              : "Unknown error",
      },
      {
        status: 401,
      }
    );
  }
}
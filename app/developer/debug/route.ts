import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/telegram/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    const userCount = await prisma.user.count();

    const sessionCount =
      await prisma.session.count();

    const courseCount =
      await prisma.course.count();

    const lessonCount =
      await prisma.lesson.count();

    return NextResponse.json({
      authenticated: !!user,

      user,

      database: {
        connected: true,
        users: userCount,
        sessions: sessionCount,
        courses: courseCount,
        lessons: lessonCount,
      },

      environment: {
        nodeEnv: process.env.NODE_ENV,
        botTokenLoaded:
          !!process.env.TELEGRAM_BOT_TOKEN,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Debug failed.",
      },
      {
        status: 500,
      }
    );
  }
}
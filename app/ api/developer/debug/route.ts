import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.count();
    const sessions = await prisma.session.count();
    const courses = await prisma.course.count();
    const lessons = await prisma.lesson.count();

    return NextResponse.json({
      authenticated: false,

      user: null,

      database: {
        connected: true,
        users,
        sessions,
        courses,
        lessons,
      },

      environment: {
        nodeEnv: process.env.NODE_ENV,
        botTokenLoaded: Boolean(
          process.env.TELEGRAM_BOT_TOKEN
        ),
      },
    });

  } catch (error) {
    console.error("DEBUG API ERROR:", error);

    return NextResponse.json(
      {
        error: "Database connection failed",
      },
      {
        status: 500,
      }
    );
  }
}
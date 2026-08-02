import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { verifyTelegramInitData } from "@/lib/telegram/verify";
import { createSession } from "@/lib/telegram/session";

export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json();

    if (!initData) {
      return NextResponse.json(
        { error: "Missing initData" },
        { status: 400 }
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json(
        { error: "Missing bot token." },
        { status: 500 }
      );
    }

    const valid = verifyTelegramInitData(
      initData,
      botToken
    );

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid Telegram data." },
        { status: 401 }
      );
    }

    const params = new URLSearchParams(initData);

    const userString = params.get("user");

    if (!userString) {
      return NextResponse.json(
        { error: "Missing Telegram user." },
        { status: 400 }
      );
    }

    const telegramUser = JSON.parse(userString);

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

    const session = await createSession(user.id);

    const response = NextResponse.json({
      success: true,
      user,
    });

    response.cookies.set({
      name: "ime_session",
      value: session.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: session.expiresAt,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Authentication failed." },
      { status: 500 }
    );
  }
}
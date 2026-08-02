import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json();

    if (!initData) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing initData",
        },
        { status: 400 }
      );
    }

    const params = new URLSearchParams(initData);

    const userString = params.get("user");

    if (!userString) {
      return NextResponse.json(
        {
          success: false,
          error: "Telegram user missing",
        },
        { status: 400 }
      );
    }

    const telegramUser = JSON.parse(userString);

    // ==========================================
    // DEVELOPMENT ONLY
    // Signature verification temporarily skipped
    // ==========================================

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

    return NextResponse.json({
      success: true,
      message: "User synchronized.",
      user,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Server error.",
      },
      { status: 500 }
    );
  }
}
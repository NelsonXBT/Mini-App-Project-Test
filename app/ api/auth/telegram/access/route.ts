import { NextRequest, NextResponse } from "next/server";

import { verifyTelegramInitData } from "@/lib/telegram/verify";

export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json();

    if (!initData) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing initData",
        },
        {
          status: 400,
        }
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing TELEGRAM_BOT_TOKEN",
        },
        {
          status: 500,
        }
      );
    }

    const valid = verifyTelegramInitData(
      initData,
      botToken
    );

    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Telegram data",
        },
        {
          status: 401,
        }
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
        {
          status: 400,
        }
      );
    }

    const telegramUser = JSON.parse(userString);

    return NextResponse.json({
      success: true,
      telegramUser,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Server error",
      },
      {
        status: 500,
      }
    );
  }
}
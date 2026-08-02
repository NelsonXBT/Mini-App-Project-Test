import { NextRequest, NextResponse } from "next/server";

import { verifyTelegramInitData } from "@/lib/telegram/verify";
import { checkMembership } from "@/lib/telegram/checkMembership";

export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json();

    console.log("========== Telegram Login ==========");
    console.log("Has initData:", !!initData);

    if (initData) {
      console.log(initData);
    }

    console.log("====================================");

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

    const isMember = await checkMembership(
      "-1003963602715",
      telegramUser.id
    );

    console.log("========== Membership ==========");
    console.log("Telegram User:", telegramUser.id);
    console.log("Channel:", "-1003963602715");
    console.log("Member:", isMember);
    console.log("================================");

    return NextResponse.json({
      success: true,
      member: isMember,
      telegramUser,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Authentication failed.",
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";

import { cookies } from "next/headers";

import { deleteSession } from "@/lib/telegram/session";

export async function POST() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("ime_session")?.value;

  if (token) {
    await deleteSession(token);
  }

  cookieStore.delete("ime_session");

  return NextResponse.json({
    success: true,
  });
}
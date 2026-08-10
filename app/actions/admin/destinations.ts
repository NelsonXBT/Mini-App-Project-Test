"use server";

import { revalidatePath } from "next/cache";
import { ActivityType, type TelegramDestinationType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { verifyChatReachable } from "@/lib/telegram/sendMessage";

import type { ActionResult } from "./courses";

/**
 * Authorised broadcast destinations.
 *
 * These exist so the composer can post a destination *id* and never a raw chat
 * id — the chat id is read from this table server-side, which is what stops an
 * arbitrary chat being targeted from the browser.
 *
 * IMPORTANT: a destination is NOT a course-access channel. Course gating lives
 * on Course.telegramChatId and is read only by /api/telegram-login. Nothing in
 * this file reads or writes Course, so creating, editing, deactivating, or
 * deleting a destination cannot change who can open a course.
 */

export type DestinationInput = {
  name: string;
  chatId: string;
  type: string;
  isActive: boolean;
};

function parseType(value: string): TelegramDestinationType {
  return value === "GROUP" ? "GROUP" : "CHANNEL";
}

/**
 * Telegram chat ids are numeric — negative for groups and channels, with
 * supergroups conventionally prefixed -100. Enforcing the shape here keeps a
 * pasted @username or invite link out of the table, where it would fail only
 * at send time.
 */
function validChatId(value: string): boolean {
  return /^-?\d{5,20}$/.test(value.trim());
}

function validate(input: DestinationInput): string | null {
  if (!input.name.trim()) return "Give this destination a name.";

  if (!validChatId(input.chatId)) {
    return "Enter a numeric chat ID, e.g. -1001234567890.";
  }

  return null;
}

export async function createDestination(
  input: DestinationInput
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  try {
    const existing = await prisma.telegramDestination.findUnique({
      where: { chatId: input.chatId.trim() },
      select: { id: true },
    });

    if (existing) {
      return { ok: false, error: "That chat ID is already configured." };
    }

    const destination = await prisma.telegramDestination.create({
      data: {
        name: input.name.trim(),
        chatId: input.chatId.trim(),
        type: parseType(input.type),
        isActive: input.isActive,
      },
    });

    await logActivity({
      type: ActivityType.TELEGRAM_DESTINATION_CREATED,
      summary: `Messaging destination added: ${destination.name}`,
      entityType: "telegramDestination",
      entityId: destination.id,
      actorId: admin.id,
    });

    revalidatePath("/admin/messaging/destinations");

    return { ok: true, id: destination.id };
  } catch (error) {
    console.error("createDestination failed:", error);
    return { ok: false, error: "Could not add the destination." };
  }
}

export async function updateDestination(
  id: string,
  input: DestinationInput
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  try {
    const clash = await prisma.telegramDestination.findFirst({
      where: { chatId: input.chatId.trim(), NOT: { id } },
      select: { id: true },
    });

    if (clash) {
      return { ok: false, error: "Another destination already uses that chat ID." };
    }

    const destination = await prisma.telegramDestination.update({
      where: { id },
      data: {
        name: input.name.trim(),
        chatId: input.chatId.trim(),
        type: parseType(input.type),
        isActive: input.isActive,
      },
    });

    await logActivity({
      type: ActivityType.TELEGRAM_DESTINATION_UPDATED,
      summary: `Messaging destination updated: ${destination.name}`,
      entityType: "telegramDestination",
      entityId: id,
      actorId: admin.id,
    });

    revalidatePath("/admin/messaging/destinations");

    return { ok: true };
  } catch (error) {
    console.error("updateDestination failed:", error);
    return { ok: false, error: "Could not save the destination." };
  }
}

export async function deleteDestination(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();

  try {
    const existing = await prisma.telegramDestination.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!existing) return { ok: false, error: "Destination not found." };

    /*
     * Past broadcasts reference this row. The relation is SetNull, so history
     * survives the deletion with its destination name already denormalised
     * into the message record.
     */
    await prisma.telegramDestination.delete({ where: { id } });

    await logActivity({
      type: ActivityType.TELEGRAM_DESTINATION_DELETED,
      summary: `Messaging destination removed: ${existing.name}`,
      entityType: "telegramDestination",
      entityId: id,
      actorId: admin.id,
    });

    revalidatePath("/admin/messaging/destinations");

    return { ok: true };
  } catch (error) {
    console.error("deleteDestination failed:", error);
    return { ok: false, error: "Could not remove the destination." };
  }
}

/**
 * Ask Telegram whether the bot can actually post here.
 *
 * Read-only on both sides: getChat changes nothing on Telegram, and nothing is
 * written locally. Lets an admin catch a wrong chat id or a missing admin
 * right while configuring rather than through a failed broadcast.
 */
export async function testDestination(
  id: string
): Promise<{ ok: true; title: string | null } | { ok: false; error: string }> {
  await requireAdmin();

  const destination = await prisma.telegramDestination.findUnique({
    where: { id },
    select: { chatId: true },
  });

  if (!destination) return { ok: false, error: "Destination not found." };

  return verifyChatReachable(destination.chatId);
}

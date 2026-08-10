import {
  buildReplyMarkup,
  composeText,
  type BroadcastButton,
} from "./compose";

/**
 * The Telegram Bot API client for outgoing broadcasts.
 *
 * Deliberately separate from lib/telegram/checkMembership.ts. That file is
 * part of the course-access system and is called on every app open; nothing
 * here touches it, imports it, or duplicates it. Access eligibility is decided
 * there and only there — this file only ever *delivers* messages.
 *
 * Server-only by construction: every caller is a Server Action or Route
 * Handler, and the token is read from process.env at call time. It is never
 * passed to a client component, and no NEXT_PUBLIC_ variable is involved.
 */

export type SendResult =
  | { ok: true }
  /*
   * Delivery failed for a reason specific to this recipient — blocked the bot,
   * deactivated account, never started a chat. Retrying will not help, and it
   * says nothing about whether the next recipient will succeed.
   */
  | { ok: false; retryable: false; error: string }
  /*
   * Delivery failed for a reason that may clear — a network blip, a 5xx, or a
   * flood limit we have already waited out.
   */
  | { ok: false; retryable: true; error: string };

type TelegramResponse = {
  ok?: boolean;
  description?: string;
  error_code?: number;
  parameters?: { retry_after?: number };
};

function botToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN");
  }

  return token;
}

/**
 * Telegram's own guidance is ~30 messages/second to different users. Sitting
 * meaningfully under it costs a broadcast very little wall-clock and keeps the
 * bot well clear of the flood limiter — which matters beyond messaging,
 * because the same bot token serves getChatMember during student logins. A
 * broadcast that got the bot rate-limited would degrade course access, so the
 * margin here is deliberately generous.
 */
export const SEND_INTERVAL_MS = 50;

/*
 * How many times to wait out a 429 for a single recipient before giving up on
 * them. Telegram tells us exactly how long to wait via retry_after; past a
 * couple of attempts we are fighting a sustained limit rather than riding out
 * a burst.
 */
const MAX_FLOOD_RETRIES = 2;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * One Telegram API call, with flood-limit handling.
 *
 * A 429 carries `retry_after` in seconds. Honouring it is what keeps a large
 * broadcast from digging itself deeper: firing again immediately extends the
 * limit rather than clearing it.
 */
async function callTelegram(
  method: string,
  payload: Record<string, unknown>
): Promise<SendResult> {
  const url = `https://api.telegram.org/bot${botToken()}/${method}`;

  for (let attempt = 0; attempt <= MAX_FLOOD_RETRIES; attempt++) {
    let data: TelegramResponse;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        /*
         * Bounded so one unresponsive request cannot stall an entire
         * broadcast. Generous enough for sendPhoto, where Telegram fetches
         * the image from our storage before replying.
         */
        signal: AbortSignal.timeout(20000),
      });

      data = (await res.json()) as TelegramResponse;
    } catch (error) {
      return {
        ok: false,
        retryable: true,
        error:
          error instanceof Error
            ? `Request failed: ${error.message}`
            : "Request failed",
      };
    }

    if (data.ok) return { ok: true };

    const description = data.description ?? "Unknown Telegram error";

    // Flood limit. Wait exactly as long as Telegram asks, then try again.
    if (data.error_code === 429) {
      const retryAfter = data.parameters?.retry_after ?? 1;

      if (attempt < MAX_FLOOD_RETRIES) {
        await sleep(retryAfter * 1000 + 250);
        continue;
      }

      return {
        ok: false,
        retryable: true,
        error: `Rate limited (retry after ${retryAfter}s)`,
      };
    }

    /*
     * 403 is the common, expected, permanent case: the student blocked the
     * bot, or never opened a chat with it. It is a delivery failure and
     * nothing more — it must never be read as a signal about course access,
     * and nothing here writes to Enrollment.
     *
     * 400 covers "chat not found" and malformed payloads: equally permanent
     * for this recipient.
     */
    if (data.error_code === 403 || data.error_code === 400) {
      return { ok: false, retryable: false, error: description };
    }

    // 5xx and anything unrecognised — Telegram's side, may clear.
    return { ok: false, retryable: true, error: description };
  }

  return { ok: false, retryable: true, error: "Exhausted retries" };
}

export type OutgoingMessage = {
  title?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  buttons?: BroadcastButton[] | null;
};

/**
 * Deliver one composed message to one chat.
 *
 * Chooses the method Telegram requires for the content: a photo message puts
 * the text in `caption`, a text message in `text`. Both are optional-friendly
 * — an image with no text sends as a bare photo, and text with no image sends
 * as an ordinary message.
 */
export async function sendBroadcastMessage(
  chatId: string,
  message: OutgoingMessage
): Promise<SendResult> {
  const text = composeText(message.title, message.body);
  const replyMarkup = buildReplyMarkup(message.buttons);
  const imageUrl = message.imageUrl?.trim();

  if (imageUrl) {
    return callTelegram("sendPhoto", {
      chat_id: chatId,
      photo: imageUrl,
      // Omitted entirely when empty: Telegram rejects caption:"" alongside
      // parse_mode on some client versions, and a media-only message is valid.
      ...(text ? { caption: text, parse_mode: "HTML" } : {}),
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    });
  }

  if (!text) {
    return {
      ok: false,
      retryable: false,
      error: "Nothing to send: the message has no image, title, or body.",
    };
  }

  return callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    // Broadcasts frequently carry a link button; the link preview card would
    // duplicate it and push the message off-screen.
    link_preview_options: { is_disabled: true },
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}

/**
 * Confirm the bot can post to a chat before a broadcast commits to it.
 *
 * Used by the destinations screen so an admin discovers a bad chat id or a
 * missing admin right while configuring, rather than through a failed
 * broadcast. Read-only: getChat changes nothing on Telegram's side, and
 * nothing in the application database.
 */
export async function verifyChatReachable(
  chatId: string
): Promise<{ ok: true; title: string | null } | { ok: false; error: string }> {
  const url = `https://api.telegram.org/bot${botToken()}/getChat`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId }),
      signal: AbortSignal.timeout(10000),
    });

    const data = (await res.json()) as TelegramResponse & {
      result?: { title?: string };
    };

    if (!data.ok) {
      return { ok: false, error: data.description ?? "Chat not reachable." };
    }

    return { ok: true, title: data.result?.title ?? null };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not reach Telegram.",
    };
  }
}

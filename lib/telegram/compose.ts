/**
 * Turning an admin's composer input into something the Telegram Bot API will
 * accept.
 *
 * Deliberately separate from sendMessage.ts: everything here is pure, so the
 * message a broadcast will produce can be built and asserted without a bot
 * token, a network call, or a database. The preview in the admin UI is the
 * same shape this produces.
 *
 * Nothing in this file reads or writes application data.
 */

/**
 * A button as the composer stores it.
 *
 * `action` rather than a bare URL because "open the Mini App" is a fixed
 * destination the admin should never have to type — see MINI_APP_URL below.
 */
export type BroadcastButton = {
  text: string;
  action: "url" | "mini_app";
  /* Only meaningful when action is "url". */
  url?: string;
};

/**
 * The Mini App's direct-launch link.
 *
 * Hard-coded rather than configurable: it is the bot's own deep link, fixed by
 * BotFather, and an admin typing it by hand is exactly the error this removes.
 * A plain https://t.me/… URL button is used rather than Telegram's `web_app`
 * button type, because `web_app` is only valid in private chats — it is
 * rejected outright when a broadcast goes to a channel or group, which is
 * precisely where most broadcasts go.
 */
export const MINI_APP_URL = "https://t.me/NadiAcademybot?startapp";

/*
 * Telegram's hard limits. Exceeding either is a 400 from the API, so the
 * composer stops the admin at the boundary rather than letting a broadcast
 * fail halfway through.
 */
export const TELEGRAM_TEXT_LIMIT = 4096;
export const TELEGRAM_CAPTION_LIMIT = 1024;

/**
 * Escape for Telegram's HTML parse mode.
 *
 * HTML rather than Markdown deliberately: MarkdownV2 requires escaping 18
 * different characters, and a single unescaped one rejects the whole message.
 * HTML needs exactly three, so an admin writing "Q&A <today>" cannot break
 * parsing — which is the "malformed input cannot break Telegram parsing"
 * requirement.
 *
 * & must be replaced first, or it would double-escape the entities the later
 * replacements introduce.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Compose title and body into a single Telegram-ready string.
 *
 * Telegram has no title field for ordinary messages, so the title becomes bold
 * first line followed by a blank line. Both halves are optional and any
 * combination is valid, including neither — an image-only message is legal and
 * returns "".
 */
export function composeText(
  title: string | null | undefined,
  body: string | null | undefined
): string {
  const cleanTitle = (title ?? "").trim();
  const cleanBody = (body ?? "").trim();

  const parts: string[] = [];

  if (cleanTitle) {
    parts.push(`<b>${escapeHtml(cleanTitle)}</b>`);
  }

  if (cleanBody) {
    parts.push(escapeHtml(cleanBody));
  }

  // Blank line between title and body; nothing at all when only one is set.
  return parts.join("\n\n");
}

/**
 * Whether a URL is safe to hand to Telegram as a button target.
 *
 * https only, plus tg:// for Telegram's own deep links. This is what stops
 * javascript:, data:, and file: URLs reaching an inline button — the button
 * text is admin-supplied but the URL is what actually gets actioned, so it is
 * validated server-side regardless of what the composer allowed.
 */
export function isSafeButtonUrl(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed) return false;

  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    return false;
  }

  if (url.protocol === "https:") return true;

  // Telegram deep links (tg://resolve?…) are legitimate button targets.
  if (url.protocol === "tg:") return true;

  return false;
}

export type ValidationResult =
  | { ok: true; buttons: BroadcastButton[] }
  | { ok: false; error: string };

/**
 * Validate and normalise the composer's buttons.
 *
 * Returns the cleaned list rather than mutating, so the caller stores exactly
 * what was validated. An empty list is valid and means "no reply_markup" —
 * buttons are optional and must never be forced.
 */
export function validateButtons(
  buttons: BroadcastButton[] | null | undefined
): ValidationResult {
  if (!buttons || buttons.length === 0) {
    return { ok: true, buttons: [] };
  }

  /*
   * Telegram accepts more than this, but a broadcast with a dozen buttons is
   * a mistake rather than an intent, and the cap keeps the inline keyboard
   * readable on a phone.
   */
  if (buttons.length > 6) {
    return { ok: false, error: "A message can have at most 6 buttons." };
  }

  const cleaned: BroadcastButton[] = [];

  for (const button of buttons) {
    const text = (button.text ?? "").trim();

    if (!text) {
      return { ok: false, error: "Every button needs a label." };
    }

    if (text.length > 64) {
      return {
        ok: false,
        error: `Button label "${text.slice(0, 20)}…" is too long (max 64 characters).`,
      };
    }

    if (button.action === "mini_app") {
      // The URL is supplied by us, not the admin, so there is nothing to
      // validate — and nothing to store either.
      cleaned.push({ text, action: "mini_app" });
      continue;
    }

    const url = (button.url ?? "").trim();

    if (!url) {
      return { ok: false, error: `Button "${text}" needs a URL.` };
    }

    if (!isSafeButtonUrl(url)) {
      return {
        ok: false,
        error: `Button "${text}" needs a valid https:// URL.`,
      };
    }

    cleaned.push({ text, action: "url", url });
  }

  return { ok: true, buttons: cleaned };
}

/**
 * Telegram's inline_keyboard structure, or undefined when there are no
 * buttons.
 *
 * undefined rather than an empty array on purpose: `reply_markup` with an
 * empty keyboard still renders as an empty control strip in some clients, so
 * the key is omitted from the request entirely.
 *
 * One button per row. Stacked is more legible on the narrow phone viewport
 * every Mini App user is on, and side-by-side buttons truncate their labels.
 */
export function buildReplyMarkup(
  buttons: BroadcastButton[] | null | undefined
):
  | { inline_keyboard: { text: string; url: string }[][] }
  | undefined {
  if (!buttons || buttons.length === 0) return undefined;

  const rows = buttons.map((button) => [
    {
      text: button.text,
      url:
        button.action === "mini_app"
          ? MINI_APP_URL
          : (button.url ?? ""),
    },
  ]);

  return { inline_keyboard: rows };
}

/**
 * Is there anything here worth sending?
 *
 * Telegram requires *something*: a photo, or text. Everything being optional
 * individually does not make an entirely empty message valid, and this is the
 * check that catches it before any recipient is resolved.
 *
 * Buttons alone do not qualify — sendMessage rejects empty text even with a
 * reply_markup attached, so "image + button" is valid but "button only" is not.
 */
export function hasSendableContent(input: {
  imageUrl?: string | null;
  title?: string | null;
  body?: string | null;
}): boolean {
  if (input.imageUrl && input.imageUrl.trim()) return true;

  return composeText(input.title, input.body).length > 0;
}

/**
 * Whether the composed text fits the limit that will apply to it.
 *
 * The limit depends on how it will be sent: a caption under a photo is capped
 * at 1024 characters, a standalone message at 4096. The composer needs to know
 * which applies *before* sending, because attaching an image to an otherwise
 * valid message can push it over.
 */
export function textLimitFor(hasImage: boolean): number {
  return hasImage ? TELEGRAM_CAPTION_LIMIT : TELEGRAM_TEXT_LIMIT;
}

export function validateComposedLength(input: {
  imageUrl?: string | null;
  title?: string | null;
  body?: string | null;
}): { ok: true } | { ok: false; error: string } {
  const hasImage = Boolean(input.imageUrl && input.imageUrl.trim());
  const text = composeText(input.title, input.body);
  const limit = textLimitFor(hasImage);

  if (text.length > limit) {
    return {
      ok: false,
      error: hasImage
        ? `With an image attached, Telegram limits the message to ${limit} characters (currently ${text.length}). Shorten it, or send the image separately.`
        : `Telegram limits a message to ${limit} characters (currently ${text.length}).`,
    };
  }

  return { ok: true };
}

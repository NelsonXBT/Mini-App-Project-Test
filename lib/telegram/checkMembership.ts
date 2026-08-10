/**
 * The result of asking Telegram whether a student is in a course's channel.
 *
 * Three states, not two. The old boolean collapsed "Telegram says they are
 * not in the channel" together with "we could not find out" — a rate limit, a
 * network blip, a wrong chat_id, or the bot losing its admin rights all came
 * back as `false`, identical to leaving the channel.
 *
 * That was survivable while a failed check only skipped a course. It is not
 * survivable now that a failed check can deactivate an enrolment and end a
 * session: one Telegram outage would have revoked every student at once.
 *
 * - "member"     — in the channel; grant access.
 * - "not-member"  — Telegram answered, and they are not in it; revoke.
 * - "unknown"     — we could not get an answer; change nothing.
 */
export type MembershipResult = "member" | "not-member" | "unknown";

/*
 * Statuses Telegram returns for someone who is genuinely in the chat.
 */
const MEMBER_STATUSES = ["member", "administrator", "creator"];

/*
 * Statuses that are a definitive "no" from Telegram, as opposed to an error.
 *
 * "restricted" sits here to preserve the exact behaviour this function had
 * before the three-state rewrite: the old allow-list was
 * ["member", "administrator", "creator"], so a restricted user already failed
 * the check and had their enrolment deactivated. Telegram does send an
 * `is_member` flag alongside "restricted" that distinguishes a restricted
 * member still in the channel from one who has left, so this could be
 * loosened later — but that would be a deliberate policy change, not a
 * side effect of this fix.
 *
 * Anything not listed in either array — a status Telegram adds later, or one
 * we do not recognise — falls through to "unknown" rather than silently
 * revoking access.
 */
const NON_MEMBER_STATUSES = ["left", "kicked", "restricted"];

export async function checkMembership(
  chatId: string,
  userId: number | bigint
): Promise<MembershipResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN");
  }

  const url =
    `https://api.telegram.org/bot${token}/getChatMember` +
    `?chat_id=${chatId}&user_id=${userId}`;

  let data: {
    ok?: boolean;
    description?: string;
    result?: { status?: string };
  };

  try {
    /*
     * Timed out rather than left to hang. Every app open blocks on this call
     * once per gated course, so an unresponsive Telegram would otherwise hold
     * the student on the splash screen indefinitely.
     */
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    });

    data = await res.json();
  } catch (error) {
    console.warn(
      `[membership] request failed for chat ${chatId}:`,
      error instanceof Error ? error.message : error
    );

    return "unknown";
  }

  if (!data.ok) {
    /*
     * An API-level error. "user not found" means Telegram has no record of
     * this account in a context the bot can see, which for our purposes is a
     * real "not a member". Everything else — "chat not found", "member list
     * is inaccessible" — is a fault in our own configuration and must never
     * be read as a student having left.
     */
    const description = (data.description ?? "").toLowerCase();

    if (description.includes("user not found")) {
      return "not-member";
    }

    console.error(
      `[membership] check failed for chat ${chatId}: ${data.description ?? "unknown error"}`
    );

    return "unknown";
  }

  const status = data.result?.status;

  if (status && MEMBER_STATUSES.includes(status)) {
    return "member";
  }

  if (status && NON_MEMBER_STATUSES.includes(status)) {
    return "not-member";
  }

  console.warn(
    `[membership] unrecognised status "${status}" for chat ${chatId}`
  );

  return "unknown";
}

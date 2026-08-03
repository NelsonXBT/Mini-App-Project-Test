export async function checkMembership(
  chatId: string,
  userId: number | bigint
) {
  console.log("========== CHECK MEMBERSHIP ==========");
  console.log("Chat ID:", chatId);
  console.log("User ID:", userId);

  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN");
  }

  const url =
    `https://api.telegram.org/bot${token}/getChatMember` +
    `?chat_id=${chatId}&user_id=${userId}`;

  console.log("Calling:");
  console.log(url.replace(token, "***BOT_TOKEN***"));

  const res = await fetch(url);

  console.log("HTTP Status:", res.status);

  const data = await res.json();

  console.log("Telegram Response:");
  console.log(JSON.stringify(data, null, 2));

  if (!data.ok) {
    console.log("Membership Check: FAILED");
    return false;
  }

  const status = data.result.status;

  console.log("Member Status:", status);

  const allowed = [
    "member",
    "administrator",
    "creator",
  ].includes(status);

  console.log("Allowed:", allowed);
  console.log("==============================");

  return allowed;
}
export async function checkMembership(
  chatId: string,
  userId: number | bigint
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN");
  }

  console.log("========== CHECK MEMBERSHIP ==========");
  console.log("Chat ID:", chatId);
  console.log("User ID:", userId);

  const url =
    `https://api.telegram.org/bot${token}/getChatMember` +
    `?chat_id=${chatId}&user_id=${userId}`;

  console.log("Calling Telegram...");

  const res = await fetch(url);

  const data = await res.json();

  console.log("Telegram Response:");
  console.log(JSON.stringify(data, null, 2));

  if (!data.ok) {
    console.log("Telegram returned NOT OK");
    return false;
  }

  console.log("Member Status:", data.result.status);

  const allowed = [
    "member",
    "administrator",
    "creator",
  ].includes(data.result.status);

  console.log("Allowed:", allowed);
  console.log("======================================");

  return allowed;
}
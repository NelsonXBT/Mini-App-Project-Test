export async function checkMembership(
  chatId: string,
  userId: number | bigint
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN");
  }

  const url =
    `https://api.telegram.org/bot${token}/getChatMember` +
    `?chat_id=${chatId}&user_id=${userId}`;

  const res = await fetch(url);

  const data = await res.json();

  console.log("Telegram Membership Response:");
  console.log(JSON.stringify(data, null, 2));

  if (!data.ok) {
    return false;
  }

  const status = data.result.status;

  return [
    "member",
    "administrator",
    "creator",
  ].includes(status);
}
import crypto from "crypto";

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

export function verifyTelegramInitData(
  initData: string,
  botToken: string
): TelegramUser {
  const params = new URLSearchParams(initData);

  const hash = params.get("hash");

  if (!hash) {
    throw new Error("Missing Telegram hash.");
  }

  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const valid = crypto.timingSafeEqual(
    Buffer.from(calculatedHash),
    Buffer.from(hash)
  );

  if (!valid) {
    throw new Error("Invalid Telegram signature.");
  }

  const authDate = Number(params.get("auth_date"));

  if (!authDate) {
    throw new Error("Missing auth_date.");
  }

  const MAX_AGE_SECONDS = 60 * 60;

  if (Date.now() / 1000 - authDate > MAX_AGE_SECONDS) {
    throw new Error("Telegram initData expired.");
  }

  const userString = params.get("user");

  if (!userString) {
    throw new Error("Missing Telegram user.");
  }

  return JSON.parse(userString);
}
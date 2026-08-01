import crypto from "crypto";

/**
 * Verifies Telegram Mini App initData.
 */
export function verifyTelegramInitData(
  initData: string,
  botToken: string
): boolean {
  const params = new URLSearchParams(initData);

  const hash = params.get("hash");

  if (!hash) {
    return false;
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

  return crypto.timingSafeEqual(
  Buffer.from(calculatedHash),
  Buffer.from(hash)
);
}
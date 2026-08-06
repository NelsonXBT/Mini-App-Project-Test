import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "crypto";

/*
 * Password hashing on Node's built-in scrypt.
 *
 * scrypt is deliberately memory-hard, which is what you want for password
 * storage, and it ships with Node — so this adds no dependency. Stored format
 * is "salt:derivedKey", both hex.
 */

const KEY_LENGTH = 64;
const SALT_BYTES = 16;

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_BYTES).toString("hex");

  const derivedKey = scryptSync(
    password,
    salt,
    KEY_LENGTH
  ).toString("hex");

  return `${salt}:${derivedKey}`;
}

export function verifyPassword(
  password: string,
  stored: string
): boolean {
  const [salt, key] = stored.split(":");

  if (!salt || !key) {
    return false;
  }

  const derivedKey = scryptSync(
    password,
    salt,
    KEY_LENGTH
  );

  const storedKey = Buffer.from(key, "hex");

  // timingSafeEqual throws if the lengths differ, so guard first.
  if (storedKey.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, storedKey);
}

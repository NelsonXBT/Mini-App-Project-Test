/*
 * Bootstrap the first admin account.
 *
 *   npx tsx scripts/create-admin.ts <username> <password> [name]
 *
 * Re-running with an existing username updates that account's password,
 * which doubles as a password reset.
 */

import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../lib/admin/password";

const prisma = new PrismaClient();

async function main() {
  const [, , usernameArg, password, name] = process.argv;

  if (!usernameArg || !password) {
    console.error(
      "Usage: npx tsx scripts/create-admin.ts <username> <password> [name]"
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const username = usernameArg.trim().toLowerCase();
  const passwordHash = hashPassword(password);

  const admin = await prisma.adminUser.upsert({
    where: { username },
    update: { passwordHash, name: name ?? undefined },
    create: { username, passwordHash, name: name ?? null },
  });

  console.log(`✅ Admin ready: ${admin.username} (${admin.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

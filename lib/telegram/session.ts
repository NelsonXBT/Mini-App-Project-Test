import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const SESSION_DURATION =
  1000 * 60 * 60 * 24 * 30; // 30 days

export async function createSession(
  userId: string
) {
  const token = crypto.randomUUID();

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION
  );

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
  };
}

export async function getSession(
  token: string
) {
  const session =
    await prisma.session.findUnique({
      where: {
        token,
      },
      include: {
        user: true,
      },
    });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });

    return null;
  }

  return session;
}

export async function deleteSession(
  token: string
) {
  await prisma.session.deleteMany({
    where: {
      token,
    },
  });
}
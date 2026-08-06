/*
 * Dependency-free so the edge middleware can import it without pulling in
 * Prisma or next/headers, neither of which run on the edge runtime.
 */

export const ADMIN_COOKIE = "admin_session";

export const ADMIN_SESSION_DAYS = 7;

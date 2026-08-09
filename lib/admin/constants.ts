/*
 * Dependency-free so the edge middleware can import it without pulling in
 * Prisma or next/headers, neither of which run on the edge runtime.
 */

export const ADMIN_COOKIE = "admin_session";

export const ADMIN_SESSION_DAYS = 7;

/*
 * The brand as shipped. Lives here rather than in lib/db/admin/settings.ts so
 * client components can compare against it without importing Prisma.
 *
 * Settings lets an admin rename the platform, so surfaces that draw the NADI
 * wordmark check against this to tell whether the stored name is still the
 * brand (draw the mark) or has been customised (draw their text instead).
 */
export const BRAND_NAME = "Nadi Academy";

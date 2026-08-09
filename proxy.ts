import { NextRequest, NextResponse } from "next/server";

import { ADMIN_COOKIE } from "@/lib/admin/constants";

/**
 * Convenience redirect only.
 *
 * Proxy runs on the edge and cannot reach Prisma, so it can do no more than
 * check that a session cookie is present. Real verification happens in
 * app/(admin)/admin/(protected)/layout.tsx and again at the top of every
 * admin server action via requireAdmin() — a forged cookie gets past this and
 * no further.
 *
 * Named `proxy` in `proxy.ts` because Next.js 16 renamed the middleware file
 * convention; the behaviour is identical, and the matcher below still scopes
 * it to the admin tree so no student route pays for it.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const hasCookie = Boolean(req.cookies.get(ADMIN_COOKIE)?.value);

  if (!hasCookie && !isLoginPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);

    return NextResponse.redirect(url);
  }

  if (hasCookie && isLoginPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

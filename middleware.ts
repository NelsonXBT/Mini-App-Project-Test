import { NextRequest, NextResponse } from "next/server";

import { ADMIN_COOKIE } from "@/lib/admin/constants";

/**
 * Convenience redirect only.
 *
 * Middleware runs on the edge and cannot reach Prisma, so it can do no more
 * than check that a session cookie is present. Real verification happens in
 * app/(admin)/admin/layout.tsx and again at the top of every admin server
 * action — a forged cookie gets past this and no further.
 */
export function middleware(req: NextRequest) {
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

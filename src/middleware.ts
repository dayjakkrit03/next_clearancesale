// src/middleware.ts (ถ้ามี)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const isAdmin = req.cookies.get("admin_session")?.value === "1";
  if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };


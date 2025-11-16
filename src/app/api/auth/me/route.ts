// src/app/api/auth/me/route.ts

import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  return NextResponse.json(
    {
      ok: true,
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name ?? null,
      },
    },
    { status: 200 }
  );
}

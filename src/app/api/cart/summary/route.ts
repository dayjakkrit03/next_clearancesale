// src/app/api/cart/summary/route.ts

import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import { getCartSummary } from "@/services/cart/cart.service";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value || null;

  let customerId: number | null = null;

  if (token) {
    const decoded = verifyAuthToken(token);
    if (decoded?.sub) customerId = Number(decoded.sub);
  }

  const summary = await getCartSummary(customerId);

  return NextResponse.json({ summary }, { status: 200 });
}

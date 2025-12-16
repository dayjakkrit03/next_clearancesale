// /api/checkout/ping/route.ts

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    ok: true,
    step: "PING_OK",
    serverTime: new Date().toISOString(),
  });
}

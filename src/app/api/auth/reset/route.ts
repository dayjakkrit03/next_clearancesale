// src/app/api/auth/reset/route.ts
import { NextRequest, NextResponse } from "next/server";
import { setShopSessionTZ } from "@/lib/db";
import { verifyResetToken, resetUserPassword } from "@/services/auth.service";

export async function POST(req: NextRequest) {
  await setShopSessionTZ();
  const { email, token, password } = await req.json();

  if (!email || !token || !password) {
    return NextResponse.json(
      { ok: false, message: "ข้อมูลไม่ครบ" },
      { status: 400 }
    );
  }

  const tokenRow = await verifyResetToken(email, token);
  if (!tokenRow) {
    return NextResponse.json(
      { ok: false, message: "Token ไม่ถูกต้องหรือหมดอายุ" },
      { status: 400 }
    );
  }

  await resetUserPassword(email, password);

  return NextResponse.json({ ok: true });
}


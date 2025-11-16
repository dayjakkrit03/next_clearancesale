// src/app/api/auth/register/request-code/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requestRegisterCode } from "@/services/register.service";
import { sendRegisterVerificationEmail } from "@/services/mail.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email: string | undefined = body?.email;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { ok: false, error: "INVALID_EMAIL" },
        { status: 400 }
      );
    }

    const result = await requestRegisterCode(email);

    if (!result.ok) {
      if (result.error === "EMAIL_IN_USE") {
        return NextResponse.json(
          { ok: false, error: "EMAIL_IN_USE" },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { ok: false, error: "UNKNOWN_ERROR" },
        { status: 500 }
      );
    }

    // ส่งอีเมลรหัสยืนยันผ่าน SMTP
    const sent = await sendRegisterVerificationEmail(email, result.code);

    if (!sent) {
      return NextResponse.json(
        { ok: false, error: "EMAIL_SEND_FAILED" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[register/request-code] error:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}

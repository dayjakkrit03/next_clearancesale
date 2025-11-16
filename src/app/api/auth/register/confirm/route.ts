// src/app/api/auth/register/confirm/route.ts

import { NextRequest, NextResponse } from "next/server";
import { registerWithCode } from "@/services/register.service";
import { createAuthToken, attachAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name: string | undefined = body?.name;
    const email: string | undefined = body?.email;
    const password: string | undefined = body?.password;
    const confirmPassword: string | undefined = body?.confirmPassword;
    const code: string | undefined = body?.code;

    // Validation เบื้องต้น
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { ok: false, error: "INVALID_EMAIL" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { ok: false, error: "WEAK_PASSWORD" },
        { status: 400 }
      );
    }

    if (!confirmPassword || password !== confirmPassword) {
      return NextResponse.json(
        { ok: false, error: "PASSWORD_MISMATCH" },
        { status: 400 }
      );
    }

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { ok: false, error: "INVALID_CODE" },
        { status: 400 }
      );
    }

    const result = await registerWithCode({
      name,
      email,
      password,
      code,
    });

    if (!result.ok) {
      if (result.error === "INVALID_CODE") {
        return NextResponse.json(
          { ok: false, error: "INVALID_CODE" },
          { status: 200 }
        );
      }
      if (result.error === "EXPIRED_CODE") {
        return NextResponse.json(
          { ok: false, error: "EXPIRED_CODE" },
          { status: 200 }
        );
      }
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

    const customer = result.customer;
    const token = createAuthToken({
      sub: String(customer.id),
      email: customer.email,
      name: customer.name ?? undefined,
    });

    const res = NextResponse.json({ ok: true }, { status: 200 });
    attachAuthCookie(res, token);

    return res;
  } catch (err) {
    console.error("[register/confirm] error:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}

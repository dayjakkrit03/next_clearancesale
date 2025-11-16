// src/services/register.service.ts

import { prismaShop } from "@/lib/db";
import bcrypt from "bcryptjs";

const REGISTER_CODE_EXPIRES_MIN = 15;

/** สร้างโค้ด 6 หลักแบบง่าย ๆ */
function generate6DigitCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** ขอรหัสยืนยันสมัครสมาชิก (ตรวจอีเมลซ้ำ + สร้างโค้ดเก็บใน DB) */
export async function requestRegisterCode(emailRaw: string) {
  const email = emailRaw.trim().toLowerCase();

  // เช็คว่าอีเมลนี้สมัครไว้แล้วหรือยัง (member_status = true)
  const existing = await prismaShop.customers.findFirst({
    where: {
      email,
      member_status: true,
    },
  });

  if (existing) {
    return { ok: false as const, error: "EMAIL_IN_USE" as const };
  }

  // ลบโค้ดเก่า ๆ ของอีเมลนี้ก่อน
  await prismaShop.registration_verification_codes.deleteMany({
    where: { email },
  });

  const code = generate6DigitCode();
  const expiresAt = new Date(Date.now() + REGISTER_CODE_EXPIRES_MIN * 60 * 1000);

  await prismaShop.registration_verification_codes.create({
    data: {
      email,
      code,
      expires_at: expiresAt,
    },
  });

  return { ok: true as const, code };
}

type RegisterWithCodeInput = {
  name?: string;
  email: string;
  password: string;
  code: string;
};

/** ตรวจสอบโค้ด + สร้าง user ใหม่ใน customers */
export async function registerWithCode(input: RegisterWithCodeInput) {
  const email = input.email.trim().toLowerCase();
  const code = input.code.trim();

  // หาโค้ดล่าสุดที่ยังไม่ใช้
  const item = await prismaShop.registration_verification_codes.findFirst({
    where: { email, code, used: false },
    orderBy: { created_at: "desc" },
  });

  if (!item) {
    return { ok: false as const, error: "INVALID_CODE" as const };
  }

  const now = new Date();
  if (item.expires_at < now) {
    // หมดอายุ → mark used กัน reuse แล้วบอก error
    await prismaShop.registration_verification_codes.update({
      where: { id: item.id },
      data: { used: true },
    });
    return { ok: false as const, error: "EXPIRED_CODE" as const };
  }

  // กันกรณีเพิ่งมีคนสมัครใช้ email นี้พอดี
  const existing = await prismaShop.customers.findFirst({
    where: { email, member_status: true },
  });

  if (existing) {
    return { ok: false as const, error: "EMAIL_IN_USE" as const };
  }

  const hashed = await bcrypt.hash(input.password, 10);
  const nowDate = new Date();

  // ✅ ตาม requirement ใหม่: customer_id = null, username = email
  const customer = await prismaShop.customers.create({
    data: {
      customer_id: null,
      username: email,
      email,
      password: hashed,
      name: input.name?.trim() || null,
      member_status: true,
      created_at: nowDate,
      updated_at: nowDate,
    },
  });

  // mark โค้ดว่าใช้แล้ว
  await prismaShop.registration_verification_codes.update({
    where: { id: item.id },
    data: { used: true },
  });

  return { ok: true as const, customer };
}

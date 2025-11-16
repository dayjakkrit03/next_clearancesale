// v.1.1.2 ===============================================
// src/services/auth.service.ts

import { prismaShop } from "@/lib/db";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

/**
 * สร้าง reset token ใหม่
 */
export async function generateResetToken(email: string) {
  const token = randomBytes(32).toString("hex");

  await prismaShop.password_reset_tokens.deleteMany({ where: { email } });

  await prismaShop.password_reset_tokens.create({
    data: {
      email,
      token,
      expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 นาที
    },
  });

  return token;
}

/**
 * ตรวจสอบ token + หมดอายุหรือยัง
 */
export async function verifyResetToken(email: string, token: string) {
  const item = await prismaShop.password_reset_tokens.findFirst({
    where: { email, token },
    orderBy: { created_at: "desc" },
  });

  if (!item) return null;

  const now = new Date();
  if (item.expires_at < now) {
    // ลบ token หมดอายุ
    await prismaShop.password_reset_tokens.delete({
      where: { id: item.id },
    });
    return null;
  }

  return item;
}

/**
 * เปลี่ยนรหัสผ่าน
 */
export async function resetUserPassword(email: string, newPassword: string) {
  const hashed = await bcrypt.hash(newPassword, 10);

  await prismaShop.customers.update({
    where: { email },
    data: { password: hashed },
  });

  // ลบ token เก่าทั้งหมด
  await prismaShop.password_reset_tokens.deleteMany({ where: { email } });

  return true;
}

// v.1.1.2 ===============================================


// // src/services/auth.service.ts

// import { prismaShop } from "@/lib/db";
// import { randomBytes } from "crypto";
// import bcrypt from "bcryptjs";

// /**
//  * สร้าง reset token ใหม่ (ผูกกับ email)
//  * - ลบ token เก่าของ email นี้ทิ้ง
//  * - สร้าง token ใหม่ (เก็บ plain-text ใน column `token`)
//  */
// export async function generateResetToken(email: string) {
//   const token = randomBytes(32).toString("hex");

//   // ลบ token เก่าของ email นี้
//   await prismaShop.password_reset_tokens.deleteMany({
//     where: { email },
//   });

//   // สร้าง token ใหม่
//   await prismaShop.password_reset_tokens.create({
//     data: {
//       email,
//       token,
//       created_at: new Date(),
//       expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 นาที
//     },
//   });

//   return token; // ใช้ตัวนี้ไปใส่ในลิงก์ในอีเมล
// }

// /**
//  * ตรวจสอบว่า token ถูกต้อง + ยังไม่หมดอายุ
//  */
// export async function verifyResetToken(email: string, token: string) {
//   const item = await prismaShop.password_reset_tokens.findFirst({
//     where: {
//       email,
//       token,
//     },
//   });

//   if (!item) return null;
//   if (item.expires_at < new Date()) return null;

//   return item;
// }

// /**
//  * เปลี่ยนรหัสผ่านของผู้ใช้ (อิงจาก email)
//  */
// export async function resetUserPassword(email: string, newPassword: string) {
//   const hashed = await bcrypt.hash(newPassword, 10);

//   await prismaShop.customers.update({
//     where: { email },
//     data: { password: hashed },
//   });

//   // ลบ token ทั้งหมดของ email นี้ทิ้ง
//   await prismaShop.password_reset_tokens.deleteMany({
//     where: { email },
//   });

//   return true;
// }

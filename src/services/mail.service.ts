// v.1.1.2 ===============================================
// src/services/mail.service.ts

import { Resend } from "resend";
import nodemailer from "nodemailer";
import { absoluteUrl } from "@/lib/base-url";

/** ส่งอีเมลตั้งรหัสผ่านใหม่ (Reset Password) */
export async function sendResetPasswordEmail(to: string, token: string) {
  // สร้างลิงก์แบบ absolute URL
  const url = await absoluteUrl(`/reset-password?token=${token}&email=${encodeURIComponent(to)}`);

  const html = `
    <div style="font-family: sans-serif; max-width: 450px;">
      <h2>ตั้งรหัสผ่านใหม่</h2>
      <p>คุณได้รับอีเมลนี้เนื่องจากมีการร้องขอให้ตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ</p>
      <p>กดลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
      <p><a href="${url}" style="color: #0056b3;">${url}</a></p>
      <p>ลิงก์นี้จะหมดอายุภายใน <b>15 นาที</b></p>
      <p>หากคุณไม่ได้เป็นผู้ร้องขอ สามารถละเว้นอีเมลนี้ได้เลย</p>
      <br/>
      <p>— Interlink Shop</p>
    </div>
  `;

  /** -----------------------------
   * 1) ถ้ามี RESEND_API_KEY → ใช้ Resend
   * ------------------------------ */
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Interlink Shop <onboarding@resend.dev>",
        to,
        subject: "ตั้งรหัสผ่านใหม่ | Interlink Shop",
        html,
      });

      return true;
    } catch (err) {
      console.error("[mail] Resend error → fallback to SMTP", err);
      // → ตกไปใช้ SMTP ด้านล่าง
    }
  }

  /** -----------------------------
   * 2) ไม่มี Resend หรือ Resend error → ใช้ SMTP
   * ------------------------------ */
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Interlink Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject: "ตั้งรหัสผ่านใหม่ | Interlink Shop",
      html,
    });

    return true;
  } catch (err) {
    console.error("[mail] SMTP error:", err);
    return false;
  }
}

// v.1.1.2 ===============================================

// // src/services/mail.service.ts

// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY || "");

// /**
//  * ส่งอีเมลสำหรับตั้งรหัสผ่านใหม่
//  * ใช้ Resend เป็นหลัก
//  */
// export async function sendResetPasswordEmail(to: string, token: string) {
//   // ใช้ base URL จาก env (เช่น https://shop.interlink.co.th)
//   const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

//   const url = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(
//     to
//   )}`;

//   try {
//     await resend.emails.send({
//       from: "Interlink Shop <no-reply@interlink.co.th>",
//       to,
//       subject: "ตั้งรหัสผ่านใหม่ | Interlink Shop",
//       html: `
//         <p>สวัสดีค่ะ</p>
//         <p>คุณได้รับอีเมลนี้เนื่องจากมีการร้องขอให้ตั้งรหัสผ่านใหม่สำหรับบัญชี Interlink Shop</p>
//         <p>กรุณากดลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
//         <p><a href="${url}">${url}</a></p>
//         <p>ลิงก์นี้จะหมดอายุใน 15 นาที</p>
//         <p>หากคุณไม่ได้เป็นผู้ร้องขอ สามารถละเว้นอีเมลฉบับนี้ได้เลย</p>
//       `,
//     });

//     return true;
//   } catch (error) {
//     console.error("sendResetPasswordEmail error:", error);
//     return false;
//   }
// }

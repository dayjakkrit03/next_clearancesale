// v.1.1.6 ================================================
// src/services/mail.service.ts

import { Resend } from "resend";
import nodemailer from "nodemailer";
import { absoluteUrl } from "@/lib/base-url";

/* ================================
 *  Helpers
 * ================================ */

/** ชื่อผู้ส่ง (ดึงจาก .env ถ้ามี) */
function getFromName() {
  return process.env.EMAIL_FROM_NAME || "Interlink Shop";
}

/** from เต็ม ๆ สำหรับ SMTP / Nodemailer */
function getFromAddress() {
  const email = process.env.EMAIL_USER || "no-reply@example.com";
  const name = getFromName();
  return `"${name}" <${email}>`;
}

/** สร้าง SMTP transporter จาก .env (host/port/user/pass) */
function createSmtpTransport() {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    console.error(
      "[mail] EMAIL_HOST / EMAIL_PORT / EMAIL_USER / EMAIL_PASS ยังไม่ครบใน .env"
    );
  }

  const port = parseInt(EMAIL_PORT || "587", 10);

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port,
    secure: port === 465, // SSL=465, TLS/STARTTLS=587
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/* ==========================================
 *  Email Template Helper (UI แบบมืออาชีพ)
 * ========================================== */

function wrapEmailTemplate(title: string, contentHtml: string) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 0;">
    <tr>
      <td align="center">

        <table width="520" cellpadding="0" cellspacing="0" style="background:white;border-radius:10px;overflow:hidden;font-family:Arial, sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#0B3D91;padding:22px;text-align:center;color:white;">
              <h2 style="margin:0;font-size:22px;">${title}</h2>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:28px;font-size:15px;color:#333;line-height:1.6;">
              ${contentHtml}
              <p style="margin-top:28px;">— ${getFromName()}</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
  `;
}

/* ================================
 *  1) Forgot Password Email
 * ================================ */

export async function sendResetPasswordEmail(to: string, token: string) {
  const url = await absoluteUrl(
    `/reset-password?token=${token}&email=${encodeURIComponent(to)}`
  );

  const content = `
    <p>คุณได้รับอีเมลนี้เนื่องจากมีการร้องขอให้ตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณบน <b>Interlink Shop</b></p>

    <p style="margin-top:16px;">กรุณาคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>

    <div style="text-align:center;margin:30px 0;">
      <a href="${url}"
        style="
          background:#0056b3;
          padding:12px 22px;
          color:white;
          text-decoration:none;
          border-radius:6px;
          font-weight:bold;
          font-size:15px;
          display:inline-block;
        ">
        ตั้งรหัสผ่านใหม่
      </a>
    </div>

    <p style="font-size:13px;color:#666;margin-top:20px;">
      หากกดปุ่มไม่ได้ ให้ใช้ลิงก์นี้:<br/>
      <a href="${url}" style="color:#0056b3;">${url}</a>
    </p>

    <p style="color:#666;">ลิงก์นี้มีอายุ <b>15 นาที</b></p>
  `;

  const html = wrapEmailTemplate("🔐 ตั้งรหัสผ่านใหม่", content);

  /* ลองส่งด้วย Resend ก่อน (หากมี API KEY) */
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: `${getFromName()} <onboarding@resend.dev>`,
        to,
        subject: "ตั้งรหัสผ่านใหม่ | Interlink Shop",
        html,
      });

      return true;
    } catch (err) {
      console.error("[mail] Resend error → fallback to SMTP", err);
    }
  }

  /* ส่งผ่าน SMTP */
  try {
    const transporter = createSmtpTransport();
    await transporter.sendMail({
      from: getFromAddress(),
      to,
      subject: "ตั้งรหัสผ่านใหม่ | Interlink Shop",
      html,
    });

    return true;
  } catch (err) {
    console.error("[mail] SMTP error (reset):", err);
    return false;
  }
}

/* ================================
 *  2) Register Verification Email
 * ================================ */

export async function sendRegisterVerificationEmail(to: string, code: string) {
  const content = `
    <p>รหัสยืนยันสำหรับการสมัครสมาชิก Interlink Shop คือ:</p>

    <div style="text-align:center;margin:26px 0;">
      <div style="
        font-size:34px;
        font-weight:bold;
        letter-spacing:10px;
        color:#0B3D91;
      ">
        ${code}
      </div>
    </div>

    <p style="font-size:14px;color:#666;">
      รหัสนี้มีอายุ <b>15 นาที</b> หลังจากเวลาที่ส่ง
    </p>
  `;

  const html = wrapEmailTemplate("🔵 ยืนยันการสมัครสมาชิก", content);

  try {
    const transporter = createSmtpTransport();
    await transporter.sendMail({
      from: getFromAddress(),
      to,
      subject: "รหัสยืนยันสมัครสมาชิก | Interlink Shop",
      html,
    });

    return true;
  } catch (err) {
    console.error("[mail] SMTP error (register verify):", err);
    return false;
  }
}

// v.1.1.6 ================================================

// v.1.1.5 ================================================
// // src/services/mail.service.ts

// import { Resend } from "resend";
// import nodemailer from "nodemailer";
// import { absoluteUrl } from "@/lib/base-url";

// /* ================================
//  *  Helpers
//  * ================================ */

// /** ชื่อผู้ส่ง (ดึงจาก .env ถ้ามี) */
// function getFromName() {
//   return process.env.EMAIL_FROM_NAME || "Interlink Shop";
// }

// /** from เต็ม ๆ สำหรับ SMTP / Nodemailer */
// function getFromAddress() {
//   const email = process.env.EMAIL_USER || "no-reply@example.com";
//   const name = getFromName();
//   return `"${name}" <${email}>`;
// }

// /** สร้าง SMTP transporter จาก .env (host/port/user/pass) */
// function createSmtpTransport() {
//   const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

//   if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
//     console.error(
//       "[mail] EMAIL_HOST / EMAIL_PORT / EMAIL_USER / EMAIL_PASS ยังไม่ครบใน .env"
//     );
//   }

//   const port = parseInt(EMAIL_PORT || "587", 10);

//   return nodemailer.createTransport({
//     host: EMAIL_HOST,
//     port,
//     secure: port === 465, // 465 = SSL, นอกนั้นให้เป็น TLS/STARTTLS
//     auth: {
//       user: EMAIL_USER,
//       pass: EMAIL_PASS,
//     },
//     tls: {
//       // เผื่อบาง hosting ใช้ cert แปลก ๆ
//       rejectUnauthorized: false,
//     },
//   });
// }

// /* ================================
//  *  1) Forgot Password Email
//  * ================================ */

// /** 🔵 ส่งอีเมลตั้งรหัสผ่านใหม่ (Reset Password) */
// export async function sendResetPasswordEmail(to: string, token: string) {
//   // ลิงก์รีเซ็ตรหัสผ่าน (absolute URL)
//   const url = await absoluteUrl(
//     `/reset-password?token=${token}&email=${encodeURIComponent(to)}`
//   );

//   const html = `
//     <div style="font-family: sans-serif; max-width: 450px;">
//       <h2>ตั้งรหัสผ่านใหม่</h2>
//       <p>คุณได้รับอีเมลนี้เนื่องจากมีการร้องขอให้ตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณบน <b>Interlink Shop</b></p>
//       <p>กดลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
//       <p><a href="${url}" style="color: #0056b3;">${url}</a></p>
//       <p>ลิงก์นี้จะหมดอายุภายใน <b>15 นาที</b></p>
//       <p>หากคุณไม่ได้เป็นผู้ร้องขอ สามารถละเว้นอีเมลนี้ได้เลย</p>
//       <br/>
//       <p>— ${getFromName()}</p>
//     </div>
//   `;

//   /* 1) ถ้ามี RESEND_API_KEY → ลองใช้ Resend ก่อน */
//   if (process.env.RESEND_API_KEY) {
//     try {
//       const resend = new Resend(process.env.RESEND_API_KEY);
//       await resend.emails.send({
//         from: `${getFromName()} <onboarding@resend.dev>`,
//         to,
//         subject: "ตั้งรหัสผ่านใหม่ | Interlink Shop",
//         html,
//       });

//       return true;
//     } catch (err) {
//       console.error("[mail] Resend error → fallback to SMTP", err);
//       // ตกไปใช้ SMTP ด้านล่าง
//     }
//   }

//   /* 2) ถ้าไม่มี Resend หรือส่งด้วย Resend ล้มเหลว → ใช้ SMTP */
//   try {
//     const transporter = createSmtpTransport();

//     await transporter.sendMail({
//       from: getFromAddress(),
//       to,
//       subject: "ตั้งรหัสผ่านใหม่ | Interlink Shop",
//       html,
//     });

//     return true;
//   } catch (err) {
//     console.error("[mail] SMTP error (reset):", err);
//     return false;
//   }
// }

// /* ================================
//  *  2) Register Verification Email
//  * ================================ */

// /** 🟢 ส่งอีเมลรหัสยืนยันสมัครสมาชิก (สมัครสมาชิกใหม่) */
// export async function sendRegisterVerificationEmail(to: string, code: string) {
//   const html = `
//     <div style="font-family: sans-serif; max-width: 450px;">
//       <h2>ยืนยันการสมัครสมาชิก Interlink Shop</h2>
//       <p>รหัสยืนยันสำหรับการสมัครสมาชิกของคุณคือ:</p>
//       <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
//       <p>รหัสนี้มีอายุ <b>15 นาที</b> หลังจากเวลาที่ส่ง</p>
//       <p>หากคุณไม่ได้เป็นผู้ร้องขอสมัครสมาชิก สามารถละเว้นอีเมลนี้ได้เลย</p>
//       <br/>
//       <p>— ${getFromName()}</p>
//     </div>
//   `;

//   try {
//     const transporter = createSmtpTransport();

//     await transporter.sendMail({
//       from: getFromAddress(),
//       to,
//       subject: "รหัสยืนยันสมัครสมาชิก | Interlink Shop",
//       html,
//     });

//     return true;
//   } catch (err) {
//     console.error("[mail] SMTP error (register verify):", err);
//     return false;
//   }
// }

// v.1.1.5 ================================================

// v.1.1.4 ================================================
// // src/services/mail.service.ts

// import { Resend } from "resend";
// import nodemailer from "nodemailer";
// import { absoluteUrl } from "@/lib/base-url";

// /** helper ใช้ config SMTP แบบเดียวกับโปรเจกต์ที่คุณเทสผ่าน */
// function createSmtpTransport() {
//   if (
//     !process.env.EMAIL_HOST ||
//     !process.env.EMAIL_PORT ||
//     !process.env.EMAIL_USER ||
//     !process.env.EMAIL_PASS
//   ) {
//     console.error(
//       "[mail] EMAIL_HOST / EMAIL_PORT / EMAIL_USER / EMAIL_PASS ยังไม่ครบใน .env"
//     );
//   }

//   const port = parseInt(process.env.EMAIL_PORT || "587", 10);

//   return nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port,
//     secure: port === 465, // true สำหรับ 465 (SSL) / false สำหรับ 587 (TLS)
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//     tls: {
//       // บาง hosting ต้องปิดเช็ค cert ไม่งั้น CONN/ESOCKET ได้
//       rejectUnauthorized: false,
//     },
//   });
// }

// /** 🔵 ส่งอีเมลตั้งรหัสผ่านใหม่ (Reset Password) */
// export async function sendResetPasswordEmail(to: string, token: string) {
//   // สร้างลิงก์แบบ absolute URL
//   const url = await absoluteUrl(
//     `/reset-password?token=${token}&email=${encodeURIComponent(to)}`
//   );

//   const html = `
//     <div style="font-family: sans-serif; max-width: 450px;">
//       <h2>ตั้งรหัสผ่านใหม่</h2>
//       <p>คุณได้รับอีเมลนี้เนื่องจากมีการร้องขอให้ตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ</p>
//       <p>กดลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
//       <p><a href="${url}" style="color: #0056b3;">${url}</a></p>
//       <p>ลิงก์นี้จะหมดอายุภายใน <b>15 นาที</b></p>
//       <p>หากคุณไม่ได้เป็นผู้ร้องขอ สามารถละเว้นอีเมลนี้ได้เลย</p>
//       <br/>
//       <p>— Interlink Shop</p>
//     </div>
//   `;

//   /** 1) ถ้ามี RESEND_API_KEY → ใช้ Resend ก่อน */
//   if (process.env.RESEND_API_KEY) {
//     try {
//       const resend = new Resend(process.env.RESEND_API_KEY);
//       await resend.emails.send({
//         from: "Interlink Shop <onboarding@resend.dev>",
//         to,
//         subject: "ตั้งรหัสผ่านใหม่ | Interlink Shop",
//         html,
//       });

//       return true;
//     } catch (err) {
//       console.error("[mail] Resend error → fallback to SMTP", err);
//       // → ตกไปใช้ SMTP ด้านล่าง
//     }
//   }

//   /** 2) ไม่มี Resend หรือ Resend error → ใช้ SMTP (config เดียวกับโปรเจกต์ที่เทสผ่าน) */
//   try {
//     const transporter = createSmtpTransport();

//     await transporter.sendMail({
//       from: `"Interlink Shop" <${process.env.EMAIL_USER}>`,
//       to,
//       subject: "ตั้งรหัสผ่านใหม่ | Interlink Shop",
//       html,
//     });

//     return true;
//   } catch (err) {
//     console.error("[mail] SMTP error (reset):", err);
//     return false;
//   }
// }

// /** 🟢 ส่งอีเมลรหัสยืนยันสมัครสมาชิก (ใช้ SMTP เท่านั้น ไม่ใช้ Resend) */
// export async function sendRegisterVerificationEmail(to: string, code: string) {
//   const html = `
//     <div style="font-family: sans-serif; max-width: 450px;">
//       <h2>ยืนยันการสมัครสมาชิก Interlink Shop</h2>
//       <p>รหัสยืนยันสำหรับการสมัครสมาชิกของคุณคือ:</p>
//       <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
//       <p>รหัสนี้มีอายุ <b>15 นาที</b> หลังจากเวลาที่ส่ง</p>
//       <p>หากคุณไม่ได้เป็นผู้ร้องขอสมัครสมาชิก สามารถละเว้นอีเมลนี้ได้เลย</p>
//       <br/>
//       <p>— Interlink Shop</p>
//     </div>
//   `;

//   try {
//     const transporter = createSmtpTransport();

//     await transporter.sendMail({
//       from: `"Interlink Shop" <${process.env.EMAIL_USER}>`,
//       to,
//       subject: "รหัสยืนยันสมัครสมาชิก | Interlink Shop",
//       html,
//     });

//     return true;
//   } catch (err) {
//     console.error("[mail] SMTP error (register verify):", err);
//     return false;
//   }
// }

// v.1.1.4 ================================================

// v.1.1.3 ===============================================
// // src/services/mail.service.ts

// import { Resend } from "resend";
// import nodemailer from "nodemailer";
// import { absoluteUrl } from "@/lib/base-url";

// /** ส่งอีเมลตั้งรหัสผ่านใหม่ (Reset Password) */
// export async function sendResetPasswordEmail(to: string, token: string) {
//   // สร้างลิงก์แบบ absolute URL
//   const url = await absoluteUrl(
//     `/reset-password?token=${token}&email=${encodeURIComponent(to)}`
//   );

//   const html = `
//     <div style="font-family: sans-serif; max-width: 450px;">
//       <h2>ตั้งรหัสผ่านใหม่</h2>
//       <p>คุณได้รับอีเมลนี้เนื่องจากมีการร้องขอให้ตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ</p>
//       <p>กดลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
//       <p><a href="${url}" style="color: #0056b3;">${url}</a></p>
//       <p>ลิงก์นี้จะหมดอายุภายใน <b>15 นาที</b></p>
//       <p>หากคุณไม่ได้เป็นผู้ร้องขอ สามารถละเว้นอีเมลนี้ได้เลย</p>
//       <br/>
//       <p>— Interlink Shop</p>
//     </div>
//   `;

//   /** -----------------------------
//    * 1) ถ้ามี RESEND_API_KEY → ใช้ Resend
//    * ------------------------------ */
//   if (process.env.RESEND_API_KEY) {
//     try {
//       const resend = new Resend(process.env.RESEND_API_KEY);
//       await resend.emails.send({
//         from: "Interlink Shop <onboarding@resend.dev>",
//         to,
//         subject: "ตั้งรหัสผ่านใหม่ | Interlink Shop",
//         html,
//       });

//       return true;
//     } catch (err) {
//       console.error("[mail] Resend error → fallback to SMTP", err);
//       // → ตกไปใช้ SMTP ด้านล่าง
//     }
//   }

//   /** -----------------------------
//    * 2) ไม่มี Resend หรือ Resend error → ใช้ SMTP
//    * ------------------------------ */
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: Number(process.env.EMAIL_PORT ?? 587),
//       secure: false,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: `"Interlink Shop" <${process.env.EMAIL_USER}>`,
//       to,
//       subject: "ตั้งรหัสผ่านใหม่ | Interlink Shop",
//       html,
//     });

//     return true;
//   } catch (err) {
//     console.error("[mail] SMTP error:", err);
//     return false;
//   }
// }

// /** ✅ ส่งอีเมลรหัสยืนยันสมัครสมาชิก (ใช้ SMTP เท่านั้น ไม่ใช้ Resend) */
// export async function sendRegisterVerificationEmail(to: string, code: string) {
//   const html = `
//     <div style="font-family: sans-serif; max-width: 450px;">
//       <h2>ยืนยันการสมัครสมาชิก Interlink Shop</h2>
//       <p>รหัสยืนยันสำหรับการสมัครสมาชิกของคุณคือ:</p>
//       <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
//       <p>รหัสนี้มีอายุ <b>15 นาที</b> หลังจากเวลาที่ส่ง</p>
//       <p>หากคุณไม่ได้เป็นผู้ร้องขอสมัครสมาชิก สามารถละเว้นอีเมลนี้ได้เลย</p>
//       <br/>
//       <p>— Interlink Shop</p>
//     </div>
//   `;

//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: Number(process.env.EMAIL_PORT ?? 587),
//       secure: false,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: `"Interlink Shop" <${process.env.EMAIL_USER}>`,
//       to,
//       subject: "รหัสยืนยันสมัครสมาชิก | Interlink Shop",
//       html,
//     });

//     return true;
//   } catch (err) {
//     console.error("[mail] SMTP error (register verify):", err);
//     return false;
//   }
// }

// v.1.1.3 ===============================================

// v.1.1.2 ===============================================
// // src/services/mail.service.ts

// import { Resend } from "resend";
// import nodemailer from "nodemailer";
// import { absoluteUrl } from "@/lib/base-url";

// /** ส่งอีเมลตั้งรหัสผ่านใหม่ (Reset Password) */
// export async function sendResetPasswordEmail(to: string, token: string) {
//   // สร้างลิงก์แบบ absolute URL
//   const url = await absoluteUrl(`/reset-password?token=${token}&email=${encodeURIComponent(to)}`);

//   const html = `
//     <div style="font-family: sans-serif; max-width: 450px;">
//       <h2>ตั้งรหัสผ่านใหม่</h2>
//       <p>คุณได้รับอีเมลนี้เนื่องจากมีการร้องขอให้ตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ</p>
//       <p>กดลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
//       <p><a href="${url}" style="color: #0056b3;">${url}</a></p>
//       <p>ลิงก์นี้จะหมดอายุภายใน <b>15 นาที</b></p>
//       <p>หากคุณไม่ได้เป็นผู้ร้องขอ สามารถละเว้นอีเมลนี้ได้เลย</p>
//       <br/>
//       <p>— Interlink Shop</p>
//     </div>
//   `;

//   /** -----------------------------
//    * 1) ถ้ามี RESEND_API_KEY → ใช้ Resend
//    * ------------------------------ */
//   if (process.env.RESEND_API_KEY) {
//     try {
//       const resend = new Resend(process.env.RESEND_API_KEY);
//       await resend.emails.send({
//         from: "Interlink Shop <onboarding@resend.dev>",
//         to,
//         subject: "ตั้งรหัสผ่านใหม่ | Interlink Shop",
//         html,
//       });

//       return true;
//     } catch (err) {
//       console.error("[mail] Resend error → fallback to SMTP", err);
//       // → ตกไปใช้ SMTP ด้านล่าง
//     }
//   }

//   /** -----------------------------
//    * 2) ไม่มี Resend หรือ Resend error → ใช้ SMTP
//    * ------------------------------ */
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: Number(process.env.EMAIL_PORT ?? 587),
//       secure: false,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: `"Interlink Shop" <${process.env.EMAIL_USER}>`,
//       to,
//       subject: "ตั้งรหัสผ่านใหม่ | Interlink Shop",
//       html,
//     });

//     return true;
//   } catch (err) {
//     console.error("[mail] SMTP error:", err);
//     return false;
//   }
// }

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

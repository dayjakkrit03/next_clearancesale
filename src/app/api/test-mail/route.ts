// v.1.1.3 ===============================================
// app/api/test-mail/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  try {
    // ตรวจสอบ Environment Variables
    const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM_NAME } =
      process.env;

    if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
      console.error("❌ SMTP environment variables are missing.");
      return NextResponse.json(
        {
          success: false,
          message:
            "Email SMTP configuration is incomplete. Please check EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS.",
        },
        { status: 400 }
      );
    }

    // === Create SMTP Transporter ===
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT),
      secure: parseInt(EMAIL_PORT) === 465, // SSL = 465
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // สำหรับบางโฮสที่ใช้ self-signed cert
      },
    });

    // === Sender Format ===
    // จะทำให้ผู้รับเห็นเป็น: clearancesale.interlink.co.th
    // แต่เบื้องหลังจะเป็น: "clearancesale.interlink.co.th" <info@interlinkhaijai.org>
    const fromField = EMAIL_FROM_NAME
      ? `"${EMAIL_FROM_NAME}" <${EMAIL_USER}>`
      : EMAIL_USER;

    // === Email Content ===
    const testMailOptions = {
      from: fromField,
      to: "jakkrit.day03@gmail.com",
      subject: "Test Email from Next.js App",
      html: `
        <p>This is a test email sent from your Next.js application using Nodemailer.</p>
        <p>Your SMTP settings appear to be working!</p>
        <br/>
        <p>Regards,<br/>Link Cable Team</p>
      `,
    };

    // === Send Email ===
    const info = await transporter.sendMail(testMailOptions);

    console.log(
      `📨 Email Sent Successfully → MessageID: ${info.messageId} | From: ${fromField}`
    );

    return NextResponse.json(
      {
        success: true,
        message: `Test email successfully sent to jakkrit.day03@gmail.com.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error sending test email:", error);

    const errorMessage =
      error instanceof Error
        ? `Failed to send test email: ${error.message}`
        : `Unknown error occurred: ${String(error)}`;

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
// v.1.1.3 ===============================================

// v.1.1.2 ===============================================
// // app/api/test-mail/route.ts
// import { NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';

// export async function GET() { // ✅ เปลี่ยนชื่อ parameter จาก req เป็น _req
//     try {
//         // ตรวจสอบ Environment Variables
//         if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//             console.error('❌ Environment variables for email sender are not fully configured.');
//             return NextResponse.json(
//                 { success: false, message: 'Email sender configuration is incomplete. Please check EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS in your .env.local file.' },
//                 { status: 400 }
//             );
//         }

//         // สร้าง transporter ด้วยการตั้งค่า SMTP ของโฮสติ้ง
//         const transporter = nodemailer.createTransport({
//             host: process.env.EMAIL_HOST,
//             port: parseInt(process.env.EMAIL_PORT as string),
//             secure: parseInt(process.env.EMAIL_PORT as string) === 465, // true สำหรับ port 465 (SSL), false สำหรับ port อื่นๆ (TLS)
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS,
//             },
//             tls: {
//                 rejectUnauthorized: false // May be necessary for some hosts using self-signed or unrecognized certificates
//             }
//         });

//         // กำหนดรายละเอียดอีเมลทดสอบ
//         const testMailOptions = {
//             from: process.env.EMAIL_USER, // Sender's email
//             to: "jakkrit.day03@gmail.com", // ✅ Modified to send to a specific email address for testing
//             subject: 'Test Email from Next.js App',
//             html: `<p>This is a test email sent from your Next.js application using Nodemailer.</p>
//                    <p>Your SMTP settings appear to be working!</p>
//                    <p>Link Cable Team</p>`,
//         };

//         // ส่งอีเมล
//         await transporter.sendMail(testMailOptions);

//         console.log(`✅ Test email successfully sent from ${process.env.EMAIL_USER} to jakkrit.day03@gmail.com.`);
//         return NextResponse.json(
//             { success: true, message: 'Test email sent successfully to jakkrit.day03@gmail.com.' },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error('❌ Error sending test email:', error);
//         // ✅ เปลี่ยนจาก let เป็น const สำหรับ errorMessage
//         const errorMessage = 'Failed to send test email. ' + (error instanceof Error ? `Error: ${error.message}` : `Unknown error: ${String(error)}`);

//         return NextResponse.json(
//             { success: false, message: errorMessage },
//             { status: 500 }
//         );
//     }
// }
// v.1.1.2 ===============================================

// // src/app/api/test-mail/route.ts

// import nodemailer from "nodemailer";

// export async function GET() {
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
//       from: `"Test Interlink Shop" <${process.env.EMAIL_USER}>`,
//       to: "jakkrit.day03@gmail.com",
//       subject: "SMTP Test",
//       text: "SMTP working!",
//     });

//     return Response.json({ ok: true });
//   } catch (e) {
//     console.error(e);
//     return Response.json({ ok: false, error: e });
//   }
// }

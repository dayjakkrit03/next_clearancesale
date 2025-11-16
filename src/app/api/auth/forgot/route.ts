// v.1.1.2 ================================================
// src/app/api/auth/forgot/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prismaShop, setShopSessionTZ } from "@/lib/db";
import { generateResetToken } from "@/services/auth.service";
import { sendResetPasswordEmail } from "@/services/mail.service";

export async function POST(req: NextRequest) {
  await setShopSessionTZ();

  const { email } = await req.json().catch(() => ({ email: "" }));

  if (!email) {
    return NextResponse.json(
      { ok: false, message: "กรุณากรอกอีเมล" },
      { status: 400 }
    );
  }

  const user = await prismaShop.customers.findFirst({
    where: { email },
  });

  // เพื่อความปลอดภัย: ตอบ ok เสมอ แม้ไม่เจอ user หรือส่งเมลล้มเหลว
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  try {
    const token = await generateResetToken(email);
    await sendResetPasswordEmail(email, token);
  } catch (err) {
    console.error("[forgot] error:", err);
    // ยังตอบ ok เพื่อไม่บอกอะไรเกี่ยวกับระบบภายใน
  }

  return NextResponse.json({ ok: true });
}


// v.1.1.2 ================================================

// // src/app/api/auth/forgot/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prismaShop, setShopSessionTZ } from "@/lib/db";
// import { generateResetToken } from "@/services/auth.service";
// import { sendResetPasswordEmail } from "@/services/mail.service";

// export async function POST(req: NextRequest) {
//   await setShopSessionTZ();

//   const { email } = await req.json();

//   if (!email) {
//     return NextResponse.json(
//       { ok: false, message: "กรุณากรอกอีเมล" },
//       { status: 400 }
//     );
//   }

//   const user = await prismaShop.customers.findFirst({
//     where: { email },
//   });

//   // เพื่อความปลอดภัย: ไม่บอกว่า email มี/ไม่มีในระบบ
//   if (!user) {
//     return NextResponse.json({ ok: true });
//   }

//   const token = await generateResetToken(email);
//   const sent = await sendResetPasswordEmail(email, token);

//   return NextResponse.json({ ok: sent });
// }


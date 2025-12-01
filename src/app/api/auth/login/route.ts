// v.1.1.3 ================================================
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prismaShop, setShopSessionTZ } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createAuthToken, attachAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await setShopSessionTZ();

  const body = await req.json().catch(() => null);
  const username = body?.username?.trim();
  const password = body?.password ?? "";
  const remember: boolean = Boolean(body?.remember); // ⭐ รับค่ามา

  if (!username || !password) {
    return NextResponse.json(
      { ok: false, message: "กรุณากรอกอีเมลและรหัสผ่าน" },
      { status: 400 }
    );
  }

  const user = await prismaShop.customers.findFirst({
    where: {
      OR: [{ email: username }, { username }],
    },
  });

  if (!user || !user.password) {
    return NextResponse.json(
      { ok: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
      { status: 200 }
    );
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json(
      { ok: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
      { status: 200 }
    );
  }

  // ถ้าจะบังคับเฉพาะ member_status == 1
  if (user.member_status === false) {
    return NextResponse.json(
      {
        ok: false,
        message: "บัญชีนี้ยังไม่ได้ยืนยันการใช้งาน กรุณาติดต่อเจ้าหน้าที่",
      },
      { status: 200 }
    );
  }

  // ⭐ กำหนดอายุ JWT ตาม remember
  const expiresIn = remember ? "30d" : "7d";

  const token = createAuthToken(
    {
      sub: String(user.id),
      email: user.email,
      name: user.name ?? null,
    },
    expiresIn
  );

  const res = NextResponse.json({ ok: true });

  // ⭐ ส่ง remember ไปให้ attachAuthCookie
  attachAuthCookie(res, token, { remember });

  return res;
}


// v.1.1.3 ================================================

// v.1.1.2 ================================================
// // src/app/api/auth/login/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prismaShop, setShopSessionTZ } from "@/lib/db";
// import bcrypt from "bcryptjs";
// import { createAuthToken, attachAuthCookie } from "@/lib/auth";

// export async function POST(req: NextRequest) {
//   await setShopSessionTZ();

//   const body = await req.json().catch(() => null);
//   const username = body?.username?.trim();
//   const password = body?.password ?? "";

//   if (!username || !password) {
//     return NextResponse.json(
//       { ok: false, message: "กรุณากรอกอีเมลและรหัสผ่าน" },
//       { status: 400 }
//     );
//   }

//   const user = await prismaShop.customers.findFirst({
//     where: {
//       OR: [{ email: username }, { username }],
//     },
//   });

//   if (!user || !user.password) {
//     return NextResponse.json(
//       { ok: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
//       { status: 200 }
//     );
//   }

//   const valid = await bcrypt.compare(password, user.password);
//   if (!valid) {
//     return NextResponse.json(
//       { ok: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
//       { status: 200 }
//     );
//   }

//   // ถ้าจะบังคับเฉพาะ member_status == 1
//   if (user.member_status === false) {
//     return NextResponse.json(
//       {
//         ok: false,
//         message: "บัญชีนี้ยังไม่ได้ยืนยันการใช้งาน กรุณาติดต่อเจ้าหน้าที่",
//       },
//       { status: 200 }
//     );
//   }

//   const token = createAuthToken({
//     sub: String(user.id),
//     email: user.email,
//     name: user.name ?? null,
//   });

//   const res = NextResponse.json({ ok: true });
//   attachAuthCookie(res, token);
//   return res;
// }


// v.1.1.2 ================================================

// // src/app/api/auth/login/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import { prismaShop, setShopSessionTZ } from "@/lib/db";
// import { createAuthToken, attachAuthCookie } from "@/lib/auth";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json().catch(() => ({}));
//     const identifier = String(body.identifier || "").trim(); // email หรือ username
//     const password = String(body.password || "");

//     if (!identifier || !password) {
//       return NextResponse.json(
//         { ok: false, error: "MISSING_FIELDS" },
//         { status: 400 }
//       );
//     }

//     // ตั้ง timezone (เผื่อมีการใช้ timestamp ในอนาคต)
//     await setShopSessionTZ("+07:00");

//     // หา user จาก email หรือ username (เหมือน Laravel เดิม)
//     const user = await prismaShop.customers.findFirst({
//       where: {
//         OR: [{ email: identifier }, { username: identifier }],
//       },
//     });

//     if (!user) {
//       // ไม่บอกชัดว่าอะไรผิด เพื่อความปลอดภัย
//       return NextResponse.json(
//         { ok: false, error: "INVALID_CREDENTIALS" },
//         { status: 401 }
//       );
//     }

//     // password ใน DB เดิมมาจาก Laravel Hash::make → เป็น bcrypt
//     const valid = await bcrypt.compare(password, user.password);
//     if (!valid) {
//       return NextResponse.json(
//         { ok: false, error: "INVALID_CREDENTIALS" },
//         { status: 401 }
//       );
//     }

//     // สร้าง JWT token เก็บ id + email + name
//     const token = createAuthToken({
//       sub: String(user.id),
//       email: user.email,
//       name: user.name,
//     });

//     const res = NextResponse.json({ ok: true });
//     attachAuthCookie(res, token); // เซ็ต cookie httpOnly

//     return res;
//   } catch (err) {
//     console.error("[auth/login] error", err);
//     return NextResponse.json(
//       { ok: false, error: "SERVER_ERROR" },
//       { status: 500 }
//     );
//   }
// }

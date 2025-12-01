// v.1.1.3 ===================================================
// src/lib/auth.ts

import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const AUTH_COOKIE_NAME = "ilink_auth";

export type AuthTokenPayload = {
  sub: string; // customer id
  email: string;
  name?: string | null;
};

const JWT_SECRET = process.env.AUTH_JWT_SECRET || "";

if (!JWT_SECRET && process.env.NODE_ENV !== "production") {
  console.warn(
    "[auth] Missing AUTH_JWT_SECRET in environment. Please set it in .env.local"
  );
}

// ✅ ใช้ any ตรงนี้กัน TS งอแง แต่ runtime ทำงานเหมือนเดิม
export function createAuthToken(
  payload: AuthTokenPayload,
  expiresIn: string = "7d"
) {
  return (jwt as any).sign(
    payload as any,
    JWT_SECRET as any,
    { expiresIn } as any
  ) as string;
}

// ⭐ เพิ่ม options สำหรับ remember
export function attachAuthCookie(
  res: NextResponse,
  token: string,
  options?: { remember?: boolean }
) {
  // remember = true → อยู่ 30 วัน, ไม่งั้นเป็น session cookie
  const maxAge = options?.remember ? 60 * 60 * 24 * 30 : undefined;

  res.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(maxAge ? { maxAge } : {}), // ใส่เฉพาะตอน remember
  });
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    return (jwt as any).verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

// v.1.1.3 ===================================================

// v.1.1.2 ===================================================
// // src/lib/auth.ts

// import jwt from "jsonwebtoken";
// import { NextResponse } from "next/server";

// export const AUTH_COOKIE_NAME = "ilink_auth";

// export type AuthTokenPayload = {
//   sub: string; // customer id
//   email: string;
//   name?: string | null;
// };

// const JWT_SECRET = process.env.AUTH_JWT_SECRET || "";

// if (!JWT_SECRET && process.env.NODE_ENV !== "production") {
//   console.warn(
//     "[auth] Missing AUTH_JWT_SECRET in environment. Please set it in .env.local"
//   );
// }

// // ✅ ใช้ any ตรงนี้กัน TS งอแง แต่ runtime ทำงานเหมือนเดิม
// export function createAuthToken(
//   payload: AuthTokenPayload,
//   expiresIn: string = "7d"
// ) {
//   return (jwt as any).sign(
//     payload as any,
//     JWT_SECRET as any,
//     { expiresIn } as any
//   ) as string;
// }

// export function attachAuthCookie(res: NextResponse, token: string) {
//   res.cookies.set(AUTH_COOKIE_NAME, token, {
//     httpOnly: true,
//     sameSite: "lax",
//     secure: process.env.NODE_ENV === "production",
//     path: "/",
//     maxAge: 60 * 60 * 24 * 7,
//   });
// }

// export function clearAuthCookie(res: NextResponse) {
//   res.cookies.set(AUTH_COOKIE_NAME, "", {
//     httpOnly: true,
//     sameSite: "lax",
//     secure: process.env.NODE_ENV === "production",
//     path: "/",
//     maxAge: 0,
//   });
// }

// export function verifyAuthToken(token: string): AuthTokenPayload | null {
//   try {
//     return (jwt as any).verify(token, JWT_SECRET) as AuthTokenPayload;
//   } catch {
//     return null;
//   }
// }


// v.1.1.2 ===================================================

// // src/lib/auth.ts

// import jwt from "jsonwebtoken";
// import { NextResponse } from "next/server";

// export const AUTH_COOKIE_NAME = "ilink_auth";

// type AuthTokenPayload = {
//   sub: string; // customer id (string)
//   email: string;
//   name?: string | null;
// };

// const JWT_SECRET = process.env.AUTH_JWT_SECRET!;

// if (!JWT_SECRET) {
//   // เพื่อให้เห็นชัดตอน dev ถ้าลืมตั้งค่า env
//   console.warn(
//     "[auth] Missing AUTH_JWT_SECRET in environment. Please set it in .env.local"
//   );
// }

// export function createAuthToken(payload: AuthTokenPayload) {
//   return jwt.sign(payload, JWT_SECRET, {
//     expiresIn: "7d", // login ค้าง 7 วัน
//   });
// }

// // ใช้ใน API route เพื่อเซ็ต cookie
// export function attachAuthCookie(res: NextResponse, token: string) {
//   res.cookies.set(AUTH_COOKIE_NAME, token, {
//     httpOnly: true,
//     sameSite: "lax",
//     secure: process.env.NODE_ENV === "production",
//     path: "/",
//     maxAge: 60 * 60 * 24 * 7, // 7 วัน (วินาที)
//   });
// }

// export function clearAuthCookie(res: NextResponse) {
//   res.cookies.set(AUTH_COOKIE_NAME, "", {
//     httpOnly: true,
//     sameSite: "lax",
//     secure: process.env.NODE_ENV === "production",
//     path: "/",
//     maxAge: 0,
//   });
// }

// // สำหรับใช้ฝั่ง server component / route อื่น ๆ ภายหลัง
// export function verifyAuthToken(token: string): AuthTokenPayload | null {
//   try {
//     return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
//   } catch {
//     return null;
//   }
// }

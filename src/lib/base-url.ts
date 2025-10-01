// v.1.1.2 ================================================
// src/lib/base-url.ts
import { headers } from "next/headers";

/** คืนค่า base URL เช่น http://localhost:3000 หรือ https://example.com */
export async function getBaseUrl(): Promise<string> {
  // 1) ใช้ค่าจาก env ถ้ามี (แนะนำตั้งใน .env.local)
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL || process.env.APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  // 2) ใช้ค่าใน request headers (รองรับ proxy/edge)
  const h = await headers(); // <-- ให้ตรงกับ type ที่โปรเจกต์คุณเห็น
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host  = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

/** ต่อ path ให้เป็น absolute URL */
export async function absoluteUrl(path = "/"): Promise<string> {
  const base = await getBaseUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

// v.1.1.2 ================================================

// // src/lib/base-url.ts
// import { headers } from "next/headers";

// export async function getBaseUrl() {
//   // ใช้ env ถ้ามี (ดีที่สุดตอน deploy)
//   if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;

//   // ในบางสภาพแวดล้อม headers() เป็น Promise
//   const h = await headers();
//   const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
//   const proto = h.get("x-forwarded-proto") ?? "http";
//   return `${proto}://${host}`;
// }

// // (ออปชัน) สร้าง URL เต็มจาก path
// export async function absoluteUrl(path = "/") {
//   const base =
//     process.env.NEXT_PUBLIC_BASE_URL ??
//     (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
//     (await getBaseUrl());
//   return `${base}${path.startsWith("/") ? path : `/${path}`}`;
// }



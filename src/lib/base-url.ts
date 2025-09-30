// src/lib/base-url.ts
import { headers } from "next/headers";

export async function getBaseUrl() {
  // ใช้ env ถ้ามี (ดีที่สุดตอน deploy)
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;

  // ในบางสภาพแวดล้อม headers() เป็น Promise
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

// (ออปชัน) สร้าง URL เต็มจาก path
export async function absoluteUrl(path = "/") {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
    (await getBaseUrl());
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}



// v.1.1.4 ===============================================
// src/app/api/mock/products/meta/route.ts
import { NextResponse } from "next/server";
import { setMeta, getMeta } from "../_store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function toBool(v: any): boolean | undefined {
  if (typeof v === "boolean") return v;
  if (v === 1 || v === "1" || v === "true") return true;
  if (v === 0 || v === "0" || v === "false") return false;
  return undefined;
}

const CARD_PART_KEYS = [
  "image","discountBadge","brandLogo","frame",
  "brandName","sku","name","ratingReview","category","price","originalPrice","uom",
] as const;
type CardPartKey = (typeof CARD_PART_KEYS)[number];

export async function GET() {
  const meta = await getMeta(); // ✅ await
  return NextResponse.json({ meta }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: Request) {
  const raw = await req.json().catch(() => null);
  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  const safePatch: any = {};
  if (typeof raw.title === "string") safePatch.title = raw.title.trim();
  if (typeof raw.subtitle === "string") safePatch.subtitle = raw.subtitle.trim();

  if (raw.cardParts && typeof raw.cardParts === "object") {
    const incoming = raw.cardParts as Record<string, any>;
    const next: Partial<Record<CardPartKey, boolean>> = {};
    for (const k of CARD_PART_KEYS) {
      const bv = toBool(incoming[k]);
      if (typeof bv === "boolean") next[k] = bv;
    }
    if (Object.keys(next).length) safePatch.cardParts = next;
  }

  if (!Object.keys(safePatch).length) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  await setMeta(safePatch);      // ✅ await
  const meta = await getMeta();  // ✅ await
  return NextResponse.json({ ok: true, meta }, { headers: { "Cache-Control": "no-store" } });
}

// v.1.1.4 ===============================================

// v.1.1.3 ==============================================
// // src/app/api/mock/products/meta/route.ts
// import { NextResponse } from "next/server";
// import { setMeta, getMeta } from "../_store";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// /** แปลงค่าที่ส่งมาให้เป็น boolean แบบยืดหยุ่น */
// function toBool(v: any): boolean | undefined {
//   if (typeof v === "boolean") return v;
//   if (v === 1 || v === "1" || v === "true") return true;
//   if (v === 0 || v === "0" || v === "false") return false;
//   return undefined;
// }

// /** คีย์ที่อนุญาตใน cardParts */
// const CARD_PART_KEYS = [
//   "image",
//   "discountBadge",
//   "brandLogo",
//   "frame",
//   "brandName",
//   "sku",
//   "name",
//   "ratingReview",
//   "category",
//   "price",
//   "originalPrice",
//   "uom",
// ] as const;
// type CardPartKey = (typeof CARD_PART_KEYS)[number];

// /** อ่าน meta ปัจจุบัน (รวม cardParts) */
// export async function GET() {
//   return NextResponse.json(
//     { meta: getMeta() },
//     { headers: { "Cache-Control": "no-store" } },
//   );
// }

// /** อัปเดต meta (รองรับ patch เฉพาะ field ที่ส่งมา รวมถึง cardParts แบบบางส่วน) */
// export async function PATCH(req: Request) {
//   const raw = await req.json().catch(() => null);
//   if (!raw || typeof raw !== "object") {
//     return NextResponse.json({ error: "Bad payload" }, { status: 400 });
//   }

//   const safePatch: any = {};

//   // title / subtitle (ถ้ามี)
//   if (typeof raw.title === "string") {
//     const v = raw.title.trim();
//     if (v.length) safePatch.title = v;
//   }
//   if (typeof raw.subtitle === "string") {
//     safePatch.subtitle = raw.subtitle.trim();
//   }

//   // cardParts (ถ้ามี) — กรองเฉพาะคีย์ที่อนุญาตและแปลงเป็น boolean
//   if (raw.cardParts && typeof raw.cardParts === "object") {
//     const incoming = raw.cardParts as Record<string, any>;
//     const next: Partial<Record<CardPartKey, boolean>> = {};
//     for (const k of CARD_PART_KEYS) {
//       const bv = toBool(incoming[k]);
//       if (typeof bv === "boolean") next[k] = bv;
//     }
//     if (Object.keys(next).length) {
//       safePatch.cardParts = next;
//     }
//   }

//   // ไม่มีอะไรให้แก้จริง ๆ
//   if (!Object.keys(safePatch).length) {
//     return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
//   }

//   // อัปเดต (setMeta จะ merge cardParts และใส่ updatedAt ให้เอง)
//   setMeta(safePatch);

//   // ส่งค่า meta ล่าสุดกลับไปให้ UI sync ต่อ
//   return NextResponse.json(
//     { ok: true, meta: getMeta() },
//     { headers: { "Cache-Control": "no-store" } },
//   );
// }

// v.1.1.3 ==============================================

// v.1.1.2 ==============================================
// // src/app/api/mock/products/meta/route.ts
// import { NextResponse } from "next/server";
// import { setMeta, getMeta } from "../_store";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// /** แปลงค่าที่ส่งมาให้เป็น boolean */
// function toBool(v: any): boolean | undefined {
//   if (typeof v === "boolean") return v;
//   if (v === 1 || v === "1" || v === "true") return true;
//   if (v === 0 || v === "0" || v === "false") return false;
//   return undefined;
// }

// /** ชุดคีย์ที่อนุญาตใน cardParts */
// const CARD_PART_KEYS = [
//   "image",
//   "discountBadge",
//   "brandLogo",
//   "frame",
//   "brandName",
//   "sku",
//   "name",
//   "ratingReview",
//   "category",
//   "price",
//   "originalPrice",
//   "uom",
// ] as const;
// type CardPartKey = (typeof CARD_PART_KEYS)[number];

// export async function PATCH(req: Request) {
//   const raw = await req.json().catch(() => null);
//   if (!raw || typeof raw !== "object") {
//     return NextResponse.json({ error: "Bad payload" }, { status: 400 });
//   }

//   const safePatch: any = {};

//   // title/subtitle (ถ้ามี)
//   if (typeof raw.title === "string") {
//     const v = raw.title.trim();
//     if (v) safePatch.title = v;
//   }
//   if (typeof raw.subtitle === "string") {
//     safePatch.subtitle = raw.subtitle.trim();
//   }

//   // cardParts (ถ้ามี) — กรองเฉพาะคีย์ที่อนุญาตและเป็น boolean
//   if (raw.cardParts && typeof raw.cardParts === "object") {
//     const incoming = raw.cardParts as Record<string, any>;
//     const next: Partial<Record<CardPartKey, boolean>> = {};
//     for (const k of CARD_PART_KEYS) {
//       const bv = toBool(incoming[k]);
//       if (typeof bv === "boolean") next[k] = bv;
//     }
//     if (Object.keys(next).length) {
//       safePatch.cardParts = next;
//     }
//   }

//   // ถ้าไม่มีอะไรปลอดภัยให้แก้ ก็รีเจกต์
//   if (!Object.keys(safePatch).length) {
//     return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
//   }

//   // อัปเดต (setMeta จะเติม updatedAt ให้เอง)
//   setMeta(safePatch);

//   // ส่ง meta ล่าสุดกลับไปด้วย เผื่อ UI จะรีเฟรชสถานะ
//   return NextResponse.json({ ok: true, meta: getMeta() }, { headers: { "Cache-Control": "no-store" } });
// }

// /** (ออปชันนัล) เผื่อฝั่ง client อยากอ่าน meta ตรงนี้โดยไม่ต้องดึงทั้งรายการ */
// export async function GET() {
//   return NextResponse.json({ meta: getMeta() }, { headers: { "Cache-Control": "no-store" } });
// }

// v.1.1.2 ==============================================

// // src/app/api/mock/products/meta/route.ts

// import { NextResponse } from "next/server";
// import { setMeta } from "../_store";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// export async function PATCH(req: Request) {
//   const patch = await req.json().catch(() => null);
//   if (!patch) return NextResponse.json({ error: "Bad payload" }, { status: 400 });
//   setMeta(patch);
//   return NextResponse.json({ ok: true });
// }

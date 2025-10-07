// v.1.1.2 ==============================================
// src/app/api/mock/products/route.ts

import { NextResponse } from "next/server";
import { getAll, getMeta, upsert } from "./_store";
import { validateProductInput } from "@/lib/validation/product";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(
    { items: getAll({ includeHidden: true }), meta: getMeta() },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  if (!raw) {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  try {
    // ตรวจคอร์ฟิลด์ (name, price, discountPercent, image_url, brand, sku)
    const base = validateProductInput(raw);

    // แปลง/ทำความสะอาดฟิลด์เสริม
    const num = (v: any) => (v === "" || v == null ? undefined : Number(v));
    const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

    const ratingRaw = num(raw.rating);
    const reviewsRaw = num(raw.reviews);

    const payload = {
      ...base,
      // อนุญาต type เป็น string|number
      category_id:
        raw.category_id === "" || raw.category_id == null ? undefined : raw.category_id,
      uom:
        typeof raw.uom === "string" ? raw.uom.trim() || undefined : undefined,
      rating:
        typeof ratingRaw === "number" && Number.isFinite(ratingRaw)
          ? clamp(Number(ratingRaw.toFixed(1)), 0, 5)
          : undefined,
      reviews:
        typeof reviewsRaw === "number" && Number.isFinite(reviewsRaw)
          ? Math.max(0, Math.floor(reviewsRaw))
          : undefined,
      // visible ใส่มาได้ (ไม่บังคับ) — ถ้าไม่ส่งมาจะให้ false ตอน create ตาม UI
      visible: typeof raw.visible === "boolean" ? raw.visible : false,
    };

    const item = upsert(payload as any);
    return NextResponse.json({ item }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Validation failed", message: e?.message ?? "" },
      { status: 400 }
    );
  }
}

// v.1.1.2 ==============================================

// // src/app/api/mock/products/route.ts

// import { NextResponse } from "next/server";
// import { getAll, getMeta, upsert } from "./_store";
// import { validateProductInput } from "@/lib/validation/product";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// export async function GET() {
//   return NextResponse.json(
//     { items: getAll({ includeHidden: true }), meta: getMeta() },
//     { headers: { "Cache-Control": "no-store" } }
//   );
// }

// export async function POST(req: Request) {
//   const raw = await req.json().catch(() => null);
//   if (!raw) return NextResponse.json({ error: "Bad payload" }, { status: 400 });

//   try {
//     const parsed = validateProductInput(raw);
//     const item = upsert(parsed);
//     return NextResponse.json({ item }, { status: 201 });
//   } catch (e: any) {
//     return NextResponse.json({ error: "Validation failed", message: e?.message ?? "" }, { status: 400 });
//   }
// }

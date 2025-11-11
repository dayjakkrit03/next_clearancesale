// v.1.1.6 ====================================================
// src/app/api/mock/products/[id]/route.ts

import { NextResponse } from "next/server";
import { setVisible, toggleVisible, remove, upsert, getById } from "../_store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseId(param: string) {
  return isNaN(Number(param)) ? param : Number(param);
}

// แปลง string ตัวเลข → number ถ้าเป็นตัวเลขล้วน
function toNumberIfNumeric(v: any) {
  if (v === "" || v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}
function clamp(num: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, num));
}

/** GET /api/mock/products/[id] : อ่านรายละเอียดชิ้นเดียว */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseId(rawId);

  const item = await getById(id); // ✅ ตอนนี้จะได้ images[] กลับมาด้วย
  if (!item) {
    return NextResponse.json({ message: "Product not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json(item, { status: 200, headers: { "Cache-Control": "no-store" } });
}

/** PATCH /api/mock/products/[id] : อัปเดตแบบบางฟิลด์ (partial) */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseId(rawId);

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Bad payload" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  // toggle/visible: พฤติกรรมเดิม — ถ้า body ระบุ visible แบบ boolean ให้จัดการแล้วจบเลย
  if (typeof body.visible === "boolean") {
    await setVisible(id, body.visible); // ✅ await
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  }
  if (body.toggleVisible === true) {
    await toggleVisible(id); // ✅ await
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  }

  // ✅ อนุญาต PARTIAL UPDATE (พฤติกรรมเดิม)
  const allowedKeys = new Set([
    "name",
    "brand",
    "sku",
    "price",
    "discountPercent",
    "image_url",
    "category_id",
    "uom",
    "rating",
    "reviews",
    "visible",
  ]);

  const patch: Record<string, any> = {};
  for (const k of Object.keys(body || {})) {
    if (!allowedKeys.has(k)) continue;
    let v = body[k];

    if (k === "price" || k === "discountPercent" || k === "rating" || k === "reviews") {
      const n = Number(v);
      if (Number.isFinite(n)) v = n;
    }

    if (k === "discountPercent" && typeof v === "number") {
      v = clamp(Math.round(v), 0, 100);
    }
    if (k === "rating" && typeof v === "number") {
      v = clamp(Number(v.toFixed(1)), 0, 5);
    }
    if (k === "reviews" && typeof v === "number") {
      v = Math.max(0, Math.floor(v));
    }
    if (k === "category_id") {
      // รับทั้ง string/number — ถ้าเป็นตัวเลขล้วน แปลงเป็น number ให้
      v = toNumberIfNumeric(v);
    }

    patch[k] = v;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No updatable fields" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  // ใช้ upsert รวมค่า (store จะ merge ให้) — ✅ await
  await upsert({ id, ...patch });

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

/** DELETE /api/mock/products/[id] : ลบ */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseId(rawId);

  await remove(id); // ✅ await
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

// v.1.1.6 ====================================================

// v.1.1.5 ====================================================
// // src/app/api/mock/products/[id]/route.ts
// import { NextResponse } from "next/server";
// import { setVisible, toggleVisible, remove, upsert, getById } from "../_store";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// function parseId(param: string) {
//   return isNaN(Number(param)) ? param : Number(param);
// }

// // แปลง string ตัวเลข → number ถ้าเป็นตัวเลขล้วน
// function toNumberIfNumeric(v: any) {
//   if (v === "" || v == null) return undefined;
//   const n = Number(v);
//   return Number.isFinite(n) ? n : v;
// }
// function clamp(num: number, lo: number, hi: number) {
//   return Math.min(hi, Math.max(lo, num));
// }

// /** GET /api/mock/products/[id] : อ่านรายละเอียดชิ้นเดียว */
// export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
//   const { id: rawId } = await params;
//   const id = parseId(rawId);

//   const item = await getById(id); // ✅ await (DB)
//   if (!item) {
//     return NextResponse.json({ message: "Product not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
//   }
//   return NextResponse.json(item, { status: 200, headers: { "Cache-Control": "no-store" } });
// }

// /** PATCH /api/mock/products/[id] : อัปเดตแบบบางฟิลด์ (partial) */
// export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
//   const { id: rawId } = await params;
//   const id = parseId(rawId);

//   const body = await req.json().catch(() => null);
//   if (!body) {
//     return NextResponse.json({ error: "Bad payload" }, { status: 400, headers: { "Cache-Control": "no-store" } });
//   }

//   // toggle/visible: พฤติกรรมเดิม — ถ้า body ระบุ visible แบบ boolean ให้จัดการแล้วจบเลย
//   if (typeof body.visible === "boolean") {
//     await setVisible(id, body.visible); // ✅ await
//     return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
//   }
//   if (body.toggleVisible === true) {
//     await toggleVisible(id); // ✅ await
//     return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
//   }

//   // ✅ อนุญาต PARTIAL UPDATE (พฤติกรรมเดิม)
//   const allowedKeys = new Set([
//     "name",
//     "brand",
//     "sku",
//     "price",
//     "discountPercent",
//     "image_url",
//     "category_id",
//     "uom",
//     "rating",
//     "reviews",
//     "visible",
//   ]);

//   const patch: Record<string, any> = {};
//   for (const k of Object.keys(body || {})) {
//     if (!allowedKeys.has(k)) continue;
//     let v = body[k];

//     if (k === "price" || k === "discountPercent" || k === "rating" || k === "reviews") {
//       const n = Number(v);
//       if (Number.isFinite(n)) v = n;
//     }

//     if (k === "discountPercent" && typeof v === "number") {
//       v = clamp(Math.round(v), 0, 100);
//     }
//     if (k === "rating" && typeof v === "number") {
//       v = clamp(Number(v.toFixed(1)), 0, 5);
//     }
//     if (k === "reviews" && typeof v === "number") {
//       v = Math.max(0, Math.floor(v));
//     }
//     if (k === "category_id") {
//       // รับทั้ง string/number — ถ้าเป็นตัวเลขล้วน แปลงเป็น number ให้
//       v = toNumberIfNumeric(v);
//     }

//     patch[k] = v;
//   }

//   if (Object.keys(patch).length === 0) {
//     return NextResponse.json({ error: "No updatable fields" }, { status: 400, headers: { "Cache-Control": "no-store" } });
//   }

//   // ใช้ upsert รวมค่า (store จะ merge ให้) — ✅ await
//   await upsert({ id, ...patch });

//   return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
// }

// /** DELETE /api/mock/products/[id] : ลบ */
// export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
//   const { id: rawId } = await params;
//   const id = parseId(rawId);

//   await remove(id); // ✅ await
//   return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
// }

// v.1.1.5 ====================================================

// v.1.1.4 ====================================================
// // src/app/api/mock/products/[id]/route.ts
// import { NextResponse } from "next/server";
// import { setVisible, toggleVisible, remove, upsert, getById } from "../_store";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// function parseId(param: string) {
//   return isNaN(Number(param)) ? param : Number(param);
// }

// // แปลง string ตัวเลข → number ถ้าเป็นตัวเลขล้วน
// function toNumberIfNumeric(v: any) {
//   if (v === "" || v == null) return undefined;
//   const n = Number(v);
//   return Number.isFinite(n) ? n : v;
// }
// function clamp(num: number, lo: number, hi: number) {
//   return Math.min(hi, Math.max(lo, num));
// }

// /** GET /api/mock/products/[id] : อ่านรายละเอียดชิ้นเดียว */
// export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
//   const { id: rawId } = await params;
//   const id = parseId(rawId);
//   const item = getById(id);
//   if (!item) {
//     return NextResponse.json({ message: "Product not found" }, { status: 404 });
//   }
//   return NextResponse.json(item, { status: 200 });
// }

// /** PATCH /api/mock/products/[id] : อัปเดตแบบบางฟิลด์ (partial) */
// export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
//   const { id: rawId } = await params;
//   const id = parseId(rawId);

//   const body = await req.json().catch(() => null);
//   if (!body) return NextResponse.json({ error: "Bad payload" }, { status: 400 });

//   // toggle/visible: เดิม
//   if (typeof body.visible === "boolean") {
//     setVisible(id, body.visible);
//     return NextResponse.json({ ok: true });
//   }
//   if (body.toggleVisible === true) {
//     toggleVisible(id);
//     return NextResponse.json({ ok: true });
//   }

//   // ✅ อนุญาต PARTIAL UPDATE
//   const allowedKeys = new Set([
//     "name",
//     "brand",
//     "sku",
//     "price",
//     "discountPercent",
//     "image_url",
//     "category_id",
//     "uom",
//     "rating",
//     "reviews",
//     "visible",
//   ]);

//   const patch: Record<string, any> = {};
//   for (const k of Object.keys(body || {})) {
//     if (!allowedKeys.has(k)) continue;
//     let v = body[k];

//     if (k === "price" || k === "discountPercent" || k === "rating" || k === "reviews") {
//       const n = Number(v);
//       if (Number.isFinite(n)) v = n;
//     }

//     if (k === "discountPercent" && typeof v === "number") {
//       v = clamp(Math.round(v), 0, 100);
//     }
//     if (k === "rating" && typeof v === "number") {
//       v = clamp(Number(v.toFixed(1)), 0, 5);
//     }
//     if (k === "reviews" && typeof v === "number") {
//       v = Math.max(0, Math.floor(v));
//     }
//     if (k === "category_id") {
//       // รับทั้ง string/number — ถ้าเป็นตัวเลขล้วน แปลงเป็น number ให้
//       v = toNumberIfNumeric(v);
//     }

//     patch[k] = v;
//   }

//   if (Object.keys(patch).length === 0) {
//     return NextResponse.json({ error: "No updatable fields" }, { status: 400 });
//   }

//   // ใช้ upsert รวมค่า (store จะ merge ให้)
//   upsert({ id, ...patch });

//   return NextResponse.json({ ok: true });
// }

// /** DELETE /api/mock/products/[id] : ลบ */
// export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
//   const { id: rawId } = await params;
//   const id = parseId(rawId);
//   remove(id);
//   return NextResponse.json({ ok: true });
// }

// v.1.1.4 ====================================================

// v.1.1.3 ====================================================
// // src/app/api/mock/products/[id]/route.ts
// import { NextResponse } from "next/server";
// import { setVisible, toggleVisible, remove, upsert } from "../_store";
// // ❗ ไม่ใช้ validateProductInput สำหรับ partial update เพื่อรองรับ bulk move
// // import { validateProductInput } from "@/lib/validation/product";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// function parseId(param: string) {
//   return isNaN(Number(param)) ? param : Number(param);
// }

// // helper: แปลง string ตัวเลข → number ถ้าเป็นตัวเลขล้วน
// function toNumberIfNumeric(v: any) {
//   if (v === "" || v == null) return undefined;
//   const n = Number(v);
//   return Number.isFinite(n) ? n : v;
// }
// function clamp(num: number, lo: number, hi: number) {
//   return Math.min(hi, Math.max(lo, num));
// }

// export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
//   const { id: rawId } = await params;
//   const id = parseId(rawId);

//   const body = await req.json().catch(() => null);
//   if (!body) return NextResponse.json({ error: "Bad payload" }, { status: 400 });

//   // toggle/visible: เดิม
//   if (typeof body.visible === "boolean") {
//     setVisible(id, body.visible);
//     return NextResponse.json({ ok: true });
//   }
//   if (body.toggleVisible === true) {
//     toggleVisible(id);
//     return NextResponse.json({ ok: true });
//   }

//   // ✅ อนุญาต PARTIAL UPDATE (เช่น category_id อย่างเดียว)
//   // เก็บเฉพาะคีย์ที่อนุญาต และ normalize ตัวเลข
//   const allowedKeys = new Set([
//     "name",
//     "brand",
//     "sku",
//     "price",
//     "discountPercent",
//     "image_url",
//     "category_id",
//     "uom",
//     "rating",
//     "reviews",
//     "visible",
//   ]);

//   const patch: Record<string, any> = {};
//   for (const k of Object.keys(body || {})) {
//     if (!allowedKeys.has(k)) continue;
//     let v = body[k];

//     if (k === "price" || k === "discountPercent" || k === "rating" || k === "reviews") {
//       const n = Number(v);
//       if (Number.isFinite(n)) v = n;
//     }

//     if (k === "discountPercent" && typeof v === "number") {
//       v = clamp(Math.round(v), 0, 100);
//     }
//     if (k === "rating" && typeof v === "number") {
//       v = clamp(Number(v.toFixed(1)), 0, 5);
//     }
//     if (k === "reviews" && typeof v === "number") {
//       v = Math.max(0, Math.floor(v));
//     }
//     if (k === "category_id") {
//       // รับได้ทั้ง string/number — ถ้าเป็นตัวเลขล้วน แปลงเป็น number ให้
//       const maybeNum = toNumberIfNumeric(v);
//       v = maybeNum;
//     }

//     patch[k] = v;
//   }

//   if (Object.keys(patch).length === 0) {
//     return NextResponse.json({ error: "No updatable fields" }, { status: 400 });
//   }

//   // ใช้ upsert รวมค่า (store จะ merge ให้)
//   upsert({ id, ...patch });

//   return NextResponse.json({ ok: true });
// }

// export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
//   const { id: rawId } = await params;
//   const id = parseId(rawId);
//   remove(id);
//   return NextResponse.json({ ok: true });
// }

// v.1.1.3 ====================================================

// v.1.1.2 ====================================================
// // src/app/api/mock/products/[id]/route.ts

// import { NextResponse } from "next/server";
// import { setVisible, toggleVisible, remove, upsert } from "../_store";
// import { validateProductInput } from "@/lib/validation/product";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// function parseId(param: string) {
//   return isNaN(Number(param)) ? param : Number(param);
// }

// export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
//   const { id: rawId } = await params;
//   const id = parseId(rawId);

//   const body = await req.json().catch(() => null);
//   if (!body) return NextResponse.json({ error: "Bad payload" }, { status: 400 });

//   // quick paths สำหรับการสลับการมองเห็น
//   if (typeof body.visible === "boolean") {
//     setVisible(id, body.visible);
//     return NextResponse.json({ ok: true });
//   }
//   if (body.toggleVisible === true) {
//     toggleVisible(id);
//     return NextResponse.json({ ok: true });
//   }

//   try {
//     // ตรวจคอร์ฟิลด์ (name, price, discountPercent, image_url, brand, sku)
//     const base = validateProductInput({ ...body });

//     // แปลง/ทำความสะอาดฟิลด์เสริม
//     const num = (v: any) => (v === "" || v == null ? undefined : Number(v));
//     const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

//     const ratingRaw = num(body.rating);
//     const reviewsRaw = num(body.reviews);

//     const payload = {
//       id,
//       ...base,
//       category_id:
//         body.category_id === "" || body.category_id == null ? undefined : body.category_id,
//       uom: typeof body.uom === "string" ? body.uom.trim() || undefined : undefined,
//       rating:
//         typeof ratingRaw === "number" && Number.isFinite(ratingRaw)
//           ? clamp(Number(ratingRaw.toFixed(1)), 0, 5)
//           : undefined,
//       reviews:
//         typeof reviewsRaw === "number" && Number.isFinite(reviewsRaw)
//           ? Math.max(0, Math.floor(reviewsRaw))
//           : undefined,
//       // ถ้าส่ง visible มาด้วยในกรณีอัปเดตทั่วไป ให้ยอมรับค่า boolean (ไม่บังคับ)
//       ...(typeof body.visible === "boolean" ? { visible: body.visible } : {}),
//     };

//     upsert(payload as any);
//     return NextResponse.json({ ok: true });
//   } catch (e: any) {
//     return NextResponse.json(
//       { error: "Validation failed", message: e?.message ?? "" },
//       { status: 400 }
//     );
//   }
// }

// export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
//   const { id: rawId } = await params;
//   const id = parseId(rawId);
//   remove(id);
//   return NextResponse.json({ ok: true });
// }

// v.1.1.2 ====================================================

// // src/app/api/mock/products/[id]/route.ts

// import { NextResponse } from "next/server";
// import { setVisible, toggleVisible, remove, upsert } from "../_store";
// import { validateProductInput } from "@/lib/validation/product";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// function parseId(param: string) {
//   return isNaN(Number(param)) ? param : Number(param);
// }

// export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
//   const { id: rawId } = await params;
//   const id = parseId(rawId);

//   const body = await req.json().catch(() => null);
//   if (!body) return NextResponse.json({ error: "Bad payload" }, { status: 400 });

//   if (typeof body.visible === "boolean") {
//     setVisible(id, body.visible);
//     return NextResponse.json({ ok: true });
//   }
//   if (body.toggleVisible === true) {
//     toggleVisible(id);
//     return NextResponse.json({ ok: true });
//   }

//   try {
//     const parsed = validateProductInput({ ...body });
//     upsert({ id, ...parsed });
//     return NextResponse.json({ ok: true });
//   } catch (e: any) {
//     return NextResponse.json({ error: "Validation failed", message: e?.message ?? "" }, { status: 400 });
//   }
// }

// export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
//   const { id: rawId } = await params;
//   const id = parseId(rawId);
//   remove(id);
//   return NextResponse.json({ ok: true });
// }

// v.1.1.2 ====================================================
// src/app/api/mock/products/[id]/route.ts

import { NextResponse } from "next/server";
import { setVisible, toggleVisible, remove, upsert } from "../_store";
import { validateProductInput } from "@/lib/validation/product";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseId(param: string) {
  return isNaN(Number(param)) ? param : Number(param);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseId(rawId);

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad payload" }, { status: 400 });

  // quick paths สำหรับการสลับการมองเห็น
  if (typeof body.visible === "boolean") {
    setVisible(id, body.visible);
    return NextResponse.json({ ok: true });
  }
  if (body.toggleVisible === true) {
    toggleVisible(id);
    return NextResponse.json({ ok: true });
  }

  try {
    // ตรวจคอร์ฟิลด์ (name, price, discountPercent, image_url, brand, sku)
    const base = validateProductInput({ ...body });

    // แปลง/ทำความสะอาดฟิลด์เสริม
    const num = (v: any) => (v === "" || v == null ? undefined : Number(v));
    const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

    const ratingRaw = num(body.rating);
    const reviewsRaw = num(body.reviews);

    const payload = {
      id,
      ...base,
      category_id:
        body.category_id === "" || body.category_id == null ? undefined : body.category_id,
      uom: typeof body.uom === "string" ? body.uom.trim() || undefined : undefined,
      rating:
        typeof ratingRaw === "number" && Number.isFinite(ratingRaw)
          ? clamp(Number(ratingRaw.toFixed(1)), 0, 5)
          : undefined,
      reviews:
        typeof reviewsRaw === "number" && Number.isFinite(reviewsRaw)
          ? Math.max(0, Math.floor(reviewsRaw))
          : undefined,
      // ถ้าส่ง visible มาด้วยในกรณีอัปเดตทั่วไป ให้ยอมรับค่า boolean (ไม่บังคับ)
      ...(typeof body.visible === "boolean" ? { visible: body.visible } : {}),
    };

    upsert(payload as any);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Validation failed", message: e?.message ?? "" },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  remove(id);
  return NextResponse.json({ ok: true });
}

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

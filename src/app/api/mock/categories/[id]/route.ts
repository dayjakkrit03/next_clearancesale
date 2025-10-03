// v.1.1.4 ================================================
// src/app/api/mock/categories/[id]/route.ts

import { NextResponse } from "next/server";
import { setVisible, toggleVisible, remove, upsert } from "../_store";
import { validateCategoryUpdate } from "@/lib/validation/category";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseId(param: string) {
  return isNaN(Number(param)) ? param : Number(param);
}

// Next.js 15: ต้อง await params ก่อนใช้
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const id = parseId(rawId);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  // 1) toggle/visible: ผ่านไปโดยไม่ตรวจสคีมาเนื้อหาอื่น
  if (typeof body.visible === "boolean") {
    setVisible(id, body.visible);
    return NextResponse.json({ ok: true });
  }
  if (body.toggleVisible === true) {
    toggleVisible(id);
    return NextResponse.json({ ok: true });
  }

  // 2) แก้ไขข้อมูลหลัก: name/slug/image_url ต้องไม่ว่าง
  const result = validateCategoryUpdate(body);
  if (!result.ok) {
    return NextResponse.json({ error: "Validation failed", errors: result.errors }, { status: 400 });
  }

  upsert({ id, ...result.data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const id = parseId(rawId);

  remove(id);
  return NextResponse.json({ ok: true });
}

// v.1.1.4 ================================================

// v.1.1.3 ================================================
// // src/app/api/mock/categories/[id]/route.ts

// import { NextResponse } from "next/server";
// import { setVisible, toggleVisible, remove, upsert } from "../_store";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// function parseId(param: string) {
//   return isNaN(Number(param)) ? param : Number(param);
// }

// // Note: ใน Next.js 15 ให้ await params ก่อนใช้งาน
// export async function PATCH(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id: rawId } = await params;
//   const id = parseId(rawId);

//   const body = await req.json().catch(() => null);
//   if (!body) {
//     return NextResponse.json({ error: "Bad payload" }, { status: 400 });
//   }

//   // รองรับ 3 โหมด:
//   // 1) { visible: boolean }          -> setVisible
//   // 2) { toggleVisible: true }       -> toggleVisible
//   // 3) อื่น ๆ (name, slug, ...)      -> upsert({ id, ... })
//   if (typeof body.visible === "boolean") {
//     setVisible(id, body.visible);
//   } else if (body.toggleVisible === true) {
//     toggleVisible(id);
//   } else {
//     upsert({ id, ...body });
//   }

//   return NextResponse.json({ ok: true });
// }

// export async function DELETE(
//   _req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id: rawId } = await params;
//   const id = parseId(rawId);

//   remove(id);
//   return NextResponse.json({ ok: true });
// }

// v.1.1.3 ================================================

// v.1.1.2 ================================================
// // src/app/api/mock/categories/[id]/route.ts

// import { NextResponse } from "next/server";
// import { setVisible, toggleVisible, remove, upsert } from "../_store";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// function parseId(param: string) {
//   return isNaN(Number(param)) ? param : Number(param);
// }

// export async function PATCH(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   const id = parseId(params.id);
//   const body = await req.json().catch(() => null);
//   if (!body) return NextResponse.json({ error: "Bad payload" }, { status: 400 });

//   // รองรับ 2 แบบ:
//   // 1) { visible: boolean }  -> setVisible
//   // 2) upsert ฟิลด์อื่น ๆ (name, slug, image_url, ...) -> upsert({ id, ... })
//   if (typeof body.visible === "boolean") {
//     setVisible(id, body.visible);
//   } else if (body.toggleVisible === true) {
//     toggleVisible(id);
//   } else {
//     upsert({ id, ...body });
//   }

//   return NextResponse.json({ ok: true });
// }

// export async function DELETE(
//   _req: Request,
//   { params }: { params: { id: string } }
// ) {
//   const id = parseId(params.id);
//   remove(id);
//   return NextResponse.json({ ok: true });
// }

// v.1.1.2 ================================================

// // src/app/api/mock/categories/[id]/route.ts

// import { NextResponse } from "next/server";
// import { db, CategorySchema, sortByOrder } from "@/mocks/db";

// export const dynamic = "force-dynamic";

// export async function PATCH(
//   _req: Request,
//   { params }: { params: { id: string } }
// ) {
//   const id = params.id;
//   const idx = db.categories.findIndex(c => String(c.id) === String(id));
//   if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });

//   const body = await _req.json().catch(() => ({}));
//   const parsed = CategorySchema.partial().safeParse(body);
//   if (!parsed.success) {
//     return NextResponse.json({ message: "Bad payload", issues: parsed.error.issues }, { status: 400 });
//   }
//   db.categories[idx] = { ...db.categories[idx], ...parsed.data };
//   sortByOrder();
//   return NextResponse.json({ ok: true });
// }

// export async function DELETE(
//   _req: Request,
//   { params }: { params: { id: string } }
// ) {
//   const id = params.id;
//   const before = db.categories.length;
//   db.categories = db.categories.filter(c => String(c.id) !== String(id));
//   if (db.categories.length === before) {
//     return NextResponse.json({ message: "Not found" }, { status: 404 });
//   }
//   // รีออเดอร์ให้เรียง 0..N ใหม่ (optional)
//   db.categories.forEach((c, i) => (c.order = i));
//   return NextResponse.json({ ok: true });
// }

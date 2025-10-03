// v.1.1.5 ================================================
// src/app/api/mock/categories/route.ts

import { NextResponse } from "next/server";
import { getAll, getMeta, upsert } from "./_store";
import { validateCategoryCreate } from "@/lib/validation/category";
import { fa } from "zod/v4/locales";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(
    { items: getAll({ includeHidden: true }), meta: getMeta() },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Bad payload" }, { status: 400 });
    }

    // ✅ validate: name/slug/image_url ต้องไม่ว่าง
    const result = validateCategoryCreate(body);
    if (!result.ok) {
      return NextResponse.json({ error: "Validation failed", errors: result.errors }, { status: 400 });
    }

    const payload = {
      ...body,
      ...result.data,
      visible: typeof body.visible === "boolean" ? body.visible : false, // default เป็น false
    };

    const item = upsert(payload);
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

// v.1.1.5 ================================================

// v.1.1.4 ================================================
// // src/app/api/mock/categories/route.ts

// import { NextResponse } from "next/server";
// import { getAll, getMeta, upsert } from "./_store";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// export async function GET() {
//   // ส่งรายการทั้งหมด (รวมที่ซ่อน) + meta
//   return NextResponse.json(
//     { items: getAll({ includeHidden: true }), meta: getMeta() },
//     { headers: { "Cache-Control": "no-store" } }
//   );
// }

// function slugify(input: string) {
//   return (input ?? "")
//     .toLowerCase()
//     .trim()
//     .replace(/[\s_]+/g, "-")
//     .replace(/[^a-z0-9-]/g, "")
//     .replace(/-+/g, "-")
//     .replace(/^-|-$/g, "");
// }

// export async function POST(req: Request) {
//   try {
//     const body = await req.json().catch(() => null);
//     if (!body || (typeof body.name !== "string" && typeof body.slug !== "string")) {
//       return NextResponse.json({ error: "Bad payload" }, { status: 400 });
//     }

//     const name = typeof body.name === "string" ? body.name.trim() : "";
//     // ถ้าไม่ได้ส่ง slug ให้สร้างจาก name, ถ้าส่งมาก็ normalize ให้ถูกฟอร์แมต
//     const slug =
//       typeof body.slug === "string" && body.slug.trim().length > 0
//         ? slugify(body.slug)
//         : slugify(name);

//     const payload = {
//       ...body,
//       name,
//       slug,
//       // เผื่อไม่ได้ส่ง visible มา ให้ default เป็น true
//       visible: typeof body.visible === "boolean" ? body.visible : true,
//     };

//     // upsert ควร return item; ถ้าโค้ดใน _store ยังไม่ return ให้ fallback หาใน state
//     const maybeItem = upsert(payload) as any;
//     const item =
//       maybeItem ??
//       getAll({ includeHidden: true }).find(
//         (c) => c.id === payload.id || c.slug === payload.slug
//       );

//     if (!item) {
//       // ไม่ควรเกิด ถ้า upsert ทำงานถูกต้อง
//       return NextResponse.json({ error: "Save failed" }, { status: 500 });
//     }

//     return NextResponse.json({ item }, { status: 201 });
//   } catch (e) {
//     return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
//   }
// }


// v.1.1.4 ================================================

// v.1.1.3 ================================================
// // src/app/api/mock/categories/route.ts
// import { NextResponse } from "next/server";
// import { getAll, getMeta, upsert } from "./_store";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// export async function GET() {
//   // ส่งทั้งรายการ รวมทั้งที่ถูกซ่อนไว้ (ให้ฝั่ง UI ไปกรองเองได้)
//   return NextResponse.json(
//     { items: getAll({ includeHidden: true }), meta: getMeta() },
//     { headers: { "Cache-Control": "no-store" } }
//   );
// }

// export async function POST(req: Request) {
//   const body = await req.json().catch(() => null);
//   if (!body) {
//     return NextResponse.json({ error: "Bad payload" }, { status: 400 });
//   }
//   upsert(body); // Partial<UICategory>
//   return NextResponse.json({ ok: true });
// }

// v.1.1.3 ================================================

// v.1.1.2 ================================================
// // src/app/api/mock/categories/route.ts

// import { NextResponse } from "next/server";
// import { getAll, setVisible, remove } from "./_store";

// export const dynamic = "force-dynamic"; // กัน cache
// export const revalidate = 0;

// export async function GET() {
//   return NextResponse.json({ items: getAll() });
// }

// // PATCH visible
// export async function PATCH(req: Request) {
//   const { id, visible } = await req.json();
//   if (id === undefined || typeof visible !== "boolean") {
//     return NextResponse.json({ error: "Bad payload" }, { status: 400 });
//   }
//   setVisible(id, visible);
//   return NextResponse.json({ ok: true });
// }

// // DELETE /api/mock/categories?id=123  (ง่ายสุด)
// export async function DELETE(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const id = searchParams.get("id");
//   if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
//   remove(isNaN(Number(id)) ? id : Number(id));
//   return NextResponse.json({ ok: true });
// }

// v.1.1.2 ================================================


// // src/app/api/mock/categories/route.ts

// import { NextResponse } from "next/server";
// import { db, CategorySchema, sortByOrder } from "@/mocks/db";

// // ปิด cache เพื่อให้ลื่นเวลา dev
// export const dynamic = "force-dynamic";

// export async function GET() {
//   sortByOrder();
//   // จำลองดีเลย์ให้เหมือนจริงนิด ๆ
//   await new Promise(r => setTimeout(r, 120));
//   return NextResponse.json({ items: db.categories });
// }

// export async function POST(req: Request) {
//   const body = await req.json().catch(() => ({}));
//   // field ขั้นต่ำที่ต้องมี
//   const parsed = CategorySchema.partial({ id: true, order: true, visible: true }).safeParse(body);
//   if (!parsed.success) {
//     return NextResponse.json({ message: "Bad payload", issues: parsed.error.issues }, { status: 400 });
//   }
//   const { slug, name, image_url } = parsed.data as any;

//   const id = db.nextId++;
//   const order = db.categories.length;
//   db.categories.push({ id, slug, name, image_url, visible: true, order });

//   return NextResponse.json({ id }, { status: 201 });
// }

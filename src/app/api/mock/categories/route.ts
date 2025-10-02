// v.1.1.3 ================================================
// src/app/api/mock/categories/route.ts
import { NextResponse } from "next/server";
import { getAll, getMeta, upsert } from "./_store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  // ส่งทั้งรายการ รวมทั้งที่ถูกซ่อนไว้ (ให้ฝั่ง UI ไปกรองเองได้)
  return NextResponse.json(
    { items: getAll({ includeHidden: true }), meta: getMeta() },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }
  upsert(body); // Partial<UICategory>
  return NextResponse.json({ ok: true });
}

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

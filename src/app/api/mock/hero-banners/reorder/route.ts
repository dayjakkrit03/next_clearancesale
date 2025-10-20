// src/app/api/mock/hero-banners/reorder/route.ts
import { NextResponse } from "next/server";
import { bulkReorder } from "../_store";

export const dynamic = "force-dynamic";

type ReorderItem = { id: string; order: number };
type Body = { items: ReorderItem[] };

const toInt = (v: unknown, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : def;
};

export async function POST(req: Request) {
  let body: Body | null = null;

  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || !Array.isArray(body.items)) {
    return NextResponse.json({ message: "Body must be { items: [{id, order}, ...] }" }, { status: 400 });
  }

  // sanitize payload
  const clean = body.items
    .filter((x) => x && typeof x.id === "string" && x.id.trim().length > 0)
    .map((x) => ({ id: x.id.trim(), order: toInt(x.order, 0) }));

  if (clean.length === 0) {
    return NextResponse.json({ message: "No valid items to reorder" }, { status: 400 });
  }

  // ตรวจสอบ id ซ้ำ
  const uniq = new Set(clean.map((x) => x.id));
  if (uniq.size !== clean.length) {
    return NextResponse.json({ message: "Duplicate ids in payload" }, { status: 400 });
  }

  try {
    const updated = bulkReorder(clean);
    // ส่งลิสต์หลังจัดเรียงกลับ (เผื่อ client ใช้ sync state)
    return NextResponse.json({ items: updated }, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message ?? "Reorder failed" },
      { status: 400 }
    );
  }
}

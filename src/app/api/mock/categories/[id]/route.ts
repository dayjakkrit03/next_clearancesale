// src/app/api/mock/categories/[id]/route.ts

import { NextResponse } from "next/server";
import { db, CategorySchema, sortByOrder } from "@/mocks/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const idx = db.categories.findIndex(c => String(c.id) === String(id));
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const body = await _req.json().catch(() => ({}));
  const parsed = CategorySchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Bad payload", issues: parsed.error.issues }, { status: 400 });
  }
  db.categories[idx] = { ...db.categories[idx], ...parsed.data };
  sortByOrder();
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const before = db.categories.length;
  db.categories = db.categories.filter(c => String(c.id) !== String(id));
  if (db.categories.length === before) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  // รีออเดอร์ให้เรียง 0..N ใหม่ (optional)
  db.categories.forEach((c, i) => (c.order = i));
  return NextResponse.json({ ok: true });
}

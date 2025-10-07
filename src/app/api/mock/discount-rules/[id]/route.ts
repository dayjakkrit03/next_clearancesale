// src/app/api/mock/discount-rules/[id]/route.ts

import { NextResponse } from "next/server";
import { remove, toggleEnabled, upsert } from "../_store";
import { validateDiscountRuleInput } from "@/lib/validation/discountRule";

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

  // quick toggle
  if (body?.toggleEnabled === true) {
    toggleEnabled(id);
    return NextResponse.json({ ok: true });
  }

  try {
    const parsed = validateDiscountRuleInput(body);
    upsert({ id, ...parsed });
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

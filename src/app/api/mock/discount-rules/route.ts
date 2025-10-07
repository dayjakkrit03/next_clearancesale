// src/app/api/mock/discount-rules/route.ts

import { NextResponse } from "next/server";
import { getAll, getMeta, upsert } from "./_store";
import { validateDiscountRuleInput } from "@/lib/validation/discountRule";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(
    { items: getAll(), meta: getMeta() },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  if (!raw) return NextResponse.json({ error: "Bad payload" }, { status: 400 });

  try {
    const parsed = validateDiscountRuleInput(raw); // will throw on invalid
    const item = upsert(parsed);
    return NextResponse.json({ item }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Validation failed", message: e?.message ?? "" },
      { status: 400 }
    );
  }
}

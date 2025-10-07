// src/app/api/mock/discount-rules/meta/route.ts

import { NextResponse } from "next/server";
import { getMeta, setMeta } from "../_store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json({ meta: getMeta() }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: Request) {
  const patch = await req.json().catch(() => null);
  if (!patch) return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  setMeta(patch);
  return NextResponse.json({ ok: true });
}

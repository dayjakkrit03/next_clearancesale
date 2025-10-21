// v.1.1.2 ================================================
// src/app/api/mock/products/reorder/route.ts
import { NextResponse } from "next/server";
import { reorder } from "../_store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.orders) return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  await reorder(body.orders); // ✅ await
  return NextResponse.json({ ok: true });
}

// v.1.1.2 ================================================

// // src/app/api/mock/products/reorder/route.ts

// import { NextResponse } from "next/server";
// import { reorder } from "../_store";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// export async function POST(req: Request) {
//   const body = await req.json().catch(() => null);
//   if (!body?.orders) return NextResponse.json({ error: "Bad payload" }, { status: 400 });
//   reorder(body.orders);
//   return NextResponse.json({ ok: true });
// }

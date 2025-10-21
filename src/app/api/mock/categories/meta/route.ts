// v.1.1.2 ================================================
// src/app/api/mock/categories/meta/route.ts

import { NextResponse } from "next/server";
import { getMeta, setMeta } from "../_store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const meta = await getMeta(); // ✅ await
  return NextResponse.json(meta, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: Request) {
  const patch = await req.json().catch(() => null);
  if (!patch || typeof patch !== "object") {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  await setMeta(patch); // ✅ await
  const meta = await getMeta(); // ✅ await (อ่านผลล่าสุด)
  return NextResponse.json({ ok: true, meta });
}

// v.1.1.2 ================================================

// // src/app/api/mock/categories/meta/route.ts
// import { NextResponse } from "next/server";
// import { getMeta, setMeta } from "../_store";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// export async function GET() {
//   return NextResponse.json(getMeta(), { headers: { "Cache-Control": "no-store" } });
// }

// export async function PATCH(req: Request) {
//   const patch = await req.json().catch(() => null);
//   if (!patch || (typeof patch !== "object")) {
//     return NextResponse.json({ error: "Bad payload" }, { status: 400 });
//   }
//   // patch: Partial<{ title: string; subtitle: string }>
//   setMeta(patch);
//   return NextResponse.json({ ok: true, meta: getMeta() });
// }

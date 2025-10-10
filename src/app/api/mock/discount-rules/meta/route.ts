// v.1.1.2 =================================================
// src/app/api/mock/discount-rules/meta/route.ts

import { NextResponse } from "next/server";
import { store } from "../_store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ meta: store.meta });
}

export async function PATCH(req: Request) {
  const patch = await req.json().catch(() => ({}));
  if (typeof patch?.title === "string") store.meta.title = patch.title;
  if (typeof patch?.subtitle === "string") store.meta.subtitle = patch.subtitle;
  store.meta.updatedAt = new Date().toISOString();
  return NextResponse.json({ meta: store.meta });
}

// v.1.1.2 =================================================

// // src/app/api/mock/discount-rules/meta/route.ts

// import { NextResponse } from "next/server";
// import { getMeta, setMeta } from "../_store";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// export async function GET() {
//   return NextResponse.json({ meta: getMeta() }, { headers: { "Cache-Control": "no-store" } });
// }

// export async function PATCH(req: Request) {
//   const patch = await req.json().catch(() => null);
//   if (!patch) return NextResponse.json({ error: "Bad payload" }, { status: 400 });
//   setMeta(patch);
//   return NextResponse.json({ ok: true });
// }

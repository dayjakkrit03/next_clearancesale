// v.1.1.4 =================================================
// src/app/api/mock/discount-rules/meta/route.ts

import { NextResponse } from "next/server";
import { getRulesMeta, setRulesMeta } from "../_store";

export const dynamic = "force-dynamic";

export async function GET() {
  const meta = await getRulesMeta();
  return NextResponse.json({ meta }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: Request) {
  const patch = await req.json().catch(() => ({}));
  const meta = await setRulesMeta({
    title: typeof patch?.title === "string" ? patch.title : undefined,
    subtitle: typeof patch?.subtitle === "string" ? patch.subtitle : undefined,
  });
  return NextResponse.json({ meta }, { headers: { "Cache-Control": "no-store" } });
}

// v.1.1.4 =================================================

// v.1.1.3 =================================================
//  // src/app/api/mock/discount-rules/meta/route.ts

// import { NextResponse } from "next/server";
// import { getMeta, updateMeta } from "../_store";

// export const dynamic = "force-dynamic";

// export async function GET() {
//   try {
//     const meta = await getMeta();
//     return NextResponse.json({ meta });
//   } catch (e) {
//     console.error("Error fetching meta:", e);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// export async function PATCH(req: Request) {
//   try {
//     const patch = await req.json().catch(() => ({}));
//     const updatedMeta = await updateMeta(patch);
//     return NextResponse.json({ meta: updatedMeta });
//   } catch (e) {
//     console.error("Error updating meta:", e);
//     return NextResponse.json({ error: "Update failed" }, { status: 400 });
//   }
// }
// v.1.1.3 =================================================

// v.1.1.2 =================================================
// // src/app/api/mock/discount-rules/meta/route.ts

// import { NextResponse } from "next/server";
// import { store } from "../_store";

// export const dynamic = "force-dynamic";

// export async function GET() {
//   return NextResponse.json({ meta: store.meta });
// }

// export async function PATCH(req: Request) {
//   const patch = await req.json().catch(() => ({}));
//   if (typeof patch?.title === "string") store.meta.title = patch.title;
//   if (typeof patch?.subtitle === "string") store.meta.subtitle = patch.subtitle;
//   store.meta.updatedAt = new Date().toISOString();
//   return NextResponse.json({ meta: store.meta });
// }

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

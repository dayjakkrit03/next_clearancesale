// v.1.1.4 ==============================================
// v.DB — ใช้ _store (DB) แต่คงรูปแบบ API เดิม
import { NextResponse } from "next/server";
import {
  getAllRules,
  getRulesMeta,
  createRule,
  sanitizePatch,
} from "./_store";

export const dynamic = "force-dynamic";

export async function GET() {
  const [items, meta] = await Promise.all([getAllRules(), getRulesMeta()]);
  return NextResponse.json({ items, meta }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  try {
    const raw = await req.json().catch(() => ({}));
    const item = await createRule(sanitizePatch(raw));
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Create failed" }, { status: 400 });
  }
}

// v.1.1.4 ==============================================

// v.1.1.3 ==============================================
// // src/app/api/mock/discount-rules/route.ts

// import { NextResponse } from "next/server";
// // FIX: import sanitizePatch, createItem, getAllRules, getMeta โดยตรง
// import { 
//     store, 
//     getAllRules, 
//     getMeta, 
//     createItem, 
//     sanitizePatch 
// } from "./_store"; 

// export const dynamic = "force-dynamic";

// export async function GET() {
//   try {
//     const items = await getAllRules(); // ใช้ getAllRules ที่ export มาโดยตรง
//     const meta = await getMeta();     // ใช้ getMeta ที่ export มาโดยตรง
    
//     return NextResponse.json({ items: items, meta: meta });
//   } catch (e) {
//     console.error("Error fetching discount rules:", e);
//     return NextResponse.json({ error: "Failed to retrieve rules from database." }, { status: 500 });
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const body = await req.json().catch(() => ({}));
    
//     const item = await createItem(sanitizePatch(body)); 
    
//     return NextResponse.json({ item }, { status: 201 });
//   } catch (e) {
//     console.error("Error creating discount rule:", e);
//     return NextResponse.json({ error: "Create failed" }, { status: 400 });
//   }
// }
// v.1.1.3 ==============================================

// v.1.1.2 =============================================
// // src/app/api/mock/discount-rules/route.ts

// import { NextResponse } from "next/server";
// import { store, createItem, sanitizePatch } from "./_store";

// export const dynamic = "force-dynamic";

// export async function GET() {
//   return NextResponse.json({ items: store.items, meta: store.meta });
// }

// export async function POST(req: Request) {
//   try {
//     const body = await req.json().catch(() => ({}));
//     const item = createItem(sanitizePatch(body));
//     return NextResponse.json({ item }, { status: 201 });
//   } catch (e) {
//     return NextResponse.json({ error: "Create failed" }, { status: 400 });
//   }
// }

// v.1.1.2 =============================================

// // src/app/api/mock/discount-rules/route.ts

// import { NextResponse } from "next/server";
// import { getAll, getMeta, upsert } from "./_store";
// import { validateDiscountRuleInput } from "@/lib/validation/discountRule";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// export async function GET() {
//   return NextResponse.json(
//     { items: getAll(), meta: getMeta() },
//     { headers: { "Cache-Control": "no-store" } }
//   );
// }

// export async function POST(req: Request) {
//   const raw = await req.json().catch(() => null);
//   if (!raw) return NextResponse.json({ error: "Bad payload" }, { status: 400 });

//   try {
//     const parsed = validateDiscountRuleInput(raw); // will throw on invalid
//     const item = upsert(parsed);
//     return NextResponse.json({ item }, { status: 201 });
//   } catch (e: any) {
//     return NextResponse.json(
//       { error: "Validation failed", message: e?.message ?? "" },
//       { status: 400 }
//     );
//   }
// }

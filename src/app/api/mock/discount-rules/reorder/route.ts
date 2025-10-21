// v.1.1.4 ====================================================
// src/app/api/mock/discount-rules/reorder/route.ts

import { NextResponse } from "next/server";
import { reorderRules } from "../_store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const orders: Array<{ id: string | number; order: number }> = Array.isArray(body?.orders)
    ? body.orders
    : [];
  await reorderRules(orders);
  return NextResponse.json({ ok: true });
}

// v.1.1.4 ====================================================

// v.1.1.3 ====================================================
// // src/app/api/mock/discount-rules/reorder/route.ts

// import { NextResponse } from "next/server";
// import { reorderItems } from "../_store";

// export const dynamic = "force-dynamic";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json().catch(() => ({}));
    
//     const orders: Array<{ id: number; order: number }> = Array.isArray(body?.orders)
//       ? body.orders.map((o: any) => ({ id: Number(o.id), order: Number(o.order) }))
//       : [];
      
//     await reorderItems(orders);

//     return NextResponse.json({ ok: true });
//   } catch (e) {
//     console.error("Error reordering items:", e);
//     return NextResponse.json({ error: "Reorder failed" }, { status: 400 });
//   }
// }
// v.1.1.3 ====================================================

// v.1.1.2 ====================================================
// // src/app/api/mock/discount-rules/reorder/route.ts

// import { NextResponse } from "next/server";
// import { store, sortInPlace } from "../_store";

// export const dynamic = "force-dynamic";

// export async function POST(req: Request) {
//   const body = await req.json().catch(() => ({}));
//   const orders: Array<{ id: string | number; order: number }> = Array.isArray(body?.orders)
//     ? body.orders
//     : [];

//   const map = new Map<string, number>();
//   for (const o of orders) map.set(String(o.id), Number(o.order) || 0);

//   store.items = store.items.map((x) => ({
//     ...x,
//     order: map.has(String(x.id)) ? (map.get(String(x.id)) as number) : x.order,
//   }));
//   sortInPlace();

//   return NextResponse.json({ ok: true });
// }

// v.1.1.2 ====================================================

// // src/app/api/mock/discount-rules/reorder/route.ts

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

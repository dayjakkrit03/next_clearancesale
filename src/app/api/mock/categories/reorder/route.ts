// v.1.1.2 ================================================
// src/app/api/mock/categories/reorder/route.ts
import { NextResponse } from "next/server";
import { reorder } from "../_store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  const { orders } = await req.json();
  if (!Array.isArray(orders)) {
    return NextResponse.json({ error: "orders[] required" }, { status: 400 });
  }
  reorder(orders);
  return NextResponse.json({ ok: true });
}

// v.1.1.2 ================================================


// // src/app/api/mock/categories/reorder/route.ts

// import { NextResponse } from "next/server";
// import { db, sortByOrder } from "@/mocks/db";

// export const dynamic = "force-dynamic";

// type Payload = { orders: Array<{ id: string | number; order: number }> };

// export async function POST(req: Request) {
//   const body = (await req.json().catch(() => ({}))) as Payload;

//   if (!Array.isArray(body.orders)) {
//     return NextResponse.json({ message: "orders must be array" }, { status: 400 });
//   }

//   const map = new Map<string, number>();
//   for (const o of body.orders) {
//     if (o == null || typeof o.order !== "number") {
//       return NextResponse.json({ message: "bad item in orders" }, { status: 400 });
//     }
//     map.set(String(o.id), o.order);
//   }

//   db.categories.forEach(c => {
//     const val = map.get(String(c.id));
//     if (typeof val === "number") c.order = val;
//   });
//   sortByOrder();
//   return NextResponse.json({ ok: true });
// }

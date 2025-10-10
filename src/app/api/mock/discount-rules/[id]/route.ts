// v.1.1.2 =======================================================
// src/app/api/mock/discount-rules/[id]/route.ts

import { NextResponse } from "next/server";
import { store, sanitizePatch } from "../_store";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const idx = store.items.findIndex((x) => String(x.id) === String(id));
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));

  // shorthand toggle
  if (body?.toggleEnabled) {
    store.items[idx].enabled = !store.items[idx].enabled;
  } else {
    Object.assign(store.items[idx], sanitizePatch(body));
  }

  return NextResponse.json({ item: store.items[idx] });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const idx = store.items.findIndex((x) => String(x.id) === String(id));
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const [removed] = store.items.splice(idx, 1);
  // re-number order
  store.items = store.items.map((x, i) => ({ ...x, order: i }));
  return NextResponse.json({ ok: true, removedId: removed.id });
}

// v.1.1.2 =======================================================

// // src/app/api/mock/discount-rules/[id]/route.ts

// import { NextResponse } from "next/server";
// import { remove, toggleEnabled, upsert } from "../_store";
// import { validateDiscountRuleInput } from "@/lib/validation/discountRule";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// function parseId(param: string) {
//   return isNaN(Number(param)) ? param : Number(param);
// }

// export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
//   const { id: rawId } = await params;
//   const id = parseId(rawId);
//   const body = await req.json().catch(() => null);
//   if (!body) return NextResponse.json({ error: "Bad payload" }, { status: 400 });

//   // quick toggle
//   if (body?.toggleEnabled === true) {
//     toggleEnabled(id);
//     return NextResponse.json({ ok: true });
//   }

//   try {
//     const parsed = validateDiscountRuleInput(body);
//     upsert({ id, ...parsed });
//     return NextResponse.json({ ok: true });
//   } catch (e: any) {
//     return NextResponse.json(
//       { error: "Validation failed", message: e?.message ?? "" },
//       { status: 400 }
//     );
//   }
// }

// export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
//   const { id: rawId } = await params;
//   const id = parseId(rawId);
//   remove(id);
//   return NextResponse.json({ ok: true });
// }

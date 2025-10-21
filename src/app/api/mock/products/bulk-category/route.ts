// v.1.1.2 ================================================
// src/app/api/mock/products/bulk-category/route.ts
import { NextResponse } from "next/server";
import { upsert, getById } from "../_store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type IdLike = string | number;
type RawOp = { id: IdLike; category_id?: IdLike | null | "" };
type Op = { id: IdLike; category_id?: IdLike };

function coerceId(v: any): IdLike {
  return isNaN(Number(v)) ? String(v) : Number(v);
}
function normalizeCategoryId(v: any): IdLike | undefined {
  if (v === null || v === "" || typeof v === "undefined") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : String(v);
}

export async function POST(req: Request) {
  let body: any = null;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let rawOps: RawOp[] = [];

  if (Array.isArray(body?.ids)) {
    rawOps = body.ids.map((id: any) => ({ id: coerceId(id), category_id: body?.category_id }));
  } else if (Array.isArray(body?.operations)) {
    rawOps = body.operations.map((o: any) => ({ id: coerceId(o?.id), category_id: o?.category_id }));
  } else {
    return NextResponse.json(
      { error: "Missing 'ids' or 'operations'. Use { ids: [...], category_id } or { operations: [{ id, category_id }, ...] }" },
      { status: 400 }
    );
  }

  const ops: Op[] = rawOps.map(({ id, category_id }) => ({ id, category_id: normalizeCategoryId(category_id) }));
  if (ops.length === 0) return NextResponse.json({ error: "No operations to perform" }, { status: 400 });

  const results: Array<{ id: IdLike; ok: boolean; reason?: string }> = [];

  for (const { id, category_id } of ops) {
    try {
      const exists = await getById(id);        // ✅ await
      if (!exists) { results.push({ id, ok: false, reason: "product_not_found" }); continue; }
      await upsert({ id, category_id });       // ✅ await
      results.push({ id, ok: true });
    } catch (e: any) {
      results.push({ id, ok: false, reason: e?.message ?? "update_failed" });
    }
  }

  const updated = results.filter((r) => r.ok).length;
  return NextResponse.json({ ok: true, updated, total: ops.length, results }, { status: 200 });
}

// v.1.1.2 ================================================

// // src/app/api/mock/products/bulk-category/route.ts
// import { NextResponse } from "next/server";
// import { upsert, getById } from "../_store";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// type IdLike = string | number;

// // รูปแบบ payload ที่ client ส่งมา (ยังอนุญาต null/"")
// type RawOp = { id: IdLike; category_id?: IdLike | null | "" };

// // หลัง normalize แล้ว ห้ามมี null
// type Op = { id: IdLike; category_id?: IdLike };

// // utils
// function coerceId(v: any): IdLike {
//   return isNaN(Number(v)) ? String(v) : Number(v);
// }
// function normalizeCategoryId(v: any): IdLike | undefined {
//   if (v === null || v === "" || typeof v === "undefined") return undefined;
//   const n = Number(v);
//   return Number.isFinite(n) ? n : String(v);
// }

// export async function POST(req: Request) {
//   let body: any = null;
//   try {
//     body = await req.json();
//   } catch {
//     return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
//   }

//   let rawOps: RawOp[] = [];

//   // รูปแบบ A: { ids: [...], category_id }
//   if (Array.isArray(body?.ids)) {
//     rawOps = body.ids.map((id: any) => ({
//       id: coerceId(id),
//       category_id: body?.category_id,
//     }));
//   }
//   // รูปแบบ B: { operations: [{ id, category_id }, ...] }
//   else if (Array.isArray(body?.operations)) {
//     rawOps = body.operations.map((o: any) => ({
//       id: coerceId(o?.id),
//       category_id: o?.category_id,
//     }));
//   } else {
//     return NextResponse.json(
//       {
//         error:
//           "Missing 'ids' or 'operations'. Use { ids: [...], category_id } or { operations: [{ id, category_id }, ...] }",
//       },
//       { status: 400 }
//     );
//   }

//   // ✅ normalize: ตัด null/"", แปลง string-เลขเป็น number
//   const ops: Op[] = rawOps.map(({ id, category_id }) => ({
//     id,
//     category_id: normalizeCategoryId(category_id),
//   }));

//   if (ops.length === 0) {
//     return NextResponse.json({ error: "No operations to perform" }, { status: 400 });
//   }

//   const results: Array<{ id: IdLike; ok: boolean; reason?: string }> = [];

//   for (const { id, category_id } of ops) {
//     try {
//       const exists = getById(id);
//       if (!exists) {
//         results.push({ id, ok: false, reason: "product_not_found" });
//         continue;
//       }
//       // 🔧 ตอนนี้ category_id เป็น string | number | undefined แล้ว (ไม่มี null)
//       upsert({ id, category_id });
//       results.push({ id, ok: true });
//     } catch (e: any) {
//       results.push({ id, ok: false, reason: e?.message ?? "update_failed" });
//     }
//   }

//   const updated = results.filter((r) => r.ok).length;

//   return NextResponse.json(
//     {
//       ok: true,
//       updated,
//       total: ops.length,
//       results,
//     },
//     { status: 200 }
//   );
// }

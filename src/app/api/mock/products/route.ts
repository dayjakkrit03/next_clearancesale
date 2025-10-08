// v.1.1.4 ==============================================
// src/app/api/mock/products/route.ts

import { NextResponse } from "next/server";
import { getAll, getMeta, upsert } from "./_store";
import { validateProductInput } from "@/lib/validation/product";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** helper: normalize text for case/diacritics-insensitive search */
function norm(text?: string) {
  return (text ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** GET /api/mock/products
 *  query:
 *   - q: string (ค้นหา name/brand/sku)
 *   - categoryId: string|number
 *   - sort: "order" | "price" | "name"
 *   - order: "asc" | "desc"
 *   - page: number (>=1)
 *   - pageSize: number (>=1)
 *   - includeHidden: "1" | "0"
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sp = url.searchParams;

  const q = sp.get("q")?.trim() ?? "";
  const categoryIdParam = sp.get("categoryId");
  const sort = (sp.get("sort") as "order" | "price" | "name") ?? "order";
  const order = (sp.get("order") as "asc" | "desc") ?? "asc";
  const page = Math.max(1, Number(sp.get("page") ?? 1) || 1);
  const pageSize = Math.max(1, Number(sp.get("pageSize") ?? 24) || 24);
  const includeHidden = !["0", "false"].includes((sp.get("includeHidden") ?? "1").toLowerCase());

  // ดึงทั้งหมดมาก่อน แล้วค่อย filter เอง (เพื่อให้เลือก includeHidden ได้ยืดหยุ่น)
  let list = getAll({ includeHidden: true });

  // filter: visible
  if (!includeHidden) {
    list = list.filter((x) => x.visible !== false);
  }

  // filter: คำค้นชื่อ/แบรนด์/SKU
  if (q) {
    const kw = norm(q);
    list = list.filter((p) => {
      const bucket = [p.name, p.brand ?? "", p.sku ?? ""].map(norm).join(" ");
      return bucket.includes(kw);
    });
  }

  // filter: หมวดหมู่
  if (categoryIdParam && categoryIdParam !== "") {
    list = list.filter((p) => String(p.category_id ?? "") === categoryIdParam);
  }

  // sort
  list.sort((a, b) => {
    let va: any;
    let vb: any;
    if (sort === "price") {
      va = a.price ?? 0;
      vb = b.price ?? 0;
    } else if (sort === "name") {
      va = (a.name ?? "").toString().toLowerCase();
      vb = (b.name ?? "").toString().toLowerCase();
    } else {
      // "order" (fallback)
      va = a.order ?? 0;
      vb = b.order ?? 0;
    }
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return order === "desc" ? -cmp : cmp;
  });

  // paginate
  const total = list.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = list.slice(start, end);

  return NextResponse.json(
    {
      items,
      total,
      page,
      pageSize,
      meta: getMeta(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  if (!raw) {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  try {
    // ตรวจคอร์ฟิลด์ (name, price, discountPercent, image_url, brand, sku)
    const base = validateProductInput(raw);

    // แปลง/ทำความสะอาดฟิลด์เสริม
    const num = (v: any) => (v === "" || v == null ? undefined : Number(v));
    const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

    const ratingRaw = num(raw.rating);
    const reviewsRaw = num(raw.reviews);

    const payload = {
      ...base,
      // อนุญาต type เป็น string|number
      category_id: raw.category_id === "" || raw.category_id == null ? undefined : raw.category_id,
      uom: typeof raw.uom === "string" ? raw.uom.trim() || undefined : undefined,
      rating:
        typeof ratingRaw === "number" && Number.isFinite(ratingRaw)
          ? clamp(Number(ratingRaw.toFixed(1)), 0, 5)
          : undefined,
      reviews:
        typeof reviewsRaw === "number" && Number.isFinite(reviewsRaw)
          ? Math.max(0, Math.floor(reviewsRaw))
          : undefined,
      // visible ถ้าไม่ส่งมาจะ default false ตอน create
      visible: typeof raw.visible === "boolean" ? raw.visible : false,
    };

    const item = upsert(payload as any);
    return NextResponse.json({ item }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Validation failed", message: e?.message ?? "" },
      { status: 400 }
    );
  }
}

// v.1.1.4 ==============================================

// v.1.1.3 ==============================================
// // src/app/api/mock/products/route.ts

// import { NextResponse } from "next/server";
// import { getAll, getMeta, upsert, queryProducts } from "./_store";
// import { validateProductInput } from "@/lib/validation/product";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// export async function GET(req: Request) {
//   const url = new URL(req.url);
//   const sp = url.searchParams;

//   // มีพารามิเตอร์ค้นหา/แบ่งหน้าไหม?
//   const hasQueryParams =
//     sp.has("q") ||
//     sp.has("category_id") ||
//     sp.has("visible") ||
//     sp.has("sort") ||
//     sp.has("page") ||
//     sp.has("pageSize");

//   // ถ้าไม่มีพารามิเตอร์เลย -> คงพฤติกรรมเดิม เพื่อเข้ากันได้ย้อนหลัง
//   if (!hasQueryParams) {
//     return NextResponse.json(
//       { items: getAll({ includeHidden: true }), meta: getMeta() },
//       { headers: { "Cache-Control": "no-store" } }
//     );
//   }

//   // มีพารามิเตอร์ -> ใช้ queryProducts()
//   const q = sp.get("q") ?? undefined;

//   // แปลง category_id เป็น number ถ้าเป็นตัวเลขล้วน มิฉะนั้นเก็บเป็น string
//   const rawCid = sp.get("category_id");
//   const category_id =
//     rawCid == null || rawCid === ""
//       ? undefined
//       : /^\d+$/.test(rawCid)
//       ? Number(rawCid)
//       : rawCid;

//   // visible = true/false
//   const rawVisible = sp.get("visible");
//   const visible =
//     rawVisible == null
//       ? undefined
//       : rawVisible === "true"
//       ? true
//       : rawVisible === "false"
//       ? false
//       : undefined;

//   // sort ที่ยอมรับ
//   const sortAllowed = new Set([
//     "order",
//     "newest",
//     "price_asc",
//     "price_desc",
//     "discount_desc",
//     "rating_desc",
//   ]);
//   const rawSort = sp.get("sort") ?? undefined;
//   const sort = rawSort && sortAllowed.has(rawSort) ? (rawSort as any) : undefined;

//   // page/pageSize
//   const page = sp.get("page") ? Math.max(1, Number(sp.get("page"))) : 1;
//   const pageSize = sp.get("pageSize") ? Math.max(1, Number(sp.get("pageSize"))) : 24;

//   const result = queryProducts({ q, category_id, visible, sort, page, pageSize });

//   return NextResponse.json(
//     {
//       ...result,      // { items, total, page, pageSize }
//       meta: getMeta()
//     },
//     { headers: { "Cache-Control": "no-store" } }
//   );
// }

// export async function POST(req: Request) {
//   const raw = await req.json().catch(() => null);
//   if (!raw) {
//     return NextResponse.json({ error: "Bad payload" }, { status: 400 });
//   }

//   try {
//     // ตรวจคอร์ฟิลด์ (name, price, discountPercent, image_url, brand, sku)
//     const base = validateProductInput(raw);

//     // แปลง/ทำความสะอาดฟิลด์เสริม
//     const num = (v: any) => (v === "" || v == null ? undefined : Number(v));
//     const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

//     const ratingRaw = num(raw.rating);
//     const reviewsRaw = num(raw.reviews);

//     const payload = {
//       ...base,
//       // อนุญาต type เป็น string|number
//       category_id:
//         raw.category_id === "" || raw.category_id == null ? undefined : raw.category_id,
//       uom:
//         typeof raw.uom === "string" ? raw.uom.trim() || undefined : undefined,
//       rating:
//         typeof ratingRaw === "number" && Number.isFinite(ratingRaw)
//           ? clamp(Number(ratingRaw.toFixed(1)), 0, 5)
//           : undefined,
//       reviews:
//         typeof reviewsRaw === "number" && Number.isFinite(reviewsRaw)
//           ? Math.max(0, Math.floor(reviewsRaw))
//           : undefined,
//       // visible ใส่มาได้ (ไม่บังคับ) — ถ้าไม่ส่งมาจะให้ false ตอน create ตาม UI
//       visible: typeof raw.visible === "boolean" ? raw.visible : false,
//     };

//     const item = upsert(payload as any);
//     return NextResponse.json({ item }, { status: 201 });
//   } catch (e: any) {
//     return NextResponse.json(
//       { error: "Validation failed", message: e?.message ?? "" },
//       { status: 400 }
//     );
//   }
// }

// v.1.1.3 ==============================================

// v.1.1.2 ==============================================
// // src/app/api/mock/products/route.ts

// import { NextResponse } from "next/server";
// import { getAll, getMeta, upsert } from "./_store";
// import { validateProductInput } from "@/lib/validation/product";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// export async function GET() {
//   return NextResponse.json(
//     { items: getAll({ includeHidden: true }), meta: getMeta() },
//     { headers: { "Cache-Control": "no-store" } }
//   );
// }

// export async function POST(req: Request) {
//   const raw = await req.json().catch(() => null);
//   if (!raw) {
//     return NextResponse.json({ error: "Bad payload" }, { status: 400 });
//   }

//   try {
//     // ตรวจคอร์ฟิลด์ (name, price, discountPercent, image_url, brand, sku)
//     const base = validateProductInput(raw);

//     // แปลง/ทำความสะอาดฟิลด์เสริม
//     const num = (v: any) => (v === "" || v == null ? undefined : Number(v));
//     const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

//     const ratingRaw = num(raw.rating);
//     const reviewsRaw = num(raw.reviews);

//     const payload = {
//       ...base,
//       // อนุญาต type เป็น string|number
//       category_id:
//         raw.category_id === "" || raw.category_id == null ? undefined : raw.category_id,
//       uom:
//         typeof raw.uom === "string" ? raw.uom.trim() || undefined : undefined,
//       rating:
//         typeof ratingRaw === "number" && Number.isFinite(ratingRaw)
//           ? clamp(Number(ratingRaw.toFixed(1)), 0, 5)
//           : undefined,
//       reviews:
//         typeof reviewsRaw === "number" && Number.isFinite(reviewsRaw)
//           ? Math.max(0, Math.floor(reviewsRaw))
//           : undefined,
//       // visible ใส่มาได้ (ไม่บังคับ) — ถ้าไม่ส่งมาจะให้ false ตอน create ตาม UI
//       visible: typeof raw.visible === "boolean" ? raw.visible : false,
//     };

//     const item = upsert(payload as any);
//     return NextResponse.json({ item }, { status: 201 });
//   } catch (e: any) {
//     return NextResponse.json(
//       { error: "Validation failed", message: e?.message ?? "" },
//       { status: 400 }
//     );
//   }
// }

// v.1.1.2 ==============================================

// // src/app/api/mock/products/route.ts

// import { NextResponse } from "next/server";
// import { getAll, getMeta, upsert } from "./_store";
// import { validateProductInput } from "@/lib/validation/product";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// export async function GET() {
//   return NextResponse.json(
//     { items: getAll({ includeHidden: true }), meta: getMeta() },
//     { headers: { "Cache-Control": "no-store" } }
//   );
// }

// export async function POST(req: Request) {
//   const raw = await req.json().catch(() => null);
//   if (!raw) return NextResponse.json({ error: "Bad payload" }, { status: 400 });

//   try {
//     const parsed = validateProductInput(raw);
//     const item = upsert(parsed);
//     return NextResponse.json({ item }, { status: 201 });
//   } catch (e: any) {
//     return NextResponse.json({ error: "Validation failed", message: e?.message ?? "" }, { status: 400 });
//   }
// }

// v.1.1.10 =========================================
// src/app/api/mock/products/route.ts
import { NextResponse } from "next/server";
import {
  getMeta,
  upsert,
  queryProducts,
  getAll as getAllProducts,
} from "./_store";
import {
  getAll as getAllCategories,
  type UICategory,
} from "../categories/_store";
import { validateProductInput } from "@/lib/validation/product";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** helper: coerce numeric string → number */
function coerceId(v: string | null): string | number | undefined {
  if (v == null || v === "") return undefined;
  return isNaN(Number(v)) ? v : Number(v);
}

/** normalize text (case/diacritics-insensitive) */
function norm(text?: string) {
  return (text ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** map UI sort params → store sort keys (เดิม) */
function mapSort(
  sortIn: string | null,
  orderIn: string | null
): Parameters<typeof queryProducts>[0]["sort"] {
  const s = (sortIn ?? "order").toLowerCase();
  const o = (orderIn ?? "asc").toLowerCase();
  if (s === "price") return o === "desc" ? "price_desc" : "price_asc";
  if (
    s === "order" ||
    s === "newest" ||
    s === "price_asc" ||
    s === "price_desc" ||
    s === "discount_desc" ||
    s === "rating_desc"
  ) {
    return s as any;
  }
  return "order";
}

/** local sort (mirror ของ store สำหรับเส้นทาง q) */
function applySortLocal(
  list: any[],
  sort: Parameters<typeof queryProducts>[0]["sort"]
) {
  const s = sort ?? "order";
  const arr = [...list];
  switch (s) {
    case "price_asc":
      return arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    case "price_desc":
      return arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    case "discount_desc":
      return arr.sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
    case "rating_desc":
      return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "newest":
      // เหมือน mock เดิม: ใช้ id แทน createdAt
      return arr.sort((a, b) => {
        const an = typeof a.id === "number" ? a.id : 0;
        const bn = typeof b.id === "number" ? b.id : 0;
        return bn - an;
      });
    case "order":
    default:
      return arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
}

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;

  const qRaw = sp.get("q") ?? undefined;
  const q = qRaw?.trim() ? qRaw.trim() : undefined;

  // รองรับทั้ง category_id และ categoryId
  const category_id =
    coerceId(sp.get("category_id")) ?? coerceId(sp.get("categoryId"));

  // visible (ไม่ส่ง = undefined)
  const visibleStr = (sp.get("visible") ?? "").toLowerCase();
  const visible =
    visibleStr === "true" ? true : visibleStr === "false" ? false : undefined;

  const sort = mapSort(sp.get("sort"), sp.get("order"));
  const page = Math.max(1, Number(sp.get("page") ?? 1) || 1);
  const pageSize = Math.max(1, Number(sp.get("pageSize") ?? 24) || 24);

  const ensureArray = (v: unknown) => (Array.isArray(v) ? v : []);

  // ไม่มี q → ให้ชั้น store/db จัดการ (พฤติกรรมเดิม)
  if (!q) {
    const result = await queryProducts({
      q,
      category_id,
      visible,
      sort,
      page,
      pageSize,
    });
    const meta = await getMeta();
    return NextResponse.json(
      { ...result, items: ensureArray(result.items), meta },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  // ===== มี q: ให้พฤติกรรมเดิม (ค้นชื่อ/แบรนด์/SKU + ขยาย “ชื่อหมวด”) ฝั่ง route =====
  // 1) หา category ids ที่ชื่อแมตช์ q
  const categories: UICategory[] = await getAllCategories({ includeHidden: true });
  const qn = norm(q);
  const catNameById = new Map(categories.map((c) => [c.id, norm(c.name)]));
  const matchedCatIds = new Set(
    [...catNameById.entries()]
      .filter(([, name]) => name.includes(qn))
      .map(([id]) => id),
  );

  // 2) โหลดสินค้าทั้งหมดแล้วกรองด้วย (ชื่อ/แบรนด์/SKU) OR (ชื่อหมวด)
  let list = await getAllProducts({ includeHidden: true });

  // ฟิลเตอร์ visible
  if (typeof visible === "boolean") {
    list = list.filter((x) => (x.visible ?? true) === visible);
  }

  // ฟิลเตอร์ category_id พารามิเตอร์ (ถ้าส่งมา)
  if (typeof category_id !== "undefined") {
    list = list.filter((x) => String(x.category_id) === String(category_id));
  }

  // ฟิลเตอร์ q: แมตช์ชื่อ/แบรนด์/SKU หรือชื่อหมวด
  list = list.filter((p) => {
    const textBucket = norm(`${p.name ?? ""} ${p.brand ?? ""} ${p.sku ?? ""}`);
    const matchText = textBucket.includes(qn);
    const matchCat =
      p.category_id != null &&
      matchedCatIds.size > 0 &&
      matchedCatIds.has(p.category_id as any);
    return matchText || matchCat;
  });

  // 3) sort + paginate (พฤติกรรมเดิม)
  list = applySortLocal(list, sort);
  const total = list.length;
  const start = (page - 1) * pageSize;
  const items = list.slice(start, start + pageSize);

  const meta = await getMeta();
  return NextResponse.json(
    { items, total, page, pageSize, meta },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  if (!raw) return NextResponse.json({ error: "Bad payload" }, { status: 400 });

  try {
    const base = validateProductInput(raw);
    const num = (v: any) => (v === "" || v == null ? undefined : Number(v));
    const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
    const ratingRaw = num(raw.rating);
    const reviewsRaw = num(raw.reviews);

    const payload = {
      ...base,
      category_id:
        raw.category_id === "" || raw.category_id == null
          ? undefined
          : raw.category_id,
      uom: typeof raw.uom === "string" ? raw.uom.trim() || undefined : undefined,
      rating:
        typeof ratingRaw === "number" && Number.isFinite(ratingRaw)
          ? clamp(Number(ratingRaw.toFixed(1)), 0, 5)
          : undefined,
      reviews:
        typeof reviewsRaw === "number" && Number.isFinite(reviewsRaw)
          ? Math.max(0, Math.floor(reviewsRaw))
          : undefined,
      visible: typeof raw.visible === "boolean" ? raw.visible : false,
    };

    // ชั้น _store ฝั่ง DB ต้องรองรับ upsert(payload) เหมือนเดิม
    const item = await upsert(payload as any);
    return NextResponse.json({ item }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Validation failed", message: e?.message ?? "" },
      { status: 400 }
    );
  }
}

// v.1.1.10 =========================================

// v.1.1.9 ==========================================
// // src/app/api/mock/products/route.ts
// import { NextResponse } from "next/server";
// import {
//   getMeta,
//   upsert,
//   queryProducts,
//   getAll as getAllProducts,
// } from "./_store";
// import {
//   getAll as getAllCategories,
//   type UICategory,
// } from "../categories/_store";
// import { validateProductInput } from "@/lib/validation/product";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// function coerceId(v: string | null): string | number | undefined {
//   if (v == null || v === "") return undefined;
//   return isNaN(Number(v)) ? v : Number(v);
// }

// function norm(text?: string) {
//   return (text ?? "")
//     .toString()
//     .toLowerCase()
//     .normalize("NFKD")
//     .replace(/[\u0300-\u036f]/g, "");
// }

// function mapSort(
//   sortIn: string | null,
//   orderIn: string | null
// ): Parameters<typeof queryProducts>[0]["sort"] {
//   const s = (sortIn ?? "order").toLowerCase();
//   const o = (orderIn ?? "asc").toLowerCase();
//   if (s === "price") return o === "desc" ? "price_desc" : "price_asc";
//   if (["order", "newest", "price_asc", "price_desc", "discount_desc", "rating_desc"].includes(s))
//     return s as any;
//   return "order";
// }


// export async function GET(req: Request) {
//   const sp = new URL(req.url).searchParams;

//   const qRaw = sp.get("q") ?? undefined;
//   const q = qRaw?.trim() ? qRaw.trim() : undefined;

//   const category_id =
//     coerceId(sp.get("category_id")) ?? coerceId(sp.get("categoryId"));

//   const visibleStr = (sp.get("visible") ?? "").toLowerCase();
//   const visible =
//     visibleStr === "true" ? true : visibleStr === "false" ? false : undefined;

//   const sort = mapSort(sp.get("sort"), sp.get("order"));
//   const page = Math.max(1, Number(sp.get("page") ?? 1) || 1);
//   const pageSize = Math.max(1, Number(sp.get("pageSize") ?? 24) || 24);

//   // กันพลาด: ให้ items เป็น array เสมอ
//   const ensureArray = (v: unknown) => (Array.isArray(v) ? v : []);

//   if (!q) {
//     const result = await queryProducts({
//       q,
//       category_id,
//       visible,
//       sort,
//       page,
//       pageSize,
//     });
//     const meta = await getMeta();
//     return NextResponse.json(
//       { ...result, items: ensureArray(result.items), meta },
//       { headers: { "Cache-Control": "no-store" } }
//     );
//   }

//   // มี q → รวมชื่อหมวด
//   const categories: UICategory[] = await getAllCategories({ includeHidden: true });
//   const qn = norm(q);
//   const matchedCatIds = categories
//     .filter((c) => norm(c.name).includes(qn))
//     .map((c) => c.id);

//   const result = await queryProducts({
//     q,
//     category_id,
//     visible,
//     sort,
//     page,
//     pageSize,
//     matchCategoryIds: matchedCatIds,
//   });
//   const meta = await getMeta();

//   return NextResponse.json(
//     { ...result, items: ensureArray(result.items), meta },
//     { headers: { "Cache-Control": "no-store" } }
//   );
// }


// export async function POST(req: Request) {
//   const raw = await req.json().catch(() => null);
//   if (!raw) return NextResponse.json({ error: "Bad payload" }, { status: 400 });

//   try {
//     const base = validateProductInput(raw);
//     const num = (v: any) => (v === "" || v == null ? undefined : Number(v));
//     const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
//     const ratingRaw = num(raw.rating);
//     const reviewsRaw = num(raw.reviews);

//     const payload = {
//       ...base,
//       category_id:
//         raw.category_id === "" || raw.category_id == null
//           ? undefined
//           : raw.category_id,
//       uom: typeof raw.uom === "string" ? raw.uom.trim() || undefined : undefined,
//       rating:
//         typeof ratingRaw === "number" && Number.isFinite(ratingRaw)
//           ? clamp(Number(ratingRaw.toFixed(1)), 0, 5)
//           : undefined,
//       reviews:
//         typeof reviewsRaw === "number" && Number.isFinite(reviewsRaw)
//           ? Math.max(0, Math.floor(reviewsRaw))
//           : undefined,
//       visible: typeof raw.visible === "boolean" ? raw.visible : false,
//     };

//     const item = await upsert(payload as any); // ✅ await
//     return NextResponse.json({ item }, { status: 201 });
//   } catch (e: any) {
//     return NextResponse.json(
//       { error: "Validation failed", message: e?.message ?? "" },
//       { status: 400 }
//     );
//   }
// }

// v.1.1.9 ==========================================

// v.1.1.8 ===========================================
// // src/app/api/mock/products/route.ts
// import { NextResponse } from "next/server";
// import {
//   getMeta,
//   upsert,
//   queryProducts,
//   getAll as getAllProducts,
// } from "./_store"; // ← ยังเป็น mock (sync) อยู่
// import {
//   getAll as getAllCategories,
//   type UICategory,
// } from "../categories/_store"; // ← async แล้ว ต้อง await
// import { validateProductInput } from "@/lib/validation/product";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// /** helper: coerce numeric string → number */
// function coerceId(v: string | null): string | number | undefined {
//   if (v == null || v === "") return undefined;
//   return isNaN(Number(v)) ? v : Number(v);
// }

// /** normalize text (case/diacritics-insensitive) */
// function norm(text?: string) {
//   return (text ?? "")
//     .toString()
//     .toLowerCase()
//     .normalize("NFKD")
//     .replace(/[\u0300-\u036f]/g, "");
// }

// /** helper: map legacy sort params to store sort keys */
// function mapSort(
//   sortIn: string | null,
//   orderIn: string | null
// ): Parameters<typeof queryProducts>[0]["sort"] {
//   const s = (sortIn ?? "order").toLowerCase();
//   const o = (orderIn ?? "asc").toLowerCase();

//   if (s === "price") return o === "desc" ? "price_desc" : "price_asc";
//   if (
//     s === "order" ||
//     s === "newest" ||
//     s === "price_asc" ||
//     s === "price_desc" ||
//     s === "discount_desc" ||
//     s === "rating_desc"
//   ) {
//     return s as any;
//   }
//   return "order";
// }

// /** local sort (mirror of store's applySort) */
// function applySortLocal(
//   list: any[],
//   sort: Parameters<typeof queryProducts>[0]["sort"]
// ) {
//   const s = sort ?? "order";
//   const arr = [...list];
//   switch (s) {
//     case "price_asc":
//       return arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
//     case "price_desc":
//       return arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
//     case "discount_desc":
//       return arr.sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
//     case "rating_desc":
//       return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
//     case "newest":
//       return arr.sort((a, b) => {
//         const an = typeof a.id === "number" ? a.id : 0;
//         const bn = typeof b.id === "number" ? b.id : 0;
//         return bn - an;
//       });
//     case "order":
//     default:
//       return arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
//   }
// }

// /**
//  * GET /api/mock/products
//  * Query:
//  *   - q
//  *   - category_id (หรือ categoryId)
//  *   - visible: "true" | "false"
//  *   - sort: order | newest | price_asc | price_desc | discount_desc | rating_desc
//  *     (หรือ legacy: sort=price + order=asc|desc)
//  *   - page, pageSize
//  */
// export async function GET(req: Request) {
//   const sp = new URL(req.url).searchParams;

//   const qRaw = sp.get("q") ?? undefined;
//   const q = qRaw?.trim() ? qRaw.trim() : undefined;

//   // รองรับทั้ง category_id และ categoryId
//   const category_id =
//     coerceId(sp.get("category_id")) ?? coerceId(sp.get("categoryId"));

//   // visible (ไม่ส่ง = undefined)
//   const visibleStr = (sp.get("visible") ?? "").toLowerCase();
//   const visible =
//     visibleStr === "true" ? true : visibleStr === "false" ? false : undefined;

//   const sort = mapSort(sp.get("sort"), sp.get("order"));
//   const page = Math.max(1, Number(sp.get("page") ?? 1) || 1);
//   const pageSize = Math.max(1, Number(sp.get("pageSize") ?? 24) || 24);

//   // ถ้าไม่มี q → ใช้ queryProducts ปกติ (เร็วและตรงกับ store)
//   if (!q) {
//     const { items, total, page: p, pageSize: ps } = queryProducts({
//       q,
//       category_id,
//       visible,
//       sort,
//       page,
//       pageSize,
//     });
//     return NextResponse.json(
//       { items, total, page: p, pageSize: ps, meta: getMeta() },
//       { headers: { "Cache-Control": "no-store" } }
//     );
//   }

//   // ===== มี q: ขยายให้ค้นหา "ชื่อหมวดหมู่" ได้ด้วย =====
//   // 1) โหลดหมวดหมู่ (ต้อง await เพราะ getAllCategories เป็น async แล้ว)
//   const categories: UICategory[] = await getAllCategories({ includeHidden: true });

//   const catNameById = new Map<string | number, string>(
//     categories.map((c: UICategory) => [c.id, norm(c.name)])
//   );
//   const qn = norm(q);

//   const matchedCatIds = new Set<string | number>(
//     [...catNameById.entries()]
//       .filter(([, name]) => name.includes(qn))
//       .map(([id]) => id)
//   );

//   // 2) โหลดสินค้าทั้งหมด แล้วกรองด้วย (ชื่อ/แบรนด์/SKU) OR (category name)
//   let list = getAllProducts({ includeHidden: true });

//   // ฟิลเตอร์ visible
//   if (typeof visible === "boolean") {
//     list = list.filter((x) => (x.visible ?? true) === visible);
//   }

//   // ฟิลเตอร์ category_id พารามิเตอร์ (ถ้าส่งมา)
//   if (typeof category_id !== "undefined") {
//     list = list.filter((x) => String(x.category_id) === String(category_id));
//   }

//   // ฟิลเตอร์ q: แมตช์ชื่อ/แบรนด์/SKU หรือชื่อหมวด
//   list = list.filter((p) => {
//     const textBucket = norm(`${p.name ?? ""} ${p.brand ?? ""} ${p.sku ?? ""}`);
//     const matchText = textBucket.includes(qn);
//     const matchCat =
//       p.category_id != null &&
//       matchedCatIds.size > 0 &&
//       matchedCatIds.has(p.category_id as any);
//     return matchText || matchCat;
//   });

//   // 3) sort + paginate
//   list = applySortLocal(list, sort);
//   const total = list.length;
//   const start = (page - 1) * pageSize;
//   const items = list.slice(start, start + pageSize);

//   return NextResponse.json(
//     { items, total, page, pageSize, meta: getMeta() },
//     { headers: { "Cache-Control": "no-store" } }
//   );
// }

// export async function POST(req: Request) {
//   const raw = await req.json().catch(() => null);
//   if (!raw) {
//     return NextResponse.json({ error: "Bad payload" }, { status: 400 });
//   }

//   try {
//     const base = validateProductInput(raw);

//     const num = (v: any) => (v === "" || v == null ? undefined : Number(v));
//     const clamp = (v: number, lo: number, hi: number) =>
//       Math.min(hi, Math.max(lo, v));

//     const ratingRaw = num(raw.rating);
//     const reviewsRaw = num(raw.reviews);

//     const payload = {
//       ...base,
//       category_id:
//         raw.category_id === "" || raw.category_id == null
//           ? undefined
//           : raw.category_id,
//       uom: typeof raw.uom === "string" ? raw.uom.trim() || undefined : undefined,
//       rating:
//         typeof ratingRaw === "number" && Number.isFinite(ratingRaw)
//           ? clamp(Number(ratingRaw.toFixed(1)), 0, 5)
//           : undefined,
//       reviews:
//         typeof reviewsRaw === "number" && Number.isFinite(reviewsRaw)
//           ? Math.max(0, Math.floor(reviewsRaw))
//           : undefined,
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

// v.1.1.8 ===========================================

// v.1.1.7 ============================================
// // src/app/api/mock/products/route.ts
// import { NextResponse } from "next/server";
// import { getMeta, upsert, queryProducts, getAll as getAllProducts } from "./_store"; // ← เพิ่ม getAll
// import { getAll as getAllCategories } from "../categories/_store"; // ← ใช้ชื่อหมวด
// import { validateProductInput } from "@/lib/validation/product";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// /** helper: coerce numeric string → number */
// function coerceId(v: string | null): string | number | undefined {
//   if (v == null || v === "") return undefined;
//   return isNaN(Number(v)) ? v : Number(v);
// }

// /** normalize text (case/diacritics-insensitive) */
// function norm(text?: string) {
//   return (text ?? "")
//     .toString()
//     .toLowerCase()
//     .normalize("NFKD")
//     .replace(/[\u0300-\u036f]/g, "");
// }

// /** helper: map legacy sort params to store sort keys */
// function mapSort(
//   sortIn: string | null,
//   orderIn: string | null
// ): Parameters<typeof queryProducts>[0]["sort"] {
//   const s = (sortIn ?? "order").toLowerCase();
//   const o = (orderIn ?? "asc").toLowerCase();

//   if (s === "price") return o === "desc" ? "price_desc" : "price_asc";
//   if (
//     s === "order" ||
//     s === "newest" ||
//     s === "price_asc" ||
//     s === "price_desc" ||
//     s === "discount_desc" ||
//     s === "rating_desc"
//   ) {
//     return s as any;
//   }
//   return "order";
// }

// /** local sort (mirror of store's applySort) */
// function applySortLocal(
//   list: any[],
//   sort: Parameters<typeof queryProducts>[0]["sort"]
// ) {
//   const s = sort ?? "order";
//   const arr = [...list];
//   switch (s) {
//     case "price_asc":
//       return arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
//     case "price_desc":
//       return arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
//     case "discount_desc":
//       return arr.sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
//     case "rating_desc":
//       return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
//     case "newest":
//       return arr.sort((a, b) => {
//         const an = typeof a.id === "number" ? a.id : 0;
//         const bn = typeof b.id === "number" ? b.id : 0;
//         return bn - an;
//       });
//     case "order":
//     default:
//       return arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
//   }
// }

// /**
//  * GET /api/mock/products
//  * Query:
//  *   - q
//  *   - category_id (หรือ categoryId)
//  *   - visible: "true" | "false"
//  *   - sort: order | newest | price_asc | price_desc | discount_desc | rating_desc
//  *     (หรือ legacy: sort=price + order=asc|desc)
//  *   - page, pageSize
//  */
// export async function GET(req: Request) {
//   const sp = new URL(req.url).searchParams;

//   const qRaw = sp.get("q") ?? undefined;
//   const q = qRaw?.trim() ? qRaw.trim() : undefined;

//   // รองรับทั้ง category_id และ categoryId
//   const category_id =
//     coerceId(sp.get("category_id")) ?? coerceId(sp.get("categoryId"));

//   // visible (ไม่ส่ง = undefined)
//   const visibleStr = (sp.get("visible") ?? "").toLowerCase();
//   const visible =
//     visibleStr === "true" ? true : visibleStr === "false" ? false : undefined;

//   const sort = mapSort(sp.get("sort"), sp.get("order"));
//   const page = Math.max(1, Number(sp.get("page") ?? 1) || 1);
//   const pageSize = Math.max(1, Number(sp.get("pageSize") ?? 24) || 24);

//   // ถ้าไม่มี q → ใช้ queryProducts ปกติ (เร็วและตรงกับ store)
//   if (!q) {
//     const { items, total, page: p, pageSize: ps } = queryProducts({
//       q,
//       category_id,
//       visible,
//       sort,
//       page,
//       pageSize,
//     });
//     return NextResponse.json(
//       { items, total, page: p, pageSize: ps, meta: getMeta() },
//       { headers: { "Cache-Control": "no-store" } }
//     );
//   }

//   // ===== มี q: ขยายให้ค้นหา "ชื่อหมวดหมู่" ได้ด้วย =====
//   // 1) สร้างชุด categoryId ที่ชื่อแมตช์ q
//   const qn = norm(q);
//   const catNameById = new Map(
//     getAllCategories().map((c) => [c.id, norm(c.name)])
//   );
//   const matchedCatIds = new Set(
//     [...catNameById.entries()]
//       .filter(([, name]) => name.includes(qn))
//       .map(([id]) => id)
//   );

//   // 2) โหลดสินค้าทั้งหมด แล้วกรองด้วย (ชื่อ/แบรนด์/SKU) OR (category name)
//   let list = getAllProducts({ includeHidden: true });

//   // ฟิลเตอร์ visible
//   if (typeof visible === "boolean") {
//     list = list.filter((x) => (x.visible ?? true) === visible);
//   }

//   // ฟิลเตอร์ category_id พารามิเตอร์ (ถ้าส่งมา)
//   if (typeof category_id !== "undefined") {
//     list = list.filter((x) => String(x.category_id) === String(category_id));
//   }

//   // ฟิลเตอร์ q: แมตช์ชื่อ/แบรนด์/SKU หรือชื่อหมวด
//   list = list.filter((p) => {
//     const textBucket = norm(`${p.name ?? ""} ${p.brand ?? ""} ${p.sku ?? ""}`);
//     const matchText = textBucket.includes(qn);
//     const matchCat =
//       p.category_id != null &&
//       matchedCatIds.size > 0 &&
//       matchedCatIds.has(p.category_id as any);
//     return matchText || matchCat;
//   });

//   // 3) sort + paginate
//   list = applySortLocal(list, sort);
//   const total = list.length;
//   const start = (page - 1) * pageSize;
//   const items = list.slice(start, start + pageSize);

//   return NextResponse.json(
//     { items, total, page, pageSize, meta: getMeta() },
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
//     const clamp = (v: number, lo: number, hi: number) =>
//       Math.min(hi, Math.max(lo, v));

//     const ratingRaw = num(raw.rating);
//     const reviewsRaw = num(raw.reviews);

//     const payload = {
//       ...base,
//       category_id:
//         raw.category_id === "" || raw.category_id == null
//           ? undefined
//           : raw.category_id,
//       uom: typeof raw.uom === "string" ? raw.uom.trim() || undefined : undefined,
//       rating:
//         typeof ratingRaw === "number" && Number.isFinite(ratingRaw)
//           ? clamp(Number(ratingRaw.toFixed(1)), 0, 5)
//           : undefined,
//       reviews:
//         typeof reviewsRaw === "number" && Number.isFinite(reviewsRaw)
//           ? Math.max(0, Math.floor(reviewsRaw))
//           : undefined,
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

// v.1.1.7 ============================================

// v.1.1.6 ============================================
// // src/app/api/mock/products/route.ts
// import { NextResponse } from "next/server";
// import { getMeta, upsert, queryProducts } from "./_store"; // ← ใช้ queryProducts
// import { validateProductInput } from "@/lib/validation/product";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// /** helper: coerce numeric string → number */
// function coerceId(v: string | null): string | number | undefined {
//   if (v == null || v === "") return undefined;
//   return isNaN(Number(v)) ? v : Number(v);
// }

// /** helper: map legacy sort params to store sort keys */
// function mapSort(
//   sortIn: string | null,
//   orderIn: string | null
// ): Parameters<typeof queryProducts>[0]["sort"] {
//   const s = (sortIn ?? "order").toLowerCase();
//   const o = (orderIn ?? "asc").toLowerCase();

//   if (s === "price") return o === "desc" ? "price_desc" : "price_asc";
//   // รองรับค่าในสโตร์โดยตรง
//   if (
//     s === "order" ||
//     s === "newest" ||
//     s === "price_asc" ||
//     s === "price_desc" ||
//     s === "discount_desc" ||
//     s === "rating_desc"
//   ) {
//     return s as any;
//   }
//   // ไม่รองรับ name-asc/desc ในสโตร์ → ใช้ลำดับเดิม
//   return "order";
// }

// /**
//  * GET /api/mock/products
//  * Query:
//  *   - q
//  *   - category_id (หรือ categoryId)
//  *   - visible: "true" | "false"
//  *   - sort: order | newest | price_asc | price_desc | discount_desc | rating_desc
//  *     (หรือ legacy: sort=price + order=asc|desc)
//  *   - page, pageSize
//  */
// export async function GET(req: Request) {
//   const sp = new URL(req.url).searchParams;

//   const q = sp.get("q") ?? undefined;

//   // รองรับทั้ง category_id และ categoryId
//   const category_id =
//     coerceId(sp.get("category_id")) ?? coerceId(sp.get("categoryId"));

//   // visible (ไม่ส่ง = undefined)
//   const visibleStr = (sp.get("visible") ?? "").toLowerCase();
//   const visible =
//     visibleStr === "true" ? true : visibleStr === "false" ? false : undefined;

//   const sort = mapSort(sp.get("sort"), sp.get("order"));
//   const page = Math.max(1, Number(sp.get("page") ?? 1) || 1);
//   const pageSize = Math.max(1, Number(sp.get("pageSize") ?? 24) || 24);

//   const { items, total, page: p, pageSize: ps } = queryProducts({
//     q,
//     category_id,
//     visible,
//     sort,
//     page,
//     pageSize,
//   });

//   return NextResponse.json(
//     { items, total, page: p, pageSize: ps, meta: getMeta() },
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
//       category_id:
//         raw.category_id === "" || raw.category_id == null ? undefined : raw.category_id,
//       uom: typeof raw.uom === "string" ? raw.uom.trim() || undefined : undefined,
//       rating:
//         typeof ratingRaw === "number" && Number.isFinite(ratingRaw)
//           ? clamp(Number(ratingRaw.toFixed(1)), 0, 5)
//           : undefined,
//       reviews:
//         typeof reviewsRaw === "number" && Number.isFinite(reviewsRaw)
//           ? Math.max(0, Math.floor(reviewsRaw))
//           : undefined,
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

// v.1.1.6 ============================================


// v.1.1.5 ==============================================
// // src/app/api/mock/products/route.ts
// import { NextResponse } from "next/server";
// import { getAll, getMeta, upsert } from "./_store";
// import { validateProductInput } from "@/lib/validation/product";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// /** helper: normalize text for case/diacritics-insensitive search */
// function norm(text?: string) {
//   return (text ?? "")
//     .toString()
//     .toLowerCase()
//     .normalize("NFKD")
//     .replace(/[\u0300-\u036f]/g, "");
// }

// /**
//  * GET /api/mock/products
//  * Query:
//  *   - q: string (ค้นหา name/brand/sku)
//  *   - categoryId: string|number
//  *   - sort: "order" | "price" | "name"
//  *   - order: "asc" | "desc"
//  *   - page: number (>=1)
//  *   - pageSize: number (>=1)
//  *   - includeHidden: "1" | "0"
//  *
//  * Response:
//  *   {
//  *     items: UIProduct[],
//  *     total: number,
//  *     page: number,
//  *     pageSize: number,
//  *     meta: {
//  *       title: string,
//  *       subtitle: string,
//  *       updatedAt?: string,
//  *       cardParts: { ... }   // ✅ การตั้งค่าการแสดงผลการ์ดจากแอดมิน
//  *     }
//  *   }
//  */
// export async function GET(req: Request) {
//   const url = new URL(req.url);
//   const sp = url.searchParams;

//   const q = sp.get("q")?.trim() ?? "";
//   const categoryIdParam = sp.get("categoryId");
//   const sort = (sp.get("sort") as "order" | "price" | "name") ?? "order";
//   const order = (sp.get("order") as "asc" | "desc") ?? "asc";
//   const page = Math.max(1, Number(sp.get("page") ?? 1) || 1);
//   const pageSize = Math.max(1, Number(sp.get("pageSize") ?? 24) || 24);
//   const includeHidden = !["0", "false"].includes((sp.get("includeHidden") ?? "1").toLowerCase());

//   // ดึงทั้งหมดมาก่อน แล้วค่อย filter เอง (เพื่อให้เลือก includeHidden ได้ยืดหยุ่น)
//   let list = getAll({ includeHidden: true });

//   // filter: visible
//   if (!includeHidden) {
//     list = list.filter((x) => x.visible !== false);
//   }

//   // filter: คำค้นชื่อ/แบรนด์/SKU
//   if (q) {
//     const kw = norm(q);
//     list = list.filter((p) => {
//       const bucket = [p.name, p.brand ?? "", p.sku ?? ""].map(norm).join(" ");
//       return bucket.includes(kw);
//     });
//   }

//   // filter: หมวดหมู่
//   if (categoryIdParam && categoryIdParam !== "") {
//     list = list.filter((p) => String(p.category_id ?? "") === categoryIdParam);
//   }

//   // sort
//   list.sort((a, b) => {
//     let va: any;
//     let vb: any;
//     if (sort === "price") {
//       va = a.price ?? 0;
//       vb = b.price ?? 0;
//     } else if (sort === "name") {
//       va = (a.name ?? "").toString().toLowerCase();
//       vb = (b.name ?? "").toString().toLowerCase();
//     } else {
//       // "order" (fallback)
//       va = a.order ?? 0;
//       vb = b.order ?? 0;
//     }
//     const cmp = va < vb ? -1 : va > vb ? 1 : 0;
//     return order === "desc" ? -cmp : cmp;
//   });

//   // paginate
//   const total = list.length;
//   const start = (page - 1) * pageSize;
//   const end = start + pageSize;
//   const items = list.slice(start, end);

//   return NextResponse.json(
//     {
//       items,
//       total,
//       page,
//       pageSize,
//       meta: getMeta(), // ✅ จะมี meta.cardParts ติดมาด้วย
//     },
//     { headers: { "Cache-Control": "no-store" } },
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
//       category_id: raw.category_id === "" || raw.category_id == null ? undefined : raw.category_id,
//       uom: typeof raw.uom === "string" ? raw.uom.trim() || undefined : undefined,
//       rating:
//         typeof ratingRaw === "number" && Number.isFinite(ratingRaw)
//           ? clamp(Number(ratingRaw.toFixed(1)), 0, 5)
//           : undefined,
//       reviews:
//         typeof reviewsRaw === "number" && Number.isFinite(reviewsRaw)
//           ? Math.max(0, Math.floor(reviewsRaw))
//           : undefined,
//       // visible ถ้าไม่ส่งมาจะ default false ตอน create
//       visible: typeof raw.visible === "boolean" ? raw.visible : false,
//     };

//     const item = upsert(payload as any);
//     return NextResponse.json({ item }, { status: 201 });
//   } catch (e: any) {
//     return NextResponse.json(
//       { error: "Validation failed", message: e?.message ?? "" },
//       { status: 400 },
//     );
//   }
// }

// v.1.1.5 ==============================================

// v.1.1.4 ==============================================
// // src/app/api/mock/products/route.ts

// import { NextResponse } from "next/server";
// import { getAll, getMeta, upsert } from "./_store";
// import { validateProductInput } from "@/lib/validation/product";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// /** helper: normalize text for case/diacritics-insensitive search */
// function norm(text?: string) {
//   return (text ?? "")
//     .toString()
//     .toLowerCase()
//     .normalize("NFKD")
//     .replace(/[\u0300-\u036f]/g, "");
// }

// /** GET /api/mock/products
//  *  query:
//  *   - q: string (ค้นหา name/brand/sku)
//  *   - categoryId: string|number
//  *   - sort: "order" | "price" | "name"
//  *   - order: "asc" | "desc"
//  *   - page: number (>=1)
//  *   - pageSize: number (>=1)
//  *   - includeHidden: "1" | "0"
//  */
// export async function GET(req: Request) {
//   const url = new URL(req.url);
//   const sp = url.searchParams;

//   const q = sp.get("q")?.trim() ?? "";
//   const categoryIdParam = sp.get("categoryId");
//   const sort = (sp.get("sort") as "order" | "price" | "name") ?? "order";
//   const order = (sp.get("order") as "asc" | "desc") ?? "asc";
//   const page = Math.max(1, Number(sp.get("page") ?? 1) || 1);
//   const pageSize = Math.max(1, Number(sp.get("pageSize") ?? 24) || 24);
//   const includeHidden = !["0", "false"].includes((sp.get("includeHidden") ?? "1").toLowerCase());

//   // ดึงทั้งหมดมาก่อน แล้วค่อย filter เอง (เพื่อให้เลือก includeHidden ได้ยืดหยุ่น)
//   let list = getAll({ includeHidden: true });

//   // filter: visible
//   if (!includeHidden) {
//     list = list.filter((x) => x.visible !== false);
//   }

//   // filter: คำค้นชื่อ/แบรนด์/SKU
//   if (q) {
//     const kw = norm(q);
//     list = list.filter((p) => {
//       const bucket = [p.name, p.brand ?? "", p.sku ?? ""].map(norm).join(" ");
//       return bucket.includes(kw);
//     });
//   }

//   // filter: หมวดหมู่
//   if (categoryIdParam && categoryIdParam !== "") {
//     list = list.filter((p) => String(p.category_id ?? "") === categoryIdParam);
//   }

//   // sort
//   list.sort((a, b) => {
//     let va: any;
//     let vb: any;
//     if (sort === "price") {
//       va = a.price ?? 0;
//       vb = b.price ?? 0;
//     } else if (sort === "name") {
//       va = (a.name ?? "").toString().toLowerCase();
//       vb = (b.name ?? "").toString().toLowerCase();
//     } else {
//       // "order" (fallback)
//       va = a.order ?? 0;
//       vb = b.order ?? 0;
//     }
//     const cmp = va < vb ? -1 : va > vb ? 1 : 0;
//     return order === "desc" ? -cmp : cmp;
//   });

//   // paginate
//   const total = list.length;
//   const start = (page - 1) * pageSize;
//   const end = start + pageSize;
//   const items = list.slice(start, end);

//   return NextResponse.json(
//     {
//       items,
//       total,
//       page,
//       pageSize,
//       meta: getMeta(),
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
//       category_id: raw.category_id === "" || raw.category_id == null ? undefined : raw.category_id,
//       uom: typeof raw.uom === "string" ? raw.uom.trim() || undefined : undefined,
//       rating:
//         typeof ratingRaw === "number" && Number.isFinite(ratingRaw)
//           ? clamp(Number(ratingRaw.toFixed(1)), 0, 5)
//           : undefined,
//       reviews:
//         typeof reviewsRaw === "number" && Number.isFinite(reviewsRaw)
//           ? Math.max(0, Math.floor(reviewsRaw))
//           : undefined,
//       // visible ถ้าไม่ส่งมาจะ default false ตอน create
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

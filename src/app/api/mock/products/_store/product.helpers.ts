// src/app/api/mock/products/_store/product.helpers.ts

import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
// IMPORT TYPE จากไฟล์ product.types.ts
import { UIProduct, CardPartsVisibility, ProductsMeta, ProductQuery } from "./product.types";

/** ===== DB Constants ===== */
export const TABLE = "products_clearance";
export const META_TABLE = "products_meta";
export const IMAGES_TABLE = "images_products";
export const CONDITIONS_TABLE = "product_conditions";

/** ===== In-memory meta (จะ sync กับ DB เมื่ออ่าน/เขียน) ===== */
export const defaultCardPartsVisibility: CardPartsVisibility = {
  image: true, discountBadge: true, brandLogo: true, frame: true,
  brandName: true, sku: true, name: true, ratingReview: true,
  category: true, price: true, originalPrice: true, uom: true,
};

// ใช้ let เพราะถูก setMeta และ getMeta เปลี่ยนค่า
let metaStore: ProductsMeta = {
  title: "สินค้าทั้งหมด",
  subtitle: "ข้อมูลจากฐานข้อมูล (DB-backed)",
  updatedAt: new Date().toISOString(),
  cardParts: { ...defaultCardPartsVisibility },
};

/** ===== Helpers ===== */

/** บังคับ session TZ +07:00 (กันเวลาคลาดเคลื่อน) */
export async function ensureTZ() {
  try {
    await setInterlinkSessionTZ("+07:00");
  } catch {
    /* ignore */
  }
}

/** แปลง id ที่เป็นตัวเลขให้เป็น number */
export const coerceId = (v: any) => (isNaN(Number(v)) ? v : Number(v));

/** "60%" -> 60 */
export function parseDiscountLabel(label?: string | null): number | undefined {
  if (!label) return undefined;
  const m = String(label).match(/(\d+(?:\.\d+)?)/);
  return m ? Math.round(Number(m[1])) : undefined;
}

/** 60 -> "60%" (สำหรับ upsert) */
export function toDiscountLabel(n?: number): string | null {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  const v = Math.max(0, Math.min(100, Math.round(n)));
  return `${v}%`;
}

/** base path ให้ถูกกับ Next (อย่าใส่ /public นำหน้า) */
export function normalizeBasePath(p?: string | null) {
  if (!p) return "/uploads/products";
  // /public/uploads/... -> /uploads/...
  const cleaned = String(p).replace(/^\/?public\//, "/");
  return cleaned.replace(/\/$/, "");
}

/** parse "2000;3000;4000" -> [2000,3000,4000] */
export function parseLengthList(s?: string | null): number[] {
  if (!s) return [];
  return String(s)
    .split(/[;,\s]+/)
    .map((x) => Number(x.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

/** parse single minimum length -> number | undefined */
export function parseSingleLength(s?: string | null): number | undefined {
  const n = Number((s ?? "").toString().trim());
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** สร้างอาร์เรย์สต๊อกให้มีความยาวเท่ากับ lengths: ถ้าขาดให้ใส่ 0, ถ้าเกินให้ตัดทิ้ง */
export function alignLengthsAndStocks(lengths: number[], stocks: number[]) {
  if (!Array.isArray(lengths) || lengths.length === 0) {
    return { lengths: [], stocks: [] };
  }
  const outStocks = lengths.map((_, i) => {
    const v = Number(stocks?.[i]);
    return Number.isFinite(v) && v >= 0 ? v : 0;
  });
  return { lengths, stocks: outStocks };
}

// /** map แถว DB -> UIProduct (แปลง BigInt/Decimal เป็น number เสมอ) */
// export function mapRowToUI(r: any): UIProduct {
//   // ประกอบ URL รูป: ใช้ image_name จาก images_products ถ้ามี, หากไม่มี fallback เป็น product_filename
//   const base = normalizeBasePath(r.image_url);
//   const nameFromJoin = r.image_name ?? undefined;        // จาก images_products (หลัก)
//   const nameFromFilename = r.product_filename ?? undefined;

//   let finalImageUrl: string | undefined;
//   if (nameFromJoin) finalImageUrl = `${base}/${nameFromJoin}`;
//   else if (nameFromFilename) finalImageUrl = `${base}/${nameFromFilename}`;

//   return {
//     id: Number(r.product_id),
//     name: String(r.product_name ?? ""),
//     brand: r.product_brand ?? undefined,

//     // ใช้ sku จริงก่อน ถ้าไม่มีค่อย fallback เป็น filename
//     sku: r.product_sku ?? r.product_filename ?? undefined,

//     price: Number(r.product_price ?? 0),
//     discountPercent: parseDiscountLabel(r.discount_label),
//     image_url: finalImageUrl,
//     visible: r.visible === 1 || r.visible === true,
//     order: Number(r.display_order ?? 0),

//     rating: r.rating_score != null ? Number(r.rating_score) : undefined,
//     reviews: r.rating_count != null ? Number(r.rating_count) : undefined,

//     category_id:
//       r.category_id == null
//         ? undefined
//         : (Number.isFinite(Number(r.category_id)) ? Number(r.category_id) : String(r.category_id)),

//     uom: r.product_uom ?? undefined,

//     /* ==========================
//      *   🎉 ฟิลด์ใหม่เพิ่มตรงนี้
//      * ========================== */
//     product_new: r.product_new != null ? Number(r.product_new) : 0,
//     product_best: r.product_best != null ? Number(r.product_best) : 0,
//     users_action: r.users_action != null ? Number(r.users_action) : 0,
//     clearanceSales: Boolean(r.clearanceSales),
//     clearanceQuantity: r.clearanceQuantity != null ? Number(r.clearanceQuantity) : 0,
//   };
// }

/** map แถว DB -> UIProduct (แปลง BigInt/Decimal เป็น number เสมอ) */
export function mapRowToUI(r: any): UIProduct {
  const base = normalizeBasePath(r.image_url);
  const nameFromJoin = r.image_name ?? undefined;
  const nameFromFilename = r.product_filename ?? undefined;

  let finalImageUrl: string | undefined;
  if (nameFromJoin) finalImageUrl = `${base}/${nameFromJoin}`;
  else if (nameFromFilename) finalImageUrl = `${base}/${nameFromFilename}`;

  return {
    id: Number(r.product_id),
    name: String(r.product_name ?? ""),
    brand: r.product_brand ?? undefined,

    sku: r.product_sku ?? r.product_filename ?? undefined,

    price: Number(r.product_price ?? 0),
    discountPercent: parseDiscountLabel(r.discount_label),
    image_url: finalImageUrl,
    visible: r.visible === 1 || r.visible === true,
    order: Number(r.display_order ?? 0),

    rating: r.rating_score != null ? Number(r.rating_score) : undefined,
    reviews: r.rating_count != null ? Number(r.rating_count) : undefined,

    category_id:
      r.category_id == null
        ? undefined
        : Number.isFinite(Number(r.category_id))
        ? Number(r.category_id)
        : String(r.category_id),

    uom: r.product_uom ?? undefined,

    /* ==========================
     *   🎉 ฟิลด์ใหม่เพิ่มตรงนี้
     * ========================== */
    product_new: r.product_new != null ? Number(r.product_new) : 0,
    product_best: r.product_best != null ? Number(r.product_best) : 0,
    users_action: r.users_action != null ? Number(r.users_action) : 0,

    // ✔ สินค้าจาก products_clearance → เป็น clearance เสมอ
    clearanceSales: true,

    clearanceQuantity:
      r.clearanceQuantity != null ? Number(r.clearanceQuantity) : 0,

    // ✔ service features
    freeShippingEligible: r.free_shipping_eligible == 1,
    freeShipMinimum:
      r.free_ship_minimum != null ? Number(r.free_ship_minimum) : 0,
    warrantyMonths:
      r.warranty_months != null ? Number(r.warranty_months) : 0,
    returnDays:
      r.return_days != null ? Number(r.return_days) : 0,
  };
}

/** WHERE builder — คงฟิลเตอร์เดิม และรองรับ matchCategoryIds (OR กับ q หา category) */
export function buildWhere(q: ProductQuery) {
  const conds: string[] = [];
  const params: any[] = [];

  if (typeof q.visible === "boolean") {
    conds.push("p.visible = ?");
    params.push(q.visible ? 1 : 0);
  }
  if (typeof q.category_id !== "undefined") {
    conds.push("p.category_id = ?");
    params.push(coerceId(q.category_id));
  }

  // ค้นหาในชื่อ/แบรนด์/SKU/filename
  if (q.q && q.q.trim()) {
    const like = `%${q.q.trim()}%`;
    const searchCond =
      "(p.product_name LIKE ? OR p.product_brand LIKE ? OR p.product_sku LIKE ? OR p.product_filename LIKE ?)";
    if (q.matchCategoryIds && q.matchCategoryIds.length) {
      const ids = q.matchCategoryIds.map(coerceId);
      const ph = ids.map(() => "?").join(",");
      conds.push(`(${searchCond} OR p.category_id IN (${ph}))`);
      params.push(like, like, like, like, ...ids);
    } else {
      conds.push(searchCond);
      params.push(like, like, like, like);
    }
  }

  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  return { where, params };
}

/** ===== Getter/Setter สำหรับจัดการ State ภายใน ===== */
// ต้อง Export ฟังก์ชันเหล่านี้ เพื่อให้ไฟล์อื่นเรียกใช้ได้
export function getMetaStore(): ProductsMeta {
    return metaStore;
}

export function setMetaStore(newMeta: ProductsMeta): void {
    metaStore = newMeta;
}

/** ORDER BY builder (คง semantics เดิม) */
export function buildOrderBy(sort?: ProductQuery["sort"]) {
  const s = sort ?? "order";
  switch (s) {
    case "price_asc":
      return "ORDER BY p.product_price ASC, p.display_order ASC, p.product_id ASC";
    case "price_desc":
      return "ORDER BY p.product_price DESC, p.display_order ASC, p.product_id ASC";
    case "discount_desc":
      return "ORDER BY CAST(REPLACE(p.discount_label,'%','') AS UNSIGNED) DESC, p.display_order ASC, p.product_id ASC";
    case "rating_desc":
      return "ORDER BY p.rating_score DESC, p.display_order ASC, p.product_id ASC";
    case "newest":
      return "ORDER BY p.product_id DESC";
    case "order":
    default:
      return "ORDER BY p.display_order ASC, p.product_id ASC";
  }
}

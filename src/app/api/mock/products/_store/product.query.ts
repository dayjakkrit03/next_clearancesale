// v.1.1.2 =============================================================
// src/app/api/mock/products/_store/product.query.ts

import { prismaInterlink } from "@/lib/db";
// IMPORT TYPE
import {
  UIProduct,
  ProductQuery,
  ProductsMeta,
  ProductCondition,
  CardPartsVisibility,
} from "./product.types";
// IMPORT HELPERS
import {
  ensureTZ,
  coerceId,
  mapRowToUI,
  TABLE,
  IMAGES_TABLE,
  CONDITIONS_TABLE,
  META_TABLE,
  defaultCardPartsVisibility,
  parseLengthList,
  parseSingleLength,
  alignLengthsAndStocks,
  normalizeBasePath,
  buildWhere,
  buildOrderBy,
  getMetaStore,
  setMetaStore,
} from "./product.helpers";

/** ===== Queries ===== */

export async function getAll(opts?: {
  includeHidden?: boolean;
}): Promise<UIProduct[]> {
  await ensureTZ();
  const includeHidden = opts?.includeHidden ?? true;

  const where = includeHidden ? "" : "WHERE p.visible = 1";

  const rows: any[] = await prismaInterlink.$queryRawUnsafe(
    `
    SELECT
      p.product_id, p.product_name, p.product_brand, p.product_sku, p.product_filename,
      p.product_price, p.discount_label, p.image_url, p.visible, p.display_order,
      p.rating_score, p.rating_count, p.category_id, p.product_uom,
      p.product_new, p.product_best, p.users_action, p.clearanceSales, p.clearanceQuantity,
      p.free_shipping_eligible, p.free_ship_minimum, p.warranty_months, p.return_days,
      ip.image_name
    FROM ${TABLE} p
    LEFT JOIN ${IMAGES_TABLE} ip
      ON p.product_id = ip.product_id AND ip.display_order = 0
    ${where}
    ORDER BY p.display_order ASC, p.product_id ASC
    `
  );
  return rows.map(mapRowToUI);
}

/** ===== Meta: อ่านจากตาราง products_meta (id=1) ===== */
export async function getMeta(): Promise<ProductsMeta> {
  await ensureTZ();

  const metaDefault = getMetaStore();

  const rows: any[] = await prismaInterlink.$queryRawUnsafe(
    `
    SELECT id, title, subtitle, card_parts, updated_at
    FROM ${META_TABLE}
    WHERE id = 1
    LIMIT 1
    `
  );

  if (!rows?.length) {
    const fallbackMeta = {
      ...metaDefault,
      updatedAt: new Date().toISOString(),
    };
    setMetaStore(fallbackMeta);
    return {
      ...fallbackMeta,
      cardParts: {
        ...defaultCardPartsVisibility,
        ...(fallbackMeta.cardParts ?? {}),
      },
    };
  }

  const r = rows[0];

  let cardPartsRaw: any = r.card_parts;
  if (typeof cardPartsRaw === "string") {
    try {
      cardPartsRaw = JSON.parse(cardPartsRaw);
    } catch {
      cardPartsRaw = {};
    }
  }
  if (cardPartsRaw == null || typeof cardPartsRaw !== "object") {
    cardPartsRaw = {};
  }

  const allowedKeys = Object.keys(defaultCardPartsVisibility);
  const filtered: Partial<CardPartsVisibility> = {};
  for (const k of allowedKeys) {
    const v = cardPartsRaw[k];
    if (typeof v === "boolean") (filtered as any)[k] = v;
  }

  const merged: ProductsMeta = {
    title: r.title ?? metaDefault.title,
    subtitle: r.subtitle ?? metaDefault.subtitle,
    updatedAt: r.updated_at
      ? new Date(r.updated_at).toISOString()
      : metaDefault.updatedAt,
    cardParts: { ...defaultCardPartsVisibility, ...filtered },
  };

  setMetaStore(merged);

  return merged;
}

/** 🔸 NEW: ดึงรูปทั้งหมดของสินค้า */
async function getAllImagesForProduct(
  productId: number | string,
  basePath: string,
  fallbackFilename?: string
) {
  const pid = coerceId(productId);
  const rows: any[] = await prismaInterlink.$queryRawUnsafe(
    `
    SELECT image_name, display_order
    FROM ${IMAGES_TABLE}
    WHERE product_id = ?
    ORDER BY display_order ASC, image_name ASC
    `,
    pid
  );

  if (!rows?.length) {
    if (fallbackFilename) {
      return [
        { url: `${basePath}/${fallbackFilename}`, order: 0, isPrimary: true },
      ];
    }
    return [];
  }

  return rows.map((r: any) => {
    const name = String(r.image_name ?? "").trim();
    const order = Number(r.display_order ?? 0);
    return {
      url: `${basePath}/${name}`,
      order,
      isPrimary: order === 0,
    };
  });
}

/** 🔸 NEW: ดึงเงื่อนไขการขายทั้งหมดของสินค้า */
async function getProductConditions(
  productId: number | string
): Promise<ProductCondition[]> {
  const pid = coerceId(productId);
  const rows: any[] = await prismaInterlink.$queryRawUnsafe(
    `
    SELECT sales_type, minimum_length, units_system, num_stock, cut_steps
    FROM ${CONDITIONS_TABLE}
    WHERE pro_id = ?
    ORDER BY id ASC
    `,
    pid
  );

  if (!rows?.length) return [];

  const out: ProductCondition[] = [];

  for (const r of rows) {
    const salesRaw = String(r.sales_type ?? "").trim().toUpperCase();
    const unit = (r.units_system ?? "").toString().trim() || "M.";
    if (salesRaw === "CUT") {
      const minLen = parseSingleLength(r.minimum_length);
      const steps = parseLengthList(r.cut_steps);
      out.push({
        salesType: "CUT",
        unit,
        minimumLength: minLen,
        stepOptions: steps.length ? steps : undefined,
      } as ProductCondition);
    } else if (salesRaw === "ROLL") {
      const lens = parseLengthList(r.minimum_length);
      const stocksRaw = parseLengthList(r.num_stock);
      const { lengths, stocks } = alignLengthsAndStocks(lens, stocksRaw);

      out.push({
        salesType: "ROLL",
        unit,
        rollLengths: lengths,
        rollStocks: stocks,
      } as ProductCondition);
    }
  }
  return out;
}

/** อ่านสินค้าตาม id เดียว — 🔸 JOIN รูปทั้งหมดและเงื่อนไข */
export async function getById(
  id: UIProduct["id"]
): Promise<UIProduct | undefined> {
  await ensureTZ();

  const rows: any[] = await prismaInterlink.$queryRawUnsafe(
    `
    SELECT
      p.product_id, p.product_name, p.product_brand, p.product_sku, p.product_filename,
      p.product_price, p.discount_label, p.image_url, p.visible, p.display_order,
      p.rating_score, p.rating_count, p.category_id, p.product_uom,
      p.product_new, p.product_best, p.users_action, p.clearanceSales, p.clearanceQuantity,
      p.free_shipping_eligible, p.free_ship_minimum, p.warranty_months, p.return_days,
      ip.image_name
    FROM ${TABLE} p
    LEFT JOIN ${IMAGES_TABLE} ip
      ON p.product_id = ip.product_id AND ip.display_order = 0
    WHERE p.product_id = ?
    LIMIT 1
    `,
    coerceId(id)
  );
  if (!rows.length) return undefined;

  const baseProduct = mapRowToUI(rows[0]);
  const basePath = normalizeBasePath(rows[0].image_url);
  const fallback = rows[0].product_filename ?? undefined;

  const images = await getAllImagesForProduct(baseProduct.id, basePath, fallback);
  const conditions = await getProductConditions(baseProduct.id);

  return { ...baseProduct, images, conditions };
}

/** อ่านสินค้าหลาย id และคงลำดับตามที่ส่งมา (คงเดิม) */
export async function getManyByIds(
  ids: Array<UIProduct["id"]>
): Promise<UIProduct[]> {
  await ensureTZ();
  if (!Array.isArray(ids) || ids.length === 0) return [];

  const norm = ids.map((v) => coerceId(v));
  const placeholders = norm.map(() => "?").join(", ");

  const rows: any[] = await prismaInterlink.$queryRawUnsafe(
    `
    SELECT
      p.product_id, p.product_name, p.product_brand, p.product_sku, p.product_filename,
      p.product_price, p.discount_label, p.image_url, p.visible, p.display_order,
      p.rating_score, p.rating_count, p.category_id, p.product_uom,
      p.product_new, p.product_best, p.users_action, p.clearanceSales, p.clearanceQuantity,
      p.free_shipping_eligible, p.free_ship_minimum, p.warranty_months, p.return_days,
      ip.image_name
    FROM ${TABLE} p
    LEFT JOIN ${IMAGES_TABLE} ip
      ON p.product_id = ip.product_id AND ip.display_order = 0
    WHERE p.product_id IN (${placeholders})
    `,
    ...norm
  );

  const mapped = rows.map(mapRowToUI);
  const mapById = new Map(mapped.map((p) => [p.id, p]));
  return norm.map((id) => mapById.get(id)).filter(Boolean) as UIProduct[];
}

/** ค้นหา/ฟิลเตอร์ + แบ่งหน้า (SQL) — ✅ JOIN รูปหลัก display_order=0 เท่านั้น (เพื่อ performance) */
export async function queryProducts(params: ProductQuery) {
  await ensureTZ();

  const page = Math.max(1, Math.floor(params.page ?? 1));
  const pageSize = Math.min(200, Math.max(1, Math.floor(params.pageSize ?? 24)));
  const offset = (page - 1) * pageSize;

  const { where, params: p } = buildWhere(params);
  const orderBy = buildOrderBy(params.sort);

  const totalRows: any[] = await prismaInterlink.$queryRawUnsafe(
    `SELECT CAST(COUNT(*) AS UNSIGNED) AS total FROM ${TABLE} p ${where}`,
    ...p
  );
  const total = Number(totalRows?.[0]?.total ?? 0);

  const items: any[] = await prismaInterlink.$queryRawUnsafe(
    `
    SELECT
      p.product_id, p.product_name, p.product_brand, p.product_sku, p.product_filename,
      p.product_price, p.discount_label, p.image_url, p.visible, p.display_order,
      p.rating_score, p.rating_count, p.category_id, p.product_uom,
      p.product_new, p.product_best, p.users_action, p.clearanceSales, p.clearanceQuantity,
      p.free_shipping_eligible, p.free_ship_minimum, p.warranty_months, p.return_days,
      ip.image_name
    FROM ${TABLE} p
    LEFT JOIN ${IMAGES_TABLE} ip
      ON p.product_id = ip.product_id AND ip.display_order = 0
    ${where}
    ${orderBy}
    LIMIT ? OFFSET ?
    `,
    ...p,
    pageSize,
    offset
  );

  return { items: items.map(mapRowToUI), total, page, pageSize };
}

// v.1.1.2 =============================================================

// // src/app/api/mock/products/_store/product.query.ts

// import { prismaInterlink } from "@/lib/db";
// // IMPORT TYPE
// import { UIProduct, ProductQuery, ProductsMeta, ProductCondition, CardPartsVisibility } from "./product.types";
// // IMPORT HELPERS
// // 🎯 แก้ไข: ลบ metaStore ออก แล้ว Import getMetaStore และ setMetaStore แทน
// import {
//   ensureTZ, coerceId, mapRowToUI, TABLE, IMAGES_TABLE, CONDITIONS_TABLE,
//   META_TABLE, defaultCardPartsVisibility, parseLengthList,
//   parseSingleLength, alignLengthsAndStocks, normalizeBasePath,
//   buildWhere, buildOrderBy,
//   getMetaStore, // 🎯 NEW: Getter function
//   setMetaStore, // 🎯 NEW: Setter function
// } from "./product.helpers";

// /** ===== Queries ===== */

// export async function getAll(opts?: { includeHidden?: boolean }): Promise<UIProduct[]> {
//   await ensureTZ();
//   const includeHidden = opts?.includeHidden ?? true;

//   const where = includeHidden ? "" : "WHERE p.visible = 1";

//   const rows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//     SELECT
//       p.product_id, p.product_name, p.product_brand, p.product_sku, p.product_filename,
//       p.product_price, p.discount_label, p.image_url, p.visible, p.display_order,
//       p.rating_score, p.rating_count, p.category_id, p.product_uom,
//       p.product_new, p.product_best, p.users_action, p.clearanceSales, p.clearanceQuantity,
//       ip.image_name
//     FROM ${TABLE} p
//     LEFT JOIN ${IMAGES_TABLE} ip
//       ON p.product_id = ip.product_id AND ip.display_order = 0
//     ${where}
//     ORDER BY p.display_order ASC, p.product_id ASC
//     `
//   );
//   return rows.map(mapRowToUI);
// }

// /** ===== Meta: อ่านจากตาราง products_meta (id=1) ===== */
// export async function getMeta(): Promise<ProductsMeta> {
//   await ensureTZ();
  
//   // 🎯 เตรียมค่าปัจจุบันจาก in-memory เพื่อใช้เป็น default/fallback
//   const metaDefault = getMetaStore();

//   // ดึงจาก DB
//   const rows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//     SELECT id, title, subtitle, card_parts, updated_at
//     FROM ${META_TABLE}
//     WHERE id = 1
//     LIMIT 1
//     `
//   );

//   if (!rows?.length) {
//     // ไม่มีแถวใน DB → คืนค่า default (พร้อมอัปเดต in-memory)
//     // 🎯 แก้ไข: ใช้ setMetaStore แทนการกำหนดค่า metaStore ตรงๆ
//     const fallbackMeta = { ...metaDefault, updatedAt: new Date().toISOString() };
//     setMetaStore(fallbackMeta);
//     return { ...fallbackMeta, cardParts: { ...defaultCardPartsVisibility, ...(fallbackMeta.cardParts ?? {}) } };
//   }

//   const r = rows[0];

//   // card_parts อาจถูกคืนมาเป็น JSON object หรือ string → แปลงเป็น object ให้ได้เสมอ
//   let cardPartsRaw: any = r.card_parts;
//   if (typeof cardPartsRaw === "string") {
//     try { cardPartsRaw = JSON.parse(cardPartsRaw); } catch { cardPartsRaw = {}; }
//   }
//   if (cardPartsRaw == null || typeof cardPartsRaw !== "object") {
//     cardPartsRaw = {};
//   }

//   // กรองเฉพาะ key ที่รู้จัก และ merge กับ default
//   const allowedKeys = Object.keys(defaultCardPartsVisibility);
//   const filtered: Partial<CardPartsVisibility> = {};
//   for (const k of allowedKeys) {
//     const v = cardPartsRaw[k];
//     if (typeof v === "boolean") (filtered as any)[k] = v;
//   }

//   const merged: ProductsMeta = {
//     title: r.title ?? metaDefault.title, // 🎯 ใช้ metaDefault แทน metaStore
//     subtitle: r.subtitle ?? metaDefault.subtitle, // 🎯 ใช้ metaDefault แทน metaStore
//     updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : metaDefault.updatedAt, // 🎯 ใช้ metaDefault แทน metaStore
//     cardParts: { ...defaultCardPartsVisibility, ...filtered },
//   };

//   // sync เข้า in-memory ให้ตรงกับ DB
//   // 🎯 แก้ไข: ใช้ setMetaStore แทนการกำหนดค่า metaStore ตรงๆ
//   setMetaStore(merged);

//   return merged;
// }

// /** 🔸 NEW: ดึงรูปทั้งหมดของสินค้า */
// async function getAllImagesForProduct(productId: number | string, basePath: string, fallbackFilename?: string) {
//   const pid = coerceId(productId);
//   // ดึงจาก images_products ทั้งหมด เรียงตาม display_order
//   const rows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//     SELECT image_name, display_order
//     FROM ${IMAGES_TABLE}
//     WHERE product_id = ?
//     ORDER BY display_order ASC, image_name ASC
//     `,
//     pid
//   );

//   // ถ้าไม่มีรูปในตาราง images_products — fallback เป็นไฟล์เดียวจาก product_filename (ถ้ามี)
//   if (!rows?.length) {
//     if (fallbackFilename) {
//       return [{ url: `${basePath}/${fallbackFilename}`, order: 0, isPrimary: true }];
//     }
//     return [];
//   }

//   // map เป็น { url, order, isPrimary }
//   return rows.map((r: any) => {
//     const name = String(r.image_name ?? "").trim();
//     const order = Number(r.display_order ?? 0);
//     return {
//       url: `${basePath}/${name}`,
//       order,
//       isPrimary: order === 0,
//     };
//   });
// }

// /** 🔸 NEW: ดึงเงื่อนไขการขายทั้งหมดของสินค้า */
// async function getProductConditions(productId: number | string): Promise<ProductCondition[]> {
//   const pid = coerceId(productId);
//   const rows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//     SELECT sales_type, minimum_length, units_system, num_stock, cut_steps
//     FROM ${CONDITIONS_TABLE}
//     WHERE pro_id = ?
//     ORDER BY id ASC
//     `,
//     pid
//   );

//   if (!rows?.length) return [];

//   const out: ProductCondition[] = [];

//   for (const r of rows) {
//     const salesRaw = String(r.sales_type ?? "").trim().toUpperCase();
//     const unit = (r.units_system ?? "").toString().trim() || "M.";
//     if (salesRaw === "CUT") {
//       const minLen = parseSingleLength(r.minimum_length);
//       const steps = parseLengthList(r.cut_steps); // "10;30;50" -> [10,30,50]
//       out.push({
//         salesType: "CUT",
//         unit,
//         minimumLength: minLen,
//         stepOptions: steps.length ? steps : undefined,
//       } as ProductCondition);
//     } else if (salesRaw === "ROLL") {
//       const lens = parseLengthList(r.minimum_length); // "2000;3000;4000" -> [2000,3000,4000]
//       const stocksRaw = parseLengthList(r.num_stock); // "12;50;45"      -> [12,50,45]
//       const { lengths, stocks } = alignLengthsAndStocks(lens, stocksRaw);

//       out.push({
//         salesType: "ROLL",
//         unit,
//         rollLengths: lengths,
//         rollStocks: stocks, // จะยาวเท่ากับ rollLengths เสมอ
//       } as ProductCondition);
//     }
//   }
//   return out;
// }


// /** อ่านสินค้าตาม id เดียว — 🔸 JOIN รูปทั้งหมดและเงื่อนไข */
// export async function getById(id: UIProduct["id"]): Promise<UIProduct | undefined> {
//   await ensureTZ();
//   // base สินค้า + join รูปหลัก (display_order=0) เหมือนเดิม เพื่อใช้ mapRowToUI
//   const rows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//     SELECT
//       p.product_id, p.product_name, p.product_brand, p.product_sku, p.product_filename,
//       p.product_price, p.discount_label, p.image_url, p.visible, p.display_order,
//       p.rating_score, p.rating_count, p.category_id, p.product_uom,
//       p.product_new, p.product_best, p.users_action, p.clearanceSales, p.clearanceQuantity,
//       ip.image_name
//     FROM ${TABLE} p
//     LEFT JOIN ${IMAGES_TABLE} ip
//       ON p.product_id = ip.product_id AND ip.display_order = 0
//     WHERE p.product_id = ?
//     LIMIT 1
//     `,
//     coerceId(id)
//   );
//   if (!rows.length) return undefined;

//   const baseProduct = mapRowToUI(rows[0]);
//   const basePath = normalizeBasePath(rows[0].image_url);
//   const fallback = rows[0].product_filename ?? undefined;

//   // NEW: ดึงรูปทั้งหมด
//   const images = await getAllImagesForProduct(baseProduct.id, basePath, fallback);

//   // NEW: ดึงเงื่อนไขการขาย
//   const conditions = await getProductConditions(baseProduct.id);

//   return { ...baseProduct, images, conditions };
// }


// /** อ่านสินค้าหลาย id และคงลำดับตามที่ส่งมา (คงเดิม) */
// export async function getManyByIds(ids: Array<UIProduct["id"]>): Promise<UIProduct[]> {
//   await ensureTZ();
//   if (!Array.isArray(ids) || ids.length === 0) return [];

//   const norm = ids.map((v) => coerceId(v));
//   const placeholders = norm.map(() => "?").join(", ");

//   const rows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//     SELECT
//       p.product_id, p.product_name, p.product_brand, p.product_sku, p.product_filename,
//       p.product_price, p.discount_label, p.image_url, p.visible, p.display_order,
//       p.rating_score, p.rating_count, p.category_id, p.product_uom,
//       p.product_new, p.product_best, p.users_action, p.clearanceSales, p.clearanceQuantity,
//       ip.image_name
//     FROM ${TABLE} p
//     LEFT JOIN ${IMAGES_TABLE} ip
//       ON p.product_id = ip.product_id AND ip.display_order = 0
//     WHERE p.product_id IN (${placeholders})
//     `,
//     ...norm
//   );

//   const mapped = rows.map(mapRowToUI);
//   const mapById = new Map(mapped.map((p) => [p.id, p]));
//   // หมายเหตุ: getManyByIds (list) ยัง “ไม่” ดึง images ทั้งหมดเพื่อความเร็ว
//   return norm.map((id) => mapById.get(id)).filter(Boolean) as UIProduct[];
// }

// /** ค้นหา/ฟิลเตอร์ + แบ่งหน้า (SQL) — ✅ JOIN รูปหลัก display_order=0 เท่านั้น (เพื่อ performance) */
// export async function queryProducts(params: ProductQuery) {
//   await ensureTZ();

//   const page = Math.max(1, Math.floor(params.page ?? 1));
//   const pageSize = Math.min(200, Math.max(1, Math.floor(params.pageSize ?? 24)));
//   const offset = (page - 1) * pageSize;

//   const { where, params: p } = buildWhere(params);
//   const orderBy = buildOrderBy(params.sort);

//   // total (cast กัน BigInt)
//   const totalRows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `SELECT CAST(COUNT(*) AS UNSIGNED) AS total FROM ${TABLE} p ${where}`,
//     ...p
//   );
//   const total = Number(totalRows?.[0]?.total ?? 0);

//   // items (JOIN รูปหลัก display_order=0)
//   const items: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//     SELECT
//       p.product_id, p.product_name, p.product_brand, p.product_sku, p.product_filename,
//       p.product_price, p.discount_label, p.image_url, p.visible, p.display_order,
//       p.rating_score, p.rating_count, p.category_id, p.product_uom,
//       p.product_new, p.product_best, p.users_action, p.clearanceSales, p.clearanceQuantity,
//       ip.image_name
//     FROM ${TABLE} p
//     LEFT JOIN ${IMAGES_TABLE} ip
//       ON p.product_id = ip.product_id AND ip.display_order = 0
//     ${where}
//     ${orderBy}
//     LIMIT ? OFFSET ?
//     `,
//     ...p,
//     pageSize,
//     offset
//   );

//   return { items: items.map(mapRowToUI), total, page, pageSize };
// }
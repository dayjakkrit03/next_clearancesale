
// v.1.1.5 ====================================================================
// src/app/api/mock/products/_store.ts

// DB-backed implementation (drop-in replacement of the old in-memory store)
import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";


/** ===== Types (คงแบบเดิม + images) ===== */
export type UIProduct = {
  id: number | string;
  name: string;
  brand?: string;
  sku?: string;
  price: number;
  discountPercent?: number; // 0..100
  image_url?: string;
  visible?: boolean;
  order: number;

  rating?: number;   // 0..5
  reviews?: number;  // count

  category_id?: number | string;
  uom?: string;

  /** NEW: รูปทั้งหมดของสินค้า (เรียงตาม display_order) */
  images?: Array<{ url: string; order: number; isPrimary?: boolean }>;

  /** NEW: เงื่อนไขการขาย (ถ้ามี) */
  conditions?: ProductCondition[];

};

/** ===== Sales conditions types (NEW) ===== */
export type SalesType = "CUT" | "ROLL";

export type ProductCondition = {
  salesType: SalesType;        // CUT | ROLL
  unit: string;                // หน่วยหลัก เช่น "M."
  minimumLength?: number;      // CUT เท่านั้น
  rollLengths?: number[];      // ROLL เท่านั้น (หลายความยาว)
};

/** ===== (เหมือนเดิม) Card parts visibility ===== */
export type CardPartsVisibility = {
  image: boolean;
  discountBadge: boolean;
  brandLogo: boolean;
  frame: boolean;

  brandName: boolean;
  sku: boolean;
  name: boolean;
  ratingReview: boolean;
  category: boolean;
  price: boolean;
  originalPrice: boolean;
  uom: boolean;
};

export const defaultCardPartsVisibility: CardPartsVisibility = {
  image: true,
  discountBadge: true,
  brandLogo: true,
  frame: true,

  brandName: true,
  sku: true,
  name: true,
  ratingReview: true,
  category: true,
  price: true,
  originalPrice: true,
  uom: true,
};

export type ProductsMeta = {
  title: string;
  subtitle: string;
  updatedAt?: string;
  cardParts: CardPartsVisibility;
};

/** ===== (เหมือนเดิม) Query types ===== */
export type ProductQuery = {
  q?: string;
  category_id?: number | string;
  /** ใช้เวลาหน้าค้นหาตรงกับชื่อหมวด — เติมเข้ามาเพื่อให้ route.ts ใช้ได้เหมือนเดิม */
  matchCategoryIds?: Array<number | string>;
  visible?: boolean;
  sort?: "order" | "newest" | "price_asc" | "price_desc" | "discount_desc" | "rating_desc";
  page?: number;     // 1-based
  pageSize?: number; // e.g. 24/48/96
};

/** ===== In-memory meta (จะ sync กับ DB เมื่ออ่าน/เขียน) ===== */
let meta: ProductsMeta = {
  title: "สินค้าทั้งหมด",
  subtitle: "ข้อมูลจากฐานข้อมูล (DB-backed)",
  updatedAt: new Date().toISOString(),
  cardParts: { ...defaultCardPartsVisibility },
};

/** ===== Helpers ===== */
const TABLE = "products_clearance";
const META_TABLE = "products_meta";
const IMAGES_TABLE = "images_products"; // ตาราง metadata รูปภาพ
const CONDITIONS_TABLE = "product_conditions"; // ตารางเงื่อนไขการขาย

/** บังคับ session TZ +07:00 (กันเวลาคลาดเคลื่อน) */
async function ensureTZ() {
  try {
    await setInterlinkSessionTZ("+07:00");
  } catch {
    /* ignore */
  }
}

/** แปลง id ที่เป็นตัวเลขให้เป็น number */
const coerceId = (v: any) => (isNaN(Number(v)) ? v : Number(v));

/** "60%" -> 60 */
function parseDiscountLabel(label?: string | null): number | undefined {
  if (!label) return undefined;
  const m = String(label).match(/(\d+(?:\.\d+)?)/);
  return m ? Math.round(Number(m[1])) : undefined;
}
/** 60 -> "60%" (สำหรับ upsert) */
function toDiscountLabel(n?: number): string | null {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  const v = Math.max(0, Math.min(100, Math.round(n)));
  return `${v}%`;
}

/** base path ให้ถูกกับ Next (อย่าใส่ /public นำหน้า) */
function normalizeBasePath(p?: string | null) {
  if (!p) return "/uploads/products";
  // /public/uploads/... -> /uploads/...
  const cleaned = String(p).replace(/^\/?public\//, "/");
  return cleaned.replace(/\/$/, "");
}

/** parse "2000;3000;4000" -> [2000,3000,4000] */
function parseLengthList(s?: string | null): number[] {
  if (!s) return [];
  return String(s)
    .split(/[;,\s]+/)
    .map((x) => Number(x.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

/** parse single minimum length -> number | undefined */
function parseSingleLength(s?: string | null): number | undefined {
  const n = Number((s ?? "").toString().trim());
  return Number.isFinite(n) && n > 0 ? n : undefined;
}


/** map แถว DB -> UIProduct (แปลง BigInt/Decimal เป็น number เสมอ) */
function mapRowToUI(r: any): UIProduct {
  // ประกอบ URL รูป: ใช้ image_name จาก images_products ถ้ามี, หากไม่มี fallback เป็น product_filename
  const base = normalizeBasePath(r.image_url);
  const nameFromJoin = r.image_name ?? undefined;        // จาก images_products (หลัก)
  const nameFromFilename = r.product_filename ?? undefined;

  let finalImageUrl: string | undefined;
  if (nameFromJoin) finalImageUrl = `${base}/${nameFromJoin}`;
  else if (nameFromFilename) finalImageUrl = `${base}/${nameFromFilename}`;

  return {
    id: Number(r.product_id), // ✅ กัน BigInt
    name: String(r.product_name ?? ""),
    brand: r.product_brand ?? undefined,
    // ใช้ sku จริงก่อน ถ้าไม่มีค่อย fallback เป็น filename (คงพฤติกรรมเดิม)
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
        : (Number.isFinite(Number(r.category_id)) ? Number(r.category_id) : String(r.category_id)),
    uom: r.product_uom ?? undefined,
  };
}

/** WHERE builder — คงฟิลเตอร์เดิม และรองรับ matchCategoryIds (OR กับ q หา category) */
function buildWhere(q: ProductQuery) {
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

/** ORDER BY builder (คง semantics เดิม) */
function buildOrderBy(sort?: ProductQuery["sort"]) {
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

/** ===== Queries ===== */
export async function getAll(opts?: { includeHidden?: boolean }): Promise<UIProduct[]> {
  await ensureTZ();
  const includeHidden = opts?.includeHidden ?? true;

  const where = includeHidden ? "" : "WHERE p.visible = 1";

  const rows: any[] = await prismaInterlink.$queryRawUnsafe(
    `
    SELECT
      p.product_id, p.product_name, p.product_brand, p.product_sku, p.product_filename,
      p.product_price, p.discount_label, p.image_url, p.visible, p.display_order,
      p.rating_score, p.rating_count, p.category_id, p.product_uom,
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

  // ดึงจาก DB
  const rows: any[] = await prismaInterlink.$queryRawUnsafe(
    `
    SELECT id, title, subtitle, card_parts, updated_at
    FROM ${META_TABLE}
    WHERE id = 1
    LIMIT 1
    `
  );

  if (!rows?.length) {
    // ไม่มีแถวใน DB → คืนค่า default (พร้อมอัปเดต in-memory)
    meta = { ...meta, updatedAt: new Date().toISOString() };
    return { ...meta, cardParts: { ...defaultCardPartsVisibility, ...(meta.cardParts ?? {}) } };
  }

  const r = rows[0];

  // card_parts อาจถูกคืนมาเป็น JSON object หรือ string → แปลงเป็น object ให้ได้เสมอ
  let cardPartsRaw: any = r.card_parts;
  if (typeof cardPartsRaw === "string") {
    try { cardPartsRaw = JSON.parse(cardPartsRaw); } catch { cardPartsRaw = {}; }
  }
  if (cardPartsRaw == null || typeof cardPartsRaw !== "object") {
    cardPartsRaw = {};
  }

  // กรองเฉพาะ key ที่รู้จัก และ merge กับ default
  const allowedKeys = Object.keys(defaultCardPartsVisibility);
  const filtered: Partial<CardPartsVisibility> = {};
  for (const k of allowedKeys) {
    const v = cardPartsRaw[k];
    if (typeof v === "boolean") (filtered as any)[k] = v;
  }

  const merged: ProductsMeta = {
    title: r.title ?? meta.title,
    subtitle: r.subtitle ?? meta.subtitle,
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : meta.updatedAt,
    cardParts: { ...defaultCardPartsVisibility, ...filtered },
  };

  // sync เข้า in-memory ให้ตรงกับ DB
  meta = { ...merged };

  return merged;
}

/** ===== Meta: เขียนกลับ DB (upsert id=1) ===== */
type MetaPatch =
  Partial<Omit<ProductsMeta, "cardParts">> & { cardParts?: Partial<CardPartsVisibility> };

export async function setMeta(patch: MetaPatch) {
  await ensureTZ();

  // โหลดของเดิมจาก DB (หรือ default)
  const current = await getMeta();

  // รวมค่าใหม่ (รวม nested cardParts)
  const next: ProductsMeta = {
    title: typeof patch.title === "string" && patch.title.trim() ? patch.title.trim() : current.title,
    subtitle: typeof patch.subtitle === "string" && patch.subtitle.trim() ? patch.subtitle.trim() : current.subtitle,
    updatedAt: new Date().toISOString(),
    cardParts: { ...current.cardParts, ...(patch.cardParts ?? {}) },
  };

  // Upsert: ถ้ามีแล้ว → UPDATE, ถ้าไม่มีก็ INSERT id=1
  const existsRows: any[] = await prismaInterlink.$queryRawUnsafe(
    `SELECT 1 AS ok FROM ${META_TABLE} WHERE id = 1 LIMIT 1`
  );
  const cardPartsJson = JSON.stringify(next.cardParts);

  if (existsRows?.length) {
    await prismaInterlink.$executeRawUnsafe(
      `
      UPDATE ${META_TABLE}
      SET title = ?, subtitle = ?, card_parts = ?, updated_at = NOW()
      WHERE id = 1
      `,
      next.title,
      next.subtitle,
      cardPartsJson
    );
  } else {
    await prismaInterlink.$executeRawUnsafe(
      `
      INSERT INTO ${META_TABLE} (id, title, subtitle, card_parts, updated_at)
      VALUES (1, ?, ?, ?, NOW())
      `,
      next.title,
      next.subtitle,
      cardPartsJson
    );
  }

  // sync เข้า in-memory
  meta = { ...next };
}

/** 🔸 NEW: ดึงรูปทั้งหมดของสินค้า */
async function getAllImagesForProduct(productId: number | string, basePath: string, fallbackFilename?: string) {
  const pid = coerceId(productId);
  // ดึงจาก images_products ทั้งหมด เรียงตาม display_order
  const rows: any[] = await prismaInterlink.$queryRawUnsafe(
    `
    SELECT image_name, display_order
    FROM ${IMAGES_TABLE}
    WHERE product_id = ?
    ORDER BY display_order ASC, image_name ASC
    `,
    pid
  );

  // ถ้าไม่มีรูปในตาราง images_products — fallback เป็นไฟล์เดียวจาก product_filename (ถ้ามี)
  if (!rows?.length) {
    if (fallbackFilename) {
      return [{ url: `${basePath}/${fallbackFilename}`, order: 0, isPrimary: true }];
    }
    return [];
  }

  // map เป็น { url, order, isPrimary }
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

/** อ่านสินค้าตาม id เดียว — 🔸 JOIN รูปทั้งหมด */
export async function getById(id: UIProduct["id"]): Promise<UIProduct | undefined> {
  await ensureTZ();
  // base สินค้า + join รูปหลัก (display_order=0) เหมือนเดิม เพื่อใช้ mapRowToUI
  const rows: any[] = await prismaInterlink.$queryRawUnsafe(
    `
    SELECT
      p.product_id, p.product_name, p.product_brand, p.product_sku, p.product_filename,
      p.product_price, p.discount_label, p.image_url, p.visible, p.display_order,
      p.rating_score, p.rating_count, p.category_id, p.product_uom,
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

  // NEW: ดึงรูปทั้งหมด
  const images = await getAllImagesForProduct(baseProduct.id, basePath, fallback);

  // NEW: ดึงเงื่อนไขการขาย
  const conditions = await getProductConditions(baseProduct.id);

  return { ...baseProduct, images, conditions };
}

/** 🔸 NEW: ดึงเงื่อนไขการขายทั้งหมดของสินค้า */
async function getProductConditions(productId: number | string): Promise<ProductCondition[]> {
  const pid = coerceId(productId);
  const rows: any[] = await prismaInterlink.$queryRawUnsafe(
    `
    SELECT sales_type, minimum_length, units_system
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
      out.push({
        salesType: "CUT",
        unit,
        minimumLength: parseSingleLength(r.minimum_length),
      });
    } else if (salesRaw === "ROLL") {
      out.push({
        salesType: "ROLL",
        unit,
        rollLengths: parseLengthList(r.minimum_length),
      });
    }
  }
  return out;
}


/** อ่านสินค้าหลาย id และคงลำดับตามที่ส่งมา (คงเดิม) */
export async function getManyByIds(ids: Array<UIProduct["id"]>): Promise<UIProduct[]> {
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
  // หมายเหตุ: getManyByIds (list) ยัง “ไม่” ดึง images ทั้งหมดเพื่อความเร็ว
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

  // total (cast กัน BigInt)
  const totalRows: any[] = await prismaInterlink.$queryRawUnsafe(
    `SELECT CAST(COUNT(*) AS UNSIGNED) AS total FROM ${TABLE} p ${where}`,
    ...p
  );
  const total = Number(totalRows?.[0]?.total ?? 0);

  // items (JOIN รูปหลัก display_order=0)
  const items: any[] = await prismaInterlink.$queryRawUnsafe(
    `
    SELECT
      p.product_id, p.product_name, p.product_brand, p.product_sku, p.product_filename,
      p.product_price, p.discount_label, p.image_url, p.visible, p.display_order,
      p.rating_score, p.rating_count, p.category_id, p.product_uom,
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

/** ===== Mutations (คงอินเตอร์เฟซเดิม) ===== */
export async function setVisible(id: UIProduct["id"], visible: boolean) {
  await ensureTZ();
  await prismaInterlink.$executeRawUnsafe(
    `UPDATE ${TABLE} SET visible = ?, updated_at = NOW() WHERE product_id = ?`,
    visible ? 1 : 0,
    coerceId(id)
  );
}

export async function toggleVisible(id: UIProduct["id"]) {
  await ensureTZ();
  await prismaInterlink.$executeRawUnsafe(
    `UPDATE ${TABLE} SET visible = IF(visible=1,0,1), updated_at = NOW() WHERE product_id = ?`,
    coerceId(id)
  );
}

export async function remove(id: UIProduct["id"]) {
  await ensureTZ();
  await prismaInterlink.$executeRawUnsafe(
    `DELETE FROM ${TABLE} WHERE product_id = ?`,
    coerceId(id)
  );
}

export async function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
  await ensureTZ();
  if (!orders?.length) return;

  const ids = orders.map((o) => Number(coerceId(o.id)));
  const caseWhen = orders
    .map((o) => `WHEN ${Number(coerceId(o.id))} THEN ${Number(o.order)}`)
    .join(" ");
  const inList = ids.join(", ");

  const sql = `
    UPDATE ${TABLE}
    SET display_order = CASE product_id ${caseWhen} END,
        updated_at = NOW()
    WHERE product_id IN (${inList})
  `;
  await prismaInterlink.$executeRawUnsafe(sql);
}

export async function upsert(p: Partial<UIProduct>): Promise<UIProduct> {
  await ensureTZ();
  const hasId = typeof p.id !== "undefined" && p.id !== null;

  if (hasId) {
    // UPDATE เฉพาะฟิลด์ที่ส่งมา
    const fields: string[] = [];
    const values: any[] = [];
    const push = (col: string, val: any) => { fields.push(`${col} = ?`); values.push(val); };

    if (typeof p.name !== "undefined")        push("product_name", String(p.name));
    if (typeof p.brand !== "undefined")       push("product_brand", p.brand ?? null);
    if (typeof p.sku !== "undefined")         push("product_filename", p.sku ?? null); // ใช้ช่องเดิมตาม mock
    if (typeof p.price !== "undefined")       push("product_price", Number(p.price) || 0);
    if (typeof p.discountPercent !== "undefined") push("discount_label", toDiscountLabel(p.discountPercent));
    if (typeof p.image_url !== "undefined")   push("image_url", p.image_url ?? null);
    if (typeof p.visible !== "undefined")     push("visible", p.visible ? 1 : 0);
    if (typeof p.order !== "undefined")       push("display_order", Number(p.order) || 0);
    if (typeof p.rating !== "undefined")      push("rating_score", p.rating == null ? null : Number(p.rating));
    if (typeof p.reviews !== "undefined")     push("rating_count", p.reviews == null ? null : Number(p.reviews));
    if (typeof p.category_id !== "undefined") push("category_id", p.category_id == null ? null : coerceId(p.category_id));
    if (typeof p.uom !== "undefined")         push("product_uom", p.uom ?? null);

    if (fields.length) {
      const sql = `UPDATE ${TABLE} SET ${fields.join(", ")}, updated_at = NOW() WHERE product_id = ?`;
      values.push(coerceId(p.id));
      await prismaInterlink.$executeRawUnsafe(sql, ...values);
    }

    const row = await getById(p.id as any);
    if (!row) throw new Error("Product not found after update");
    return row;
  } else {
    // INSERT ใหม่ (order = max(display_order)+1)
    const nextOrderRows: any[] = await prismaInterlink.$queryRawUnsafe(
      `SELECT COALESCE(MAX(display_order), -1) + 1 AS nextOrder FROM ${TABLE}`
    );
    const nextOrder = Number(nextOrderRows?.[0]?.nextOrder ?? 0);

    await prismaInterlink.$executeRawUnsafe(
      `
      INSERT INTO ${TABLE}
        (product_name, product_brand, product_filename, product_price, discount_label, image_url, visible,
         display_order, rating_score, rating_count, category_id, product_uom, created_at, updated_at)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      String(p.name ?? "New Product"),
      p.brand ?? null,
      p.sku ?? null,
      Number(p.price) || 0,
      toDiscountLabel(p.discountPercent),
      p.image_url ?? null,
      p.visible ? 1 : 0,
      nextOrder,
      p.rating == null ? null : Number(p.rating),
      p.reviews == null ? null : Number(p.reviews),
      p.category_id == null ? null : coerceId(p.category_id),
      p.uom ?? null
    );

    // ดึง id ที่เพิ่ง insert มา (cast เป็น number กัน BigInt)
    const insertedIdRows: any[] = await prismaInterlink.$queryRawUnsafe(`SELECT LAST_INSERT_ID() AS id`);
    const newId = Number(insertedIdRows?.[0]?.id);
    const row = await getById(newId);
    if (!row) throw new Error("Product not found after insert");
    return row;
  }
}

/** (dev only) reset — ไม่ยุ่ง DB เพื่อเลี่ยงลบข้อมูลจริง */
export function reset() {
  meta = { ...meta, updatedAt: new Date().toISOString() };
}

// v.1.1.5 ====================================================================


// v.1.1.4 ====================================================================
// // src/app/api/mock/products/_store.ts
// // DB-backed implementation (drop-in replacement of the old in-memory store)
// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";

// /** ===== Types (คงแบบเดิม) ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;

//   rating?: number;   // 0..5
//   reviews?: number;  // count

//   category_id?: number | string;
//   uom?: string;
// };

// /** ===== (เหมือนเดิม) Card parts visibility ===== */
// export type CardPartsVisibility = {
//   image: boolean;
//   discountBadge: boolean;
//   brandLogo: boolean;
//   frame: boolean;

//   brandName: boolean;
//   sku: boolean;
//   name: boolean;
//   ratingReview: boolean;
//   category: boolean;
//   price: boolean;
//   originalPrice: boolean;
//   uom: boolean;
// };

// export const defaultCardPartsVisibility: CardPartsVisibility = {
//   image: true,
//   discountBadge: true,
//   brandLogo: true,
//   frame: true,

//   brandName: true,
//   sku: true,
//   name: true,
//   ratingReview: true,
//   category: true,
//   price: true,
//   originalPrice: true,
//   uom: true,
// };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
//   cardParts: CardPartsVisibility;
// };

// /** ===== (เหมือนเดิม) Query types ===== */
// export type ProductQuery = {
//   q?: string;
//   category_id?: number | string;
//   /** ใช้เวลาหน้าค้นหาตรงกับชื่อหมวด — เติมเข้ามาเพื่อให้ route.ts ใช้ได้เหมือนเดิม */
//   matchCategoryIds?: Array<number | string>;
//   visible?: boolean;
//   sort?: "order" | "newest" | "price_asc" | "price_desc" | "discount_desc" | "rating_desc";
//   page?: number;     // 1-based
//   pageSize?: number; // e.g. 24/48/96
// };

// /** ===== In-memory meta (จะ sync กับ DB เมื่ออ่าน/เขียน) ===== */
// let meta: ProductsMeta = {
//   title: "สินค้าทั้งหมด",
//   subtitle: "ข้อมูลจากฐานข้อมูล (DB-backed)",
//   updatedAt: new Date().toISOString(),
//   cardParts: { ...defaultCardPartsVisibility },
// };

// /** ===== Helpers ===== */
// const TABLE = "products_clearance";
// const META_TABLE = "products_meta";
// const IMAGES_TABLE = "images_products"; // ตาราง metadata รูปภาพ

// /** บังคับ session TZ +07:00 (กันเวลาคลาดเคลื่อน) */
// async function ensureTZ() {
//   try {
//     await setInterlinkSessionTZ("+07:00");
//   } catch {
//     /* ignore */
//   }
// }

// /** แปลง id ที่เป็นตัวเลขให้เป็น number */
// const coerceId = (v: any) => (isNaN(Number(v)) ? v : Number(v));

// /** "60%" -> 60 */
// function parseDiscountLabel(label?: string | null): number | undefined {
//   if (!label) return undefined;
//   const m = String(label).match(/(\d+(?:\.\d+)?)/);
//   return m ? Math.round(Number(m[1])) : undefined;
// }
// /** 60 -> "60%" (สำหรับ upsert) */
// function toDiscountLabel(n?: number): string | null {
//   if (typeof n !== "number" || !Number.isFinite(n)) return null;
//   const v = Math.max(0, Math.min(100, Math.round(n)));
//   return `${v}%`;
// }

// /** base path ให้ถูกกับ Next (อย่าใส่ /public นำหน้า) */
// function normalizeBasePath(p?: string | null) {
//   if (!p) return "/uploads/products";
//   // /public/uploads/... -> /uploads/...
//   const cleaned = String(p).replace(/^\/?public\//, "/");
//   return cleaned.replace(/\/$/, "");
// }

// /** map แถว DB -> UIProduct (แปลง BigInt/Decimal เป็น number เสมอ) */
// function mapRowToUI(r: any): UIProduct {
//   // ประกอบ URL รูป: ใช้ image_name จาก images_products ถ้ามี, หากไม่มี fallback เป็น product_filename
//   const base = normalizeBasePath(r.image_url);
//   const nameFromJoin = r.image_name ?? undefined;        // จาก images_products
//   const nameFromFilename = r.product_filename ?? undefined;

//   let finalImageUrl: string | undefined;
//   if (nameFromJoin) finalImageUrl = `${base}/${nameFromJoin}`;
//   else if (nameFromFilename) finalImageUrl = `${base}/${nameFromFilename}`;

//   return {
//     id: Number(r.product_id), // ✅ กัน BigInt
//     name: String(r.product_name ?? ""),
//     brand: r.product_brand ?? undefined,
//     // ใช้ sku จริงก่อน ถ้าไม่มีค่อย fallback เป็น filename (คงพฤติกรรมเดิม)
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
//   };
// }

// /** WHERE builder — คงฟิลเตอร์เดิม และรองรับ matchCategoryIds (OR กับ q หา category) */
// function buildWhere(q: ProductQuery) {
//   const conds: string[] = [];
//   const params: any[] = [];

//   if (typeof q.visible === "boolean") {
//     conds.push("p.visible = ?");
//     params.push(q.visible ? 1 : 0);
//   }
//   if (typeof q.category_id !== "undefined") {
//     conds.push("p.category_id = ?");
//     params.push(coerceId(q.category_id));
//   }

//   // ค้นหาในชื่อ/แบรนด์/SKU/filename
//   if (q.q && q.q.trim()) {
//     const like = `%${q.q.trim()}%`;
//     const searchCond =
//       "(p.product_name LIKE ? OR p.product_brand LIKE ? OR p.product_sku LIKE ? OR p.product_filename LIKE ?)";
//     if (q.matchCategoryIds && q.matchCategoryIds.length) {
//       const ids = q.matchCategoryIds.map(coerceId);
//       const ph = ids.map(() => "?").join(",");
//       conds.push(`(${searchCond} OR p.category_id IN (${ph}))`);
//       params.push(like, like, like, like, ...ids);
//     } else {
//       conds.push(searchCond);
//       params.push(like, like, like, like);
//     }
//   }

//   const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
//   return { where, params };
// }

// /** ORDER BY builder (คง semantics เดิม) */
// function buildOrderBy(sort?: ProductQuery["sort"]) {
//   const s = sort ?? "order";
//   switch (s) {
//     case "price_asc":
//       return "ORDER BY p.product_price ASC, p.display_order ASC, p.product_id ASC";
//     case "price_desc":
//       return "ORDER BY p.product_price DESC, p.display_order ASC, p.product_id ASC";
//     case "discount_desc":
//       return "ORDER BY CAST(REPLACE(p.discount_label,'%','') AS UNSIGNED) DESC, p.display_order ASC, p.product_id ASC";
//     case "rating_desc":
//       return "ORDER BY p.rating_score DESC, p.display_order ASC, p.product_id ASC";
//     case "newest":
//       return "ORDER BY p.product_id DESC";
//     case "order":
//     default:
//       return "ORDER BY p.display_order ASC, p.product_id ASC";
//   }
// }

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
//     meta = { ...meta, updatedAt: new Date().toISOString() };
//     return { ...meta, cardParts: { ...defaultCardPartsVisibility, ...(meta.cardParts ?? {}) } };
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
//     title: r.title ?? meta.title,
//     subtitle: r.subtitle ?? meta.subtitle,
//     updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : meta.updatedAt,
//     cardParts: { ...defaultCardPartsVisibility, ...filtered },
//   };

//   // sync เข้า in-memory ให้ตรงกับ DB
//   meta = { ...merged };

//   return merged;
// }

// /** ===== Meta: เขียนกลับ DB (upsert id=1) ===== */
// type MetaPatch =
//   Partial<Omit<ProductsMeta, "cardParts">> & { cardParts?: Partial<CardPartsVisibility> };

// export async function setMeta(patch: MetaPatch) {
//   await ensureTZ();

//   // โหลดของเดิมจาก DB (หรือ default)
//   const current = await getMeta();

//   // รวมค่าใหม่ (รวม nested cardParts)
//   const next: ProductsMeta = {
//     title: typeof patch.title === "string" && patch.title.trim() ? patch.title.trim() : current.title,
//     subtitle: typeof patch.subtitle === "string" && patch.subtitle.trim() ? patch.subtitle.trim() : current.subtitle,
//     updatedAt: new Date().toISOString(),
//     cardParts: { ...current.cardParts, ...(patch.cardParts ?? {}) },
//   };

//   // Upsert: ถ้ามีแล้ว → UPDATE, ถ้าไม่มีก็ INSERT id=1
//   const existsRows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `SELECT 1 AS ok FROM ${META_TABLE} WHERE id = 1 LIMIT 1`
//   );
//   const cardPartsJson = JSON.stringify(next.cardParts);

//   if (existsRows?.length) {
//     await prismaInterlink.$executeRawUnsafe(
//       `
//       UPDATE ${META_TABLE}
//       SET title = ?, subtitle = ?, card_parts = ?, updated_at = NOW()
//       WHERE id = 1
//       `,
//       next.title,
//       next.subtitle,
//       cardPartsJson
//     );
//   } else {
//     await prismaInterlink.$executeRawUnsafe(
//       `
//       INSERT INTO ${META_TABLE} (id, title, subtitle, card_parts, updated_at)
//       VALUES (1, ?, ?, ?, NOW())
//       `,
//       next.title,
//       next.subtitle,
//       cardPartsJson
//     );
//   }

//   // sync เข้า in-memory
//   meta = { ...next };
// }

// /** อ่านสินค้าตาม id เดียว */
// export async function getById(id: UIProduct["id"]): Promise<UIProduct | undefined> {
//   await ensureTZ();
//   const rows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//     SELECT
//       p.product_id, p.product_name, p.product_brand, p.product_sku, p.product_filename,
//       p.product_price, p.discount_label, p.image_url, p.visible, p.display_order,
//       p.rating_score, p.rating_count, p.category_id, p.product_uom,
//       ip.image_name
//     FROM ${TABLE} p
//     LEFT JOIN ${IMAGES_TABLE} ip
//       ON p.product_id = ip.product_id AND ip.display_order = 0
//     WHERE p.product_id = ?
//     LIMIT 1
//     `,
//     coerceId(id)
//   );
//   return rows.length ? mapRowToUI(rows[0]) : undefined;
// }

// /** อ่านสินค้าหลาย id และคงลำดับตามที่ส่งมา */
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
//   return norm.map((id) => mapById.get(id)).filter(Boolean) as UIProduct[];
// }

// /** ค้นหา/ฟิลเตอร์ + แบ่งหน้า (SQL) — ✅ JOIN images_products แล้ว */
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

// /** ===== Mutations (คงอินเตอร์เฟซเดิม) ===== */
// export async function setVisible(id: UIProduct["id"], visible: boolean) {
//   await ensureTZ();
//   await prismaInterlink.$executeRawUnsafe(
//     `UPDATE ${TABLE} SET visible = ?, updated_at = NOW() WHERE product_id = ?`,
//     visible ? 1 : 0,
//     coerceId(id)
//   );
// }

// export async function toggleVisible(id: UIProduct["id"]) {
//   await ensureTZ();
//   await prismaInterlink.$executeRawUnsafe(
//     `UPDATE ${TABLE} SET visible = IF(visible=1,0,1), updated_at = NOW() WHERE product_id = ?`,
//     coerceId(id)
//   );
// }

// export async function remove(id: UIProduct["id"]) {
//   await ensureTZ();
//   await prismaInterlink.$executeRawUnsafe(
//     `DELETE FROM ${TABLE} WHERE product_id = ?`,
//     coerceId(id)
//   );
// }

// export async function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
//   await ensureTZ();
//   if (!orders?.length) return;

//   const ids = orders.map((o) => Number(coerceId(o.id)));
//   const caseWhen = orders
//     .map((o) => `WHEN ${Number(coerceId(o.id))} THEN ${Number(o.order)}`)
//     .join(" ");
//   const inList = ids.join(", ");

//   const sql = `
//     UPDATE ${TABLE}
//     SET display_order = CASE product_id ${caseWhen} END,
//         updated_at = NOW()
//     WHERE product_id IN (${inList})
//   `;
//   await prismaInterlink.$executeRawUnsafe(sql);
// }

// export async function upsert(p: Partial<UIProduct>): Promise<UIProduct> {
//   await ensureTZ();
//   const hasId = typeof p.id !== "undefined" && p.id !== null;

//   if (hasId) {
//     // UPDATE เฉพาะฟิลด์ที่ส่งมา
//     const fields: string[] = [];
//     const values: any[] = [];
//     const push = (col: string, val: any) => { fields.push(`${col} = ?`); values.push(val); };

//     if (typeof p.name !== "undefined")        push("product_name", String(p.name));
//     if (typeof p.brand !== "undefined")       push("product_brand", p.brand ?? null);
//     if (typeof p.sku !== "undefined")         push("product_filename", p.sku ?? null); // ใช้ช่องเดิมตาม mock
//     if (typeof p.price !== "undefined")       push("product_price", Number(p.price) || 0);
//     if (typeof p.discountPercent !== "undefined") push("discount_label", toDiscountLabel(p.discountPercent));
//     if (typeof p.image_url !== "undefined")   push("image_url", p.image_url ?? null);
//     if (typeof p.visible !== "undefined")     push("visible", p.visible ? 1 : 0);
//     if (typeof p.order !== "undefined")       push("display_order", Number(p.order) || 0);
//     if (typeof p.rating !== "undefined")      push("rating_score", p.rating == null ? null : Number(p.rating));
//     if (typeof p.reviews !== "undefined")     push("rating_count", p.reviews == null ? null : Number(p.reviews));
//     if (typeof p.category_id !== "undefined") push("category_id", p.category_id == null ? null : coerceId(p.category_id));
//     if (typeof p.uom !== "undefined")         push("product_uom", p.uom ?? null);

//     if (fields.length) {
//       const sql = `UPDATE ${TABLE} SET ${fields.join(", ")}, updated_at = NOW() WHERE product_id = ?`;
//       values.push(coerceId(p.id));
//       await prismaInterlink.$executeRawUnsafe(sql, ...values);
//     }

//     const row = await getById(p.id as any);
//     if (!row) throw new Error("Product not found after update");
//     return row;
//   } else {
//     // INSERT ใหม่ (order = max(display_order)+1)
//     const nextOrderRows: any[] = await prismaInterlink.$queryRawUnsafe(
//       `SELECT COALESCE(MAX(display_order), -1) + 1 AS nextOrder FROM ${TABLE}`
//     );
//     const nextOrder = Number(nextOrderRows?.[0]?.nextOrder ?? 0);

//     await prismaInterlink.$executeRawUnsafe(
//       `
//       INSERT INTO ${TABLE}
//         (product_name, product_brand, product_filename, product_price, discount_label, image_url, visible,
//          display_order, rating_score, rating_count, category_id, product_uom, created_at, updated_at)
//       VALUES
//         (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
//       `,
//       String(p.name ?? "New Product"),
//       p.brand ?? null,
//       p.sku ?? null,
//       Number(p.price) || 0,
//       toDiscountLabel(p.discountPercent),
//       p.image_url ?? null,
//       p.visible ? 1 : 0,
//       nextOrder,
//       p.rating == null ? null : Number(p.rating),
//       p.reviews == null ? null : Number(p.reviews),
//       p.category_id == null ? null : coerceId(p.category_id),
//       p.uom ?? null
//     );

//     // ดึง id ที่เพิ่ง insert มา (cast เป็น number กัน BigInt)
//     const insertedIdRows: any[] = await prismaInterlink.$queryRawUnsafe(`SELECT LAST_INSERT_ID() AS id`);
//     const newId = Number(insertedIdRows?.[0]?.id);
//     const row = await getById(newId);
//     if (!row) throw new Error("Product not found after insert");
//     return row;
//   }
// }

// /** (dev only) reset — ไม่ยุ่ง DB เพื่อเลี่ยงลบข้อมูลจริง */
// export function reset() {
//   meta = { ...meta, updatedAt: new Date().toISOString() };
// }

// v.1.1.4 ====================================================================

// v.1.1.13 ===================================================================
// // src/app/api/mock/products/_store.ts
// // DB-backed implementation (drop-in replacement of the old in-memory store)

// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";

// /** ===== Types (คงแบบเดิม) ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;

//   rating?: number;   // 0..5
//   reviews?: number;  // count

//   category_id?: number | string;
//   uom?: string;
// };

// /** ===== (เหมือนเดิม) Card parts visibility ===== */
// export type CardPartsVisibility = {
//   image: boolean;
//   discountBadge: boolean;
//   brandLogo: boolean;
//   frame: boolean;

//   brandName: boolean;
//   sku: boolean;
//   name: boolean;
//   ratingReview: boolean;
//   category: boolean;
//   price: boolean;
//   originalPrice: boolean;
//   uom: boolean;
// };

// export const defaultCardPartsVisibility: CardPartsVisibility = {
//   image: true,
//   discountBadge: true,
//   brandLogo: true,
//   frame: true,

//   brandName: true,
//   sku: true,
//   name: true,
//   ratingReview: true,
//   category: true,
//   price: true,
//   originalPrice: true,
//   uom: true,
// };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
//   cardParts: CardPartsVisibility;
// };

// /** ===== (เหมือนเดิม) Query types ===== */
// export type ProductQuery = {
//   q?: string;
//   category_id?: number | string;
//   /** ใช้เวลาหน้าค้นหาตรงกับชื่อหมวด — เติมเข้ามาเพื่อให้ route.ts ใช้ได้เหมือนเดิม */
//   matchCategoryIds?: Array<number | string>;
//   visible?: boolean;
//   sort?: "order" | "newest" | "price_asc" | "price_desc" | "discount_desc" | "rating_desc";
//   page?: number;     // 1-based
//   pageSize?: number; // e.g. 24/48/96
// };

// /** ===== In-memory meta (จะ sync กับ DB เมื่ออ่าน/เขียน) ===== */
// let meta: ProductsMeta = {
//   title: "สินค้าทั้งหมด",
//   subtitle: "ข้อมูลจากฐานข้อมูล (DB-backed)",
//   updatedAt: new Date().toISOString(),
//   cardParts: { ...defaultCardPartsVisibility },
// };

// /** ===== Helpers ===== */
// const TABLE = "products_clearance";
// const META_TABLE = "products_meta";

// /** บังคับ session TZ +07:00 (กันเวลาคลาดเคลื่อน) */
// async function ensureTZ() {
//   try {
//     await setInterlinkSessionTZ("+07:00");
//   } catch {
//     /* ignore */
//   }
// }

// /** แปลง id ที่เป็นตัวเลขให้เป็น number */
// const coerceId = (v: any) => (isNaN(Number(v)) ? v : Number(v));

// /** "60%" -> 60 */
// function parseDiscountLabel(label?: string | null): number | undefined {
//   if (!label) return undefined;
//   const m = String(label).match(/(\d+(?:\.\d+)?)/);
//   return m ? Math.round(Number(m[1])) : undefined;
// }
// /** 60 -> "60%" (สำหรับ upsert) */
// function toDiscountLabel(n?: number): string | null {
//   if (typeof n !== "number" || !Number.isFinite(n)) return null;
//   const v = Math.max(0, Math.min(100, Math.round(n)));
//   return `${v}%`;
// }

// /** map แถว DB -> UIProduct (แปลง BigInt/Decimal เป็น number เสมอ) */
// function mapRowToUI(r: any): UIProduct {
//     // ส่วนของการคำนวณ URL รูปภาพถูกเพิ่ม/แก้ไข
//     const basePath = r.image_url ?? undefined;
//     // r.image_name เป็นฟิลด์ที่คาดหวังว่าจะได้มาจากการ JOIN ใน Query
//     const mainImageName = r.image_name ?? undefined; 

//     let finalImageUrl: string | undefined;

//     if (basePath && mainImageName) {
//         // รวม Base Path กับชื่อไฟล์ โดยจัดการเครื่องหมาย / ที่อาจซ้ำซ้อน
//         const cleanBasePath = basePath.replace(/\/$/, '');
//         finalImageUrl = `${cleanBasePath}/${mainImageName}`;
//     }

//     return {
//         id: Number(r.product_id), // ✅ กัน BigInt
//         name: String(r.product_name ?? ""),
//         brand: r.product_brand ?? undefined,
//         // ใช้ sku จริงก่อน ถ้าไม่มีค่อย fallback เป็น filename (คงพฤติกรรมก่อนได้)
//         sku: r.product_sku ?? r.product_filename ?? undefined,
//         price: Number(r.product_price ?? 0),
//         discountPercent: parseDiscountLabel(r.discount_label),
//         // ✅ ใช้ finalImageUrl ที่สร้างใหม่
//         image_url: finalImageUrl, 
//         visible: r.visible === 1 || r.visible === true,
//         order: Number(r.display_order ?? 0),
//         rating: r.rating_score != null ? Number(r.rating_score) : undefined,
//         reviews: r.rating_count != null ? Number(r.rating_count) : undefined,
//         category_id:
//             r.category_id == null
//                 ? undefined
//                 : (Number.isFinite(Number(r.category_id)) ? Number(r.category_id) : String(r.category_id)),
//         uom: r.product_uom ?? undefined,
//     };
// }

// /** WHERE builder — คงฟิลเตอร์เดิม และรองรับ matchCategoryIds (OR กับ q หา category) */
// function buildWhere(q: ProductQuery) {
//   const conds: string[] = [];
//   const params: any[] = [];

//   if (typeof q.visible === "boolean") {
//     conds.push("visible = ?");
//     params.push(q.visible ? 1 : 0);
//   }
//   if (typeof q.category_id !== "undefined") {
//     conds.push("category_id = ?");
//     params.push(coerceId(q.category_id));
//   }

//   // ค้นหาในชื่อ/แบรนด์/SKU/filename
//   if (q.q && q.q.trim()) {
//     const like = `%${q.q.trim()}%`;
//     const searchCond = "(product_name LIKE ? OR product_brand LIKE ? OR product_sku LIKE ? OR product_filename LIKE ?)";
//     if (q.matchCategoryIds && q.matchCategoryIds.length) {
//       const ids = q.matchCategoryIds.map(coerceId);
//       const ph = ids.map(() => "?").join(",");
//       conds.push(`(${searchCond} OR category_id IN (${ph}))`);
//       params.push(like, like, like, like, ...ids);
//     } else {
//       conds.push(searchCond);
//       params.push(like, like, like, like);
//     }
//   }

//   const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
//   return { where, params };
// }

// /** ORDER BY builder (คง semantics เดิม) */
// function buildOrderBy(sort?: ProductQuery["sort"]) {
//   const s = sort ?? "order";
//   switch (s) {
//     case "price_asc":
//       return "ORDER BY product_price ASC, display_order ASC, product_id ASC";
//     case "price_desc":
//       return "ORDER BY product_price DESC, display_order ASC, product_id ASC";
//     case "discount_desc":
//       return "ORDER BY CAST(REPLACE(discount_label,'%','') AS UNSIGNED) DESC, display_order ASC, product_id ASC";
//     case "rating_desc":
//       return "ORDER BY rating_score DESC, display_order ASC, product_id ASC";
//     case "newest":
//       return "ORDER BY product_id DESC";
//     case "order":
//     default:
//       return "ORDER BY display_order ASC, product_id ASC";
//   }
// }

// // const TABLE = "products_clearance";
// const IMAGES_TABLE = "images_products"; // ✅ กำหนดชื่อตารางรูปภาพ

// // /** ===== Queries ===== */
// // export async function getAll(opts?: { includeHidden?: boolean }): Promise<UIProduct[]> {
// //   await ensureTZ();
// //   const includeHidden = opts?.includeHidden ?? true;
// //   const where = includeHidden ? "" : "WHERE visible = 1";

// //   const rows: any[] = await prismaInterlink.$queryRawUnsafe(
// //     `
// //     SELECT
// //       product_id, product_name, product_brand, product_sku, product_filename,
// //       product_price, discount_label, image_url, visible, display_order,
// //       rating_score, rating_count, category_id, product_uom
// //     FROM ${TABLE}
// //     ${where}
// //     ORDER BY display_order ASC, product_id ASC
// //     `
// //   );
// //   return rows.map(mapRowToUI);
// // }

// /** ===== Queries ===== */
// export async function getAll(opts?: { includeHidden?: boolean }): Promise<UIProduct[]> {
//   await ensureTZ();
//   const includeHidden = opts?.includeHidden ?? true;
//   
//   // ใช้ alias 'p' สำหรับ products_clearance และ 'ip' สำหรับ images_products
//   const where = includeHidden ? "" : "WHERE p.visible = 1";

//   const rows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//     SELECT
//       p.product_id, p.product_name, p.product_brand, p.product_sku, p.product_filename,
//       p.product_price, p.discount_label, p.image_url, p.visible, p.display_order,
//       p.rating_score, p.rating_count, p.category_id, p.product_uom,
//       ip.image_name -- ✅ ดึงชื่อไฟล์รูปภาพหลัก
//     FROM ${TABLE} p
//     LEFT JOIN ${IMAGES_TABLE} ip 
//       ON p.product_id = ip.product_id AND ip.display_order = 0 -- ✅ เงื่อนไข JOIN: เชื่อมด้วย ID และเลือกเฉพาะรูปหลัก (order=0)
//     ${where}
//     ORDER BY p.display_order ASC, p.product_id ASC
//     `
//   );
//   return rows.map(mapRowToUI);
// }

// /** ===== Meta: อ่านจากตาราง products_meta (id=1) ===== */
// export async function getMeta(): Promise<ProductsMeta> {
//   await ensureTZ();

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
//     meta = { ...meta, updatedAt: new Date().toISOString() };
//     return { ...meta, cardParts: { ...defaultCardPartsVisibility, ...(meta.cardParts ?? {}) } };
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
//     title: r.title ?? meta.title,
//     subtitle: r.subtitle ?? meta.subtitle,
//     updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : meta.updatedAt,
//     cardParts: { ...defaultCardPartsVisibility, ...filtered },
//   };

//   // sync เข้า in-memory ให้ตรงกับ DB
//   meta = { ...merged };

//   return merged;
// }

// /** ===== Meta: เขียนกลับ DB (upsert id=1) ===== */
// type MetaPatch =
//   Partial<Omit<ProductsMeta, "cardParts">> & { cardParts?: Partial<CardPartsVisibility> };

// export async function setMeta(patch: MetaPatch) {
//   await ensureTZ();

//   // โหลดของเดิมจาก DB (หรือ default)
//   const current = await getMeta();

//   // รวมค่าใหม่ (รวม nested cardParts)
//   const next: ProductsMeta = {
//     title: typeof patch.title === "string" && patch.title.trim() ? patch.title.trim() : current.title,
//     subtitle: typeof patch.subtitle === "string" && patch.subtitle.trim() ? patch.subtitle.trim() : current.subtitle,
//     updatedAt: new Date().toISOString(),
//     cardParts: { ...current.cardParts, ...(patch.cardParts ?? {}) },
//   };

//   // Upsert: ถ้ามีแล้ว → UPDATE, ถ้าไม่มีก็ INSERT id=1
//   const existsRows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `SELECT 1 AS ok FROM ${META_TABLE} WHERE id = 1 LIMIT 1`
//   );
//   const cardPartsJson = JSON.stringify(next.cardParts);

//   if (existsRows?.length) {
//     await prismaInterlink.$executeRawUnsafe(
//       `
//       UPDATE ${META_TABLE}
//       SET title = ?, subtitle = ?, card_parts = ?, updated_at = NOW()
//       WHERE id = 1
//       `,
//       next.title,
//       next.subtitle,
//       cardPartsJson
//     );
//   } else {
//     await prismaInterlink.$executeRawUnsafe(
//       `
//       INSERT INTO ${META_TABLE} (id, title, subtitle, card_parts, updated_at)
//       VALUES (1, ?, ?, ?, NOW())
//       `,
//       next.title,
//       next.subtitle,
//       cardPartsJson
//     );
//   }

//   // sync เข้า in-memory
//   meta = { ...next };
// }

// /** อ่านสินค้าตาม id เดียว */
// // export async function getById(id: UIProduct["id"]): Promise<UIProduct | undefined> {
// //   await ensureTZ();
// //   const rows: any[] = await prismaInterlink.$queryRawUnsafe(
// //     `
// //     SELECT
// //       product_id, product_name, product_brand, product_sku, product_filename,
// //       product_price, discount_label, image_url, visible, display_order,
// //       rating_score, rating_count, category_id, product_uom
// //     FROM ${TABLE}
// //     WHERE product_id = ?
// //     LIMIT 1
// //     `,
// //     coerceId(id)
// //   );
// //   return rows.length ? mapRowToUI(rows[0]) : undefined;
// // }


// /** อ่านสินค้าตาม id เดียว */
// export async function getById(id: UIProduct["id"]): Promise<UIProduct | undefined> {
//   await ensureTZ();
//   const rows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//     SELECT
//       p.product_id, p.product_name, p.product_brand, p.product_sku, p.product_filename,
//       p.product_price, p.discount_label, p.image_url, p.visible, p.display_order,
//       p.rating_score, p.rating_count, p.category_id, p.product_uom,
//       ip.image_name -- ✅ ดึงชื่อไฟล์รูปภาพหลักจากตาราง images_products
//     FROM ${TABLE} p
//     LEFT JOIN ${IMAGES_TABLE} ip
//       ON p.product_id = ip.product_id AND ip.display_order = 0 -- ✅ เงื่อนไข: เชื่อมด้วย ID และเลือกเฉพาะรูปหลัก (order=0)
//     WHERE p.product_id = ?
//     LIMIT 1
//     `,
//     coerceId(id)
//   );
//   return rows.length ? mapRowToUI(rows[0]) : undefined;
// }

// /** อ่านสินค้าหลาย id และคงลำดับตามที่ส่งมา */
// // export async function getManyByIds(ids: Array<UIProduct["id"]>): Promise<UIProduct[]> {
// //   await ensureTZ();
// //   if (!Array.isArray(ids) || ids.length === 0) return [];
// //   const norm = ids.map((v) => coerceId(v));
// //   const placeholders = norm.map(() => "?").join(", ");

// //   const rows: any[] = await prismaInterlink.$queryRawUnsafe(
// //     `
// //     SELECT
// //       product_id, product_name, product_brand, product_sku, product_filename,
// //       product_price, discount_label, image_url, visible, display_order,
// //       rating_score, rating_count, category_id, product_uom
// //     FROM ${TABLE}
// //     WHERE product_id IN (${placeholders})
// //     `,
// //     ...norm
// //   );
// //   const mapped = rows.map(mapRowToUI);
// //   const mapById = new Map(mapped.map((p) => [p.id, p]));
// //   return norm.map((id) => mapById.get(id)).filter(Boolean) as UIProduct[];
// // }



// /** อ่านสินค้าหลาย id และคงลำดับตามที่ส่งมา */
// export async function getManyByIds(ids: Array<UIProduct["id"]>): Promise<UIProduct[]> {
//   await ensureTZ();
//   if (!Array.isArray(ids) || ids.length === 0) return [];
//   
//   const norm = ids.map((v) => coerceId(v));
//   const placeholders = norm.map(() => "?").join(", ");

//   const rows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//     SELECT
//       p.product_id, p.product_name, p.product_brand, p.product_sku, p.product_filename,
//       p.product_price, p.discount_label, p.image_url, p.visible, p.display_order,
//       p.rating_score, p.rating_count, p.category_id, p.product_uom,
//       ip.image_name -- ✅ ดึงชื่อไฟล์รูปภาพหลัก
//     FROM ${TABLE} p
//     LEFT JOIN ${IMAGES_TABLE} ip 
//       ON p.product_id = ip.product_id AND ip.display_order = 0 -- ✅ เงื่อนไข JOIN: เชื่อมด้วย ID และเลือกเฉพาะรูปหลัก (order=0)
//     WHERE p.product_id IN (${placeholders})
//     `,
//     ...norm
//   );
//   
//   // ส่วนนี้ยังคงทำหน้าที่เรียงลำดับผลลัพธ์ตาม array `ids` ที่ส่งมา
//   const mapped = rows.map(mapRowToUI);
//   const mapById = new Map(mapped.map((p) => [p.id, p]));
//   return norm.map((id) => mapById.get(id)).filter(Boolean) as UIProduct[];
// }

// /** ค้นหา/ฟิลเตอร์ + แบ่งหน้า (SQL) */
// export async function queryProducts(params: ProductQuery) {
//   await ensureTZ();

//   const page = Math.max(1, Math.floor(params.page ?? 1));
//   const pageSize = Math.min(200, Math.max(1, Math.floor(params.pageSize ?? 24)));
//   const offset = (page - 1) * pageSize;

//   const { where, params: p } = buildWhere(params);
//   const orderBy = buildOrderBy(params.sort);

//   // total (cast กัน BigInt)
//   const totalRows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `SELECT CAST(COUNT(*) AS UNSIGNED) AS total FROM ${TABLE} ${where}`,
//     ...p
//   );
//   const total = Number(totalRows?.[0]?.total ?? 0);

//   // items
//   const items: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//     SELECT
//       product_id, product_name, product_brand, product_sku, product_filename,
//       product_price, discount_label, image_url, visible, display_order,
//       rating_score, rating_count, category_id, product_uom
//     FROM ${TABLE}
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

// /** ===== Mutations (คงอินเตอร์เฟซเดิม) ===== */

// export async function setVisible(id: UIProduct["id"], visible: boolean) {
//   await ensureTZ();
//   await prismaInterlink.$executeRawUnsafe(
//     `UPDATE ${TABLE} SET visible = ?, updated_at = NOW() WHERE product_id = ?`,
//     visible ? 1 : 0,
//     coerceId(id)
//   );
// }

// export async function toggleVisible(id: UIProduct["id"]) {
//   await ensureTZ();
//   await prismaInterlink.$executeRawUnsafe(
//     `UPDATE ${TABLE} SET visible = IF(visible=1,0,1), updated_at = NOW() WHERE product_id = ?`,
//     coerceId(id)
//   );
// }

// export async function remove(id: UIProduct["id"]) {
//   await ensureTZ();
//   await prismaInterlink.$executeRawUnsafe(
//     `DELETE FROM ${TABLE} WHERE product_id = ?`,
//     coerceId(id)
//   );
// }

// export async function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
//   await ensureTZ();
//   if (!orders?.length) return;

//   const ids = orders.map((o) => Number(coerceId(o.id)));
//   const caseWhen = orders
//     .map((o) => `WHEN ${Number(coerceId(o.id))} THEN ${Number(o.order)}`)
//     .join(" ");
//   const inList = ids.join(", ");

//   const sql = `
//     UPDATE ${TABLE}
//     SET display_order = CASE product_id ${caseWhen} END,
//         updated_at = NOW()
//     WHERE product_id IN (${inList})
//   `;
//   await prismaInterlink.$executeRawUnsafe(sql);
// }

// export async function upsert(p: Partial<UIProduct>): Promise<UIProduct> {
//   await ensureTZ();
//   const hasId = typeof p.id !== "undefined" && p.id !== null;

//   if (hasId) {
//     // UPDATE เฉพาะฟิลด์ที่ส่งมา
//     const fields: string[] = [];
//     const values: any[] = [];
//     const push = (col: string, val: any) => { fields.push(`${col} = ?`); values.push(val); };

//     if (typeof p.name !== "undefined")        push("product_name", String(p.name));
//     if (typeof p.brand !== "undefined")       push("product_brand", p.brand ?? null);
//     if (typeof p.sku !== "undefined")         push("product_filename", p.sku ?? null); // ใช้ช่องเดิมตาม mock
//     if (typeof p.price !== "undefined")       push("product_price", Number(p.price) || 0);
//     if (typeof p.discountPercent !== "undefined") push("discount_label", toDiscountLabel(p.discountPercent));
//     if (typeof p.image_url !== "undefined")   push("image_url", p.image_url ?? null);
//     if (typeof p.visible !== "undefined")     push("visible", p.visible ? 1 : 0);
//     if (typeof p.order !== "undefined")       push("display_order", Number(p.order) || 0);
//     if (typeof p.rating !== "undefined")      push("rating_score", p.rating == null ? null : Number(p.rating));
//     if (typeof p.reviews !== "undefined")     push("rating_count", p.reviews == null ? null : Number(p.reviews));
//     if (typeof p.category_id !== "undefined") push("category_id", p.category_id == null ? null : coerceId(p.category_id));
//     if (typeof p.uom !== "undefined")         push("product_uom", p.uom ?? null);

//     if (fields.length) {
//       const sql = `UPDATE ${TABLE} SET ${fields.join(", ")}, updated_at = NOW() WHERE product_id = ?`;
//       values.push(coerceId(p.id));
//       await prismaInterlink.$executeRawUnsafe(sql, ...values);
//     }

//     const row = await getById(p.id as any);
//     if (!row) throw new Error("Product not found after update");
//     return row;
//   } else {
//     // INSERT ใหม่ (order = max(display_order)+1)
//     const nextOrderRows: any[] = await prismaInterlink.$queryRawUnsafe(
//       `SELECT COALESCE(MAX(display_order), -1) + 1 AS nextOrder FROM ${TABLE}`
//     );
//     const nextOrder = Number(nextOrderRows?.[0]?.nextOrder ?? 0);

//     await prismaInterlink.$executeRawUnsafe(
//       `
//       INSERT INTO ${TABLE}
//         (product_name, product_brand, product_filename, product_price, discount_label, image_url, visible,
//          display_order, rating_score, rating_count, category_id, product_uom, created_at, updated_at)
//       VALUES
//         (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
//       `,
//       String(p.name ?? "New Product"),
//       p.brand ?? null,
//       p.sku ?? null,
//       Number(p.price) || 0,
//       toDiscountLabel(p.discountPercent),
//       p.image_url ?? null,
//       p.visible ? 1 : 0,
//       nextOrder,
//       p.rating == null ? null : Number(p.rating),
//       p.reviews == null ? null : Number(p.reviews),
//       p.category_id == null ? null : coerceId(p.category_id),
//       p.uom ?? null
//     );

//     // ดึง id ที่เพิ่ง insert มา (cast เป็น number กัน BigInt)
//     const insertedIdRows: any[] = await prismaInterlink.$queryRawUnsafe(`SELECT LAST_INSERT_ID() AS id`);
//     const newId = Number(insertedIdRows?.[0]?.id);
//     const row = await getById(newId);
//     if (!row) throw new Error("Product not found after insert");
//     return row;
//   }
// }

// /** (dev only) reset — ไม่ยุ่ง DB เพื่อเลี่ยงลบข้อมูลจริง */
// export function reset() {
//   meta = { ...meta, updatedAt: new Date().toISOString() };
// }


// v.1.1.13 ===================================================================


// v.1.1.12 ===========================================
// src/app/api/mock/products/_store.ts
// // DB-backed implementation (drop-in replacement of the old in-memory store)

// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";

// /** ===== Types (คงแบบเดิม) ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;

//   rating?: number;   // 0..5
//   reviews?: number;  // count

//   category_id?: number | string;
//   uom?: string;
// };

// /** ===== (เหมือนเดิม) Card parts visibility ===== */
// export type CardPartsVisibility = {
//   image: boolean;
//   discountBadge: boolean;
//   brandLogo: boolean;
//   frame: boolean;

//   brandName: boolean;
//   sku: boolean;
//   name: boolean;
//   ratingReview: boolean;
//   category: boolean;
//   price: boolean;
//   originalPrice: boolean;
//   uom: boolean;
// };

// export const defaultCardPartsVisibility: CardPartsVisibility = {
//   image: true,
//   discountBadge: true,
//   brandLogo: true,
//   frame: true,

//   brandName: true,
//   sku: true,
//   name: true,
//   ratingReview: true,
//   category: true,
//   price: true,
//   originalPrice: true,
//   uom: true,
// };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
//   cardParts: CardPartsVisibility;
// };

// /** ===== (เหมือนเดิม) Query types ===== */
// export type ProductQuery = {
//   q?: string;
//   category_id?: number | string;
//   /** ใช้เวลาหน้าค้นหาตรงกับชื่อหมวด — เติมเข้ามาเพื่อให้ route.ts ใช้ได้เหมือนเดิม */
//   matchCategoryIds?: Array<number | string>;
//   visible?: boolean;
//   sort?: "order" | "newest" | "price_asc" | "price_desc" | "discount_desc" | "rating_desc";
//   page?: number;     // 1-based
//   pageSize?: number; // e.g. 24/48/96
// };

// /** ===== In-memory meta (จะ sync กับ DB เมื่ออ่าน/เขียน) ===== */
// let meta: ProductsMeta = {
//   title: "สินค้าทั้งหมด",
//   subtitle: "ข้อมูลจากฐานข้อมูล (DB-backed)",
//   updatedAt: new Date().toISOString(),
//   cardParts: { ...defaultCardPartsVisibility },
// };

// /** ===== Helpers ===== */
// const TABLE = "products_clearance";
// const META_TABLE = "products_meta";

// /** บังคับ session TZ +07:00 (กันเวลาคลาดเคลื่อน) */
// async function ensureTZ() {
//   try {
//     await setInterlinkSessionTZ("+07:00");
//   } catch {
//     /* ignore */
//   }
// }

// /** แปลง id ที่เป็นตัวเลขให้เป็น number */
// const coerceId = (v: any) => (isNaN(Number(v)) ? v : Number(v));

// /** "60%" -> 60 */
// function parseDiscountLabel(label?: string | null): number | undefined {
//   if (!label) return undefined;
//   const m = String(label).match(/(\d+(?:\.\d+)?)/);
//   return m ? Math.round(Number(m[1])) : undefined;
// }
// /** 60 -> "60%" (สำหรับ upsert) */
// function toDiscountLabel(n?: number): string | null {
//   if (typeof n !== "number" || !Number.isFinite(n)) return null;
//   const v = Math.max(0, Math.min(100, Math.round(n)));
//   return `${v}%`;
// }

// /** map แถว DB -> UIProduct (แปลง BigInt/Decimal เป็น number เสมอ) */
// function mapRowToUI(r: any): UIProduct {
//   return {
//     id: Number(r.product_id), // ✅ กัน BigInt
//     name: String(r.product_name ?? ""),
//     brand: r.product_brand ?? undefined,
//     // ใช้ sku จริงก่อน ถ้าไม่มีค่อย fallback เป็น filename (คงพฤติกรรมก่อนได้)
//     sku: r.product_sku ?? r.product_filename ?? undefined,
//     price: Number(r.product_price ?? 0),
//     discountPercent: parseDiscountLabel(r.discount_label),
//     image_url: r.image_url ?? undefined,
//     visible: r.visible === 1 || r.visible === true,
//     order: Number(r.display_order ?? 0),
//     rating: r.rating_score != null ? Number(r.rating_score) : undefined,
//     reviews: r.rating_count != null ? Number(r.rating_count) : undefined,
//     category_id:
//       r.category_id == null
//         ? undefined
//         : (Number.isFinite(Number(r.category_id)) ? Number(r.category_id) : String(r.category_id)),
//     uom: r.product_uom ?? undefined,
//   };
// }

// /** WHERE builder — คงฟิลเตอร์เดิม และรองรับ matchCategoryIds (OR กับ q หา category) */
// function buildWhere(q: ProductQuery) {
//   const conds: string[] = [];
//   const params: any[] = [];

//   if (typeof q.visible === "boolean") {
//     conds.push("visible = ?");
//     params.push(q.visible ? 1 : 0);
//   }
//   if (typeof q.category_id !== "undefined") {
//     conds.push("category_id = ?");
//     params.push(coerceId(q.category_id));
//   }

//   // ค้นหาในชื่อ/แบรนด์/SKU/filename
//   if (q.q && q.q.trim()) {
//     const like = `%${q.q.trim()}%`;
//     const searchCond = "(product_name LIKE ? OR product_brand LIKE ? OR product_sku LIKE ? OR product_filename LIKE ?)";
//     if (q.matchCategoryIds && q.matchCategoryIds.length) {
//       const ids = q.matchCategoryIds.map(coerceId);
//       const ph = ids.map(() => "?").join(",");
//       conds.push(`(${searchCond} OR category_id IN (${ph}))`);
//       params.push(like, like, like, like, ...ids);
//     } else {
//       conds.push(searchCond);
//       params.push(like, like, like, like);
//     }
//   }

//   const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
//   return { where, params };
// }

// /** ORDER BY builder (คง semantics เดิม) */
// function buildOrderBy(sort?: ProductQuery["sort"]) {
//   const s = sort ?? "order";
//   switch (s) {
//     case "price_asc":
//       return "ORDER BY product_price ASC, display_order ASC, product_id ASC";
//     case "price_desc":
//       return "ORDER BY product_price DESC, display_order ASC, product_id ASC";
//     case "discount_desc":
//       return "ORDER BY CAST(REPLACE(discount_label,'%','') AS UNSIGNED) DESC, display_order ASC, product_id ASC";
//     case "rating_desc":
//       return "ORDER BY rating_score DESC, display_order ASC, product_id ASC";
//     case "newest":
//       return "ORDER BY product_id DESC";
//     case "order":
//     default:
//       return "ORDER BY display_order ASC, product_id ASC";
//   }
// }

// /** ===== Queries ===== */
// export async function getAll(opts?: { includeHidden?: boolean }): Promise<UIProduct[]> {
//   await ensureTZ();
//   const includeHidden = opts?.includeHidden ?? true;
//   const where = includeHidden ? "" : "WHERE visible = 1";

//   const rows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//     SELECT
//       product_id, product_name, product_brand, product_sku, product_filename,
//       product_price, discount_label, image_url, visible, display_order,
//       rating_score, rating_count, category_id, product_uom
//     FROM ${TABLE}
//     ${where}
//     ORDER BY display_order ASC, product_id ASC
//     `
//   );
//   return rows.map(mapRowToUI);
// }

// /** ===== Meta: อ่านจากตาราง products_meta (id=1) ===== */
// export async function getMeta(): Promise<ProductsMeta> {
//   await ensureTZ();

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
//     meta = { ...meta, updatedAt: new Date().toISOString() };
//     return { ...meta, cardParts: { ...defaultCardPartsVisibility, ...(meta.cardParts ?? {}) } };
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
//     title: r.title ?? meta.title,
//     subtitle: r.subtitle ?? meta.subtitle,
//     updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : meta.updatedAt,
//     cardParts: { ...defaultCardPartsVisibility, ...filtered },
//   };

//   // sync เข้า in-memory ให้ตรงกับ DB
//   meta = { ...merged };

//   return merged;
// }

// /** ===== Meta: เขียนกลับ DB (upsert id=1) ===== */
// type MetaPatch =
//   Partial<Omit<ProductsMeta, "cardParts">> & { cardParts?: Partial<CardPartsVisibility> };

// export async function setMeta(patch: MetaPatch) {
//   await ensureTZ();

//   // โหลดของเดิมจาก DB (หรือ default)
//   const current = await getMeta();

//   // รวมค่าใหม่ (รวม nested cardParts)
//   const next: ProductsMeta = {
//     title: typeof patch.title === "string" && patch.title.trim() ? patch.title.trim() : current.title,
//     subtitle: typeof patch.subtitle === "string" && patch.subtitle.trim() ? patch.subtitle.trim() : current.subtitle,
//     updatedAt: new Date().toISOString(),
//     cardParts: { ...current.cardParts, ...(patch.cardParts ?? {}) },
//   };

//   // Upsert: ถ้ามีแล้ว → UPDATE, ถ้าไม่มีก็ INSERT id=1
//   const existsRows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `SELECT 1 AS ok FROM ${META_TABLE} WHERE id = 1 LIMIT 1`
//   );
//   const cardPartsJson = JSON.stringify(next.cardParts);

//   if (existsRows?.length) {
//     await prismaInterlink.$executeRawUnsafe(
//       `
//       UPDATE ${META_TABLE}
//       SET title = ?, subtitle = ?, card_parts = ?, updated_at = NOW()
//       WHERE id = 1
//       `,
//       next.title,
//       next.subtitle,
//       cardPartsJson
//     );
//   } else {
//     await prismaInterlink.$executeRawUnsafe(
//       `
//       INSERT INTO ${META_TABLE} (id, title, subtitle, card_parts, updated_at)
//       VALUES (1, ?, ?, ?, NOW())
//       `,
//       next.title,
//       next.subtitle,
//       cardPartsJson
//     );
//   }

//   // sync เข้า in-memory
//   meta = { ...next };
// }

// /** อ่านสินค้าตาม id เดียว */
// export async function getById(id: UIProduct["id"]): Promise<UIProduct | undefined> {
//   await ensureTZ();
//   const rows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//     SELECT
//       product_id, product_name, product_brand, product_sku, product_filename,
//       product_price, discount_label, image_url, visible, display_order,
//       rating_score, rating_count, category_id, product_uom
//     FROM ${TABLE}
//     WHERE product_id = ?
//     LIMIT 1
//     `,
//     coerceId(id)
//   );
//   return rows.length ? mapRowToUI(rows[0]) : undefined;
// }

// /** อ่านสินค้าหลาย id และคงลำดับตามที่ส่งมา */
// export async function getManyByIds(ids: Array<UIProduct["id"]>): Promise<UIProduct[]> {
//   await ensureTZ();
//   if (!Array.isArray(ids) || ids.length === 0) return [];
//   const norm = ids.map((v) => coerceId(v));
//   const placeholders = norm.map(() => "?").join(", ");

//   const rows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//     SELECT
//       product_id, product_name, product_brand, product_sku, product_filename,
//       product_price, discount_label, image_url, visible, display_order,
//       rating_score, rating_count, category_id, product_uom
//     FROM ${TABLE}
//     WHERE product_id IN (${placeholders})
//     `,
//     ...norm
//   );
//   const mapped = rows.map(mapRowToUI);
//   const mapById = new Map(mapped.map((p) => [p.id, p]));
//   return norm.map((id) => mapById.get(id)).filter(Boolean) as UIProduct[];
// }

// /** ค้นหา/ฟิลเตอร์ + แบ่งหน้า (SQL) */
// export async function queryProducts(params: ProductQuery) {
//   await ensureTZ();

//   const page = Math.max(1, Math.floor(params.page ?? 1));
//   const pageSize = Math.min(200, Math.max(1, Math.floor(params.pageSize ?? 24)));
//   const offset = (page - 1) * pageSize;

//   const { where, params: p } = buildWhere(params);
//   const orderBy = buildOrderBy(params.sort);

//   // total (cast กัน BigInt)
//   const totalRows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `SELECT CAST(COUNT(*) AS UNSIGNED) AS total FROM ${TABLE} ${where}`,
//     ...p
//   );
//   const total = Number(totalRows?.[0]?.total ?? 0);

//   // items
//   const items: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//     SELECT
//       product_id, product_name, product_brand, product_sku, product_filename,
//       product_price, discount_label, image_url, visible, display_order,
//       rating_score, rating_count, category_id, product_uom
//     FROM ${TABLE}
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

// /** ===== Mutations (คงอินเตอร์เฟซเดิม) ===== */

// export async function setVisible(id: UIProduct["id"], visible: boolean) {
//   await ensureTZ();
//   await prismaInterlink.$executeRawUnsafe(
//     `UPDATE ${TABLE} SET visible = ?, updated_at = NOW() WHERE product_id = ?`,
//     visible ? 1 : 0,
//     coerceId(id)
//   );
// }

// export async function toggleVisible(id: UIProduct["id"]) {
//   await ensureTZ();
//   await prismaInterlink.$executeRawUnsafe(
//     `UPDATE ${TABLE} SET visible = IF(visible=1,0,1), updated_at = NOW() WHERE product_id = ?`,
//     coerceId(id)
//   );
// }

// export async function remove(id: UIProduct["id"]) {
//   await ensureTZ();
//   await prismaInterlink.$executeRawUnsafe(
//     `DELETE FROM ${TABLE} WHERE product_id = ?`,
//     coerceId(id)
//   );
// }

// export async function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
//   await ensureTZ();
//   if (!orders?.length) return;

//   const ids = orders.map((o) => Number(coerceId(o.id)));
//   const caseWhen = orders
//     .map((o) => `WHEN ${Number(coerceId(o.id))} THEN ${Number(o.order)}`)
//     .join(" ");
//   const inList = ids.join(", ");

//   const sql = `
//     UPDATE ${TABLE}
//     SET display_order = CASE product_id ${caseWhen} END,
//         updated_at = NOW()
//     WHERE product_id IN (${inList})
//   `;
//   await prismaInterlink.$executeRawUnsafe(sql);
// }

// export async function upsert(p: Partial<UIProduct>): Promise<UIProduct> {
//   await ensureTZ();
//   const hasId = typeof p.id !== "undefined" && p.id !== null;

//   if (hasId) {
//     // UPDATE เฉพาะฟิลด์ที่ส่งมา
//     const fields: string[] = [];
//     const values: any[] = [];
//     const push = (col: string, val: any) => { fields.push(`${col} = ?`); values.push(val); };

//     if (typeof p.name !== "undefined")        push("product_name", String(p.name));
//     if (typeof p.brand !== "undefined")       push("product_brand", p.brand ?? null);
//     if (typeof p.sku !== "undefined")         push("product_filename", p.sku ?? null); // ใช้ช่องเดิมตาม mock
//     if (typeof p.price !== "undefined")       push("product_price", Number(p.price) || 0);
//     if (typeof p.discountPercent !== "undefined") push("discount_label", toDiscountLabel(p.discountPercent));
//     if (typeof p.image_url !== "undefined")   push("image_url", p.image_url ?? null);
//     if (typeof p.visible !== "undefined")     push("visible", p.visible ? 1 : 0);
//     if (typeof p.order !== "undefined")       push("display_order", Number(p.order) || 0);
//     if (typeof p.rating !== "undefined")      push("rating_score", p.rating == null ? null : Number(p.rating));
//     if (typeof p.reviews !== "undefined")     push("rating_count", p.reviews == null ? null : Number(p.reviews));
//     if (typeof p.category_id !== "undefined") push("category_id", p.category_id == null ? null : coerceId(p.category_id));
//     if (typeof p.uom !== "undefined")         push("product_uom", p.uom ?? null);

//     if (fields.length) {
//       const sql = `UPDATE ${TABLE} SET ${fields.join(", ")}, updated_at = NOW() WHERE product_id = ?`;
//       values.push(coerceId(p.id));
//       await prismaInterlink.$executeRawUnsafe(sql, ...values);
//     }

//     const row = await getById(p.id as any);
//     if (!row) throw new Error("Product not found after update");
//     return row;
//   } else {
//     // INSERT ใหม่ (order = max(display_order)+1)
//     const nextOrderRows: any[] = await prismaInterlink.$queryRawUnsafe(
//       `SELECT COALESCE(MAX(display_order), -1) + 1 AS nextOrder FROM ${TABLE}`
//     );
//     const nextOrder = Number(nextOrderRows?.[0]?.nextOrder ?? 0);

//     await prismaInterlink.$executeRawUnsafe(
//       `
//       INSERT INTO ${TABLE}
//         (product_name, product_brand, product_filename, product_price, discount_label, image_url, visible,
//          display_order, rating_score, rating_count, category_id, product_uom, created_at, updated_at)
//       VALUES
//         (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
//       `,
//       String(p.name ?? "New Product"),
//       p.brand ?? null,
//       p.sku ?? null,
//       Number(p.price) || 0,
//       toDiscountLabel(p.discountPercent),
//       p.image_url ?? null,
//       p.visible ? 1 : 0,
//       nextOrder,
//       p.rating == null ? null : Number(p.rating),
//       p.reviews == null ? null : Number(p.reviews),
//       p.category_id == null ? null : coerceId(p.category_id),
//       p.uom ?? null
//     );

//     // ดึง id ที่เพิ่ง insert มา (cast เป็น number กัน BigInt)
//     const insertedIdRows: any[] = await prismaInterlink.$queryRawUnsafe(`SELECT LAST_INSERT_ID() AS id`);
//     const newId = Number(insertedIdRows?.[0]?.id);
//     const row = await getById(newId);
//     if (!row) throw new Error("Product not found after insert");
//     return row;
//   }
// }

// /** (dev only) reset — ไม่ยุ่ง DB เพื่อเลี่ยงลบข้อมูลจริง */
// export function reset() {
//   meta = { ...meta, updatedAt: new Date().toISOString() };
// }

// v.1.1.12 ===========================================

// v.1.1.11 ============================================
// // src/app/api/mock/products/_store.ts
// // DB-backed implementation (drop-in replacement of the old in-memory store)

// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";

// /** ===== Types (คงแบบเดิม) ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;

//   rating?: number;   // 0..5
//   reviews?: number;  // count

//   category_id?: number | string;
//   uom?: string;
// };

// /** ===== (เหมือนเดิม) Card parts visibility ===== */
// export type CardPartsVisibility = {
//   image: boolean;
//   discountBadge: boolean;
//   brandLogo: boolean;
//   frame: boolean;

//   brandName: boolean;
//   sku: boolean;
//   name: boolean;
//   ratingReview: boolean;
//   category: boolean;
//   price: boolean;
//   originalPrice: boolean;
//   uom: boolean;
// };

// export const defaultCardPartsVisibility: CardPartsVisibility = {
//   image: true,
//   discountBadge: true,
//   brandLogo: true,
//   frame: true,

//   brandName: true,
//   sku: true,
//   name: true,
//   ratingReview: true,
//   category: true,
//   price: true,
//   originalPrice: true,
//   uom: true,
// };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
//   cardParts: CardPartsVisibility;
// };

// /** ===== (เหมือนเดิม) Query types ===== */
// export type ProductQuery = {
//   q?: string;
//   category_id?: number | string;
//   /** ใช้เวลาหน้าค้นหาตรงกับชื่อหมวด — เติมเข้ามาเพื่อให้ route.ts ใช้ได้เหมือนเดิม */
//   matchCategoryIds?: Array<number | string>;
//   visible?: boolean;
//   sort?: "order" | "newest" | "price_asc" | "price_desc" | "discount_desc" | "rating_desc";
//   page?: number;     // 1-based
//   pageSize?: number; // e.g. 24/48/96
// };

// /** ===== In-memory meta only (คงพฤติกรรมเดิม) ===== */
// let meta: ProductsMeta = {
//   title: "สินค้าทั้งหมด",
//   subtitle: "ข้อมูลจากฐานข้อมูล (DB-backed)",
//   updatedAt: new Date().toISOString(),
//   cardParts: { ...defaultCardPartsVisibility },
// };

// /** ===== Helpers ===== */
// const TABLE = "products_clearance";

// /** บังคับ session TZ +07:00 (กันเวลาคลาดเคลื่อน) */
// async function ensureTZ() {
//   try {
//     await setInterlinkSessionTZ("+07:00");
//   } catch {
//     /* ignore */
//   }
// }

// /** แปลง id ที่เป็นตัวเลขให้เป็น number */
// const coerceId = (v: any) => (isNaN(Number(v)) ? v : Number(v));

// /** "60%" -> 60 */
// function parseDiscountLabel(label?: string | null): number | undefined {
//   if (!label) return undefined;
//   const m = String(label).match(/(\d+(?:\.\d+)?)/);
//   return m ? Math.round(Number(m[1])) : undefined;
// }
// /** 60 -> "60%" (สำหรับ upsert) */
// function toDiscountLabel(n?: number): string | null {
//   if (typeof n !== "number" || !Number.isFinite(n)) return null;
//   const v = Math.max(0, Math.min(100, Math.round(n)));
//   return `${v}%`;
// }

// /** map แถว DB -> UIProduct (แปลง BigInt/Decimal เป็น number เสมอ) */
// function mapRowToUI(r: any): UIProduct {
//   return {
//     id: Number(r.product_id), // ✅ กัน BigInt
//     name: String(r.product_name ?? ""),
//     brand: r.product_brand ?? undefined,
//     // ใช้ sku จริงก่อน ถ้าไม่มีค่อย fallback เป็น filename (คงพฤติกรรมก่อนได้)
//     sku: r.product_sku ?? r.product_filename ?? undefined,
//     price: Number(r.product_price ?? 0),
//     discountPercent: parseDiscountLabel(r.discount_label),
//     image_url: r.image_url ?? undefined,
//     visible: r.visible === 1 || r.visible === true,
//     order: Number(r.display_order ?? 0),
//     rating: r.rating_score != null ? Number(r.rating_score) : undefined,
//     reviews: r.rating_count != null ? Number(r.rating_count) : undefined,
//     category_id:
//       r.category_id == null
//         ? undefined
//         : (Number.isFinite(Number(r.category_id)) ? Number(r.category_id) : String(r.category_id)),
//     uom: r.product_uom ?? undefined,
//   };
// }

// /** WHERE builder — คงฟิลเตอร์เดิม และรองรับ matchCategoryIds (OR กับ q หา category) */
// function buildWhere(q: ProductQuery) {
//   const conds: string[] = [];
//   const params: any[] = [];

//   if (typeof q.visible === "boolean") {
//     conds.push("visible = ?");
//     params.push(q.visible ? 1 : 0);
//   }
//   if (typeof q.category_id !== "undefined") {
//     conds.push("category_id = ?");
//     params.push(coerceId(q.category_id));
//   }

//   // ค้นหาในชื่อ/แบรนด์/SKU/filename
//   if (q.q && q.q.trim()) {
//     const like = `%${q.q.trim()}%`;
//     const searchCond = "(product_name LIKE ? OR product_brand LIKE ? OR product_sku LIKE ? OR product_filename LIKE ?)";
//     if (q.matchCategoryIds && q.matchCategoryIds.length) {
//       const ids = q.matchCategoryIds.map(coerceId);
//       const ph = ids.map(() => "?").join(",");
//       conds.push(`(${searchCond} OR category_id IN (${ph}))`);
//       params.push(like, like, like, like, ...ids);
//     } else {
//       conds.push(searchCond);
//       params.push(like, like, like, like);
//     }
//   }

//   const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
//   return { where, params };
// }

// /** ORDER BY builder (คง semantics เดิม) */
// function buildOrderBy(sort?: ProductQuery["sort"]) {
//   const s = sort ?? "order";
//   switch (s) {
//     case "price_asc":
//       return "ORDER BY product_price ASC, display_order ASC, product_id ASC";
//     case "price_desc":
//       return "ORDER BY product_price DESC, display_order ASC, product_id ASC";
//     case "discount_desc":
//       return "ORDER BY CAST(REPLACE(discount_label,'%','') AS UNSIGNED) DESC, display_order ASC, product_id ASC";
//     case "rating_desc":
//       return "ORDER BY rating_score DESC, display_order ASC, product_id ASC";
//     case "newest":
//       return "ORDER BY product_id DESC";
//     case "order":
//     default:
//       return "ORDER BY display_order ASC, product_id ASC";
//   }
// }

// /** ===== Queries ===== */
// export async function getAll(opts?: { includeHidden?: boolean }): Promise<UIProduct[]> {
//   await ensureTZ();
//   const includeHidden = opts?.includeHidden ?? true;
//   const where = includeHidden ? "" : "WHERE visible = 1";

//   const rows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//     SELECT
//       product_id, product_name, product_brand, product_sku, product_filename,
//       product_price, discount_label, image_url, visible, display_order,
//       rating_score, rating_count, category_id, product_uom
//     FROM ${TABLE}
//     ${where}
//     ORDER BY display_order ASC, product_id ASC
//     `
//   );
//   return rows.map(mapRowToUI);
// }

// export async function getMeta(): Promise<ProductsMeta> {
//   // ยังเก็บ meta ในหน่วยความจำเหมือนเดิม
//   return { ...meta, cardParts: { ...meta.cardParts } };
// }

// /** อ่านสินค้าตาม id เดียว */
// export async function getById(id: UIProduct["id"]): Promise<UIProduct | undefined> {
//   await ensureTZ();
//   const rows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//     SELECT
//       product_id, product_name, product_brand, product_sku, product_filename,
//       product_price, discount_label, image_url, visible, display_order,
//       rating_score, rating_count, category_id, product_uom
//     FROM ${TABLE}
//     WHERE product_id = ?
//     LIMIT 1
//     `,
//     coerceId(id)
//   );
//   return rows.length ? mapRowToUI(rows[0]) : undefined;
// }

// /** อ่านสินค้าหลาย id และคงลำดับตามที่ส่งมา */
// export async function getManyByIds(ids: Array<UIProduct["id"]>): Promise<UIProduct[]> {
//   await ensureTZ();
//   if (!Array.isArray(ids) || ids.length === 0) return [];
//   const norm = ids.map((v) => coerceId(v));
//   const placeholders = norm.map(() => "?").join(", ");

//   const rows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//     SELECT
//       product_id, product_name, product_brand, product_sku, product_filename,
//       product_price, discount_label, image_url, visible, display_order,
//       rating_score, rating_count, category_id, product_uom
//     FROM ${TABLE}
//     WHERE product_id IN (${placeholders})
//     `,
//     ...norm
//   );
//   const mapped = rows.map(mapRowToUI);
//   const mapById = new Map(mapped.map((p) => [p.id, p]));
//   return norm.map((id) => mapById.get(id)).filter(Boolean) as UIProduct[];
// }

// /** ค้นหา/ฟิลเตอร์ + แบ่งหน้า (SQL) */
// export async function queryProducts(params: ProductQuery) {
//   await ensureTZ();

//   const page = Math.max(1, Math.floor(params.page ?? 1));
//   const pageSize = Math.min(200, Math.max(1, Math.floor(params.pageSize ?? 24)));
//   const offset = (page - 1) * pageSize;

//   const { where, params: p } = buildWhere(params);
//   const orderBy = buildOrderBy(params.sort);

//   // total (cast กัน BigInt)
//   const totalRows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `SELECT CAST(COUNT(*) AS UNSIGNED) AS total FROM ${TABLE} ${where}`,
//     ...p
//   );
//   const total = Number(totalRows?.[0]?.total ?? 0);

//   // items
//   const items: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//     SELECT
//       product_id, product_name, product_brand, product_sku, product_filename,
//       product_price, discount_label, image_url, visible, display_order,
//       rating_score, rating_count, category_id, product_uom
//     FROM ${TABLE}
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

// /** ===== Mutations (คงอินเตอร์เฟซเดิม) ===== */
// type MetaPatch =
//   Partial<Omit<ProductsMeta, "cardParts">> & { cardParts?: Partial<CardPartsVisibility> };

// export async function setMeta(patch: MetaPatch) {
//   // คงเก็บใน memory (ไม่ได้ไปเขียนตาราง products_meta ที่คุณมี)
//   meta = {
//     ...meta,
//     ...patch,
//     cardParts: { ...meta.cardParts, ...(patch.cardParts ?? {}) },
//     updatedAt: new Date().toISOString(),
//   };
// }

// export async function setVisible(id: UIProduct["id"], visible: boolean) {
//   await ensureTZ();
//   await prismaInterlink.$executeRawUnsafe(
//     `UPDATE ${TABLE} SET visible = ?, updated_at = NOW() WHERE product_id = ?`,
//     visible ? 1 : 0,
//     coerceId(id)
//   );
// }

// export async function toggleVisible(id: UIProduct["id"]) {
//   await ensureTZ();
//   await prismaInterlink.$executeRawUnsafe(
//     `UPDATE ${TABLE} SET visible = IF(visible=1,0,1), updated_at = NOW() WHERE product_id = ?`,
//     coerceId(id)
//   );
// }

// export async function remove(id: UIProduct["id"]) {
//   await ensureTZ();
//   await prismaInterlink.$executeRawUnsafe(
//     `DELETE FROM ${TABLE} WHERE product_id = ?`,
//     coerceId(id)
//   );
// }

// export async function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
//   await ensureTZ();
//   if (!orders?.length) return;

//   const ids = orders.map((o) => Number(coerceId(o.id)));
//   const caseWhen = orders
//     .map((o) => `WHEN ${Number(coerceId(o.id))} THEN ${Number(o.order)}`)
//     .join(" ");
//   const inList = ids.join(", ");

//   const sql = `
//     UPDATE ${TABLE}
//     SET display_order = CASE product_id ${caseWhen} END,
//         updated_at = NOW()
//     WHERE product_id IN (${inList})
//   `;
//   await prismaInterlink.$executeRawUnsafe(sql);
// }

// export async function upsert(p: Partial<UIProduct>): Promise<UIProduct> {
//   await ensureTZ();
//   const hasId = typeof p.id !== "undefined" && p.id !== null;

//   if (hasId) {
//     // UPDATE เฉพาะฟิลด์ที่ส่งมา
//     const fields: string[] = [];
//     const values: any[] = [];
//     const push = (col: string, val: any) => { fields.push(`${col} = ?`); values.push(val); };

//     if (typeof p.name !== "undefined")        push("product_name", String(p.name));
//     if (typeof p.brand !== "undefined")       push("product_brand", p.brand ?? null);
//     if (typeof p.sku !== "undefined")         push("product_filename", p.sku ?? null); // ใช้ช่องเดิมตาม mock
//     if (typeof p.price !== "undefined")       push("product_price", Number(p.price) || 0);
//     if (typeof p.discountPercent !== "undefined") push("discount_label", toDiscountLabel(p.discountPercent));
//     if (typeof p.image_url !== "undefined")   push("image_url", p.image_url ?? null);
//     if (typeof p.visible !== "undefined")     push("visible", p.visible ? 1 : 0);
//     if (typeof p.order !== "undefined")       push("display_order", Number(p.order) || 0);
//     if (typeof p.rating !== "undefined")      push("rating_score", p.rating == null ? null : Number(p.rating));
//     if (typeof p.reviews !== "undefined")     push("rating_count", p.reviews == null ? null : Number(p.reviews));
//     if (typeof p.category_id !== "undefined") push("category_id", p.category_id == null ? null : coerceId(p.category_id));
//     if (typeof p.uom !== "undefined")         push("product_uom", p.uom ?? null);

//     if (fields.length) {
//       const sql = `UPDATE ${TABLE} SET ${fields.join(", ")}, updated_at = NOW() WHERE product_id = ?`;
//       values.push(coerceId(p.id));
//       await prismaInterlink.$executeRawUnsafe(sql, ...values);
//     }

//     const row = await getById(p.id as any);
//     if (!row) throw new Error("Product not found after update");
//     return row;
//   } else {
//     // INSERT ใหม่ (order = max(display_order)+1)
//     const nextOrderRows: any[] = await prismaInterlink.$queryRawUnsafe(
//       `SELECT COALESCE(MAX(display_order), -1) + 1 AS nextOrder FROM ${TABLE}`
//     );
//     const nextOrder = Number(nextOrderRows?.[0]?.nextOrder ?? 0);

//     await prismaInterlink.$executeRawUnsafe(
//       `
//       INSERT INTO ${TABLE}
//         (product_name, product_brand, product_filename, product_price, discount_label, image_url, visible,
//          display_order, rating_score, rating_count, category_id, product_uom, created_at, updated_at)
//       VALUES
//         (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
//       `,
//       String(p.name ?? "New Product"),
//       p.brand ?? null,
//       p.sku ?? null,
//       Number(p.price) || 0,
//       toDiscountLabel(p.discountPercent),
//       p.image_url ?? null,
//       p.visible ? 1 : 0,
//       nextOrder,
//       p.rating == null ? null : Number(p.rating),
//       p.reviews == null ? null : Number(p.reviews),
//       p.category_id == null ? null : coerceId(p.category_id),
//       p.uom ?? null
//     );

//     // ดึง id ที่เพิ่ง insert มา (cast เป็น number กัน BigInt)
//     const insertedIdRows: any[] = await prismaInterlink.$queryRawUnsafe(`SELECT LAST_INSERT_ID() AS id`);
//     const newId = Number(insertedIdRows?.[0]?.id);
//     const row = await getById(newId);
//     if (!row) throw new Error("Product not found after insert");
//     return row;
//   }
// }

// /** (dev only) reset — ไม่ยุ่ง DB เพื่อเลี่ยงลบข้อมูลจริง */
// export function reset() {
//   meta = { ...meta, updatedAt: new Date().toISOString() };
// }

// v.1.1.11 ============================================

// v.1.1.10 =============================================
// // src/app/api/mock/products/_store.ts

// /** ===== Types ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;

//   rating?: number;   // 0..5
//   reviews?: number;  // จำนวนรีวิว

//   category_id?: number | string;
//   uom?: string;      // <<< หน่วยสินค้า เช่น "ST.", "EA.", "PC."
// };

// /** ===== (NEW) Card parts visibility (ฝั่ง API เก็บค่าเดียวกับแอดมิน) ===== */
// export type CardPartsVisibility = {
//   image: boolean;
//   discountBadge: boolean;
//   brandLogo: boolean;
//   frame: boolean;

//   brandName: boolean;
//   sku: boolean;
//   name: boolean;
//   ratingReview: boolean;
//   category: boolean;
//   price: boolean;
//   originalPrice: boolean;
//   uom: boolean;
// };

// export const defaultCardPartsVisibility: CardPartsVisibility = {
//   image: true,
//   discountBadge: true,
//   brandLogo: true,
//   frame: true,

//   brandName: true,
//   sku: true,
//   name: true,
//   ratingReview: true,
//   category: true,
//   price: true,
//   originalPrice: true,
//   uom: true,
// };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
//   /** (NEW) การตั้งค่าการแสดงผลการ์ด */
//   cardParts: CardPartsVisibility;
// };

// /** ===== (NEW) Query types for admin listing ===== */
// export type ProductQuery = {
//   q?: string;
//   category_id?: number | string;
//   visible?: boolean;
//   sort?:
//     | "order"
//     | "newest"
//     | "price_asc"
//     | "price_desc"
//     | "discount_desc"
//     | "rating_desc";
//   page?: number;     // 1-based
//   pageSize?: number; // e.g. 24/48/96
// };

// /** ===== Seed from legacy-like sample ===== */
// const seedRows = [
//   { id: 1, name: "Fiber Optic Cable Single Mode 305m", brand: "COMMSCOPE", price: 2160, image: "/assets/fiber-optic-cable.jpg", sku: "AM-2120-02XG", discount: "60%", rating: 4.8, reviews: 156, category_id: 2, uom: "ST." },
//   { id: 2, name: "24-Port Gigabit Network Switch",      brand: "COMMSCOPE", price: 8530, image: "/assets/network-switch-professional.jpg", sku: "AM-2129", discount: "80%", rating: 4.6, reviews: 234, category_id: 9, uom: "EA." },
//   { id: 3, name: "RG-6 Coaxial Cable 305m",             brand: "GERMANYRACK", price: 4540, image: "/assets/coaxial-cable-reel.jpg", sku: "AM-2162-03", discount: "60%", rating: 4.5, reviews: 189, category_id: 6, uom: "ST." },
//   { id: 4, name: "Solar Cable 4mm² PV Wire 100m",       brand: "LINK", price: 4860, image: "/assets/solar-cable-red.jpg", sku: "AM-2166-03", discount: "80%", rating: 4.7, reviews: 145, category_id: 7, uom: "M." },
//   { id: 5, name: "Telephone Cable 4-Pair Indoor 305m",  brand: "COMMSCOPE", price: 1470, image: "/assets/telephone-cable.jpg", sku: "AM-2220-02", discount: "60%", rating: 4.4, reviews: 98,  category_id: 3, uom: "ST." },
//   { id: 6, name: "19'' Server Rack Cabinet 42U",        brand: "LINK", price: 2000, image: "/assets/server-rack-19inch.jpg", sku: "AM-3032", discount: "90%", rating: 4.9, reviews: 87,  category_id: 10, uom: "EA." },
//   { id: 7, name: "US-9035 CAT 5E UTP Cable Indoor 305m",brand: "LINK", price: 1770, image: "/assets/lan-cat5e-box.jpg", sku: "AM-3602A", discount: "60%", rating: 4.7, reviews: 178, category_id: 1, uom: "PC." },
//   { id: 8, name: "UT-0216 Fiber Media Converter RJ45",  brand: "COMMSCOPE", price: 3108, image: "/assets/fiber-media-converter.jpg", sku: "AM-3620A", discount: "0%",  rating: 4.6, reviews: 124, category_id: 9, uom: "PC." },
// ];

// const parsePercent = (text?: string) => {
//   if (!text) return 0;
//   const m = String(text).match(/(\d+)(\.\d+)?/);
//   return m ? Math.round(Number(m[0])) : 0;
// };

// /** ===== In-memory state ===== */
// let state: UIProduct[] = seedRows.map((r, i) => ({
//   id: r.id,
//   name: r.name,
//   brand: r.brand,
//   sku: r.sku,
//   price: r.price,
//   discountPercent: parsePercent((r as any).discount),
//   image_url: (r as any).image || "/placeholder.png",
//   visible: true,
//   order: i,
//   rating: (r as any).rating,
//   reviews: (r as any).reviews,
//   category_id: (r as any).category_id,
//   uom: (r as any).uom,
// }));

// const seedMeta: ProductsMeta = {
//   title: "สินค้าทั้งหมด",
//   subtitle: "ตัวอย่างข้อมูลจาก mock API (in-memory)",
//   updatedAt: new Date().toISOString(),
//   cardParts: { ...defaultCardPartsVisibility }, // NEW
// };

// let meta: ProductsMeta = { ...seedMeta };

// /** ===== Helpers ===== */
// const sortByOrder = (a: UIProduct, b: UIProduct) => (a.order ?? 0) - (b.order ?? 0);
// const coerceId = (v: any) => (isNaN(Number(v)) ? v : Number(v));

// /** (NEW) full-text แบบง่ายๆ: แยกคำแล้วเช็ค name/sku/brand */
// function matchesSearch(p: UIProduct, q?: string) {
//   if (!q) return true;
//   const hay = `${p.name ?? ""} ${p.sku ?? ""} ${p.brand ?? ""}`.toLowerCase();
//   return q
//     .toLowerCase()
//     .split(/\s+/)
//     .every((kw) => hay.includes(kw));
// }

// /** (NEW) จัดเรียงตามค่า sort */
// function applySort(list: UIProduct[], sort: ProductQuery["sort"]) {
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
//       // ไม่มี createdAt จริง ใช้ id แบบตัวเลขแทน (ถ้าเป็น string จะคงลำดับเดิม)
//       return arr.sort((a, b) => {
//         const an = typeof a.id === "number" ? a.id : 0;
//         const bn = typeof b.id === "number" ? b.id : 0;
//         return bn - an;
//       });
//     case "order":
//     default:
//       return arr.sort(sortByOrder);
//   }
// }

// /** ===== Queries ===== */
// export function getAll(opts?: { includeHidden?: boolean }): UIProduct[] {
//   const includeHidden = opts?.includeHidden ?? true;
//   const list = includeHidden ? state : state.filter((c) => c.visible !== false);
//   return [...list].sort(sortByOrder);
// }

// export function getMeta(): ProductsMeta {
//   // clone ปลอดภัย (แต่ shallow ก็พอสำหรับโครงสร้างนี้)
//   return { ...meta, cardParts: { ...meta.cardParts } };
// }

// /** อ่านสินค้าตาม id เดียว */
// export function getById(id: UIProduct["id"]): UIProduct | undefined {
//   const key = coerceId(id);
//   const found = state.find((x) => x.id === key);
//   // คืน clone บาง ๆ กันโดนแก้ไขอ้างอิงจากภายนอก
//   return found ? { ...found } : undefined;
// }

// /** อ่านสินค้าหลาย id และคงลำดับตามที่ส่งมา */
// export function getManyByIds(ids: Array<UIProduct["id"]>): UIProduct[] {
//   if (!Array.isArray(ids) || ids.length === 0) return [];
//   const norm = ids.map((v) => coerceId(v));
//   const map = new Map(state.map((p) => [p.id, p]));
//   return norm
//     .map((id) => map.get(id))
//     .filter(Boolean)
//     .map((p) => ({ ...(p as UIProduct) })); // clone
// }

// /** (NEW) ค้นหา/ฟิลเตอร์ + แบ่งหน้า */
// export function queryProducts(params: ProductQuery) {
//   const {
//     q,
//     category_id,
//     visible,
//     sort,
//     page = 1,
//     pageSize = 24,
//   } = params ?? {};

//   let list = [...state];

//   // ฟิลเตอร์แสดง/ซ่อน
//   if (typeof visible === "boolean") {
//     list = list.filter((x) => (x.visible ?? true) === visible);
//   }

//   // ฟิลเตอร์หมวด
//   if (typeof category_id !== "undefined") {
//     const cid = coerceId(category_id);
//     list = list.filter((x) => x.category_id === cid);
//   }

//   // ค้นหา
//   if (q && q.trim()) {
//     list = list.filter((p) => matchesSearch(p, q));
//   }

//   // เรียง
//   list = applySort(list, sort);

//   // แบ่งหน้า
//   const p = Math.max(1, Math.floor(page));
//   const ps = Math.min(200, Math.max(1, Math.floor(pageSize))); // guard
//   const total = list.length;
//   const start = (p - 1) * ps;
//   const items = list.slice(start, start + ps);

//   return { items, total, page: p, pageSize: ps };
// }

// /** ===== Mutations ===== */
// type MetaPatch =
//   Partial<Omit<ProductsMeta, "cardParts">> & { cardParts?: Partial<CardPartsVisibility> };

// export function setMeta(patch: MetaPatch) {
//   meta = {
//     ...meta,
//     ...patch,
//     // merge ซ้อนสำหรับ cardParts
//     cardParts: { ...meta.cardParts, ...(patch.cardParts ?? {}) },
//     updatedAt: new Date().toISOString(),
//   };
// }

// export function setVisible(id: UIProduct["id"], visible: boolean) {
//   state = state.map((x) => (x.id === id ? { ...x, visible } : x));
// }

// export function toggleVisible(id: UIProduct["id"]) {
//   state = state.map((x) => (x.id === id ? { ...x, visible: !(x.visible ?? true) } : x));
// }

// export function remove(id: UIProduct["id"]) {
//   state = state.filter((x) => x.id !== id).sort(sortByOrder).map((x, i) => ({ ...x, order: i }));
// }

// export function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
//   const map = new Map(orders.map((o) => [o.id, o.order]));
//   state = state
//     .map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
//     .sort(sortByOrder)
//     .map((x, i) => ({ ...x, order: i }));
// }

// /** create/update */
// export function upsert(p: Partial<UIProduct>): UIProduct {
//   const idx = state.findIndex((c) => c.id === p.id);
//   if (idx >= 0) {
//     const merged: UIProduct = { ...state[idx], ...p } as UIProduct;
//     state = state.map((c, i) => (i === idx ? merged : c)).sort(sortByOrder);
//     return merged;
//   } else {
//     const nextId =
//       typeof p.id !== "undefined"
//         ? p.id
//         : Math.max(0, ...state.map((c) => (typeof c.id === "number" ? c.id : 0))) + 1;

//     const newItem: UIProduct = {
//       id: nextId,
//       name: p.name ?? "New Product",
//       brand: p.brand ?? "",
//       sku: p.sku ?? "",
//       price: typeof p.price === "number" ? p.price : 0,
//       discountPercent: typeof p.discountPercent === "number" ? p.discountPercent : 0,
//       image_url: p.image_url ?? "/placeholder.png",
//       visible: p.visible ?? false,
//       order: state.length,
//       rating: typeof p.rating === "number" ? p.rating : undefined,
//       reviews: typeof p.reviews === "number" ? p.reviews : undefined,
//       category_id: p.category_id,
//       uom: p.uom,
//     };
//     state = [...state, newItem].sort(sortByOrder);
//     return newItem;
//   }
// }

// /** (NEW) helper สำหรับจัดหมวดสินค้าแบบเดี่ยว/หลายรายการ */
// export function setCategory(
//   id: UIProduct["id"],
//   category_id?: UIProduct["category_id"]
// ) {
//   // ใช้ upsert เพื่อคงลำดับ/ฟิลด์อื่น ๆ
//   upsert({ id, category_id });
// }

// export function bulkSetCategory(
//   ops: Array<{ id: UIProduct["id"]; category_id?: UIProduct["category_id"] }>
// ): { updated: number; results: Array<{ id: UIProduct["id"]; ok: boolean; reason?: string }> } {
//   const results: Array<{ id: UIProduct["id"]; ok: boolean; reason?: string }> = [];
//   for (const { id, category_id } of ops ?? []) {
//     try {
//       upsert({ id, category_id });
//       results.push({ id, ok: true });
//     } catch (e: any) {
//       results.push({ id, ok: false, reason: e?.message ?? "update_failed" });
//     }
//   }
//   return { updated: results.filter((r) => r.ok).length, results };
// }

// export function reset() {
//   state = seedRows.map((r, i) => ({
//     id: r.id,
//     name: r.name,
//     brand: r.brand,
//     sku: r.sku,
//     price: r.price,
//     discountPercent: parsePercent((r as any).discount),
//     image_url: (r as any).image || "/placeholder.png",
//     visible: true,
//     order: i,
//     rating: (r as any).rating,
//     reviews: (r as any).reviews,
//     category_id: (r as any).category_id,
//     uom: (r as any).uom,
//   }));
//   meta = {
//     ...seedMeta,
//     cardParts: { ...defaultCardPartsVisibility },
//     updatedAt: new Date().toISOString(),
//   };
// }

// v.1.1.10 =============================================

// v.1.1.9 =============================================
// // src/app/api/mock/products/_store.ts

// /** ===== Types ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;

//   rating?: number;   // 0..5
//   reviews?: number;  // จำนวนรีวิว

//   category_id?: number | string;
//   uom?: string;      // <<< หน่วยสินค้า เช่น "ST.", "EA.", "PC."
// };

// /** ===== (NEW) Card parts visibility (ฝั่ง API เก็บค่าเดียวกับแอดมิน) ===== */
// export type CardPartsVisibility = {
//   image: boolean;
//   discountBadge: boolean;
//   brandLogo: boolean;
//   frame: boolean;

//   brandName: boolean;
//   sku: boolean;
//   name: boolean;
//   ratingReview: boolean;
//   category: boolean;
//   price: boolean;
//   originalPrice: boolean;
//   uom: boolean;
// };

// export const defaultCardPartsVisibility: CardPartsVisibility = {
//   image: true,
//   discountBadge: true,
//   brandLogo: true,
//   frame: true,

//   brandName: true,
//   sku: true,
//   name: true,
//   ratingReview: true,
//   category: true,
//   price: true,
//   originalPrice: true,
//   uom: true,
// };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
//   /** (NEW) การตั้งค่าการแสดงผลการ์ด */
//   cardParts: CardPartsVisibility;
// };

// /** ===== (NEW) Query types for admin listing ===== */
// export type ProductQuery = {
//   q?: string;
//   category_id?: number | string;
//   visible?: boolean;
//   sort?:
//     | "order"
//     | "newest"
//     | "price_asc"
//     | "price_desc"
//     | "discount_desc"
//     | "rating_desc";
//   page?: number;     // 1-based
//   pageSize?: number; // e.g. 24/48/96
// };

// /** ===== Seed from legacy-like sample ===== */
// const seedRows = [
//   { id: 1, name: "Fiber Optic Cable Single Mode 305m", brand: "COMMSCOPE", price: 2160, image: "/assets/fiber-optic-cable.jpg", sku: "AM-2120-02XG", discount: "60%", rating: 4.8, reviews: 156, category_id: 2, uom: "ST." },
//   { id: 2, name: "24-Port Gigabit Network Switch",      brand: "COMMSCOPE", price: 8530, image: "/assets/network-switch-professional.jpg", sku: "AM-2129", discount: "80%", rating: 4.6, reviews: 234, category_id: 9, uom: "EA." },
//   { id: 3, name: "RG-6 Coaxial Cable 305m",             brand: "GERMANYRACK", price: 4540, image: "/assets/coaxial-cable-reel.jpg", sku: "AM-2162-03", discount: "60%", rating: 4.5, reviews: 189, category_id: 6, uom: "ST." },
//   { id: 4, name: "Solar Cable 4mm² PV Wire 100m",       brand: "LINK", price: 4860, image: "/assets/solar-cable-red.jpg", sku: "AM-2166-03", discount: "80%", rating: 4.7, reviews: 145, category_id: 7, uom: "M." },
//   { id: 5, name: "Telephone Cable 4-Pair Indoor 305m",  brand: "COMMSCOPE", price: 1470, image: "/assets/telephone-cable.jpg", sku: "AM-2220-02", discount: "60%", rating: 4.4, reviews: 98,  category_id: 3, uom: "ST." },
//   { id: 6, name: "19'' Server Rack Cabinet 42U",        brand: "LINK", price: 2000, image: "/assets/server-rack-19inch.jpg", sku: "AM-3032", discount: "90%", rating: 4.9, reviews: 87,  category_id: 10, uom: "EA." },
//   { id: 7, name: "US-9035 CAT 5E UTP Cable Indoor 305m",brand: "LINK", price: 1770, image: "/assets/lan-cat5e-box.jpg", sku: "AM-3602A", discount: "60%", rating: 4.7, reviews: 178, category_id: 1, uom: "PC." },
//   { id: 8, name: "UT-0216 Fiber Media Converter RJ45",  brand: "COMMSCOPE", price: 3108, image: "/assets/fiber-media-converter.jpg", sku: "AM-3620A", discount: "0%",  rating: 4.6, reviews: 124, category_id: 9, uom: "PC." },
// ];

// const parsePercent = (text?: string) => {
//   if (!text) return 0;
//   const m = String(text).match(/(\d+)(\.\d+)?/);
//   return m ? Math.round(Number(m[0])) : 0;
// };

// /** ===== In-memory state ===== */
// let state: UIProduct[] = seedRows.map((r, i) => ({
//   id: r.id,
//   name: r.name,
//   brand: r.brand,
//   sku: r.sku,
//   price: r.price,
//   discountPercent: parsePercent((r as any).discount),
//   image_url: (r as any).image || "/placeholder.png",
//   visible: true,
//   order: i,
//   rating: (r as any).rating,
//   reviews: (r as any).reviews,
//   category_id: (r as any).category_id,
//   uom: (r as any).uom,
// }));

// const seedMeta: ProductsMeta = {
//   title: "สินค้าทั้งหมด",
//   subtitle: "ตัวอย่างข้อมูลจาก mock API (in-memory)",
//   updatedAt: new Date().toISOString(),
//   cardParts: { ...defaultCardPartsVisibility }, // NEW
// };

// let meta: ProductsMeta = { ...seedMeta };

// /** ===== Helpers ===== */
// const sortByOrder = (a: UIProduct, b: UIProduct) => (a.order ?? 0) - (b.order ?? 0);
// const coerceId = (v: any) => (isNaN(Number(v)) ? v : Number(v));

// /** (NEW) full-text แบบง่ายๆ: แยกคำแล้วเช็ค name/sku/brand */
// function matchesSearch(p: UIProduct, q?: string) {
//   if (!q) return true;
//   const hay = `${p.name ?? ""} ${p.sku ?? ""} ${p.brand ?? ""}`.toLowerCase();
//   return q
//     .toLowerCase()
//     .split(/\s+/)
//     .every((kw) => hay.includes(kw));
// }

// /** (NEW) จัดเรียงตามค่า sort */
// function applySort(list: UIProduct[], sort: ProductQuery["sort"]) {
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
//       // ไม่มี createdAt จริง ใช้ id แบบตัวเลขแทน (ถ้าเป็น string จะคงลำดับเดิม)
//       return arr.sort((a, b) => {
//         const an = typeof a.id === "number" ? a.id : 0;
//         const bn = typeof b.id === "number" ? b.id : 0;
//         return bn - an;
//       });
//     case "order":
//     default:
//       return arr.sort(sortByOrder);
//   }
// }

// /** ===== Queries ===== */
// export function getAll(opts?: { includeHidden?: boolean }): UIProduct[] {
//   const includeHidden = opts?.includeHidden ?? true;
//   const list = includeHidden ? state : state.filter((c) => c.visible !== false);
//   return [...list].sort(sortByOrder);
// }

// export function getMeta(): ProductsMeta {
//   // clone ปลอดภัย (แต่ shallow ก็พอสำหรับโครงสร้างนี้)
//   return { ...meta, cardParts: { ...meta.cardParts } };
// }

// /** อ่านสินค้าตาม id เดียว */
// export function getById(id: UIProduct["id"]): UIProduct | undefined {
//   const key = coerceId(id);
//   const found = state.find((x) => x.id === key);
//   // คืน clone บาง ๆ กันโดนแก้ไขอ้างอิงจากภายนอก
//   return found ? { ...found } : undefined;
// }

// /** อ่านสินค้าหลาย id และคงลำดับตามที่ส่งมา */
// export function getManyByIds(ids: Array<UIProduct["id"]>): UIProduct[] {
//   if (!Array.isArray(ids) || ids.length === 0) return [];
//   // แปลง id ให้เป็นชนิดเดียวกับที่เก็บไว้ก่อน (number ถ้าเป็นตัวเลข)
//   const norm = ids.map((v) => coerceId(v));
//   const map = new Map(state.map((p) => [p.id, p]));
//   return norm
//     .map((id) => map.get(id))
//     .filter(Boolean)
//     .map((p) => ({ ...(p as UIProduct) })); // clone
// }

// /** (NEW) ค้นหา/ฟิลเตอร์ + แบ่งหน้า */
// export function queryProducts(params: ProductQuery) {
//   const {
//     q,
//     category_id,
//     visible,
//     sort,
//     page = 1,
//     pageSize = 24,
//   } = params ?? {};

//   let list = [...state];

//   // ฟิลเตอร์แสดง/ซ่อน
//   if (typeof visible === "boolean") {
//     list = list.filter((x) => (x.visible ?? true) === visible);
//   }

//   // ฟิลเตอร์หมวด
//   if (typeof category_id !== "undefined") {
//     const cid = coerceId(category_id);
//     list = list.filter((x) => x.category_id === cid);
//   }

//   // ค้นหา
//   if (q && q.trim()) {
//     list = list.filter((p) => matchesSearch(p, q));
//   }

//   // เรียง
//   list = applySort(list, sort);

//   // แบ่งหน้า
//   const p = Math.max(1, Math.floor(page));
//   const ps = Math.min(200, Math.max(1, Math.floor(pageSize))); // guard
//   const total = list.length;
//   const start = (p - 1) * ps;
//   const items = list.slice(start, start + ps);

//   return { items, total, page: p, pageSize: ps };
// }

// /** ===== Mutations ===== */
// type MetaPatch =
//   Partial<Omit<ProductsMeta, "cardParts">> & { cardParts?: Partial<CardPartsVisibility> };

// export function setMeta(patch: MetaPatch) {
//   meta = {
//     ...meta,
//     ...patch,
//     // merge ซ้อนสำหรับ cardParts
//     cardParts: { ...meta.cardParts, ...(patch.cardParts ?? {}) },
//     updatedAt: new Date().toISOString(),
//   };
// }

// export function setVisible(id: UIProduct["id"], visible: boolean) {
//   state = state.map((x) => (x.id === id ? { ...x, visible } : x));
// }

// export function toggleVisible(id: UIProduct["id"]) {
//   state = state.map((x) => (x.id === id ? { ...x, visible: !(x.visible ?? true) } : x));
// }

// export function remove(id: UIProduct["id"]) {
//   state = state.filter((x) => x.id !== id).sort(sortByOrder).map((x, i) => ({ ...x, order: i }));
// }

// export function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
//   const map = new Map(orders.map((o) => [o.id, o.order]));
//   state = state
//     .map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
//     .sort(sortByOrder)
//     .map((x, i) => ({ ...x, order: i }));
// }

// /** create/update */
// export function upsert(p: Partial<UIProduct>): UIProduct {
//   const idx = state.findIndex((c) => c.id === p.id);
//   if (idx >= 0) {
//     const merged: UIProduct = { ...state[idx], ...p } as UIProduct;
//     state = state.map((c, i) => (i === idx ? merged : c)).sort(sortByOrder);
//     return merged;
//   } else {
//     const nextId =
//       typeof p.id !== "undefined"
//         ? p.id
//         : Math.max(0, ...state.map((c) => (typeof c.id === "number" ? c.id : 0))) + 1;

//     const newItem: UIProduct = {
//       id: nextId,
//       name: p.name ?? "New Product",
//       brand: p.brand ?? "",
//       sku: p.sku ?? "",
//       price: typeof p.price === "number" ? p.price : 0,
//       discountPercent: typeof p.discountPercent === "number" ? p.discountPercent : 0,
//       image_url: p.image_url ?? "/placeholder.png",
//       visible: p.visible ?? false,
//       order: state.length,
//       rating: typeof p.rating === "number" ? p.rating : undefined,
//       reviews: typeof p.reviews === "number" ? p.reviews : undefined,
//       category_id: p.category_id,
//       uom: p.uom,
//     };
//     state = [...state, newItem].sort(sortByOrder);
//     return newItem;
//   }
// }

// export function reset() {
//   state = seedRows.map((r, i) => ({
//     id: r.id,
//     name: r.name,
//     brand: r.brand,
//     sku: r.sku,
//     price: r.price,
//     discountPercent: parsePercent((r as any).discount),
//     image_url: (r as any).image || "/placeholder.png",
//     visible: true,
//     order: i,
//     rating: (r as any).rating,
//     reviews: (r as any).reviews,
//     category_id: (r as any).category_id,
//     uom: (r as any).uom,
//   }));
//   meta = {
//     ...seedMeta,
//     cardParts: { ...defaultCardPartsVisibility },
//     updatedAt: new Date().toISOString(),
//   };
// }
// v.1.1.9 =============================================

// v.1.1.8 ==============================================
// // src/app/api/mock/products/_store.ts

// /** ===== Types ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;

//   rating?: number;   // 0..5
//   reviews?: number;  // จำนวนรีวิว

//   category_id?: number | string;
//   uom?: string;      // <<< หน่วยสินค้า เช่น "ST.", "EA.", "PC."
// };

// /** ===== (NEW) Card parts visibility (ฝั่ง API เก็บค่าเดียวกับแอดมิน) ===== */
// export type CardPartsVisibility = {
//   image: boolean;
//   discountBadge: boolean;
//   brandLogo: boolean;
//   frame: boolean;

//   brandName: boolean;
//   sku: boolean;
//   name: boolean;
//   ratingReview: boolean;
//   category: boolean;
//   price: boolean;
//   originalPrice: boolean;
//   uom: boolean;
// };

// export const defaultCardPartsVisibility: CardPartsVisibility = {
//   image: true,
//   discountBadge: true,
//   brandLogo: true,
//   frame: true,

//   brandName: true,
//   sku: true,
//   name: true,
//   ratingReview: true,
//   category: true,
//   price: true,
//   originalPrice: true,
//   uom: true,
// };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
//   /** (NEW) การตั้งค่าการแสดงผลการ์ด */
//   cardParts: CardPartsVisibility;
// };

// /** ===== (NEW) Query types for admin listing ===== */
// export type ProductQuery = {
//   q?: string;
//   category_id?: number | string;
//   visible?: boolean;
//   sort?:
//     | "order"
//     | "newest"
//     | "price_asc"
//     | "price_desc"
//     | "discount_desc"
//     | "rating_desc";
//   page?: number;     // 1-based
//   pageSize?: number; // e.g. 24/48/96
// };

// /** ===== Seed from legacy-like sample ===== */
// const seedRows = [
//   { id: 1, name: "Fiber Optic Cable Single Mode 305m", brand: "COMMSCOPE", price: 2160, image: "/assets/fiber-optic-cable.jpg", sku: "AM-2120-02XG", discount: "60%", rating: 4.8, reviews: 156, category_id: 2, uom: "ST." },
//   { id: 2, name: "24-Port Gigabit Network Switch",      brand: "COMMSCOPE", price: 8530, image: "/assets/network-switch-professional.jpg", sku: "AM-2129", discount: "80%", rating: 4.6, reviews: 234, category_id: 9, uom: "EA." },
//   { id: 3, name: "RG-6 Coaxial Cable 305m",             brand: "GERMANYRACK", price: 4540, image: "/assets/coaxial-cable-reel.jpg", sku: "AM-2162-03", discount: "60%", rating: 4.5, reviews: 189, category_id: 6, uom: "ST." },
//   { id: 4, name: "Solar Cable 4mm² PV Wire 100m",       brand: "LINK", price: 4860, image: "/assets/solar-cable-red.jpg", sku: "AM-2166-03", discount: "80%", rating: 4.7, reviews: 145, category_id: 7, uom: "M." },
//   { id: 5, name: "Telephone Cable 4-Pair Indoor 305m",  brand: "COMMSCOPE", price: 1470, image: "/assets/telephone-cable.jpg", sku: "AM-2220-02", discount: "60%", rating: 4.4, reviews: 98,  category_id: 3, uom: "ST." },
//   { id: 6, name: "19'' Server Rack Cabinet 42U",        brand: "LINK", price: 2000, image: "/assets/server-rack-19inch.jpg", sku: "AM-3032", discount: "90%", rating: 4.9, reviews: 87,  category_id: 10, uom: "EA." },
//   { id: 7, name: "US-9035 CAT 5E UTP Cable Indoor 305m",brand: "LINK", price: 1770, image: "/assets/lan-cat5e-box.jpg", sku: "AM-3602A", discount: "60%", rating: 4.7, reviews: 178, category_id: 1, uom: "PC." },
//   { id: 8, name: "UT-0216 Fiber Media Converter RJ45",  brand: "COMMSCOPE", price: 3108, image: "/assets/fiber-media-converter.jpg", sku: "AM-3620A", discount: "0%",  rating: 4.6, reviews: 124, category_id: 9, uom: "PC." },
// ];

// const parsePercent = (text?: string) => {
//   if (!text) return 0;
//   const m = String(text).match(/(\d+)(\.\d+)?/);
//   return m ? Math.round(Number(m[0])) : 0;
// };

// /** ===== In-memory state ===== */
// let state: UIProduct[] = seedRows.map((r, i) => ({
//   id: r.id,
//   name: r.name,
//   brand: r.brand,
//   sku: r.sku,
//   price: r.price,
//   discountPercent: parsePercent((r as any).discount),
//   image_url: (r as any).image || "/placeholder.png",
//   visible: true,
//   order: i,
//   rating: (r as any).rating,
//   reviews: (r as any).reviews,
//   category_id: (r as any).category_id,
//   uom: (r as any).uom,
// }));

// const seedMeta: ProductsMeta = {
//   title: "สินค้าทั้งหมด",
//   subtitle: "ตัวอย่างข้อมูลจาก mock API (in-memory)",
//   updatedAt: new Date().toISOString(),
//   cardParts: { ...defaultCardPartsVisibility }, // NEW
// };

// let meta: ProductsMeta = { ...seedMeta };

// /** ===== Helpers ===== */
// const sortByOrder = (a: UIProduct, b: UIProduct) => (a.order ?? 0) - (b.order ?? 0);
// const coerceId = (v: any) => (isNaN(Number(v)) ? v : Number(v));

// /** (NEW) full-text แบบง่ายๆ: แยกคำแล้วเช็ค name/sku/brand */
// function matchesSearch(p: UIProduct, q?: string) {
//   if (!q) return true;
//   const hay = `${p.name ?? ""} ${p.sku ?? ""} ${p.brand ?? ""}`.toLowerCase();
//   return q
//     .toLowerCase()
//     .split(/\s+/)
//     .every((kw) => hay.includes(kw));
// }

// /** (NEW) จัดเรียงตามค่า sort */
// function applySort(list: UIProduct[], sort: ProductQuery["sort"]) {
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
//       // ไม่มี createdAt จริง ใช้ id แบบตัวเลขแทน (ถ้าเป็น string จะคงลำดับเดิม)
//       return arr.sort((a, b) => {
//         const an = typeof a.id === "number" ? a.id : 0;
//         const bn = typeof b.id === "number" ? b.id : 0;
//         return bn - an;
//       });
//     case "order":
//     default:
//       return arr.sort(sortByOrder);
//   }
// }

// /** ===== Queries ===== */
// export function getAll(opts?: { includeHidden?: boolean }): UIProduct[] {
//   const includeHidden = opts?.includeHidden ?? true;
//   const list = includeHidden ? state : state.filter((c) => c.visible !== false);
//   return [...list].sort(sortByOrder);
// }

// export function getMeta(): ProductsMeta {
//   // clone ปลอดภัย (แต่ shallow ก็พอสำหรับโครงสร้างนี้)
//   return { ...meta, cardParts: { ...meta.cardParts } };
// }

// /** (NEW) ค้นหา/ฟิลเตอร์ + แบ่งหน้า */
// export function queryProducts(params: ProductQuery) {
//   const {
//     q,
//     category_id,
//     visible,
//     sort,
//     page = 1,
//     pageSize = 24,
//   } = params ?? {};

//   let list = [...state];

//   // ฟิลเตอร์แสดง/ซ่อน
//   if (typeof visible === "boolean") {
//     list = list.filter((x) => (x.visible ?? true) === visible);
//   }

//   // ฟิลเตอร์หมวด
//   if (typeof category_id !== "undefined") {
//     const cid = coerceId(category_id);
//     list = list.filter((x) => x.category_id === cid);
//   }

//   // ค้นหา
//   if (q && q.trim()) {
//     list = list.filter((p) => matchesSearch(p, q));
//   }

//   // เรียง
//   list = applySort(list, sort);

//   // แบ่งหน้า
//   const p = Math.max(1, Math.floor(page));
//   const ps = Math.min(200, Math.max(1, Math.floor(pageSize))); // guard
//   const total = list.length;
//   const start = (p - 1) * ps;
//   const items = list.slice(start, start + ps);

//   return { items, total, page: p, pageSize: ps };
// }

// /** ===== Mutations ===== */
// type MetaPatch =
//   Partial<Omit<ProductsMeta, "cardParts">> & { cardParts?: Partial<CardPartsVisibility> };

// export function setMeta(patch: MetaPatch) {
//   meta = {
//     ...meta,
//     ...patch,
//     // merge ซ้อนสำหรับ cardParts
//     cardParts: { ...meta.cardParts, ...(patch.cardParts ?? {}) },
//     updatedAt: new Date().toISOString(),
//   };
// }

// export function setVisible(id: UIProduct["id"], visible: boolean) {
//   state = state.map((x) => (x.id === id ? { ...x, visible } : x));
// }

// export function toggleVisible(id: UIProduct["id"]) {
//   state = state.map((x) => (x.id === id ? { ...x, visible: !(x.visible ?? true) } : x));
// }

// export function remove(id: UIProduct["id"]) {
//   state = state.filter((x) => x.id !== id).sort(sortByOrder).map((x, i) => ({ ...x, order: i }));
// }

// export function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
//   const map = new Map(orders.map((o) => [o.id, o.order]));
//   state = state
//     .map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
//     .sort(sortByOrder)
//     .map((x, i) => ({ ...x, order: i }));
// }

// /** create/update */
// export function upsert(p: Partial<UIProduct>): UIProduct {
//   const idx = state.findIndex((c) => c.id === p.id);
//   if (idx >= 0) {
//     const merged: UIProduct = { ...state[idx], ...p } as UIProduct;
//     state = state.map((c, i) => (i === idx ? merged : c)).sort(sortByOrder);
//     return merged;
//   } else {
//     const nextId =
//       typeof p.id !== "undefined"
//         ? p.id
//         : Math.max(0, ...state.map((c) => (typeof c.id === "number" ? c.id : 0))) + 1;

//     const newItem: UIProduct = {
//       id: nextId,
//       name: p.name ?? "New Product",
//       brand: p.brand ?? "",
//       sku: p.sku ?? "",
//       price: typeof p.price === "number" ? p.price : 0,
//       discountPercent: typeof p.discountPercent === "number" ? p.discountPercent : 0,
//       image_url: p.image_url ?? "/placeholder.png",
//       visible: p.visible ?? false,
//       order: state.length,
//       rating: typeof p.rating === "number" ? p.rating : undefined,
//       reviews: typeof p.reviews === "number" ? p.reviews : undefined,
//       category_id: p.category_id,
//       uom: p.uom,
//     };
//     state = [...state, newItem].sort(sortByOrder);
//     return newItem;
//   }
// }

// export function reset() {
//   state = seedRows.map((r, i) => ({
//     id: r.id,
//     name: r.name,
//     brand: r.brand,
//     sku: r.sku,
//     price: r.price,
//     discountPercent: parsePercent((r as any).discount),
//     image_url: (r as any).image || "/placeholder.png",
//     visible: true,
//     order: i,
//     rating: (r as any).rating,
//     reviews: (r as any).reviews,
//     category_id: (r as any).category_id,
//     uom: (r as any).uom,
//   }));
//   meta = {
//     ...seedMeta,
//     cardParts: { ...defaultCardPartsVisibility },
//     updatedAt: new Date().toISOString(),
//   };
// }

// v.1.1.8 ==============================================

// v.1.1.7 ===============================================
// // src/app/api/mock/products/_store.ts

// /** ===== Types ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;

//   rating?: number;   // 0..5
//   reviews?: number;  // จำนวนรีวิว

//   category_id?: number | string;
//   uom?: string;      // <<< หน่วยสินค้า เช่น "ST.", "EA.", "PC."
// };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
// };

// /** ===== (NEW) Query types for admin listing ===== */
// export type ProductQuery = {
//   q?: string;
//   category_id?: number | string;
//   visible?: boolean;
//   sort?:
//     | "order"
//     | "newest"
//     | "price_asc"
//     | "price_desc"
//     | "discount_desc"
//     | "rating_desc";
//   page?: number;     // 1-based
//   pageSize?: number; // e.g. 24/48/96
// };

// /** ===== Seed from legacy-like sample ===== */
// const seedRows = [
//   { id: 1, name: "Fiber Optic Cable Single Mode 305m", brand: "COMMSCOPE", price: 2160, image: "/assets/fiber-optic-cable.jpg", sku: "AM-2120-02XG", discount: "60%", rating: 4.8, reviews: 156, category_id: 2, uom: "ST." },
//   { id: 2, name: "24-Port Gigabit Network Switch",      brand: "COMMSCOPE", price: 8530, image: "/assets/network-switch-professional.jpg", sku: "AM-2129", discount: "80%", rating: 4.6, reviews: 234, category_id: 9, uom: "EA." },
//   { id: 3, name: "RG-6 Coaxial Cable 305m",             brand: "GERMANYRACK", price: 4540, image: "/assets/coaxial-cable-reel.jpg", sku: "AM-2162-03", discount: "60%", rating: 4.5, reviews: 189, category_id: 6, uom: "ST." },
//   { id: 4, name: "Solar Cable 4mm² PV Wire 100m",       brand: "LINK", price: 4860, image: "/assets/solar-cable-red.jpg", sku: "AM-2166-03", discount: "80%", rating: 4.7, reviews: 145, category_id: 7, uom: "M." },
//   { id: 5, name: "Telephone Cable 4-Pair Indoor 305m",  brand: "COMMSCOPE", price: 1470, image: "/assets/telephone-cable.jpg", sku: "AM-2220-02", discount: "60%", rating: 4.4, reviews: 98,  category_id: 3, uom: "ST." },
//   { id: 6, name: "19'' Server Rack Cabinet 42U",        brand: "LINK", price: 2000, image: "/assets/server-rack-19inch.jpg", sku: "AM-3032", discount: "90%", rating: 4.9, reviews: 87,  category_id: 10, uom: "EA." },
//   { id: 7, name: "US-9035 CAT 5E UTP Cable Indoor 305m",brand: "LINK", price: 1770, image: "/assets/lan-cat5e-box.jpg", sku: "AM-3602A", discount: "60%", rating: 4.7, reviews: 178, category_id: 1, uom: "PC." },
//   { id: 8, name: "UT-0216 Fiber Media Converter RJ45",  brand: "COMMSCOPE", price: 3108, image: "/assets/fiber-media-converter.jpg", sku: "AM-3620A", discount: "0%",  rating: 4.6, reviews: 124, category_id: 9, uom: "PC." },
// ];

// const parsePercent = (text?: string) => {
//   if (!text) return 0;
//   const m = String(text).match(/(\d+)(\.\d+)?/);
//   return m ? Math.round(Number(m[0])) : 0;
// };

// /** ===== In-memory state ===== */
// let state: UIProduct[] = seedRows.map((r, i) => ({
//   id: r.id,
//   name: r.name,
//   brand: r.brand,
//   sku: r.sku,
//   price: r.price,
//   discountPercent: parsePercent((r as any).discount),
//   image_url: (r as any).image || "/placeholder.png",
//   visible: true,
//   order: i,
//   rating: (r as any).rating,
//   reviews: (r as any).reviews,
//   category_id: (r as any).category_id,
//   uom: (r as any).uom,
// }));

// const seedMeta: ProductsMeta = {
//   title: "สินค้าทั้งหมด",
//   subtitle: "ตัวอย่างข้อมูลจาก mock API (in-memory)",
//   updatedAt: new Date().toISOString(),
// };

// let meta: ProductsMeta = { ...seedMeta };

// /** ===== Helpers ===== */
// const sortByOrder = (a: UIProduct, b: UIProduct) => (a.order ?? 0) - (b.order ?? 0);
// const coerceId = (v: any) => (isNaN(Number(v)) ? v : Number(v));

// /** (NEW) full-text แบบง่ายๆ: แยกคำแล้วเช็ค name/sku/brand */
// function matchesSearch(p: UIProduct, q?: string) {
//   if (!q) return true;
//   const hay = `${p.name ?? ""} ${p.sku ?? ""} ${p.brand ?? ""}`.toLowerCase();
//   return q
//     .toLowerCase()
//     .split(/\s+/)
//     .every((kw) => hay.includes(kw));
// }

// /** (NEW) จัดเรียงตามค่า sort */
// function applySort(list: UIProduct[], sort: ProductQuery["sort"]) {
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
//       // ไม่มี createdAt จริง ใช้ id แบบตัวเลขแทน (ถ้าเป็น string จะคงลำดับเดิม)
//       return arr.sort((a, b) => {
//         const an = typeof a.id === "number" ? a.id : 0;
//         const bn = typeof b.id === "number" ? b.id : 0;
//         return bn - an;
//       });
//     case "order":
//     default:
//       return arr.sort(sortByOrder);
//   }
// }

// /** ===== Queries ===== */
// export function getAll(opts?: { includeHidden?: boolean }): UIProduct[] {
//   const includeHidden = opts?.includeHidden ?? true;
//   const list = includeHidden ? state : state.filter((c) => c.visible !== false);
//   return [...list].sort(sortByOrder);
// }

// export function getMeta(): ProductsMeta {
//   return { ...meta };
// }

// /** (NEW) ค้นหา/ฟิลเตอร์ + แบ่งหน้า */
// export function queryProducts(params: ProductQuery) {
//   const {
//     q,
//     category_id,
//     visible,
//     sort,
//     page = 1,
//     pageSize = 24,
//   } = params ?? {};

//   let list = [...state];

//   // ฟิลเตอร์แสดง/ซ่อน
//   if (typeof visible === "boolean") {
//     list = list.filter((x) => (x.visible ?? true) === visible);
//   }

//   // ฟิลเตอร์หมวด
//   if (typeof category_id !== "undefined") {
//     const cid = coerceId(category_id);
//     list = list.filter((x) => x.category_id === cid);
//   }

//   // ค้นหา
//   if (q && q.trim()) {
//     list = list.filter((p) => matchesSearch(p, q));
//   }

//   // เรียง
//   list = applySort(list, sort);

//   // แบ่งหน้า
//   const p = Math.max(1, Math.floor(page));
//   const ps = Math.min(200, Math.max(1, Math.floor(pageSize))); // guard
//   const total = list.length;
//   const start = (p - 1) * ps;
//   const items = list.slice(start, start + ps);

//   return { items, total, page: p, pageSize: ps };
// }

// /** ===== Mutations ===== */
// export function setMeta(patch: Partial<ProductsMeta>) {
//   meta = { ...meta, ...patch, updatedAt: new Date().toISOString() };
// }

// export function setVisible(id: UIProduct["id"], visible: boolean) {
//   state = state.map((x) => (x.id === id ? { ...x, visible } : x));
// }

// export function toggleVisible(id: UIProduct["id"]) {
//   state = state.map((x) => (x.id === id ? { ...x, visible: !(x.visible ?? true) } : x));
// }

// export function remove(id: UIProduct["id"]) {
//   state = state.filter((x) => x.id !== id).sort(sortByOrder).map((x, i) => ({ ...x, order: i }));
// }

// export function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
//   const map = new Map(orders.map((o) => [o.id, o.order]));
//   state = state
//     .map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
//     .sort(sortByOrder)
//     .map((x, i) => ({ ...x, order: i }));
// }

// /** create/update */
// export function upsert(p: Partial<UIProduct>): UIProduct {
//   const idx = state.findIndex((c) => c.id === p.id);
//   if (idx >= 0) {
//     const merged: UIProduct = { ...state[idx], ...p } as UIProduct;
//     state = state.map((c, i) => (i === idx ? merged : c)).sort(sortByOrder);
//     return merged;
//   } else {
//     const nextId =
//       typeof p.id !== "undefined"
//         ? p.id
//         : Math.max(0, ...state.map((c) => (typeof c.id === "number" ? c.id : 0))) + 1;

//     const newItem: UIProduct = {
//       id: nextId,
//       name: p.name ?? "New Product",
//       brand: p.brand ?? "",
//       sku: p.sku ?? "",
//       price: typeof p.price === "number" ? p.price : 0,
//       discountPercent: typeof p.discountPercent === "number" ? p.discountPercent : 0,
//       image_url: p.image_url ?? "/placeholder.png",
//       visible: p.visible ?? false,
//       order: state.length,
//       rating: typeof p.rating === "number" ? p.rating : undefined,
//       reviews: typeof p.reviews === "number" ? p.reviews : undefined,
//       category_id: p.category_id,
//       uom: p.uom,
//     };
//     state = [...state, newItem].sort(sortByOrder);
//     return newItem;
//   }
// }

// export function reset() {
//   state = seedRows.map((r, i) => ({
//     id: r.id,
//     name: r.name,
//     brand: r.brand,
//     sku: r.sku,
//     price: r.price,
//     discountPercent: parsePercent((r as any).discount),
//     image_url: (r as any).image || "/placeholder.png",
//     visible: true,
//     order: i,
//     rating: (r as any).rating,
//     reviews: (r as any).reviews,
//     category_id: (r as any).category_id,
//     uom: (r as any).uom,
//   }));
//   meta = { ...seedMeta, updatedAt: new Date().toISOString() };
// }

// v.1.1.7 ===============================================

// v.1.1.6 ===============================================
// // src/app/api/mock/products/_store.ts

// /** ===== Types ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;

//   rating?: number;   // 0..5
//   reviews?: number;  // จำนวนรีวิว

//   category_id?: number | string;
//   uom?: string;      // <<< หน่วยสินค้า เช่น "ST.", "EA.", "PC."
// };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
// };

// /** ===== Seed from legacy-like sample ===== */
// const seedRows = [
//   {
//     id: 1,
//     name: "Fiber Optic Cable Single Mode 305m",
//     brand: "COMMSCOPE",
//     price: 2160,
//     image: "/assets/fiber-optic-cable.jpg",
//     sku: "AM-2120-02XG",
//     discount: "60%",
//     rating: 4.8,
//     reviews: 156,
//     category_id: 2, // FIBER OPTIC System
//     uom: "ST.",
//   },
//   {
//     id: 2,
//     name: "24-Port Gigabit Network Switch",
//     brand: "COMMSCOPE",
//     price: 8530,
//     image: "/assets/network-switch-professional.jpg",
//     sku: "AM-2129",
//     discount: "80%",
//     rating: 4.6,
//     reviews: 234,
//     category_id: 9, // NETWORKING System
//     uom: "EA.",
//   },
//   {
//     id: 3,
//     name: "RG-6 Coaxial Cable 305m",
//     brand: "GERMANYRACK",
//     price: 4540,
//     image: "/assets/coaxial-cable-reel.jpg",
//     sku: "AM-2162-03",
//     discount: "60%",
//     rating: 4.5,
//     reviews: 189,
//     category_id: 6, // COAXIAL (RG) System
//     uom: "ST.",
//   },
//   {
//     id: 4,
//     name: "Solar Cable 4mm² PV Wire 100m",
//     brand: "LINK",
//     price: 4860,
//     image: "/assets/solar-cable-red.jpg",
//     sku: "AM-2166-03",
//     discount: "80%",
//     rating: 4.7,
//     reviews: 145,
//     category_id: 7, // SOLAR CABLE
//     uom: "M.",
//   },
//   {
//     id: 5,
//     name: "Telephone Cable 4-Pair Indoor 305m",
//     brand: "COMMSCOPE",
//     price: 1470,
//     image: "/assets/telephone-cable.jpg",
//     sku: "AM-2220-02",
//     discount: "60%",
//     rating: 4.4,
//     reviews: 98,
//     category_id: 3, // Telephone CABLE
//     uom: "ST.",
//   },
//   {
//     id: 6,
//     name: "19'' Server Rack Cabinet 42U",
//     brand: "LINK",
//     price: 2000,
//     image: "/assets/server-rack-19inch.jpg",
//     sku: "AM-3032",
//     discount: "90%",
//     rating: 4.9,
//     reviews: 87,
//     category_id: 10, // GERMANY RACK
//     uom: "EA.",
//   },
//   {
//     id: 7,
//     name: "US-9035 CAT 5E UTP Cable Indoor 305m",
//     brand: "LINK",
//     price: 1770,
//     image: "/assets/lan-cat5e-box.jpg",
//     sku: "AM-3602A",
//     discount: "60%",
//     rating: 4.7,
//     reviews: 178,
//     category_id: 1, // LAN (UTP) System
//     uom: "PC.",
//   },
//   {
//     id: 8,
//     name: "UT-0216 Fiber Media Converter RJ45",
//     brand: "COMMSCOPE",
//     price: 3108,
//     image: "/assets/fiber-media-converter.jpg",
//     sku: "AM-3620A",
//     discount: "0%",
//     rating: 4.6,
//     reviews: 124,
//     category_id: 9, // NETWORKING System
//     uom: "PC.",
//   },
// ];

// const parsePercent = (text?: string) => {
//   if (!text) return 0;
//   const m = String(text).match(/(\d+)(\.\d+)?/);
//   return m ? Math.round(Number(m[0])) : 0;
// };

// /** ===== In-memory state ===== */
// let state: UIProduct[] = seedRows.map((r, i) => ({
//   id: r.id,
//   name: r.name,
//   brand: r.brand,
//   sku: r.sku,
//   price: r.price,
//   discountPercent: parsePercent((r as any).discount),
//   image_url: (r as any).image || "/placeholder.png",
//   visible: true,
//   order: i,
//   rating: (r as any).rating,
//   reviews: (r as any).reviews,
//   category_id: (r as any).category_id,
//   uom: (r as any).uom,
// }));

// const seedMeta: ProductsMeta = {
//   title: "สินค้าทั้งหมด",
//   subtitle: "ตัวอย่างข้อมูลจาก mock API (in-memory)",
//   updatedAt: new Date().toISOString(),
// };

// let meta: ProductsMeta = { ...seedMeta };

// /** ===== Helpers ===== */
// const sortByOrder = (a: UIProduct, b: UIProduct) => (a.order ?? 0) - (b.order ?? 0);

// function toNumber(v: any): number | undefined {
//   if (v === "" || v == null) return undefined;
//   const n = Number(v);
//   return Number.isFinite(n) ? n : undefined;
// }
// function clamp(n: number, lo: number, hi: number) {
//   return Math.min(hi, Math.max(lo, n));
// }
// function defined<T>(v: T | undefined | null): v is T {
//   return v !== undefined && v !== null;
// }

// /** ล้าง/แปลงค่าที่ส่งเข้ามาก่อน merge/create */
// function normalizePartial(p: Partial<UIProduct>): Partial<UIProduct> {
//   const price = toNumber(p.price);
//   const discountPercent = toNumber(p.discountPercent);
//   const ratingNum = toNumber((p as any).rating);
//   const reviewsNum = toNumber((p as any).reviews);

//   const uom =
//     typeof p.uom === "string" ? (p.uom.trim() === "" ? undefined : p.uom.trim()) : undefined;

//   const image_url =
//     typeof p.image_url === "string" ? (p.image_url.trim() === "" ? undefined : p.image_url) : undefined;

//   // category_id: คงชนิด string|number ตามที่ส่งมา (ถ้าว่าง → undefined)
//   const category_id =
//     (p as any).category_id === "" || (p as any).category_id == null
//       ? undefined
//       : (p as any).category_id;

//   return {
//     ...(typeof p.name === "string" ? { name: p.name } : {}),
//     ...(typeof p.brand === "string" ? { brand: p.brand } : {}),
//     ...(typeof p.sku === "string" ? { sku: p.sku } : {}),
//     ...(defined(price) ? { price } : {}),
//     ...(defined(discountPercent) ? { discountPercent: clamp(Math.round(discountPercent), 0, 100) } : {}),
//     ...(defined(image_url) ? { image_url } : {}),
//     ...(typeof p.visible === "boolean" ? { visible: p.visible } : {}),

//     ...(defined(ratingNum)
//       ? { rating: clamp(Number(ratingNum.toFixed(1)), 0, 5) }
//       : {}),
//     ...(defined(reviewsNum)
//       ? { reviews: Math.max(0, Math.floor(reviewsNum)) }
//       : {}),
//     ...(defined(category_id) ? { category_id } : {}),
//     ...(defined(uom) ? { uom } : {}),
//   };
// }

// /** ===== Queries ===== */
// export function getAll(opts?: { includeHidden?: boolean }): UIProduct[] {
//   const includeHidden = opts?.includeHidden ?? true;
//   const list = includeHidden ? state : state.filter((c) => c.visible !== false);
//   return [...list].sort(sortByOrder);
// }

// export function getMeta(): ProductsMeta {
//   return { ...meta };
// }

// /** ===== Mutations ===== */
// export function setMeta(patch: Partial<ProductsMeta>) {
//   meta = { ...meta, ...patch, updatedAt: new Date().toISOString() };
// }

// export function setVisible(id: UIProduct["id"], visible: boolean) {
//   state = state.map((x) => (x.id === id ? { ...x, visible } : x));
// }

// export function toggleVisible(id: UIProduct["id"]) {
//   state = state.map((x) => (x.id === id ? { ...x, visible: !(x.visible ?? true) } : x));
// }

// export function remove(id: UIProduct["id"]) {
//   state = state.filter((x) => x.id !== id).sort(sortByOrder).map((x, i) => ({ ...x, order: i }));
// }

// export function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
//   const map = new Map(orders.map((o) => [o.id, o.order]));
//   state = state
//     .map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
//     .sort(sortByOrder)
//     .map((x, i) => ({ ...x, order: i }));
// }

// /** create/update */
// export function upsert(p: Partial<UIProduct>): UIProduct {
//   const cleaned = normalizePartial(p);

//   const idx = state.findIndex((c) => c.id === p.id);
//   if (idx >= 0) {
//     // update (merge เฉพาะฟิลด์ที่ส่งมา)
//     const merged: UIProduct = { ...state[idx], ...cleaned } as UIProduct;
//     state = state.map((c, i) => (i === idx ? merged : c)).sort(sortByOrder);
//     return merged;
//   } else {
//     // create
//     const nextId =
//       typeof p.id !== "undefined"
//         ? p.id
//         : Math.max(0, ...state.map((c) => (typeof c.id === "number" ? c.id : 0))) + 1;

//     const newItem: UIProduct = {
//       id: nextId,
//       name: (cleaned.name as string) ?? "New Product",
//       brand: cleaned.brand ?? "",
//       sku: cleaned.sku ?? "",
//       price: typeof cleaned.price === "number" ? cleaned.price : 0,
//       discountPercent:
//         typeof cleaned.discountPercent === "number" ? cleaned.discountPercent : 0,
//       image_url: cleaned.image_url ?? "/placeholder.png",
//       visible: typeof cleaned.visible === "boolean" ? cleaned.visible : false, // default ซ่อนก่อน
//       order: state.length,
//       rating: typeof cleaned.rating === "number" ? cleaned.rating : undefined,
//       reviews: typeof cleaned.reviews === "number" ? cleaned.reviews : undefined,
//       category_id: cleaned.category_id,
//       uom: cleaned.uom,
//     };

//     state = [...state, newItem].sort(sortByOrder);
//     return newItem;
//   }
// }

// export function reset() {
//   state = seedRows.map((r, i) => ({
//     id: r.id,
//     name: r.name,
//     brand: r.brand,
//     sku: r.sku,
//     price: r.price,
//     discountPercent: parsePercent((r as any).discount),
//     image_url: (r as any).image || "/placeholder.png",
//     visible: true,
//     order: i,
//     rating: (r as any).rating,
//     reviews: (r as any).reviews,
//     category_id: (r as any).category_id,
//     uom: (r as any).uom,
//   }));
//   meta = { ...seedMeta, updatedAt: new Date().toISOString() };
// }

// v.1.1.6 ===============================================

// v.1.1.5 ===============================================
// // src/app/api/mock/products/_store.ts

// /** ===== Types ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;

//   rating?: number;   // 0..5
//   reviews?: number;  // จำนวนรีวิว

//   category_id?: number | string;
//   uom?: string;      // <<< หน่วยสินค้า เช่น "ST.", "EA.", "PC."
// };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
// };

// /** ===== Seed from legacy-like sample ===== */
// const seedRows = [
//   {
//     id: 1,
//     name: "Fiber Optic Cable Single Mode 305m",
//     brand: "COMMSCOPE",
//     price: 2160,
//     image: "/assets/fiber-optic-cable.jpg",
//     sku: "AM-2120-02XG",
//     discount: "60%",
//     rating: 4.8,
//     reviews: 156,
//     category_id: 2, // FIBER OPTIC System
//     uom: "ST.",
//   },
//   {
//     id: 2,
//     name: "24-Port Gigabit Network Switch",
//     brand: "COMMSCOPE",
//     price: 8530,
//     image: "/assets/network-switch-professional.jpg",
//     sku: "AM-2129",
//     discount: "80%",
//     rating: 4.6,
//     reviews: 234,
//     category_id: 9, // NETWORKING System
//     uom: "EA.",
//   },
//   {
//     id: 3,
//     name: "RG-6 Coaxial Cable 305m",
//     brand: "GERMANYRACK",
//     price: 4540,
//     image: "/assets/coaxial-cable-reel.jpg",
//     sku: "AM-2162-03",
//     discount: "60%",
//     rating: 4.5,
//     reviews: 189,
//     category_id: 6, // COAXIAL (RG) System
//     uom: "ST.",
//   },
//   {
//     id: 4,
//     name: "Solar Cable 4mm² PV Wire 100m",
//     brand: "LINK",
//     price: 4860,
//     image: "/assets/solar-cable-red.jpg",
//     sku: "AM-2166-03",
//     discount: "80%",
//     rating: 4.7,
//     reviews: 145,
//     category_id: 7, // SOLAR CABLE
//     uom: "M.",
//   },
//   {
//     id: 5,
//     name: "Telephone Cable 4-Pair Indoor 305m",
//     brand: "COMMSCOPE",
//     price: 1470,
//     image: "/assets/telephone-cable.jpg",
//     sku: "AM-2220-02",
//     discount: "60%",
//     rating: 4.4,
//     reviews: 98,
//     category_id: 3, // Telephone CABLE
//     uom: "ST.",
//   },
//   {
//     id: 6,
//     name: "19'' Server Rack Cabinet 42U",
//     brand: "LINK",
//     price: 2000,
//     image: "/assets/server-rack-19inch.jpg",
//     sku: "AM-3032",
//     discount: "90%",
//     rating: 4.9,
//     reviews: 87,
//     category_id: 10, // GERMANY RACK
//     uom: "EA.",
//   },
//   {
//     id: 7,
//     name: "US-9035 CAT 5E UTP Cable Indoor 305m",
//     brand: "LINK",
//     price: 1770,
//     image: "/assets/lan-cat5e-box.jpg",
//     sku: "AM-3602A",
//     discount: "60%",
//     rating: 4.7,
//     reviews: 178,
//     category_id: 1, // LAN (UTP) System
//     uom: "PC.",
//   },
//   {
//     id: 8,
//     name: "UT-0216 Fiber Media Converter RJ45",
//     brand: "COMMSCOPE",
//     price: 3108,
//     image: "/assets/fiber-media-converter.jpg",
//     sku: "AM-3620A",
//     discount: "0%",
//     rating: 4.6,
//     reviews: 124,
//     category_id: 9, // NETWORKING System
//     uom: "PC.",
//   },
// ];

// const parsePercent = (text?: string) => {
//   if (!text) return 0;
//   const m = String(text).match(/(\d+)(\.\d+)?/);
//   return m ? Math.round(Number(m[0])) : 0;
// };

// /** ===== In-memory state ===== */
// let state: UIProduct[] = seedRows.map((r, i) => ({
//   id: r.id,
//   name: r.name,
//   brand: r.brand,
//   sku: r.sku,
//   price: r.price,
//   discountPercent: parsePercent((r as any).discount),
//   image_url: (r as any).image || "/placeholder.png",
//   visible: true,
//   order: i,
//   rating: (r as any).rating,
//   reviews: (r as any).reviews,
//   category_id: (r as any).category_id,
//   uom: (r as any).uom,
// }));

// const seedMeta: ProductsMeta = {
//   title: "สินค้าทั้งหมด",
//   subtitle: "ตัวอย่างข้อมูลจาก mock API (in-memory)",
//   updatedAt: new Date().toISOString(),
// };

// let meta: ProductsMeta = { ...seedMeta };

// /** ===== Helpers ===== */
// const sortByOrder = (a: UIProduct, b: UIProduct) => (a.order ?? 0) - (b.order ?? 0);

// /** ===== Queries ===== */
// export function getAll(opts?: { includeHidden?: boolean }): UIProduct[] {
//   const includeHidden = opts?.includeHidden ?? true;
//   const list = includeHidden ? state : state.filter((c) => c.visible !== false);
//   return [...list].sort(sortByOrder);
// }

// export function getMeta(): ProductsMeta {
//   return { ...meta };
// }

// /** ===== Mutations ===== */
// export function setMeta(patch: Partial<ProductsMeta>) {
//   meta = { ...meta, ...patch, updatedAt: new Date().toISOString() };
// }

// export function setVisible(id: UIProduct["id"], visible: boolean) {
//   state = state.map((x) => (x.id === id ? { ...x, visible } : x));
// }

// export function toggleVisible(id: UIProduct["id"]) {
//   state = state.map((x) => (x.id === id ? { ...x, visible: !(x.visible ?? true) } : x));
// }

// export function remove(id: UIProduct["id"]) {
//   state = state.filter((x) => x.id !== id).sort(sortByOrder).map((x, i) => ({ ...x, order: i }));
// }

// export function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
//   const map = new Map(orders.map((o) => [o.id, o.order]));
//   state = state
//     .map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
//     .sort(sortByOrder)
//     .map((x, i) => ({ ...x, order: i }));
// }

// /** create/update */
// export function upsert(p: Partial<UIProduct>): UIProduct {
//   const idx = state.findIndex((c) => c.id === p.id);
//   if (idx >= 0) {
//     const merged: UIProduct = { ...state[idx], ...p } as UIProduct;
//     state = state.map((c, i) => (i === idx ? merged : c)).sort(sortByOrder);
//     return merged;
//   } else {
//     const nextId =
//       typeof p.id !== "undefined"
//         ? p.id
//         : Math.max(0, ...state.map((c) => (typeof c.id === "number" ? c.id : 0))) + 1;

//     const newItem: UIProduct = {
//       id: nextId,
//       name: p.name ?? "New Product",
//       brand: p.brand ?? "",
//       sku: p.sku ?? "",
//       price: typeof p.price === "number" ? p.price : 0,
//       discountPercent: typeof p.discountPercent === "number" ? p.discountPercent : 0,
//       image_url: p.image_url ?? "/placeholder.png",
//       visible: p.visible ?? false, // default ซ่อนก่อน
//       order: state.length,
//       rating: typeof p.rating === "number" ? p.rating : undefined,
//       reviews: typeof p.reviews === "number" ? p.reviews : undefined,
//       category_id: p.category_id,
//       uom: p.uom, // <<< รองรับ uom ตอนสร้าง/แก้ไข
//     };
//     state = [...state, newItem].sort(sortByOrder);
//     return newItem;
//   }
// }

// export function reset() {
//   state = seedRows.map((r, i) => ({
//     id: r.id,
//     name: r.name,
//     brand: r.brand,
//     sku: r.sku,
//     price: r.price,
//     discountPercent: parsePercent((r as any).discount),
//     image_url: (r as any).image || "/placeholder.png",
//     visible: true,
//     order: i,
//     rating: (r as any).rating,
//     reviews: (r as any).reviews,
//     category_id: (r as any).category_id,
//     uom: (r as any).uom,
//   }));
//   meta = { ...seedMeta, updatedAt: new Date().toISOString() };
// }

// v.1.1.5 ===============================================

// v.1.1.4 ===============================================
// // src/app/api/mock/products/_store.ts
// /** ===== Types ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;

//   // เพิ่มเพื่อโชว์บนการ์ด
//   rating?: number;   // 0..5
//   reviews?: number;  // จำนวนรีวิว

//   // ผูกกับหมวดหมู่ (มาจาก mock categories)
//   category_id?: number | string;
// };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
// };

// /** ===== Seed from legacy-like sample =====
//  *  หมายเหตุ: กำหนด category_id ให้สินค้าทุกตัว (อิง mock categories ที่คุณมีอยู่ id 1..12)
//  *  และใส่ rating/reviews ให้เห็นผลในหน้าแอดมิน
//  */
// const seedRows = [
//   {
//     id: 1,
//     name: "Fiber Optic Cable Single Mode 305m",
//     brand: "COMMSCOPE",
//     price: 2160,
//     image: "/assets/fiber-optic-cable.jpg",
//     sku: "AM-2120-02XG",
//     discount: "60%",
//     rating: 4.8,
//     reviews: 156,
//     category_id: 2, // ตัวอย่าง: FIBER OPTIC System
//   },
//   {
//     id: 2,
//     name: "24-Port Gigabit Network Switch",
//     brand: "COMMSCOPE",
//     price: 8530,
//     image: "/assets/network-switch-professional.jpg",
//     sku: "AM-2129",
//     discount: "80%",
//     rating: 4.6,
//     reviews: 234,
//     category_id: 9, // NETWORKING System
//   },
//   {
//     id: 3,
//     name: "RG-6 Coaxial Cable 305m",
//     brand: "GERMANYRACK",
//     price: 4540,
//     image: "/assets/coaxial-cable-reel.jpg",
//     sku: "AM-2162-03",
//     discount: "60%",
//     rating: 4.5,
//     reviews: 189,
//     category_id: 6, // COAXIAL (RG) System
//   },
//   {
//     id: 4,
//     name: "Solar Cable 4mm² PV Wire 100m",
//     brand: "LINK",
//     price: 4860,
//     image: "/assets/solar-cable-red.jpg",
//     sku: "AM-2166-03",
//     discount: "80%",
//     rating: 4.7,
//     reviews: 145,
//     category_id: 7, // SOLAR CABLE
//   },
//   {
//     id: 5,
//     name: "Telephone Cable 4-Pair Indoor 305m",
//     brand: "COMMSCOPE",
//     price: 1470,
//     image: "/assets/telephone-cable.jpg",
//     sku: "AM-2220-02",
//     discount: "60%",
//     rating: 4.4,
//     reviews: 98,
//     category_id: 3, // Telephone CABLE
//   },
//   {
//     id: 6,
//     name: "19'' Server Rack Cabinet 42U",
//     brand: "LINK",
//     price: 2000,
//     image: "/assets/server-rack-19inch.jpg",
//     sku: "AM-3032",
//     discount: "90%",
//     rating: 4.9,
//     reviews: 87,
//     category_id: 10, // GERMANY RACK (หรือปรับตามที่ต้องการ)
//   },
//   {
//     id: 7,
//     name: "US-9035 CAT 5E UTP Cable Indoor 305m",
//     brand: "LINK",
//     price: 1770,
//     image: "/assets/lan-cat5e-box.jpg",
//     sku: "AM-3602A",
//     discount: "60%",
//     rating: 4.7,
//     reviews: 178,
//     category_id: 1, // LAN (UTP) System
//   },
//   {
//     id: 8,
//     name: "UT-0216 Fiber Media Converter RJ45",
//     brand: "COMMSCOPE",
//     price: 3108,
//     image: "/assets/fiber-media-converter.jpg",
//     sku: "AM-3620A",
//     discount: "0%",
//     rating: 4.6,
//     reviews: 124,
//     category_id: 9, // NETWORKING System
//   },
// ];

// const parsePercent = (text?: string) => {
//   if (!text) return 0;
//   const m = String(text).match(/(\d+)(\.\d+)?/);
//   return m ? Math.round(Number(m[0])) : 0;
// };

// /** ===== In-memory state ===== */
// let state: UIProduct[] = seedRows.map((r, i) => ({
//   id: r.id,
//   name: r.name,
//   brand: r.brand,
//   sku: r.sku,
//   price: r.price,
//   discountPercent: parsePercent((r as any).discount),
//   image_url: (r as any).image || "/placeholder.png",
//   visible: true,
//   order: i,
//   rating: (r as any).rating,
//   reviews: (r as any).reviews,
//   category_id: (r as any).category_id,
// }));

// const seedMeta: ProductsMeta = {
//   title: "สินค้าทั้งหมด",
//   subtitle: "ตัวอย่างข้อมูลจาก mock API (in-memory)",
//   updatedAt: new Date().toISOString(),
// };

// let meta: ProductsMeta = { ...seedMeta };

// /** ===== Helpers ===== */
// const sortByOrder = (a: UIProduct, b: UIProduct) => (a.order ?? 0) - (b.order ?? 0);

// /** ===== Queries ===== */
// export function getAll(opts?: { includeHidden?: boolean }): UIProduct[] {
//   const includeHidden = opts?.includeHidden ?? true;
//   const list = includeHidden ? state : state.filter((c) => c.visible !== false);
//   return [...list].sort(sortByOrder);
// }

// export function getMeta(): ProductsMeta {
//   return { ...meta };
// }

// /** ===== Mutations ===== */
// export function setMeta(patch: Partial<ProductsMeta>) {
//   meta = { ...meta, ...patch, updatedAt: new Date().toISOString() };
// }

// export function setVisible(id: UIProduct["id"], visible: boolean) {
//   state = state.map((x) => (x.id === id ? { ...x, visible } : x));
// }

// export function toggleVisible(id: UIProduct["id"]) {
//   state = state.map((x) => (x.id === id ? { ...x, visible: !(x.visible ?? true) } : x));
// }

// export function remove(id: UIProduct["id"]) {
//   state = state.filter((x) => x.id !== id).sort(sortByOrder).map((x, i) => ({ ...x, order: i }));
// }

// export function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
//   const map = new Map(orders.map((o) => [o.id, o.order]));
//   state = state
//     .map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
//     .sort(sortByOrder)
//     .map((x, i) => ({ ...x, order: i }));
// }

// /** create/update */
// export function upsert(p: Partial<UIProduct>): UIProduct {
//   const idx = state.findIndex((c) => c.id === p.id);
//   if (idx >= 0) {
//     const merged: UIProduct = { ...state[idx], ...p } as UIProduct;
//     state = state.map((c, i) => (i === idx ? merged : c)).sort(sortByOrder);
//     return merged;
//   } else {
//     const nextId =
//       typeof p.id !== "undefined"
//         ? p.id
//         : Math.max(0, ...state.map((c) => (typeof c.id === "number" ? c.id : 0))) + 1;

//     const newItem: UIProduct = {
//       id: nextId,
//       name: p.name ?? "New Product",
//       brand: p.brand ?? "",
//       sku: p.sku ?? "",
//       price: typeof p.price === "number" ? p.price : 0,
//       discountPercent: typeof p.discountPercent === "number" ? p.discountPercent : 0,
//       image_url: p.image_url ?? "/placeholder.png",
//       visible: p.visible ?? false, // default ซ่อนก่อน
//       order: state.length,
//       rating: typeof p.rating === "number" ? p.rating : undefined,
//       reviews: typeof p.reviews === "number" ? p.reviews : undefined,
//       category_id: p.category_id, // <<< เก็บ id ของหมวดหมู่
//     };
//     state = [...state, newItem].sort(sortByOrder);
//     return newItem;
//   }
// }

// export function reset() {
//   state = seedRows.map((r, i) => ({
//     id: r.id,
//     name: r.name,
//     brand: r.brand,
//     sku: r.sku,
//     price: r.price,
//     discountPercent: parsePercent((r as any).discount),
//     image_url: (r as any).image || "/placeholder.png",
//     visible: true,
//     order: i,
//     rating: (r as any).rating,
//     reviews: (r as any).reviews,
//     category_id: (r as any).category_id,
//   }));
//   meta = { ...seedMeta, updatedAt: new Date().toISOString() };
// }

// v1.1.4 ================================================


// v.1.1.3 ===============================================
// // src/app/api/mock/products/_store.ts

// /** ===== Types ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;
//   rating?: number;
//   reviews?: number;
//   uom?: string; // ⭐ หน่วยสินค้า
// };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
// };

// /** ===== Seed from legacy-like sample ===== */
// const seedRows = [
//   {
//     id: 1,
//     name: "Fiber Optic Cable Single Mode 305m",
//     brand: "LINK",
//     price: 2160,
//     image: "/assets/fiber-optic-cable.jpg",
//     sku: "AM-2120-02XG",
//     discount: "60%",
//     rating: 4.8,
//     reviews: 156,
//     uom: "ST.",
//   },
//   {
//     id: 2,
//     name: "24-Port Gigabit Network Switch",
//     brand: "COMMSCOPE",
//     price: 8530,
//     image: "/assets/network-switch-professional.jpg",
//     sku: "AM-2129",
//     discount: "80%",
//     rating: 4.6,
//     reviews: 234,
//     uom: "EA.",
//   },
//   {
//     id: 3,
//     name: "RG-6 Coaxial Cable 305m",
//     brand: "GERMANRACK",
//     price: 4540,
//     image: "/assets/coaxial-cable-reel.jpg",
//     sku: "AM-2162-03",
//     discount: "60%",
//     rating: 4.5,
//     reviews: 189,
//     uom: "ST.",
//   },
//   {
//     id: 4,
//     name: "Solar Cable 4mm² PV Wire 100m",
//     brand: "LINK",
//     price: 4860,
//     image: "/assets/solar-cable-red.jpg",
//     sku: "AM-2166-03",
//     discount: "80%",
//     rating: 4.7,
//     reviews: 145,
//     uom: "ST.",
//   },
//   {
//     id: 5,
//     name: "Telephone Cable 4-Pair Indoor 305m",
//     brand: "COMMSCOPE",
//     price: 1470,
//     image: "/assets/telephone-cable.jpg",
//     sku: "AM-2220-02",
//     discount: "60%",
//     rating: 4.4,
//     reviews: 98,
//     uom: "ST.",
//   },
//   {
//     id: 6,
//     name: "19'' Server Rack Cabinet 42U",
//     brand: "LINK",
//     price: 2000,
//     image: "/assets/server-rack-19inch.jpg",
//     sku: "AM-3032",
//     discount: "90%",
//     rating: 4.9,
//     reviews: 87,
//     uom: "EA.",
//   },
//   {
//     id: 7,
//     name: "US-9035 CAT 5E UTP Cable Indoor 305m",
//     brand: "LINK",
//     price: 1770,
//     image: "/assets/lan-cat5e-box.jpg",
//     sku: "AM-3602A",
//     discount: "60%",
//     rating: 4.7,
//     reviews: 178,
//     uom: "PC.",
//   },
//   {
//     id: 8,
//     name: "UT-0216 Fiber Media Converter RJ45",
//     brand: "COMMSCOPE",
//     price: 3108,
//     image: "/assets/fiber-media-converter.jpg",
//     sku: "AM-3620A",
//     discount: "0%",
//     rating: 4.6,
//     reviews: 124,
//     uom: "PC.",
//   },
// ];

// const parsePercent = (text?: string) => {
//   if (!text) return 0;
//   const m = String(text).match(/(\d+)(\.\d+)?/);
//   return m ? Math.round(Number(m[0])) : 0;
// };

// /** ===== In-memory state ===== */
// let state: UIProduct[] = seedRows.map((r, i) => ({
//   id: r.id,
//   name: r.name,
//   brand: r.brand,
//   sku: r.sku,
//   price: r.price,
//   discountPercent: parsePercent((r as any).discount),
//   image_url: (r as any).image || "/placeholder.png",
//   visible: true,
//   order: i,
//   rating: (r as any).rating,
//   reviews: (r as any).reviews,
//   uom: (r as any).uom,
// }));

// const seedMeta: ProductsMeta = {
//   title: "สินค้าทั้งหมด",
//   subtitle: "ตัวอย่างข้อมูลจาก mock API (in-memory)",
//   updatedAt: new Date().toISOString(),
// };

// let meta: ProductsMeta = { ...seedMeta };

// /** ===== Helpers ===== */
// const sortByOrder = (a: UIProduct, b: UIProduct) => (a.order ?? 0) - (b.order ?? 0);

// /** ===== Queries ===== */
// export function getAll(opts?: { includeHidden?: boolean }): UIProduct[] {
//   const includeHidden = opts?.includeHidden ?? true;
//   const list = includeHidden ? state : state.filter((c) => c.visible !== false);
//   return [...list].sort(sortByOrder);
// }

// export function getMeta(): ProductsMeta {
//   return { ...meta };
// }

// /** ===== Mutations ===== */
// export function setMeta(patch: Partial<ProductsMeta>) {
//   meta = { ...meta, ...patch, updatedAt: new Date().toISOString() };
// }

// export function setVisible(id: UIProduct["id"], visible: boolean) {
//   state = state.map((x) => (x.id === id ? { ...x, visible } : x));
// }

// export function toggleVisible(id: UIProduct["id"]) {
//   state = state.map((x) => (x.id === id ? { ...x, visible: !(x.visible ?? true) } : x));
// }

// export function remove(id: UIProduct["id"]) {
//   state = state.filter((x) => x.id !== id).sort(sortByOrder).map((x, i) => ({ ...x, order: i }));
// }

// export function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
//   const map = new Map(orders.map((o) => [o.id, o.order]));
//   state = state
//     .map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
//     .sort(sortByOrder)
//     .map((x, i) => ({ ...x, order: i }));
// }

// /** create/update */
// export function upsert(p: Partial<UIProduct>): UIProduct {
//   const idx = state.findIndex((c) => c.id === p.id);
//   if (idx >= 0) {
//     const merged: UIProduct = { ...state[idx], ...p } as UIProduct;
//     state = state.map((c, i) => (i === idx ? merged : c)).sort(sortByOrder);
//     return merged;
//   } else {
//     const nextId =
//       typeof p.id !== "undefined"
//         ? p.id
//         : Math.max(0, ...state.map((c) => (typeof c.id === "number" ? c.id : 0))) + 1;

//     const newItem: UIProduct = {
//       id: nextId,
//       name: p.name ?? "New Product",
//       brand: p.brand ?? "",
//       sku: p.sku ?? "",
//       price: typeof p.price === "number" ? p.price : 0,
//       discountPercent: typeof p.discountPercent === "number" ? p.discountPercent : 0,
//       image_url: p.image_url ?? "/placeholder.png",
//       visible: p.visible ?? false, // default ซ่อนก่อน
//       order: state.length,
//       rating: typeof p.rating === "number" ? p.rating : undefined,
//       reviews: typeof p.reviews === "number" ? p.reviews : undefined,
//       uom: p.uom ?? "", // ⭐ เก็บหน่วย
//     };
//     state = [...state, newItem].sort(sortByOrder);
//     return newItem;
//   }
// }

// export function reset() {
//   state = seedRows.map((r, i) => ({
//     id: r.id,
//     name: r.name,
//     brand: r.brand,
//     sku: r.sku,
//     price: r.price,
//     discountPercent: parsePercent((r as any).discount),
//     image_url: (r as any).image || "/placeholder.png",
//     visible: true,
//     order: i,
//     rating: (r as any).rating,
//     reviews: (r as any).reviews,
//     uom: (r as any).uom,
//   }));
//   meta = { ...seedMeta, updatedAt: new Date().toISOString() };
// }

// v.1.1.3 ===============================================

// v.1.1.2 ===============================================
// // src/app/api/mock/products/_store.ts

// /** ===== Types ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;

//   // ⭐️ เพิ่มฟิลด์สำหรับ UI ด้านหน้า
//   rating?: number;   // 0..5
//   reviews?: number;  // จำนวนรีวิว
// };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
// };

// /** ===== Seed from legacy-like sample =====
//  *  (ใส่ rating/reviews ให้สอดคล้องกับหน้า frontend)
//  */
// const seedRows = [
//   { id: 1,  name: "Fiber Optic Cable Single Mode 305m",  brand: "COMMSCOPE", price: 2160, image: "/assets/fiber-optic-cable.jpg",       sku: "AM-2120-02XG", discount: "60%", rating: 4.8, reviews: 156 },
//   { id: 2,  name: "24-Port Gigabit Network Switch",       brand: "COMMSCOPE", price: 8530, image: "/assets/network-switch-professional.jpg", sku: "AM-2129",      discount: "80%", rating: 4.6, reviews: 234 },
//   { id: 3,  name: "RG-6 Coaxial Cable 305m",              brand: "COMMSCOPE", price: 4540, image: "/assets/coaxial-cable-reel.jpg",     sku: "AM-2162-03",   discount: "60%", rating: 4.5, reviews: 189 },
//   { id: 4,  name: "Solar Cable 4mm² PV Wire 100m",        brand: "COMMSCOPE", price: 4860, image: "/assets/solar-cable-red.jpg",        sku: "AM-2166-03",   discount: "80%", rating: 4.7, reviews: 145 },
//   { id: 5,  name: "Telephone Cable 4-Pair Indoor 305m",   brand: "COMMSCOPE", price: 1470, image: "/assets/telephone-cable.jpg",        sku: "AM-2220-02",   discount: "60%", rating: 4.4, reviews: 98  },
//   { id: 6,  name: "19'' Server Rack Cabinet 42U",         brand: "COMMSCOPE", price: 2000, image: "/assets/server-rack-19inch.jpg",     sku: "AM-3032",      discount: "90%", rating: 4.9, reviews: 87  },
//   { id: 7,  name: "US-9035 CAT 5E UTP Cable Indoor 305m", brand: "COMMSCOPE", price: 1770, image: "/assets/lan-cat5e-box.jpg",          sku: "AM-3602A",     discount: "60%", rating: 4.7, reviews: 178 },
//   { id: 8,  name: "UT-0216 Fiber Media Converter RJ45",   brand: "COMMSCOPE", price: 3108, image: "/assets/fiber-media-converter.jpg",  sku: "AM-3620A",     discount: "0%",  rating: 4.6, reviews: 124 },
// ];

// const parsePercent = (text?: string) => {
//   if (!text) return 0;
//   const m = String(text).match(/(\d+)(\.\d+)?/);
//   return m ? Math.round(Number(m[0])) : 0;
// };

// /** ===== In-memory state ===== */
// let state: UIProduct[] = seedRows.map((r, i) => ({
//   id: r.id,
//   name: r.name,
//   brand: r.brand,
//   sku: r.sku,
//   price: r.price,
//   discountPercent: parsePercent((r as any).discount),
//   image_url: (r as any).image || "/placeholder.png",
//   visible: true,
//   order: i,
//   rating: (r as any).rating ?? 0,
//   reviews: (r as any).reviews ?? 0,
// }));

// const seedMeta: ProductsMeta = {
//   title: "สินค้าทั้งหมด",
//   subtitle: "ตัวอย่างข้อมูลจาก mock API (in-memory)",
//   updatedAt: new Date().toISOString(),
// };

// let meta: ProductsMeta = { ...seedMeta };

// /** ===== Helpers ===== */
// const sortByOrder = (a: UIProduct, b: UIProduct) => (a.order ?? 0) - (b.order ?? 0);

// /** ===== Queries ===== */
// export function getAll(opts?: { includeHidden?: boolean }): UIProduct[] {
//   const includeHidden = opts?.includeHidden ?? true;
//   const list = includeHidden ? state : state.filter((c) => c.visible !== false);
//   return [...list].sort(sortByOrder);
// }

// export function getMeta(): ProductsMeta {
//   return { ...meta };
// }

// /** ===== Mutations ===== */
// export function setMeta(patch: Partial<ProductsMeta>) {
//   meta = { ...meta, ...patch, updatedAt: new Date().toISOString() };
// }

// export function setVisible(id: UIProduct["id"], visible: boolean) {
//   state = state.map((x) => (x.id === id ? { ...x, visible } : x));
// }

// export function toggleVisible(id: UIProduct["id"]) {
//   state = state.map((x) => (x.id === id ? { ...x, visible: !(x.visible ?? true) } : x));
// }

// export function remove(id: UIProduct["id"]) {
//   state = state.filter((x) => x.id !== id).sort(sortByOrder).map((x, i) => ({ ...x, order: i }));
// }

// export function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
//   const map = new Map(orders.map((o) => [o.id, o.order]));
//   state = state
//     .map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
//     .sort(sortByOrder)
//     .map((x, i) => ({ ...x, order: i }));
// }

// /** create/update */
// export function upsert(p: Partial<UIProduct>): UIProduct {
//   const idx = state.findIndex((c) => c.id === p.id);
//   if (idx >= 0) {
//     // update
//     const merged: UIProduct = { ...state[idx], ...p } as UIProduct;
//     state = state.map((c, i) => (i === idx ? merged : c)).sort(sortByOrder);
//     return merged;
//   } else {
//     // create
//     const nextId =
//       typeof p.id !== "undefined"
//         ? p.id
//         : Math.max(0, ...state.map((c) => (typeof c.id === "number" ? c.id : 0))) + 1;

//     const newItem: UIProduct = {
//       id: nextId,
//       name: p.name ?? "New Product",
//       brand: p.brand ?? "",
//       sku: p.sku ?? "",
//       price: typeof p.price === "number" ? p.price : 0,
//       discountPercent: typeof p.discountPercent === "number" ? p.discountPercent : 0,
//       image_url: p.image_url ?? "/placeholder.png",
//       visible: p.visible ?? false, // default ซ่อนก่อน
//       order: state.length,
//       rating: typeof p.rating === "number" ? p.rating : 0,
//       reviews: typeof p.reviews === "number" ? p.reviews : 0,
//     };
//     state = [...state, newItem].sort(sortByOrder);
//     return newItem;
//   }
// }

// export function reset() {
//   state = seedRows.map((r, i) => ({
//     id: r.id,
//     name: r.name,
//     brand: r.brand,
//     sku: r.sku,
//     price: r.price,
//     discountPercent: parsePercent((r as any).discount),
//     image_url: (r as any).image || "/placeholder.png",
//     visible: true,
//     order: i,
//     rating: (r as any).rating ?? 0,
//     reviews: (r as any).reviews ?? 0,
//   }));
//   meta = { ...seedMeta, updatedAt: new Date().toISOString() };
// }

// v.1.1.2 ===============================================

// // src/app/api/mock/products/_store.ts

// /** ===== Types ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;
// };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
// };

// /** ===== Seed from legacy-like sample ===== */
// const seedRows = [
//   { id: 1,  name: "Fiber Optic Cable Single Mode 305m", brand: "COMMSCOPE", price: 2160,  image: "/assets/fiber-optic-cable.jpg", sku: "AM-2120-02XG", discount: "60%" },
//   { id: 2,  name: "24-Port Gigabit Network Switch",      brand: "COMMSCOPE", price: 8530,  image: "/assets/network-switch-professional.jpg", sku: "AM-2129",      discount: "80%" },
//   { id: 3,  name: "RG-6 Coaxial Cable 305m",   brand: "COMMSCOPE", price: 4540,  image: "/assets/coaxial-cable-reel.jpg", sku: "AM-2162-03",   discount: "60%" },
//   { id: 4,  name: "Solar Cable 4mm² PV Wire 100m",   brand: "COMMSCOPE", price: 4860,  image: "/assets/solar-cable-red.jpg", sku: "AM-2166-03",   discount: "80%" },
//   { id: 5,  name: "Telephone Cable 4-Pair Indoor 305m",   brand: "COMMSCOPE", price: 1470,  image: "/assets/telephone-cable.jpg", sku: "AM-2220-02",   discount: "60%" },
//   { id: 6,  name: "19'' Server Rack Cabinet 42U",      brand: "COMMSCOPE", price: 2000,   image: "/assets/server-rack-19inch.jpg", sku: "AM-3032",      discount: "90%" },
//   { id: 7,  name: "US-9035 CAT 5E UTP Cable Indoor 305m",     brand: "COMMSCOPE", price: 1770,  image: "/assets/lan-cat5e-box.jpg", sku: "AM-3602A",     discount: "60%" },
//   { id: 8,  name: "UT-0216 Fiber Media Converter RJ45",     brand: "COMMSCOPE", price: 3108, image: "/assets/fiber-media-converter.jpg", sku: "AM-3620A",     discount: "0%" },
  
// ];


// const parsePercent = (text?: string) => {
//   if (!text) return 0;
//   const m = String(text).match(/(\d+)(\.\d+)?/);
//   return m ? Math.round(Number(m[0])) : 0;
// };

// /** ===== In-memory state ===== */
// let state: UIProduct[] = seedRows.map((r, i) => ({
//   id: r.id,
//   name: r.name,
//   brand: r.brand,
//   sku: r.sku,
//   price: r.price,
//   discountPercent: parsePercent(r.discount),
//   image_url: r.image || "/placeholder.png",
//   visible: true,
//   order: i,
// }));

// const seedMeta: ProductsMeta = {
//   title: "สินค้าทั้งหมด",
//   subtitle: "ตัวอย่างข้อมูลจาก mock API (in-memory)",
//   updatedAt: new Date().toISOString(),
// };

// let meta: ProductsMeta = { ...seedMeta };

// /** ===== Helpers ===== */
// const sortByOrder = (a: UIProduct, b: UIProduct) => (a.order ?? 0) - (b.order ?? 0);

// /** ===== Queries ===== */
// export function getAll(opts?: { includeHidden?: boolean }): UIProduct[] {
//   const includeHidden = opts?.includeHidden ?? true;
//   const list = includeHidden ? state : state.filter((c) => c.visible !== false);
//   return [...list].sort(sortByOrder);
// }

// export function getMeta(): ProductsMeta {
//   return { ...meta };
// }

// /** ===== Mutations ===== */
// export function setMeta(patch: Partial<ProductsMeta>) {
//   meta = { ...meta, ...patch, updatedAt: new Date().toISOString() };
// }

// export function setVisible(id: UIProduct["id"], visible: boolean) {
//   state = state.map((x) => (x.id === id ? { ...x, visible } : x));
// }

// export function toggleVisible(id: UIProduct["id"]) {
//   state = state.map((x) => (x.id === id ? { ...x, visible: !(x.visible ?? true) } : x));
// }

// export function remove(id: UIProduct["id"]) {
//   state = state.filter((x) => x.id !== id).sort(sortByOrder).map((x, i) => ({ ...x, order: i }));
// }

// export function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
//   const map = new Map(orders.map((o) => [o.id, o.order]));
//   state = state.map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
//     .sort(sortByOrder)
//     .map((x, i) => ({ ...x, order: i }));
// }

// /** create/update */
// export function upsert(p: Partial<UIProduct>): UIProduct {
//   const idx = state.findIndex((c) => c.id === p.id);
//   if (idx >= 0) {
//     const merged: UIProduct = { ...state[idx], ...p } as UIProduct;
//     state = state.map((c, i) => (i === idx ? merged : c)).sort(sortByOrder);
//     return merged;
//   } else {
//     const nextId =
//       typeof p.id !== "undefined"
//         ? p.id
//         : Math.max(0, ...state.map((c) => (typeof c.id === "number" ? c.id : 0))) + 1;

//     const newItem: UIProduct = {
//       id: nextId,
//       name: p.name ?? "New Product",
//       brand: p.brand ?? "",
//       sku: p.sku ?? "",
//       price: typeof p.price === "number" ? p.price : 0,
//       discountPercent: typeof p.discountPercent === "number" ? p.discountPercent : 0,
//       image_url: p.image_url ?? "/placeholder.png",
//       visible: p.visible ?? false, // default ซ่อนก่อน
//       order: state.length,
//     };
//     state = [...state, newItem].sort(sortByOrder);
//     return newItem;
//   }
// }

// export function reset() {
//   state = seedRows.map((r, i) => ({
//     id: r.id, name: r.name, brand: r.brand, sku: r.sku, price: r.price,
//     discountPercent: parsePercent(r.discount), image_url: r.image || "/placeholder.png", visible: true, order: i,
//   }));
//   meta = { ...seedMeta, updatedAt: new Date().toISOString() };
// }

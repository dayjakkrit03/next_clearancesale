// v.1.1.4 ======================================================
// DB-backed store for discount rules (drop-in replacement of the old in-memory store)

import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";

/** ===== Types (เท่าเดิม) ===== */
export type Rule = {
  id: number | string;
  minPercent: number;
  maxPercent?: number;
  borderWidth: number;
  borderColorHex: string;
  badgeBgHex?: string;
  badgeTextHex?: string;
  order: number;
  enabled: boolean;

  // frame
  frameMode?: "draw" | "image";
  frameImageUrl?: string;
  frameInsetPx?: number;
  frameOpacity?: number; // 0..1
  frameObjectFit?: "contain" | "cover" | "stretch";
};

export type UIMeta = {
  title: string;
  subtitle: string;
  updatedAt?: string;
};

/** ===== Helpers ===== */
const TABLE = "discount_rules";
const META_TABLE = "discount_rules_meta";

const coerceId = (v: any) => (isNaN(Number(v)) ? v : Number(v));

async function ensureTZ() {
  try {
    await setInterlinkSessionTZ("+07:00");
  } catch {}
}

// แปลง row -> Rule (numberize BigInt/Decimal ให้เรียบร้อย)
function mapRowToRule(r: any): Rule {
  return {
    id: Number(r.id),
    minPercent: Number(r.min_percent),
    maxPercent: r.max_percent == null ? undefined : Number(r.max_percent),
    borderWidth: Number(r.border_width),
    borderColorHex: String(r.border_color_hex ?? "#000000"),
    badgeBgHex: r.badge_bg_hex ?? undefined,
    badgeTextHex: r.badge_text_hex ?? undefined,
    order: Number(r.display_order ?? 0),
    enabled: !!r.enabled,

    frameMode: (r.frame_mode as "draw" | "image") ?? "draw",
    frameImageUrl: r.frame_image_url ?? undefined,
    frameInsetPx: Number(r.frame_inset_px ?? 0),
    frameOpacity: r.frame_opacity == null ? undefined : Number(r.frame_opacity),
    frameObjectFit:
      (r.frame_object_fit as "contain" | "cover" | "stretch") ?? "contain",
  };
}

/** ===== sanitizePatch (เหมือนเดิม) ===== */
export function sanitizePatch(p: Partial<Rule>): Partial<Rule> {
  const out: Partial<Rule> = {};
  if (p.minPercent != null) out.minPercent = Number(p.minPercent);
  if (p.maxPercent !== undefined)
    out.maxPercent = p.maxPercent === null ? undefined : Number(p.maxPercent);

  if (p.borderWidth != null) out.borderWidth = Number(p.borderWidth);
  if (p.borderColorHex != null) out.borderColorHex = String(p.borderColorHex);

  if (p.badgeBgHex !== undefined) out.badgeBgHex = p.badgeBgHex || undefined;
  if (p.badgeTextHex !== undefined) out.badgeTextHex = p.badgeTextHex || undefined;

  if (p.enabled != null) out.enabled = !!p.enabled;

  if (p.frameMode) out.frameMode = p.frameMode === "image" ? "image" : "draw";
  if (p.frameImageUrl !== undefined) out.frameImageUrl = p.frameImageUrl || undefined;
  if (p.frameInsetPx != null) out.frameInsetPx = Math.max(0, Number(p.frameInsetPx) || 0);
  if (p.frameOpacity != null) {
    const v = Number(p.frameOpacity);
    out.frameOpacity = isNaN(v) ? 1 : Math.max(0, Math.min(1, v));
  }
  if (p.frameObjectFit)
    out.frameObjectFit =
      p.frameObjectFit === "cover" ? "cover" : p.frameObjectFit === "stretch" ? "stretch" : "contain";

  if (p.order != null) out.order = Number(p.order);
  return out;
}

/** ===== Queries ===== */
export async function getAllRules(): Promise<Rule[]> {
  await ensureTZ();
  const rows: any[] = await prismaInterlink.$queryRawUnsafe(
    `
    SELECT
      id, min_percent, max_percent,
      border_width, border_color_hex, badge_bg_hex, badge_text_hex,
      display_order, enabled,
      frame_mode, frame_image_url, frame_inset_px, frame_opacity, frame_object_fit
    FROM ${TABLE}
    ORDER BY display_order ASC, id ASC
    `
  );
  return rows.map(mapRowToRule);
}

export async function getRulesMeta(): Promise<UIMeta> {
  await ensureTZ();
  const rows: any[] = await prismaInterlink.$queryRawUnsafe(
    `SELECT id, title, subtitle, updated_at FROM ${META_TABLE} WHERE id = 1 LIMIT 1`
  );
  if (!rows.length) {
    return {
      title: "Discount styling rules",
      subtitle: "กำหนดสี/ความหนาตามเปอร์เซ็นต์ส่วนลด",
      updatedAt: new Date().toISOString(),
    };
  }
  const r = rows[0];
  return {
    title: String(r.title ?? ""),
    subtitle: String(r.subtitle ?? ""),
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
  };
}

async function getById(id: number | string): Promise<Rule | undefined> {
  await ensureTZ();
  const rows: any[] = await prismaInterlink.$queryRawUnsafe(
    `
    SELECT
      id, min_percent, max_percent,
      border_width, border_color_hex, badge_bg_hex, badge_text_hex,
      display_order, enabled,
      frame_mode, frame_image_url, frame_inset_px, frame_opacity, frame_object_fit
    FROM ${TABLE}
    WHERE id = ?
    LIMIT 1
    `,
    coerceId(id)
  );
  return rows.length ? mapRowToRule(rows[0]) : undefined;
}

/** ===== Mutations ===== */
export async function createRule(patch: Partial<Rule>): Promise<Rule> {
  await ensureTZ();

  const nextOrderRows: any[] = await prismaInterlink.$queryRawUnsafe(
    `SELECT COALESCE(MAX(display_order), -1) + 1 AS nextOrder FROM ${TABLE}`
  );
  const nextOrder = Number(nextOrderRows?.[0]?.nextOrder ?? 0);

  const p = sanitizePatch(patch);

  await prismaInterlink.$executeRawUnsafe(
    `
    INSERT INTO ${TABLE}
      (min_percent, max_percent,
       border_width, border_color_hex, badge_bg_hex, badge_text_hex,
       display_order, enabled,
       frame_mode, frame_image_url, frame_inset_px, frame_opacity, frame_object_fit,
       created_at, updated_at)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `,
    Number(p.minPercent ?? 0),
    p.maxPercent == null ? null : Number(p.maxPercent),
    Number(p.borderWidth ?? 2),
    p.borderColorHex ?? "#000000",
    p.badgeBgHex ?? null,
    p.badgeTextHex ?? null,
    Number(p.order ?? nextOrder),
    p.enabled ?? true,
    p.frameMode ?? "draw",
    p.frameImageUrl ?? null,
    Number(p.frameInsetPx ?? 0),
    p.frameOpacity == null ? 1 : Number(p.frameOpacity),
    p.frameObjectFit ?? "contain"
  );

  const inserted: any[] = await prismaInterlink.$queryRawUnsafe(`SELECT LAST_INSERT_ID() AS id`);
  const newId = Number(inserted?.[0]?.id);
  const row = await getById(newId);
  if (!row) throw new Error("create failed");
  return row;
}

export async function updateRule(id: number | string, patch: Partial<Rule>): Promise<Rule | undefined> {
  await ensureTZ();
  const p = sanitizePatch(patch);

  const cols: string[] = [];
  const vals: any[] = [];
  const push = (c: string, v: any) => { cols.push(`${c} = ?`); vals.push(v); };

  if (p.minPercent != null)      push("min_percent", Number(p.minPercent));
  if (p.maxPercent !== undefined) push("max_percent", p.maxPercent == null ? null : Number(p.maxPercent));
  if (p.borderWidth != null)     push("border_width", Number(p.borderWidth));
  if (p.borderColorHex !== undefined) push("border_color_hex", p.borderColorHex ?? "#000000");
  if (p.badgeBgHex !== undefined)   push("badge_bg_hex", p.badgeBgHex ?? null);
  if (p.badgeTextHex !== undefined) push("badge_text_hex", p.badgeTextHex ?? null);
  if (p.order != null)           push("display_order", Number(p.order));
  if (p.enabled != null)         push("enabled", p.enabled ? 1 : 0);

  if (p.frameMode)               push("frame_mode", p.frameMode);
  if (p.frameImageUrl !== undefined) push("frame_image_url", p.frameImageUrl ?? null);
  if (p.frameInsetPx != null)    push("frame_inset_px", Number(p.frameInsetPx));
  if (p.frameOpacity != null)    push("frame_opacity", Number(p.frameOpacity));
  if (p.frameObjectFit)          push("frame_object_fit", p.frameObjectFit);

  if (cols.length) {
    const sql = `UPDATE ${TABLE} SET ${cols.join(", ")}, updated_at = NOW() WHERE id = ?`;
    vals.push(coerceId(id));
    await prismaInterlink.$executeRawUnsafe(sql, ...vals);
  }
  return await getById(id);
}

export async function toggleRuleEnabled(id: number | string): Promise<Rule | undefined> {
  await ensureTZ();
  await prismaInterlink.$executeRawUnsafe(
    `UPDATE ${TABLE} SET enabled = IF(enabled=1,0,1), updated_at = NOW() WHERE id = ?`,
    coerceId(id)
  );
  return await getById(id);
}

export async function removeRule(id: number | string): Promise<boolean> {
  await ensureTZ();
  await prismaInterlink.$executeRawUnsafe(`DELETE FROM ${TABLE} WHERE id = ?`, coerceId(id));
  const still = await getById(id);
  return !still;
}

/** batch reorder (เหมือนเดิม แต่ทำใน SQL) */
export async function reorderRules(orders: Array<{ id: number | string; order: number }>) {
  await ensureTZ();
  if (!orders?.length) return;
  const caseWhen = orders
    .map((o) => `WHEN ${Number(coerceId(o.id))} THEN ${Number(o.order)}`)
    .join(" ");
  const inList = orders.map((o) => Number(coerceId(o.id))).join(", ");
  const sql = `
    UPDATE ${TABLE}
    SET display_order = CASE id ${caseWhen} END,
        updated_at = NOW()
    WHERE id IN (${inList})
  `;
  await prismaInterlink.$executeRawUnsafe(sql);
}

/** Meta: อ่าน/อัปเดตในตาราง discount_rules_meta */
export async function setRulesMeta(patch: Partial<UIMeta>): Promise<UIMeta> {
  await ensureTZ();
  const cols: string[] = [];
  const vals: any[] = [];
  if (typeof patch.title === "string") { cols.push(`title = ?`); vals.push(patch.title); }
  if (typeof patch.subtitle === "string") { cols.push(`subtitle = ?`); vals.push(patch.subtitle); }
  if (cols.length) {
    await prismaInterlink.$executeRawUnsafe(
      `UPDATE ${META_TABLE} SET ${cols.join(", ")}, updated_at = NOW() WHERE id = 1`
      , ...vals
    );
  }
  return await getRulesMeta();
}

// v.1.1.4 ======================================================


// v.1.1.3 ======================================================
// src/app/api/mock/discount-rules/_store.ts

// import { prismaInterlink } from "@/lib/db";
// import { discount_rules, discount_rules_meta } from "@prisma/generated/interlink";
// import { Prisma } from "@prisma/client";

// // ----------------------------------------------------------------------
// // 1. TYPES & MAPPING
// // ----------------------------------------------------------------------

// export type Rule = {
// 	id: number;
// 	minPercent: number;
// 	maxPercent?: number;
// 	borderWidth: number;
// 	borderColorHex: string;
// 	badgeBgHex?: string;
// 	badgeTextHex?: string;
// 	order: number; // Mapping to display_order
// 	enabled: boolean;

// 	// Frame fields
// 	frameMode?: "draw" | "image";
// 	frameImageUrl?: string;
// 	frameInsetPx?: number;
// 	frameOpacity?: number; // 0..1
// 	frameObjectFit?: "contain" | "cover" | "stretch";
// };

// export type RuleInput = Omit<Rule, 'minPercent' | 'maxPercent' | 'id'> & {
//     id?: string | number;
//     minPercent?: string | number | null;
//     maxPercent?: string | number | null;
// };

// export type UIMeta = {
// 	title: string;
// 	subtitle: string;
// 	updatedAt?: string;
// };

// const mapPrismaRuleToRule = (p: discount_rules): Rule => ({
// 	id: p.id,
// 	minPercent: p.min_percent,
// 	maxPercent: p.max_percent ?? undefined,
// 	borderWidth: p.border_width,
// 	borderColorHex: p.border_color_hex,
// 	badgeBgHex: p.badge_bg_hex ?? undefined,
// 	badgeTextHex: p.badge_text_hex ?? undefined,
// 	order: p.display_order,
// 	enabled: p.enabled,
// 	frameMode: p.frame_mode as Rule["frameMode"],
// 	frameImageUrl: p.frame_image_url ?? undefined,
// 	frameInsetPx: p.frame_inset_px,
// 	// แปลง Decimal ที่มาจากฐานข้อมูลให้เป็น number สำหรับใช้งานในแอปพลิเคชัน
// 	frameOpacity: p.frame_opacity?.toNumber() ?? 1.0,
// 	frameObjectFit: p.frame_object_fit as Rule["frameObjectFit"],
// });

// // ----------------------------------------------------------------------
// // 2. DATA UTILITIES
// // ----------------------------------------------------------------------

// /**
//  * Helper to safely convert input (string/number/null/undefined) to a number or null.
//  * Returns null if input is null or empty string, otherwise returns Number(input).
//  */
// function safeNumber(input: string | number | null | undefined): number | null | undefined {
//     if (input === undefined) return undefined;
//     if (input === null || input === '') return null;
    
//     const num = Number(input);
//     return isNaN(num) ? undefined : num;
// }

// /**
//  * Sanitizes and transforms patch data from camelCase (RuleInput) to snake_case (Prisma).
//  */
// export function sanitizePatch(p: Partial<RuleInput>): Partial<discount_rules> {
// 	const data: Partial<discount_rules> = {};

//     // FIX 1: ใช้ safeNumber เพื่อจัดการกับค่าว่าง ('') และ null อย่างถูกต้อง
// 	const min = safeNumber(p.minPercent);
// 	if (min !== undefined) {
// 		data.min_percent = min ?? 0; // If null, default to 0 for min_percent
// 	}
	
//     // FIX 2: ใช้ safeNumber เพื่อจัดการกับค่าว่าง ('') และอนุญาตให้เป็น null
// 	const max = safeNumber(p.maxPercent);
// 	if (max !== undefined) {
// 		data.max_percent = max; // max_percent สามารถเป็น null ได้
// 	}
	
// 	if (p.borderWidth != null) data.border_width = Number(p.borderWidth);
// 	if (p.borderColorHex !== undefined) data.border_color_hex = String(p.borderColorHex || ''); 
    
// 	if (p.badgeBgHex !== undefined) data.badge_bg_hex = p.badgeBgHex || null;
// 	if (p.badgeTextHex !== undefined) data.badge_text_hex = p.badgeTextHex || null;

// 	if (p.order != null) data.display_order = Number(p.order); // Mapping!
// 	if (p.enabled != null) data.enabled = !!p.enabled;

// 	// Frame fields
// 	if (p.frameMode) data.frame_mode = p.frameMode === "image" ? "image" : "draw";
// 	if (p.frameImageUrl !== undefined) data.frame_image_url = p.frameImageUrl || null;
// 	if (p.frameInsetPx != null) data.frame_inset_px = Math.max(0, Number(p.frameInsetPx) || 0);

// 	if (p.frameOpacity != null) {
// 		const v = Number(p.frameOpacity);
// 		data.frame_opacity = (isNaN(v) ? 1.00 : Math.max(0, Math.min(1, v))) as any;
// 	}

// 	if (p.frameObjectFit)
// 		data.frame_object_fit =
// 			p.frameObjectFit === "cover" ? "cover" : p.frameObjectFit === "stretch" ? "stretch" : "contain";

// 	data.updated_at = new Date();

// 	return data;
// }

// // ----------------------------------------------------------------------
// // 3. CRUD OPERATIONS (เพิ่ม export)
// // ----------------------------------------------------------------------

// export async function getMeta(): Promise<UIMeta> {
// 	const meta = await prismaInterlink.discount_rules_meta.findUnique({ where: { id: 1 } });

// 	if (!meta) {
// 		const defaultMeta = await prismaInterlink.discount_rules_meta.create({
// 			data: { id: 1, title: "Discount styling rules", subtitle: "กำหนดสี/ความหนาตามเปอร์เซ็นต์ส่วนลด" },
// 		});
// 		return { title: defaultMeta.title, subtitle: defaultMeta.subtitle, updatedAt: defaultMeta.updated_at.toISOString() };
// 	}

// 	return {
// 		title: meta.title,
// 		subtitle: meta.subtitle,
// 		updatedAt: meta.updated_at.toISOString(),
// 	};
// }

// export async function updateMeta(patch: Partial<UIMeta>): Promise<UIMeta> {
// 	const data: Partial<discount_rules_meta> = { updated_at: new Date() };

// 	if (patch.title !== undefined) data.title = patch.title;
// 	if (patch.subtitle !== undefined) data.subtitle = patch.subtitle;

// 	const updatedMeta = await prismaInterlink.discount_rules_meta.upsert({
// 		where: { id: 1 },
// 		update: data,
// 		create: { id: 1, title: data.title ?? "", subtitle: data.subtitle ?? "", updated_at: data.updated_at },
// 	});

// 	return {
// 		title: updatedMeta.title,
// 		subtitle: updatedMeta.subtitle,
// 		updatedAt: updatedMeta.updated_at.toISOString(),
// 	};
// }

// export async function getAllRules(): Promise<Rule[]> {
// 	const prismaRules = await prismaInterlink.discount_rules.findMany({
// 		orderBy: { display_order: "asc" },
// 	});
// 	return prismaRules.map(mapPrismaRuleToRule);
// }

// export async function getRuleById(id: number): Promise<Rule | null> {
// 	const rule = await prismaInterlink.discount_rules.findUnique({ where: { id } });
// 	return rule ? mapPrismaRuleToRule(rule) : null;
// }

// export async function createItem(patch: Partial<RuleInput>): Promise<Rule> {
// 	const latestOrder = await prismaInterlink.discount_rules.aggregate({ _max: { display_order: true } });
// 	const nextOrder = (latestOrder._max.display_order ?? 0) + 1;

// 	const defaults: Partial<RuleInput> = {
// 		minPercent: 0,
// 		borderWidth: 2,
// 		borderColorHex: "#0ea5e9", // สีฟ้ามาตรฐาน
// 		order: nextOrder,
// 		enabled: true,
// 		frameMode: "draw",
// 	};

// 	const data = sanitizePatch({ ...defaults, ...patch });

// 	const newItem = await prismaInterlink.discount_rules.create({
// 		data: data as any,
// 	});

// 	return mapPrismaRuleToRule(newItem);
// }

// export async function updateItem(id: number, patch: Partial<RuleInput>): Promise<Rule> {
// 	const data = sanitizePatch(patch);

// 	const updatedItem = await prismaInterlink.discount_rules.update({
// 		where: { id: id },
// 		data: data as any,
// 	});

// 	return mapPrismaRuleToRule(updatedItem);
// }

// export async function deleteItem(id: number): Promise<void> {
// 	await prismaInterlink.discount_rules.delete({ where: { id: id } });
// }

// export async function reorderItems(orders: Array<{ id: number; order: number }>): Promise<void> {
// 	const updates = orders.map(o =>
// 		prismaInterlink.discount_rules.update({
// 			where: { id: o.id },
// 			data: { display_order: o.order, updated_at: new Date() },
// 		})
// 	);

// 	await prismaInterlink.$transaction(updates);
// }

// // ----------------------------------------------------------------------
// // 4. EXPORTS (เหลือแค่ store)
// // ----------------------------------------------------------------------

// export const store = {
// 	getMeta,
// 	getAllRules,
// };
// // *** REMOVED: export { sanitizePatch }; ***
// v.1.1.3 ======================================================

// v.1.1.2 ======================================================
// // src/app/api/mock/discount-rules/_store.ts

// // In-memory store for mock discount rules and UI meta.
// // NOTE: จะรีเซ็ตใหม่ถ้า server รีสตาร์ต/HMR
// export type Rule = {
//   id: number | string;
//   minPercent: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   badgeBgHex?: string;
//   badgeTextHex?: string;
//   order: number;
//   enabled: boolean;

//   // NEW: frame
//   frameMode?: "draw" | "image";
//   frameImageUrl?: string;
//   frameInsetPx?: number;
//   frameOpacity?: number; // 0..1
//   frameObjectFit?: "contain" | "cover" | "stretch";
// };

// export type UIMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
// };

// let _id = 1000;
// const nextId = () => (++_id).toString();

// // seed เล็ก ๆ
// export const store: { items: Rule[]; meta: UIMeta } = {
//   items: [
//     {
//       id: "1",
//       minPercent: 60,
//       maxPercent: 69,
//       borderWidth: 2,
//       borderColorHex: "#0ea5e9",
//       order: 0,
//       enabled: true,
//       frameMode: "draw",
//     },
//     {
//       id: "2",
//       minPercent: 70,
//       maxPercent: 79,
//       borderWidth: 2,
//       borderColorHex: "#f59e0b",
//       order: 1,
//       enabled: true,
//       frameMode: "draw",
//     },
//     {
//       id: "3",
//       minPercent: 80,
//       maxPercent: 89,
//       borderWidth: 2,
//       borderColorHex: "#eab308",
//       order: 2,
//       enabled: true,
//       frameMode: "draw",
//     },
//     {
//       id: "4",
//       minPercent: 90,
//       borderWidth: 2,
//       borderColorHex: "#ef4444",
//       order: 3,
//       enabled: true,
//       frameMode: "draw",
//     },
//   ],
//   meta: {
//     title: "Discount styling rules",
//     subtitle: "กำหนดสี/ความหนาตามเปอร์เซ็นต์ส่วนลด",
//     updatedAt: new Date().toISOString(),
//   },
// };

// export function sanitizePatch(p: Partial<Rule>): Partial<Rule> {
//   const out: Partial<Rule> = {};
//   if (p.minPercent != null) out.minPercent = Number(p.minPercent);
//   if (p.maxPercent !== undefined)
//     out.maxPercent = p.maxPercent === null ? undefined : Number(p.maxPercent);

//   if (p.borderWidth != null) out.borderWidth = Number(p.borderWidth);
//   if (p.borderColorHex != null) out.borderColorHex = String(p.borderColorHex);

//   if (p.badgeBgHex !== undefined) out.badgeBgHex = p.badgeBgHex || undefined;
//   if (p.badgeTextHex !== undefined) out.badgeTextHex = p.badgeTextHex || undefined;

//   if (p.enabled != null) out.enabled = !!p.enabled;

//   // frame fields
//   if (p.frameMode) out.frameMode = p.frameMode === "image" ? "image" : "draw";
//   if (p.frameImageUrl !== undefined) out.frameImageUrl = p.frameImageUrl || undefined;
//   if (p.frameInsetPx != null) out.frameInsetPx = Math.max(0, Number(p.frameInsetPx) || 0);
//   if (p.frameOpacity != null) {
//     const v = Number(p.frameOpacity);
//     out.frameOpacity = isNaN(v) ? 1 : Math.max(0, Math.min(1, v));
//   }
//   if (p.frameObjectFit)
//     out.frameObjectFit =
//       p.frameObjectFit === "cover" ? "cover" : p.frameObjectFit === "stretch" ? "stretch" : "contain";

//   return out;
// }

// export function createItem(patch: Partial<Rule>): Rule {
//   const base: Rule = {
//     id: nextId(),
//     minPercent: 0,
//     borderWidth: 2,
//     borderColorHex: "#0ea5e9",
//     order: store.items.length,
//     enabled: true,
//     frameMode: "draw",
//   };
//   const item: Rule = { ...base, ...sanitizePatch(patch) };
//   store.items.push(item);
//   sortInPlace();
//   return item;
// }

// export function sortInPlace() {
//   store.items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
// }

// v.1.1.2 ======================================================

// // src/app/api/mock/discount-rules/_store.ts

// /** ============== Types ============== */
// export type DiscountRule = {
//   id: number | string;
//   minPercent: number;       // >= 0
//   maxPercent?: number;      // <= 100 (optional = no upper bound)
//   borderWidth: number;      // px
//   borderColorHex: string;   // "#RRGGBB" or "#RGB"
//   badgeBgHex?: string;      // optional
//   badgeTextHex?: string;    // optional
//   order: number;            // sorting index (0-based)
//   enabled: boolean;
// };

// export type DiscountRulesMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
// };

// /** ============== Seeds ============== */
// /** Tailwind-ish color mapping:
//  *  60% -> sky-500 (#0ea5e9)
//  *  70% -> amber-500 (#f59e0b)
//  *  80% -> yellow-500 (#eab308)
//  *  90% -> red-500 (#ef4444)
//  */
// const seed: Omit<DiscountRule, "id" | "order">[] = [
//   { minPercent: 60, maxPercent: 69, borderWidth: 2, borderColorHex: "#0ea5e9", enabled: true },
//   { minPercent: 70, maxPercent: 79, borderWidth: 2, borderColorHex: "#f59e0b", enabled: true },
//   { minPercent: 80, maxPercent: 89, borderWidth: 2, borderColorHex: "#eab308", enabled: true },
//   { minPercent: 90,                 borderWidth: 2, borderColorHex: "#ef4444", enabled: true },
// ];

// const seedMeta: DiscountRulesMeta = {
//   title: "Discount styling rules",
//   subtitle: "กำหนดสีกรอบ/ความหนาตามเปอร์เซ็นต์ส่วนลด",
//   updatedAt: new Date().toISOString(),
// };

// /** ============== In-memory state ============== */
// let state: DiscountRule[] = seed.map((r, i) => ({
//   id: i + 1,
//   order: i,
//   ...r,
// }));

// let meta: DiscountRulesMeta = { ...seedMeta };

// /** ============== Helpers ============== */
// const sortByOrder = (a: DiscountRule, b: DiscountRule) => (a.order ?? 0) - (b.order ?? 0);

// /** ============== Queries ============== */
// export function getAll(): DiscountRule[] {
//   return [...state].sort(sortByOrder);
// }

// export function getMeta(): DiscountRulesMeta {
//   return { ...meta };
// }

// /** ============== Mutations ============== */
// export function setMeta(patch: Partial<DiscountRulesMeta>) {
//   meta = { ...meta, ...patch, updatedAt: new Date().toISOString() };
// }

// export function upsert(rule: Partial<DiscountRule>): DiscountRule {
//   // If ID exists -> update
//   const idx = state.findIndex((r) => r.id === rule.id);
//   if (idx >= 0) {
//     const merged: DiscountRule = { ...state[idx], ...rule } as DiscountRule;
//     state = state.map((r, i) => (i === idx ? merged : r)).sort(sortByOrder);
//     return merged;
//   }

//   // Else -> create
//   const nextId =
//     typeof rule.id !== "undefined"
//       ? rule.id
//       : Math.max(0, ...state.map((r) => (typeof r.id === "number" ? r.id : 0))) + 1;

//   const newItem: DiscountRule = {
//     id: nextId,
//     minPercent: rule.minPercent ?? 0,
//     maxPercent: rule.maxPercent,
//     borderWidth: rule.borderWidth ?? 2,
//     borderColorHex: rule.borderColorHex ?? "#999999",
//     badgeBgHex: rule.badgeBgHex,
//     badgeTextHex: rule.badgeTextHex,
//     order: typeof rule.order === "number" ? rule.order : state.length,
//     enabled: rule.enabled ?? true,
//   };
//   state = [...state, newItem].sort(sortByOrder);
//   return newItem;
// }

// export function remove(id: DiscountRule["id"]) {
//   state = state.filter((r) => r.id !== id).sort(sortByOrder).map((r, i) => ({ ...r, order: i }));
// }

// export function toggleEnabled(id: DiscountRule["id"]) {
//   state = state.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
// }

// export function reorder(orders: { id: DiscountRule["id"]; order: number }[]) {
//   const map = new Map(orders.map((o) => [o.id, o.order]));
//   state = state
//     .map((r) => ({ ...r, order: map.get(r.id) ?? r.order }))
//     .sort(sortByOrder)
//     .map((r, i) => ({ ...r, order: i }));
// }

// /** Dev helper */
// export function reset() {
//   state = seed.map((r, i) => ({ id: i + 1, order: i, ...r }));
//   meta = { ...seedMeta, updatedAt: new Date().toISOString() };
// }

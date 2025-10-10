// v.1.1.2 ======================================================
// src/app/api/mock/discount-rules/_store.ts

// In-memory store for mock discount rules and UI meta.
// NOTE: จะรีเซ็ตใหม่ถ้า server รีสตาร์ต/HMR
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

  // NEW: frame
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

let _id = 1000;
const nextId = () => (++_id).toString();

// seed เล็ก ๆ
export const store: { items: Rule[]; meta: UIMeta } = {
  items: [
    {
      id: "1",
      minPercent: 60,
      maxPercent: 69,
      borderWidth: 2,
      borderColorHex: "#0ea5e9",
      order: 0,
      enabled: true,
      frameMode: "draw",
    },
    {
      id: "2",
      minPercent: 70,
      maxPercent: 79,
      borderWidth: 2,
      borderColorHex: "#f59e0b",
      order: 1,
      enabled: true,
      frameMode: "draw",
    },
    {
      id: "3",
      minPercent: 80,
      maxPercent: 89,
      borderWidth: 2,
      borderColorHex: "#eab308",
      order: 2,
      enabled: true,
      frameMode: "draw",
    },
    {
      id: "4",
      minPercent: 90,
      borderWidth: 2,
      borderColorHex: "#ef4444",
      order: 3,
      enabled: true,
      frameMode: "draw",
    },
  ],
  meta: {
    title: "Discount styling rules",
    subtitle: "กำหนดสี/ความหนาตามเปอร์เซ็นต์ส่วนลด",
    updatedAt: new Date().toISOString(),
  },
};

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

  // frame fields
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

  return out;
}

export function createItem(patch: Partial<Rule>): Rule {
  const base: Rule = {
    id: nextId(),
    minPercent: 0,
    borderWidth: 2,
    borderColorHex: "#0ea5e9",
    order: store.items.length,
    enabled: true,
    frameMode: "draw",
  };
  const item: Rule = { ...base, ...sanitizePatch(patch) };
  store.items.push(item);
  sortInPlace();
  return item;
}

export function sortInPlace() {
  store.items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

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

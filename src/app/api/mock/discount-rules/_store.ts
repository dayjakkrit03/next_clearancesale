// src/app/api/mock/discount-rules/_store.ts

/** ============== Types ============== */
export type DiscountRule = {
  id: number | string;
  minPercent: number;       // >= 0
  maxPercent?: number;      // <= 100 (optional = no upper bound)
  borderWidth: number;      // px
  borderColorHex: string;   // "#RRGGBB" or "#RGB"
  badgeBgHex?: string;      // optional
  badgeTextHex?: string;    // optional
  order: number;            // sorting index (0-based)
  enabled: boolean;
};

export type DiscountRulesMeta = {
  title: string;
  subtitle: string;
  updatedAt?: string;
};

/** ============== Seeds ============== */
/** Tailwind-ish color mapping:
 *  60% -> sky-500 (#0ea5e9)
 *  70% -> amber-500 (#f59e0b)
 *  80% -> yellow-500 (#eab308)
 *  90% -> red-500 (#ef4444)
 */
const seed: Omit<DiscountRule, "id" | "order">[] = [
  { minPercent: 60, maxPercent: 69, borderWidth: 2, borderColorHex: "#0ea5e9", enabled: true },
  { minPercent: 70, maxPercent: 79, borderWidth: 2, borderColorHex: "#f59e0b", enabled: true },
  { minPercent: 80, maxPercent: 89, borderWidth: 2, borderColorHex: "#eab308", enabled: true },
  { minPercent: 90,                 borderWidth: 2, borderColorHex: "#ef4444", enabled: true },
];

const seedMeta: DiscountRulesMeta = {
  title: "Discount styling rules",
  subtitle: "กำหนดสีกรอบ/ความหนาตามเปอร์เซ็นต์ส่วนลด",
  updatedAt: new Date().toISOString(),
};

/** ============== In-memory state ============== */
let state: DiscountRule[] = seed.map((r, i) => ({
  id: i + 1,
  order: i,
  ...r,
}));

let meta: DiscountRulesMeta = { ...seedMeta };

/** ============== Helpers ============== */
const sortByOrder = (a: DiscountRule, b: DiscountRule) => (a.order ?? 0) - (b.order ?? 0);

/** ============== Queries ============== */
export function getAll(): DiscountRule[] {
  return [...state].sort(sortByOrder);
}

export function getMeta(): DiscountRulesMeta {
  return { ...meta };
}

/** ============== Mutations ============== */
export function setMeta(patch: Partial<DiscountRulesMeta>) {
  meta = { ...meta, ...patch, updatedAt: new Date().toISOString() };
}

export function upsert(rule: Partial<DiscountRule>): DiscountRule {
  // If ID exists -> update
  const idx = state.findIndex((r) => r.id === rule.id);
  if (idx >= 0) {
    const merged: DiscountRule = { ...state[idx], ...rule } as DiscountRule;
    state = state.map((r, i) => (i === idx ? merged : r)).sort(sortByOrder);
    return merged;
  }

  // Else -> create
  const nextId =
    typeof rule.id !== "undefined"
      ? rule.id
      : Math.max(0, ...state.map((r) => (typeof r.id === "number" ? r.id : 0))) + 1;

  const newItem: DiscountRule = {
    id: nextId,
    minPercent: rule.minPercent ?? 0,
    maxPercent: rule.maxPercent,
    borderWidth: rule.borderWidth ?? 2,
    borderColorHex: rule.borderColorHex ?? "#999999",
    badgeBgHex: rule.badgeBgHex,
    badgeTextHex: rule.badgeTextHex,
    order: typeof rule.order === "number" ? rule.order : state.length,
    enabled: rule.enabled ?? true,
  };
  state = [...state, newItem].sort(sortByOrder);
  return newItem;
}

export function remove(id: DiscountRule["id"]) {
  state = state.filter((r) => r.id !== id).sort(sortByOrder).map((r, i) => ({ ...r, order: i }));
}

export function toggleEnabled(id: DiscountRule["id"]) {
  state = state.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
}

export function reorder(orders: { id: DiscountRule["id"]; order: number }[]) {
  const map = new Map(orders.map((o) => [o.id, o.order]));
  state = state
    .map((r) => ({ ...r, order: map.get(r.id) ?? r.order }))
    .sort(sortByOrder)
    .map((r, i) => ({ ...r, order: i }));
}

/** Dev helper */
export function reset() {
  state = seed.map((r, i) => ({ id: i + 1, order: i, ...r }));
  meta = { ...seedMeta, updatedAt: new Date().toISOString() };
}

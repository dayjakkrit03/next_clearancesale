// src/lib/validation/discountRule.ts

export type DiscountRuleInput = {
  minPercent?: unknown;
  maxPercent?: unknown;
  borderWidth?: unknown;
  borderColorHex?: unknown;
  badgeBgHex?: unknown;
  badgeTextHex?: unknown;
  order?: unknown;
  enabled?: unknown;
};

function isHexColor(v: unknown) {
  if (typeof v !== "string") return false;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);
}

function asNumber(v: unknown, name: string) {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  throw new Error(`${name} ต้องเป็นตัวเลข`);
}

function asBoolean(v: unknown, name: string) {
  if (typeof v === "boolean") return v;
  if (v === "true") return true;
  if (v === "false") return false;
  throw new Error(`${name} ต้องเป็น boolean`);
}

export function validateDiscountRuleInput(raw: DiscountRuleInput) {
  // minPercent (required)
  const minPercent = asNumber(raw.minPercent, "minPercent");
  if (minPercent < 0 || minPercent > 100) throw new Error("minPercent ต้องอยู่ในช่วง 0–100");

  // maxPercent (optional)
  let maxPercent: number | undefined = undefined;
  if (typeof raw.maxPercent !== "undefined" && raw.maxPercent !== null && raw.maxPercent !== "") {
    maxPercent = asNumber(raw.maxPercent, "maxPercent");
    if (maxPercent < 0 || maxPercent > 100) throw new Error("maxPercent ต้องอยู่ในช่วง 0–100");
    if (maxPercent < minPercent) throw new Error("maxPercent ต้องมากกว่า/เท่ากับ minPercent");
  }

  // borderWidth (required)
  const borderWidth = asNumber(raw.borderWidth, "borderWidth");
  if (borderWidth <= 0 || borderWidth > 16) throw new Error("borderWidth ควรมากกว่า 0 และไม่เกิน 16");

  // borderColorHex (required)
  const borderColorHex = raw.borderColorHex;
  if (!isHexColor(borderColorHex)) throw new Error("borderColorHex ต้องเป็น HEX เช่น #ef4444");

  // optional badge colors
  const badgeBgHex = raw.badgeBgHex;
  if (typeof badgeBgHex !== "undefined" && badgeBgHex !== null && badgeBgHex !== "") {
    if (!isHexColor(badgeBgHex)) throw new Error("badgeBgHex ต้องเป็น HEX เช่น #111111");
  }
  const badgeTextHex = raw.badgeTextHex;
  if (typeof badgeTextHex !== "undefined" && badgeTextHex !== null && badgeTextHex !== "") {
    if (!isHexColor(badgeTextHex)) throw new Error("badgeTextHex ต้องเป็น HEX เช่น #ffffff");
  }

  // order (optional)
  let order: number | undefined = undefined;
  if (typeof raw.order !== "undefined" && raw.order !== null && raw.order !== "") {
    order = asNumber(raw.order, "order");
    if (order < 0) throw new Error("order ต้องเป็นเลข 0 หรือมากกว่า");
  }

  // enabled (optional)
  let enabled: boolean | undefined = undefined;
  if (typeof raw.enabled !== "undefined") {
    enabled = asBoolean(raw.enabled, "enabled");
  }

  return {
    minPercent,
    maxPercent,
    borderWidth,
    borderColorHex: String(borderColorHex),
    badgeBgHex: typeof badgeBgHex === "string" ? badgeBgHex : undefined,
    badgeTextHex: typeof badgeTextHex === "string" ? badgeTextHex : undefined,
    order,
    enabled,
  };
}

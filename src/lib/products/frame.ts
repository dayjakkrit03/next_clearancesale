// types ที่การ์ดฝั่งลูกค้าใช้
export type FrameInfo =
  | { mode: "image"; imageUrl: string; inset: number; opacity: number; objectFit: "contain" | "cover" | "fill" }
  | { mode: "draw"; borderWidth: number; borderColorHex: string };

// rule แบบ lite ที่ได้จาก API (หรือกำหนดเอง)
export type DiscountRuleLite = {
  minPercent?: number;
  maxPercent?: number;
  frameMode?: "image" | "draw";
  frameImageUrl?: string;
  frameInsetPx?: number;
  frameOpacity?: number;              // 0..1
  frameObjectFit?: "contain" | "cover" | "fill" | "stretch";
  borderWidth?: number;
  borderColorHex?: string;
  order?: number;
};

// เลือก rule ตามเปอร์เซ็นต์
export function pickRuleFromPercent(
  percent?: number,
  rules: DiscountRuleLite[] = []
): DiscountRuleLite | null {
  if (percent == null) return null;
  for (const r of rules) {
    const lo = r.minPercent ?? 0;
    const hiOK = typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
    if (percent >= lo && hiOK) return r;
  }
  return null;
}

// แปลง rule -> FrameInfo ที่การ์ดเข้าใจ
export function toFrameInfo(rule: DiscountRuleLite | null | undefined): FrameInfo | null {
  if (!rule) return null;

  if (rule.frameMode === "image" && rule.frameImageUrl) {
    const inset = Math.max(0, Number(rule.frameInsetPx ?? 0));
    const opacity =
      typeof rule.frameOpacity === "number"
        ? Math.min(1, Math.max(0, rule.frameOpacity))
        : 1;

    // map "stretch" -> "fill" ให้ตรง type
    const ofit: "contain" | "cover" | "fill" =
      rule.frameObjectFit === "stretch"
        ? "fill"
        : (rule.frameObjectFit ?? "contain");

    return {
      mode: "image",
      imageUrl: rule.frameImageUrl,
      inset,
      opacity,
      objectFit: ofit,
    };
  }

  // fallback draw frame
  return {
    mode: "draw",
    borderWidth: Number(rule.borderWidth ?? 2),
    borderColorHex: String(rule.borderColorHex ?? "#FF3B30"),
  };
}

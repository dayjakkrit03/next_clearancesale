// src/components/discount-rule-strip.server.tsx

// import Image from "next/image";
// import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/base-url";

/* ========= Types ========= */
type Rule = {
  id: string | number;
  minPercent?: number;
  maxPercent?: number;
  borderWidth: number;
  borderColorHex: string;
  frameMode?: "image" | "draw";
  frameImageUrl?: string;
  frameInsetPx?: number;
  frameOpacity?: number;
  frameObjectFit?: "contain" | "cover" | "stretch";
  enabled?: boolean;
  order?: number;
};

export type DiscountRuleItem = {
  id: string | number;
  title: string;
  borderCss: string;
  cardBg: string;
  decoType: "image" | "draw";
  decoImageUrl?: string;
  decoImageOpacity?: number;
  decoObjectFit?: "contain" | "cover" | "fill";
  decoBorderCss?: string;
  buttonBg: string;
  buttonBgHover: string;
  buttonText: string;
};

/* ========= Utils ========= */
const hexToRgb = (hex: string) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
};
const rgba = (hex: string, a = 0.1) => {
  const rgb = hexToRgb(hex);
  return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})` : `rgba(0,0,0,${a})`;
};
const lum = (hex: string) => {
  const c = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  const t = [c.r, c.g, c.b].map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * t[0] + 0.7152 * t[1] + 0.0722 * t[2];
};
const textOn = (hex: string) => (lum(hex) > 0.5 ? "#111827" : "#ffffff");
const darken = (hex: string, amt = 0.08) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const d = (v: number) => Math.max(0, Math.min(255, Math.round(v * (1 - amt))));
  return `#${[d(rgb.r), d(rgb.g), d(rgb.b)]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")}`;
};
const objectFit = (fit?: string): "contain" | "cover" | "fill" =>
  fit === "cover" ? "cover" : fit === "stretch" ? "fill" : "contain";

const toTitle = (min?: number) => `ลดตั้งแต่ ${typeof min === "number" ? min : 0}% ขึ้นไป`;

/* ========= Server Component ========= */
export default async function DiscountRuleStripServer() {
  const url = await absoluteUrl("/api/mock/discount-rules");
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const json = (await res.json()) as { items?: Rule[] };

  // 👉 ใส่ชนิดให้ callback: (r: Rule), (a: Rule, b: Rule)
  const rules: Rule[] = (json.items ?? [])
    .filter((r: Rule) => r && (r.enabled ?? true))
    .map((r: Rule): Rule => ({
      ...r,
      borderWidth: Number(r.borderWidth) || 2,
      borderColorHex: r.borderColorHex || "#2563eb",
      frameOpacity:
        typeof r.frameOpacity === "number" ? Math.max(0, Math.min(1, r.frameOpacity)) : undefined,
    }))
    .sort((a: Rule, b: Rule) => (a.order ?? 0) - (b.order ?? 0));

  if (!rules.length) return null;

  const display: DiscountRuleItem[] = rules.slice(0, 4).map((r: Rule) => {
    const borderCss = `${Math.max(1, r.borderWidth)}px solid ${r.borderColorHex}`;
    const cardBg = rgba(r.borderColorHex, 0.1);
    const buttonBg = r.borderColorHex;
    return {
      id: r.id,
      title: toTitle(r.minPercent),
      borderCss,
      cardBg,
      decoType: r.frameMode === "image" && r.frameImageUrl ? "image" : "draw",
      decoImageUrl: r.frameImageUrl || undefined,
      decoImageOpacity:
        typeof r.frameOpacity === "number" ? Math.max(0, Math.min(1, r.frameOpacity)) : 1,
      decoObjectFit: objectFit(r.frameObjectFit),
      decoBorderCss: borderCss,
      buttonBg,
      buttonBgHover: darken(buttonBg, 0.1),
      buttonText: textOn(buttonBg),
    };
  });

  const { DiscountRuleStripClient } = await import("./discount-rule-strip.client");
  return <DiscountRuleStripClient items={display} />;
}

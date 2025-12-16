// v.1.1.3 =======================================================
// src/components/discount-rule-strip.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type DiscountRule = {
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
type ApiPayload = { items?: DiscountRule[] };

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const hexToRgb = (hex: string) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
};
const rgba = (hex: string, alpha = 0.12) => {
  const rgb = hexToRgb(hex);
  return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})` : `rgba(0,0,0,${alpha})`;
};
const relativeLuminance = (hex: string) => {
  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  const s = [rgb.r, rgb.g, rgb.b].map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
};
const contrastTextColor = (hex: string) =>
  relativeLuminance(hex) > 0.5 ? "#111827" : "#ffffff";
const darkenHex = (hex: string, amt = 0.08) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const d = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v * (1 - amt))));
  return `#${[d(rgb.r), d(rgb.g), d(rgb.b)]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")}`;
};
const minOnlyLabel = (minP?: number) =>
  `ลดตั้งแต่ ${typeof minP === "number" ? minP : 0}% ขึ้นไป`;
const objectFitMap = (fit?: string): "cover" | "contain" | "fill" =>
  fit === "cover" ? "cover" : fit === "stretch" ? "fill" : "contain";

export default function DiscountRuleStrip() {
  const [rules, setRules] = useState<DiscountRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/mock/discount-rules", { cache: "no-store" });
        const data: ApiPayload = res.ok ? await res.json() : { items: [] };
        if (!alive) return;
        const normalized = (data.items ?? [])
          .filter((r) => r && (r.enabled ?? true))
          .map((r) => ({
            ...r,
            borderWidth: Number(r.borderWidth) || 2,
            borderColorHex: r.borderColorHex || "#2563eb",
            frameOpacity:
              typeof r.frameOpacity === "number"
                ? clamp01(Number(r.frameOpacity))
                : undefined,
          }))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setRules(normalized);
      } catch {
        setRules([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // แสดงทุก rule ที่ enabled (ไม่ตัดเหลือ 4 แล้ว)
  const displayRules = useMemo(() => rules, [rules]);

  // ปรับจำนวน column ตามจำนวนการ์ด เพื่อให้เต็มหน้าจอพอดี
  const gridClass = useMemo(() => {
    const count = displayRules.length || 4;

    if (count <= 1) {
      return "grid grid-cols-1 gap-4 max-w-md mx-auto";
    }
    if (count === 2) {
      return "grid grid-cols-1 sm:grid-cols-2 gap-4";
    }
    if (count === 3) {
      return "grid grid-cols-1 sm:grid-cols-3 gap-4";
    }
    if (count === 4) {
      return "grid grid-cols-2 md:grid-cols-4 gap-4";
    }
    // 5 อันขึ้นไป
    return "grid grid-cols-2 md:grid-cols-5 gap-4";
  }, [displayRules.length]);

  // ตอน loading ยังใช้ skeleton แบบเดิม แต่ไม่กระทบ logic จริง
  const skeletonGridClass =
    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

  if (loading) {
    return (
      <div className="bg-gradient-subtle py-6">
        <div className="container mx-auto px-4">
          <div className={skeletonGridClass}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl animate-pulse bg-muted/60 border border-border"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!displayRules.length) return null;

  return (
    <div className="bg-gradient-subtle py-6">
      <div className="container mx-auto px-4">
        <div className={gridClass}>
          {displayRules.map((r, i) => {
            const border = `${Math.max(1, Number(r.borderWidth))}px solid ${
              r.borderColorHex
            }`;
            const bg = rgba(r.borderColorHex, 0.1);
            const title = minOnlyLabel(r.minPercent);
            const showImage = r.frameMode === "image" && !!r.frameImageUrl;
            const objFit = objectFitMap(r.frameObjectFit);
            const btnBg = r.borderColorHex;
            const btnText = contrastTextColor(btnBg);
            const btnBgHover = darkenHex(btnBg, 0.1);

            return (
              <div
                key={String(r.id)}
                className={cn(
                  "opacity-0 animate-fade-in rounded-xl shadow-card hover:shadow-card-hover",
                  "transition-all duration-300 hover:-translate-y-0.5",
                  "relative overflow-hidden"
                )}
                style={{ border, backgroundColor: bg, animationDelay: `${i * 80}ms` }}
              >
                <div className="p-4 pr-24">
                  {/* ปุ่มดูโปรทั้งหมด */}
                  <div className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    <Button
                      size="sm"
                      className="h-8 px-3 text-xs whitespace-nowrap border self-end"
                      style={{
                        backgroundColor: btnBg,
                        color: btnText,
                        borderColor: btnBg,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          btnBgHover;
                        (e.currentTarget as HTMLButtonElement).style.borderColor =
                          btnBgHover;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          btnBg;
                        (e.currentTarget as HTMLButtonElement).style.borderColor =
                          btnBg;
                      }}
                    >
                      ดูโปรทั้งหมด
                    </Button>
                  </div>

                  {/* หัวข้อหลัก */}
                  <div className="flex items-end justify-between gap-2 min-h-[2.4rem]">
                    <h3 className="font-bold text-base leading-[1.8] truncate">
                      {title}
                    </h3>
                  </div>
                </div>

                {/* ของตกแต่งด้านขวา */}
                {showImage ? (
                  <div
                    className="absolute inset-y-2 right-2 w-16 md:w-20 rounded-lg overflow-hidden pointer-events-none"
                    style={{ opacity: r.frameOpacity ?? 1 }}
                  >
                    <Image
                      src={r.frameImageUrl!}
                      alt="frame"
                      fill
                      className="object-contain"
                      style={{ objectFit: objFit }}
                    />
                  </div>
                ) : (
                  <div
                    className="absolute inset-y-3 right-3 w-14 md:w-16 rounded-lg pointer-events-none"
                    style={{
                      border: `${Math.max(1, Number(r.borderWidth))}px solid ${
                        r.borderColorHex
                      }`,
                      backgroundColor: rgba(r.borderColorHex, 0.06),
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// v.1.1.3 =======================================================

// v.1.1.2 =======================================================
// // src/components/discount-rule-strip.server.tsx

// // import Image from "next/image";
// // import { Button } from "@/components/ui/button";
// import { absoluteUrl } from "@/lib/base-url";

// /* ========= Types ========= */
// type Rule = {
//   id: string | number;
//   minPercent?: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   frameMode?: "image" | "draw";
//   frameImageUrl?: string;
//   frameInsetPx?: number;
//   frameOpacity?: number;
//   frameObjectFit?: "contain" | "cover" | "stretch";
//   enabled?: boolean;
//   order?: number;
// };

// export type DiscountRuleItem = {
//   id: string | number;
//   title: string;
//   borderCss: string;
//   cardBg: string;
//   decoType: "image" | "draw";
//   decoImageUrl?: string;
//   decoImageOpacity?: number;
//   decoObjectFit?: "contain" | "cover" | "fill";
//   decoBorderCss?: string;
//   buttonBg: string;
//   buttonBgHover: string;
//   buttonText: string;

//   // ➕ ส่งช่วงเปอร์เซ็นต์ลดไปที่ client
//   minPercent?: number;
//   maxPercent?: number;
// };

// /* ========= Utils ========= */
// const hexToRgb = (hex: string) => {
//   const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
//   return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
// };
// const rgba = (hex: string, a = 0.1) => {
//   const rgb = hexToRgb(hex);
//   return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})` : `rgba(0,0,0,${a})`;
// };
// const lum = (hex: string) => {
//   const c = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
//   const t = [c.r, c.g, c.b].map((v) => {
//     const x = v / 255;
//     return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
//   });
//   return 0.2126 * t[0] + 0.7152 * t[1] + 0.0722 * t[2];
// };
// const textOn = (hex: string) => (lum(hex) > 0.5 ? "#111827" : "#ffffff");
// const darken = (hex: string, amt = 0.08) => {
//   const rgb = hexToRgb(hex);
//   if (!rgb) return hex;
//   const d = (v: number) => Math.max(0, Math.min(255, Math.round(v * (1 - amt))));
//   return `#${[d(rgb.r), d(rgb.g), d(rgb.b)]
//     .map((n) => n.toString(16).padStart(2, "0"))
//     .join("")}`;
// };
// const objectFit = (fit?: string): "contain" | "cover" | "fill" =>
//   fit === "cover" ? "cover" : fit === "stretch" ? "fill" : "contain";

// const toTitle = (min?: number) => `ลดตั้งแต่ ${typeof min === "number" ? min : 0}% ขึ้นไป`;

// /* ========= Server Component ========= */
// export default async function DiscountRuleStripServer() {
//   const url = await absoluteUrl("/api/mock/discount-rules");
//   const res = await fetch(url, { cache: "no-store" });
//   if (!res.ok) return null;
//   const json = (await res.json()) as { items?: Rule[] };

//   const rules: Rule[] = (json.items ?? [])
//     .filter((r: Rule) => r && (r.enabled ?? true))
//     .map((r: Rule): Rule => ({
//       ...r,
//       borderWidth: Number(r.borderWidth) || 2,
//       borderColorHex: r.borderColorHex || "#2563eb",
//       frameOpacity:
//         typeof r.frameOpacity === "number" ? Math.max(0, Math.min(1, r.frameOpacity)) : undefined,
//     }))
//     .sort((a: Rule, b: Rule) => (a.order ?? 0) - (b.order ?? 0));

//   if (!rules.length) return null;

//   const display: DiscountRuleItem[] = rules.slice(0, 4).map((r: Rule) => {
//     const borderCss = `${Math.max(1, r.borderWidth)}px solid ${r.borderColorHex}`;
//     const cardBg = rgba(r.borderColorHex, 0.1);
//     const buttonBg = r.borderColorHex;

//     return {
//       id: r.id,
//       title: toTitle(r.minPercent),
//       borderCss,
//       cardBg,
//       decoType: r.frameMode === "image" && r.frameImageUrl ? "image" : "draw",
//       decoImageUrl: r.frameImageUrl || undefined,
//       decoImageOpacity:
//         typeof r.frameOpacity === "number" ? Math.max(0, Math.min(1, r.frameOpacity)) : 1,
//       decoObjectFit: objectFit(r.frameObjectFit),
//       decoBorderCss: borderCss,
//       buttonBg,
//       buttonBgHover: darken(buttonBg, 0.1),
//       buttonText: textOn(buttonBg),

//       // ➕ แนบช่วงเปอร์เซ็นต์ไปให้ client ใช้สร้างพารามิเตอร์ได้แม่นยำ
//       minPercent: r.minPercent,
//       maxPercent: r.maxPercent,
//     };
//   });

//   const { DiscountRuleStripClient } = await import("./discount-rule-strip.client");
//   return <DiscountRuleStripClient items={display} />;
// }

// v.1.1.2 =======================================================

// // src/components/discount-rule-strip.server.tsx

// // import Image from "next/image";
// // import { Button } from "@/components/ui/button";
// import { absoluteUrl } from "@/lib/base-url";

// /* ========= Types ========= */
// type Rule = {
//   id: string | number;
//   minPercent?: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   frameMode?: "image" | "draw";
//   frameImageUrl?: string;
//   frameInsetPx?: number;
//   frameOpacity?: number;
//   frameObjectFit?: "contain" | "cover" | "stretch";
//   enabled?: boolean;
//   order?: number;
// };

// export type DiscountRuleItem = {
//   id: string | number;
//   title: string;
//   borderCss: string;
//   cardBg: string;
//   decoType: "image" | "draw";
//   decoImageUrl?: string;
//   decoImageOpacity?: number;
//   decoObjectFit?: "contain" | "cover" | "fill";
//   decoBorderCss?: string;
//   buttonBg: string;
//   buttonBgHover: string;
//   buttonText: string;
// };

// /* ========= Utils ========= */
// const hexToRgb = (hex: string) => {
//   const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
//   return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
// };
// const rgba = (hex: string, a = 0.1) => {
//   const rgb = hexToRgb(hex);
//   return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})` : `rgba(0,0,0,${a})`;
// };
// const lum = (hex: string) => {
//   const c = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
//   const t = [c.r, c.g, c.b].map((v) => {
//     const x = v / 255;
//     return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
//   });
//   return 0.2126 * t[0] + 0.7152 * t[1] + 0.0722 * t[2];
// };
// const textOn = (hex: string) => (lum(hex) > 0.5 ? "#111827" : "#ffffff");
// const darken = (hex: string, amt = 0.08) => {
//   const rgb = hexToRgb(hex);
//   if (!rgb) return hex;
//   const d = (v: number) => Math.max(0, Math.min(255, Math.round(v * (1 - amt))));
//   return `#${[d(rgb.r), d(rgb.g), d(rgb.b)]
//     .map((n) => n.toString(16).padStart(2, "0"))
//     .join("")}`;
// };
// const objectFit = (fit?: string): "contain" | "cover" | "fill" =>
//   fit === "cover" ? "cover" : fit === "stretch" ? "fill" : "contain";

// const toTitle = (min?: number) => `ลดตั้งแต่ ${typeof min === "number" ? min : 0}% ขึ้นไป`;

// /* ========= Server Component ========= */
// export default async function DiscountRuleStripServer() {
//   const url = await absoluteUrl("/api/mock/discount-rules");
//   const res = await fetch(url, { cache: "no-store" });
//   if (!res.ok) return null;
//   const json = (await res.json()) as { items?: Rule[] };

//   // 👉 ใส่ชนิดให้ callback: (r: Rule), (a: Rule, b: Rule)
//   const rules: Rule[] = (json.items ?? [])
//     .filter((r: Rule) => r && (r.enabled ?? true))
//     .map((r: Rule): Rule => ({
//       ...r,
//       borderWidth: Number(r.borderWidth) || 2,
//       borderColorHex: r.borderColorHex || "#2563eb",
//       frameOpacity:
//         typeof r.frameOpacity === "number" ? Math.max(0, Math.min(1, r.frameOpacity)) : undefined,
//     }))
//     .sort((a: Rule, b: Rule) => (a.order ?? 0) - (b.order ?? 0));

//   if (!rules.length) return null;

//   const display: DiscountRuleItem[] = rules.slice(0, 4).map((r: Rule) => {
//     const borderCss = `${Math.max(1, r.borderWidth)}px solid ${r.borderColorHex}`;
//     const cardBg = rgba(r.borderColorHex, 0.1);
//     const buttonBg = r.borderColorHex;
//     return {
//       id: r.id,
//       title: toTitle(r.minPercent),
//       borderCss,
//       cardBg,
//       decoType: r.frameMode === "image" && r.frameImageUrl ? "image" : "draw",
//       decoImageUrl: r.frameImageUrl || undefined,
//       decoImageOpacity:
//         typeof r.frameOpacity === "number" ? Math.max(0, Math.min(1, r.frameOpacity)) : 1,
//       decoObjectFit: objectFit(r.frameObjectFit),
//       decoBorderCss: borderCss,
//       buttonBg,
//       buttonBgHover: darken(buttonBg, 0.1),
//       buttonText: textOn(buttonBg),
//     };
//   });

//   const { DiscountRuleStripClient } = await import("./discount-rule-strip.client");
//   return <DiscountRuleStripClient items={display} />;
// }

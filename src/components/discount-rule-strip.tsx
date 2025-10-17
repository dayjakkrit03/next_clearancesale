// v.1.1.4 ==================================================
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
  const s = [rgb.r, rgb.g, rgb.b].map(v => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
};
const contrastTextColor = (hex: string) => (relativeLuminance(hex) > 0.5 ? "#111827" : "#ffffff");
const darkenHex = (hex: string, amt = 0.08) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const d = (v: number) => Math.max(0, Math.min(255, Math.round(v * (1 - amt))));
  return `#${[d(rgb.r), d(rgb.g), d(rgb.b)].map(n => n.toString(16).padStart(2, "0")).join("")}`;
};
const minOnlyLabel = (minP?: number) => `ลดตั้งแต่ ${typeof minP === "number" ? minP : 0}% ขึ้นไป`;
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
          .filter(r => r && (r.enabled ?? true))
          .map(r => ({
            ...r,
            borderWidth: Number(r.borderWidth) || 2,
            borderColorHex: r.borderColorHex || "#2563eb",
            frameOpacity: typeof r.frameOpacity === "number" ? clamp01(Number(r.frameOpacity)) : undefined,
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

  const displayRules = useMemo(() => rules.slice(0, 4), [rules]);
  const gridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

  if (loading) {
    return (
      <div className="bg-gradient-subtle py-6">
        <div className="container mx-auto px-4">
          <div className={gridClass}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl animate-pulse bg-muted/60 border border-border" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (!rules.length) return null;

  return (
    <div className="bg-gradient-subtle py-6">
      <div className="container mx-auto px-4">
        <div className={gridClass}>
          {displayRules.map((r, i) => {
            const border = `${Math.max(1, Number(r.borderWidth))}px solid ${r.borderColorHex}`;
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
                  {/* หัวข้อเล็ก */}
                  <div className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    DISCOUNT STYLING RULE
                  </div>

                  {/* แถวหัวข้อหลัก + ปุ่ม */}
                  <div className="flex items-end justify-between gap-2 min-h-[2.4rem]">
                    {/* ► line-height สูงขึ้น + ไม่ให้ตัดวรรณยุกต์ */}
                    <h3 className="font-bold text-base leading-[1.8] truncate">
                      {title}
                    </h3>

                    <Button
                      size="sm"
                      className="h-8 px-3 text-xs whitespace-nowrap border self-end"
                      style={{ backgroundColor: btnBg, color: btnText, borderColor: btnBg }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = btnBgHover;
                        (e.currentTarget as HTMLButtonElement).style.borderColor = btnBgHover;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = btnBg;
                        (e.currentTarget as HTMLButtonElement).style.borderColor = btnBg;
                      }}
                    >
                      ดูโปรทั้งหมด
                    </Button>
                  </div>
                </div>

                {/* ของตกแต่งด้านขวา */}
                {showImage ? (
                  <div
                    className="absolute inset-y-2 right-2 w-16 md:w-20 rounded-lg overflow-hidden pointer-events-none"
                    style={{ opacity: r.frameOpacity ?? 1 }}
                  >
                    
                    <Image src={r.frameImageUrl!} alt="frame" fill className="object-contain" style={{ objectFit: objFit }} />
                  </div>
                ) : (
                  <div
                    className="absolute inset-y-3 right-3 w-14 md:w-16 rounded-lg pointer-events-none"
                    style={{
                      border: `${Math.max(1, Number(r.borderWidth))}px solid ${r.borderColorHex}`,
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


// v.1.1.4 ==================================================

// v.1.1.3 ==================================================
// // src/components/discount-rule-strip.tsx

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Image from "next/image";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";

// /* ================= Types ================= */
// type DiscountRule = {
//   id: string | number;
//   minPercent?: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   frameMode?: "image" | "draw";
//   frameImageUrl?: string;
//   frameInsetPx?: number;
//   frameOpacity?: number; // 0..1
//   frameObjectFit?: "contain" | "cover" | "stretch";
//   enabled?: boolean;
//   order?: number;
// };

// type ApiPayload = { items?: DiscountRule[] };

// /* ================= Helpers ================= */
// const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
// const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
//   const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
//   if (!m) return null;
//   return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
// };
// const rgba = (hex: string, alpha = 0.12) => {
//   const rgb = hexToRgb(hex);
//   if (!rgb) return `rgba(0,0,0,${alpha})`;
//   return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
// };

// // ► ต้องการให้ทุกการ์ดเขียนว่า "ลดตั้งแต่ X% ขึ้นไป" เสมอ
// const minOnlyLabel = (minP?: number) => {
//   const m = typeof minP === "number" ? minP : 0;
//   return `ลดตั้งแต่ ${m}% ขึ้นไป`;
// };

// const objectFitMap = (fit?: string): "cover" | "contain" | "fill" => {
//   if (fit === "cover") return "cover";
//   if (fit === "stretch") return "fill";
//   return "contain";
// };

// /* ================= Component ================= */
// export default function DiscountRuleStrip() {
//   const [rules, setRules] = useState<DiscountRule[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         const res = await fetch("/api/mock/discount-rules", { cache: "no-store" });
//         if (!res.ok) throw new Error("fetch rules failed");
//         const data: ApiPayload = await res.json();
//         if (!alive) return;
//         const normalized = (data.items ?? [])
//           .filter((r) => r && (r.enabled ?? true))
//           .map((r) => ({
//             ...r,
//             borderWidth: Number(r.borderWidth) || 2,
//             borderColorHex: r.borderColorHex || "#2563eb",
//             frameOpacity:
//               typeof r.frameOpacity === "number" ? clamp01(Number(r.frameOpacity)) : undefined,
//           }))
//           .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
//         setRules(normalized);
//       } catch {
//         setRules([]);
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, []);

//   const hasRules = rules.length > 0;

//   // แสดง 4 ใบแรกให้พอดีกับ Hero
//   const displayRules = useMemo(() => rules.slice(0, 4), [rules]);

//   const gridClass =
//     "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

//   if (loading) {
//     return (
//       <div className="bg-gradient-subtle py-6">
//         <div className="container mx-auto px-4">
//           <div className={gridClass}>
//             {Array.from({ length: 4 }).map((_, i) => (
//               <div
//                 key={i}
//                 className="h-24 rounded-xl animate-pulse bg-muted/60 border border-border"
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!hasRules) return null;

//   return (
//     <div className="bg-gradient-subtle py-6">
//       <div className="container mx-auto px-4">
//         <div className={gridClass}>
//           {displayRules.map((r, i) => {
//             const border = `${Math.max(1, Number(r.borderWidth))}px solid ${r.borderColorHex}`;
//             const bg = rgba(r.borderColorHex, 0.1);
//             const title = minOnlyLabel(r.minPercent);
//             const showImage = r.frameMode === "image" && !!r.frameImageUrl;
//             const objFit = objectFitMap(r.frameObjectFit);

//             return (
//               <div
//                 key={String(r.id)}
//                 className={cn(
//                   "opacity-0 animate-fade-in rounded-xl shadow-card hover:shadow-card-hover",
//                   "transition-all duration-300 hover:-translate-y-0.5",
//                   "relative overflow-hidden"
//                 )}
//                 style={{ border, backgroundColor: bg, animationDelay: `${i * 80}ms` }}
//               >
//                 <div className="p-4 pr-24">
//                   {/* บรรทัดหัวข้อเล็ก (กลับมาแล้ว) */}
//                   <div className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground mb-1">
//                     DISCOUNT STYLING RULE
//                   </div>

//                   {/* แถวหัวข้อหลัก + ปุ่ม */}
//                   <div className="flex items-center justify-between gap-2">
//                     <h3 className="font-bold text-base leading-snug truncate">
//                       {title}
//                     </h3>
//                     <Button
//                       size="sm"
//                       variant="secondary"
//                       className="h-8 px-3 text-xs whitespace-nowrap"
//                     >
//                       ดูโปรทั้งหมด
//                     </Button>
//                   </div>
//                 </div>

//                 {/* ของตกแต่งด้านขวา */}
//                 {showImage ? (
//                   <div
//                     className="absolute inset-y-2 right-2 w-16 md:w-20 rounded-lg overflow-hidden pointer-events-none"
//                     style={{ opacity: r.frameOpacity ?? 1 }}
//                   >
                    
//                     <Image
//                       src={r.frameImageUrl!}
//                       alt="frame"
//                       fill
//                       className="object-contain"
//                       style={{ objectFit: objFit }}
//                     />
//                   </div>
//                 ) : (
//                   <div
//                     className="absolute inset-y-3 right-3 w-14 md:w-16 rounded-lg pointer-events-none"
//                     style={{
//                       border: `${Math.max(1, Number(r.borderWidth))}px solid ${r.borderColorHex}`,
//                       backgroundColor: rgba(r.borderColorHex, 0.06),
//                     }}
//                   />
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.3 ==================================================

// v.1.1.2 ==================================================
// // src/components/discount-rule-strip.tsx

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Image from "next/image";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";

// /* ================= Types ================= */
// type DiscountRule = {
//   id: string | number;
//   minPercent?: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   frameMode?: "image" | "draw";
//   frameImageUrl?: string;
//   frameInsetPx?: number;
//   frameOpacity?: number; // 0..1
//   frameObjectFit?: "contain" | "cover" | "stretch";
//   enabled?: boolean;
//   order?: number;
// };

// type ApiPayload = { items?: DiscountRule[] };

// /* ================= Helpers ================= */
// const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
// const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
//   const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
//   if (!m) return null;
//   return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
// };
// const rgba = (hex: string, alpha = 0.12) => {
//   const rgb = hexToRgb(hex);
//   if (!rgb) return `rgba(0,0,0,${alpha})`;
//   return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
// };
// const percentLabel = (minP?: number, maxP?: number) => {
//   const hasMin = typeof minP === "number";
//   const hasMax = typeof maxP === "number";
//   if (hasMin && hasMax) return `ลด ${minP}% – ${maxP}%`;
//   if (hasMin && !hasMax) return `ลดตั้งแต่ ${minP}% ขึ้นไป`;
//   if (!hasMin && hasMax) return `ลดไม่เกิน ${maxP}%`;
//   return "ดีลส่วนลด";
// };
// const objectFitMap = (fit?: string): "cover" | "contain" | "fill" => {
//   if (fit === "cover") return "cover";
//   if (fit === "stretch") return "fill";
//   return "contain";
// };

// /* ================= Component ================= */
// export default function DiscountRuleStrip() {
//   const [rules, setRules] = useState<DiscountRule[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         const res = await fetch("/api/mock/discount-rules", { cache: "no-store" });
//         if (!res.ok) throw new Error("fetch rules failed");
//         const data: ApiPayload = await res.json();
//         if (!alive) return;
//         const normalized = (data.items ?? [])
//           .filter((r) => r && (r.enabled ?? true))
//           .map((r) => ({
//             ...r,
//             borderWidth: Number(r.borderWidth) || 2,
//             borderColorHex: r.borderColorHex || "#2563eb",
//             frameOpacity:
//               typeof r.frameOpacity === "number" ? clamp01(Number(r.frameOpacity)) : undefined,
//           }))
//           .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
//         setRules(normalized);
//       } catch {
//         setRules([]);
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, []);

//   const hasRules = rules.length > 0;

//   // แสดง 4 ใบแรก (ขนาดกำลังดีใต้ Hero)
//   const displayRules = useMemo(() => rules.slice(0, 4), [rules]);

//   const gridClass =
//     "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

//   if (loading) {
//     return (
//       <div className="bg-gradient-subtle py-6">
//         <div className="container mx-auto px-4">
//           <div className={gridClass}>
//             {Array.from({ length: 4 }).map((_, i) => (
//               <div
//                 key={i}
//                 className="h-24 rounded-xl animate-pulse bg-muted/60 border border-border"
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!hasRules) return null;

//   return (
//     <div className="bg-gradient-subtle py-6">
//       <div className="container mx-auto px-4">
//         <div className={gridClass}>
//           {displayRules.map((r, i) => {
//             const border = `${Math.max(1, Number(r.borderWidth))}px solid ${r.borderColorHex}`;
//             const bg = rgba(r.borderColorHex, 0.10);
//             const title = percentLabel(r.minPercent, r.maxPercent);
//             const showImage = r.frameMode === "image" && !!r.frameImageUrl;
//             const objFit = objectFitMap(r.frameObjectFit);

//             return (
//               <div
//                 key={String(r.id)}
//                 className={cn(
//                   // motion: fade-in + hover float
//                   "opacity-0 animate-fade-in rounded-xl shadow-card hover:shadow-card-hover",
//                   "transition-all duration-300 hover:-translate-y-0.5",
//                   "relative overflow-hidden"
//                 )}
//                 style={{ border, backgroundColor: bg, animationDelay: `${i * 80}ms` }}
//               >
//                 {/* content: กะทัดรัดขึ้น */}
//                 <div className="p-4 pr-24">
//                   {/* title + button row */}
//                   <div className="flex items-center justify-between gap-2">
//                     <h3 className="font-bold text-base leading-snug truncate">{title}</h3>
//                     <Button
//                       size="sm"
//                       variant="secondary"
//                       className="h-8 px-3 text-xs whitespace-nowrap"
//                     >
//                       ดูโปรทั้งหมด
//                     </Button>
//                   </div>

//                   {/* (เอา “Mode …” ออกตามคำขอ) */}
//                 </div>

//                 {/* right decoration / preview */}
//                 {showImage ? (
//                   <div
//                     className="absolute inset-y-2 right-2 w-16 md:w-20 rounded-lg overflow-hidden pointer-events-none"
//                     style={{ opacity: r.frameOpacity ?? 1 }}
//                   >
                    
//                     <Image
//                       src={r.frameImageUrl!}
//                       alt="frame"
//                       fill
//                       className="object-contain"
//                       style={{ objectFit: objFit }}
//                     />
//                   </div>
//                 ) : (
//                   <div
//                     className="absolute inset-y-3 right-3 w-14 md:w-16 rounded-lg pointer-events-none"
//                     style={{
//                       border: `${Math.max(1, Number(r.borderWidth))}px solid ${r.borderColorHex}`,
//                       backgroundColor: rgba(r.borderColorHex, 0.06),
//                     }}
//                   />
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.2 ==================================================

// // src/components/discount-rule-strip.tsx

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Image from "next/image";
// import { cn } from "@/lib/utils"; // ถ้ามี utils ชื่ออื่น เปลี่ยนเป็นของโปรเจกต์ได้
// import { Button } from "@/components/ui/button";

// /* ================= Types ================= */
// type DiscountRule = {
//   id: string | number;
//   minPercent?: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   frameMode?: "image" | "draw";
//   frameImageUrl?: string;
//   frameInsetPx?: number;
//   frameOpacity?: number; // 0..1
//   frameObjectFit?: "contain" | "cover" | "stretch";
//   enabled?: boolean;
//   order?: number;
// };

// type ApiPayload = {
//   items?: DiscountRule[];
// };

// /* ================= Helpers ================= */
// const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
// const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
//   const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
//   if (!m) return null;
//   return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
// };
// const rgba = (hex: string, alpha = 0.1) => {
//   const rgb = hexToRgb(hex);
//   if (!rgb) return `rgba(0,0,0,${alpha})`;
//   return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
// };
// const percentLabel = (minP?: number, maxP?: number) => {
//   const hasMin = typeof minP === "number";
//   const hasMax = typeof maxP === "number";
//   if (hasMin && hasMax) return `ลด ${minP}% – ${maxP}%`;
//   if (hasMin && !hasMax) return `ลดตั้งแต่ ${minP}% ขึ้นไป`;
//   if (!hasMin && hasMax) return `ลดไม่เกิน ${maxP}%`;
//   return "ดีลส่วนลด";
// };
// const objectFitMap = (fit?: string): "cover" | "contain" | "fill" => {
//   if (fit === "cover") return "cover";
//   if (fit === "stretch") return "fill";
//   return "contain";
// };

// /* ================= Component ================= */
// export default function DiscountRuleStrip() {
//   const [rules, setRules] = useState<DiscountRule[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         const res = await fetch("/api/mock/discount-rules", { cache: "no-store" });
//         if (!res.ok) throw new Error("fetch rules failed");
//         const data: ApiPayload = await res.json();
//         if (!alive) return;
//         const normalized = (data.items ?? [])
//           .filter((r) => r && (r.enabled ?? true))
//           .map((r) => ({
//             ...r,
//             borderWidth: Number(r.borderWidth) || 2,
//             borderColorHex: r.borderColorHex || "#2563eb",
//             frameOpacity:
//               typeof r.frameOpacity === "number" ? clamp01(Number(r.frameOpacity)) : undefined,
//           }))
//           .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
//         setRules(normalized);
//       } catch {
//         setRules([]);
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, []);

//   const hasRules = rules.length > 0;

//   const gridClass = useMemo(
//     () =>
//       "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
//     []
//   );

//   if (loading) {
//     return (
//       <div className="bg-gradient-subtle py-8">
//         <div className="container mx-auto px-4">
//           <div className={gridClass}>
//             {Array.from({ length: 3 }).map((_, i) => (
//               <div
//                 key={i}
//                 className="h-28 rounded-xl animate-pulse bg-muted/60 border border-border"
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Fallback: ถ้าไม่มี rule ใดเปิดใช้งาน ให้ไม่แสดง strip นี้ (หรือจะใส่การ์ดเดิมก็ได้)
//   if (!hasRules) {
//     return null;
//   }

//   return (
//     <div className="bg-gradient-subtle py-8">
//       <div className="container mx-auto px-4">
//         <div className={gridClass}>
//           {rules.map((r) => {
//             const border = `${Math.max(1, Number(r.borderWidth))}px solid ${r.borderColorHex}`;
//             const bg = rgba(r.borderColorHex, 0.1);
//             const title = percentLabel(r.minPercent, r.maxPercent);

//             const showImage = r.frameMode === "image" && !!r.frameImageUrl;
//             const objFit = objectFitMap(r.frameObjectFit);

//             return (
//               <div
//                 key={String(r.id)}
//                 className={cn(
//                   "relative overflow-hidden rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02] group"
//                 )}
//                 style={{ border, backgroundColor: bg }}
//               >
//                 <div className="p-5 pr-28">
//                   <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
//                     Discount styling rule
//                   </div>
//                   <h3 className="font-bold text-lg leading-snug">{title}</h3>
//                   <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
//                     <span>Mode: {r.frameMode === "image" ? "IMAGE" : "DRAW"}</span>
//                     <span>•</span>
//                     <span>Border {r.borderWidth}px</span>
//                   </div>

//                   <div className="mt-4">
//                     <Button size="sm" variant="secondary" className="group-hover:translate-x-0.5 transition-transform">
//                       ดูโปรทั้งหมด
//                     </Button>
//                   </div>
//                 </div>

//                 {/* Preview decoration (right side) */}
//                 {showImage ? (
//                   <div
//                     className="absolute inset-y-2 right-2 w-24 rounded-lg overflow-hidden"
//                     style={{ opacity: r.frameOpacity ?? 1 }}
//                   >
                    
//                     <Image
//                       src={r.frameImageUrl!}
//                       alt="frame"
//                       fill
//                       className="object-contain"
//                       style={{ objectFit: objFit }}
//                     />
//                   </div>
//                 ) : (
//                   <div
//                     className="absolute inset-y-4 right-4 w-20 rounded-xl"
//                     style={{
//                       border: `${Math.max(1, Number(r.borderWidth))}px solid ${r.borderColorHex}`,
//                       backgroundColor: rgba(r.borderColorHex, 0.05),
//                     }}
//                   />
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

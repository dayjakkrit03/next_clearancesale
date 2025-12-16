// v.1.1.3 ======================================================
// src/components/discount-rule-strip.client.tsx

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * type ฝั่ง client (ไม่ต้อง import จาก server)
 * ใส่เฉพาะ field ที่ไฟล์นี้ใช้จริง ๆ และให้เป็น optional ไว้ก่อน
 */
type DiscountRuleItem = {
  id: string | number;
  title?: string;

  minPercent?: number;
  maxPercent?: number;

  borderCss?: string;
  cardBg?: string;

  buttonBg?: string;
  buttonBgHover?: string;
  buttonText?: string;

  decoType?: "image" | "draw";
  decoImageUrl?: string;
  decoImageOpacity?: number;
  decoObjectFit?: "contain" | "cover" | "fill";
  decoBorderCss?: string;
};

/**
 * ดึงช่วงส่วนลดจาก item
 * - ใช้ it.minPercent / it.maxPercent ถ้ามี (ฝั่ง server ควรส่งมา)
 * - ถ้าไม่มี ให้พยายามอ่านตัวเลขจาก it.title (fallback)
 */
function getRangeFromItem(
  it: DiscountRuleItem & { minPercent?: number; maxPercent?: number }
): { min?: number; max?: number } {
  if (typeof it.minPercent === "number" || typeof it.maxPercent === "number") {
    return { min: it.minPercent, max: it.maxPercent };
  }
  // fallback: ดึงเลขแรกจาก title เช่น "ลดตั้งแต่ 70% ขึ้นไป"
  const m = it.title?.match(/(\d+)\s*%/);
  const min = m ? Number(m[1]) : undefined;
  return { min, max: undefined };
}

export function DiscountRuleStripClient({ items }: { items: DiscountRuleItem[] }) {
  const router = useRouter();
  if (!items?.length) return null;

  const gotoProducts = (it: DiscountRuleItem, newTab = false) => {
    const { min, max } = getRangeFromItem(it as any);
    const url = new URL("/products", window.location.origin);

    if (typeof min === "number") url.searchParams.set("discountMin", String(min));
    if (typeof max === "number") url.searchParams.set("discountMax", String(max));

    const href = url.pathname + "?" + url.searchParams.toString();
    if (newTab) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      router.push(href);
    }
  };

  return (
    <div className="bg-gradient-subtle py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((it, i) => (
            <div
              key={String(it.id)}
              role="button"
              tabIndex={0}
              onClick={(e) => gotoProducts(it, (e as any).ctrlKey || (e as any).metaKey)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") gotoProducts(it);
              }}
              className="opacity-0 animate-fade-in rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden cursor-pointer"
              style={{
                border: it.borderCss,
                backgroundColor: it.cardBg,
                animationDelay: `${i * 80}ms`,
              }}
            >
              <div className="p-4 pr-24">
                <div className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs whitespace-nowrap border self-end transition-colors"
                    style={{
                      backgroundColor: it.buttonBg,
                      color: it.buttonText,
                      borderColor: it.buttonBg,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        it.buttonBgHover || it.buttonBg || "";
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        it.buttonBgHover || it.buttonBg || "";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        it.buttonBg || "";
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        it.buttonBg || "";
                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // ไม่ให้ยิง event ของการ์ด
                      gotoProducts(it, e.ctrlKey || e.metaKey);
                    }}
                  >
                    ดูโปรทั้งหมด
                  </Button>
                </div>

                <div className="flex items-end justify-between gap-2 min-h-[2.4rem]">
                  <h3 className="font-bold text-base leading-[1.6] truncate">
                    {it.title}
                  </h3>
                </div>
              </div>

              {it.decoType === "image" ? (
                <div
                  className="absolute inset-y-2 right-2 w-16 md:w-20 rounded-lg overflow-hidden pointer-events-none"
                  style={{ opacity: it.decoImageOpacity ?? 1 }}
                >
                  <Image
                    src={it.decoImageUrl!}
                    alt="frame"
                    fill
                    className="object-contain"
                    style={{ objectFit: it.decoObjectFit ?? "contain" }}
                  />
                </div>
              ) : (
                <div
                  className="absolute inset-y-3 right-3 w-14 md:w-16 rounded-lg pointer-events-none"
                  style={{
                    border: it.decoBorderCss,
                    backgroundColor: "transparent",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// v.1.1.3 ======================================================

// v.1.1.2 ======================================================
// // src/components/discount-rule-strip.client.tsx

// "use client";

// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import type { DiscountRuleItem } from "./discount-rule-strip.server";

// /**
//  * ดึงช่วงส่วนลดจาก item
//  * - ใช้ it.minPercent / it.maxPercent ถ้ามี (ฝั่ง server ควรส่งมา)
//  * - ถ้าไม่มี ให้พยายามอ่านตัวเลขจาก it.title (fallback)
//  */
// function getRangeFromItem(
//   it: DiscountRuleItem & { minPercent?: number; maxPercent?: number }
// ): { min?: number; max?: number } {
//   if (typeof it.minPercent === "number" || typeof it.maxPercent === "number") {
//     return { min: it.minPercent, max: it.maxPercent };
//   }
//   // fallback: ดึงเลขแรกจาก title เช่น "ลดตั้งแต่ 70% ขึ้นไป"
//   const m = it.title?.match(/(\d+)\s*%/);
//   const min = m ? Number(m[1]) : undefined;
//   return { min, max: undefined };
// }

// export function DiscountRuleStripClient({ items }: { items: DiscountRuleItem[] }) {
//   const router = useRouter();
//   if (!items?.length) return null;

//   const gotoProducts = (it: DiscountRuleItem, newTab = false) => {
//     const { min, max } = getRangeFromItem(it as any);
//     const url = new URL("/products", window.location.origin);
//     if (typeof min === "number") url.searchParams.set("discountMin", String(min));
//     if (typeof max === "number") url.searchParams.set("discountMax", String(max));

//     const href = url.pathname + "?" + url.searchParams.toString();
//     if (newTab) {
//       window.open(href, "_blank", "noopener,noreferrer");
//     } else {
//       router.push(href);
//     }
//   };

//   return (
//     <div className="bg-gradient-subtle py-6">
//       <div className="container mx-auto px-4">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//           {items.map((it, i) => (
//             <div
//               key={String(it.id)}
//               role="button"
//               tabIndex={0}
//               onClick={(e) => gotoProducts(it, e.ctrlKey || e.metaKey)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" || e.key === " ") gotoProducts(it);
//               }}
//               className="opacity-0 animate-fade-in rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden cursor-pointer"
//               style={{ border: it.borderCss, backgroundColor: it.cardBg, animationDelay: `${i * 80}ms` }}
//             >
//               <div className="p-4 pr-24">
//                 <div className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground mb-1">
//                   <Button
//                     size="sm"
//                     className="h-8 px-3 text-xs whitespace-nowrap border self-end transition-colors"
//                     style={{ backgroundColor: it.buttonBg, color: it.buttonText, borderColor: it.buttonBg }}
//                     onMouseEnter={(e) => {
//                       (e.currentTarget as HTMLButtonElement).style.backgroundColor = it.buttonBgHover;
//                       (e.currentTarget as HTMLButtonElement).style.borderColor = it.buttonBgHover;
//                     }}
//                     onMouseLeave={(e) => {
//                       (e.currentTarget as HTMLButtonElement).style.backgroundColor = it.buttonBg;
//                       (e.currentTarget as HTMLButtonElement).style.borderColor = it.buttonBg;
//                     }}
//                     onClick={(e) => {
//                       e.stopPropagation(); // ไม่ให้ยิง event ของการ์ด
//                       gotoProducts(it, e.ctrlKey || e.metaKey);
//                     }}
//                   >
//                     ดูโปรทั้งหมด
//                   </Button>
//                 </div>

//                 <div className="flex items-end justify-between gap-2 min-h-[2.4rem]">
//                   <h3 className="font-bold text-base leading-[1.6] truncate">{it.title}</h3>
//                 </div>
//               </div>

//               {it.decoType === "image" ? (
//                 <div
//                   className="absolute inset-y-2 right-2 w-16 md:w-20 rounded-lg overflow-hidden pointer-events-none"
//                   style={{ opacity: it.decoImageOpacity }}
//                 >
//                   <Image
//                     src={it.decoImageUrl!}
//                     alt="frame"
//                     fill
//                     className="object-contain"
//                     style={{ objectFit: it.decoObjectFit }}
//                   />
//                 </div>
//               ) : (
//                 <div
//                   className="absolute inset-y-3 right-3 w-14 md:w-16 rounded-lg pointer-events-none"
//                   style={{
//                     border: it.decoBorderCss,
//                     backgroundColor: "transparent",
//                   }}
//                 />
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.2 ======================================================

// // src/components/discount-rule-strip.client.tsx

// "use client";

// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import type { DiscountRuleItem } from "./discount-rule-strip.server";

// export function DiscountRuleStripClient({ items }: { items: DiscountRuleItem[] }) {
//   if (!items?.length) return null;

//   return (
//     <div className="bg-gradient-subtle py-6">
//       <div className="container mx-auto px-4">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//           {items.map((it, i) => (
//             <div
//               key={String(it.id)}
//               className="opacity-0 animate-fade-in rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
//               style={{ border: it.borderCss, backgroundColor: it.cardBg, animationDelay: `${i * 80}ms` }}
//             >
//               <div className="p-4 pr-24">
//                 <div className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground mb-1">
//                   {/* DISCOUNT STYLING RULE */}
//                   <Button
//                     size="sm"
//                     className="h-8 px-3 text-xs whitespace-nowrap border self-end transition-colors"
//                     style={{ backgroundColor: it.buttonBg, color: it.buttonText, borderColor: it.buttonBg }}
//                     onMouseEnter={(e) => {
//                       (e.currentTarget as HTMLButtonElement).style.backgroundColor = it.buttonBgHover;
//                       (e.currentTarget as HTMLButtonElement).style.borderColor = it.buttonBgHover;
//                     }}
//                     onMouseLeave={(e) => {
//                       (e.currentTarget as HTMLButtonElement).style.backgroundColor = it.buttonBg;
//                       (e.currentTarget as HTMLButtonElement).style.borderColor = it.buttonBg;
//                     }}
//                   >
//                     ดูโปรทั้งหมด
//                   </Button>
//                 </div>

//                 <div className="flex items-end justify-between gap-2 min-h-[2.4rem]">
//                   <h3 className="font-bold text-base leading-[1.6] truncate">{it.title}</h3>

                  
//                 </div>
//               </div>

//               {it.decoType === "image" ? (
//                 <div
//                   className="absolute inset-y-2 right-2 w-16 md:w-20 rounded-lg overflow-hidden pointer-events-none"
//                   style={{ opacity: it.decoImageOpacity }}
//                 >
                  
//                   <Image
//                     src={it.decoImageUrl!}
//                     alt="frame"
//                     fill
//                     className="object-contain"
//                     style={{ objectFit: it.decoObjectFit }}
//                   />
//                 </div>
//               ) : (
//                 <div
//                   className="absolute inset-y-3 right-3 w-14 md:w-16 rounded-lg pointer-events-none"
//                   style={{
//                     border: it.decoBorderCss,
//                     backgroundColor: "transparent",
//                   }}
//                 />
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

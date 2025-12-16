// v.1.1.4 =====================================================================
// src/app/product/[id]/component/ProductDetailsPanel.tsx

"use client";

import { useEffect, useState } from "react";
import { Star, Truck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { UIProduct, CardPartsVisibility } from "@/app/api/mock/products/_store";

interface DetailsPanelProps {
  product: UIProduct;
  visibleParts: CardPartsVisibility;
}

// ===== Helper: แปลงวันที่ให้เป็น “16 พ.ย.” =====
function formatThaiDate(date: Date) {
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });
}

// จากจำนวนวัน → ช่วงวันที่ (วันนี้ + minDays ~ maxDays)
function buildDateRangeFromDays(minDays: number, maxDays: number) {
  const today = new Date();

  const start = new Date(today);
  start.setDate(start.getDate() + minDays);

  const end = new Date(today);
  end.setDate(end.getDate() + maxDays);

  const startStr = formatThaiDate(start);
  const endStr = formatThaiDate(end);

  // ถ้าเป็นวันเดียวกันก็แสดงวันเดียว
  if (startStr === endStr) {
    return startStr;
  }
  return `${startStr} - ${endStr}`;
}

// fallback ถ้า API มีปัญหา → 3–7 วัน
function getFallbackDateRange() {
  const MIN = 3;
  const MAX = 7;
  return buildDateRangeFromDays(MIN, MAX);
}

export function ProductDetailsPanel({
  product,
  visibleParts,
}: DetailsPanelProps) {
  const [shippingText, setShippingText] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadLeadTime() {
      const fallbackRange = getFallbackDateRange();
      const fallbackText = `จะได้รับภายใน ${fallbackRange}, ค่าจัดส่ง ฿0`;

      if (!product.sku) {
        if (active) setShippingText(fallbackText);
        return;
      }

      const params = new URLSearchParams({
        sku: String(product.sku),
        uom: product.uom ?? "M.",
        stock: "1", // ตอนนี้ใช้ค่าคร่าว ๆ ไปก่อน
      });

      try {
        const res = await fetch(`/api/legacy/lead-time?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (!active) return;

        if (res.ok && (data?.minDays != null || data?.leadDays != null)) {
          const minDays =
            typeof data.minDays === "number"
              ? data.minDays
              : typeof data.leadDays === "number"
                ? data.leadDays
                : 3;
          const maxDays =
            typeof data.maxDays === "number"
              ? data.maxDays
              : typeof data.leadDays === "number"
                ? data.leadDays
                : 7;

          const rangeText = buildDateRangeFromDays(minDays, maxDays);
          setShippingText(`จะได้รับภายใน ${rangeText}, ค่าจัดส่ง ฿0`);
        } else {
          setShippingText(fallbackText);
        }
      } catch (err) {
        console.error("lead-time error", err);
        if (active) setShippingText(fallbackText);
      }
    }

    loadLeadTime();

    return () => {
      active = false;
    };
  }, [product.sku, product.uom]);

  return (
    <div className="space-y-4">
      {/* ชื่อสินค้า */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 break-words">
          {product.name}
        </h1>

        <p className="text-muted-foreground text-sm md:text-base break-words">
          {visibleParts.brandName !== false && (
            <>Brand: {product.brand || "-"} </>
          )}
          {visibleParts.sku !== false && (
            <>| Model (SKU): {product.sku || "-"} </>
          )}
          {visibleParts.uom !== false && (
            <>| หน่วยสินค้า: {product.uom || "BX."}</>
          )}
        </p>
      </div>

      {/* คะแนนรีวิว */}
      {visibleParts.ratingReview !== false && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(product.rating ?? 0)
                    ? "text-warning fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-lg font-medium">
              {(product.rating ?? 0).toFixed(1)}
            </span>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <span className="text-muted-foreground">
            {product.reviews ?? 0} รีวิว
          </span>
        </div>
      )}

      {/* การจัดส่ง */}
      <div className="flex flex-wrap items-start gap-2">
        <span className="text-muted-foreground font-medium text-sm md:text-base">
          การจัดส่ง:
        </span>

        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-success flex-shrink-0" />

          <span className="text-sm break-words">
            {shippingText ??
              // ระหว่างรอโหลด API แป๊บแรก → ใช้ fallback 3–7 วัน
              `จะได้รับภายใน ${getFallbackDateRange()}, ค่าจัดส่ง ฿0`}
          </span>
        </div>
      </div>
    </div>
  );
}

// v.1.1.4 =====================================================================

// v.1.1.3 =====================================================================
// // src/app/product/[id]/component/ProductDetailsPanel.tsx

// "use client";

// import { useEffect, useState } from "react";
// import { Star, Truck } from "lucide-react";
// import { Separator } from "@/components/ui/separator";
// import { UIProduct, CardPartsVisibility } from "@/app/api/mock/products/_store";

// interface DetailsPanelProps {
//   product: UIProduct;
//   visibleParts: CardPartsVisibility;
// }

// // ===== Helper: แปลงวันที่ให้เป็น “16 พ.ย.” =====
// function formatThaiDate(date: Date) {
//   return date.toLocaleDateString("th-TH", {
//     day: "numeric",
//     month: "short",
//   });
// }

// // ===== Helper: คำนวณช่วงวันที่จัดส่ง (fallback ถ้าเรียก API ไม่ได้) =====
// function getDeliveryRange() {
//   const today = new Date();

//   // วันเริ่มส่ง = พรุ่งนี้
//   const start = new Date(today);
//   start.setDate(start.getDate() + 1);

//   // วันสิ้นสุด = อีก 5 วัน
//   const end = new Date(today);
//   end.setDate(end.getDate() + 5);

//   return `${formatThaiDate(start)} - ${formatThaiDate(end)}`;
// }

// export function ProductDetailsPanel({
//   product,
//   visibleParts,
// }: DetailsPanelProps) {
//   const deliveryRange = getDeliveryRange(); // fallback เดิม
//   const [shippingText, setShippingText] = useState<string | null>(null);

//   // 🔁 ดึง lead time จาก API /api/legacy/lead-time
//   useEffect(() => {
//     let active = true;

//     async function loadLeadTime() {
//       // fallback ถ้าไม่มี sku
//       const fallback = `จะได้รับภายใน ${deliveryRange}, ค่าจัดส่ง ฿0`;

//       if (!product.sku) {
//         if (active) setShippingText(fallback);
//         return;
//       }

//       const params = new URLSearchParams({
//         sku: String(product.sku),
//         uom: product.uom ?? "M.",
//         stock: "1", // ตอนนี้ใช้ค่าคร่าว ๆ ไปก่อน
//       });

//       try {
//         const res = await fetch(`/api/legacy/lead-time?${params.toString()}`, {
//           cache: "no-store",
//         });
//         const data = await res.json();

//         if (!active) return;

//         if (res.ok && data?.message) {
//           // data.message จะเป็น “รอสินค้าภายใน X วัน”
//           setShippingText(`${data.message}, ค่าจัดส่ง ฿0`);
//         } else {
//           setShippingText(fallback);
//         }
//       } catch (err) {
//         console.error("lead-time error", err);
//         if (active) setShippingText(fallback);
//       }
//     }

//     loadLeadTime();

//     return () => {
//       active = false;
//     };
//   }, [product.sku, product.uom, deliveryRange]);

//   return (
//     <div className="space-y-4">
//       {/* ชื่อสินค้า */}
//       <div>
//         <h1 className="text-2xl md:text-3xl font-bold mb-2 break-words">
//           {product.name}
//         </h1>

//         <p className="text-muted-foreground text-sm md:text-base break-words">
//           {visibleParts.brandName !== false && (
//             <>Brand: {product.brand || "-"} </>
//           )}
//           {visibleParts.sku !== false && (
//             <>| Model (SKU): {product.sku || "-"} </>
//           )}
//           {visibleParts.uom !== false && (
//             <>| หน่วยสินค้า: {product.uom || "BX."}</>
//           )}
//         </p>
//       </div>

//       {/* คะแนนรีวิว */}
//       {visibleParts.ratingReview !== false && (
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-1">
//             {[...Array(5)].map((_, i) => (
//               <Star
//                 key={i}
//                 className={`h-5 w-5 ${
//                   i < Math.floor(product.rating ?? 0)
//                     ? "text-warning fill-current"
//                     : "text-gray-300"
//                 }`}
//               />
//             ))}
//             <span className="ml-2 text-lg font-medium">
//               {(product.rating ?? 0).toFixed(1)}
//             </span>
//           </div>
//           <Separator orientation="vertical" className="h-6" />
//           <span className="text-muted-foreground">
//             {product.reviews ?? 0} รีวิว
//           </span>
//         </div>
//       )}

//       {/* การจัดส่ง */}
//       <div className="flex flex-wrap items-start gap-2">
//         <span className="text-muted-foreground font-medium text-sm md:text-base">
//           การจัดส่ง:
//         </span>

//         <div className="flex items-center gap-2">
//           <Truck className="h-4 w-4 text-success flex-shrink-0" />

//           <span className="text-sm break-words">
//             {shippingText ??
//               // ตอนโหลดครั้งแรกยังไม่ทันได้ค่า → ใช้ช่วง date เดิมเป็น fallback
//               `จะได้รับภายใน ${deliveryRange}, ค่าจัดส่ง ฿0`}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.3 =====================================================================

// v.1.1.2 =====================================================================
// // src/app/product/[id]/component/ProductDetailsPanel.tsx

// "use client";

// import { Star, Truck } from "lucide-react";
// import { Separator } from "@/components/ui/separator";
// import { UIProduct, CardPartsVisibility } from "@/app/api/mock/products/_store";

// interface DetailsPanelProps {
//   product: UIProduct;
//   visibleParts: CardPartsVisibility;
// }

// // ===== Helper: แปลงวันที่ให้เป็น “16 พ.ย.” =====
// function formatThaiDate(date: Date) {
//   return date.toLocaleDateString("th-TH", {
//     day: "numeric",
//     month: "short",
//   });
// }

// // ===== Helper: คำนวณช่วงวันที่จัดส่ง =====
// function getDeliveryRange() {
//   const today = new Date();

//   // วันเริ่มส่ง = พรุ่งนี้
//   const start = new Date(today);
//   start.setDate(start.getDate() + 1);

//   // วันสิ้นสุด = อีก 5 วัน
//   const end = new Date(today);
//   end.setDate(end.getDate() + 5);

//   return `${formatThaiDate(start)} - ${formatThaiDate(end)}`;
// }

// export function ProductDetailsPanel({
//   product,
//   visibleParts,
// }: DetailsPanelProps) {
//   const deliveryRange = getDeliveryRange(); // ← คำนวณช่วงวันที่ส่งถึง!

//   return (
//     <div className="space-y-4">
//       {/* ชื่อสินค้า */}
//       <div>
//         <h1 className="text-2xl md:text-3xl font-bold mb-2 break-words">
//           {product.name}
//         </h1>

//         <p className="text-muted-foreground text-sm md:text-base break-words">
//           {visibleParts.brandName !== false && (
//             <>Brand: {product.brand || "-"} </>
//           )}
//           {visibleParts.sku !== false && (
//             <>| Model (SKU): {product.sku || "-"} </>
//           )}
//           {visibleParts.uom !== false && (
//             <>| หน่วยสินค้า: {product.uom || "BX."}</>
//           )}
//         </p>
//       </div>

//       {/* คะแนนรีวิว */}
//       {visibleParts.ratingReview !== false && (
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-1">
//             {[...Array(5)].map((_, i) => (
//               <Star
//                 key={i}
//                 className={`h-5 w-5 ${
//                   i < Math.floor(product.rating ?? 0)
//                     ? "text-warning fill-current"
//                     : "text-gray-300"
//                 }`}
//               />
//             ))}
//             <span className="ml-2 text-lg font-medium">
//               {(product.rating ?? 0).toFixed(1)}
//             </span>
//           </div>
//           <Separator orientation="vertical" className="h-6" />
//           <span className="text-muted-foreground">
//             {product.reviews ?? 0} รีวิว
//           </span>
//         </div>
//       )}

//       {/* การจัดส่ง */}
//       <div className="flex flex-wrap items-start gap-2">
//         <span className="text-muted-foreground font-medium text-sm md:text-base">
//           การจัดส่ง:
//         </span>

//         <div className="flex items-center gap-2">
//           <Truck className="h-4 w-4 text-success flex-shrink-0" />

//           <span className="text-sm break-words">
//             จะได้รับภายใน {deliveryRange}, ค่าจัดส่ง ฿0
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.2 =====================================================================

// // src/app/product/[id]/component/ProductDetailsPanel.tsx

// "use client";

// import { Star, RotateCcw } from "lucide-react";
// import { Separator } from "@/components/ui/separator";
// // 🎯 นำเข้า Type ที่รวมศูนย์
// import { UIProduct, CardPartsVisibility } from "@/app/api/mock/products/_store";

// interface DetailsPanelProps {
//   product: UIProduct;
//   visibleParts: CardPartsVisibility;
// }

// export function ProductDetailsPanel({ product, visibleParts }: DetailsPanelProps) {
//   return (
//     <div className="space-y-4">
//       <div>
//         <h1 className="text-2xl md:text-3xl font-bold mb-2 break-words">
//           {product.name}
//         </h1>
//         <p className="text-muted-foreground text-sm md:text-base break-words">
//           {visibleParts.brandName !== false && (
//             <>Brand: {product.brand || "-"} </>
//           )}
//           {visibleParts.sku !== false && (
//             <>| Model (SKU): {product.sku || "-"} </>
//           )}
//           {visibleParts.uom !== false && (
//             <>| หน่วยสินค้า: {product.uom || "BX."}</>
//           )}
//         </p>
//       </div>

//       {/* Rating */}
//       {visibleParts.ratingReview !== false && (
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-1">
//             {[...Array(5)].map((_, i) => (
//               <Star
//                 key={i}
//                 className={`h-5 w-5 ${
//                   i < Math.floor(product.rating ?? 0)
//                     ? "text-warning fill-current"
//                     : "text-gray-300"
//                 }`}
//               />
//             ))}
//             <span className="ml-2 text-lg font-medium">
//               {(product.rating ?? 0).toFixed(1)}
//             </span>
//           </div>
//           <Separator orientation="vertical" className="h-6" />
//           <span className="text-muted-foreground">
//             {product.reviews ?? 0} รีวิว
//           </span>
//         </div>
//       )}
      
//       {/* Return & Warranty */}
//       <div className="flex flex-wrap items-start gap-2">
//         <span className="text-muted-foreground font-medium text-sm md:text-base">
//           Return & Warranty:
//         </span>
//         <div className="flex items-center gap-2">
//           <RotateCcw className="h-4 w-4 text-muted-foreground flex-shrink-0" />
//           <span className="text-sm break-words">
//             Change of Mind • 7 Days Free Return • Warranty not available
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }
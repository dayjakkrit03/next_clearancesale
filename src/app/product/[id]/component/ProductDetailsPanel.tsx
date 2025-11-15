// v.1.1.2 =====================================================================
// src/app/product/[id]/component/ProductDetailsPanel.tsx

"use client";

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

// ===== Helper: คำนวณช่วงวันที่จัดส่ง =====
function getDeliveryRange() {
  const today = new Date();

  // วันเริ่มส่ง = พรุ่งนี้
  const start = new Date(today);
  start.setDate(start.getDate() + 1);

  // วันสิ้นสุด = อีก 5 วัน
  const end = new Date(today);
  end.setDate(end.getDate() + 5);

  return `${formatThaiDate(start)} - ${formatThaiDate(end)}`;
}

export function ProductDetailsPanel({
  product,
  visibleParts,
}: DetailsPanelProps) {
  const deliveryRange = getDeliveryRange(); // ← คำนวณช่วงวันที่ส่งถึง!

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
            จะได้รับภายใน {deliveryRange}, ค่าจัดส่ง ฿0
          </span>
        </div>
      </div>
    </div>
  );
}

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
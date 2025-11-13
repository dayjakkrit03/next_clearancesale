// src/app/product/[id]/component/ProductDetailsPanel.tsx

"use client";

import { Star, RotateCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
// 🎯 นำเข้า Type ที่รวมศูนย์
import { UIProduct, CardPartsVisibility } from "@/app/api/mock/products/_store";

interface DetailsPanelProps {
  product: UIProduct;
  visibleParts: CardPartsVisibility;
}

export function ProductDetailsPanel({ product, visibleParts }: DetailsPanelProps) {
  return (
    <div className="space-y-4">
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

      {/* Rating */}
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
      
      {/* Return & Warranty */}
      <div className="flex flex-wrap items-start gap-2">
        <span className="text-muted-foreground font-medium text-sm md:text-base">
          Return & Warranty:
        </span>
        <div className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm break-words">
            Change of Mind • 7 Days Free Return • Warranty not available
          </span>
        </div>
      </div>
    </div>
  );
}
// src/app/product/[id]/component/PriceSection.tsx
"use client";

import { Badge } from "@/components/ui/badge";

type UIProduct = any;
type CardPartsVisibility = any;

export type PriceSectionProps = {
  product: UIProduct;
  visibleParts: CardPartsVisibility;
  hasConditions: boolean;
  salesMode: "CUT" | "ROLL" | null;
  unit: string;
  originalPrice?: number;
  showDiscountBadge: boolean;
};

export function PriceSection({
  product,
  visibleParts,
  hasConditions,
  salesMode,
  unit,
  originalPrice,
  showDiscountBadge,
}: PriceSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        {visibleParts.price !== false && (
          <span className="text-2xl md:text-3xl font-bold text-sale">
            ฿{product.price.toLocaleString()}
            {hasConditions && salesMode ? ` / ${unit}` : ""}
          </span>
        )}
        {visibleParts.originalPrice !== false && originalPrice && (
          <span className="text-lg md:text-xl text-muted-foreground line-through">
            ฿{originalPrice.toLocaleString()}
          </span>
        )}
        {showDiscountBadge && (
          <Badge className="bg-sale text-sale-foreground text-sm px-3 py-1">
            ประหยัด {product.discountPercent}%
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">รวม VAT แล้ว</p>
    </div>
  );
}

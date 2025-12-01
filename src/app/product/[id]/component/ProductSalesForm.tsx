// v.1.1.9 ========================================================
// src/app/product/[id]/component/ProductSalesForm.tsx
"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import { useProductSalesForm } from "./useProductSalesForm";
import { PriceSection } from "./PriceSection";
import { CutSection } from "./CutSection";
import { RollSection } from "./RollSection";

import { useToast } from "@/components/ui/use-toast";
import type { AddToCartRequest, AddToCartResponse } from "@/types/cart";

type UIProduct = any;
type CardPartsVisibility = any;

interface SalesFormProps {
  product: UIProduct;
  visibleParts: CardPartsVisibility;
  hasConditions: boolean;
  /** เรียกตอนเพิ่มลงตะกร้า "สำเร็จ" เพื่อเปิด ShoppingCart */
  onAddToCart: () => void;
}

export function ProductSalesForm({
  product,
  visibleParts,
  hasConditions,
  onAddToCart,
}: SalesFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    salesMode,
    unit,
    originalPrice,
    showDiscountBadge,
    cutMinimum,
    cutStepOptions,
    cutLength,
    rollPairs,
    rollLength,
    selectedRollStock,
    quantity,
    lengthPerItem,
    totalLength,
    totalPrice,
    clearanceQty,
    noStock,
    maxQtyForCut,
    isStockAvailable,
    setRollLength,
    handleCutStep,
    handleQuantityChange,
  } = useProductSalesForm(product, visibleParts, hasConditions);

  /** ✅ สร้าง payload สำหรับ /api/cart/add แล้วเรียก API */
  const handleAddToCartClick = async () => {
    if (!isStockAvailable || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // 1) หา SKU ที่จะส่งให้ backend (ลองรองรับทั้ง product.sku และ product.product_sku)
      const sku: string =
        product?.sku ?? product?.product_sku ?? product?.productSku ?? "";

      if (!sku) {
        console.error("[ProductSalesForm] Missing product SKU");
        toast({
          variant: "destructive",
          title: "ไม่พบข้อมูลสินค้า",
          description: "ไม่พบรหัสสินค้า (SKU) สำหรับส่งไปยังระบบตะกร้า",
        });
        return;
      }

      // 2) กำหนด UOM + Quantity ตามเงื่อนไขที่ตกลงกัน
      //    - ถ้ามี conditions (CUT/ROLL) → ส่งเป็นหน่วยเมตร:
      //         uom = "M."
      //         quantity = totalLength (เช่น 6,000 M.)
      //    - ถ้าไม่มี conditions → ใช้ quantity ปกติ และ uom จากสินค้า
      let apiUom: string;
      let apiQty: number;

      if (hasConditions && salesMode) {
        apiUom = "M."; // หน่วยที่ Navision ใช้จริง
        apiQty = Number(totalLength) || 0;
      } else {
        apiUom =
          product?.uom ??
          unit ??
          ""; /* ถ้า uom มาจาก field อื่น ปรับตรงนี้ได้เลย */
        apiQty = Number(quantity) || 0;
      }

      if (!apiUom) {
        console.warn("[ProductSalesForm] Missing UOM");
      }

      if (apiQty <= 0) {
        toast({
          variant: "destructive",
          title: "จำนวนไม่ถูกต้อง",
          description: "กรุณาเลือกจำนวนสินค้าให้มากกว่า 0",
        });
        return;
      }

      // 3) DEBUG: log ค่า input ที่ใช้คำนวณก่อนสร้าง payload
      console.log("[ProductSalesForm] add-to-cart debug:", {
        salesMode,
        hasConditions,
        unit,
        lengthPerItem,
        totalLength,
        quantity,
        apiUom,
        apiQty,
        sku,
        price: Number(product.price) || 0,
      });

      // 4) สร้าง payload สำหรับ AddToCartRequest
      const payload: AddToCartRequest = {
        product: sku,
        uom: apiUom,
        quantity: apiQty,
        price: Number(product.price) || 0,
      };

      // 4.1 DEBUG: log payload ที่จะส่งเข้า /api/cart/add
      console.log("[ProductSalesForm] payload for /api/cart/add:", payload);

      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      const data = (await res.json()) as AddToCartResponse;

      // 4.2 DEBUG: log response จาก backend
      console.log("[ProductSalesForm] /api/cart/add response:", data);

      // 5) จัดการผลลัพธ์จาก backend
      switch (data.status) {
        case "success":
          toast({
            title: "เพิ่มสินค้าในตะกร้าแล้ว",
            description: `${product.name ?? "สินค้า"} ถูกเพิ่มในตะกร้าของคุณ`,
          });
          // เปิดแถบตะกร้า (ShoppingCart) ผ่าน callback จาก ProductClient
          onAddToCart();
          break;

        case "login":
          toast({
            variant: "destructive",
            title: "กรุณาเข้าสู่ระบบ",
            description: "ต้องเข้าสู่ระบบก่อนจึงจะเพิ่มสินค้าในตะกร้าได้",
          });
          router.push(`/login?redirect=/product/${product.id ?? ""}`);
          break;

        case "less-left":
          toast({
            variant: "destructive",
            title: "มีสินค้าไม่พอ",
            description:
              data.itemAvail != null
                ? `คงเหลือเพียง ${
                    (data.itemAvail as any).toLocaleString?.() ?? data.itemAvail
                  } ${apiUom}`
                : "จำนวนสินค้าที่ต้องการมากกว่าจำนวนคงเหลือ",
          });
          break;

        case "sold-out":
        default:
          toast({
            variant: "destructive",
            title: "สินค้าหมด",
            description: "ไม่สามารถเพิ่มสินค้านี้ลงตะกร้าได้ในขณะนี้",
          });
          break;
      }
    } catch (err) {
      console.error("[ProductSalesForm] add to cart error", err);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มสินค้าในตะกร้าได้ กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. ราคา */}
      <PriceSection
        product={product}
        visibleParts={visibleParts}
        hasConditions={hasConditions}
        salesMode={salesMode}
        unit={unit}
        originalPrice={originalPrice}
        showDiscountBadge={showDiscountBadge}
      />

      {/* 2. ประเภทการขาย */}
      {hasConditions && salesMode && (
        <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
          <span className="text-muted-foreground font-medium text-sm md:text-base">
            ประเภทการขาย:
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-lg border border-muted px-3 py-1.5 text-sm bg-white shadow-sm">
              {salesMode === "CUT" ? "ตัดแบ่งขาย (Cut)" : "ขายยกม้วน (Roll)"}
            </span>
          </div>
        </div>
      )}

      {/* 3. CUT Section */}
      <CutSection
        hasConditions={hasConditions}
        salesMode={salesMode}
        cutMinimum={cutMinimum}
        cutStepOptions={cutStepOptions}
        cutLength={cutLength}
        unit={unit}
        clearanceQty={clearanceQty}
        quantity={quantity}
        noStock={noStock}
        handleCutStep={handleCutStep}
      />

      {/* 4. ROLL Section */}
      <RollSection
        hasConditions={hasConditions}
        salesMode={salesMode}
        rollPairs={rollPairs}
        rollLength={rollLength}
        unit={unit}
        setRollLength={setRollLength}
      />

      {/* 5. สถานะสต๊อก */}
      <div className="flex items-center gap-2">
        {salesMode === "ROLL" ? (
          selectedRollStock != null ? (
            selectedRollStock > 0 ? (
              <>
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="text-success font-medium">
                  สต๊อก {selectedRollStock.toLocaleString()} ม้วน (ขนาด{" "}
                  {rollLength?.toLocaleString()} {unit})
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-destructive rounded-full" />
                <span className="text-destructive font-medium">
                  ขนาดที่เลือกหมดสต๊อก
                </span>
              </>
            )
          ) : (
            <>
              <div className="w-2 h-2 bg-muted-foreground rounded-full" />
              <span className="text-muted-foreground">
                เลือกความยาวม้วนเพื่อดูสต๊อก
              </span>
            </>
          )
        ) : clearanceQty != null && clearanceQty > 0 ? (
          <>
            <div className="w-2 h-2 bg-success rounded-full" />
            <span className="text-success font-medium">
              มีสินค้าในสต๊อก
              {/* มีสินค้าในสต๊อก จำนวน {clearanceQty.toLocaleString()} {unit} */}
            </span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-destructive rounded-full" />
            <span className="text-destructive font-medium">สินค้าหมด</span>
          </>
        )}
      </div>

      {/* 6. Quantity & Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="font-medium text-muted-foreground">Quantity:</span>
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(-1)}
              className="h-10 w-10 p-0"
              disabled={quantity <= 1 || isSubmitting}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="px-4 py-2 min-w-[3rem] text-center">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(1)}
              className="h-10 w-10 p-0"
              disabled={
                isSubmitting ||
                (salesMode === "ROLL" &&
                  selectedRollStock != null &&
                  quantity >= selectedRollStock) ||
                ((!hasConditions || !salesMode) &&
                  clearanceQty != null &&
                  quantity >= clearanceQty) ||
                (salesMode === "CUT" &&
                  maxQtyForCut != null &&
                  quantity >= maxQtyForCut)
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="text-sm text-muted-foreground space-y-1">
          {hasConditions && salesMode ? (
            <>
              <div>
                ความยาวรวม:{" "}
                <span className="font-medium text-foreground">
                  {totalLength.toLocaleString()} {unit}
                </span>
              </div>
              <div>
                ราคารวม:{" "}
                <span className="font-bold text-foreground">
                  ฿{totalPrice.toLocaleString()}
                </span>
              </div>
              {salesMode === "ROLL" && selectedRollStock != null && (
                <div className="text-xs">
                  สต๊อกสูงสุดสำหรับขนาดนี้:{" "}
                  {selectedRollStock.toLocaleString()} ม้วน
                </div>
              )}
              <div className="text-xs">
                ({quantity.toLocaleString()} ×{" "}
                {Number(lengthPerItem).toLocaleString()} {unit} × ฿
                {Number(product.price).toLocaleString()}/{unit})
              </div>
            </>
          ) : (
            <>
              <div>
                ราคารวม:{" "}
                <span className="font-bold text-foreground">
                  ฿{totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="text-xs">
                ({quantity.toLocaleString()} × ฿
                {Number(product.price).toLocaleString()} / ชิ้น)
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => router.push("/checkout")}
            disabled={!isStockAvailable || isSubmitting}
          >
            Buy Now
          </Button>
          <Button
            size="lg"
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleAddToCartClick}
            disabled={!isStockAvailable || isSubmitting}
          >
            {isSubmitting ? "กำลังเพิ่ม..." : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// v.1.1.9 ========================================================

// v.1.1.8 ========================================================
// // src/app/product/[id]/component/useProductSalesForm.ts

// "use client";

// import { useMemo, useState } from "react";

// type UIProduct = any;
// type CardPartsVisibility = any;

// // ===== Helpers =====
// const getOriginalPrice = (price: number, discountPercent?: number) => {
//   if (!discountPercent || discountPercent <= 0) return undefined;
//   const original = price / (1 - discountPercent / 100);
//   return Math.round(original);
// };
// // ====================

// export function useProductSalesForm(
//   product: UIProduct,
//   visibleParts: CardPartsVisibility,
//   hasConditions: boolean,
//   options?: {
//     /** ใช้ตอนเปิดจาก Cart: ให้ quantity เริ่มต้นเท่ากับที่อยู่ในตะกร้า */
//     initialQuantity?: number;
//   },
// ) {
//   // Sales Condition State Logic
//   const firstCond = hasConditions ? (product.conditions![0] as any) : undefined;
//   const [salesMode] = useState<"CUT" | "ROLL" | null>(
//     () => firstCond?.salesType ?? null,
//   );
//   const [unit] = useState<string>(
//     () => (firstCond?.unit ?? product.uom ?? "M.") as string,
//   );

//   const originalPrice = useMemo(
//     () => getOriginalPrice(product.price, product.discountPercent),
//     [product.price, product.discountPercent],
//   );
//   const showDiscountBadge =
//     (visibleParts.discountBadge ?? true) && (product.discountPercent ?? 0) > 0;

//   // --- CUT Logic ---
//   const cutCond = (product.conditions ?? []).find(
//     (c: any) => c.salesType === "CUT",
//   ) as any;

//   const cutMinimum =
//     typeof cutCond?.minimumLength === "number" && cutCond.minimumLength > 0
//       ? cutCond.minimumLength
//       : 1;

//   const cutStepOptions: number[] = Array.isArray(cutCond?.cutStepOptions)
//     ? (cutCond!.cutStepOptions as number[])
//     : Array.isArray((cutCond as any)?.stepOptions)
//     ? ((cutCond as any).stepOptions as number[])
//     : [];

//   const [cutLength, setCutLength] = useState<number>(() => cutMinimum);

//   // --- ROLL Logic ---
//   const rollCond = useMemo(() => {
//     return (product?.conditions ?? []).find(
//       (c: any) => c.salesType === "ROLL",
//     ) as any;
//   }, [product]);

//   const rollPairs = useMemo(() => {
//     const lens: number[] = rollCond?.rollLengths ?? [];
//     const stocks: (number | string)[] = rollCond?.rollStocks ?? [];

//     return lens.map((len: number, i: number) => ({
//       len,
//       stock: Number(stocks[i] ?? 0),
//     }));
//   }, [rollCond]);

//   const [rollLength, setRollLength] = useState<number | null>(() => {
//     if (rollCond?.rollLengths?.length) return rollCond.rollLengths[0];
//     return null;
//   });

//   const selectedRollStock = useMemo(() => {
//     if (!rollCond || !rollLength) return null;
//     const idx = (rollCond.rollLengths ?? []).findIndex(
//       (l: number) => l === rollLength,
//     );
//     return idx >= 0 ? Number(rollCond.rollStocks?.[idx] ?? 0) : null;
//   }, [rollCond, rollLength]);

//   // --- Quantity & Calculations ---
//   const [quantity, setQuantity] = useState(() =>
//     Math.max(1, Number(options?.initialQuantity ?? 1)),
//   );

//   const lengthPerItem = useMemo(() => {
//     if (!hasConditions || !salesMode) return 1;
//     if (salesMode === "CUT") return Math.max(cutMinimum, Number(cutLength));
//     if (salesMode === "ROLL") return Math.max(1, Number(rollLength ?? 1));
//     return 1;
//   }, [hasConditions, salesMode, cutLength, rollLength, cutMinimum]);

//   const totalLength = useMemo(
//     () =>
//       Math.max(1, Number(lengthPerItem)) * Math.max(1, Number(quantity)),
//     [lengthPerItem, quantity],
//   );
//   const totalPrice = useMemo(() => {
//     if (hasConditions && salesMode)
//       return totalLength * Number(product.price ?? 0);
//     return Math.max(1, Number(quantity)) * Number(product.price ?? 0);
//   }, [hasConditions, salesMode, totalLength, quantity, product.price]);

//   // ✅ clearanceQuantity จาก product
//   const rawClearanceQty = (product as any).clearanceQuantity;
//   const clearanceQty =
//     typeof rawClearanceQty === "number"
//       ? rawClearanceQty
//       : rawClearanceQty != null
//       ? Number(rawClearanceQty)
//       : null;

//   const noStock = clearanceQty != null && clearanceQty <= 0;

//   const maxQtyForCut = useMemo(() => {
//     if (!hasConditions || salesMode !== "CUT") return null;
//     if (clearanceQty == null || clearanceQty <= 0) return 0;
//     const perItem = Math.max(cutMinimum, cutLength || cutMinimum);
//     if (perItem <= 0) return 0;
//     return Math.floor(clearanceQty / perItem);
//   }, [hasConditions, salesMode, clearanceQty, cutMinimum, cutLength]);

//   // --- Handlers ---
//   const handleCutStep = (delta: number) => {
//     if (!hasConditions || salesMode !== "CUT") return;
//     if (noStock) return;
//     setCutLength((prev) => {
//       let next = prev + delta;
//       if (next < cutMinimum) next = cutMinimum;

//       if (clearanceQty != null && clearanceQty > 0) {
//         const maxLenForCurrentQty = Math.floor(
//           clearanceQty / Math.max(1, quantity),
//         );
//         if (next > maxLenForCurrentQty) {
//           next = Math.max(cutMinimum, maxLenForCurrentQty);
//         }
//       }
//       return next;
//     });
//   };

//   const handleQuantityChange = (change: number) => {
//     let next = Math.max(1, quantity + change);

//     if (salesMode === "ROLL" && selectedRollStock != null) {
//       next = Math.min(next, Math.max(0, selectedRollStock));
//     } else if ((!hasConditions || !salesMode) && clearanceQty != null) {
//       next = Math.min(next, Math.max(1, clearanceQty));
//     } else if (salesMode === "CUT" && maxQtyForCut != null) {
//       next = Math.min(next, Math.max(0, maxQtyForCut));
//     }

//     setQuantity(next);
//   };

//   const isStockAvailable =
//     salesMode === "ROLL"
//       ? selectedRollStock != null && selectedRollStock > 0
//       : clearanceQty == null || clearanceQty > 0;

//   return {
//     // state / derived
//     salesMode,
//     unit,
//     originalPrice,
//     showDiscountBadge,
//     cutMinimum,
//     cutStepOptions,
//     cutLength,
//     rollPairs,
//     rollLength,
//     selectedRollStock,
//     quantity,
//     lengthPerItem,
//     totalLength,
//     totalPrice,
//     clearanceQty,
//     noStock,
//     maxQtyForCut,
//     isStockAvailable,
//     // handlers
//     setRollLength,
//     handleCutStep,
//     handleQuantityChange,
//   };
// }

// v.1.1.8 ========================================================

// v.1.1.7 ========================================================
// // src/app/product/[id]/component/ProductSalesForm.tsx

// "use client";

// import { useState } from "react";
// import { Minus, Plus } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";

// import { useProductSalesForm } from "./useProductSalesForm";
// import { PriceSection } from "./PriceSection";
// import { CutSection } from "./CutSection";
// import { RollSection } from "./RollSection";

// import { useToast } from "@/components/ui/use-toast";
// import type { AddToCartRequest, AddToCartResponse } from "@/types/cart";

// type UIProduct = any;
// type CardPartsVisibility = any;

// interface SalesFormProps {
//   product: UIProduct;
//   visibleParts: CardPartsVisibility;
//   hasConditions: boolean;
//   /** เรียกตอนเพิ่มลงตะกร้า "สำเร็จ" เพื่อเปิด ShoppingCart */
//   onAddToCart: () => void;
// }

// export function ProductSalesForm({
//   product,
//   visibleParts,
//   hasConditions,
//   onAddToCart,
// }: SalesFormProps) {
//   const router = useRouter();
//   const { toast } = useToast();
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const {
//     salesMode,
//     unit,
//     originalPrice,
//     showDiscountBadge,
//     cutMinimum,
//     cutStepOptions,
//     cutLength,
//     rollPairs,
//     rollLength,
//     selectedRollStock,
//     quantity,
//     lengthPerItem,
//     totalLength,
//     totalPrice,
//     clearanceQty,
//     noStock,
//     maxQtyForCut,
//     isStockAvailable,
//     setRollLength,
//     handleCutStep,
//     handleQuantityChange,
//   } = useProductSalesForm(product, visibleParts, hasConditions);

//   /** ✅ สร้าง payload สำหรับ /api/cart/add แล้วเรียก API */
//   const handleAddToCartClick = async () => {
//     if (!isStockAvailable || isSubmitting) return;

//     try {
//       setIsSubmitting(true);

//       // 1) หา SKU ที่จะส่งให้ backend (ลองรองรับทั้ง product.sku และ product.product_sku)
//       const sku: string =
//         product?.sku ?? product?.product_sku ?? product?.productSku ?? "";

//       if (!sku) {
//         console.error("[ProductSalesForm] Missing product SKU");
//         toast({
//           variant: "destructive",
//           title: "ไม่พบข้อมูลสินค้า",
//           description: "ไม่พบรหัสสินค้า (SKU) สำหรับส่งไปยังระบบตะกร้า",
//         });
//         return;
//       }

//       // 2) กำหนด UOM + Quantity ตามเงื่อนไขที่ตกลงกัน
//       //    - ถ้ามี conditions (CUT/ROLL) → ส่งเป็นหน่วยเมตร:
//       //         uom = "M."
//       //         quantity = totalLength (เช่น 6,000 M.)
//       //    - ถ้าไม่มี conditions → ใช้ quantity ปกติ และ uom จากสินค้า
//       let apiUom: string;
//       let apiQty: number;

//       if (hasConditions && salesMode) {
//         apiUom = "M."; // หน่วยที่ Navision ใช้จริง
//         apiQty = Number(totalLength) || 0;
//       } else {
//         apiUom =
//           product?.uom ??
//           unit ??
//           ""; /* ถ้า uom มาจาก field อื่น ปรับตรงนี้ได้เลย */
//         apiQty = Number(quantity) || 0;
//       }

//       if (!apiUom) {
//         console.warn("[ProductSalesForm] Missing UOM");
//       }

//       if (apiQty <= 0) {
//         toast({
//           variant: "destructive",
//           title: "จำนวนไม่ถูกต้อง",
//           description: "กรุณาเลือกจำนวนสินค้าให้มากกว่า 0",
//         });
//         return;
//       }

//       // 3) DEBUG: log ค่า input ที่ใช้คำนวณก่อนสร้าง payload
//       console.log("[ProductSalesForm] add-to-cart debug:", {
//         salesMode,
//         hasConditions,
//         unit,
//         lengthPerItem,
//         totalLength,
//         quantity,
//         apiUom,
//         apiQty,
//         sku,
//         price: Number(product.price) || 0,
//       });

//       // 4) สร้าง payload สำหรับ AddToCartRequest
//       const payload: AddToCartRequest = {
//         product: sku,
//         uom: apiUom,
//         quantity: apiQty,
//         price: Number(product.price) || 0,
//       };

//       // 4.1 DEBUG: log payload ที่จะส่งเข้า /api/cart/add
//       console.log("[ProductSalesForm] payload for /api/cart/add:", payload);

//       const res = await fetch("/api/cart/add", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         throw new Error(`HTTP ${res.status} ${res.statusText}`);
//       }

//       const data = (await res.json()) as AddToCartResponse;

//       // 4.2 DEBUG: log response จาก backend
//       console.log("[ProductSalesForm] /api/cart/add response:", data);

//       // 5) จัดการผลลัพธ์จาก backend
//       switch (data.status) {
//         case "success":
//           toast({
//             title: "เพิ่มสินค้าในตะกร้าแล้ว",
//             description: `${product.name ?? "สินค้า"} ถูกเพิ่มในตะกร้าของคุณ`,
//           });
//           // เปิดแถบตะกร้า (ShoppingCart) ผ่าน callback จาก ProductClient
//           onAddToCart();
//           break;

//         case "login":
//           toast({
//             variant: "destructive",
//             title: "กรุณาเข้าสู่ระบบ",
//             description: "ต้องเข้าสู่ระบบก่อนจึงจะเพิ่มสินค้าในตะกร้าได้",
//           });
//           router.push(`/login?redirect=/product/${product.id ?? ""}`);
//           break;

//         case "less-left":
//           toast({
//             variant: "destructive",
//             title: "มีสินค้าไม่พอ",
//             description:
//               data.itemAvail != null
//                 ? `คงเหลือเพียง ${
//                     (data.itemAvail as any).toLocaleString?.() ??
//                     data.itemAvail
//                   } ${apiUom}`
//                 : "จำนวนสินค้าที่ต้องการมากกว่าจำนวนคงเหลือ",
//           });
//           break;

//         case "sold-out":
//         default:
//           toast({
//             variant: "destructive",
//             title: "สินค้าหมด",
//             description: "ไม่สามารถเพิ่มสินค้านี้ลงตะกร้าได้ในขณะนี้",
//           });
//           break;
//       }
//     } catch (err) {
//       console.error("[ProductSalesForm] add to cart error", err);
//       toast({
//         variant: "destructive",
//         title: "เกิดข้อผิดพลาด",
//         description: "ไม่สามารถเพิ่มสินค้าในตะกร้าได้ กรุณาลองใหม่อีกครั้ง",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       {/* 1. ราคา */}
//       <PriceSection
//         product={product}
//         visibleParts={visibleParts}
//         hasConditions={hasConditions}
//         salesMode={salesMode}
//         unit={unit}
//         originalPrice={originalPrice}
//         showDiscountBadge={showDiscountBadge}
//       />

//       {/* 2. ประเภทการขาย */}
//       {hasConditions && salesMode && (
//         <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
//           <span className="text-muted-foreground font-medium text-sm md:text-base">
//             ประเภทการขาย:
//           </span>
//           <div className="flex flex-wrap items-center gap-3">
//             <span className="inline-flex items-center rounded-lg border border-muted px-3 py-1.5 text-sm bg-white shadow-sm">
//               {salesMode === "CUT" ? "ตัดแบ่งขาย (Cut)" : "ขายยกม้วน (Roll)"}
//             </span>
//           </div>
//         </div>
//       )}

//       {/* 3. CUT Section */}
//       <CutSection
//         hasConditions={hasConditions}
//         salesMode={salesMode}
//         cutMinimum={cutMinimum}
//         cutStepOptions={cutStepOptions}
//         cutLength={cutLength}
//         unit={unit}
//         clearanceQty={clearanceQty}
//         quantity={quantity}
//         noStock={noStock}
//         handleCutStep={handleCutStep}
//       />

//       {/* 4. ROLL Section */}
//       <RollSection
//         hasConditions={hasConditions}
//         salesMode={salesMode}
//         rollPairs={rollPairs}
//         rollLength={rollLength}
//         unit={unit}
//         setRollLength={setRollLength}
//       />

//       {/* 5. สถานะสต๊อก */}
//       <div className="flex items-center gap-2">
//         {salesMode === "ROLL" ? (
//           selectedRollStock != null ? (
//             selectedRollStock > 0 ? (
//               <>
//                 <div className="w-2 h-2 bg-success rounded-full" />
//                 <span className="text-success font-medium">
//                   สต๊อก {selectedRollStock.toLocaleString()} ม้วน (ขนาด{" "}
//                   {rollLength?.toLocaleString()} {unit})
//                 </span>
//               </>
//             ) : (
//               <>
//                 <div className="w-2 h-2 bg-destructive rounded-full" />
//                 <span className="text-destructive font-medium">
//                   ขนาดที่เลือกหมดสต๊อก
//                 </span>
//               </>
//             )
//           ) : (
//             <>
//               <div className="w-2 h-2 bg-muted-foreground rounded-full" />
//               <span className="text-muted-foreground">
//                 เลือกความยาวม้วนเพื่อดูสต๊อก
//               </span>
//             </>
//           )
//         ) : clearanceQty != null && clearanceQty > 0 ? (
//           <>
//             <div className="w-2 h-2 bg-success rounded-full" />
//             <span className="text-success font-medium">
//               มีสินค้าในสต๊อก จำนวน {clearanceQty.toLocaleString()} {unit}
//             </span>
//           </>
//         ) : (
//           <>
//             <div className="w-2 h-2 bg-destructive rounded-full" />
//             <span className="text-destructive font-medium">สินค้าหมด</span>
//           </>
//         )}
//       </div>

//       {/* 6. Quantity & Actions */}
//       <div className="space-y-4">
//         <div className="flex items-center gap-4">
//           <span className="font-medium text-muted-foreground">Quantity:</span>
//           <div className="flex items-center border rounded-lg">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => handleQuantityChange(-1)}
//               className="h-10 w-10 p-0"
//               disabled={quantity <= 1 || isSubmitting}
//             >
//               <Minus className="h-4 w-4" />
//             </Button>
//             <span className="px-4 py-2 min-w-[3rem] text-center">
//               {quantity}
//             </span>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => handleQuantityChange(1)}
//               className="h-10 w-10 p-0"
//               disabled={
//                 isSubmitting ||
//                 (salesMode === "ROLL" &&
//                   selectedRollStock != null &&
//                   quantity >= selectedRollStock) ||
//                 ((!hasConditions || !salesMode) &&
//                   clearanceQty != null &&
//                   quantity >= clearanceQty) ||
//                 (salesMode === "CUT" &&
//                   maxQtyForCut != null &&
//                   quantity >= maxQtyForCut)
//               }
//             >
//               <Plus className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         {/* Summary */}
//         <div className="text-sm text-muted-foreground space-y-1">
//           {hasConditions && salesMode ? (
//             <>
//               <div>
//                 ความยาวรวม:{" "}
//                 <span className="font-medium text-foreground">
//                   {totalLength.toLocaleString()} {unit}
//                 </span>
//               </div>
//               <div>
//                 ราคารวม:{" "}
//                 <span className="font-bold text-foreground">
//                   ฿{totalPrice.toLocaleString()}
//                 </span>
//               </div>
//               {salesMode === "ROLL" && selectedRollStock != null && (
//                 <div className="text-xs">
//                   สต๊อกสูงสุดสำหรับขนาดนี้:{" "}
//                   {selectedRollStock.toLocaleString()} ม้วน
//                 </div>
//               )}
//               <div className="text-xs">
//                 ({quantity.toLocaleString()} ×{" "}
//                 {Number(lengthPerItem).toLocaleString()} {unit} × ฿
//                 {Number(product.price).toLocaleString()}/{unit})
//               </div>
//             </>
//           ) : (
//             <>
//               <div>
//                 ราคารวม:{" "}
//                 <span className="font-bold text-foreground">
//                   ฿{totalPrice.toLocaleString()}
//                 </span>
//               </div>
//               <div className="text-xs">
//                 ({quantity.toLocaleString()} × ฿
//                 {Number(product.price).toLocaleString()} / ชิ้น)
//               </div>
//             </>
//           )}
//         </div>

//         <div className="flex gap-3">
//           <Button
//             variant="outline"
//             size="lg"
//             className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
//             onClick={() => router.push("/checkout")}
//             disabled={!isStockAvailable || isSubmitting}
//           >
//             Buy Now
//           </Button>
//           <Button
//             size="lg"
//             className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
//             onClick={handleAddToCartClick}
//             disabled={!isStockAvailable || isSubmitting}
//           >
//             {isSubmitting ? "กำลังเพิ่ม..." : "Add to Cart"}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.7 ========================================================

// v.1.1.6 ========================================================
// // src/app/product/[id]/component/ProductSalesForm.tsx

// "use client";

// import { useState } from "react";
// import { Minus, Plus } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";

// import { useProductSalesForm } from "./useProductSalesForm";
// import { PriceSection } from "./PriceSection";
// import { CutSection } from "./CutSection";
// import { RollSection } from "./RollSection";

// import { useToast } from "@/components/ui/use-toast";
// import type { AddToCartRequest, AddToCartResponse } from "@/types/cart";

// type UIProduct = any;
// type CardPartsVisibility = any;

// interface SalesFormProps {
//   product: UIProduct;
//   visibleParts: CardPartsVisibility;
//   hasConditions: boolean;
//   /** เรียกตอนเพิ่มลงตะกร้า "สำเร็จ" เพื่อเปิด ShoppingCart */
//   onAddToCart: () => void;
// }

// export function ProductSalesForm({
//   product,
//   visibleParts,
//   hasConditions,
//   onAddToCart,
// }: SalesFormProps) {
//   const router = useRouter();
//   const { toast } = useToast();
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const {
//     salesMode,
//     unit,
//     originalPrice,
//     showDiscountBadge,
//     cutMinimum,
//     cutStepOptions,
//     cutLength,
//     rollPairs,
//     rollLength,
//     selectedRollStock,
//     quantity,
//     lengthPerItem,
//     totalLength,
//     totalPrice,
//     clearanceQty,
//     noStock,
//     maxQtyForCut,
//     isStockAvailable,
//     setRollLength,
//     handleCutStep,
//     handleQuantityChange,
//   } = useProductSalesForm(product, visibleParts, hasConditions);

//   /** ✅ สร้าง payload สำหรับ /api/cart/add แล้วเรียก API */
//   const handleAddToCartClick = async () => {
//     if (!isStockAvailable || isSubmitting) return;

//     try {
//       setIsSubmitting(true);

//       // 1) หา SKU ที่จะส่งให้ backend (ลองรองรับทั้ง product.sku และ product.product_sku)
//       const sku: string =
//         product?.sku ?? product?.product_sku ?? product?.productSku ?? "";

//       if (!sku) {
//         console.error("[ProductSalesForm] Missing product SKU");
//         toast({
//           variant: "destructive",
//           title: "ไม่พบข้อมูลสินค้า",
//           description: "ไม่พบรหัสสินค้า (SKU) สำหรับส่งไปยังระบบตะกร้า",
//         });
//         return;
//       }

//       // 2) กำหนด UOM + Quantity ตามเงื่อนไขที่ตกลงกัน
//       //    - ถ้ามี conditions (CUT/ROLL) → ส่งเป็นหน่วยเมตร:
//       //         uom = "M."
//       //         quantity = totalLength (เช่น 6,000 M.)
//       //    - ถ้าไม่มี conditions → ใช้ quantity ปกติ และ uom จากสินค้า
//       let apiUom: string;
//       let apiQty: number;

//       if (hasConditions && salesMode) {
//         apiUom = "M."; // หน่วยที่ Navision ใช้จริง
//         apiQty = Number(totalLength) || 0;
//       } else {
//         apiUom =
//           product?.uom ??
//           unit ??
//           ""; /* ถ้า uom มาจาก field อื่น ปรับตรงนี้ได้เลย */
//         apiQty = Number(quantity) || 0;
//       }

//       if (!apiUom) {
//         console.warn("[ProductSalesForm] Missing UOM");
//       }

//       if (apiQty <= 0) {
//         toast({
//           variant: "destructive",
//           title: "จำนวนไม่ถูกต้อง",
//           description: "กรุณาเลือกจำนวนสินค้าให้มากกว่า 0",
//         });
//         return;
//       }

//       // 3) สร้าง payload สำหรับ AddToCartRequest
//       const payload: AddToCartRequest = {
//         product: sku,
//         uom: apiUom,
//         quantity: apiQty,
//         price: Number(product.price) || 0,
//       };

//       const res = await fetch("/api/cart/add", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         throw new Error(`HTTP ${res.status} ${res.statusText}`);
//       }

//       const data = (await res.json()) as AddToCartResponse;

//       // 4) จัดการผลลัพธ์จาก backend
//       switch (data.status) {
//         case "success":
//           toast({
//             title: "เพิ่มสินค้าในตะกร้าแล้ว",
//             description: `${product.name ?? "สินค้า"} ถูกเพิ่มในตะกร้าของคุณ`,
//           });
//           // เปิดแถบตะกร้า (ShoppingCart) ผ่าน callback จาก ProductClient
//           onAddToCart();
//           break;

//         case "login":
//           toast({
//             variant: "destructive",
//             title: "กรุณาเข้าสู่ระบบ",
//             description: "ต้องเข้าสู่ระบบก่อนจึงจะเพิ่มสินค้าในตะกร้าได้",
//           });
//           router.push(`/login?redirect=/product/${product.id ?? ""}`);
//           break;

//         case "less-left":
//           toast({
//             variant: "destructive",
//             title: "มีสินค้าไม่พอ",
//             description:
//               data.itemAvail != null
//                 ? `คงเหลือเพียง ${data.itemAvail.toLocaleString?.() ?? data.itemAvail} ${apiUom}`
//                 : "จำนวนสินค้าที่ต้องการมากกว่าจำนวนคงเหลือ",
//           });
//           break;

//         case "sold-out":
//         default:
//           toast({
//             variant: "destructive",
//             title: "สินค้าหมด",
//             description: "ไม่สามารถเพิ่มสินค้านี้ลงตะกร้าได้ในขณะนี้",
//           });
//           break;
//       }
//     } catch (err) {
//       console.error("[ProductSalesForm] add to cart error", err);
//       toast({
//         variant: "destructive",
//         title: "เกิดข้อผิดพลาด",
//         description: "ไม่สามารถเพิ่มสินค้าในตะกร้าได้ กรุณาลองใหม่อีกครั้ง",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       {/* 1. ราคา */}
//       <PriceSection
//         product={product}
//         visibleParts={visibleParts}
//         hasConditions={hasConditions}
//         salesMode={salesMode}
//         unit={unit}
//         originalPrice={originalPrice}
//         showDiscountBadge={showDiscountBadge}
//       />

//       {/* 2. ประเภทการขาย */}
//       {hasConditions && salesMode && (
//         <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
//           <span className="text-muted-foreground font-medium text-sm md:text-base">
//             ประเภทการขาย:
//           </span>
//           <div className="flex flex-wrap items-center gap-3">
//             <span className="inline-flex items-center rounded-lg border border-muted px-3 py-1.5 text-sm bg-white shadow-sm">
//               {salesMode === "CUT" ? "ตัดแบ่งขาย (Cut)" : "ขายยกม้วน (Roll)"}
//             </span>
//           </div>
//         </div>
//       )}

//       {/* 3. CUT Section */}
//       <CutSection
//         hasConditions={hasConditions}
//         salesMode={salesMode}
//         cutMinimum={cutMinimum}
//         cutStepOptions={cutStepOptions}
//         cutLength={cutLength}
//         unit={unit}
//         clearanceQty={clearanceQty}
//         quantity={quantity}
//         noStock={noStock}
//         handleCutStep={handleCutStep}
//       />

//       {/* 4. ROLL Section */}
//       <RollSection
//         hasConditions={hasConditions}
//         salesMode={salesMode}
//         rollPairs={rollPairs}
//         rollLength={rollLength}
//         unit={unit}
//         setRollLength={setRollLength}
//       />

//       {/* 5. สถานะสต๊อก */}
//       <div className="flex items-center gap-2">
//         {salesMode === "ROLL" ? (
//           selectedRollStock != null ? (
//             selectedRollStock > 0 ? (
//               <>
//                 <div className="w-2 h-2 bg-success rounded-full" />
//                 <span className="text-success font-medium">
//                   สต๊อก {selectedRollStock.toLocaleString()} ม้วน (ขนาด{" "}
//                   {rollLength?.toLocaleString()} {unit})
//                 </span>
//               </>
//             ) : (
//               <>
//                 <div className="w-2 h-2 bg-destructive rounded-full" />
//                 <span className="text-destructive font-medium">
//                   ขนาดที่เลือกหมดสต๊อก
//                 </span>
//               </>
//             )
//           ) : (
//             <>
//               <div className="w-2 h-2 bg-muted-foreground rounded-full" />
//               <span className="text-muted-foreground">
//                 เลือกความยาวม้วนเพื่อดูสต๊อก
//               </span>
//             </>
//           )
//         ) : clearanceQty != null && clearanceQty > 0 ? (
//           <>
//             <div className="w-2 h-2 bg-success rounded-full" />
//             <span className="text-success font-medium">
//               มีสินค้าในสต๊อก จำนวน {clearanceQty.toLocaleString()} {unit}
//             </span>
//           </>
//         ) : (
//           <>
//             <div className="w-2 h-2 bg-destructive rounded-full" />
//             <span className="text-destructive font-medium">สินค้าหมด</span>
//           </>
//         )}
//       </div>

//       {/* 6. Quantity & Actions */}
//       <div className="space-y-4">
//         <div className="flex items-center gap-4">
//           <span className="font-medium text-muted-foreground">Quantity:</span>
//           <div className="flex items-center border rounded-lg">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => handleQuantityChange(-1)}
//               className="h-10 w-10 p-0"
//               disabled={quantity <= 1 || isSubmitting}
//             >
//               <Minus className="h-4 w-4" />
//             </Button>
//             <span className="px-4 py-2 min-w-[3rem] text-center">
//               {quantity}
//             </span>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => handleQuantityChange(1)}
//               className="h-10 w-10 p-0"
//               disabled={
//                 isSubmitting ||
//                 (salesMode === "ROLL" &&
//                   selectedRollStock != null &&
//                   quantity >= selectedRollStock) ||
//                 ((!hasConditions || !salesMode) &&
//                   clearanceQty != null &&
//                   quantity >= clearanceQty) ||
//                 (salesMode === "CUT" &&
//                   maxQtyForCut != null &&
//                   quantity >= maxQtyForCut)
//               }
//             >
//               <Plus className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         {/* Summary */}
//         <div className="text-sm text-muted-foreground space-y-1">
//           {hasConditions && salesMode ? (
//             <>
//               <div>
//                 ความยาวรวม:{" "}
//                 <span className="font-medium text-foreground">
//                   {totalLength.toLocaleString()} {unit}
//                 </span>
//               </div>
//               <div>
//                 ราคารวม:{" "}
//                 <span className="font-bold text-foreground">
//                   ฿{totalPrice.toLocaleString()}
//                 </span>
//               </div>
//               {salesMode === "ROLL" && selectedRollStock != null && (
//                 <div className="text-xs">
//                   สต๊อกสูงสุดสำหรับขนาดนี้:{" "}
//                   {selectedRollStock.toLocaleString()} ม้วน
//                 </div>
//               )}
//               <div className="text-xs">
//                 ({quantity.toLocaleString()} ×{" "}
//                 {Number(lengthPerItem).toLocaleString()} {unit} × ฿
//                 {Number(product.price).toLocaleString()}/{unit})
//               </div>
//             </>
//           ) : (
//             <>
//               <div>
//                 ราคารวม:{" "}
//                 <span className="font-bold text-foreground">
//                   ฿{totalPrice.toLocaleString()}
//                 </span>
//               </div>
//               <div className="text-xs">
//                 ({quantity.toLocaleString()} × ฿
//                 {Number(product.price).toLocaleString()} / ชิ้น)
//               </div>
//             </>
//           )}
//         </div>

//         <div className="flex gap-3">
//           <Button
//             variant="outline"
//             size="lg"
//             className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
//             onClick={() => router.push("/checkout")}
//             disabled={!isStockAvailable || isSubmitting}
//           >
//             Buy Now
//           </Button>
//           <Button
//             size="lg"
//             className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
//             onClick={handleAddToCartClick}
//             disabled={!isStockAvailable || isSubmitting}
//           >
//             {isSubmitting ? "กำลังเพิ่ม..." : "Add to Cart"}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.6 ========================================================


// v.1.1.5 ========================================================
// // src/app/product/[id]/component/ProductSalesForm.tsx

// "use client";

// import { Minus, Plus } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";

// import { useProductSalesForm } from "./useProductSalesForm";
// import { PriceSection } from "./PriceSection";
// import { CutSection } from "./CutSection";
// import { RollSection } from "./RollSection";

// type UIProduct = any;
// type CardPartsVisibility = any;

// interface SalesFormProps {
//   product: UIProduct;
//   visibleParts: CardPartsVisibility;
//   hasConditions: boolean;
//   onAddToCart: () => void;
// }

// export function ProductSalesForm({
//   product,
//   visibleParts,
//   hasConditions,
//   onAddToCart,
// }: SalesFormProps) {
//   const router = useRouter();

//   const {
//     salesMode,
//     unit,
//     originalPrice,
//     showDiscountBadge,
//     cutMinimum,
//     cutStepOptions,
//     cutLength,
//     rollPairs,
//     rollLength,
//     selectedRollStock,
//     quantity,
//     lengthPerItem,
//     totalLength,
//     totalPrice,
//     clearanceQty,
//     noStock,
//     maxQtyForCut,
//     isStockAvailable,
//     setRollLength,
//     handleCutStep,
//     handleQuantityChange,
//   } = useProductSalesForm(product, visibleParts, hasConditions);

//   return (
//     <div className="space-y-4">
//       {/* 1. ราคา */}
//       <PriceSection
//         product={product}
//         visibleParts={visibleParts}
//         hasConditions={hasConditions}
//         salesMode={salesMode}
//         unit={unit}
//         originalPrice={originalPrice}
//         showDiscountBadge={showDiscountBadge}
//       />

//       {/* 2. ประเภทการขาย */}
//       {hasConditions && salesMode && (
//         <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
//           <span className="text-muted-foreground font-medium text-sm md:text-base">
//             ประเภทการขาย:
//           </span>
//           <div className="flex flex-wrap items-center gap-3">
//             <span className="inline-flex items-center rounded-lg border border-muted px-3 py-1.5 text-sm bg-white shadow-sm">
//               {salesMode === "CUT"
//                 ? "ตัดแบ่งขาย (Cut)"
//                 : "ขายยกม้วน (Roll)"}
//             </span>
//           </div>
//         </div>
//       )}

//       {/* 3. CUT Section */}
//       <CutSection
//         hasConditions={hasConditions}
//         salesMode={salesMode}
//         cutMinimum={cutMinimum}
//         cutStepOptions={cutStepOptions}
//         cutLength={cutLength}
//         unit={unit}
//         clearanceQty={clearanceQty}
//         quantity={quantity}
//         noStock={noStock}
//         handleCutStep={handleCutStep}
//       />

//       {/* 4. ROLL Section */}
//       <RollSection
//         hasConditions={hasConditions}
//         salesMode={salesMode}
//         rollPairs={rollPairs}
//         rollLength={rollLength}
//         unit={unit}
//         setRollLength={setRollLength}
//       />

//       {/* 5. สถานะสต๊อก */}
//       <div className="flex items-center gap-2">
//         {salesMode === "ROLL" ? (
//           selectedRollStock != null ? (
//             selectedRollStock > 0 ? (
//               <>
//                 <div className="w-2 h-2 bg-success rounded-full" />
//                 <span className="text-success font-medium">
//                   สต๊อก {selectedRollStock.toLocaleString()} ม้วน (ขนาด{" "}
//                   {rollLength?.toLocaleString()} {unit})
//                 </span>
//               </>
//             ) : (
//               <>
//                 <div className="w-2 h-2 bg-destructive rounded-full" />
//                 <span className="text-destructive font-medium">
//                   ขนาดที่เลือกหมดสต๊อก
//                 </span>
//               </>
//             )
//           ) : (
//             <>
//               <div className="w-2 h-2 bg-muted-foreground rounded-full" />
//               <span className="text-muted-foreground">
//                 เลือกความยาวม้วนเพื่อดูสต๊อก
//               </span>
//             </>
//           )
//         ) : clearanceQty != null && clearanceQty > 0 ? (
//           <>
//             <div className="w-2 h-2 bg-success rounded-full" />
//             <span className="text-success font-medium">
//               มีสินค้าในสต๊อก จำนวน {clearanceQty.toLocaleString()} {unit}
//             </span>
//           </>
//         ) : (
//           <>
//             <div className="w-2 h-2 bg-destructive rounded-full" />
//             <span className="text-destructive font-medium">
//               สินค้าหมด
//             </span>
//           </>
//         )}
//       </div>

//       {/* 6. Quantity & Actions */}
//       <div className="space-y-4">
//         <div className="flex items-center gap-4">
//           <span className="font-medium text-muted-foreground">Quantity:</span>
//           <div className="flex items-center border rounded-lg">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => handleQuantityChange(-1)}
//               className="h-10 w-10 p-0"
//               disabled={quantity <= 1}
//             >
//               <Minus className="h-4 w-4" />
//             </Button>
//             <span className="px-4 py-2 min-w-[3rem] text-center">
//               {quantity}
//             </span>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => handleQuantityChange(1)}
//               className="h-10 w-10 p-0"
//               disabled={
//                 (salesMode === "ROLL" &&
//                   selectedRollStock != null &&
//                   quantity >= selectedRollStock) ||
//                 ((!hasConditions || !salesMode) &&
//                   clearanceQty != null &&
//                   quantity >= clearanceQty) ||
//                 (salesMode === "CUT" &&
//                   maxQtyForCut != null &&
//                   quantity >= maxQtyForCut)
//               }
//             >
//               <Plus className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         {/* Summary */}
//         <div className="text-sm text-muted-foreground space-y-1">
//           {hasConditions && salesMode ? (
//             <>
//               <div>
//                 ความยาวรวม:{" "}
//                 <span className="font-medium text-foreground">
//                   {totalLength.toLocaleString()} {unit}
//                 </span>
//               </div>
//               <div>
//                 ราคารวม:{" "}
//                 <span className="font-bold text-foreground">
//                   ฿{totalPrice.toLocaleString()}
//                 </span>
//               </div>
//               {salesMode === "ROLL" && selectedRollStock != null && (
//                 <div className="text-xs">
//                   สต๊อกสูงสุดสำหรับขนาดนี้:{" "}
//                   {selectedRollStock.toLocaleString()} ม้วน
//                 </div>
//               )}
//               <div className="text-xs">
//                 ({quantity.toLocaleString()} ×{" "}
//                 {Number(lengthPerItem).toLocaleString()} {unit} × ฿
//                 {Number(product.price).toLocaleString()}/{unit})
//               </div>
//             </>
//           ) : (
//             <>
//               <div>
//                 ราคารวม:{" "}
//                 <span className="font-bold text-foreground">
//                   ฿{totalPrice.toLocaleString()}
//                 </span>
//               </div>
//               <div className="text-xs">
//                 ({quantity.toLocaleString()} × ฿
//                 {Number(product.price).toLocaleString()} / ชิ้น)
//               </div>
//             </>
//           )}
//         </div>

//         <div className="flex gap-3">
//           <Button
//             variant="outline"
//             size="lg"
//             className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
//             onClick={() => router.push("/checkout")}
//             disabled={!isStockAvailable}
//           >
//             Buy Now
//           </Button>
//           <Button
//             size="lg"
//             className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
//             onClick={onAddToCart}
//             disabled={!isStockAvailable}
//           >
//             Add to Cart
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.5 ========================================================

// v.1.1.4 ========================================================
// // src/app/product/[id]/component/ProductSalesForm.tsx

// "use client";

// import { Minus, Plus } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useRouter } from "next/navigation";
// import { useProductSalesForm } from "./useProductSalesForm";

// type UIProduct = any;
// type CardPartsVisibility = any;

// interface SalesFormProps {
//   product: UIProduct;
//   visibleParts: CardPartsVisibility;
//   hasConditions: boolean;
//   onAddToCart: () => void;
// }

// export function ProductSalesForm({
//   product,
//   visibleParts,
//   hasConditions,
//   onAddToCart,
// }: SalesFormProps) {
//   const router = useRouter();

//   const {
//     salesMode,
//     unit,
//     originalPrice,
//     showDiscountBadge,
//     cutMinimum,
//     cutStepOptions,
//     cutLength,
//     rollPairs,
//     rollLength,
//     selectedRollStock,
//     quantity,
//     lengthPerItem,
//     totalLength,
//     totalPrice,
//     clearanceQty,
//     noStock,
//     maxQtyForCut,
//     isStockAvailable,
//     setRollLength,
//     handleCutStep,
//     handleQuantityChange,
//   } = useProductSalesForm(product, visibleParts, hasConditions);

//   return (
//     <div className="space-y-4">
//       {/* Price */}
//       <div className="space-y-2">
//         <div className="flex flex-wrap items-center gap-3">
//           {visibleParts.price !== false && (
//             <span className="text-2xl md:text-3xl font-bold text-sale">
//               ฿{product.price.toLocaleString()}
//               {hasConditions && salesMode ? ` / ${unit}` : ""}
//             </span>
//           )}
//           {visibleParts.originalPrice !== false && originalPrice && (
//             <span className="text-lg md:text-xl text-muted-foreground line-through">
//               ฿{originalPrice.toLocaleString()}
//             </span>
//           )}
//           {showDiscountBadge && (
//             <Badge className="bg-sale text-sale-foreground text-sm px-3 py-1">
//               ประหยัด {product.discountPercent}%
//             </Badge>
//           )}
//         </div>
//         <p className="text-sm text-muted-foreground">รวม VAT แล้ว</p>
//       </div>

//       {/* Sales Type */}
//       {hasConditions && salesMode && (
//         <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
//           <span className="text-muted-foreground font-medium text-sm md:text-base">
//             ประเภทการขาย:
//           </span>
//           <div className="flex flex-wrap items-center gap-3">
//             <span className="inline-flex items-center rounded-lg border border-muted px-3 py-1.5 text-sm bg-white shadow-sm">
//               {salesMode === "CUT"
//                 ? "ตัดแบ่งขาย (Cut)"
//                 : "ขายยกม้วน (Roll)"}
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Length (CUT) */}
//       {hasConditions && salesMode === "CUT" && (
//         <div className="space-y-2">
//           <div className="sm:flex sm:items-center sm:gap-4">
//             <span className="text-muted-foreground font-medium text-sm md:text-base">
//               ความยาวตัดขาย:
//             </span>
//             <div className="flex items-center gap-3">
//               <span
//                 className="inline-flex items-center rounded-lg border border-muted px-3 py-2 text-sm bg-muted/20"
//                 title="ความยาวที่ตัดขายต่อ 1 รายการ"
//               >
//                 {cutLength.toLocaleString()} {unit}
//               </span>
//               <span className="text-xs text-muted-foreground">
//                 ขั้นต่ำ {cutMinimum.toLocaleString()} {unit}
//               </span>
//             </div>
//           </div>

//           {cutStepOptions.length > 0 && (
//             <div className="sm:flex sm:items-center sm:gap-4">
//               <span className="text-muted-foreground font-medium text-xs md:text-sm">
//                 เพิ่ม/ลดความยาว:
//               </span>
//               <div className="flex flex-wrap items-center gap-2">
//                 {cutStepOptions.map((step) => {
//                   const nextPlus = cutLength + step;
//                   const exceedStock =
//                     clearanceQty != null &&
//                     clearanceQty > 0 &&
//                     nextPlus * quantity > clearanceQty;

//                   return (
//                     <div key={step} className="flex items-center gap-1">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleCutStep(-step)}
//                         disabled={cutLength - step < cutMinimum || noStock}
//                         title={`ลด -${step.toLocaleString()} ${unit}`}
//                       >
//                         -{step.toLocaleString()} {unit}
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleCutStep(step)}
//                         disabled={exceedStock || noStock}
//                         title={`เพิ่ม +${step.toLocaleString()} ${unit}`}
//                       >
//                         +{step.toLocaleString()} {unit}
//                       </Button>
//                     </div>
//                   );
//                 })}
//                 <span className="text-xs text-muted-foreground">
//                   (กดเพิ่ม/ลดจากค่าขั้นต่ำ)
//                 </span>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Length (ROLL) */}
//       {hasConditions && salesMode === "ROLL" && (
//         <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
//           <span className="text-muted-foreground font-medium text-sm md:text-base">
//             ความยาวม้วน:
//           </span>

//           <div className="flex flex-wrap items-center gap-3">
//             {rollPairs.map(({ len, stock }: { len: number; stock: number }) => {
//               const isActive = rollLength === len;
//               const soldOut = stock <= 0;
//               return (
//                 <button
//                   key={len}
//                   onClick={() => !soldOut && setRollLength(len)}
//                   disabled={soldOut}
//                   className={[
//                     "cursor-pointer border rounded-lg px-3 py-2 transition-colors text-sm",
//                     isActive
//                       ? "border-primary text-primary"
//                       : "border-muted hover:bg-muted/50",
//                     soldOut ? "opacity-50 cursor-not-allowed" : "",
//                   ].join(" ")}
//                   title={
//                     soldOut
//                       ? "สินค้าหมด"
//                       : `สต๊อก: ${stock.toLocaleString()} ม้วน`
//                   }
//                 >
//                   {len.toLocaleString()} {unit}
//                   <span className="ml-2 text-xs text-muted-foreground">
//                     ({soldOut ? "หมด" : stock.toLocaleString()})
//                   </span>
//                 </button>
//               );
//             })}
//             <span className="text-sm text-muted-foreground">
//               {rollLength ? `(${rollLength.toLocaleString()} ${unit})` : ""}
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Stock */}
//       <div className="flex items-center gap-2">
//         {salesMode === "ROLL" ? (
//           selectedRollStock != null ? (
//             selectedRollStock > 0 ? (
//               <>
//                 <div className="w-2 h-2 bg-success rounded-full" />
//                 <span className="text-success font-medium">
//                   สต๊อก {selectedRollStock.toLocaleString()} ม้วน (ขนาด{" "}
//                   {rollLength?.toLocaleString()} {unit})
//                 </span>
//               </>
//             ) : (
//               <>
//                 <div className="w-2 h-2 bg-destructive rounded-full" />
//                 <span className="text-destructive font-medium">
//                   ขนาดที่เลือกหมดสต๊อก
//                 </span>
//               </>
//             )
//           ) : (
//             <>
//               <div className="w-2 h-2 bg-muted-foreground rounded-full" />
//               <span className="text-muted-foreground">
//                 เลือกความยาวม้วนเพื่อดูสต๊อก
//               </span>
//             </>
//           )
//         ) : clearanceQty != null && clearanceQty > 0 ? (
//           <>
//             <div className="w-2 h-2 bg-success rounded-full" />
//             <span className="text-success font-medium">
//               มีสินค้าในสต๊อก จำนวน {clearanceQty.toLocaleString()} {unit}
//             </span>
//           </>
//         ) : (
//           <>
//             <div className="w-2 h-2 bg-destructive rounded-full" />
//             <span className="text-destructive font-medium">
//               สินค้าหมด
//             </span>
//           </>
//         )}
//       </div>

//       {/* Quantity & Actions */}
//       <div className="space-y-4">
//         <div className="flex items-center gap-4">
//           <span className="font-medium text-muted-foreground">Quantity:</span>
//           <div className="flex items-center border rounded-lg">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => handleQuantityChange(-1)}
//               className="h-10 w-10 p-0"
//               disabled={quantity <= 1}
//             >
//               <Minus className="h-4 w-4" />
//             </Button>
//             <span className="px-4 py-2 min-w-[3rem] text-center">
//               {quantity}
//             </span>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => handleQuantityChange(1)}
//               className="h-10 w-10 p-0"
//               disabled={
//                 (salesMode === "ROLL" &&
//                   selectedRollStock != null &&
//                   quantity >= selectedRollStock) ||
//                 ((!hasConditions || !salesMode) &&
//                   clearanceQty != null &&
//                   quantity >= clearanceQty) ||
//                 (salesMode === "CUT" &&
//                   maxQtyForCut != null &&
//                   quantity >= maxQtyForCut)
//               }
//             >
//               <Plus className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         {/* Summary */}
//         <div className="text-sm text-muted-foreground space-y-1">
//           {hasConditions && salesMode ? (
//             <>
//               <div>
//                 ความยาวรวม:{" "}
//                 <span className="font-medium text-foreground">
//                   {totalLength.toLocaleString()} {unit}
//                 </span>
//               </div>
//               <div>
//                 ราคารวม:{" "}
//                 <span className="font-bold text-foreground">
//                   ฿{totalPrice.toLocaleString()}
//                 </span>
//               </div>
//               {salesMode === "ROLL" && selectedRollStock != null && (
//                 <div className="text-xs">
//                   สต๊อกสูงสุดสำหรับขนาดนี้:{" "}
//                   {selectedRollStock.toLocaleString()} ม้วน
//                 </div>
//               )}
//               <div className="text-xs">
//                 ({quantity.toLocaleString()} ×{" "}
//                 {Number(lengthPerItem).toLocaleString()} {unit} × ฿
//                 {Number(product.price).toLocaleString()}/{unit})
//               </div>
//             </>
//           ) : (
//             <>
//               <div>
//                 ราคารวม:{" "}
//                 <span className="font-bold text-foreground">
//                   ฿{totalPrice.toLocaleString()}
//                 </span>
//               </div>
//               <div className="text-xs">
//                 ({quantity.toLocaleString()} × ฿
//                 {Number(product.price).toLocaleString()} / ชิ้น)
//               </div>
//             </>
//           )}
//         </div>

//         <div className="flex gap-3">
//           <Button
//             variant="outline"
//             size="lg"
//             className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
//             onClick={() => router.push("/checkout")}
//             disabled={!isStockAvailable}
//           >
//             Buy Now
//           </Button>
//           <Button
//             size="lg"
//             className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
//             onClick={onAddToCart}
//             disabled={!isStockAvailable}
//           >
//             Add to Cart
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
// v.1.1.4 ========================================================

// v.1.1.3 ========================================================
// // src/app/product/[id]/component/ProductSalesForm.tsx

// "use client";

// import { useMemo, useState } from "react";
// import { Plus, Minus } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useRouter } from "next/navigation";

// // ***************************************************************
// // ***** แก้ไข Error 2305: Type Placeholder (นำมาแทนการ Import) *****
// // ***************************************************************
// type UIProduct = any;
// type CardPartsVisibility = any;

// // ===== Helpers (ย้ายมาที่นี่) =====
// const getOriginalPrice = (price: number, discountPercent?: number) => {
//   if (!discountPercent || discountPercent <= 0) return undefined;
//   const original = price / (1 - discountPercent / 100);
//   return Math.round(original);
// };
// // ==================================

// interface SalesFormProps {
//   product: UIProduct;
//   visibleParts: CardPartsVisibility;
//   hasConditions: boolean;
//   onAddToCart: () => void;
// }

// export function ProductSalesForm({
//   product,
//   visibleParts,
//   hasConditions,
//   onAddToCart,
// }: SalesFormProps) {
//   const router = useRouter();

//   // Sales Condition State Logic
//   const firstCond = hasConditions ? (product.conditions![0] as any) : undefined;
//   const [salesMode] = useState<"CUT" | "ROLL" | null>(
//     () => firstCond?.salesType ?? null
//   );
//   const [unit] = useState<string>(
//     () => (firstCond?.unit ?? product.uom ?? "M.") as string
//   );

//   const originalPrice = useMemo(
//     () => getOriginalPrice(product.price, product.discountPercent),
//     [product.price, product.discountPercent]
//   );
//   const showDiscountBadge =
//     (visibleParts.discountBadge ?? true) && (product.discountPercent ?? 0) > 0;

//   // --- CUT Logic ---
//   const cutCond = (product.conditions ?? []).find(
//     (c: any) => c.salesType === "CUT"
//   ) as any;

//   const cutMinimum =
//     typeof cutCond?.minimumLength === "number" && cutCond.minimumLength > 0
//       ? cutCond.minimumLength
//       : 1;

//   const cutStepOptions: number[] = Array.isArray(cutCond?.cutStepOptions)
//     ? (cutCond!.cutStepOptions as number[])
//     : Array.isArray((cutCond as any)?.stepOptions)
//     ? ((cutCond as any).stepOptions as number[])
//     : [];

//   const [cutLength, setCutLength] = useState<number>(() => cutMinimum);

//   // --- ROLL Logic ---
//   const rollCond = useMemo(() => {
//     return (product?.conditions ?? []).find(
//       (c: any) => c.salesType === "ROLL"
//     ) as any;
//   }, [product]);

//   const rollPairs = useMemo(() => {
//     const lens: number[] = rollCond?.rollLengths ?? [];
//     const stocks: (number | string)[] = rollCond?.rollStocks ?? [];

//     return lens.map((len: number, i: number) => ({
//       len,
//       stock: Number(stocks[i] ?? 0),
//     }));
//   }, [rollCond]);

//   const [rollLength, setRollLength] = useState<number | null>(() => {
//     if (rollCond?.rollLengths?.length) return rollCond.rollLengths[0];
//     return null;
//   });

//   const selectedRollStock = useMemo(() => {
//     if (!rollCond || !rollLength) return null;
//     const idx = (rollCond.rollLengths ?? []).findIndex(
//       (l: number) => l === rollLength
//     );
//     return idx >= 0 ? Number(rollCond.rollStocks?.[idx] ?? 0) : null;
//   }, [rollCond, rollLength]);

//   // --- Quantity & Calculations ---
//   const [quantity, setQuantity] = useState(1);

//   const lengthPerItem = useMemo(() => {
//     if (!hasConditions || !salesMode) return 1;
//     if (salesMode === "CUT") return Math.max(cutMinimum, Number(cutLength));
//     if (salesMode === "ROLL") return Math.max(1, Number(rollLength ?? 1));
//     return 1;
//   }, [hasConditions, salesMode, cutLength, rollLength, cutMinimum]);

//   const totalLength = useMemo(
//     () =>
//       Math.max(1, Number(lengthPerItem)) * Math.max(1, Number(quantity)),
//     [lengthPerItem, quantity]
//   );
//   const totalPrice = useMemo(() => {
//     if (hasConditions && salesMode)
//       return totalLength * Number(product.price ?? 0);
//     return Math.max(1, Number(quantity)) * Number(product.price ?? 0);
//   }, [hasConditions, salesMode, totalLength, quantity, product.price]);

//   // ✅ ใช้ clearanceQuantity จาก product เพื่อเช็คสต๊อก
//   const rawClearanceQty = (product as any).clearanceQuantity;
//   const clearanceQty =
//     typeof rawClearanceQty === "number"
//       ? rawClearanceQty
//       : rawClearanceQty != null
//       ? Number(rawClearanceQty)
//       : null;

//   // 👉 สินค้าหมด ถ้า stock ระบุมาและ <= 0
//   const noStock = clearanceQty != null && clearanceQty <= 0;

//   // จำนวนสูงสุดที่ซื้อได้สำหรับโหมด CUT = stock / ความยาวต่อชิ้น
//   const maxQtyForCut = useMemo(() => {
//     if (!hasConditions || salesMode !== "CUT") return null;
//     if (clearanceQty == null || clearanceQty <= 0) return 0;
//     const perItem = Math.max(cutMinimum, cutLength || cutMinimum);
//     if (perItem <= 0) return 0;
//     return Math.floor(clearanceQty / perItem);
//   }, [hasConditions, salesMode, clearanceQty, cutMinimum, cutLength]);

//   // --- Handlers ---
//   const handleCutStep = (delta: number) => {
//     if (!hasConditions || salesMode !== "CUT") return;
//     if (noStock) return; // 👉 สต๊อกหมด ไม่ต้องให้ปรับความยาวได้เลย
//     setCutLength((prev) => {
//       let next = prev + delta;
//       if (next < cutMinimum) next = cutMinimum;

//       // จำกัดไม่ให้ความยาวรวม (length * quantity) เกิน stock
//       if (clearanceQty != null && clearanceQty > 0) {
//         const maxLenForCurrentQty = Math.floor(
//           clearanceQty / Math.max(1, quantity)
//         );
//         if (next > maxLenForCurrentQty) {
//           next = Math.max(cutMinimum, maxLenForCurrentQty);
//         }
//       }
//       return next;
//     });
//   };

//   const handleQuantityChange = (change: number) => {
//     let next = Math.max(1, quantity + change);

//     // กรณี ROLL: จำกัดตามสต๊อกของ roll ที่เลือก
//     if (salesMode === "ROLL" && selectedRollStock != null) {
//       next = Math.min(next, Math.max(0, selectedRollStock));
//     }
//     // กรณีไม่มีเงื่อนไขการขาย: จำกัดตาม clearanceQuantity (จำนวนชิ้น)
//     else if ((!hasConditions || !salesMode) && clearanceQty != null) {
//       next = Math.min(next, Math.max(1, clearanceQty));
//     }
//     // กรณี CUT: จำกัดตาม maxQtyForCut (stock / cutLength)
//     else if (salesMode === "CUT" && maxQtyForCut != null) {
//       next = Math.min(next, Math.max(0, maxQtyForCut));
//     }

//     setQuantity(next);
//   };
//   // ===================================

//   // สต๊อกรวมใช้งานได้หรือไม่ (ใช้ปิดปุ่ม Buy/Add)
//   const isStockAvailable =
//     salesMode === "ROLL"
//       ? selectedRollStock != null && selectedRollStock > 0
//       : clearanceQty == null || clearanceQty > 0;

//   return (
//     <div className="space-y-4">
//       {/* Price */}
//       <div className="space-y-2">
//         <div className="flex flex-wrap items-center gap-3">
//           {visibleParts.price !== false && (
//             <span className="text-2xl md:text-3xl font-bold text-sale">
//               ฿{product.price.toLocaleString()}
//               {hasConditions && salesMode ? ` / ${unit}` : ""}
//             </span>
//           )}
//           {visibleParts.originalPrice !== false && originalPrice && (
//             <span className="text-lg md:text-xl text-muted-foreground line-through">
//               ฿{originalPrice.toLocaleString()}
//             </span>
//           )}
//           {showDiscountBadge && (
//             <Badge className="bg-sale text-sale-foreground text-sm px-3 py-1">
//               ประหยัด {product.discountPercent}%
//             </Badge>
//           )}
//         </div>
//         <p className="text-sm text-muted-foreground">รวม VAT แล้ว</p>
//       </div>

//       {/* Sales Type */}
//       {hasConditions && salesMode && (
//         <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
//           <span className="text-muted-foreground font-medium text-sm md:text-base">
//             ประเภทการขาย:
//           </span>
//           <div className="flex flex-wrap items-center gap-3">
//             <span className="inline-flex items-center rounded-lg border border-muted px-3 py-1.5 text-sm bg-white shadow-sm">
//               {salesMode === "CUT"
//                 ? "ตัดแบ่งขาย (Cut)"
//                 : "ขายยกม้วน (Roll)"}
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Length (CUT) */}
//       {hasConditions && salesMode === "CUT" && (
//         <div className="space-y-2">
//           <div className="sm:flex sm:items-center sm:gap-4">
//             <span className="text-muted-foreground font-medium text-sm md:text-base">
//               ความยาวตัดขาย:
//             </span>
//             <div className="flex items-center gap-3">
//               <span
//                 className="inline-flex items-center rounded-lg border border-muted px-3 py-2 text-sm bg-muted/20"
//                 title="ความยาวที่ตัดขายต่อ 1 รายการ"
//               >
//                 {cutLength.toLocaleString()} {unit}
//               </span>
//               <span className="text-xs text-muted-foreground">
//                 ขั้นต่ำ {cutMinimum.toLocaleString()} {unit}
//               </span>
//             </div>
//           </div>

//           {/* ปุ่มเพิ่ม/ลดตาม stepOptions */}
//           {cutStepOptions.length > 0 && (
//             <div className="sm:flex sm:items-center sm:gap-4">
//               <span className="text-muted-foreground font-medium text-xs md:text-sm">
//                 เพิ่ม/ลดความยาว:
//               </span>
//               <div className="flex flex-wrap items-center gap-2">
//                 {cutStepOptions.map((step) => {
//                   const nextPlus = cutLength + step;
//                   const exceedStock =
//                     clearanceQty != null &&
//                     clearanceQty > 0 &&
//                     nextPlus * quantity > clearanceQty;

//                   return (
//                     <div key={step} className="flex items-center gap-1">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleCutStep(-step)}
//                         disabled={cutLength - step < cutMinimum || noStock}
//                         title={`ลด -${step.toLocaleString()} ${unit}`}
//                       >
//                         -{step.toLocaleString()} {unit}
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleCutStep(step)}
//                         disabled={exceedStock || noStock}
//                         title={`เพิ่ม +${step.toLocaleString()} ${unit}`}
//                       >
//                         +{step.toLocaleString()} {unit}
//                       </Button>
//                     </div>
//                   );
//                 })}
//                 <span className="text-xs text-muted-foreground">
//                   (กดเพิ่ม/ลดจากค่าขั้นต่ำ)
//                 </span>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Length (ROLL) */}
//       {hasConditions && salesMode === "ROLL" && (
//         <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
//           <span className="text-muted-foreground font-medium text-sm md:text-base">
//             ความยาวม้วน:
//           </span>

//           <div className="flex flex-wrap items-center gap-3">
//             {rollPairs.map(({ len, stock }: { len: number; stock: number }) => {
//               const isActive = rollLength === len;
//               const soldOut = stock <= 0;
//               return (
//                 <button
//                   key={len}
//                   onClick={() => !soldOut && setRollLength(len)}
//                   disabled={soldOut}
//                   className={[
//                     "cursor-pointer border rounded-lg px-3 py-2 transition-colors text-sm",
//                     isActive
//                       ? "border-primary text-primary"
//                       : "border-muted hover:bg-muted/50",
//                     soldOut ? "opacity-50 cursor-not-allowed" : "",
//                   ].join(" ")}
//                   title={
//                     soldOut
//                       ? "สินค้าหมด"
//                       : `สต๊อก: ${stock.toLocaleString()} ม้วน`
//                   }
//                 >
//                   {len.toLocaleString()} {unit}
//                   <span className="ml-2 text-xs text-muted-foreground">
//                     ({soldOut ? "หมด" : stock.toLocaleString()})
//                   </span>
//                 </button>
//               );
//             })}
//             <span className="text-sm text-muted-foreground">
//               {rollLength ? `(${rollLength.toLocaleString()} ${unit})` : ""}
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Stock */}
//       <div className="flex items-center gap-2">
//         {salesMode === "ROLL" ? (
//           selectedRollStock != null ? (
//             selectedRollStock > 0 ? (
//               <>
//                 <div className="w-2 h-2 bg-success rounded-full" />
//                 <span className="text-success font-medium">
//                   สต๊อก {selectedRollStock.toLocaleString()} ม้วน (ขนาด{" "}
//                   {rollLength?.toLocaleString()} {unit})
//                 </span>
//               </>
//             ) : (
//               <>
//                 <div className="w-2 h-2 bg-destructive rounded-full" />
//                 <span className="text-destructive font-medium">
//                   ขนาดที่เลือกหมดสต๊อก
//                 </span>
//               </>
//             )
//           ) : (
//             <>
//               <div className="w-2 h-2 bg-muted-foreground rounded-full" />
//               <span className="text-muted-foreground">
//                 เลือกความยาวม้วนเพื่อดูสต๊อก
//               </span>
//             </>
//           )
//         ) : clearanceQty != null && clearanceQty > 0 ? (
//           <>
//             <div className="w-2 h-2 bg-success rounded-full" />
//             <span className="text-success font-medium">
//               มีสินค้าในสต๊อก จำนวน {clearanceQty.toLocaleString()} {unit}
//             </span>
//           </>
//         ) : (
//           <>
//             <div className="w-2 h-2 bg-destructive rounded-full" />
//             <span className="text-destructive font-medium">
//               สินค้าหมด
//             </span>
//           </>
//         )}
//       </div>

//       {/* Quantity & Actions */}
//       <div className="space-y-4">
//         <div className="flex items-center gap-4">
//           <span className="font-medium text-muted-foreground">Quantity:</span>
//           <div className="flex items-center border rounded-lg">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => handleQuantityChange(-1)}
//               className="h-10 w-10 p-0"
//               disabled={quantity <= 1}
//             >
//               <Minus className="h-4 w-4" />
//             </Button>
//             <span className="px-4 py-2 min-w-[3rem] text-center">
//               {quantity}
//             </span>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => handleQuantityChange(1)}
//               className="h-10 w-10 p-0"
//               disabled={
//                 // ROLL: จำกัดตาม selectedRollStock
//                 (salesMode === "ROLL" &&
//                   selectedRollStock != null &&
//                   quantity >= selectedRollStock) ||
//                 // ไม่มีเงื่อนไขการขาย: จำกัดตาม clearanceQty
//                 ((!hasConditions || !salesMode) &&
//                   clearanceQty != null &&
//                   quantity >= clearanceQty) ||
//                 // CUT: จำกัดตาม maxQtyForCut
//                 (salesMode === "CUT" &&
//                   maxQtyForCut != null &&
//                   quantity >= maxQtyForCut)
//               }
//             >
//               <Plus className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         {/* Summary */}
//         <div className="text-sm text-muted-foreground space-y-1">
//           {hasConditions && salesMode ? (
//             <>
//               <div>
//                 ความยาวรวม:{" "}
//                 <span className="font-medium text-foreground">
//                   {totalLength.toLocaleString()} {unit}
//                 </span>
//               </div>
//               <div>
//                 ราคารวม:{" "}
//                 <span className="font-bold text-foreground">
//                   ฿{totalPrice.toLocaleString()}
//                 </span>
//               </div>
//               {salesMode === "ROLL" && selectedRollStock != null && (
//                 <div className="text-xs">
//                   สต๊อกสูงสุดสำหรับขนาดนี้:{" "}
//                   {selectedRollStock.toLocaleString()} ม้วน
//                 </div>
//               )}
//               <div className="text-xs">
//                 ({quantity.toLocaleString()} ×{" "}
//                 {Number(lengthPerItem).toLocaleString()} {unit} × ฿
//                 {Number(product.price).toLocaleString()}/{unit})
//               </div>
//             </>
//           ) : (
//             <>
//               <div>
//                 ราคารวม:{" "}
//                 <span className="font-bold text-foreground">
//                   ฿{totalPrice.toLocaleString()}
//                 </span>
//               </div>
//               <div className="text-xs">
//                 ({quantity.toLocaleString()} × ฿
//                 {Number(product.price).toLocaleString()} / ชิ้น)
//               </div>
//             </>
//           )}
//         </div>

//         <div className="flex gap-3">
//           <Button
//             variant="outline"
//             size="lg"
//             className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
//             onClick={() => router.push("/checkout")}
//             disabled={!isStockAvailable}
//           >
//             Buy Now
//           </Button>
//           <Button
//             size="lg"
//             className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
//             onClick={onAddToCart}
//             disabled={!isStockAvailable}
//           >
//             Add to Cart
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.3 ========================================================

// v.1.1.2 ================================================
// // src/app/product/[id]/component/ProductSalesForm.tsx

// "use client";

// import { useMemo, useState } from "react";
// import { Plus, Minus } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useRouter } from "next/navigation";

// // ***************************************************************
// // ***** แก้ไข Error 2305: Type Placeholder (นำมาแทนการ Import) *****
// // ***************************************************************
// type UIProduct = any;
// type CardPartsVisibility = any;

// // ===== Helpers (ย้ายมาที่นี่) =====
// const getOriginalPrice = (price: number, discountPercent?: number) => {
//   if (!discountPercent || discountPercent <= 0) return undefined;
//   const original = price / (1 - discountPercent / 100);
//   return Math.round(original);
// };
// // ==================================

// interface SalesFormProps {
//   product: UIProduct;
//   visibleParts: CardPartsVisibility;
//   hasConditions: boolean;
//   onAddToCart: () => void;
// }

// export function ProductSalesForm({
//   product,
//   visibleParts,
//   hasConditions,
//   onAddToCart,
// }: SalesFormProps) {
//   const router = useRouter();

//   // Sales Condition State Logic (ย้ายมาที่นี่)
//   const firstCond = hasConditions ? (product.conditions![0] as any) : undefined;
//   const [salesMode] = useState<"CUT" | "ROLL" | null>(
//     () => firstCond?.salesType ?? null
//   );
//   const [unit] = useState<string>(
//     () => (firstCond?.unit ?? product.uom ?? "M.") as string
//   );

//   const originalPrice = useMemo(
//     () => getOriginalPrice(product.price, product.discountPercent),
//     [product.price, product.discountPercent]
//   );
//   const showDiscountBadge =
//     (visibleParts.discountBadge ?? true) && (product.discountPercent ?? 0) > 0;

//   // --- CUT Logic ---
//   const cutCond = (product.conditions ?? []).find(
//     (c: any) => c.salesType === "CUT"
//   ) as any;

//   const cutMinimum =
//     typeof cutCond?.minimumLength === "number" && cutCond.minimumLength > 0
//       ? cutCond.minimumLength
//       : 1;

//   const cutStepOptions: number[] = Array.isArray(cutCond?.cutStepOptions)
//     ? (cutCond!.cutStepOptions as number[])
//     : Array.isArray((cutCond as any)?.stepOptions)
//     ? ((cutCond as any).stepOptions as number[])
//     : [];

//   const [cutLength, setCutLength] = useState<number>(() => cutMinimum);

//   // --- ROLL Logic ---
//   const rollCond = useMemo(() => {
//     return (product?.conditions ?? []).find(
//       (c: any) => c.salesType === "ROLL"
//     ) as any;
//   }, [product]);

//   // 🎯 แก้ไข Error 7006 (Implicit 'any' type) สำหรับ len และ i
//   const rollPairs = useMemo(() => {
//     const lens: number[] = rollCond?.rollLengths ?? [];
//     const stocks: (number | string)[] = rollCond?.rollStocks ?? [];

//     return lens.map((len: number, i: number) => ({
//       len,
//       stock: Number(stocks[i] ?? 0),
//     }));
//   }, [rollCond]);

//   const [rollLength, setRollLength] = useState<number | null>(() => {
//     if (rollCond?.rollLengths?.length) return rollCond.rollLengths[0];
//     return null;
//   });

//   const selectedRollStock = useMemo(() => {
//     if (!rollCond || !rollLength) return null;
//     const idx = (rollCond.rollLengths ?? []).findIndex(
//       (l: number) => l === rollLength
//     );
//     return idx >= 0 ? Number(rollCond.rollStocks?.[idx] ?? 0) : null;
//   }, [rollCond, rollLength]);

//   // --- Quantity & Calculations ---
//   const [quantity, setQuantity] = useState(1);

//   const lengthPerItem = useMemo(() => {
//     if (!hasConditions || !salesMode) return 1;
//     if (salesMode === "CUT") return Math.max(cutMinimum, Number(cutLength));
//     if (salesMode === "ROLL") return Math.max(1, Number(rollLength ?? 1));
//     return 1;
//   }, [hasConditions, salesMode, cutLength, rollLength, cutMinimum]);

//   const totalLength = useMemo(
//     () =>
//       Math.max(1, Number(lengthPerItem)) * Math.max(1, Number(quantity)),
//     [lengthPerItem, quantity]
//   );
//   const totalPrice = useMemo(() => {
//     if (hasConditions && salesMode)
//       return totalLength * Number(product.price ?? 0);
//     return Math.max(1, Number(quantity)) * Number(product.price ?? 0);
//   }, [hasConditions, salesMode, totalLength, quantity, product.price]);

//   // --- Handlers ---
//   const handleCutStep = (delta: number) => {
//     if (!hasConditions || salesMode !== "CUT") return;
//     setCutLength((prev) => {
//       const next = prev + delta;
//       return next < cutMinimum ? cutMinimum : next;
//     });
//   };

//   const handleQuantityChange = (change: number) => {
//     let next = Math.max(1, quantity + change);
//     // กรณี ROLL: จำกัดตามสต๊อกของ roll ที่เลือก
//     if (salesMode === "ROLL" && selectedRollStock != null) {
//       next = Math.min(next, Math.max(0, selectedRollStock));
//     }
//     // กรณีไม่มีเงื่อนไขการขาย (ไม่มี CUT/ROLL): จำกัดตาม clearanceQuantity
//     else if ((!hasConditions || !salesMode) && clearanceQty != null) {
//         next = Math.min(next, Math.max(1, clearanceQty));
//     }

//     setQuantity(next);
//   };
//   // ===================================

//   const isRollStockAvailable =
//     salesMode !== "ROLL" ||
//     (selectedRollStock != null && selectedRollStock > 0);

//   // ✅ ใช้ clearanceQuantity จาก product เพื่อเช็คสต๊อก (กรณีไม่ใช่ ROLL)
//   const rawClearanceQty = (product as any).clearanceQuantity;
//   const clearanceQty =
//     typeof rawClearanceQty === "number"
//       ? rawClearanceQty
//       : rawClearanceQty != null
//       ? Number(rawClearanceQty)
//       : null;

//   return (
//     <div className="space-y-4">
//       {/* Price */}
//       <div className="space-y-2">
//         <div className="flex flex-wrap items-center gap-3">
//           {visibleParts.price !== false && (
//             <span className="text-2xl md:text-3xl font-bold text-sale">
//               ฿{product.price.toLocaleString()}
//               {hasConditions && salesMode ? ` / ${unit}` : ""}
//             </span>
//           )}
//           {visibleParts.originalPrice !== false && originalPrice && (
//             <span className="text-lg md:text-xl text-muted-foreground line-through">
//               ฿{originalPrice.toLocaleString()}
//             </span>
//           )}
//           {showDiscountBadge && (
//             <Badge className="bg-sale text-sale-foreground text-sm px-3 py-1">
//               ประหยัด {product.discountPercent}%
//             </Badge>
//           )}
//         </div>
//         <p className="text-sm text-muted-foreground">รวม VAT แล้ว</p>
//       </div>

//       {/* Sales Type */}
//       {hasConditions && salesMode && (
//         <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
//           <span className="text-muted-foreground font-medium text-sm md:text-base">
//             ประเภทการขาย:
//           </span>
//           <div className="flex flex-wrap items-center gap-3">
//             <span className="inline-flex items-center rounded-lg border border-muted px-3 py-1.5 text-sm bg-white shadow-sm">
//               {salesMode === "CUT"
//                 ? "ตัดแบ่งขาย (Cut)"
//                 : "ขายยกม้วน (Roll)"}
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Length (CUT) */}
//       {hasConditions && salesMode === "CUT" && (
//         <div className="space-y-2">
//           <div className="sm:flex sm:items-center sm:gap-4">
//             <span className="text-muted-foreground font-medium text-sm md:text-base">
//               ความยาวตัดขาย:
//             </span>
//             <div className="flex items-center gap-3">
//               <span
//                 className="inline-flex items-center rounded-lg border border-muted px-3 py-2 text-sm bg-muted/20"
//                 title="ความยาวที่ตัดขายต่อ 1 รายการ"
//               >
//                 {cutLength.toLocaleString()} {unit}
//               </span>
//               <span className="text-xs text-muted-foreground">
//                 ขั้นต่ำ {cutMinimum.toLocaleString()} {unit}
//               </span>
//             </div>
//           </div>

//           {/* ปุ่มเพิ่ม/ลดตาม stepOptions */}
//           {cutStepOptions.length > 0 && (
//             <div className="sm:flex sm:items-center sm:gap-4">
//               <span className="text-muted-foreground font-medium text-xs md:text-sm">
//                 เพิ่ม/ลดความยาว:
//               </span>
//               <div className="flex flex-wrap items-center gap-2">
//                 {cutStepOptions.map((step) => (
//                   <div key={step} className="flex items-center gap-1">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => handleCutStep(-step)}
//                       disabled={cutLength - step < cutMinimum}
//                       title={`ลด -${step.toLocaleString()} ${unit}`}
//                     >
//                       -{step.toLocaleString()} {unit}
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => handleCutStep(step)}
//                       title={`เพิ่ม +${step.toLocaleString()} ${unit}`}
//                     >
//                       +{step.toLocaleString()} {unit}
//                     </Button>
//                   </div>
//                 ))}
//                 <span className="text-xs text-muted-foreground">
//                   (กดเพิ่ม/ลดจากค่าขั้นต่ำ)
//                 </span>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Length (ROLL) */}
//       {hasConditions && salesMode === "ROLL" && (
//         <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
//           <span className="text-muted-foreground font-medium text-sm md:text-base">
//             ความยาวม้วน:
//           </span>

//           <div className="flex flex-wrap items-center gap-3">
//             {rollPairs.map(({ len, stock }: { len: number; stock: number }) => {
//               const isActive = rollLength === len;
//               const soldOut = stock <= 0;
//               return (
//                 <button
//                   key={len}
//                   onClick={() => !soldOut && setRollLength(len)}
//                   disabled={soldOut}
//                   className={[
//                     "cursor-pointer border rounded-lg px-3 py-2 transition-colors text-sm",
//                     isActive
//                       ? "border-primary text-primary"
//                       : "border-muted hover:bg-muted/50",
//                     soldOut ? "opacity-50 cursor-not-allowed" : "",
//                   ].join(" ")}
//                   title={
//                     soldOut
//                       ? "สินค้าหมด"
//                       : `สต๊อก: ${stock.toLocaleString()} ม้วน`
//                   }
//                 >
//                   {len.toLocaleString()} {unit}
//                   <span className="ml-2 text-xs text-muted-foreground">
//                     ({soldOut ? "หมด" : stock.toLocaleString()})
//                   </span>
//                 </button>
//               );
//             })}
//             <span className="text-sm text-muted-foreground">
//               {rollLength ? `(${rollLength.toLocaleString()} {unit})` : ""}
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Stock */}
//       <div className="flex items-center gap-2">
//         {salesMode === "ROLL" ? (
//           selectedRollStock != null ? (
//             selectedRollStock > 0 ? (
//               <>
//                 <div className="w-2 h-2 bg-success rounded-full" />
//                 <span className="text-success font-medium">
//                   สต๊อก {selectedRollStock.toLocaleString()} ม้วน (ขนาด{" "}
//                   {rollLength?.toLocaleString()} {unit})
//                 </span>
//               </>
//             ) : (
//               <>
//                 <div className="w-2 h-2 bg-destructive rounded-full" />
//                 <span className="text-destructive font-medium">
//                   ขนาดที่เลือกหมดสต๊อก
//                 </span>
//               </>
//             )
//           ) : (
//             <>
//               <div className="w-2 h-2 bg-muted-foreground rounded-full" />
//               <span className="text-muted-foreground">
//                 เลือกความยาวม้วนเพื่อดูสต๊อก
//               </span>
//             </>
//           )
//         ) : clearanceQty != null && clearanceQty > 0 ? (
//           <>
//             <div className="w-2 h-2 bg-success rounded-full" />
//             <span className="text-success font-medium">
//               มีสินค้าในสต๊อก จำนวน {clearanceQty.toLocaleString()} {unit}
//             </span>
//           </>
//         ) : (
//           <>
//             <div className="w-2 h-2 bg-destructive rounded-full" />
//             <span className="text-destructive font-medium">
//               สินค้าหมด
//             </span>
//           </>
//         )}
//       </div>

//       {/* Quantity & Actions */}
//       <div className="space-y-4">
//         <div className="flex items-center gap-4">
//           <span className="font-medium text-muted-foreground">Quantity:</span>
//           <div className="flex items-center border rounded-lg">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => handleQuantityChange(-1)}
//               className="h-10 w-10 p-0"
//               disabled={quantity <= 1}
//             >
//               <Minus className="h-4 w-4" />
//             </Button>
//             <span className="px-4 py-2 min-w-[3rem] text-center">
//               {quantity}
//             </span>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => handleQuantityChange(1)}
//               className="h-10 w-10 p-0"
//               disabled={
//                 // ROLL: จำกัดตาม selectedRollStock
//                 (salesMode === "ROLL" &&
//                 selectedRollStock != null &&
//                 quantity >= selectedRollStock) ||
//                 // ไม่มีเงื่อนไขการขาย: จำกัดตาม clearanceQty
//                 ((!hasConditions || !salesMode) &&
//                 clearanceQty != null &&
//                 quantity >= clearanceQty)
//               }
//             >
//               <Plus className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         {/* Summary */}
//         <div className="text-sm text-muted-foreground space-y-1">
//           {hasConditions && salesMode ? (
//             <>
//               <div>
//                 ความยาวรวม:{" "}
//                 <span className="font-medium text-foreground">
//                   {totalLength.toLocaleString()} {unit}
//                 </span>
//               </div>
//               <div>
//                 ราคารวม:{" "}
//                 <span className="font-bold text-foreground">
//                   ฿{totalPrice.toLocaleString()}
//                 </span>
//               </div>
//               {salesMode === "ROLL" && selectedRollStock != null && (
//                 <div className="text-xs">
//                   สต๊อกสูงสุดสำหรับขนาดนี้:{" "}
//                   {selectedRollStock.toLocaleString()} ม้วน
//                 </div>
//               )}
//               <div className="text-xs">
//                 ({quantity.toLocaleString()} ×{" "}
//                 {Number(lengthPerItem).toLocaleString()} {unit} × ฿
//                 {Number(product.price).toLocaleString()}/{unit})
//               </div>
//             </>
//           ) : (
//             <>
//               <div>
//                 ราคารวม:{" "}
//                 <span className="font-bold text-foreground">
//                   ฿{totalPrice.toLocaleString()}
//                 </span>
//               </div>
//               <div className="text-xs">
//                 ({quantity.toLocaleString()} × ฿
//                 {Number(product.price).toLocaleString()} / ชิ้น)
//               </div>
//             </>
//           )}
//         </div>

//         <div className="flex gap-3">
//           <Button
//             variant="outline"
//             size="lg"
//             className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
//             onClick={() => router.push("/checkout")}
//             disabled={!isRollStockAvailable}
//           >
//             Buy Now
//           </Button>
//           <Button
//             size="lg"
//             className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
//             onClick={onAddToCart}
//             disabled={!isRollStockAvailable}
//           >
//             Add to Cart
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.2 ================================================

// // src/app/product/[id]/component/ProductSalesForm.tsx

// "use client";

// import { useMemo, useState } from "react";
// import { Plus, Minus } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useRouter } from "next/navigation";

// // ***************************************************************
// // ***** แก้ไข Error 2305: Type Placeholder (นำมาแทนการ Import) *****
// // ***************************************************************
// type UIProduct = any; 
// type CardPartsVisibility = any; 

// // ===== Helpers (ย้ายมาที่นี่) =====
// const getOriginalPrice = (price: number, discountPercent?: number) => {
//     if (!discountPercent || discountPercent <= 0) return undefined;
//     const original = price / (1 - discountPercent / 100);
//     return Math.round(original);
// };
// // ==================================

// interface SalesFormProps {
//     product: UIProduct;
//     visibleParts: CardPartsVisibility;
//     hasConditions: boolean;
//     onAddToCart: () => void;
// }

// export function ProductSalesForm({
//     product,
//     visibleParts,
//     hasConditions,
//     onAddToCart,
// }: SalesFormProps) {
//     const router = useRouter();
    
//     // Sales Condition State Logic (ย้ายมาที่นี่)
//     const firstCond = hasConditions ? (product.conditions![0] as any) : undefined;
//     const [salesMode] = useState<"CUT" | "ROLL" | null>(
//         () => firstCond?.salesType ?? null
//     );
//     const [unit] = useState<string>(
//         () => (firstCond?.unit ?? product.uom ?? "M.") as string
//     );

//     const originalPrice = useMemo(
//         () => getOriginalPrice(product.price, product.discountPercent),
//         [product.price, product.discountPercent]
//     );
//     const showDiscountBadge =
//         (visibleParts.discountBadge ?? true) && (product.discountPercent ?? 0) > 0;

//     // --- CUT Logic ---
//     const cutCond = (product.conditions ?? []).find(
//         (c: any) => c.salesType === "CUT"
//     ) as any;

//     const cutMinimum =
//         typeof cutCond?.minimumLength === "number" && cutCond.minimumLength > 0
//         ? cutCond.minimumLength
//         : 1;

//     const cutStepOptions: number[] = Array.isArray(cutCond?.cutStepOptions)
//         ? (cutCond!.cutStepOptions as number[])
//         : Array.isArray((cutCond as any)?.stepOptions)
//         ? ((cutCond as any).stepOptions as number[])
//         : [];
    
//     const [cutLength, setCutLength] = useState<number>(() => cutMinimum);

//     // --- ROLL Logic ---
//     const rollCond = useMemo(() => {
//         return (product?.conditions ?? []).find(
//             (c: any) => c.salesType === "ROLL"
//         ) as any;
//     }, [product]);

//     // 🎯 แก้ไข Error 7006 (Implicit 'any' type) สำหรับ len และ i
//     const rollPairs = useMemo(() => {
//         const lens: number[] = rollCond?.rollLengths ?? [];
//         const stocks: (number | string)[] = rollCond?.rollStocks ?? [];
        
//         return lens.map((len: number, i: number) => ({ 
//             len, 
//             stock: Number(stocks[i] ?? 0) 
//         }));
//     }, [rollCond]);

//     const [rollLength, setRollLength] = useState<number | null>(() => {
//         if (rollCond?.rollLengths?.length) return rollCond.rollLengths[0];
//         return null;
//     });

//     const selectedRollStock = useMemo(() => {
//         if (!rollCond || !rollLength) return null;
//         const idx = (rollCond.rollLengths ?? []).findIndex((l: number) => l === rollLength);
//         return idx >= 0 ? Number(rollCond.rollStocks?.[idx] ?? 0) : null;
//     }, [rollCond, rollLength]);

//     // --- Quantity & Calculations ---
//     const [quantity, setQuantity] = useState(1);
    
//     const lengthPerItem = useMemo(() => {
//         if (!hasConditions || !salesMode) return 1;
//         if (salesMode === "CUT") return Math.max(cutMinimum, Number(cutLength));
//         if (salesMode === "ROLL") return Math.max(1, Number(rollLength ?? 1));
//         return 1;
//     }, [hasConditions, salesMode, cutLength, rollLength, cutMinimum]);

//     const totalLength = useMemo(
//         () =>
//             Math.max(1, Number(lengthPerItem)) * Math.max(1, Number(quantity)),
//         [lengthPerItem, quantity]
//     );
//     const totalPrice = useMemo(() => {
//         if (hasConditions && salesMode)
//             return totalLength * Number(product.price ?? 0);
//         return Math.max(1, Number(quantity)) * Number(product.price ?? 0);
//     }, [hasConditions, salesMode, totalLength, quantity, product.price]);

//     // --- Handlers ---
//     const handleCutStep = (delta: number) => {
//         if (!hasConditions || salesMode !== "CUT") return;
//         setCutLength((prev) => {
//             const next = prev + delta;
//             return next < cutMinimum ? cutMinimum : next;
//         });
//     };

//     const handleQuantityChange = (change: number) => {
//         let next = Math.max(1, quantity + change);
//         if (salesMode === "ROLL" && selectedRollStock != null) {
//             next = Math.min(next, Math.max(0, selectedRollStock));
//         }
//         setQuantity(next);
//     };
//     // ===================================
    
//     const isRollStockAvailable = salesMode !== "ROLL" || (selectedRollStock != null && selectedRollStock > 0);

//     return (
//         <div className="space-y-4">
//             {/* Price */}
//             <div className="space-y-2">
//                 <div className="flex flex-wrap items-center gap-3">
//                     {visibleParts.price !== false && (
//                         <span className="text-2xl md:text-3xl font-bold text-sale">
//                             ฿{product.price.toLocaleString()}
//                             {hasConditions && salesMode ? ` / ${unit}` : ""}
//                         </span>
//                     )}
//                     {visibleParts.originalPrice !== false && originalPrice && (
//                         <span className="text-lg md:text-xl text-muted-foreground line-through">
//                             ฿{originalPrice.toLocaleString()}
//                         </span>
//                     )}
//                     {showDiscountBadge && (
//                         <Badge className="bg-sale text-sale-foreground text-sm px-3 py-1">
//                             ประหยัด {product.discountPercent}%
//                         </Badge>
//                     )}
//                 </div>
//                 <p className="text-sm text-muted-foreground">รวม VAT แล้ว</p>
//             </div>

//             {/* Sales Type */}
//             {hasConditions && salesMode && (
//                 <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
//                     <span className="text-muted-foreground font-medium text-sm md:text-base">
//                         ประเภทการขาย:
//                     </span>
//                     <div className="flex flex-wrap items-center gap-3">
//                         <span className="inline-flex items-center rounded-lg border border-muted px-3 py-1.5 text-sm bg-white shadow-sm">
//                             {salesMode === "CUT"
//                                 ? "ตัดแบ่งขาย (Cut)"
//                                 : "ขายยกม้วน (Roll)"}
//                         </span>
//                     </div>
//                 </div>
//             )}

//             {/* Length (CUT) */}
//             {hasConditions && salesMode === "CUT" && (
//                 <div className="space-y-2">
//                     <div className="sm:flex sm:items-center sm:gap-4">
//                         <span className="text-muted-foreground font-medium text-sm md:text-base">
//                             ความยาวตัดขาย:
//                         </span>
//                         <div className="flex items-center gap-3">
//                             <span
//                                 className="inline-flex items-center rounded-lg border border-muted px-3 py-2 text-sm bg-muted/20"
//                                 title="ความยาวที่ตัดขายต่อ 1 รายการ"
//                             >
//                                 {cutLength.toLocaleString()} {unit}
//                             </span>
//                             <span className="text-xs text-muted-foreground">
//                                 ขั้นต่ำ {cutMinimum.toLocaleString()} {unit}
//                             </span>
//                         </div>
//                     </div>

//                     {/* ปุ่มเพิ่ม/ลดตาม stepOptions */}
//                     {cutStepOptions.length > 0 && (
//                         <div className="sm:flex sm:items-center sm:gap-4">
//                             <span className="text-muted-foreground font-medium text-xs md:text-sm">
//                                 เพิ่ม/ลดความยาว:
//                             </span>
//                             <div className="flex flex-wrap items-center gap-2">
//                                 {cutStepOptions.map((step) => (
//                                     <div key={step} className="flex items-center gap-1">
//                                         <Button
//                                             variant="outline"
//                                             size="sm"
//                                             onClick={() => handleCutStep(-step)}
//                                             disabled={cutLength - step < cutMinimum}
//                                             title={`ลด -${step.toLocaleString()} ${unit}`}
//                                         >
//                                             -{step.toLocaleString()} {unit}
//                                         </Button>
//                                         <Button
//                                             variant="outline"
//                                             size="sm"
//                                             onClick={() => handleCutStep(step)}
//                                             title={`เพิ่ม +${step.toLocaleString()} ${unit}`}
//                                         >
//                                             +{step.toLocaleString()} {unit}
//                                         </Button>
//                                     </div>
//                                 ))}
//                                 <span className="text-xs text-muted-foreground">
//                                     (กดเพิ่ม/ลดจากค่าขั้นต่ำ)
//                                 </span>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             )}

//             {/* Length (ROLL) */}
//             {hasConditions && salesMode === "ROLL" && (
//                 <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
//                     <span className="text-muted-foreground font-medium text-sm md:text-base">
//                         ความยาวม้วน:
//                     </span>

//                     <div className="flex flex-wrap items-center gap-3">
//                         {/* 🎯 แก้ไข Error 7031: กำหนด Type ให้กับ len และ stock */}
//                         {rollPairs.map(({ len, stock }: { len: number, stock: number }) => {
//                             const isActive = rollLength === len;
//                             const soldOut = stock <= 0;
//                             return (
//                                 <button
//                                     key={len}
//                                     onClick={() => !soldOut && setRollLength(len)}
//                                     disabled={soldOut}
//                                     className={[
//                                         "cursor-pointer border rounded-lg px-3 py-2 transition-colors text-sm",
//                                         isActive
//                                             ? "border-primary text-primary"
//                                             : "border-muted hover:bg-muted/50",
//                                         soldOut ? "opacity-50 cursor-not-allowed" : "",
//                                     ].join(" ")}
//                                     title={
//                                         soldOut
//                                             ? "สินค้าหมด"
//                                             : `สต๊อก: ${stock.toLocaleString()} ม้วน`
//                                     }
//                                 >
//                                     {len.toLocaleString()} {unit}
//                                     <span className="ml-2 text-xs text-muted-foreground">
//                                         ({soldOut ? "หมด" : stock.toLocaleString()})
//                                     </span>
//                                 </button>
//                             );
//                         })}
//                         <span className="text-sm text-muted-foreground">
//                             {rollLength ? `(${rollLength.toLocaleString()} ${unit})` : ""}
//                         </span>
//                     </div>
//                 </div>
//             )}

//             {/* Stock */}
//             <div className="flex items-center gap-2">
//                 {salesMode === "ROLL" ? (
//                     selectedRollStock != null ? (
//                         selectedRollStock > 0 ? (
//                             <>
//                                 <div className="w-2 h-2 bg-success rounded-full" />
//                                 <span className="text-success font-medium">
//                                     สต๊อก {selectedRollStock.toLocaleString()} ม้วน (ขนาด{" "}
//                                     {rollLength?.toLocaleString()} {unit})
//                                 </span>
//                             </>
//                         ) : (
//                             <>
//                                 <div className="w-2 h-2 bg-destructive rounded-full" />
//                                 <span className="text-destructive font-medium">
//                                     ขนาดที่เลือกหมดสต๊อก
//                                 </span>
//                             </>
//                         )
//                     ) : (
//                         <>
//                             <div className="w-2 h-2 bg-muted-foreground rounded-full" />
//                             <span className="text-muted-foreground">
//                                 เลือกความยาวม้วนเพื่อดูสต๊อก
//                             </span>
//                         </>
//                     )
//                 ) : (
//                     <>
//                         <div className="w-2 h-2 bg-success rounded-full" />
//                         <span className="text-success font-medium">
//                             มีสินค้าในสต๊อก
//                         </span>
//                     </>
//                 )}
//             </div>

//             {/* Quantity & Actions */}
//             <div className="space-y-4">
//                 <div className="flex items-center gap-4">
//                     <span className="font-medium text-muted-foreground">
//                         Quantity:
//                     </span>
//                     <div className="flex items-center border rounded-lg">
//                         <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => handleQuantityChange(-1)}
//                             className="h-10 w-10 p-0"
//                             disabled={quantity <= 1}
//                         >
//                             <Minus className="h-4 w-4" />
//                         </Button>
//                         <span className="px-4 py-2 min-w-[3rem] text-center">
//                             {quantity}
//                         </span>
//                         <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => handleQuantityChange(1)}
//                             className="h-10 w-10 p-0"
//                             disabled={salesMode === "ROLL" && selectedRollStock != null && quantity >= selectedRollStock}
//                         >
//                             <Plus className="h-4 w-4" />
//                         </Button>
//                     </div>
//                 </div>

//                 {/* Summary */}
//                 <div className="text-sm text-muted-foreground space-y-1">
//                     {hasConditions && salesMode ? (
//                         <>
//                             <div>
//                                 ความยาวรวม:{" "}
//                                 <span className="font-medium text-foreground">
//                                     {totalLength.toLocaleString()} {unit}
//                                 </span>
//                             </div>
//                             <div>
//                                 ราคารวม:{" "}
//                                 <span className="font-bold text-foreground">
//                                     ฿{totalPrice.toLocaleString()}
//                                 </span>
//                             </div>
//                             {salesMode === "ROLL" && selectedRollStock != null && (
//                                 <div className="text-xs">
//                                     สต๊อกสูงสุดสำหรับขนาดนี้:{" "}
//                                     {selectedRollStock.toLocaleString()} ม้วน
//                                 </div>
//                             )}
//                             <div className="text-xs">
//                                 ({quantity.toLocaleString()} ×{" "}
//                                 {Number(lengthPerItem).toLocaleString()} {unit} × ฿
//                                 {Number(product.price).toLocaleString()}/{unit})
//                             </div>
//                         </>
//                     ) : (
//                         <>
//                             <div>
//                                 ราคารวม:{" "}
//                                 <span className="font-bold text-foreground">
//                                     ฿{totalPrice.toLocaleString()}
//                                 </span>
//                             </div>
//                             <div className="text-xs">
//                                 ({quantity.toLocaleString()} × ฿
//                                 {Number(product.price).toLocaleString()} / ชิ้น)
//                             </div>
//                         </>
//                     )}
//                 </div>

//                 <div className="flex gap-3">
//                     <Button
//                         variant="outline"
//                         size="lg"
//                         className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
//                         onClick={() => router.push("/checkout")}
//                         disabled={!isRollStockAvailable}
//                     >
//                         Buy Now
//                     </Button>
//                     <Button
//                         size="lg"
//                         className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
//                         onClick={onAddToCart}
//                         disabled={!isRollStockAvailable}
//                     >
//                         Add to Cart
//                     </Button>
//                 </div>
//             </div>
//         </div>
//     );
// }
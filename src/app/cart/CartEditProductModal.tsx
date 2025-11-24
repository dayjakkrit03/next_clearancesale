// v.1.1.9 ==================================================
// src/app/cart/CartEditProductModal.tsx

"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useProductSalesForm } from "@/app/product/[id]/component/useProductSalesForm";
import { PriceSection } from "@/app/product/[id]/component/PriceSection";
import { CutSection } from "@/app/product/[id]/component/CutSection";
import { RollSection } from "@/app/product/[id]/component/RollSection";

import type {
  UIProduct,
  CardPartsVisibility,
} from "@/app/api/mock/products/_store";
import type { UICartItem } from "@/components/use-shopping-cart-panel";

import { useToast } from "@/components/ui/use-toast";

/* config ส่วนที่โชว์ใน Modal ตอนแก้ไข */
const EDIT_VISIBLE_PARTS: CardPartsVisibility = {
  image: true,
  name: true,
  category: true,

  price: true,
  originalPrice: true,
  discountBadge: true,
  brandName: true,
  sku: true,
  uom: true,
  ratingReview: false,
  frame: false,
  brandLogo: false,
};

export type CartEditProductModalProps = {
  open: boolean;
  onClose: () => void;
  item: UICartItem; // ✅ ไม่รับ null แล้ว
  onUpdated?: (payload: { id: number; quantityForCart: number }) => void;
};

export function CartEditProductModal({
  open,
  onClose,
  item,
  onUpdated,
}: CartEditProductModalProps) {
  const [saving, setSaving] = useState(false);

  // ----- เตรียม conditions จาก cart -----
  const productConditions: any[] = Array.isArray((item as any).conditions)
    ? ((item as any).conditions as any[])
    : Array.isArray((item as any).productConditions)
    ? ((item as any).productConditions as any[])
    : [];

  const firstCond = productConditions[0];
  const salesTypeRaw = firstCond?.salesType ?? firstCond?.type;
  const initialSalesMode: "CUT" | "ROLL" | null = salesTypeRaw
    ? String(salesTypeRaw).toUpperCase() === "ROLL"
      ? "ROLL"
      : "CUT"
    : null;

  const isCutProduct = initialSalesMode === "CUT";
  const isRollProduct = initialSalesMode === "ROLL";

  // ประกอบเป็น UIProduct เต็ม ๆ เพื่อส่งเข้า useProductSalesForm
  const productForForm: UIProduct = {
    id: item.id ?? 0,
    order: 0,
    name: item.name ?? "",
    brand: item.brand ?? undefined,
    sku: item.sku ?? "",
    price: item.price ?? 0,
    discountPercent: item.discountPercent ?? undefined,
    uom: item.uom ?? undefined,
    image_url: item.image ?? "/placeholder.png",

    conditions: productConditions,

    clearanceQuantity:
      (item as any).clearanceQuantity != null
        ? Number((item as any).clearanceQuantity)
        : undefined,
  };

  const hasConditions =
    Array.isArray(productForForm.conditions) &&
    productForForm.conditions.length > 0;

  // ----- options สำหรับ useProductSalesForm -----
  const formOptions: any = {};
  const cartQty = item.quantity != null ? Number(item.quantity) : 1;

  if (isCutProduct) {
    formOptions.initialQuantity = 1;
    formOptions.initialCutLength = cartQty;
  } else if (isRollProduct) {
    formOptions.initialQuantity = 1;
    formOptions.initialRollLength = cartQty;
  } else {
    formOptions.initialQuantity = cartQty;
  }

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
  } = useProductSalesForm(
    productForForm,
    EDIT_VISIBLE_PARTS,
    hasConditions,
    formOptions,
  );

  const isCutMode = hasConditions && salesMode === "CUT";

  const { toast } = useToast();

  // ===== Handler: บันทึกการแก้ไข =====
  const handleSave = async () => {
    if (!isStockAvailable) return;

    const quantityForCart =
      hasConditions && salesMode
        ? Number(totalLength) // CUT / ROLL = ความยาวรวม
        : Number(quantity); // สินค้าปกติ = จำนวนชิ้น

    const priceAmount = Number(totalPrice);

    try {
      setSaving(true);

      const res = await fetch("/api/cart/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          quantity: quantityForCart,
          priceAmount,
        }),
      });

      if (!res.ok) {
        console.error("[CartEditProductModal] update API failed", res.status);
        alert("บันทึกการแก้ไขไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        return;
      }

      const json = await res.json().catch(() => null);
      if (!json || json.status !== "ok") {
        console.error("[CartEditProductModal] update API error payload", json);
        alert("บันทึกการแก้ไขไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        return;
      }

       // ✅ แสดง Toast แจ้งเตือน
      toast({
        title: "บันทึกสำเร็จ",
        description: "อัปเดตรายการสินค้าในตะกร้าเรียบร้อยแล้ว",
      });

      onUpdated?.({ id: item.id, quantityForCart });

      onClose();
    } catch (e) {
      console.error("[CartEditProductModal] update error", e);
      alert("เกิดข้อผิดพลาดขณะบันทึกการแก้ไข");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-base md:text-lg">
            แก้ไขรายการสินค้า: {item.name ?? "-"}
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            ปรับจำนวนสินค้า ความยาวสาย หรือเงื่อนไขการขาย แล้วบันทึกการแก้ไขรายการนี้
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* รูป + ชื่อสินค้า + ราคา */}
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 object-cover rounded border"
            />

            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="font-semibold text-sm line-clamp-2">
                {item.name}
              </h3>
              <div className="text-[11px] text-muted-foreground">
                SKU: {item.sku}
              </div>
              {item.brand && (
                <div className="text-[11px] text-muted-foreground">
                  Brand: {item.brand}
                </div>
              )}

              <PriceSection
                product={productForForm}
                visibleParts={EDIT_VISIBLE_PARTS}
                hasConditions={hasConditions}
                salesMode={salesMode}
                unit={unit}
                originalPrice={originalPrice}
                showDiscountBadge={showDiscountBadge}
              />
            </div>
          </div>

          {/* โซน CUT / ROLL */}
          {hasConditions && salesMode && (
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-muted-foreground font-medium text-sm">
                  ประเภทการขาย:
                </span>
                <div className="inline-flex items-center rounded-lg border border-muted px-3 py-1.5 text-sm bg-white">
                  {salesMode === "CUT"
                    ? "ตัดแบ่งขาย (Cut)"
                    : "ขายยกม้วน (Roll)"}
                </div>
              </div>

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

              <RollSection
                hasConditions={hasConditions}
                salesMode={salesMode}
                rollPairs={rollPairs}
                rollLength={rollLength}
                unit={unit}
                setRollLength={setRollLength}
              />
            </div>
          )}

          {/* สรุปสต๊อก + ยอดรวม */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {salesMode === "ROLL" ? (
                selectedRollStock != null ? (
                  selectedRollStock > 0 ? (
                    <>
                      <div className="w-2 h-2 bg-success rounded-full" />
                      <span className="text-success font-medium">
                        สต๊อก {Number(selectedRollStock).toLocaleString()} ม้วน
                        {rollLength &&
                          ` (ขนาด ${Number(rollLength).toLocaleString()} ${unit})`}
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
                    <span>เลือกความยาวม้วนเพื่อดูสต๊อก</span>
                  </>
                )
              ) : clearanceQty != null ? (
                clearanceQty > 0 ? (
                  <>
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <span className="text-success font-medium">
                      มีสินค้าในสต๊อก {Number(clearanceQty).toLocaleString()}{" "}
                      {unit}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-destructive rounded-full" />
                    <span className="text-destructive font-medium">
                      สินค้าหมด
                    </span>
                  </>
                )
              ) : (
                <>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                  <span className="text-muted-foreground">
                    สินค้า Clearance กรุณาตรวจสอบจำนวนคงเหลือกับพนักงานขาย
                  </span>
                </>
              )}
            </div>

            {hasConditions && salesMode ? (
              <>
                <div>
                  ความยาวรวม:{" "}
                  <span className="font-medium text-foreground">
                    {Number(totalLength).toLocaleString()} {unit}
                  </span>
                </div>
                <div>
                  ราคารวม:{" "}
                  <span className="font-bold text-foreground">
                    ฿{Number(totalPrice).toLocaleString()}
                  </span>
                </div>
                <div className="text-xs">
                  ({Number(quantity).toLocaleString()} ×{" "}
                  {Number(lengthPerItem).toLocaleString()} {unit} × ฿
                  {Number(productForForm.price).toLocaleString()}/{unit})
                </div>
              </>
            ) : (
              <>
                <div>
                  ราคารวม:{" "}
                  <span className="font-bold text-foreground">
                    ฿{Number(totalPrice).toLocaleString()}
                  </span>
                </div>
                <div className="text-xs">
                  ({Number(quantity).toLocaleString()} × ฿
                  {Number(productForForm.price).toLocaleString()} / ชิ้น)
                </div>
              </>
            )}
          </div>

          {/* ปุ่มปรับจำนวนสำหรับ case ปกติ */}
          {(!hasConditions || !isCutMode) && (
            <div className="flex items-center gap-4">
              <span className="font-medium text-muted-foreground text-sm">
                Quantity:
              </span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="px-4 py-2 min-w-[3rem] text-center">
                  {Number(quantity).toLocaleString()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => handleQuantityChange(1)}
                  disabled={!isStockAvailable}
                >
                  +
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            ยกเลิก
          </Button>
          <Button
            disabled={!isStockAvailable || saving}
            onClick={handleSave}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// v.1.1.9 ==================================================

// v.1.1.8 ===================================================
// // src/app/cart/CartEditProductModal.tsx

// "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";

// import { useProductSalesForm } from "@/app/product/[id]/component/useProductSalesForm";
// import { PriceSection } from "@/app/product/[id]/component/PriceSection";
// import { CutSection } from "@/app/product/[id]/component/CutSection";
// import { RollSection } from "@/app/product/[id]/component/RollSection";

// import type {
//   UIProduct,
//   CardPartsVisibility,
// } from "@/app/api/mock/products/_store";
// import type { UICartItem } from "@/components/use-shopping-cart-panel";

// import { useState } from "react";

// /* config ส่วนที่โชว์ใน Modal ตอนแก้ไข */
// const EDIT_VISIBLE_PARTS: CardPartsVisibility = {
//   image: true,
//   name: true,
//   category: true,

//   price: true,
//   originalPrice: true,
//   discountBadge: true,
//   brandName: true,
//   sku: true,
//   uom: true,
//   ratingReview: false,
//   frame: false,
//   brandLogo: false,
// };

// export type CartEditProductModalProps = {
//   open: boolean;
//   onClose: () => void;
//   item: UICartItem | null;
//   /** callback แจ้งให้หน้า cart อัปเดต state หลังบันทึกสำเร็จ */
//   onUpdated?: (payload: { id: number; quantityForCart: number }) => void;
// };

// export function CartEditProductModal({
//   open,
//   onClose,
//   item,
//   onUpdated,
// }: CartEditProductModalProps) {
//   const [saving, setSaving] = useState(false);

//   // ถ้ายังไม่มี item (ช่วงเปิด modal ครั้งแรก) ให้แสดงข้อความสั้น ๆ กัน error
//   if (!item) {
//     return (
//       <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
//         <DialogContent className="max-w-xl">
//           <DialogHeader>
//             <DialogTitle className="text-base md:text-lg">
//               แก้ไขรายการสินค้า
//             </DialogTitle>
//           </DialogHeader>
//           <p className="text-sm text-muted-foreground">
//             ไม่พบข้อมูลสินค้าในตะกร้า
//           </p>
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   // ----- เตรียม conditions จาก cart -----
//   const productConditions: any[] = Array.isArray((item as any).conditions)
//     ? ((item as any).conditions as any[])
//     : Array.isArray((item as any).productConditions)
//     ? ((item as any).productConditions as any[])
//     : [];

//   const firstCond = productConditions[0];
//   const salesTypeRaw = firstCond?.salesType ?? firstCond?.type;
//   const initialSalesMode: "CUT" | "ROLL" | null = salesTypeRaw
//     ? String(salesTypeRaw).toUpperCase() === "ROLL"
//       ? "ROLL"
//       : "CUT"
//     : null;

//   const isCutProduct = initialSalesMode === "CUT";
//   const isRollProduct = initialSalesMode === "ROLL";

//   // ประกอบเป็น UIProduct เต็ม ๆ เพื่อส่งเข้า useProductSalesForm
//   const productForForm: UIProduct = {
//     id: item.id ?? 0,
//     order: 0,
//     name: item.name ?? "",
//     brand: item.brand ?? undefined,
//     sku: item.sku ?? "",
//     price: item.price ?? 0,
//     discountPercent: item.discountPercent ?? undefined,
//     uom: item.uom ?? undefined,
//     image_url: item.image ?? "/placeholder.png",

//     conditions: productConditions,

//     // clearanceQuantity ให้เป็น number | undefined ตาม type
//     clearanceQuantity:
//       (item as any).clearanceQuantity != null
//         ? Number((item as any).clearanceQuantity)
//         : undefined,
//   };

//   const hasConditions =
//     Array.isArray(productForForm.conditions) &&
//     productForForm.conditions.length > 0;

//   // ----- options สำหรับ useProductSalesForm -----
//   const formOptions: any = {
//     initialSalesMode,
//   };

//   const cartQty = item.quantity != null ? Number(item.quantity) : 1;

//   if (isCutProduct) {
//     formOptions.initialQuantity = 1;
//     formOptions.initialCutLength = cartQty;
//   } else if (isRollProduct) {
//     formOptions.initialQuantity = 1;
//     formOptions.initialRollLength = cartQty;
//   } else {
//     formOptions.initialQuantity = cartQty;
//   }

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
//   } = useProductSalesForm(
//     productForForm,
//     EDIT_VISIBLE_PARTS,
//     hasConditions,
//     formOptions,
//   );

//   const isCutMode = hasConditions && salesMode === "CUT";

//   // ===== Handler: บันทึกการแก้ไข =====
//   const handleSave = async () => {
//     if (!isStockAvailable) return;

//     // จำนวนที่ต้องเก็บลงใน cart.quantity
//     const quantityForCart =
//       hasConditions && salesMode
//         ? Number(totalLength) // CUT / ROLL → เก็บเป็นความยาวรวม
//         : Number(quantity); // ปกติ → จำนวนชิ้น

//     const priceAmount = Number(totalPrice);

//     try {
//       setSaving(true);

//       const res = await fetch("/api/cart/update", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           id: item.id,
//           quantity: quantityForCart,
//           priceAmount,
//         }),
//       });

//       if (!res.ok) {
//         console.error("[CartEditProductModal] update API failed", res.status);
//         alert("บันทึกการแก้ไขไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
//         return;
//       }

//       const json = await res.json().catch(() => null);
//       if (!json || json.status !== "ok") {
//         console.error("[CartEditProductModal] update API error payload", json);
//         alert("บันทึกการแก้ไขไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
//         return;
//       }

//       // อัปเดต UI ในหน้า cart
//       onUpdated?.({ id: item.id, quantityForCart });

//       onClose();
//     } catch (e) {
//       console.error("[CartEditProductModal] update error", e);
//       alert("เกิดข้อผิดพลาดขณะบันทึกการแก้ไข");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
//       <DialogContent className="max-w-xl">
//         <DialogHeader>
//           <DialogTitle className="text-base md:text-lg">
//             แก้ไขรายการสินค้า: {item.name ?? "-"}
//           </DialogTitle>
//           <DialogDescription className="text-xs md:text-sm">
//             ปรับจำนวนสินค้า ความยาวสาย หรือเงื่อนไขการขาย แล้วบันทึกการแก้ไขรายการนี้
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-4">
//           {/* รูป + ชื่อสินค้า + ราคา */}
//           <div className="flex items-start gap-3">
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img
//               src={item.image}
//               alt={item.name}
//               className="w-20 h-20 object-cover rounded border"
//             />

//             <div className="flex-1 min-w-0 space-y-1">
//               <h3 className="font-semibold text-sm line-clamp-2">
//                 {item.name}
//               </h3>
//               <div className="text-[11px] text-muted-foreground">
//                 SKU: {item.sku}
//               </div>
//               {item.brand && (
//                 <div className="text-[11px] text-muted-foreground">
//                   Brand: {item.brand}
//                 </div>
//               )}

//               <PriceSection
//                 product={productForForm}
//                 visibleParts={EDIT_VISIBLE_PARTS}
//                 hasConditions={hasConditions}
//                 salesMode={salesMode}
//                 unit={unit}
//                 originalPrice={originalPrice}
//                 showDiscountBadge={showDiscountBadge}
//               />
//             </div>
//           </div>

//           {/* โซน CUT / ROLL */}
//           {hasConditions && salesMode && (
//             <div className="space-y-3">
//               <div className="space-y-1">
//                 <span className="text-muted-foreground font-medium text-sm">
//                   ประเภทการขาย:
//                 </span>
//                 <div className="inline-flex items-center rounded-lg border border-muted px-3 py-1.5 text-sm bg-white">
//                   {salesMode === "CUT"
//                     ? "ตัดแบ่งขาย (Cut)"
//                     : "ขายยกม้วน (Roll)"}
//                 </div>
//               </div>

//               {/* CUT: ปุ่มความยาวแบบหน้า detail */}
//               <CutSection
//                 hasConditions={hasConditions}
//                 salesMode={salesMode}
//                 cutMinimum={cutMinimum}
//                 cutStepOptions={cutStepOptions}
//                 cutLength={cutLength}
//                 unit={unit}
//                 clearanceQty={clearanceQty}
//                 quantity={quantity}
//                 noStock={noStock}
//                 handleCutStep={handleCutStep}
//               />

//               {/* ROLL: เลือกขนาดม้วน */}
//               <RollSection
//                 hasConditions={hasConditions}
//                 salesMode={salesMode}
//                 rollPairs={rollPairs}
//                 rollLength={rollLength}
//                 unit={unit}
//                 setRollLength={setRollLength}
//               />
//             </div>
//           )}

//           {/* สรุปสต๊อก + ยอดรวม */}
//           <div className="space-y-2 text-sm text-muted-foreground">
//             <div className="flex items-center gap-2">
//               {salesMode === "ROLL" ? (
//                 selectedRollStock != null ? (
//                   selectedRollStock > 0 ? (
//                     <>
//                       <div className="w-2 h-2 bg-success rounded-full" />
//                       <span className="text-success font-medium">
//                         สต๊อก {Number(selectedRollStock).toLocaleString()} ม้วน
//                         {rollLength &&
//                           ` (ขนาด ${Number(rollLength).toLocaleString()} ${unit})`}
//                       </span>
//                     </>
//                   ) : (
//                     <>
//                       <div className="w-2 h-2 bg-destructive rounded-full" />
//                       <span className="text-destructive font-medium">
//                         ขนาดที่เลือกหมดสต๊อก
//                       </span>
//                     </>
//                   )
//                 ) : (
//                   <>
//                     <div className="w-2 h-2 bg-muted-foreground rounded-full" />
//                     <span>เลือกความยาวม้วนเพื่อดูสต๊อก</span>
//                   </>
//                 )
//               ) : clearanceQty != null ? (
//                 clearanceQty > 0 ? (
//                   <>
//                     <div className="w-2 h-2 bg-success rounded-full" />
//                     <span className="text-success font-medium">
//                       มีสินค้าในสต๊อก {Number(clearanceQty).toLocaleString()}{" "}
//                       {unit}
//                     </span>
//                   </>
//                 ) : (
//                   <>
//                     <div className="w-2 h-2 bg-destructive rounded-full" />
//                     <span className="text-destructive font-medium">
//                       สินค้าหมด
//                     </span>
//                   </>
//                 )
//               ) : (
//                 <>
//                   <div className="w-2 h-2 bg-muted-foreground rounded-full" />
//                   <span className="text-muted-foreground">
//                     สินค้า Clearance กรุณาตรวจสอบจำนวนคงเหลือกับพนักงานขาย
//                   </span>
//                 </>
//               )}
//             </div>

//             {hasConditions && salesMode ? (
//               <>
//                 <div>
//                   ความยาวรวม:{" "}
//                   <span className="font-medium text-foreground">
//                     {Number(totalLength).toLocaleString()} {unit}
//                   </span>
//                 </div>
//                 <div>
//                   ราคารวม:{" "}
//                   <span className="font-bold text-foreground">
//                     ฿{Number(totalPrice).toLocaleString()}
//                   </span>
//                 </div>
//                 <div className="text-xs">
//                   ({Number(quantity).toLocaleString()} ×{" "}
//                   {Number(lengthPerItem).toLocaleString()} {unit} × ฿
//                   {Number(productForForm.price).toLocaleString()}/{unit})
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div>
//                   ราคารวม:{" "}
//                   <span className="font-bold text-foreground">
//                     ฿{Number(totalPrice).toLocaleString()}
//                   </span>
//                 </div>
//                 <div className="text-xs">
//                   ({Number(quantity).toLocaleString()} × ฿
//                   {Number(productForForm.price).toLocaleString()} / ชิ้น)
//                 </div>
//               </>
//             )}
//           </div>

//           {/* ปุ่มปรับจำนวน
//               🔹 ถ้าเป็น CUT ที่มี conditions → ไม่ต้องมีปุ่ม +/- (ควบคุมด้วย CutSection แทน)
//               🔹 ถ้าเป็น ROLL หรือสินค้าไม่มี conditions → ใช้ +/- ตามปกติ
//           */}
//           {(!hasConditions || !isCutMode) && (
//             <div className="flex items-center gap-4">
//               <span className="font-medium text-muted-foreground text-sm">
//                 Quantity:
//               </span>
//               <div className="flex items-center border rounded-lg">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="h-9 w-9 p-0"
//                   onClick={() => handleQuantityChange(-1)}
//                   disabled={quantity <= 1}
//                 >
//                   -
//                 </Button>
//                 <span className="px-4 py-2 min-w-[3rem] text-center">
//                   {Number(quantity).toLocaleString()}
//                 </span>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="h-9 w-9 p-0"
//                   onClick={() => handleQuantityChange(1)}
//                   disabled={!isStockAvailable}
//                 >
//                   +
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>

//         <DialogFooter className="mt-4">
//           <Button variant="outline" onClick={onClose} disabled={saving}>
//             ยกเลิก
//           </Button>
//           <Button
//             disabled={!isStockAvailable || saving}
//             onClick={handleSave}
//           >
//             {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// v.1.1.8 ===================================================

// v.1.1.7 =================================================
// // src/app/cart/CartEditProductModal.tsx

// "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";

// import { useProductSalesForm } from "@/app/product/[id]/component/useProductSalesForm";
// import { PriceSection } from "@/app/product/[id]/component/PriceSection";
// import { CutSection } from "@/app/product/[id]/component/CutSection";
// import { RollSection } from "@/app/product/[id]/component/RollSection";

// import type {
//   UIProduct,
//   CardPartsVisibility,
// } from "@/app/api/mock/products/_store";
// import type { UICartItem } from "@/components/use-shopping-cart-panel";

// /* config ส่วนที่โชว์ใน Modal ตอนแก้ไข */
// const EDIT_VISIBLE_PARTS: CardPartsVisibility = {
//   image: true,
//   name: true,
//   category: true,

//   price: true,
//   originalPrice: true,
//   discountBadge: true,
//   brandName: true,
//   sku: true,
//   uom: true,
//   ratingReview: false,
//   frame: false,
//   brandLogo: false,
// };

// export type CartEditProductModalProps = {
//   open: boolean;
//   onClose: () => void;
//   item: UICartItem | null;
// };

// export function CartEditProductModal({
//   open,
//   onClose,
//   item,
// }: CartEditProductModalProps) {
//   // ถ้ายังไม่มี item (ช่วงเปิด modal ครั้งแรก) ให้แสดงข้อความสั้น ๆ กัน error
//   if (!item) {
//     return (
//       <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
//         <DialogContent className="max-w-xl">
//           <DialogHeader>
//             <DialogTitle className="text-base md:text-lg">
//               แก้ไขรายการสินค้า
//             </DialogTitle>
//           </DialogHeader>
//           <p className="text-sm text-muted-foreground">
//             ไม่พบข้อมูลสินค้าในตะกร้า
//           </p>
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   // ----- เตรียม conditions จาก cart -----
//   const productConditions: any[] = Array.isArray((item as any).conditions)
//     ? ((item as any).conditions as any[])
//     : Array.isArray((item as any).productConditions)
//     ? ((item as any).productConditions as any[])
//     : [];

//   const firstCond = productConditions[0];
//   const salesTypeRaw = firstCond?.salesType ?? firstCond?.type;
//   const initialSalesMode: "CUT" | "ROLL" | null = salesTypeRaw
//     ? String(salesTypeRaw).toUpperCase() === "ROLL"
//       ? "ROLL"
//       : "CUT"
//     : null;

//   const isCutProduct = initialSalesMode === "CUT";
//   const isRollProduct = initialSalesMode === "ROLL";

//   // ประกอบเป็น UIProduct เต็ม ๆ เพื่อส่งเข้า useProductSalesForm
//   const productForForm: UIProduct = {
//     id: item.id ?? 0,
//     order: 0,
//     name: item.name ?? "",
//     brand: item.brand ?? undefined,
//     sku: item.sku ?? "",
//     price: item.price ?? 0,
//     discountPercent: item.discountPercent ?? undefined,
//     uom: item.uom ?? undefined,
//     image_url: item.image ?? "/placeholder.png",

//     conditions: productConditions,

//     // clearanceQuantity ให้เป็น number | undefined ตาม type
//     clearanceQuantity:
//       (item as any).clearanceQuantity != null
//         ? Number((item as any).clearanceQuantity)
//         : undefined,
//   };

//   const hasConditions =
//     Array.isArray(productForForm.conditions) &&
//     productForForm.conditions.length > 0;

//   // ----- options สำหรับ useProductSalesForm -----
//   // CUT:   quantity = 1, cutLength = item.quantity (เช่น 210 M.)
//   // ROLL:  quantity = 1, rollLength = item.quantity (เช่น 2000 M.)
//   // normal: ใช้ quantity ตาม cart
//   const formOptions: any = {
//     initialSalesMode,
//   };

//   const cartQty = item.quantity != null ? Number(item.quantity) : 1;

//   if (isCutProduct) {
//     formOptions.initialQuantity = 1;
//     formOptions.initialCutLength = cartQty;
//   } else if (isRollProduct) {
//     formOptions.initialQuantity = 1;
//     formOptions.initialRollLength = cartQty;
//   } else {
//     formOptions.initialQuantity = cartQty;
//   }

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
//   } = useProductSalesForm(
//     productForForm,
//     EDIT_VISIBLE_PARTS,
//     hasConditions,
//     formOptions,
//   );

//   return (
//     <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
//       <DialogContent className="max-w-xl">
//         <DialogHeader>
//           <DialogTitle className="text-base md:text-lg">
//             แก้ไขรายการสินค้า: {item.name ?? "-"}
//           </DialogTitle>
//           <DialogDescription className="text-xs md:text-sm">
//             ปรับจำนวนสินค้า ความยาวสาย หรือเงื่อนไขการขาย แล้วบันทึกการแก้ไขรายการนี้
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-4">
//           {/* รูป + ชื่อสินค้า + ราคา */}
//           <div className="flex items-start gap-3">
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img
//               src={item.image}
//               alt={item.name}
//               className="w-20 h-20 object-cover rounded border"
//             />

//             <div className="flex-1 min-w-0 space-y-1">
//               <h3 className="font-semibold text-sm line-clamp-2">
//                 {item.name}
//               </h3>
//               <div className="text-[11px] text-muted-foreground">
//                 SKU: {item.sku}
//               </div>
//               {item.brand && (
//                 <div className="text-[11px] text-muted-foreground">
//                   Brand: {item.brand}
//                 </div>
//               )}

//               <PriceSection
//                 product={productForForm}
//                 visibleParts={EDIT_VISIBLE_PARTS}
//                 hasConditions={hasConditions}
//                 salesMode={salesMode}
//                 unit={unit}
//                 originalPrice={originalPrice}
//                 showDiscountBadge={showDiscountBadge}
//               />
//             </div>
//           </div>

//           {/* โซน CUT / ROLL */}
//           {hasConditions && salesMode && (
//             <div className="space-y-3">
//               <div className="space-y-1">
//                 <span className="text-muted-foreground font-medium text-sm">
//                   ประเภทการขาย:
//                 </span>
//                 <div className="inline-flex items-center rounded-lg border border-muted px-3 py-1.5 text-sm bg-white">
//                   {salesMode === "CUT"
//                     ? "ตัดแบ่งขาย (Cut)"
//                     : "ขายยกม้วน (Roll)"}
//                 </div>
//               </div>

//               {/* CUT: ปุ่มความยาวแบบหน้า detail */}
//               <CutSection
//                 hasConditions={hasConditions}
//                 salesMode={salesMode}
//                 cutMinimum={cutMinimum}
//                 cutStepOptions={cutStepOptions}
//                 cutLength={cutLength}
//                 unit={unit}
//                 clearanceQty={clearanceQty}
//                 quantity={quantity}
//                 noStock={noStock}
//                 handleCutStep={handleCutStep}
//               />

//               {/* ROLL: เลือกขนาดม้วน */}
//               <RollSection
//                 hasConditions={hasConditions}
//                 salesMode={salesMode}
//                 rollPairs={rollPairs}
//                 rollLength={rollLength}
//                 unit={unit}
//                 setRollLength={setRollLength}
//               />
//             </div>
//           )}

//           {/* สรุปสต๊อก + ยอดรวม */}
//           <div className="space-y-2 text-sm text-muted-foreground">
//             <div className="flex items-center gap-2">
//               {salesMode === "ROLL" ? (
//                 selectedRollStock != null ? (
//                   selectedRollStock > 0 ? (
//                     <>
//                       <div className="w-2 h-2 bg-success rounded-full" />
//                       <span className="text-success font-medium">
//                         สต๊อก {Number(selectedRollStock).toLocaleString()} ม้วน
//                         {rollLength &&
//                           ` (ขนาด ${Number(rollLength).toLocaleString()} ${unit})`}
//                       </span>
//                     </>
//                   ) : (
//                     <>
//                       <div className="w-2 h-2 bg-destructive rounded-full" />
//                       <span className="text-destructive font-medium">
//                         ขนาดที่เลือกหมดสต๊อก
//                       </span>
//                     </>
//                   )
//                 ) : (
//                   <>
//                     <div className="w-2 h-2 bg-muted-foreground rounded-full" />
//                     <span>เลือกความยาวม้วนเพื่อดูสต๊อก</span>
//                   </>
//                 )
//               ) : clearanceQty != null ? (
//                 clearanceQty > 0 ? (
//                   <>
//                     <div className="w-2 h-2 bg-success rounded-full" />
//                     <span className="text-success font-medium">
//                       มีสินค้าในสต๊อก {Number(clearanceQty).toLocaleString()}{" "}
//                       {unit}
//                     </span>
//                   </>
//                 ) : (
//                   <>
//                     <div className="w-2 h-2 bg-destructive rounded-full" />
//                     <span className="text-destructive font-medium">
//                       สินค้าหมด
//                     </span>
//                   </>
//                 )
//               ) : (
//                 <>
//                   <div className="w-2 h-2 bg-muted-foreground rounded-full" />
//                   <span className="text-muted-foreground">
//                     สินค้า Clearance กรุณาตรวจสอบจำนวนคงเหลือกับพนักงานขาย
//                   </span>
//                 </>
//               )}
//             </div>

//             {hasConditions && salesMode ? (
//               <>
//                 <div>
//                   ความยาวรวม:{" "}
//                   <span className="font-medium text-foreground">
//                     {Number(totalLength).toLocaleString()} {unit}
//                   </span>
//                 </div>
//                 <div>
//                   ราคารวม:{" "}
//                   <span className="font-bold text-foreground">
//                     ฿{Number(totalPrice).toLocaleString()}
//                   </span>
//                 </div>
//                 <div className="text-xs">
//                   ({Number(quantity).toLocaleString()} ×{" "}
//                   {Number(lengthPerItem).toLocaleString()} {unit} × ฿
//                   {Number(productForForm.price).toLocaleString()}/{unit})
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div>
//                   ราคารวม:{" "}
//                   <span className="font-bold text-foreground">
//                     ฿{Number(totalPrice).toLocaleString()}
//                   </span>
//                 </div>
//                 <div className="text-xs">
//                   ({Number(quantity).toLocaleString()} × ฿
//                   {Number(productForForm.price).toLocaleString()} / ชิ้น)
//                 </div>
//               </>
//             )}
//           </div>

//           {/* ปุ่มปรับจำนวน: เฉพาะสินค้าไม่มีเงื่อนไข */}
//           {!hasConditions && (
//             <div className="flex items-center gap-4">
//               <span className="font-medium text-muted-foreground text-sm">
//                 Quantity:
//               </span>
//               <div className="flex items-center border rounded-lg">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="h-9 w-9 p-0"
//                   onClick={() => handleQuantityChange(-1)}
//                   disabled={quantity <= 1}
//                 >
//                   -
//                 </Button>
//                 <span className="px-4 py-2 min-w-[3rem] text-center">
//                   {Number(quantity).toLocaleString()}
//                 </span>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="h-9 w-9 p-0"
//                   onClick={() => handleQuantityChange(1)}
//                   disabled={!isStockAvailable}
//                 >
//                   +
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>

//         <DialogFooter className="mt-4">
//           <Button variant="outline" onClick={onClose}>
//             ยกเลิก
//           </Button>
//           <Button
//             disabled={!isStockAvailable}
//             onClick={() => {
//               // TODO: เรียก API update cart ที่นี่
//               onClose();
//             }}
//           >
//             บันทึกการแก้ไข (ยังไม่เชื่อม API)
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// v.1.1.7 =================================================

// v.1.1.6 =================================================
// // src/app/cart/CartEditProductModal.tsx

// "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";

// import { useProductSalesForm } from "@/app/product/[id]/component/useProductSalesForm";
// import { PriceSection } from "@/app/product/[id]/component/PriceSection";
// import { CutSection } from "@/app/product/[id]/component/CutSection";
// import { RollSection } from "@/app/product/[id]/component/RollSection";

// import type {
//   UIProduct,
//   CardPartsVisibility,
// } from "@/app/api/mock/products/_store";
// import type { UICartItem } from "@/components/use-shopping-cart-panel";

// /* config ส่วนที่โชว์ใน Modal ตอนแก้ไข */
// const EDIT_VISIBLE_PARTS: CardPartsVisibility = {
//   image: true,
//   name: true,
//   category: true,

//   price: true,
//   originalPrice: true,
//   discountBadge: true,
//   brandName: true,
//   sku: true,
//   uom: true,
//   ratingReview: false,
//   frame: false,
//   brandLogo: false,
// };

// export type CartEditProductModalProps = {
//   open: boolean;
//   onClose: () => void;
//   item: UICartItem | null;
// };

// export function CartEditProductModal({
//   open,
//   onClose,
//   item,
// }: CartEditProductModalProps) {
//   // ถ้ายังไม่มี item (ช่วงเปิด modal ครั้งแรก) ให้แสดงข้อความสั้น ๆ กัน error
//   if (!item) {
//     return (
//       <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
//         <DialogContent className="max-w-xl">
//           <DialogHeader>
//             <DialogTitle className="text-base md:text-lg">
//               แก้ไขรายการสินค้า
//             </DialogTitle>
//           </DialogHeader>
//           <p className="text-sm text-muted-foreground">
//             ไม่พบข้อมูลสินค้าในตะกร้า
//           </p>
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   // ประกอบเป็น UIProduct เต็ม ๆ เพื่อส่งเข้า useProductSalesForm
//   const productForForm = {
//     id: item.id ?? 0,
//     order: 0,
//     name: item.name ?? "",
//     brand: item.brand ?? undefined,
//     sku: item.sku ?? "",
//     price: item.price ?? 0,
//     discountPercent: item.discountPercent ?? undefined,
//     uom: item.uom ?? undefined,
//     image_url: item.image ?? "/placeholder.png",

//     // 🔹 conditions จาก cart (ที่มาจาก /api/cart/list -> use-shopping-cart-panel)
//     conditions: Array.isArray((item as any).conditions)
//       ? (item as any).conditions
//       : (item as any).productConditions ?? [],

//     // 🔹 clearanceQuantity ให้เป็น number | undefined ตาม type
//     clearanceQuantity:
//       (item as any).clearanceQuantity != null
//         ? Number((item as any).clearanceQuantity)
//         : undefined,

//     // 🔹 ข้อมูลเสริมสำหรับ CUT/ROLL (ดึงจาก UICartItem ถ้ามี)
//     salesMode: (item as any).salesMode ?? undefined,
//     lengthPerItem:
//       (item as any).lengthPerItem != null
//         ? Number((item as any).lengthPerItem)
//         : undefined,
//     rollLength:
//       (item as any).rollLength != null
//         ? Number((item as any).rollLength)
//         : undefined,
//   } as UIProduct;

//   const hasConditions =
//     Array.isArray((productForForm as any).conditions) &&
//     (productForForm as any).conditions.length > 0;

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
//   } = useProductSalesForm(
//     productForForm,
//     EDIT_VISIBLE_PARTS,
//     hasConditions,
//     {
//       // ใช้จำนวนชุดจาก cart เป็นค่าเริ่มต้น
//       initialQuantity: item.quantity ?? 1,
//       // ส่งค่าอื่น ๆ จาก UICartItem เผื่อ hook เอาไปใช้ตั้งต้น
//       initialSalesMode: (item as any).salesMode,
//       initialCutLength:
//         (item as any).cutLength ??
//         (item as any).lengthPerItem ??
//         undefined,
//       initialRollLength: (item as any).rollLength ?? undefined,
//     } as any,
//   );

//   return (
//     <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
//       <DialogContent className="max-w-xl">
//         <DialogHeader>
//           <DialogTitle className="text-base md:text-lg">
//             แก้ไขรายการสินค้า: {item.name ?? "-"}
//           </DialogTitle>
//           <DialogDescription className="text-xs md:text-sm">
//             ปรับจำนวนสินค้า ความยาวสาย หรือเงื่อนไขการขาย แล้วบันทึกการแก้ไขรายการนี้
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-4">
//           {/* รูป + ชื่อสินค้า + ราคา */}
//           <div className="flex items-start gap-3">
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img
//               src={item.image}
//               alt={item.name}
//               className="w-20 h-20 object-cover rounded border"
//             />

//             <div className="flex-1 min-w-0 space-y-1">
//               <h3 className="font-semibold text-sm line-clamp-2">
//                 {item.name}
//               </h3>
//               <div className="text-[11px] text-muted-foreground">
//                 SKU: {item.sku}
//               </div>
//               {item.brand && (
//                 <div className="text-[11px] text-muted-foreground">
//                   Brand: {item.brand}
//                 </div>
//               )}

//               <PriceSection
//                 product={productForForm}
//                 visibleParts={EDIT_VISIBLE_PARTS}
//                 hasConditions={hasConditions}
//                 salesMode={salesMode}
//                 unit={unit}
//                 originalPrice={originalPrice}
//                 showDiscountBadge={showDiscountBadge}
//               />
//             </div>
//           </div>

//           {/* โซน CUT / ROLL */}
//           {hasConditions && salesMode && (
//             <div className="space-y-3">
//               <div className="space-y-1">
//                 <span className="text-muted-foreground font-medium text-sm">
//                   ประเภทการขาย:
//                 </span>
//                 <div className="inline-flex items-center rounded-lg border border-muted px-3 py-1.5 text-sm bg-white">
//                   {salesMode === "CUT"
//                     ? "ตัดแบ่งขาย (Cut)"
//                     : "ขายยกม้วน (Roll)"}
//                 </div>
//               </div>

//               {/* CUT: ปุ่มความยาวแบบหน้า detail */}
//               <CutSection
//                 hasConditions={hasConditions}
//                 salesMode={salesMode}
//                 cutMinimum={cutMinimum}
//                 cutStepOptions={cutStepOptions}
//                 cutLength={cutLength}
//                 unit={unit}
//                 clearanceQty={clearanceQty}
//                 quantity={quantity}
//                 noStock={noStock}
//                 handleCutStep={handleCutStep}
//               />

//               {/* ROLL: เลือกขนาดม้วน */}
//               <RollSection
//                 hasConditions={hasConditions}
//                 salesMode={salesMode}
//                 rollPairs={rollPairs}
//                 rollLength={rollLength}
//                 unit={unit}
//                 setRollLength={setRollLength}
//               />
//             </div>
//           )}

//           {/* สรุปสต๊อก + ยอดรวม */}
//           <div className="space-y-2 text-sm text-muted-foreground">
//             <div className="flex items-center gap-2">
//               {salesMode === "ROLL" ? (
//                 selectedRollStock != null ? (
//                   selectedRollStock > 0 ? (
//                     <>
//                       <div className="w-2 h-2 bg-success rounded-full" />
//                       <span className="text-success font-medium">
//                         สต๊อก {Number(selectedRollStock).toLocaleString()} ม้วน
//                         {rollLength &&
//                           ` (ขนาด ${Number(rollLength).toLocaleString()} ${unit})`}
//                       </span>
//                     </>
//                   ) : (
//                     <>
//                       <div className="w-2 h-2 bg-destructive rounded-full" />
//                       <span className="text-destructive font-medium">
//                         ขนาดที่เลือกหมดสต๊อก
//                       </span>
//                     </>
//                   )
//                 ) : (
//                   <>
//                     <div className="w-2 h-2 bg-muted-foreground rounded-full" />
//                     <span>เลือกความยาวม้วนเพื่อดูสต๊อก</span>
//                   </>
//                 )
//               ) : clearanceQty != null ? (
//                 clearanceQty > 0 ? (
//                   <>
//                     <div className="w-2 h-2 bg-success rounded-full" />
//                     <span className="text-success font-medium">
//                       มีสินค้าในสต๊อก {Number(clearanceQty).toLocaleString()}{" "}
//                       {unit}
//                     </span>
//                   </>
//                 ) : (
//                   <>
//                     <div className="w-2 h-2 bg-destructive rounded-full" />
//                     <span className="text-destructive font-medium">
//                       สินค้าหมด
//                     </span>
//                   </>
//                 )
//               ) : (
//                 <>
//                   <div className="w-2 h-2 bg-muted-foreground rounded-full" />
//                   <span className="text-muted-foreground">
//                     สินค้า Clearance กรุณาตรวจสอบจำนวนคงเหลือกับพนักงานขาย
//                   </span>
//                 </>
//               )}
//             </div>

//             {hasConditions && salesMode ? (
//               <>
//                 <div>
//                   ความยาวรวม:{" "}
//                   <span className="font-medium text-foreground">
//                     {Number(totalLength).toLocaleString()} {unit}
//                   </span>
//                 </div>
//                 <div>
//                   ราคารวม:{" "}
//                   <span className="font-bold text-foreground">
//                     ฿{Number(totalPrice).toLocaleString()}
//                   </span>
//                 </div>
//                 <div className="text-xs">
//                   ({Number(quantity).toLocaleString()} ×{" "}
//                   {Number(lengthPerItem).toLocaleString()} {unit} × ฿
//                   {Number(productForForm.price).toLocaleString()}/{unit})
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div>
//                   ราคารวม:{" "}
//                   <span className="font-bold text-foreground">
//                     ฿{Number(totalPrice).toLocaleString()}
//                   </span>
//                 </div>
//                 <div className="text-xs">
//                   ({Number(quantity).toLocaleString()} × ฿
//                   {Number(productForForm.price).toLocaleString()} / ชิ้น)
//                 </div>
//               </>
//             )}
//           </div>

//           {/* ปุ่มปรับจำนวน
//               🔹 ถ้า "ไม่มีเงื่อนไข" (ไม่มี Cut/Roll) → ใช้ +/- ตามปกติ
//               🔹 ถ้า "มีเงื่อนไข" (Cut หรือ Roll) → ซ่อนปุ่มนี้ไปเลย
//           */}
//           {!hasConditions && (
//             <div className="flex items-center gap-4">
//               <span className="font-medium text-muted-foreground text-sm">
//                 Quantity:
//               </span>
//               <div className="flex items-center border rounded-lg">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="h-9 w-9 p-0"
//                   onClick={() => handleQuantityChange(-1)}
//                   disabled={quantity <= 1}
//                 >
//                   -
//                 </Button>
//                 <span className="px-4 py-2 min-w-[3rem] text-center">
//                   {Number(quantity).toLocaleString()}
//                 </span>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="h-9 w-9 p-0"
//                   onClick={() => handleQuantityChange(1)}
//                   disabled={!isStockAvailable}
//                 >
//                   +
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>

//         <DialogFooter className="mt-4">
//           <Button variant="outline" onClick={onClose}>
//             ยกเลิก
//           </Button>
//           <Button
//             disabled={!isStockAvailable}
//             onClick={() => {
//               // TODO: เรียก API update cart ที่นี่
//               onClose();
//             }}
//           >
//             บันทึกการแก้ไข (ยังไม่เชื่อม API)
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// v.1.1.6 =================================================

// v.1.1.5 =================================================
// // src/app/cart/CartEditProductModal.tsx

// "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";

// import { useProductSalesForm } from "@/app/product/[id]/component/useProductSalesForm";
// import { PriceSection } from "@/app/product/[id]/component/PriceSection";
// import { CutSection } from "@/app/product/[id]/component/CutSection";
// import { RollSection } from "@/app/product/[id]/component/RollSection";

// import type {
//   UIProduct,
//   CardPartsVisibility,
// } from "@/app/api/mock/products/_store";
// import type { UICartItem } from "@/components/use-shopping-cart-panel";

// /* config ส่วนที่โชว์ใน Modal ตอนแก้ไข */
// const EDIT_VISIBLE_PARTS: CardPartsVisibility = {
//   image: true,
//   name: true,
//   category: true,

//   price: true,
//   originalPrice: true,
//   discountBadge: true,
//   brandName: true,
//   sku: true,
//   uom: true,
//   ratingReview: false,
//   frame: false,
//   brandLogo: false,
// };

// export type CartEditProductModalProps = {
//   open: boolean;
//   onClose: () => void;
//   item: UICartItem | null;
// };

// export function CartEditProductModal({
//   open,
//   onClose,
//   item,
// }: CartEditProductModalProps) {
//   // ถ้ายังไม่มี item (ช่วงเปิด modal ครั้งแรก) ให้แสดงข้อความสั้น ๆ กัน error
//   if (!item) {
//     return (
//       <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
//         <DialogContent className="max-w-xl">
//           <DialogHeader>
//             <DialogTitle className="text-base md:text-lg">
//               แก้ไขรายการสินค้า
//             </DialogTitle>
//           </DialogHeader>
//           <p className="text-sm text-muted-foreground">
//             ไม่พบข้อมูลสินค้าในตะกร้า
//           </p>
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   // ประกอบเป็น UIProduct เต็ม ๆ เพื่อส่งเข้า useProductSalesForm
//   const productForForm: UIProduct = {
//     id: item.id ?? 0,
//     order: 0,
//     name: item.name ?? "",
//     brand: item.brand ?? undefined,
//     sku: item.sku ?? "",
//     price: item.price ?? 0,
//     discountPercent: item.discountPercent ?? undefined,
//     uom: item.uom ?? undefined,
//     image_url: item.image ?? "/placeholder.png",

//     // 🔹 conditions จาก cart (ที่มาจาก /api/cart/list)
//     conditions: Array.isArray((item as any).conditions)
//       ? (item as any).conditions
//       : (item as any).productConditions ?? [],

//     // 🔹 clearanceQuantity ให้เป็น number | undefined ตาม type
//     clearanceQuantity:
//       (item as any).clearanceQuantity != null
//         ? Number((item as any).clearanceQuantity)
//         : undefined,
//   };

//   const hasConditions =
//     Array.isArray((productForForm as any).conditions) &&
//     (productForForm as any).conditions.length > 0;

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
//   } = useProductSalesForm(
//     productForForm,
//     EDIT_VISIBLE_PARTS,
//     hasConditions,
//     {
//       // ใช้จำนวนชุดจาก cart เป็นค่าเริ่มต้น
//       initialQuantity: item.quantity ?? 1,
//       // ส่งค่าอื่น ๆ เผื่อ hook รองรับ (ไม่ทำให้ TypeScript พัง แม้ hook ไม่ใช้)
//       initialSalesMode: (item as any).salesMode,
//       initialCutLength:
//         (item as any).cutLength ??
//         (item as any).lengthPerItem ??
//         undefined,
//       initialRollLength: (item as any).rollLength ?? undefined,
//     } as any,
//   );

//   const isCutMode = hasConditions && salesMode === "CUT";

//   return (
//     <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
//       <DialogContent className="max-w-xl">
//         <DialogHeader>
//           <DialogTitle className="text-base md:text-lg">
//             แก้ไขรายการสินค้า: {item.name ?? "-"}
//           </DialogTitle>
//           <DialogDescription className="text-xs md:text-sm">
//             ปรับจำนวนสินค้า ความยาวสาย หรือเงื่อนไขการขาย แล้วบันทึกการแก้ไขรายการนี้
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-4">
//           {/* รูป + ชื่อสินค้า + ราคา */}
//           <div className="flex items-start gap-3">
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img
//               src={item.image}
//               alt={item.name}
//               className="w-20 h-20 object-cover rounded border"
//             />

//             <div className="flex-1 min-w-0 space-y-1">
//               <h3 className="font-semibold text-sm line-clamp-2">
//                 {item.name}
//               </h3>
//               <div className="text-[11px] text-muted-foreground">
//                 SKU: {item.sku}
//               </div>
//               {item.brand && (
//                 <div className="text-[11px] text-muted-foreground">
//                   Brand: {item.brand}
//                 </div>
//               )}

//               <PriceSection
//                 product={productForForm}
//                 visibleParts={EDIT_VISIBLE_PARTS}
//                 hasConditions={hasConditions}
//                 salesMode={salesMode}
//                 unit={unit}
//                 originalPrice={originalPrice}
//                 showDiscountBadge={showDiscountBadge}
//               />
//             </div>
//           </div>

//           {/* โซน CUT / ROLL */}
//           {hasConditions && salesMode && (
//             <div className="space-y-3">
//               <div className="space-y-1">
//                 <span className="text-muted-foreground font-medium text-sm">
//                   ประเภทการขาย:
//                 </span>
//                 <div className="inline-flex items-center rounded-lg border border-muted px-3 py-1.5 text-sm bg-white">
//                   {salesMode === "CUT"
//                     ? "ตัดแบ่งขาย (Cut)"
//                     : "ขายยกม้วน (Roll)"}
//                 </div>
//               </div>

//               {/* CUT: ปุ่มความยาวแบบหน้า detail */}
//               <CutSection
//                 hasConditions={hasConditions}
//                 salesMode={salesMode}
//                 cutMinimum={cutMinimum}
//                 cutStepOptions={cutStepOptions}
//                 cutLength={cutLength}
//                 unit={unit}
//                 clearanceQty={clearanceQty}
//                 quantity={quantity}
//                 noStock={noStock}
//                 handleCutStep={handleCutStep}
//               />

//               {/* ROLL: เลือกขนาดม้วน */}
//               <RollSection
//                 hasConditions={hasConditions}
//                 salesMode={salesMode}
//                 rollPairs={rollPairs}
//                 rollLength={rollLength}
//                 unit={unit}
//                 setRollLength={setRollLength}
//               />
//             </div>
//           )}

//           {/* สรุปสต๊อก + ยอดรวม */}
//           <div className="space-y-2 text-sm text-muted-foreground">
//             <div className="flex items-center gap-2">
//               {salesMode === "ROLL" ? (
//                 selectedRollStock != null ? (
//                   selectedRollStock > 0 ? (
//                     <>
//                       <div className="w-2 h-2 bg-success rounded-full" />
//                       <span className="text-success font-medium">
//                         สต๊อก {Number(selectedRollStock).toLocaleString()} ม้วน
//                         {rollLength &&
//                           ` (ขนาด ${Number(rollLength).toLocaleString()} ${unit})`}
//                       </span>
//                     </>
//                   ) : (
//                     <>
//                       <div className="w-2 h-2 bg-destructive rounded-full" />
//                       <span className="text-destructive font-medium">
//                         ขนาดที่เลือกหมดสต๊อก
//                       </span>
//                     </>
//                   )
//                 ) : (
//                   <>
//                     <div className="w-2 h-2 bg-muted-foreground rounded-full" />
//                     <span>เลือกความยาวม้วนเพื่อดูสต๊อก</span>
//                   </>
//                 )
//               ) : clearanceQty != null ? (
//                 clearanceQty > 0 ? (
//                   <>
//                     <div className="w-2 h-2 bg-success rounded-full" />
//                     <span className="text-success font-medium">
//                       มีสินค้าในสต๊อก {Number(clearanceQty).toLocaleString()}{" "}
//                       {unit}
//                     </span>
//                   </>
//                 ) : (
//                   <>
//                     <div className="w-2 h-2 bg-destructive rounded-full" />
//                     <span className="text-destructive font-medium">
//                       สินค้าหมด
//                     </span>
//                   </>
//                 )
//               ) : (
//                 <>
//                   <div className="w-2 h-2 bg-muted-foreground rounded-full" />
//                   <span className="text-muted-foreground">
//                     สินค้า Clearance กรุณาตรวจสอบจำนวนคงเหลือกับพนักงานขาย
//                   </span>
//                 </>
//               )}
//             </div>

//             {hasConditions && salesMode ? (
//               <>
//                 <div>
//                   ความยาวรวม:{" "}
//                   <span className="font-medium text-foreground">
//                     {Number(totalLength).toLocaleString()} {unit}
//                   </span>
//                 </div>
//                 <div>
//                   ราคารวม:{" "}
//                   <span className="font-bold text-foreground">
//                     ฿{Number(totalPrice).toLocaleString()}
//                   </span>
//                 </div>
//                 <div className="text-xs">
//                   ({Number(quantity).toLocaleString()} ×{" "}
//                   {Number(lengthPerItem).toLocaleString()} {unit} × ฿
//                   {Number(productForForm.price).toLocaleString()}/{unit})
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div>
//                   ราคารวม:{" "}
//                   <span className="font-bold text-foreground">
//                     ฿{Number(totalPrice).toLocaleString()}
//                   </span>
//                 </div>
//                 <div className="text-xs">
//                   ({Number(quantity).toLocaleString()} × ฿
//                   {Number(productForForm.price).toLocaleString()} / ชิ้น)
//                 </div>
//               </>
//             )}
//           </div>

//           {/* ปุ่มปรับจำนวน
//               🔹 ถ้าเป็น CUT ที่มี conditions → ไม่ต้องมีปุ่ม +/- (ควบคุมด้วย CutSection แทน)
//               🔹 ถ้าเป็น ROLL หรือสินค้าไม่มี conditions → ใช้ +/- ตามปกติ
//           */}
//           {(!hasConditions || !isCutMode) && (
//             <div className="flex items-center gap-4">
//               <span className="font-medium text-muted-foreground text-sm">
//                 Quantity:
//               </span>
//               <div className="flex items-center border rounded-lg">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="h-9 w-9 p-0"
//                   onClick={() => handleQuantityChange(-1)}
//                   disabled={quantity <= 1}
//                 >
//                   -
//                 </Button>
//                 <span className="px-4 py-2 min-w-[3rem] text-center">
//                   {Number(quantity).toLocaleString()}
//                 </span>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="h-9 w-9 p-0"
//                   onClick={() => handleQuantityChange(1)}
//                   disabled={!isStockAvailable}
//                 >
//                   +
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>

//         <DialogFooter className="mt-4">
//           <Button variant="outline" onClick={onClose}>
//             ยกเลิก
//           </Button>
//           <Button
//             disabled={!isStockAvailable}
//             onClick={() => {
//               // TODO: เรียก API update cart ที่นี่
//               onClose();
//             }}
//           >
//             บันทึกการแก้ไข (ยังไม่เชื่อม API)
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// v.1.1.5 =================================================

// v.1.1.4 =================================================
// // src/app/cart/CartEditProductModal.tsx

// "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";

// import { useProductSalesForm } from "@/app/product/[id]/component/useProductSalesForm";
// import { PriceSection } from "@/app/product/[id]/component/PriceSection";
// import { CutSection } from "@/app/product/[id]/component/CutSection";
// import { RollSection } from "@/app/product/[id]/component/RollSection";

// import type {
//   UIProduct,
//   CardPartsVisibility,
// } from "@/app/api/mock/products/_store";
// import type { UICartItem } from "@/components/use-shopping-cart-panel";

// /* config ส่วนที่โชว์ใน Modal ตอนแก้ไข */
// const EDIT_VISIBLE_PARTS: CardPartsVisibility = {
//   image: true,
//   name: true,
//   category: true,

//   price: true,
//   originalPrice: true,
//   discountBadge: true,
//   brandName: true,
//   sku: true,
//   uom: true,
//   ratingReview: false,
//   frame: false,
//   brandLogo: false,
// };

// export type CartEditProductModalProps = {
//   open: boolean;
//   onClose: () => void;
//   item: UICartItem | null;
// };

// export function CartEditProductModal({
//   open,
//   onClose,
//   item,
// }: CartEditProductModalProps) {
//   // ถ้ายังไม่มี item (ช่วงเปิด modal ครั้งแรก) ให้แสดงข้อความสั้น ๆ กัน error
//   if (!item) {
//     return (
//       <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
//         <DialogContent className="max-w-xl">
//           <DialogHeader>
//             <DialogTitle className="text-base md:text-lg">
//               แก้ไขรายการสินค้า
//             </DialogTitle>
//           </DialogHeader>
//           <p className="text-sm text-muted-foreground">
//             ไม่พบข้อมูลสินค้าในตะกร้า
//           </p>
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   // ประกอบเป็น UIProduct เต็ม ๆ เพื่อส่งเข้า useProductSalesForm
//   const productForForm: UIProduct = {
//     id: item.id ?? 0,
//     order: 0,
//     name: item.name ?? "",
//     brand: item.brand ?? undefined,
//     sku: item.sku ?? "",
//     price: item.price ?? 0,
//     discountPercent: item.discountPercent ?? undefined,
//     uom: item.uom ?? undefined,
//     image_url: item.image ?? "/placeholder.png",

//     // 🔹 conditions จาก cart (ที่มาจาก /api/cart/list)
//     conditions: Array.isArray((item as any).conditions)
//       ? (item as any).conditions
//       : (item as any).productConditions ?? [],

//     // 🔹 clearanceQuantity ให้เป็น number | undefined ตาม type
//     clearanceQuantity:
//       (item as any).clearanceQuantity != null
//         ? Number((item as any).clearanceQuantity)
//         : undefined,
//   };

//   const hasConditions =
//     Array.isArray((productForForm as any).conditions) &&
//     (productForForm as any).conditions.length > 0;

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
//   } = useProductSalesForm(
//     productForForm,
//     EDIT_VISIBLE_PARTS,
//     hasConditions,
//     { initialQuantity: item.quantity ?? 1 },
//   );

//   // 🔍 debug object สำหรับแสดงใน modal
//   const debugData = {
//     cartItemId: item.id,
//     sku: item.sku,
//     originalQuantity: item.quantity,
//     modalQuantity: quantity,
//     rawClearanceFromCart: (item as any).clearanceQuantity ?? null,
//     clearanceQtyFromForm: clearanceQty,
//     hasConditions,
//     conditions: (productForForm as any).conditions ?? null,
//   };

//   return (
//     <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
//       <DialogContent className="max-w-xl">
//         <DialogHeader>
//           <DialogTitle className="text-base md:text-lg">
//             แก้ไขรายการสินค้า: {item.name ?? "-"}
//           </DialogTitle>
//           <DialogDescription className="text-xs md:text-sm">
//             ปรับจำนวนสินค้า ความยาวสาย หรือเงื่อนไขการขาย แล้วบันทึกการแก้ไขรายการนี้
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-4">
//           {/* รูป + ชื่อสินค้า + ราคา */}
//           <div className="flex items-start gap-3">
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img
//               src={item.image}
//               alt={item.name}
//               className="w-20 h-20 object-cover rounded border"
//             />

//             <div className="flex-1 min-w-0 space-y-1">
//               <h3 className="font-semibold text-sm line-clamp-2">
//                 {item.name}
//               </h3>
//               <div className="text-[11px] text-muted-foreground">
//                 SKU: {item.sku}
//               </div>
//               {item.brand && (
//                 <div className="text-[11px] text-muted-foreground">
//                   Brand: {item.brand}
//                 </div>
//               )}

//               <PriceSection
//                 product={productForForm}
//                 visibleParts={EDIT_VISIBLE_PARTS}
//                 hasConditions={hasConditions}
//                 salesMode={salesMode}
//                 unit={unit}
//                 originalPrice={originalPrice}
//                 showDiscountBadge={showDiscountBadge}
//               />
//             </div>
//           </div>

//           {/* โซน CUT / ROLL */}
//           {hasConditions && salesMode && (
//             <div className="space-y-3">
//               <div className="space-y-1">
//                 <span className="text-muted-foreground font-medium text-sm">
//                   ประเภทการขาย:
//                 </span>
//                 <div className="inline-flex items-center rounded-lg border border-muted px-3 py-1.5 text-sm bg-white">
//                   {salesMode === "CUT" ? "ตัดแบ่งขาย (Cut)" : "ขายยกม้วน (Roll)"}
//                 </div>
//               </div>

//               <CutSection
//                 hasConditions={hasConditions}
//                 salesMode={salesMode}
//                 cutMinimum={cutMinimum}
//                 cutStepOptions={cutStepOptions}
//                 cutLength={cutLength}
//                 unit={unit}
//                 clearanceQty={clearanceQty}
//                 quantity={quantity}
//                 noStock={noStock}
//                 handleCutStep={handleCutStep}
//               />

//               <RollSection
//                 hasConditions={hasConditions}
//                 salesMode={salesMode}
//                 rollPairs={rollPairs}
//                 rollLength={rollLength}
//                 unit={unit}
//                 setRollLength={setRollLength}
//               />
//             </div>
//           )}

//           {/* DEBUG แสดง conditions / clearance ฯลฯ */}
//           <div className="mt-2">
//             <div className="text-xs font-semibold text-muted-foreground mb-1">
//               DEBUG: conditions ที่ modal ได้รับ
//             </div>
//             <pre className="rounded bg-slate-100 border border-slate-200 px-2 py-1 text-[10px] leading-snug text-slate-700 whitespace-pre-wrap break-all">
//               {JSON.stringify(debugData, null, 2)}
//             </pre>
//           </div>

//           {/* สรุปสต๊อก + ยอดรวม */}
//           <div className="space-y-2 text-sm text-muted-foreground">
//             <div className="flex items-center gap-2">
//               {salesMode === "ROLL" ? (
//                 selectedRollStock != null ? (
//                   selectedRollStock > 0 ? (
//                     <>
//                       <div className="w-2 h-2 bg-success rounded-full" />
//                       <span className="text-success font-medium">
//                         สต๊อก {Number(selectedRollStock).toLocaleString()} ม้วน
//                         {rollLength &&
//                           ` (ขนาด ${Number(rollLength).toLocaleString()} ${unit})`}
//                       </span>
//                     </>
//                   ) : (
//                     <>
//                       <div className="w-2 h-2 bg-destructive rounded-full" />
//                       <span className="text-destructive font-medium">
//                         ขนาดที่เลือกหมดสต๊อก
//                       </span>
//                     </>
//                   )
//                 ) : (
//                   <>
//                     <div className="w-2 h-2 bg-muted-foreground rounded-full" />
//                     <span>เลือกความยาวม้วนเพื่อดูสต๊อก</span>
//                   </>
//                 )
//               ) : clearanceQty != null ? (
//                 clearanceQty > 0 ? (
//                   <>
//                     <div className="w-2 h-2 bg-success rounded-full" />
//                     <span className="text-success font-medium">
//                       มีสินค้าในสต๊อก {Number(clearanceQty).toLocaleString()}{" "}
//                       {unit}
//                     </span>
//                   </>
//                 ) : (
//                   <>
//                     <div className="w-2 h-2 bg-destructive rounded-full" />
//                     <span className="text-destructive font-medium">
//                       สินค้าหมด
//                     </span>
//                   </>
//                 )
//               ) : (
//                 <>
//                   <div className="w-2 h-2 bg-muted-foreground rounded-full" />
//                   <span className="text-muted-foreground">
//                     สินค้า Clearance กรุณาตรวจสอบจำนวนคงเหลือกับพนักงานขาย
//                   </span>
//                 </>
//               )}
//             </div>

//             {hasConditions && salesMode ? (
//               <>
//                 <div>
//                   ความยาวรวม:{" "}
//                   <span className="font-medium text-foreground">
//                     {Number(totalLength).toLocaleString()} {unit}
//                   </span>
//                 </div>
//                 <div>
//                   ราคารวม:{" "}
//                   <span className="font-bold text-foreground">
//                     ฿{Number(totalPrice).toLocaleString()}
//                   </span>
//                 </div>
//                 <div className="text-xs">
//                   ({Number(quantity).toLocaleString()} ×{" "}
//                   {Number(lengthPerItem).toLocaleString()} {unit} × ฿
//                   {Number(productForForm.price).toLocaleString()}/{unit})
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div>
//                   ราคารวม:{" "}
//                   <span className="font-bold text-foreground">
//                     ฿{Number(totalPrice).toLocaleString()}
//                   </span>
//                 </div>
//                 <div className="text-xs">
//                   ({Number(quantity).toLocaleString()} × ฿
//                   {Number(productForForm.price).toLocaleString()} / ชิ้น)
//                 </div>
//               </>
//             )}
//           </div>

//           {/* ปุ่มปรับจำนวน */}
//           <div className="flex items-center gap-4">
//             <span className="font-medium text-muted-foreground text-sm">
//               Quantity:
//             </span>
//             <div className="flex items-center border rounded-lg">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="h-9 w-9 p-0"
//                 onClick={() => handleQuantityChange(-1)}
//                 disabled={quantity <= 1}
//               >
//                 -
//               </Button>
//               <span className="px-4 py-2 min-w-[3rem] text-center">
//                 {Number(quantity).toLocaleString()}
//               </span>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="h-9 w-9 p-0"
//                 onClick={() => handleQuantityChange(1)}
//                 disabled={!isStockAvailable}
//               >
//                 +
//               </Button>
//             </div>
//           </div>
//         </div>

//         <DialogFooter className="mt-4">
//           <Button variant="outline" onClick={onClose}>
//             ยกเลิก
//           </Button>
//           <Button
//             disabled={!isStockAvailable}
//             onClick={() => {
//               // TODO: เรียก API update cart ที่นี่
//               onClose();
//             }}
//           >
//             บันทึกการแก้ไข (ยังไม่เชื่อม API)
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// v.1.1.4 =================================================

// v.1.1.3 =================================================
// // src/app/cart/CartEditProductModal.tsx
// "use client";

// import { useEffect, useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import type { UICartItem } from "@/components/use-shopping-cart-panel";
// import { Minus, Plus } from "lucide-react";

// export type CartEditProductModalProps = {
//   open: boolean;
//   item: UICartItem | null;
//   onClose: () => void;
//   onSave: (itemId: number, newQuantity: number) => void;
// };

// /**
//  * Modal แก้ไขสินค้าในตะกร้า
//  */
// export function CartEditProductModal({
//   open,
//   item,
//   onClose,
//   onSave,
// }: CartEditProductModalProps) {
//   const [quantity, setQuantity] = useState<number>(1);

//   useEffect(() => {
//     if (item) {
//       const q = Number(item.quantity ?? 1);
//       setQuantity(q > 0 ? q : 1);
//     }
//   }, [item]);

//   if (!item) {
//     return (
//       <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
//         <DialogContent className="sm:max-w-lg">
//           <DialogHeader>
//             <DialogTitle>แก้ไขรายการสินค้า</DialogTitle>
//           </DialogHeader>
//           <p className="text-sm text-muted-foreground">
//             ไม่พบข้อมูลสินค้าในตะกร้า
//           </p>
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   const price = Number(item.price ?? 0);
//   const lineTotal = price * quantity;

//   // 🔹 ดึงจำนวนสต๊อกที่เหลือจาก clearanceQuantity (อาจเป็น null ถ้า backend ไม่ส่งมา)
//   const clearanceQty =
//     item.clearanceQuantity != null
//       ? Number(item.clearanceQuantity)
//       : null;

//   // 🔹 มีเงื่อนไขการขายพิเศษ (CUT / ROLL ฯลฯ) หรือไม่
//   const hasConditions =
//     Array.isArray(item.conditions) && item.conditions.length > 0;

//   const handleDecrease = () => {
//     setQuantity((prev) => (prev > 1 ? prev - 1 : prev));
//   };

//   const handleIncrease = () => {
//     setQuantity((prev) => prev + 1);
//   };

//   const handleSaveClick = () => {
//     if (quantity <= 0) return;
//     onSave(item.id, quantity);
//   };

//   const isMeterUnit =
//     typeof item.uom === "string" && item.uom.toLowerCase().includes("m");

//   return (
//     <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
//       <DialogContent className="sm:max-w-xl">
//         <DialogHeader>
//           <DialogTitle className="text-base sm:text-lg">
//             แก้ไขรายการสินค้า: {item.name}
//           </DialogTitle>
//           <DialogDescription className="text-xs sm:text-sm">
//             ปรับจำนวนสินค้า ความยาวรวม หรือเงื่อนไขในการขาย แล้วบันทึกการแก้ไขรายการนี้
//           </DialogDescription>
//         </DialogHeader>

//         {/* เนื้อหาหลัก */}
//         <div className="mt-3 space-y-4">
//           {/* แถวรูป + ข้อมูลสั้น ๆ */}
//           <div className="flex gap-3">
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img
//               src={item.image}
//               alt={item.name}
//               className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded border flex-shrink-0"
//             />
//             <div className="flex-1 min-w-0 space-y-1">
//               <div className="text-sm font-semibold line-clamp-2">
//                 {item.name}
//               </div>
//               <div className="text-[11px] text-muted-foreground">
//                 SKU: {item.sku}
//               </div>
//               {item.brand && (
//                 <div className="text-[11px] text-muted-foreground">
//                   Brand: {item.brand}
//                 </div>
//               )}
//               <div className="text-sm">
//                 <span className="font-semibold text-primary">
//                   ฿{price.toLocaleString()}
//                 </span>{" "}
//                 {item.uom && (
//                   <span className="text-xs text-muted-foreground">
//                     / {item.uom}
//                   </span>
//                 )}
//               </div>

//               {/* 🔹 แสดงสถานะสต๊อกจาก clearanceQuantity */}
//               <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm">
//                 {clearanceQty != null ? (
//                   clearanceQty > 0 ? (
//                     <>
//                       <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
//                       <span className="text-emerald-700 font-medium">
//                         มีสินค้าในสต๊อก จำนวน{" "}
//                         {clearanceQty.toLocaleString()}{" "}
//                         {item.uom ?? ""}
//                       </span>
//                     </>
//                   ) : (
//                     <>
//                       <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
//                       <span className="text-destructive font-medium">
//                         สินค้าหมด
//                       </span>
//                     </>
//                   )
//                 ) : (
//                   <>
//                     <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground" />
//                     <span className="text-xs sm:text-sm text-muted-foreground">
//                       สินค้า Clearance กรุณาตรวจสอบจำนวนคงเหลือกับพนักงานขาย
//                     </span>
//                   </>
//                 )}
//               </div>

//               {/* 🔹 ถ้ามี conditions แสดง hint ไว้ก่อน (ต่อยอดทำปุ่ม CUT / ROLL ภายหลัง) */}
//               {hasConditions && (
//                 <p className="mt-1 text-[11px] text-muted-foreground">
//                   * สินค้านี้มีเงื่อนไขการขายพิเศษ (CUT / ROLL) ตัวเลือกความยาว
//                   จะอ้างอิงจากหน้า รายละเอียดสินค้า
//                 </p>
//               )}
//             </div>
//           </div>

//           <Separator />

//           {/* ส่วน Quantity */}
//           <div className="space-y-3">
//             {isMeterUnit && (
//               <p className="text-xs text-muted-foreground">
//                 * สินค้านี้คิดตามหน่วยเมตร จำนวนด้านล่างคือ{" "}
//                 <span className="font-semibold">ความยาวรวม (เมตร)</span> ใน
//                 ตะกร้า
//               </p>
//             )}

//             <div className="flex items-center gap-4">
//               <span className="font-medium text-muted-foreground">
//                 จำนวน:
//               </span>
//               <div className="flex items-center border rounded-lg">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="h-9 w-9 p-0"
//                   onClick={handleDecrease}
//                   disabled={quantity <= 1}
//                 >
//                   <Minus className="h-4 w-4" />
//                 </Button>
//                 <span className="px-4 py-2 min-w-[3rem] text-center">
//                   {quantity.toLocaleString()}
//                 </span>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="h-9 w-9 p-0"
//                   onClick={handleIncrease}
//                 >
//                   <Plus className="h-4 w-4" />
//                 </Button>
//               </div>
//               {item.uom && (
//                 <span className="text-xs text-muted-foreground">
//                   หน่วย: {item.uom}
//                 </span>
//               )}
//             </div>
//           </div>

//           {/* สรุปยอดเล็ก ๆ ใน modal */}
//           <div className="mt-2 text-sm text-muted-foreground space-y-1">
//             <div>
//               ราคารวมใหม่:{" "}
//               <span className="font-bold text-foreground">
//                 ฿{lineTotal.toLocaleString()}
//               </span>
//             </div>
//             <div className="text-xs">
//               ({quantity.toLocaleString()} × ฿{price.toLocaleString()}
//               {item.uom ? ` / ${item.uom}` : ""})
//             </div>
//           </div>

//           {/* 🔍 DEBUG: แสดงข้อมูลที่ modal ได้รับจาก use-shopping-cart-panel */}
//           {process.env.NODE_ENV !== "production" && (
//             <div className="mt-3 rounded-md bg-slate-100 border border-slate-200 p-2 text-[11px] font-mono text-slate-700 whitespace-pre-wrap break-all">
//               <div className="font-semibold mb-1">
//                 [DEBUG] Cart item data sent to modal
//               </div>
//               {JSON.stringify(
//                 {
//                   id: item.id,
//                   sku: item.sku,
//                   quantity: item.quantity,
//                   uom: item.uom,
//                   price: item.price,
//                   lineTotal: item.lineTotal,
//                   clearanceQuantity: item.clearanceQuantity,
//                   conditions: item.conditions,
//                 },
//                 null,
//                 2,
//               )}
//             </div>
//           )}

//           {/* ปุ่ม action */}
//           <div className="mt-4 flex justify-end gap-2">
//             <Button variant="outline" onClick={onClose}>
//               ยกเลิก
//             </Button>
//             <Button onClick={handleSaveClick}>บันทึกการแก้ไข</Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }


// v.1.1.3 =================================================

// v.1.1.2 =================================================
// // src/app/cart/CartEditProductModal.tsx
// "use client";

// import { useEffect, useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import type { UICartItem } from "@/components/use-shopping-cart-panel";
// import { Minus, Plus } from "lucide-react";

// export type CartEditProductModalProps = {
//   open: boolean;
//   item: UICartItem | null;
//   onClose: () => void;
//   onSave: (itemId: number, newQuantity: number) => void;
// };

// /**
//  * Modal แก้ไขสินค้าในตะกร้า
//  *
//  * ✅ ตอนนี้:
//  *    - แก้ไขจำนวน (quantity) ได้จริง
//  *    - อัปเดตราคารวมแบบ realtime
//  *    - ส่งค่าใหม่กลับไปให้หน้าหลักผ่าน onSave
//  *    - แสดงสถานะสต๊อกจาก clearanceQuantity
//  *    - รู้ว่ามี conditions (CUT / ROLL) เพื่อใช้ต่อยอดภายหลัง
//  */
// export function CartEditProductModal({
//   open,
//   item,
//   onClose,
//   onSave,
// }: CartEditProductModalProps) {
//   const [quantity, setQuantity] = useState<number>(1);

//   useEffect(() => {
//     if (item) {
//       const q = Number(item.quantity ?? 1);
//       setQuantity(q > 0 ? q : 1);
//     }
//   }, [item]);

//   if (!item) {
//     return (
//       <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
//         <DialogContent className="sm:max-w-lg">
//           <DialogHeader>
//             <DialogTitle>แก้ไขรายการสินค้า</DialogTitle>
//           </DialogHeader>
//           <p className="text-sm text-muted-foreground">
//             ไม่พบข้อมูลสินค้าในตะกร้า
//           </p>
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   const price = Number(item.price ?? 0);
//   const lineTotal = price * quantity;

//   // 🔹 ดึงจำนวนสต๊อกที่เหลือจาก clearanceQuantity (อาจเป็น null ถ้า backend ไม่ส่งมา)
//   const clearanceQty =
//     item.clearanceQuantity != null
//       ? Number(item.clearanceQuantity)
//       : null;

//   // 🔹 มีเงื่อนไขการขายพิเศษ (CUT / ROLL ฯลฯ) หรือไม่
//   const hasConditions =
//     Array.isArray(item.conditions) && item.conditions.length > 0;

//   const handleDecrease = () => {
//     setQuantity((prev) => (prev > 1 ? prev - 1 : prev));
//   };

//   const handleIncrease = () => {
//     setQuantity((prev) => prev + 1);
//   };

//   const handleSaveClick = () => {
//     if (quantity <= 0) return;
//     onSave(item.id, quantity);
//   };

//   const isMeterUnit =
//     typeof item.uom === "string" && item.uom.toLowerCase().includes("m");

//   return (
//     <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
//       <DialogContent className="sm:max-w-xl">
//         <DialogHeader>
//           <DialogTitle className="text-base sm:text-lg">
//             แก้ไขรายการสินค้า: {item.name}
//           </DialogTitle>
//           <DialogDescription className="text-xs sm:text-sm">
//             ปรับจำนวน{" "}
//             {isMeterUnit ? "ความยาวรวม รวมต่อหน่วย/เมตร ตามที่ต้องการ" : ""}
//             แล้วกดบันทึกการแก้ไข ระบบจะอัปเดตรายการในตะกร้าให้คุณ
//           </DialogDescription>
//         </DialogHeader>

//         {/* เนื้อหาหลัก */}
//         <div className="mt-3 space-y-4">
//           {/* แถวรูป + ข้อมูลสั้น ๆ */}
//           <div className="flex gap-3">
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img
//               src={item.image}
//               alt={item.name}
//               className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded border flex-shrink-0"
//             />
//             <div className="flex-1 min-w-0 space-y-1">
//               <div className="text-sm font-semibold line-clamp-2">
//                 {item.name}
//               </div>
//               <div className="text-[11px] text-muted-foreground">
//                 SKU: {item.sku}
//               </div>
//               {item.brand && (
//                 <div className="text-[11px] text-muted-foreground">
//                   Brand: {item.brand}
//                 </div>
//               )}
//               <div className="text-sm">
//                 <span className="font-semibold text-primary">
//                   ฿{price.toLocaleString()}
//                 </span>{" "}
//                 {item.uom && (
//                   <span className="text-xs text-muted-foreground">
//                     / {item.uom}
//                   </span>
//                 )}
//               </div>

//               {/* 🔹 แสดงสถานะสต๊อกจาก clearanceQuantity */}
//               <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm">
//                 {clearanceQty != null ? (
//                   clearanceQty > 0 ? (
//                     <>
//                       <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
//                       <span className="text-emerald-700 font-medium">
//                         มีสินค้าในสต๊อก จำนวน{" "}
//                         {clearanceQty.toLocaleString()}{" "}
//                         {item.uom ?? ""}
//                       </span>
//                     </>
//                   ) : (
//                     <>
//                       <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
//                       <span className="text-destructive font-medium">
//                         สินค้าหมด
//                       </span>
//                     </>
//                   )
//                 ) : (
//                   <>
//                     <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground" />
//                     <span className="text-xs sm:text-sm text-muted-foreground">
//                       สินค้า Clearance กรุณาตรวจสอบจำนวนคงเหลือกับพนักงานขาย
//                     </span>
//                   </>
//                 )}
//               </div>

//               {/* 🔹 ถ้ามี conditions แสดง hint ไว้ก่อน (ต่อยอดทำปุ่ม CUT / ROLL ภายหลัง) */}
//               {hasConditions && (
//                 <p className="mt-1 text-[11px] text-muted-foreground">
//                   * สินค้านี้มีเงื่อนไขการขายพิเศษ (CUT / ROLL) ตัวเลือกความยาว
//                   จะอ้างอิงจากหน้า รายละเอียดสินค้า
//                 </p>
//               )}
//             </div>
//           </div>

//           <Separator />

//           {/* ส่วน Quantity + (จองที่ไว้สำหรับเงื่อนไขการขายในอนาคต) */}
//           <div className="space-y-3">
//             {/* ถ้าเป็นหน่วยเมตร แสดง hint เพิ่มอีกนิด ว่านี่คือ "จำนวนหน่วย (ม.)" */}
//             {isMeterUnit && (
//               <p className="text-xs text-muted-foreground">
//                 * สินค้านี้คิดตามหน่วยเมตร จำนวนด้านล่างคือ{" "}
//                 <span className="font-semibold">ความยาวรวม (เมตร)</span> ใน
//                 ตะกร้า
//               </p>
//             )}

//             <div className="flex items-center gap-4">
//               <span className="font-medium text-muted-foreground">
//                 จำนวน:
//               </span>
//               <div className="flex items-center border rounded-lg">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="h-9 w-9 p-0"
//                   onClick={handleDecrease}
//                   disabled={quantity <= 1}
//                 >
//                   <Minus className="h-4 w-4" />
//                 </Button>
//                 <span className="px-4 py-2 min-w-[3rem] text-center">
//                   {quantity.toLocaleString()}
//                 </span>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="h-9 w-9 p-0"
//                   onClick={handleIncrease}
//                 >
//                   <Plus className="h-4 w-4" />
//                 </Button>
//               </div>
//               {item.uom && (
//                 <span className="text-xs text-muted-foreground">
//                   หน่วย: {item.uom}
//                 </span>
//               )}
//             </div>
//           </div>

//           {/* สรุปยอดเล็ก ๆ ใน modal */}
//           <div className="mt-2 text-sm text-muted-foreground space-y-1">
//             <div>
//               ราคารวมใหม่:{" "}
//               <span className="font-bold text-foreground">
//                 ฿{lineTotal.toLocaleString()}
//               </span>
//             </div>
//             <div className="text-xs">
//               ({quantity.toLocaleString()} × ฿{price.toLocaleString()}
//               {item.uom ? ` / ${item.uom}` : ""})
//             </div>
//           </div>

//           {/* ปุ่ม action */}
//           <div className="mt-4 flex justify-end gap-2">
//             <Button variant="outline" onClick={onClose}>
//               ยกเลิก
//             </Button>
//             <Button onClick={handleSaveClick}>บันทึกการแก้ไข</Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// v.1.1.2 =================================================

// // src/app/cart/CartEditProductModal.tsx
// "use client";

// import { useEffect, useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import type { UICartItem } from "@/components/use-shopping-cart-panel";
// import { Minus, Plus } from "lucide-react";

// export type CartEditProductModalProps = {
//   open: boolean;
//   item: UICartItem | null;
//   onClose: () => void;
//   onSave: (itemId: number, newQuantity: number) => void;
// };

// /**
//  * Modal แก้ไขสินค้าในตะกร้า
//  *
//  * ✅ ตอนนี้:
//  *    - แก้ไขจำนวน (quantity) ได้จริง
//  *    - อัปเดตราคารวมแบบ realtime
//  *    - ส่งค่าใหม่กลับไปให้หน้าหลักผ่าน onSave
//  *
//  * 🧩 โครงสำหรับอนาคต:
//  *    - สามารถต่อยอดให้รับ object "productFull" (แบบ UIProduct)
//  *      เพื่อใช้ logic CUT / ROLL / ความยาวเหมือนหน้า Product Detail ได้
//  */
// export function CartEditProductModal({
//   open,
//   item,
//   onClose,
//   onSave,
// }: CartEditProductModalProps) {
//   const [quantity, setQuantity] = useState<number>(1);

//   useEffect(() => {
//     if (item) {
//       const q = Number(item.quantity ?? 1);
//       setQuantity(q > 0 ? q : 1);
//     }
//   }, [item]);

//   if (!item) {
//     return (
//       <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
//         <DialogContent className="sm:max-w-lg">
//           <DialogHeader>
//             <DialogTitle>แก้ไขรายการสินค้า</DialogTitle>
//           </DialogHeader>
//           <p className="text-sm text-muted-foreground">
//             ไม่พบข้อมูลสินค้าในตะกร้า
//           </p>
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   const price = Number(item.price ?? 0);
//   const lineTotal = price * quantity;

//   const handleDecrease = () => {
//     setQuantity((prev) => (prev > 1 ? prev - 1 : prev));
//   };

//   const handleIncrease = () => {
//     setQuantity((prev) => prev + 1);
//   };

//   const handleSaveClick = () => {
//     if (quantity <= 0) return;
//     onSave(item.id, quantity);
//   };

//   const isMeterUnit =
//     typeof item.uom === "string" && item.uom.toLowerCase().includes("m");

//   return (
//     <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
//       <DialogContent className="sm:max-w-xl">
//         <DialogHeader>
//           <DialogTitle className="text-base sm:text-lg">
//             แก้ไขรายการสินค้า: {item.name}
//           </DialogTitle>
//           <DialogDescription className="text-xs sm:text-sm">
//             ปรับจำนวน{" "}
//             {isMeterUnit ? "ความยาวรวม รวมต่อหน่วย/เมตร ตามที่ต้องการ" : ""}
//             แล้วกดบันทึกการแก้ไข ระบบจะอัปเดตรายการในตะกร้าให้คุณ
//           </DialogDescription>
//         </DialogHeader>

//         {/* เนื้อหาหลัก */}
//         <div className="mt-3 space-y-4">
//           {/* แถวรูป + ข้อมูลสั้น ๆ */}
//           <div className="flex gap-3">
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img
//               src={item.image}
//               alt={item.name}
//               className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded border flex-shrink-0"
//             />
//             <div className="flex-1 min-w-0 space-y-1">
//               <div className="text-sm font-semibold line-clamp-2">
//                 {item.name}
//               </div>
//               <div className="text-[11px] text-muted-foreground">
//                 SKU: {item.sku}
//               </div>
//               {item.brand && (
//                 <div className="text-[11px] text-muted-foreground">
//                   Brand: {item.brand}
//                 </div>
//               )}
//               <div className="text-sm">
//                 <span className="font-semibold text-primary">
//                   ฿{price.toLocaleString()}
//                 </span>{" "}
//                 {item.uom && (
//                   <span className="text-xs text-muted-foreground">
//                     / {item.uom}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>

//           <Separator />

//           {/* ส่วน Quantity + (จองที่ไว้สำหรับเงื่อนไขการขายในอนาคต) */}
//           <div className="space-y-3">
//             {/* ถ้าเป็นหน่วยเมตร แสดง hint เพิ่มอีกนิด ว่านี่คือ "จำนวนหน่วย (ม.)" */}
//             {isMeterUnit && (
//               <p className="text-xs text-muted-foreground">
//                 * สินค้านี้คิดตามหน่วยเมตร จำนวนด้านล่างคือ{" "}
//                 <span className="font-semibold">ความยาวรวม (เมตร)</span> ใน
//                 ตะกร้า
//               </p>
//             )}

//             <div className="flex items-center gap-4">
//               <span className="font-medium text-muted-foreground">
//                 จำนวน:
//               </span>
//               <div className="flex items-center border rounded-lg">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="h-9 w-9 p-0"
//                   onClick={handleDecrease}
//                   disabled={quantity <= 1}
//                 >
//                   <Minus className="h-4 w-4" />
//                 </Button>
//                 <span className="px-4 py-2 min-w-[3rem] text-center">
//                   {quantity.toLocaleString()}
//                 </span>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="h-9 w-9 p-0"
//                   onClick={handleIncrease}
//                 >
//                   <Plus className="h-4 w-4" />
//                 </Button>
//               </div>
//               {item.uom && (
//                 <span className="text-xs text-muted-foreground">
//                   หน่วย: {item.uom}
//                 </span>
//               )}
//             </div>
//           </div>

//           {/* สรุปยอดเล็ก ๆ ใน modal */}
//           <div className="mt-2 text-sm text-muted-foreground space-y-1">
//             <div>
//               ราคารวมใหม่:{" "}
//               <span className="font-bold text-foreground">
//                 ฿{lineTotal.toLocaleString()}
//               </span>
//             </div>
//             <div className="text-xs">
//               ({quantity.toLocaleString()} × ฿{price.toLocaleString()}
//               {item.uom ? ` / ${item.uom}` : ""})
//             </div>
//           </div>

//           {/* ปุ่ม action */}
//           <div className="mt-4 flex justify-end gap-2">
//             <Button variant="outline" onClick={onClose}>
//               ยกเลิก
//             </Button>
//             <Button onClick={handleSaveClick}>บันทึกการแก้ไข</Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

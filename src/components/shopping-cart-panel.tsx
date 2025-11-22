// v.1.1.4 =============================================
// src/components/shopping-cart-panel.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  ShoppingCart as CartIcon,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { useShoppingCartPanel } from "./use-shopping-cart-panel";

export type ShoppingCartPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ShoppingCartPanel({ isOpen, onClose }: ShoppingCartPanelProps) {
  const router = useRouter();

  const {
    items,
    selectedItems,
    loading,
    totalUniqueItems,
    selectedUniqueItems,
    selectedTotalPrice,
    toggleItemSelection,
    toggleAllItems,
    deleteItem,
  } = useShoppingCartPanel(isOpen);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-96 sm:max-w-md max-w-full overflow-hidden flex flex-col"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CartIcon className="h-5 w-5" />
            ตะกร้าสินค้า ({totalUniqueItems} รายการ)
          </SheetTitle>
          <SheetDescription className="sr-only">
            จัดการสินค้าในตะกร้าของคุณและดำเนินการชำระเงิน
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto py-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p>กำลังโหลดตะกร้าสินค้า...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <CartIcon className="h-12 w-12 mb-4" />
                <p>ตะกร้าสินค้าว่าง</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Select All Checkbox */}
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Checkbox
                    checked={
                      selectedItems.length === items.length && items.length > 0
                    }
                    onCheckedChange={toggleAllItems}
                  />
                  <span className="text-sm font-medium">เลือกทั้งหมด</span>
                </div>

                {items.map((item) => {
                  const discountLabel =
                    item.discountPercent != null && item.discountPercent > 0
                      ? `ประหยัด ${item.discountPercent}%`
                      : null;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 p-3 border rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => toggleItemSelection(item.id)}
                        />

                        {/* รูปสินค้า */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />

                        <div className="flex-1 min-w-0 space-y-0.5">
                          {/* บรรทัดที่ 1: ชื่อสินค้า */}
                          <h4 className="font-semibold text-sm line-clamp-2">
                            {item.name}
                          </h4>

                          {/* บรรทัดที่ 2: SKU */}
                          <div className="text-[11px] font-semibold text-foreground">
                            SKU: {item.sku}
                          </div>

                          {/* บรรทัดที่ 3: Brand */}
                          {item.brand && (
                            <div className="text-[11px] text-muted-foreground">
                              Brand: {item.brand}
                            </div>
                          )}

                          {/* บรรทัดที่ 4: ราคา / หน่วย + ส่วนลด */}
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                            <div className="flex items-baseline gap-1">
                              <span className="text-primary font-semibold text-sm">
                                ฿{item.price.toLocaleString()}
                              </span>
                              {item.uom && (
                                <span className="text-[11px] text-muted-foreground">
                                  / {item.uom}
                                </span>
                              )}
                            </div>

                            {item.originalPrice != null &&
                              item.originalPrice > item.price && (
                                <span className="text-[11px] text-muted-foreground line-through">
                                  ฿{item.originalPrice.toLocaleString()}
                                </span>
                              )}

                            {discountLabel && (
                              <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                                {discountLabel}
                              </span>
                            )}
                          </div>

                          {/* บรรทัดที่ 5: จำนวน */}
                          <div className="text-[11px] text-muted-foreground">
                            จำนวน:{" "}
                            <span className="font-medium text-foreground">
                              {item.quantity}{" "}
                              {item.uom ? item.uom : ""}
                            </span>
                          </div>

                          {/* บรรทัดที่ 6: ราคารวม */}
                          <div className="text-sm">
                            ราคารวม:{" "}
                            <span className="font-bold text-red-600 text-base">
                              ฿{item.lineTotal.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* ปุ่มลบ: ผูกกับ API /api/cart/remove */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-destructive"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {items.length > 0 && !loading && (
            <div className="border-t pt-4 mt-auto space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  รวม ({selectedUniqueItems} รายการ):
                </span>
                <span className="font-bold text-lg text-primary">
                  ฿{selectedTotalPrice.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  size="lg"
                  disabled={selectedItems.length === 0}
                  onClick={() => {
                    router.push("/checkout");
                    onClose();
                  }}
                >
                  ชำระเงิน ({selectedUniqueItems} รายการ)
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    router.push("/cart");
                    onClose();
                  }}
                >
                  ดูตะกร้าสินค้า
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// v.1.1.4 =============================================

// v.1.1.3 =============================================
// // src/components/shopping-cart-panel.tsx

// "use client";

// import { useRouter } from "next/navigation";
// import {
//   ShoppingCart as CartIcon,
//   Trash2,
//   Loader2,
// } from "lucide-react";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetDescription,
// } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";

// import { useShoppingCartPanel } from "./use-shopping-cart-panel";

// export type ShoppingCartPanelProps = {
//   isOpen: boolean;
//   onClose: () => void;
// };

// export function ShoppingCartPanel({ isOpen, onClose }: ShoppingCartPanelProps) {
//   const router = useRouter();

//   const {
//     items,
//     selectedItems,
//     loading,
//     totalUniqueItems,
//     selectedUniqueItems,
//     selectedTotalPrice,
//     toggleItemSelection,
//     toggleAllItems,
//     updateQuantity,
//   } = useShoppingCartPanel(isOpen);

//   return (
//     <Sheet open={isOpen} onOpenChange={onClose}>
//       <SheetContent
//         side="right"
//         className="w-96 sm:max-w-md max-w-full overflow-hidden flex flex-col"
//       >
//         <SheetHeader>
//           <SheetTitle className="flex items-center gap-2">
//             <CartIcon className="h-5 w-5" />
//             ตะกร้าสินค้า ({totalUniqueItems} รายการ)
//           </SheetTitle>
//           <SheetDescription className="sr-only">
//             จัดการสินค้าในตะกร้าของคุณและดำเนินการชำระเงิน
//           </SheetDescription>
//         </SheetHeader>

//         <div className="flex-1 flex flex-col min-h-0">
//           {/* Cart Items */}
//           <div className="flex-1 overflow-y-auto py-4">
//             {loading ? (
//               <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-3">
//                 <Loader2 className="h-6 w-6 animate-spin" />
//                 <p>กำลังโหลดตะกร้าสินค้า...</p>
//               </div>
//             ) : items.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
//                 <CartIcon className="h-12 w-12 mb-4" />
//                 <p>ตะกร้าสินค้าว่าง</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {/* Select All Checkbox */}
//                 <div className="flex items-center gap-2 pb-2 border-b">
//                   <Checkbox
//                     checked={
//                       selectedItems.length === items.length && items.length > 0
//                     }
//                     onCheckedChange={toggleAllItems}
//                   />
//                   <span className="text-sm font-medium">เลือกทั้งหมด</span>
//                 </div>

//                 {items.map((item) => {
//                   console.log("[ShoppingCartPanel] render item:", item);

//                   return (
//                     <div
//                       key={item.id}
//                       className="flex flex-col gap-3 p-3 border rounded-lg"
//                     >
//                       <div className="flex items-start gap-3">
//                         <Checkbox
//                           checked={selectedItems.includes(item.id)}
//                           onCheckedChange={() =>
//                             toggleItemSelection(item.id)
//                           }
//                         />
//                         {/* eslint-disable-next-line @next/next/no-img-element */}
//                         <img
//                           src={item.image}
//                           alt={item.name}
//                           className="w-16 h-16 object-cover rounded"
//                         />
//                         <div className="flex-1 min-w-0 space-y-0.5">
//                           {/* บรรทัดที่ 1: ชื่อสินค้า */}
//                           <h4 className="font-semibold text-sm line-clamp-2">
//                             {item.name}
//                           </h4>

//                           {/* บรรทัดที่ 2: SKU */}
//                           <div className="text-[11px] font-semibold text-foreground">
//                             SKU: {item.sku}
//                           </div>

//                           {/* บรรทัดที่ 3: Brand */}
//                           {item.brand && (
//                             <div className="text-[11px] text-muted-foreground">
//                               Brand: {item.brand}
//                             </div>
//                           )}

//                           {/* บรรทัดที่ 4: ราคาต่อหน่วย + หน่วย + ประหยัด XX% */}
//                           <div className="mt-1 flex flex-wrap items-center gap-2">
//                             <div className="flex items-baseline gap-1">
//                               <span className="text-primary font-semibold text-sm">
//                                 ฿{item.price.toLocaleString()}
//                               </span>
//                               {item.uom && (
//                                 <span className="text-[11px] text-muted-foreground">
//                                   / {item.uom}
//                                 </span>
//                               )}
//                             </div>

//                             {item.discountPercent != null &&
//                               item.discountPercent > 0 && (
//                                 <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
//                                   ประหยัด {item.discountPercent}%
//                                 </span>
//                               )}
//                           </div>

//                           {/* บรรทัดที่ 5: จำนวน : 7 BX. */}
//                           <div className="text-xs text-muted-foreground mt-1">
//                             จำนวน :{" "}
//                             <span className="font-semibold text-foreground">
//                               {item.quantity}
//                             </span>{" "}
//                             {item.uom}
//                           </div>

//                           {/* บรรทัดที่ 6: ราคารวม : ฿3,150 */}
//                           <div className="text-xs mt-1">
//                             <span className="text-muted-foreground">
//                               ราคารวม :{" "}
//                             </span>
//                             <span className="text-red-500 font-bold text-base">
//                               ฿{item.lineTotal.toLocaleString()}
//                             </span>
//                           </div>
//                         </div>

//                         {/* ปุ่มลบรายการ (ยังใช้ updateQuantity(id, 0) เหมือนเดิม) */}
//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           className="h-6 w-6 text-destructive"
//                           onClick={() => updateQuantity(item.id, 0)}
//                         >
//                           <Trash2 className="h-3 w-3" />
//                         </Button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* Cart Summary */}
//           {items.length > 0 && !loading && (
//             <div className="border-t pt-4 mt-auto space-y-4">
//               <div className="flex justify-between items-center">
//                 <span className="font-medium">
//                   รวม ({selectedUniqueItems} รายการ):
//                 </span>
//                 <span className="font-bold text-lg text-primary">
//                   ฿{selectedTotalPrice.toLocaleString()}
//                 </span>
//               </div>

//               <div className="space-y-2">
//                 <Button
//                   className="w-full"
//                   size="lg"
//                   disabled={selectedItems.length === 0}
//                   onClick={() => {
//                     router.push("/checkout");
//                     onClose();
//                   }}
//                 >
//                   ชำระเงิน ({selectedUniqueItems} รายการ)
//                 </Button>
//                 <Button
//                   variant="outline"
//                   className="w-full"
//                   onClick={() => {
//                     router.push("/cart");
//                     onClose();
//                   }}
//                 >
//                   ดูตะกร้าสินค้า
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       </SheetContent>
//     </Sheet>
//   );
// }

// v.1.1.3 =============================================

// v.1.1.2 =============================================
// // src/components/shopping-cart-panel.tsx
// "use client";

// import { useRouter } from "next/navigation";
// import {
//   ShoppingCart as CartIcon,
//   Plus,
//   Minus,
//   Trash2,
//   Loader2,
// } from "lucide-react";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetDescription,
// } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";

// import { useShoppingCartPanel } from "./use-shopping-cart-panel";

// export type ShoppingCartPanelProps = {
//   isOpen: boolean;
//   onClose: () => void;
// };

// export function ShoppingCartPanel({ isOpen, onClose }: ShoppingCartPanelProps) {
//   const router = useRouter();

//   const {
//     items,
//     selectedItems,
//     loading,
//     totalUniqueItems,
//     selectedUniqueItems,
//     selectedTotalPrice,
//     toggleItemSelection,
//     toggleAllItems,
//     updateQuantity,
//   } = useShoppingCartPanel(isOpen);

//   return (
//     <Sheet open={isOpen} onOpenChange={onClose}>
//       <SheetContent
//         side="right"
//         className="w-96 sm:max-w-md max-w-full overflow-hidden flex flex-col"
//       >
//         <SheetHeader>
//           <SheetTitle className="flex items-center gap-2">
//             <CartIcon className="h-5 w-5" />
//             ตะกร้าสินค้า ({totalUniqueItems} รายการ)
//           </SheetTitle>
//           <SheetDescription className="sr-only">
//             จัดการสินค้าในตะกร้าของคุณและดำเนินการชำระเงิน
//           </SheetDescription>
//         </SheetHeader>

//         <div className="flex-1 flex flex-col min-h-0">
//           {/* Cart Items */}
//           <div className="flex-1 overflow-y-auto py-4">
//             {loading ? (
//               <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-3">
//                 <Loader2 className="h-6 w-6 animate-spin" />
//                 <p>กำลังโหลดตะกร้าสินค้า...</p>
//               </div>
//             ) : items.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
//                 <CartIcon className="h-12 w-12 mb-4" />
//                 <p>ตะกร้าสินค้าว่าง</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {/* Select All Checkbox */}
//                 <div className="flex items-center gap-2 pb-2 border-b">
//                   <Checkbox
//                     checked={
//                       selectedItems.length === items.length && items.length > 0
//                     }
//                     onCheckedChange={toggleAllItems}
//                   />
//                   <span className="text-sm font-medium">เลือกทั้งหมด</span>
//                 </div>

//                 {items.map((item) => {
//                   console.log("[ShoppingCartPanel] render item:", item);

//                   return (
//                     <div
//                       key={item.id}
//                       className="flex flex-col gap-3 p-3 border rounded-lg"
//                     >
//                       <div className="flex items-start gap-3">
//                         <Checkbox
//                           checked={selectedItems.includes(item.id)}
//                           onCheckedChange={() =>
//                             toggleItemSelection(item.id)
//                           }
//                         />
//                         {/* eslint-disable-next-line @next/next/no-img-element */}
//                         <img
//                           src={item.image}
//                           alt={item.name}
//                           className="w-16 h-16 object-cover rounded"
//                         />
//                         <div className="flex-1 min-w-0">
//                           <h4 className="font-medium text-sm line-clamp-2">
//                             {item.name}
//                           </h4>

//                           <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
//                             <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
//                               {item.brand && (
//                                 <span className="font-semibold text-foreground">
//                                   {item.brand}
//                                 </span>
//                               )}
//                               <span className="text-[11px] uppercase tracking-wide">
//                                 SKU: {item.sku}
//                               </span>
//                               {item.uom && (
//                                 <span className="text-[11px]">
//                                   / {item.uom}
//                                 </span>
//                               )}
//                             </div>
//                           </div>

//                           <div className="flex items-center gap-2 mt-1">
//                             <p className="text-primary font-semibold">
//                               ฿{item.price.toLocaleString()}
//                             </p>
//                             {item.originalPrice != null &&
//                               item.originalPrice > item.price && (
//                                 <p className="text-xs text-muted-foreground line-through">
//                                   ฿{item.originalPrice.toLocaleString()}
//                                 </p>
//                               )}
//                             {item.discountPercent != null &&
//                               item.discountPercent > 0 && (
//                                 <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
//                                   -{item.discountPercent}%
//                                 </span>
//                               )}
//                           </div>

//                           <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
//                             <span>
//                               รวม:{" "}
//                               <span className="font-semibold text-foreground">
//                                 ฿{item.lineTotal.toLocaleString()}
//                               </span>
//                             </span>

//                             {item.freeShippingEligible && (
//                               <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px]">
//                                 ส่งฟรี
//                                 {item.freeShipMinimum
//                                   ? ` เมื่อครบ ฿${item.freeShipMinimum.toLocaleString()}`
//                                   : ""}
//                               </span>
//                             )}
//                           </div>
//                         </div>

//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           className="h-6 w-6 text-destructive"
//                           onClick={() => updateQuantity(item.id, 0)}
//                         >
//                           <Trash2 className="h-3 w-3" />
//                         </Button>
//                       </div>

//                       <div className="flex items-center justify-end gap-2">
//                         <span className="text-sm text-muted-foreground">
//                           จำนวน:
//                         </span>
//                         <div className="flex items-center gap-2">
//                           <Button
//                             size="icon"
//                             variant="outline"
//                             className="h-7 w-7"
//                             onClick={() =>
//                               updateQuantity(item.id, item.quantity - 1)
//                             }
//                           >
//                             <Minus className="h-3 w-3" />
//                           </Button>
//                           <span className="w-8 text-center text-sm">
//                             {item.quantity}
//                           </span>
//                           <Button
//                             size="icon"
//                             variant="outline"
//                             className="h-7 w-7"
//                             onClick={() =>
//                               updateQuantity(item.id, item.quantity + 1)
//                             }
//                           >
//                             <Plus className="h-3 w-3" />
//                           </Button>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* Cart Summary */}
//           {items.length > 0 && !loading && (
//             <div className="border-t pt-4 mt-auto space-y-4">
//               <div className="flex justify-between items-center">
//                 <span className="font-medium">
//                   รวม ({selectedUniqueItems} รายการ):
//                 </span>
//                 <span className="font-bold text-lg text-primary">
//                   ฿{selectedTotalPrice.toLocaleString()}
//                 </span>
//               </div>

//               <div className="space-y-2">
//                 <Button
//                   className="w-full"
//                   size="lg"
//                   disabled={selectedItems.length === 0}
//                   onClick={() => {
//                     router.push("/checkout");
//                     onClose();
//                   }}
//                 >
//                   ชำระเงิน ({selectedUniqueItems} รายการ)
//                 </Button>
//                 <Button
//                   variant="outline"
//                   className="w-full"
//                   onClick={() => {
//                     router.push("/cart");
//                     onClose();
//                   }}
//                 >
//                   ดูตะกร้าสินค้า
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       </SheetContent>
//     </Sheet>
//   );
// }

// v.1.1.2 =============================================

// // src/components/shopping-cart-panel.tsx

// "use client";

// import { useRouter } from "next/navigation";
// import {
//   ShoppingCart as CartIcon,
//   Plus,
//   Minus,
//   Trash2,
//   Loader2,
// } from "lucide-react";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetDescription,
// } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";

// import { useShoppingCartPanel } from "./use-shopping-cart-panel";

// export type ShoppingCartPanelProps = {
//   isOpen: boolean;
//   onClose: () => void;
// };

// export function ShoppingCartPanel({ isOpen, onClose }: ShoppingCartPanelProps) {
//   const router = useRouter();

//   const {
//     items,
//     selectedItems,
//     loading,
//     totalUniqueItems,
//     selectedUniqueItems,
//     selectedTotalPrice,
//     toggleItemSelection,
//     toggleAllItems,
//     updateQuantity,
//   } = useShoppingCartPanel(isOpen);

//   return (
//     <Sheet open={isOpen} onOpenChange={onClose}>
//       <SheetContent
//         side="right"
//         className="w-96 sm:max-w-md max-w-full overflow-hidden flex flex-col"
//       >
//         <SheetHeader>
//           <SheetTitle className="flex items-center gap-2">
//             <CartIcon className="h-5 w-5" />
//             ตะกร้าสินค้า ({totalUniqueItems} รายการ)
//           </SheetTitle>
//           <SheetDescription className="sr-only">
//             จัดการสินค้าในตะกร้าของคุณและดำเนินการชำระเงิน
//           </SheetDescription>
//         </SheetHeader>

//         <div className="flex-1 flex flex-col min-h-0">
//           {/* Cart Items */}
//           <div className="flex-1 overflow-y-auto py-4">
//             {loading ? (
//               <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-3">
//                 <Loader2 className="h-6 w-6 animate-spin" />
//                 <p>กำลังโหลดตะกร้าสินค้า...</p>
//               </div>
//             ) : items.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
//                 <CartIcon className="h-12 w-12 mb-4" />
//                 <p>ตะกร้าสินค้าว่าง</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {/* Select All Checkbox */}
//                 <div className="flex items-center gap-2 pb-2 border-b">
//                   <Checkbox
//                     checked={
//                       selectedItems.length === items.length && items.length > 0
//                     }
//                     onCheckedChange={toggleAllItems}
//                   />
//                   <span className="text-sm font-medium">เลือกทั้งหมด</span>
//                 </div>

//                 {items.map((item) => {
//                     console.log("[ShoppingCartPanel] render image:", item.image);

//                     return (
//                         <div
//                         key={item.id}
//                         className="flex flex-col gap-3 p-3 border rounded-lg"
//                         >
//                         <div className="flex items-start gap-3">
//                             <Checkbox
//                             checked={selectedItems.includes(item.id)}
//                             onCheckedChange={() => toggleItemSelection(item.id)}
//                             />
//                             {/* eslint-disable-next-line @next/next/no-img-element */}
//                             <img
//                             src={item.image}
//                             alt={item.name}
//                             className="w-16 h-16 object-cover rounded"
//                             />
//                             <div className="flex-1">
//                             <h4 className="font-medium text-sm">{item.name}</h4>
//                             {/* debug: แสดง path รูปเล็ก ๆ ใต้ชื่อ */}
//                             <p className="text-[10px] text-muted-foreground break-all">
//                                 {item.image}
//                             </p>
//                             <div className="flex items-center gap-2 mt-1">
//                                 <p className="text-primary font-semibold">
//                                 ฿{item.price.toLocaleString()}
//                                 </p>
//                             </div>
//                             </div>
//                             <Button
//                             size="icon"
//                             variant="ghost"
//                             className="h-6 w-6 text-destructive"
//                             onClick={() => updateQuantity(item.id, 0)}
//                             >
//                             <Trash2 className="h-3 w-3" />
//                             </Button>
//                         </div>
//                         ...
//                         </div>
//                     );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* Cart Summary */}
//           {items.length > 0 && !loading && (
//             <div className="border-t pt-4 mt-auto space-y-4">
//               <div className="flex justify-between items-center">
//                 <span className="font-medium">
//                   รวม ({selectedUniqueItems} รายการ):
//                 </span>
//                 <span className="font-bold text-lg text-primary">
//                   ฿{selectedTotalPrice.toLocaleString()}
//                 </span>
//               </div>

//               <div className="space-y-2">
//                 <Button
//                   className="w-full"
//                   size="lg"
//                   disabled={selectedItems.length === 0}
//                   onClick={() => {
//                     router.push("/checkout");
//                     onClose();
//                   }}
//                 >
//                   ชำระเงิน ({selectedUniqueItems} รายการ)
//                 </Button>
//                 <Button
//                   variant="outline"
//                   className="w-full"
//                   onClick={() => {
//                     router.push("/cart");
//                     onClose();
//                   }}
//                 >
//                   ดูตะกร้าสินค้า
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       </SheetContent>
//     </Sheet>
//   );
// }

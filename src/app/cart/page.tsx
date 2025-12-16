// v.1.1.13 ==================================================================
// src/app/cart/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Loader2, ShoppingCart as CartIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

import {
  useShoppingCartPanel,
  type UICartItem,
} from "@/components/use-shopping-cart-panel";

type StockCheckError = {
  sku: string;
  reason:
    | "NAVISION_STOCK_NOT_ENOUGH"
    | "NAVISION_INVALID_RESPONSE"
    | "ROLL_STOCK_NOT_ENOUGH";
  meta?: any;
};

type StockCheckResult = {
  ok: boolean;
  errors?: StockCheckError[];
};

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
  } = useShoppingCartPanel(true);

  const subtotal = selectedTotalPrice;
  const shippingFee = subtotal === 0 ? 0 : 0;
  const total = subtotal + shippingFee;

  const [checkingStock, setCheckingStock] = useState(false);

  /** highlight รายการที่สต๊อกไม่พอ */
  const [insufficientIds, setInsufficientIds] = useState<number[]>([]);

  const insufficientIdSet = useMemo(
    () => new Set(insufficientIds),
    [insufficientIds],
  );

  /* ===============================
   * เช็คสต๊อก ก่อนเข้า checkout
   * - ส่งเฉพาะรายการที่ถูกเลือก
   * - uom=M. -> quantity=1, total=เมตรรวม
   * =============================== */
  const handleProceedCheckout = async () => {
    try {
      setCheckingStock(true);
      setInsufficientIds([]);

      const selected = items.filter((i) => selectedItems.includes(i.id));

      const payload = {
        items: selected.map((i) => {
          if (i.uom === "M.") {
            return {
              sku: i.sku,
              uom: i.uom,
              quantity: 1, // 1 ROLL
              total: Number(i.quantity), // เมตรรวม
            };
          }

          return {
            sku: i.sku,
            uom: i.uom,
            quantity: Number(i.quantity ?? 0),
            total: 0,
          };
        }),
      };

      const res = await fetch("/api/stock/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await res.json()) as StockCheckResult;

      if (!result?.ok) {
        // map sku -> cart item ids เพื่อทำกรอบแดง
        const badSkuSet = new Set((result?.errors ?? []).map((e) => e.sku));
        const badIds = selected
          .filter((i) => badSkuSet.has(i.sku))
          .map((i) => i.id);

        setInsufficientIds(badIds);

        toast({
          title: "สต๊อกไม่เพียงพอ",
          description:
            "พบสินค้าบางรายการสต๊อกไม่พอ ระบบไฮไลต์กรอบแดงให้แล้ว กรุณาแก้ไขรายการ",
          variant: "destructive",
        });

        // auto-scroll ไปหารายการแรกที่ไม่พอ
        const firstId = badIds[0];
        if (firstId != null) {
          requestAnimationFrame(() => {
            document
              .querySelector(`[data-cart-item-id="${firstId}"]`)
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          });
        }

        return;
      }

      router.push("/checkout");
    } catch (err) {
      console.error("[CART][STOCK][ERROR]", err);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถตรวจสอบสต๊อกได้",
        variant: "destructive",
      });
    } finally {
      setCheckingStock(false);
    }
  };

  /* ===============================
   * แก้ไขรายการ (ทำแบบเดียวกันทุก UOM)
   * - ลบรายการเดิมออก (status=3 ผ่าน /api/cart/remove)
   * - เด้งไป /product/[id]?redirect=/cart
   * =============================== */
  const handleEditItem = (item: UICartItem) => {
    const productId = (item as any).productId as number | null | undefined;

    if (!productId) {
      toast({
        title: "ไม่พบ productId",
        description: `ไม่สามารถไปหน้าแก้ไขสินค้าได้ (SKU: ${item.sku})`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "กำลังแก้ไขรายการ",
      description: "ระบบจะลบรายการเดิมและให้คุณเลือกใหม่อีกครั้ง",
    });

    // ลบแบบเดียวกับปุ่มลบ (optimistic + ยิง /api/cart/remove)
    deleteItem(item.id);

    // ไปหน้า product และบอกให้กลับ cart หลังเพิ่มสำเร็จ
    router.push(`/product/${productId}?redirect=/cart`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CartIcon className="h-5 w-5" />
            ตะกร้าสินค้า
            <span className="text-base font-normal text-muted-foreground">
              ({totalUniqueItems} รายการ)
            </span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-sm gap-3 bg-card rounded-lg border">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p>กำลังโหลดตะกร้าสินค้า...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-card rounded-lg border">
                <CartIcon className="h-12 w-12 mb-4" />
                <p>ตะกร้าสินค้าว่าง</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                  <Checkbox
                    checked={
                      selectedItems.length === items.length && items.length > 0
                    }
                    onCheckedChange={toggleAllItems}
                  />
                  <span className="font-medium">
                    เลือกทั้งหมด ({totalUniqueItems} รายการ)
                  </span>
                </div>

                {items.map((item) => {
                  const isBad = insufficientIdSet.has(item.id);

                  return (
                    <div
                      key={item.id}
                      data-cart-item-id={item.id}
                      className={[
                        "p-4 bg-card rounded-lg border transition",
                        isBad ? "border-red-600 ring-2 ring-red-200" : "",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => toggleItemSelection(item.id)}
                        />

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

                          <div className="text-[11px] font-semibold">
                            SKU: {item.sku}
                          </div>

                          <div className="text-[11px] text-muted-foreground">
                            จำนวน: {item.quantity} {item.uom ?? ""}
                          </div>

                          <div className="text-sm flex items-center justify-between mt-1">
                            <div>
                              ราคารวม:{" "}
                              <span className="font-bold text-red-600 text-base">
                                ฿{Number(item.lineTotal).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditItem(item)}
                              >
                                แก้ไขรายการ
                              </Button>
                            </div>
                          </div>

                          {isBad && (
                            <div className="text-xs text-red-600 font-medium pt-1">
                              ❗ สต๊อกไม่พอ กรุณาแก้ไขรายการนี้
                            </div>
                          )}
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Right */}
          <div className="space-y-4">
            <div className="p-4 bg-card rounded-lg border">
              <h3 className="font-bold mb-4">สรุปคำสั่งซื้อ</h3>

              {items.length === 0 && !loading ? (
                <p className="text-sm text-muted-foreground">
                  ยังไม่มีสินค้าในตะกร้า
                </p>
              ) : (
                <>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>ยอดรวม ({selectedUniqueItems} รายการ)</span>
                      <span>฿{Number(subtotal).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>ค่าจัดส่ง</span>
                      <span>{subtotal === 0 ? "-" : "ฟรี"}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-bold text-lg">
                      <span>รวมทั้งสิ้น</span>
                      <span className="text-primary">
                        ฿{Number(total).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">รวม VAT แล้ว</p>
                  </div>

                  <Button
                    className="w-full mt-4"
                    size="lg"
                    disabled={
                      selectedItems.length === 0 ||
                      items.length === 0 ||
                      checkingStock
                    }
                    onClick={handleProceedCheckout}
                  >
                    {checkingStock
                      ? "กำลังตรวจสอบสต๊อก..."
                      : `ดำเนินการชำระเงิน (${selectedUniqueItems})`}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// v.1.1.13 ==================================================================

// v.1.1.12 ===================================================================
// // src/app/cart/page.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";
// import { ArrowLeft, Trash2, Loader2, ShoppingCart as CartIcon } from "lucide-react";

// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import { useShoppingCartPanel } from "@/components/use-shopping-cart-panel";
// import { useToast } from "@/components/ui/use-toast";

// type InsufficientItem = {
//   sku: string;
//   reason?: string;
//   meta?: any;
// };

// export default function CartPage() {
//   const router = useRouter();
//   const { toast } = useToast();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   const {
//     items,
//     selectedItems,
//     loading,
//     totalUniqueItems,
//     selectedUniqueItems,
//     selectedTotalPrice,
//     toggleItemSelection,
//     toggleAllItems,
//     deleteItem,
//   } = useShoppingCartPanel(true);

//   const subtotal = selectedTotalPrice;
//   const shippingFee = subtotal === 0 ? 0 : 0;
//   const total = subtotal + shippingFee;

//   const [checkingStock, setCheckingStock] = useState(false);

//   // ✅ เก็บ sku ที่สต๊อกไม่พอ เพื่อทำกรอบแดง + scroll
//   const [insufficientSkus, setInsufficientSkus] = useState<string[]>([]);
//   const [insufficientMap, setInsufficientMap] = useState<Record<string, InsufficientItem>>({});

//   // ✅ เฉพาะ items ที่ถูกเลือก (ใช้สำหรับ payload)
//   const selectedCartItems = useMemo(
//     () => items.filter((i) => selectedItems.includes(i.id)),
//     [items, selectedItems],
//   );

//   /* ===============================
//    * เช็คสต๊อก ก่อนเข้า checkout (เหมือนหน้า checkout)
//    * =============================== */
//   const handleProceedCheckout = async () => {
//     try {
//       setCheckingStock(true);
//       // reset highlight รอบก่อน
//       setInsufficientSkus([]);
//       setInsufficientMap({});

//       const payload = {
//         items: selectedCartItems.map((i) => {
//           // 🔑 สำคัญมาก
//           // uom = M. → quantity ใน cart คือ "เมตรรวม"
//           if (i.uom === "M.") {
//             return {
//               sku: i.sku,
//               uom: i.uom,
//               quantity: 1, // ✅ 1 ROLL
//               total: Number(i.quantity), // ✅ เมตรรวม
//             };
//           }

//           // สินค้าปกติ
//           return {
//             sku: i.sku,
//             uom: i.uom,
//             quantity: Number(i.quantity ?? 0),
//             total: 0,
//           };
//         }),
//       };

//       const res = await fetch("/api/stock/check", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const result = await res.json();

//       if (!result?.ok) {
//         // ✅ รองรับได้ 2 แบบ:
//         // 1) result.insufficientItems: [{ sku, reason, meta }]
//         // 2) result.errors: [{ sku, reason, meta }]
//         const raw: any[] = Array.isArray(result?.insufficientItems)
//           ? result.insufficientItems
//           : Array.isArray(result?.errors)
//           ? result.errors
//           : [];

//         const list: InsufficientItem[] = raw
//           .map((x) => ({
//             sku: String(x?.sku ?? "").trim(),
//             reason: x?.reason,
//             meta: x?.meta,
//           }))
//           .filter((x) => !!x.sku);

//         const skus = Array.from(new Set(list.map((x) => x.sku)));

//         const map: Record<string, InsufficientItem> = {};
//         for (const it of list) map[it.sku] = it;

//         setInsufficientSkus(skus);
//         setInsufficientMap(map);

//         toast({
//           title: "สต๊อกไม่เพียงพอ",
//           description: skus.length
//             ? `พบสินค้าไม่พอ ${skus.length} รายการ (ไฮไลต์สีแดงแล้ว) — คลิกรายการสีแดงเพื่อไปเลือกใหม่`
//             : "สินค้าบางรายการไม่พอ กรุณาตรวจสอบตะกร้า",
//           variant: "destructive",
//         });

//         // ✅ auto-scroll ไปหารายการแดงตัวแรก
//         if (skus.length > 0) {
//           requestAnimationFrame(() => {
//             const el = document.querySelector(`[data-sku="${CSS.escape(skus[0])}"]`);
//             (el as HTMLElement | null)?.scrollIntoView({
//               behavior: "smooth",
//               block: "center",
//             });
//           });
//         }

//         return;
//       }

//       router.push("/checkout");
//     } catch (err) {
//       console.error("[CART][STOCK][ERROR]", err);
//       toast({
//         title: "เกิดข้อผิดพลาด",
//         description: "ไม่สามารถตรวจสอบสต๊อกได้",
//         variant: "destructive",
//       });
//     } finally {
//       setCheckingStock(false);
//     }
//   };

//   // ✅ คลิกที่รายการแดง: ลบออก + ไปหน้า product เพื่อเลือกใหม่
//   const handleClickInsufficientItem = (item: any) => {
//     // item ต้องมี sku เสมอ
//     const sku = String(item?.sku ?? "").trim();
//     if (!sku) return;

//     // 1) ลบจากตะกร้า (เหมือนปุ่มลบ: status=3 ผ่าน /api/cart/remove)
//     deleteItem(item.id);

//     // 2) ไปหน้า product/[id] ถ้ามี productId
//     const productId = (item as any).productId ?? null;

//     if (productId != null && String(productId) !== "") {
//       router.push(`/product/${productId}?returnTo=${encodeURIComponent("/cart")}`);
//       return;
//     }

//     // fallback: ถ้าไม่มี productId (กันกรณี backend ยังไม่ส่งมา)
//     router.push(`/products?sku=${encodeURIComponent(sku)}`);
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Button variant="ghost" size="icon" onClick={() => router.back()}>
//             <ArrowLeft className="h-5 w-5" />
//           </Button>
//           <h1 className="text-2xl font-bold flex items-center gap-2">
//             <CartIcon className="h-5 w-5" />
//             ตะกร้าสินค้า
//             <span className="text-base font-normal text-muted-foreground">
//               ({totalUniqueItems} รายการ)
//             </span>
//           </h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left */}
//           <div className="lg:col-span-2 space-y-4">
//             {loading ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-sm gap-3 bg-card rounded-lg border">
//                 <Loader2 className="h-6 w-6 animate-spin" />
//                 <p>กำลังโหลดตะกร้าสินค้า...</p>
//               </div>
//             ) : items.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-card rounded-lg border">
//                 <CartIcon className="h-12 w-12 mb-4" />
//                 <p>ตะกร้าสินค้าว่าง</p>
//               </div>
//             ) : (
//               <>
//                 <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
//                   <Checkbox
//                     checked={selectedItems.length === items.length && items.length > 0}
//                     onCheckedChange={toggleAllItems}
//                   />
//                   <span className="font-medium">
//                     เลือกทั้งหมด ({totalUniqueItems} รายการ)
//                   </span>
//                 </div>

//                 {items.map((item: any) => {
//                   const sku = String(item.sku ?? "");
//                   const isBad = sku && insufficientSkus.includes(sku);
//                   const err = sku ? insufficientMap[sku] : undefined;

//                   return (
//                     <div
//                       key={item.id}
//                       data-sku={sku}
//                       className={cn(
//                         "p-4 bg-card rounded-lg border transition",
//                         isBad && "border-red-500 bg-red-50/60",
//                         isBad && "cursor-pointer hover:bg-red-50",
//                       )}
//                       onClick={() => {
//                         if (isBad) handleClickInsufficientItem(item);
//                       }}
//                     >
//                       <div className="flex items-start gap-3">
//                         <Checkbox
//                           checked={selectedItems.includes(item.id)}
//                           onCheckedChange={() => toggleItemSelection(item.id)}
//                           onClick={(e) => e.stopPropagation()}
//                         />

//                         {/* eslint-disable-next-line @next/next/no-img-element */}
//                         <img
//                           src={item.image}
//                           alt={item.name}
//                           className="w-20 h-20 object-cover rounded border"
//                         />

//                         <div className="flex-1 min-w-0 space-y-1">
//                           <h3 className="font-semibold text-sm line-clamp-2">
//                             {item.name}
//                           </h3>

//                           <div className="text-[11px] font-semibold">
//                             SKU: {item.sku}
//                           </div>

//                           <div className="text-[11px] text-muted-foreground">
//                             จำนวน: {item.quantity} {item.uom ?? ""}
//                           </div>

//                           <div className="text-sm flex items-center justify-between mt-1">
//                             <div>
//                               ราคารวม:{" "}
//                               <span className="font-bold text-red-600 text-base">
//                                 ฿{Number(item.lineTotal).toLocaleString()}
//                               </span>
//                             </div>
//                           </div>

//                           {isBad && (
//                             <div className="mt-2 text-sm font-semibold text-red-700">
//                               ❌ สต๊อกไม่พอ — คลิกเพื่อไปเลือกใหม่
//                               {err?.reason ? (
//                                 <span className="ml-2 text-xs font-normal text-red-700/80">
//                                   ({err.reason})
//                                 </span>
//                               ) : null}
//                             </div>
//                           )}
//                         </div>

//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           className="h-8 w-8 text-destructive"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             deleteItem(item.id);
//                           }}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </>
//             )}
//           </div>

//           {/* Right */}
//           <div className="space-y-4">
//             <div className="p-4 bg-card rounded-lg border">
//               <h3 className="font-bold mb-4">สรุปคำสั่งซื้อ</h3>

//               {items.length === 0 && !loading ? (
//                 <p className="text-sm text-muted-foreground">
//                   ยังไม่มีสินค้าในตะกร้า
//                 </p>
//               ) : (
//                 <>
//                   <div className="space-y-3 text-sm">
//                     <div className="flex justify-between">
//                       <span>ยอดรวม ({selectedUniqueItems} รายการ)</span>
//                       <span>฿{Number(subtotal).toLocaleString()}</span>
//                     </div>

//                     <div className="flex justify-between">
//                       <span>ค่าจัดส่ง</span>
//                       <span>{subtotal === 0 ? "-" : "ฟรี"}</span>
//                     </div>

//                     <Separator />

//                     <div className="flex justify-between font-bold text-lg">
//                       <span>รวมทั้งสิ้น</span>
//                       <span className="text-primary">
//                         ฿{Number(total).toLocaleString()}
//                       </span>
//                     </div>

//                     <p className="text-xs text-muted-foreground">รวม VAT แล้ว</p>
//                   </div>

//                   <Button
//                     className="w-full mt-4"
//                     size="lg"
//                     disabled={
//                       selectedItems.length === 0 ||
//                       items.length === 0 ||
//                       checkingStock
//                     }
//                     onClick={handleProceedCheckout}
//                   >
//                     {checkingStock
//                       ? "กำลังตรวจสอบสต๊อก..."
//                       : `ดำเนินการชำระเงิน (${selectedUniqueItems})`}
//                   </Button>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.12 ===================================================================

// v.1.1.11 ===================================================================
// // src/app/cart/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   ArrowLeft,
//   Trash2,
//   Loader2,
//   ShoppingCart as CartIcon,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import {
//   useShoppingCartPanel,
//   type UICartItem,
// } from "@/components/use-shopping-cart-panel";
// import { useToast } from "@/components/ui/use-toast";

// import { CartEditProductModal } from "./CartEditProductModal";

// export default function CartPage() {
//   const router = useRouter();
//   const { toast } = useToast();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

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
//     deleteItem,
//   } = useShoppingCartPanel(true);

//   const subtotal = selectedTotalPrice;
//   const shippingFee = subtotal === 0 ? 0 : 0;
//   const total = subtotal + shippingFee;

//   const [editingItem, setEditingItem] = useState<UICartItem | null>(null);
//   const [editOpen, setEditOpen] = useState(false);
//   const [checkingStock, setCheckingStock] = useState(false);

//   const handleOpenEdit = (item: UICartItem) => {
//     setEditingItem(item);
//     setEditOpen(true);
//   };

//   const handleCloseEdit = () => {
//     setEditOpen(false);
//     setEditingItem(null);
//   };

//   const handleUpdatedFromModal = (payload: {
//     id: number;
//     quantityForCart: number;
//   }) => {
//     updateQuantity(payload.id, payload.quantityForCart);
//   };

//   /* ===============================
//    * เช็คสต๊อก 2 ชั้น ก่อนเข้า checkout
//    * =============================== */
//   const handleProceedCheckout = async () => {
//     try {
//       setCheckingStock(true);

//       const payload = {
//         items: items
//           .filter((i) => selectedItems.includes(i.id))
//           .map((i) => {
//             // 🔑 สำคัญมาก
//             // uom = M. → quantity ใน cart คือ "เมตรรวม"
//             if (i.uom === "M.") {
//               return {
//                 sku: i.sku,
//                 uom: i.uom,
//                 quantity: 1,              // ✅ 1 ROLL
//                 total: Number(i.quantity) // ✅ เมตรรวม
//               };
//             }

//             // สินค้าปกติ
//             return {
//               sku: i.sku,
//               uom: i.uom,
//               quantity: i.quantity,
//               total: 0,
//             };
//           }),
//       };

//       const res = await fetch("/api/stock/check", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const result = await res.json();

//       if (!result?.ok) {
//         toast({
//           title: "สต๊อกไม่เพียงพอ",
//           description:
//             "สินค้าบางรายการไม่พอสำหรับความยาวที่เลือก กรุณาตรวจสอบตะกร้า",
//           variant: "destructive",
//         });
//         return;
//       }

//       router.push("/checkout");
//     } catch (err) {
//       console.error("[CART][STOCK][ERROR]", err);
//       toast({
//         title: "เกิดข้อผิดพลาด",
//         description: "ไม่สามารถตรวจสอบสต๊อกได้",
//         variant: "destructive",
//       });
//     } finally {
//       setCheckingStock(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Button variant="ghost" size="icon" onClick={() => router.back()}>
//             <ArrowLeft className="h-5 w-5" />
//           </Button>
//           <h1 className="text-2xl font-bold flex items-center gap-2">
//             <CartIcon className="h-5 w-5" />
//             ตะกร้าสินค้า
//             <span className="text-base font-normal text-muted-foreground">
//               ({totalUniqueItems} รายการ)
//             </span>
//           </h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left */}
//           <div className="lg:col-span-2 space-y-4">
//             {loading ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-sm gap-3 bg-card rounded-lg border">
//                 <Loader2 className="h-6 w-6 animate-spin" />
//                 <p>กำลังโหลดตะกร้าสินค้า...</p>
//               </div>
//             ) : items.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-card rounded-lg border">
//                 <CartIcon className="h-12 w-12 mb-4" />
//                 <p>ตะกร้าสินค้าว่าง</p>
//               </div>
//             ) : (
//               <>
//                 <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
//                   <Checkbox
//                     checked={
//                       selectedItems.length === items.length && items.length > 0
//                     }
//                     onCheckedChange={toggleAllItems}
//                   />
//                   <span className="font-medium">
//                     เลือกทั้งหมด ({totalUniqueItems} รายการ)
//                   </span>
//                 </div>

//                 {items.map((item) => (
//                   <div key={item.id} className="p-4 bg-card rounded-lg border">
//                     <div className="flex items-start gap-3">
//                       <Checkbox
//                         checked={selectedItems.includes(item.id)}
//                         onCheckedChange={() => toggleItemSelection(item.id)}
//                       />

//                       <img
//                         src={item.image}
//                         alt={item.name}
//                         className="w-20 h-20 object-cover rounded border"
//                       />

//                       <div className="flex-1 min-w-0 space-y-1">
//                         <h3 className="font-semibold text-sm line-clamp-2">
//                           {item.name}
//                         </h3>

//                         <div className="text-[11px] font-semibold">
//                           SKU: {item.sku}
//                         </div>

//                         <div className="text-[11px] text-muted-foreground">
//                           จำนวน: {item.quantity} {item.uom ?? ""}
//                         </div>

//                         <div className="text-sm flex items-center justify-between mt-1">
//                           <div>
//                             ราคารวม:{" "}
//                             <span className="font-bold text-red-600 text-base">
//                               ฿{Number(item.lineTotal).toLocaleString()}
//                             </span>
//                           </div>

//                          {item.uom !== "M." && (
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="ml-4"
//                               onClick={() => handleOpenEdit(item)}
//                             >
//                               แก้ไขรายการ
//                             </Button>
//                           )}
//                         </div>
//                       </div>

//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         className="h-8 w-8 text-destructive"
//                         onClick={() => deleteItem(item.id)}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </>
//             )}
//           </div>

//           {/* Right */}
//           <div className="space-y-4">
//             <div className="p-4 bg-card rounded-lg border">
//               <h3 className="font-bold mb-4">สรุปคำสั่งซื้อ</h3>

//               {items.length === 0 && !loading ? (
//                 <p className="text-sm text-muted-foreground">
//                   ยังไม่มีสินค้าในตะกร้า
//                 </p>
//               ) : (
//                 <>
//                   <div className="space-y-3 text-sm">
//                     <div className="flex justify-between">
//                       <span>ยอดรวม ({selectedUniqueItems} รายการ)</span>
//                       <span>฿{Number(subtotal).toLocaleString()}</span>
//                     </div>

//                     <div className="flex justify-between">
//                       <span>ค่าจัดส่ง</span>
//                       <span>
//                         {subtotal === 0 ? "-" : "ฟรี"}
//                       </span>
//                     </div>

//                     <Separator />

//                     <div className="flex justify-between font-bold text-lg">
//                       <span>รวมทั้งสิ้น</span>
//                       <span className="text-primary">
//                         ฿{Number(total).toLocaleString()}
//                       </span>
//                     </div>

//                     <p className="text-xs text-muted-foreground">
//                       รวม VAT แล้ว
//                     </p>
//                   </div>

//                   <Button
//                     className="w-full mt-4"
//                     size="lg"
//                     disabled={
//                       selectedItems.length === 0 ||
//                       items.length === 0 ||
//                       checkingStock
//                     }
//                     onClick={handleProceedCheckout}
//                   >
//                     {checkingStock
//                       ? "กำลังตรวจสอบสต๊อก..."
//                       : `ดำเนินการชำระเงิน (${selectedUniqueItems})`}
//                   </Button>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {editingItem && (
//         <CartEditProductModal
//           open={editOpen}
//           onClose={handleCloseEdit}
//           item={editingItem}
//           onUpdated={handleUpdatedFromModal}
//         />
//       )}
//     </div>
//   );
// }


// v.1.1.11 ===================================================================

// v.1.1.10 ====================================================================
// // src/app/cart/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   Trash2,
//   Loader2,
//   ShoppingCart as CartIcon,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import {
//   useShoppingCartPanel,
//   type UICartItem,
// } from "@/components/use-shopping-cart-panel";

// import { CartEditProductModal } from "./CartEditProductModal";

// export default function CartPage() {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   const {
//     items,
//     selectedItems,
//     loading,
//     totalUniqueItems,
//     selectedUniqueItems,
//     selectedTotalPrice,
//     toggleItemSelection,
//     toggleAllItems,
//     updateQuantity, // ✅ ใช้ให้ sync กับ modal
//     deleteItem,
//   } = useShoppingCartPanel(true);

//   const subtotal: number = selectedTotalPrice;
//   const shippingFee: number = subtotal === 0 ? 0 : 0;
//   const total: number = subtotal + shippingFee;

//   const [editingItem, setEditingItem] = useState<UICartItem | null>(null);
//   const [editOpen, setEditOpen] = useState(false);

//   const handleOpenEdit = (item: UICartItem) => {
//     setEditingItem(item);
//     setEditOpen(true);
//   };

//   const handleCloseEdit = () => {
//     setEditOpen(false);
//     setEditingItem(null);
//   };

//   // ✅ callback จาก Modal เมื่อบันทึกสำเร็จ
//   const handleUpdatedFromModal = (payload: {
//     id: number;
//     quantityForCart: number;
//   }) => {
//     updateQuantity(payload.id, payload.quantityForCart);
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Button variant="ghost" size="icon" onClick={() => router.back()}>
//             <ArrowLeft className="h-5 w-5" />
//           </Button>
//           <h1 className="text-2xl font-bold flex items-center gap-2">
//             <CartIcon className="h-5 w-5" />
//             ตะกร้าสินค้า
//             <span className="text-base font-normal text-muted-foreground">
//               ({totalUniqueItems} รายการ)
//             </span>
//           </h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ================= Left: รายการสินค้า ================= */}
//           <div className="lg:col-span-2 space-y-4">
//             {loading ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-sm gap-3 bg-card rounded-lg border">
//                 <Loader2 className="h-6 w-6 animate-spin" />
//                 <p>กำลังโหลดตะกร้าสินค้า...</p>
//               </div>
//             ) : items.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-card rounded-lg border">
//                 <CartIcon className="h-12 w-12 mb-4" />
//                 <p>ตะกร้าสินค้าว่าง</p>
//               </div>
//             ) : (
//               <>
//                 <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
//                   <Checkbox
//                     checked={
//                       selectedItems.length === items.length && items.length > 0
//                     }
//                     onCheckedChange={toggleAllItems}
//                   />
//                   <span className="font-medium">
//                     เลือกทั้งหมด ({totalUniqueItems} รายการ)
//                   </span>
//                 </div>

//                 {items.map((item) => {
//                   const discountLabel =
//                     item.discountPercent != null && item.discountPercent > 0
//                       ? `ประหยัด ${item.discountPercent}%`
//                       : null;

//                   return (
//                     <div
//                       key={item.id}
//                       className="p-4 bg-card rounded-lg border"
//                     >
//                       <div className="flex items-start gap-3">
//                         <Checkbox
//                           checked={selectedItems.includes(item.id)}
//                           onCheckedChange={() => toggleItemSelection(item.id)}
//                         />

//                         {/* eslint-disable-next-line @next/next/no-img-element */}
//                         <img
//                           src={item.image}
//                           alt={item.name}
//                           className="w-20 h-20 object-cover rounded border"
//                         />

//                         <div className="flex-1 min-w-0 space-y-1">
//                           <h3 className="font-semibold text-sm line-clamp-2">
//                             {item.name}
//                           </h3>

//                           <div className="text-[11px] font-semibold text-foreground">
//                             SKU: {item.sku}
//                           </div>

//                           {item.brand && (
//                             <div className="text-[11px] text-muted-foreground">
//                               Brand: {item.brand}
//                             </div>
//                           )}

//                           <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
//                             <div className="flex items-baseline gap-1">
//                               <span className="text-primary font-semibold text-sm">
//                                 ฿{Number(item.price).toLocaleString()}
//                               </span>
//                               {item.uom && (
//                                 <span className="text-[11px] text-muted-foreground">
//                                   / {item.uom}
//                                 </span>
//                               )}
//                             </div>

//                             {item.originalPrice != null &&
//                               item.originalPrice > item.price && (
//                                 <span className="text-[11px] text-muted-foreground line-through">
//                                   ฿{Number(item.originalPrice).toLocaleString()}
//                                 </span>
//                               )}

//                             {discountLabel && (
//                               <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600">
//                                 {discountLabel}
//                               </span>
//                             )}
//                           </div>

//                           <div className="text-[11px] text-muted-foreground">
//                             จำนวน:{" "}
//                             <span className="font-medium text-foreground">
//                               {Number(item.quantity).toLocaleString()}{" "}
//                               {item.uom ? item.uom : ""}
//                             </span>
//                           </div>

//                           <div className="text-sm flex items-center justify-between mt-1">
//                             <div>
//                               ราคารวม:{" "}
//                               <span className="font-bold text-red-600 text-base">
//                                 ฿{Number(item.lineTotal).toLocaleString()}
//                               </span>
//                             </div>

//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="ml-4"
//                               onClick={() => handleOpenEdit(item)}
//                             >
//                               แก้ไขรายการ
//                             </Button>
//                           </div>
//                         </div>

//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           className="h-8 w-8 text-destructive"
//                           onClick={() => deleteItem(item.id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </>
//             )}
//           </div>

//           {/* ================= Right: สรุปรายการ ================= */}
//           <div className="space-y-4">
//             <div className="p-4 bg-card rounded-lg border">
//               <h3 className="font-bold mb-4">สรุปคำสั่งซื้อ</h3>

//               {items.length === 0 && !loading ? (
//                 <p className="text-sm text-muted-foreground">
//                   ยังไม่มีสินค้าในตะกร้า
//                 </p>
//               ) : (
//                 <>
//                   <div className="space-y-3 text-sm">
//                     <div className="flex justify-between">
//                       <span>ยอดรวม ({selectedUniqueItems} รายการ)</span>
//                       <span>฿{Number(subtotal).toLocaleString()}</span>
//                     </div>

//                     <div className="flex justify-between">
//                       <span>ค่าจัดส่ง</span>
//                       <span
//                         className={
//                           shippingFee === 0 && subtotal > 0
//                             ? "text-green-600"
//                             : ""
//                         }
//                       >
//                         {subtotal === 0
//                           ? "-"
//                           : shippingFee === 0
//                           ? "ฟรี"
//                           : `฿${Number(shippingFee).toLocaleString()}`}
//                       </span>
//                     </div>

//                     <Separator />

//                     <div className="flex justify-between font-bold text-lg">
//                       <span>รวมทั้งสิ้น</span>
//                       <span className="text-primary">
//                         ฿{Number(total).toLocaleString()}
//                       </span>
//                     </div>

//                     <p className="text-xs text-muted-foreground">
//                       รวม VAT แล้ว
//                     </p>
//                   </div>

//                   <Link href="/checkout">
//                     <Button
//                       className="w-full mt-4"
//                       size="lg"
//                       disabled={selectedItems.length === 0 || items.length === 0}
//                     >
//                       ดำเนินการชำระเงิน ({selectedUniqueItems})
//                     </Button>
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Modal แก้ไขรายการ
//           ✅ แสดงเฉพาะเมื่อ editingItem ไม่เป็น null
//           ทำให้ CartEditProductModal ไม่ต้องเจอ item = null เลย
//       */}
//       {editingItem && (
//         <CartEditProductModal
//           open={editOpen}
//           onClose={handleCloseEdit}
//           item={editingItem}
//           onUpdated={handleUpdatedFromModal}
//         />
//       )}
//     </div>
//   );
// }

// v.1.1.10 ====================================================================

// v.1.1.9 =====================================================================
// // src/app/cart/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   Trash2,
//   Loader2,
//   ShoppingCart as CartIcon,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import {
//   useShoppingCartPanel,
//   type UICartItem,
// } from "@/components/use-shopping-cart-panel";

// import { CartEditProductModal } from "./CartEditProductModal";

// export default function CartPage() {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   const {
//     items,
//     selectedItems,
//     loading,
//     totalUniqueItems,
//     selectedUniqueItems,
//     selectedTotalPrice,
//     toggleItemSelection,
//     toggleAllItems,
//     updateQuantity,   // ✅ ดึงมาจาก hook
//     deleteItem,
//   } = useShoppingCartPanel(true);

//   const subtotal: number = selectedTotalPrice;
//   const shippingFee: number = subtotal === 0 ? 0 : 0;
//   const total: number = subtotal + shippingFee;

//   const [editingItem, setEditingItem] = useState<UICartItem | null>(null);
//   const [editOpen, setEditOpen] = useState(false);

//   const handleOpenEdit = (item: UICartItem) => {
//     setEditingItem(item);
//     setEditOpen(true);
//   };

//   const handleCloseEdit = () => {
//     setEditOpen(false);
//     setEditingItem(null);
//   };

//   // ✅ callback จาก Modal เมื่อบันทึกสำเร็จ
//   const handleUpdatedFromModal = (payload: {
//     id: number;
//     quantityForCart: number;
//   }) => {
//     updateQuantity(payload.id, payload.quantityForCart);
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Button variant="ghost" size="icon" onClick={() => router.back()}>
//             <ArrowLeft className="h-5 w-5" />
//           </Button>
//           <h1 className="text-2xl font-bold flex items-center gap-2">
//             <CartIcon className="h-5 w-5" />
//             ตะกร้าสินค้า
//             <span className="text-base font-normal text-muted-foreground">
//               ({totalUniqueItems} รายการ)
//             </span>
//           </h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ================= Left: รายการสินค้า ================= */}
//           <div className="lg:col-span-2 space-y-4">
//             {loading ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-sm gap-3 bg-card rounded-lg border">
//                 <Loader2 className="h-6 w-6 animate-spin" />
//                 <p>กำลังโหลดตะกร้าสินค้า...</p>
//               </div>
//             ) : items.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-card rounded-lg border">
//                 <CartIcon className="h-12 w-12 mb-4" />
//                 <p>ตะกร้าสินค้าว่าง</p>
//               </div>
//             ) : (
//               <>
//                 <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
//                   <Checkbox
//                     checked={
//                       selectedItems.length === items.length && items.length > 0
//                     }
//                     onCheckedChange={toggleAllItems}
//                   />
//                   <span className="font-medium">
//                     เลือกทั้งหมด ({totalUniqueItems} รายการ)
//                   </span>
//                 </div>

//                 {items.map((item) => {
//                   const discountLabel =
//                     item.discountPercent != null && item.discountPercent > 0
//                       ? `ประหยัด ${item.discountPercent}%`
//                       : null;

//                   return (
//                     <div
//                       key={item.id}
//                       className="p-4 bg-card rounded-lg border"
//                     >
//                       <div className="flex items-start gap-3">
//                         <Checkbox
//                           checked={selectedItems.includes(item.id)}
//                           onCheckedChange={() => toggleItemSelection(item.id)}
//                         />

//                         {/* eslint-disable-next-line @next/next/no-img-element */}
//                         <img
//                           src={item.image}
//                           alt={item.name}
//                           className="w-20 h-20 object-cover rounded border"
//                         />

//                         <div className="flex-1 min-w-0 space-y-1">
//                           <h3 className="font-semibold text-sm line-clamp-2">
//                             {item.name}
//                           </h3>

//                           <div className="text-[11px] font-semibold text-foreground">
//                             SKU: {item.sku}
//                           </div>

//                           {item.brand && (
//                             <div className="text-[11px] text-muted-foreground">
//                               Brand: {item.brand}
//                             </div>
//                           )}

//                           <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
//                             <div className="flex items-baseline gap-1">
//                               <span className="text-primary font-semibold text-sm">
//                                 ฿{Number(item.price).toLocaleString()}
//                               </span>
//                               {item.uom && (
//                                 <span className="text-[11px] text-muted-foreground">
//                                   / {item.uom}
//                                 </span>
//                               )}
//                             </div>

//                             {item.originalPrice != null &&
//                               item.originalPrice > item.price && (
//                                 <span className="text-[11px] text-muted-foreground line-through">
//                                   ฿{Number(item.originalPrice).toLocaleString()}
//                                 </span>
//                               )}

//                             {discountLabel && (
//                               <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600">
//                                 {discountLabel}
//                               </span>
//                             )}
//                           </div>

//                           <div className="text-[11px] text-muted-foreground">
//                             จำนวน:{" "}
//                             <span className="font-medium text-foreground">
//                               {Number(item.quantity).toLocaleString()}{" "}
//                               {item.uom ? item.uom : ""}
//                             </span>
//                           </div>

//                           <div className="text-sm flex items-center justify-between mt-1">
//                             <div>
//                               ราคารวม:{" "}
//                               <span className="font-bold text-red-600 text-base">
//                                 ฿{Number(item.lineTotal).toLocaleString()}
//                               </span>
//                             </div>

//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="ml-4"
//                               onClick={() => handleOpenEdit(item)}
//                             >
//                               แก้ไขรายการ
//                             </Button>
//                           </div>
//                         </div>

//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           className="h-8 w-8 text-destructive"
//                           onClick={() => deleteItem(item.id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </>
//             )}
//           </div>

//           {/* ================= Right: สรุปรายการ ================= */}
//           <div className="space-y-4">
//             <div className="p-4 bg-card rounded-lg border">
//               <h3 className="font-bold mb-4">สรุปคำสั่งซื้อ</h3>

//               {items.length === 0 && !loading ? (
//                 <p className="text-sm text-muted-foreground">
//                   ยังไม่มีสินค้าในตะกร้า
//                 </p>
//               ) : (
//                 <>
//                   <div className="space-y-3 text-sm">
//                     <div className="flex justify-between">
//                       <span>ยอดรวม ({selectedUniqueItems} รายการ)</span>
//                       <span>฿{Number(subtotal).toLocaleString()}</span>
//                     </div>

//                     <div className="flex justify-between">
//                       <span>ค่าจัดส่ง</span>
//                       <span
//                         className={
//                           shippingFee === 0 && subtotal > 0
//                             ? "text-green-600"
//                             : ""
//                         }
//                       >
//                         {subtotal === 0
//                           ? "-"
//                           : shippingFee === 0
//                           ? "ฟรี"
//                           : `฿${Number(shippingFee).toLocaleString()}`}
//                       </span>
//                     </div>

//                     <Separator />

//                     <div className="flex justify-between font-bold text-lg">
//                       <span>รวมทั้งสิ้น</span>
//                       <span className="text-primary">
//                         ฿{Number(total).toLocaleString()}
//                       </span>
//                     </div>

//                     <p className="text-xs text-muted-foreground">
//                       รวม VAT แล้ว
//                     </p>
//                   </div>

//                   <Link href="/checkout">
//                     <Button
//                       className="w-full mt-4"
//                       size="lg"
//                       disabled={selectedItems.length === 0 || items.length === 0}
//                     >
//                       ดำเนินการชำระเงิน ({selectedUniqueItems})
//                     </Button>
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Modal แก้ไขรายการ */}
//       <CartEditProductModal
//         open={editOpen}
//         onClose={handleCloseEdit}
//         item={editingItem}
//         onUpdated={handleUpdatedFromModal}   // ✅ ผูก callback
//       />
//     </div>
//   );
// }

// v.1.1.9 =====================================================================


// v.1.1.8 =====================================================================
// // src/app/cart/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   Trash2,
//   Loader2,
//   ShoppingCart as CartIcon,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import {
//   useShoppingCartPanel,
//   type UICartItem,
// } from "@/components/use-shopping-cart-panel";

// import { CartEditProductModal } from "./CartEditProductModal";

// export default function CartPage() {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   const {
//     items,
//     selectedItems,
//     loading,
//     totalUniqueItems,
//     selectedUniqueItems,
//     selectedTotalPrice,
//     toggleItemSelection,
//     toggleAllItems,
//     deleteItem,
//   } = useShoppingCartPanel(true);

//   const subtotal: number = selectedTotalPrice;
//   const shippingFee: number = subtotal === 0 ? 0 : 0;
//   const total: number = subtotal + shippingFee;

//   const [editingItem, setEditingItem] = useState<UICartItem | null>(null);
//   const [editOpen, setEditOpen] = useState(false);

//   const handleOpenEdit = (item: UICartItem) => {
//     setEditingItem(item);
//     setEditOpen(true);
//   };

//   const handleCloseEdit = () => {
//     setEditOpen(false);
//     setEditingItem(null);
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Button variant="ghost" size="icon" onClick={() => router.back()}>
//             <ArrowLeft className="h-5 w-5" />
//           </Button>
//           <h1 className="text-2xl font-bold flex items-center gap-2">
//             <CartIcon className="h-5 w-5" />
//             ตะกร้าสินค้า
//             <span className="text-base font-normal text-muted-foreground">
//               ({totalUniqueItems} รายการ)
//             </span>
//           </h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ================= Left: รายการสินค้า ================= */}
//           <div className="lg:col-span-2 space-y-4">
//             {loading ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-sm gap-3 bg-card rounded-lg border">
//                 <Loader2 className="h-6 w-6 animate-spin" />
//                 <p>กำลังโหลดตะกร้าสินค้า...</p>
//               </div>
//             ) : items.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-card rounded-lg border">
//                 <CartIcon className="h-12 w-12 mb-4" />
//                 <p>ตะกร้าสินค้าว่าง</p>
//               </div>
//             ) : (
//               <>
//                 <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
//                   <Checkbox
//                     checked={
//                       selectedItems.length === items.length && items.length > 0
//                     }
//                     onCheckedChange={toggleAllItems}
//                   />
//                   <span className="font-medium">
//                     เลือกทั้งหมด ({totalUniqueItems} รายการ)
//                   </span>
//                 </div>

//                 {items.map((item) => {
//                   const discountLabel =
//                     item.discountPercent != null && item.discountPercent > 0
//                       ? `ประหยัด ${item.discountPercent}%`
//                       : null;

//                   return (
//                     <div
//                       key={item.id}
//                       className="p-4 bg-card rounded-lg border"
//                     >
//                       <div className="flex items-start gap-3">
//                         <Checkbox
//                           checked={selectedItems.includes(item.id)}
//                           onCheckedChange={() => toggleItemSelection(item.id)}
//                         />

//                         {/* eslint-disable-next-line @next/next/no-img-element */}
//                         <img
//                           src={item.image}
//                           alt={item.name}
//                           className="w-20 h-20 object-cover rounded border"
//                         />

//                         <div className="flex-1 min-w-0 space-y-1">
//                           <h3 className="font-semibold text-sm line-clamp-2">
//                             {item.name}
//                           </h3>

//                           <div className="text-[11px] font-semibold text-foreground">
//                             SKU: {item.sku}
//                           </div>

//                           {item.brand && (
//                             <div className="text-[11px] text-muted-foreground">
//                               Brand: {item.brand}
//                             </div>
//                           )}

//                           <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
//                             <div className="flex items-baseline gap-1">
//                               <span className="text-primary font-semibold text-sm">
//                                 ฿{Number(item.price).toLocaleString()}
//                               </span>
//                               {item.uom && (
//                                 <span className="text-[11px] text-muted-foreground">
//                                   / {item.uom}
//                                 </span>
//                               )}
//                             </div>

//                             {item.originalPrice != null &&
//                               item.originalPrice > item.price && (
//                                 <span className="text-[11px] text-muted-foreground line-through">
//                                   ฿{Number(item.originalPrice).toLocaleString()}
//                                 </span>
//                               )}

//                             {discountLabel && (
//                               <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600">
//                                 {discountLabel}
//                               </span>
//                             )}
//                           </div>

//                           <div className="text-[11px] text-muted-foreground">
//                             จำนวน:{" "}
//                             <span className="font-medium text-foreground">
//                               {Number(item.quantity).toLocaleString()}{" "}
//                               {item.uom ? item.uom : ""}
//                             </span>
//                           </div>

//                           <div className="text-sm flex items-center justify-between mt-1">
//                             <div>
//                               ราคารวม:{" "}
//                               <span className="font-bold text-red-600 text-base">
//                                 ฿{Number(item.lineTotal).toLocaleString()}
//                               </span>
//                             </div>

//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="ml-4"
//                               onClick={() => handleOpenEdit(item)}
//                             >
//                               แก้ไขรายการ
//                             </Button>
//                           </div>
//                         </div>

//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           className="h-8 w-8 text-destructive"
//                           onClick={() => deleteItem(item.id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </>
//             )}
//           </div>

//           {/* ================= Right: สรุปรายการ ================= */}
//           <div className="space-y-4">
//             <div className="p-4 bg-card rounded-lg border">
//               <h3 className="font-bold mb-4">สรุปคำสั่งซื้อ</h3>

//               {items.length === 0 && !loading ? (
//                 <p className="text-sm text-muted-foreground">
//                   ยังไม่มีสินค้าในตะกร้า
//                 </p>
//               ) : (
//                 <>
//                   <div className="space-y-3 text-sm">
//                     <div className="flex justify-between">
//                       <span>ยอดรวม ({selectedUniqueItems} รายการ)</span>
//                       <span>฿{Number(subtotal).toLocaleString()}</span>
//                     </div>

//                     <div className="flex justify-between">
//                       <span>ค่าจัดส่ง</span>
//                       <span
//                         className={
//                           shippingFee === 0 && subtotal > 0
//                             ? "text-green-600"
//                             : ""
//                         }
//                       >
//                         {subtotal === 0
//                           ? "-"
//                           : shippingFee === 0
//                           ? "ฟรี"
//                           : `฿${Number(shippingFee).toLocaleString()}`}
//                       </span>
//                     </div>

//                     <Separator />

//                     <div className="flex justify-between font-bold text-lg">
//                       <span>รวมทั้งสิ้น</span>
//                       <span className="text-primary">
//                         ฿{Number(total).toLocaleString()}
//                       </span>
//                     </div>

//                     <p className="text-xs text-muted-foreground">
//                       รวม VAT แล้ว
//                     </p>
//                   </div>

//                   <Link href="/checkout">
//                     <Button
//                       className="w-full mt-4"
//                       size="lg"
//                       disabled={selectedItems.length === 0 || items.length === 0}
//                     >
//                       ดำเนินการชำระเงิน ({selectedUniqueItems})
//                     </Button>
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Modal แก้ไขรายการ */}
//       <CartEditProductModal
//         open={editOpen}
//         onClose={handleCloseEdit}
//         item={editingItem}
//       />
//     </div>
//   );
// }

// v.1.1.8 =====================================================================

// v.1.1.7 =====================================================================
// // src/app/cart/page.tsx

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   Trash2,
//   Loader2,
//   ShoppingCart as CartIcon,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import {
//   useShoppingCartPanel,
//   type UICartItem,
// } from "@/components/use-shopping-cart-panel";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";

// import { useProductSalesForm } from "@/app/product/[id]/component/useProductSalesForm";
// import { PriceSection } from "@/app/product/[id]/component/PriceSection";
// import { CutSection } from "@/app/product/[id]/component/CutSection";
// import { RollSection } from "@/app/product/[id]/component/RollSection";

// import type {
//   UIProduct,
//   CardPartsVisibility,
// } from "@/app/api/mock/products/_store";

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

// export default function CartPage() {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   const {
//     items,
//     selectedItems,
//     loading,
//     totalUniqueItems,
//     selectedUniqueItems,
//     selectedTotalPrice,
//     toggleItemSelection,
//     toggleAllItems,
//     deleteItem,
//   } = useShoppingCartPanel(true);

//   const subtotal: number = selectedTotalPrice;
//   const shippingFee: number = subtotal === 0 ? 0 : 0;
//   const total: number = subtotal + shippingFee;

//   const [editingItem, setEditingItem] = useState<UICartItem | null>(null);
//   const [editOpen, setEditOpen] = useState(false);

//   const handleOpenEdit = (item: UICartItem) => {
//     setEditingItem(item);
//     setEditOpen(true);
//   };

//   const handleCloseEdit = () => {
//     setEditOpen(false);
//     setEditingItem(null);
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Button variant="ghost" size="icon" onClick={() => router.back()}>
//             <ArrowLeft className="h-5 w-5" />
//           </Button>
//           <h1 className="text-2xl font-bold flex items-center gap-2">
//             <CartIcon className="h-5 w-5" />
//             ตะกร้าสินค้า
//             <span className="text-base font-normal text-muted-foreground">
//               ({totalUniqueItems} รายการ)
//             </span>
//           </h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 space-y-4">
//             {loading ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-sm gap-3 bg-card rounded-lg border">
//                 <Loader2 className="h-6 w-6 animate-spin" />
//                 <p>กำลังโหลดตะกร้าสินค้า...</p>
//               </div>
//             ) : items.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-card rounded-lg border">
//                 <CartIcon className="h-12 w-12 mb-4" />
//                 <p>ตะกร้าสินค้าว่าง</p>
//               </div>
//             ) : (
//               <>
//                 <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
//                   <Checkbox
//                     checked={
//                       selectedItems.length === items.length && items.length > 0
//                     }
//                     onCheckedChange={toggleAllItems}
//                   />
//                   <span className="font-medium">
//                     เลือกทั้งหมด ({totalUniqueItems} รายการ)
//                   </span>
//                 </div>

//                 {items.map((item) => {
//                   const discountLabel =
//                     item.discountPercent != null && item.discountPercent > 0
//                       ? `ประหยัด ${item.discountPercent}%`
//                       : null;

//                   return (
//                     <div
//                       key={item.id}
//                       className="p-4 bg-card rounded-lg border"
//                     >
//                       <div className="flex items-start gap-3">
//                         <Checkbox
//                           checked={selectedItems.includes(item.id)}
//                           onCheckedChange={() => toggleItemSelection(item.id)}
//                         />

//                         {/* eslint-disable-next-line @next/next/no-img-element */}
//                         <img
//                           src={item.image}
//                           alt={item.name}
//                           className="w-20 h-20 object-cover rounded border"
//                         />

//                         <div className="flex-1 min-w-0 space-y-1">
//                           <h3 className="font-semibold text-sm line-clamp-2">
//                             {item.name}
//                           </h3>

//                           <div className="text-[11px] font-semibold text-foreground">
//                             SKU: {item.sku}
//                           </div>

//                           {item.brand && (
//                             <div className="text-[11px] text-muted-foreground">
//                               Brand: {item.brand}
//                             </div>
//                           )}

//                           <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
//                             <div className="flex items-baseline gap-1">
//                               <span className="text-primary font-semibold text-sm">
//                                 ฿{Number(item.price).toLocaleString()}
//                               </span>
//                               {item.uom && (
//                                 <span className="text-[11px] text-muted-foreground">
//                                   / {item.uom}
//                                 </span>
//                               )}
//                             </div>

//                             {item.originalPrice != null &&
//                               item.originalPrice > item.price && (
//                                 <span className="text-[11px] text-muted-foreground line-through">
//                                   ฿{Number(item.originalPrice).toLocaleString()}
//                                 </span>
//                               )}

//                             {discountLabel && (
//                               <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600">
//                                 {discountLabel}
//                               </span>
//                             )}
//                           </div>

//                           <div className="text-[11px] text-muted-foreground">
//                             จำนวน:{" "}
//                             <span className="font-medium text-foreground">
//                               {Number(item.quantity).toLocaleString()}{" "}
//                               {item.uom ? item.uom : ""}
//                             </span>
//                           </div>

//                           <div className="text-sm flex items-center justify-between mt-1">
//                             <div>
//                               ราคารวม:{" "}
//                               <span className="font-bold text-red-600 text-base">
//                                 ฿{Number(item.lineTotal).toLocaleString()}
//                               </span>
//                             </div>

//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="ml-4"
//                               onClick={() => handleOpenEdit(item)}
//                             >
//                               แก้ไขรายการ
//                             </Button>
//                           </div>
//                         </div>

//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           className="h-8 w-8 text-destructive"
//                           onClick={() => deleteItem(item.id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </>
//             )}
//           </div>

//           <div className="space-y-4">
//             <div className="p-4 bg-card rounded-lg border">
//               <h3 className="font-bold mb-4">สรุปคำสั่งซื้อ</h3>

//               {items.length === 0 && !loading ? (
//                 <p className="text-sm text-muted-foreground">
//                   ยังไม่มีสินค้าในตะกร้า
//                 </p>
//               ) : (
//                 <>
//                   <div className="space-y-3 text-sm">
//                     <div className="flex justify-between">
//                       <span>ยอดรวม ({selectedUniqueItems} รายการ)</span>
//                       <span>฿{Number(subtotal).toLocaleString()}</span>
//                     </div>

//                     <div className="flex justify-between">
//                       <span>ค่าจัดส่ง</span>
//                       <span
//                         className={
//                           shippingFee === 0 && subtotal > 0
//                             ? "text-green-600"
//                             : ""
//                         }
//                       >
//                         {subtotal === 0
//                           ? "-"
//                           : shippingFee === 0
//                           ? "ฟรี"
//                           : `฿${Number(shippingFee).toLocaleString()}`}
//                       </span>
//                     </div>

//                     <Separator />

//                     <div className="flex justify-between font-bold text-lg">
//                       <span>รวมทั้งสิ้น</span>
//                       <span className="text-primary">
//                         ฿{Number(total).toLocaleString()}
//                       </span>
//                     </div>

//                     <p className="text-xs text-muted-foreground">
//                       รวม VAT แล้ว
//                     </p>
//                   </div>

//                   <Link href="/checkout">
//                     <Button
//                       className="w-full mt-4"
//                       size="lg"
//                       disabled={selectedItems.length === 0 || items.length === 0}
//                     >
//                       ดำเนินการชำระเงิน ({selectedUniqueItems})
//                     </Button>
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       <CartEditProductModal
//         open={editOpen}
//         onClose={handleCloseEdit}
//         item={editingItem}
//       />
//     </div>
//   );
// }

// type CartEditProductModalProps = {
//   open: boolean;
//   onClose: () => void;
//   item: UICartItem | null;
// };

// function CartEditProductModal({
//   open,
//   onClose,
//   item,
// }: CartEditProductModalProps) {
//   // ถ้าไม่มี item ให้ return modal เปล่า ๆ ไปเลย (กัน error ตอน initial render)
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

//   // ประกอบเป็น UIProduct เต็ม ๆ เพื่อใช้กับ useProductSalesForm
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

//     // 🔹 conditions จาก UICartItem (ที่มาจาก /api/cart/list)
//     conditions: Array.isArray((item as any).conditions)
//       ? (item as any).conditions
//       : (item as any).productConditions ?? [],

//     // 🔹 clearanceQuantity จาก cart (ให้เป็น number หรือ undefined ตาม type)
//     clearanceQuantity:
//     (item as any).clearanceQuantity != null
//       ? Number((item as any).clearanceQuantity)
//       : undefined,
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

//           {/* 🔍 DEBUG: แสดงค่า conditions / clearanceQty ที่ modal ได้รับ */}
//           <div className="mt-2">
//             <div className="text-xs font-semibold text-muted-foreground mb-1">
//               DEBUG: conditions ที่ modal ได้รับ
//             </div>
//             <pre className="rounded bg-slate-100 border border-slate-200 px-2 py-1 text-[10px] leading-snug text-slate-700 whitespace-pre-wrap break-all">
//               {JSON.stringify(debugData, null, 2)}
//             </pre>
//           </div>

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

// v.1.1.7 =====================================================================

// v.1.1.6 =====================================================================
// // src/app/cart/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   Trash2,
//   Loader2,
//   ShoppingCart as CartIcon,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import {
//   useShoppingCartPanel,
//   type UICartItem,
// } from "@/components/use-shopping-cart-panel";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";

// import { useProductSalesForm } from "@/app/product/[id]/component/useProductSalesForm";
// import { PriceSection } from "@/app/product/[id]/component/PriceSection";
// import { CutSection } from "@/app/product/[id]/component/CutSection";
// import { RollSection } from "@/app/product/[id]/component/RollSection";

// import type {
//   UIProduct,
//   CardPartsVisibility,
// } from "@/app/api/mock/products/_store";

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

// export default function CartPage() {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   const {
//     items,
//     selectedItems,
//     loading,
//     totalUniqueItems,
//     selectedUniqueItems,
//     selectedTotalPrice,
//     toggleItemSelection,
//     toggleAllItems,
//     deleteItem,
//   } = useShoppingCartPanel(true);

//   const subtotal: number = selectedTotalPrice;
//   const shippingFee: number = subtotal === 0 ? 0 : 0;
//   const total: number = subtotal + shippingFee;

//   const [editingItem, setEditingItem] = useState<UICartItem | null>(null);
//   const [editOpen, setEditOpen] = useState(false);

//   const handleOpenEdit = (item: UICartItem) => {
//     setEditingItem(item);
//     setEditOpen(true);
//   };

//   const handleCloseEdit = () => {
//     setEditOpen(false);
//     setEditingItem(null);
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Button variant="ghost" size="icon" onClick={() => router.back()}>
//             <ArrowLeft className="h-5 w-5" />
//           </Button>
//           <h1 className="text-2xl font-bold flex items-center gap-2">
//             <CartIcon className="h-5 w-5" />
//             ตะกร้าสินค้า
//             <span className="text-base font-normal text-muted-foreground">
//               ({totalUniqueItems} รายการ)
//             </span>
//           </h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 space-y-4">
//             {loading ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-sm gap-3 bg-card rounded-lg border">
//                 <Loader2 className="h-6 w-6 animate-spin" />
//                 <p>กำลังโหลดตะกร้าสินค้า...</p>
//               </div>
//             ) : items.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-card rounded-lg border">
//                 <CartIcon className="h-12 w-12 mb-4" />
//                 <p>ตะกร้าสินค้าว่าง</p>
//               </div>
//             ) : (
//               <>
//                 <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
//                   <Checkbox
//                     checked={
//                       selectedItems.length === items.length && items.length > 0
//                     }
//                     onCheckedChange={toggleAllItems}
//                   />
//                   <span className="font-medium">
//                     เลือกทั้งหมด ({totalUniqueItems} รายการ)
//                   </span>
//                 </div>

//                 {items.map((item) => {
//                   const discountLabel =
//                     item.discountPercent != null && item.discountPercent > 0
//                       ? `ประหยัด ${item.discountPercent}%`
//                       : null;

//                   return (
//                     <div
//                       key={item.id}
//                       className="p-4 bg-card rounded-lg border"
//                     >
//                       <div className="flex items-start gap-3">
//                         <Checkbox
//                           checked={selectedItems.includes(item.id)}
//                           onCheckedChange={() => toggleItemSelection(item.id)}
//                         />

//                         {/* eslint-disable-next-line @next/next/no-img-element */}
//                         <img
//                           src={item.image}
//                           alt={item.name}
//                           className="w-20 h-20 object-cover rounded border"
//                         />

//                         <div className="flex-1 min-w-0 space-y-1">
//                           <h3 className="font-semibold text-sm line-clamp-2">
//                             {item.name}
//                           </h3>

//                           <div className="text-[11px] font-semibold text-foreground">
//                             SKU: {item.sku}
//                           </div>

//                           {item.brand && (
//                             <div className="text-[11px] text-muted-foreground">
//                               Brand: {item.brand}
//                             </div>
//                           )}

//                           <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
//                             <div className="flex items-baseline gap-1">
//                               <span className="text-primary font-semibold text-sm">
//                                 ฿{Number(item.price).toLocaleString()}
//                               </span>
//                               {item.uom && (
//                                 <span className="text-[11px] text-muted-foreground">
//                                   / {item.uom}
//                                 </span>
//                               )}
//                             </div>

//                             {item.originalPrice != null &&
//                               item.originalPrice > item.price && (
//                                 <span className="text-[11px] text-muted-foreground line-through">
//                                   ฿{Number(item.originalPrice).toLocaleString()}
//                                 </span>
//                               )}

//                             {discountLabel && (
//                               <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600">
//                                 {discountLabel}
//                               </span>
//                             )}
//                           </div>

//                           <div className="text-[11px] text-muted-foreground">
//                             จำนวน:{" "}
//                             <span className="font-medium text-foreground">
//                               {Number(item.quantity).toLocaleString()}{" "}
//                               {item.uom ? item.uom : ""}
//                             </span>
//                           </div>

//                           <div className="text-sm flex items-center justify-between mt-1">
//                             <div>
//                               ราคารวม:{" "}
//                               <span className="font-bold text-red-600 text-base">
//                                 ฿{Number(item.lineTotal).toLocaleString()}
//                               </span>
//                             </div>

//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="ml-4"
//                               onClick={() => handleOpenEdit(item)}
//                             >
//                               แก้ไขรายการ
//                             </Button>
//                           </div>
//                         </div>

//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           className="h-8 w-8 text-destructive"
//                           onClick={() => deleteItem(item.id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </>
//             )}
//           </div>

//           <div className="space-y-4">
//             <div className="p-4 bg-card rounded-lg border">
//               <h3 className="font-bold mb-4">สรุปคำสั่งซื้อ</h3>

//               {items.length === 0 && !loading ? (
//                 <p className="text-sm text-muted-foreground">
//                   ยังไม่มีสินค้าในตะกร้า
//                 </p>
//               ) : (
//                 <>
//                   <div className="space-y-3 text-sm">
//                     <div className="flex justify-between">
//                       <span>ยอดรวม ({selectedUniqueItems} รายการ)</span>
//                       <span>฿{Number(subtotal).toLocaleString()}</span>
//                     </div>

//                     <div className="flex justify-between">
//                       <span>ค่าจัดส่ง</span>
//                       <span
//                         className={
//                           shippingFee === 0 && subtotal > 0
//                             ? "text-green-600"
//                             : ""
//                         }
//                       >
//                         {subtotal === 0
//                           ? "-"
//                           : shippingFee === 0
//                           ? "ฟรี"
//                           : `฿${Number(shippingFee).toLocaleString()}`}
//                       </span>
//                     </div>

//                     <Separator />

//                     <div className="flex justify-between font-bold text-lg">
//                       <span>รวมทั้งสิ้น</span>
//                       <span className="text-primary">
//                         ฿{Number(total).toLocaleString()}
//                       </span>
//                     </div>

//                     <p className="text-xs text-muted-foreground">
//                       รวม VAT แล้ว
//                     </p>
//                   </div>

//                   <Link href="/checkout">
//                     <Button
//                       className="w-full mt-4"
//                       size="lg"
//                       disabled={selectedItems.length === 0 || items.length === 0}
//                     >
//                       ดำเนินการชำระเงิน ({selectedUniqueItems})
//                     </Button>
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       <CartEditProductModal
//         open={editOpen}
//         onClose={handleCloseEdit}
//         item={editingItem}
//       />
//     </div>
//   );
// }

// type CartEditProductModalProps = {
//   open: boolean;
//   onClose: () => void;
//   item: UICartItem | null;
// };

// function CartEditProductModal({
//   open,
//   onClose,
//   item,
// }: CartEditProductModalProps) {
//   const productForForm: UIProduct = {
//     id: item?.id ?? 0,
//     order: 0,
//     name: item?.name ?? "",
//     brand: item?.brand ?? undefined,
//     sku: item?.sku ?? "",
//     price: item?.price ?? 0,
//     discountPercent: item?.discountPercent ?? undefined,
//     uom: item?.uom ?? undefined,
//     image_url: item?.image ?? "/placeholder.png",
//     conditions:
//       (item as any)?.conditions ?? (item as any)?.productConditions ?? [],
//     clearanceQuantity: (item as any)?.clearanceQty ?? null,
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
//     { initialQuantity: item?.quantity ?? 1 },
//   );

//   return (
//     <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
//       <DialogContent className="max-w-xl">
//         <DialogHeader>
//           <DialogTitle className="text-base md:text-lg">
//             แก้ไขรายการสินค้า: {item?.name ?? "-"}
//           </DialogTitle>
//           <DialogDescription className="text-xs md:text-sm">
//             ปรับจำนวนสินค้า ความยาวสาย หรือเงื่อนไขการขาย แล้วบันทึกการแก้ไขรายการนี้
//           </DialogDescription>
//         </DialogHeader>

//         {!item ? (
//           <p className="text-sm text-muted-foreground">
//             ไม่พบข้อมูลสินค้าในตะกร้า
//           </p>
//         ) : (
//           <div className="space-y-4">
//             <div className="flex items-start gap-3">
//               {/* eslint-disable-next-line @next/next/no-img-element */}
//               <img
//                 src={item.image}
//                 alt={item.name}
//                 className="w-20 h-20 object-cover rounded border"
//               />

//               <div className="flex-1 min-w-0 space-y-1">
//                 <h3 className="font-semibold text-sm line-clamp-2">
//                   {item.name}
//                 </h3>
//                 <div className="text-[11px] text-muted-foreground">
//                   SKU: {item.sku}
//                 </div>
//                 {item.brand && (
//                   <div className="text-[11px] text-muted-foreground">
//                     Brand: {item.brand}
//                   </div>
//                 )}

//                 <PriceSection
//                   product={productForForm}
//                   visibleParts={EDIT_VISIBLE_PARTS}
//                   hasConditions={hasConditions}
//                   salesMode={salesMode}
//                   unit={unit}
//                   originalPrice={originalPrice}
//                   showDiscountBadge={showDiscountBadge}
//                 />
//               </div>
//             </div>

//             {hasConditions && salesMode && (
//               <div className="space-y-3">
//                 <div className="space-y-1">
//                   <span className="text-muted-foreground font-medium text-sm">
//                     ประเภทการขาย:
//                   </span>
//                   <div className="inline-flex items-center rounded-lg border border-muted px-3 py-1.5 text-sm bg-white">
//                     {salesMode === "CUT" ? "ตัดแบ่งขาย (Cut)" : "ขายยกม้วน (Roll)"}
//                   </div>
//                 </div>

//                 <CutSection
//                   hasConditions={hasConditions}
//                   salesMode={salesMode}
//                   cutMinimum={cutMinimum}
//                   cutStepOptions={cutStepOptions}
//                   cutLength={cutLength}
//                   unit={unit}
//                   clearanceQty={clearanceQty}
//                   quantity={quantity}
//                   noStock={noStock}
//                   handleCutStep={handleCutStep}
//                 />

//                 <RollSection
//                   hasConditions={hasConditions}
//                   salesMode={salesMode}
//                   rollPairs={rollPairs}
//                   rollLength={rollLength}
//                   unit={unit}
//                   setRollLength={setRollLength}
//                 />
//               </div>
//             )}

//             <div className="space-y-2 text-sm text-muted-foreground">
//               <div className="flex items-center gap-2">
//                 {salesMode === "ROLL" ? (
//                   selectedRollStock != null ? (
//                     selectedRollStock > 0 ? (
//                       <>
//                         <div className="w-2 h-2 bg-success rounded-full" />
//                         <span className="text-success font-medium">
//                           สต๊อก {Number(selectedRollStock).toLocaleString()} ม้วน
//                           {rollLength &&
//                             ` (ขนาด ${Number(rollLength).toLocaleString()} ${unit})`}
//                         </span>
//                       </>
//                     ) : (
//                       <>
//                         <div className="w-2 h-2 bg-destructive rounded-full" />
//                         <span className="text-destructive font-medium">
//                           ขนาดที่เลือกหมดสต๊อก
//                         </span>
//                       </>
//                     )
//                   ) : (
//                     <>
//                       <div className="w-2 h-2 bg-muted-foreground rounded-full" />
//                       <span>เลือกความยาวม้วนเพื่อดูสต๊อก</span>
//                     </>
//                   )
//                 ) : clearanceQty != null && clearanceQty > 0 ? (
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
//                       สินค้าหมดหรือไม่ได้ระบุจำนวนคงเหลือ
//                     </span>
//                   </>
//                 )}
//               </div>

//               {hasConditions && salesMode ? (
//                 <>
//                   <div>
//                     ความยาวรวม:{" "}
//                     <span className="font-medium text-foreground">
//                       {Number(totalLength).toLocaleString()} {unit}
//                     </span>
//                   </div>
//                   <div>
//                     ราคารวม:{" "}
//                     <span className="font-bold text-foreground">
//                       ฿{Number(totalPrice).toLocaleString()}
//                     </span>
//                   </div>
//                   <div className="text-xs">
//                     ({Number(quantity).toLocaleString()} ×{" "}
//                     {Number(lengthPerItem).toLocaleString()} {unit} × ฿
//                     {Number(productForForm.price).toLocaleString()}/{unit})
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <div>
//                     ราคารวม:{" "}
//                     <span className="font-bold text-foreground">
//                       ฿{Number(totalPrice).toLocaleString()}
//                     </span>
//                   </div>
//                   <div className="text-xs">
//                     ({Number(quantity).toLocaleString()} × ฿
//                     {Number(productForForm.price).toLocaleString()} / ชิ้น)
//                   </div>
//                 </>
//               )}
//             </div>

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
//           </div>
//         )}

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

// v.1.1.6 =====================================================================

// v.1.1.5 =====================================================================
// // src/app/cart/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   Trash2,
//   Loader2,
//   ShoppingCart as CartIcon,
//   Pencil,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";

// import {
//   useShoppingCartPanel,
//   type UICartItem,
// } from "@/components/use-shopping-cart-panel";

// import { CartEditProductModal } from "./CartEditProductModal";

// export default function CartPage() {
//   const router = useRouter();

//   // เลื่อนขึ้นบนสุดเมื่อเข้าหน้านี้
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   // ✅ ใช้ logic ชุดเดียวกับ mini-cart
//   const {
//     items,
//     selectedItems,
//     loading,
//     totalUniqueItems,
//     selectedUniqueItems,
//     selectedTotalPrice,
//     toggleItemSelection,
//     toggleAllItems,
//     deleteItem,
//     updateQuantity, // <- ใช้ตอนกด "บันทึกการแก้ไข" ใน modal
//   } = useShoppingCartPanel(true); // ให้โหลดทันทีเมื่อเข้า /cart

//   // สรุปยอดฝั่งขวา (ใช้เฉพาะ "รายการที่เลือก")
//   const subtotal: number = Number(selectedTotalPrice ?? 0);
//   const shippingFee: number =
//     subtotal === 0
//       ? 0
//       : subtotal > 5000
//       ? 0
//       : 0; // ตอนนี้คิดค่าจัดส่ง 0 ไว้ก่อน (ปรับ logic ภายหลังได้)
//   const total: number = subtotal + shippingFee;

//   // ====== state ฝั่ง modal แก้ไขสินค้าในตะกร้า ======
//   const [editingItem, setEditingItem] = useState<UICartItem | null>(null);
//   const [isEditOpen, setIsEditOpen] = useState(false);

//   const handleOpenEdit = (item: UICartItem) => {
//     setEditingItem(item);
//     setIsEditOpen(true);
//   };

//   const handleCloseEdit = () => {
//     setIsEditOpen(false);
//     setEditingItem(null);
//   };

//   // รับค่าที่แก้ไขกลับมาจาก modal
//   const handleSaveEdit = (itemId: number, newQuantity: number) => {
//     // ตอนนี้ใช้ updateQuantity จาก useShoppingCartPanel (แก้ state ฝั่ง client ก่อน)
//     // ถ้าคุณทำ API /api/cart/update แล้วสามารถเปลี่ยนไปยิงตรงนั้นแทนได้ทันที
//     updateQuantity(itemId, newQuantity);
//     setIsEditOpen(false);
//     setEditingItem(null);
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         {/* Header */}
//         <div className="flex items-center gap-4 mb-6">
//           <Button variant="ghost" size="icon" onClick={() => router.back()}>
//             <ArrowLeft className="h-5 w-5" />
//           </Button>
//           <h1 className="text-2xl font-bold flex items-center gap-2">
//             <CartIcon className="h-5 w-5" />
//             ตะกร้าสินค้า
//             <span className="text-base font-normal text-muted-foreground">
//               ({totalUniqueItems} รายการ)
//             </span>
//           </h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ซ้าย: รายการสินค้าในตะกร้า */}
//           <div className="lg:col-span-2 space-y-4">
//             {loading ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-sm gap-3 bg-card rounded-lg border">
//                 <Loader2 className="h-6 w-6 animate-spin" />
//                 <p>กำลังโหลดตะกร้าสินค้า...</p>
//               </div>
//             ) : items.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-card rounded-lg border">
//                 <CartIcon className="h-12 w-12 mb-4" />
//                 <p>ตะกร้าสินค้าว่าง</p>
//               </div>
//             ) : (
//               <>
//                 {/* แถวเลือกทั้งหมด */}
//                 <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
//                   <Checkbox
//                     checked={
//                       selectedItems.length === items.length && items.length > 0
//                     }
//                     onCheckedChange={toggleAllItems}
//                   />
//                   <span className="font-medium">
//                     เลือกทั้งหมด ({totalUniqueItems} รายการ)
//                   </span>
//                 </div>

//                 {/* รายการสินค้า (layout คล้าย mini-cart) */}
//                 {items.map((item) => {
//                   const discountLabel =
//                     item.discountPercent != null && item.discountPercent > 0
//                       ? `ประหยัด ${item.discountPercent}%`
//                       : null;

//                   const price = Number(item.price ?? 0);
//                   const lineTotal = Number(item.lineTotal ?? 0);

//                   return (
//                     <div
//                       key={item.id}
//                       className="p-4 bg-card rounded-lg border"
//                     >
//                       <div className="flex items-start gap-3">
//                         {/* Checkbox ทีละรายการ */}
//                         <Checkbox
//                           checked={selectedItems.includes(item.id)}
//                           onCheckedChange={() => toggleItemSelection(item.id)}
//                         />

//                         {/* รูปสินค้า */}
//                         {/* eslint-disable-next-line @next/next/no-img-element */}
//                         <img
//                           src={item.image}
//                           alt={item.name}
//                           className="w-20 h-20 object-cover rounded border"
//                         />

//                         <div className="flex-1 min-w-0 space-y-1">
//                           {/* ชื่อสินค้า */}
//                           <h3 className="font-semibold text-sm line-clamp-2">
//                             {item.name}
//                           </h3>

//                           {/* SKU */}
//                           <div className="text-[11px] font-semibold text-foreground">
//                             SKU: {item.sku}
//                           </div>

//                           {/* Brand (ถ้ามี) */}
//                           {item.brand && (
//                             <div className="text-[11px] text-muted-foreground">
//                               Brand: {item.brand}
//                             </div>
//                           )}

//                           {/* ราคา / หน่วย + ส่วนลด */}
//                           <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
//                             <div className="flex items-baseline gap-1">
//                               <span className="text-primary font-semibold text-sm">
//                                 ฿{price.toLocaleString()}
//                               </span>
//                               {item.uom && (
//                                 <span className="text-[11px] text-muted-foreground">
//                                   / {item.uom}
//                                 </span>
//                               )}
//                             </div>

//                             {item.originalPrice != null &&
//                               item.originalPrice > price && (
//                                 <span className="text-[11px] text-muted-foreground line-through">
//                                   ฿{Number(
//                                     item.originalPrice,
//                                   ).toLocaleString()}
//                                 </span>
//                               )}

//                             {discountLabel && (
//                               <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600">
//                                 {discountLabel}
//                               </span>
//                             )}
//                           </div>

//                           {/* จำนวน */}
//                           <div className="text-[11px] text-muted-foreground">
//                             จำนวน:{" "}
//                             <span className="font-medium text-foreground">
//                               {Number(item.quantity).toLocaleString()}{" "}
//                               {item.uom ? item.uom : ""}
//                             </span>
//                           </div>

//                           {/* ราคารวมต่อบรรทัด */}
//                           <div className="flex items-center justify-between gap-2 mt-1">
//                             <div className="text-sm">
//                               ราคารวม:{" "}
//                               <span className="font-bold text-red-600 text-base">
//                                 ฿{lineTotal.toLocaleString()}
//                               </span>
//                             </div>

//                             {/* ปุ่มแก้ไขรายการ → เปิด modal */}
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="h-8 gap-1"
//                               onClick={() => handleOpenEdit(item)}
//                             >
//                               <Pencil className="h-3 w-3" />
//                               <span className="text-xs">แก้ไขรายการ</span>
//                             </Button>
//                           </div>
//                         </div>

//                         {/* ปุ่มลบ (ยิง /api/cart/remove แบบ mini-cart) */}
//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           className="h-8 w-8 text-destructive"
//                           onClick={() => deleteItem(item.id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </>
//             )}
//           </div>

//           {/* ขวา: สรุปคำสั่งซื้อ / ราคารวม */}
//           <div className="space-y-4">
//             <div className="p-4 bg-card rounded-lg border">
//               <h3 className="font-bold mb-4">สรุปคำสั่งซื้อ</h3>

//               {items.length === 0 && !loading ? (
//                 <p className="text-sm text-muted-foreground">
//                   ยังไม่มีสินค้าในตะกร้า
//                 </p>
//               ) : (
//                 <>
//                   <div className="space-y-3 text-sm">
//                     <div className="flex justify-between">
//                       <span>ยอดรวม ({selectedUniqueItems} รายการ)</span>
//                       <span>฿{subtotal.toLocaleString()}</span>
//                     </div>

//                     <div className="flex justify-between">
//                       <span>ค่าจัดส่ง</span>
//                       <span
//                         className={
//                           shippingFee === 0 && subtotal > 0
//                             ? "text-green-600"
//                             : ""
//                         }
//                       >
//                         {subtotal === 0
//                           ? "-"
//                           : shippingFee === 0
//                           ? "ฟรี"
//                           : `฿${shippingFee.toLocaleString()}`}
//                       </span>
//                     </div>

//                     <Separator />

//                     <div className="flex justify-between font-bold text-lg">
//                       <span>รวมทั้งสิ้น</span>
//                       <span className="text-primary">
//                         ฿{total.toLocaleString()}
//                       </span>
//                     </div>

//                     <p className="text-xs text-muted-foreground">
//                       รวม VAT แล้ว
//                     </p>
//                   </div>

//                   <Link href="/checkout">
//                     <Button
//                       className="w-full mt-4"
//                       size="lg"
//                       disabled={
//                         selectedItems.length === 0 || items.length === 0
//                       }
//                     >
//                       ดำเนินการชำระเงิน ({selectedUniqueItems})
//                     </Button>
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ===== Modal แก้ไขสินค้าในตะกร้า ===== */}
//       <CartEditProductModal
//         open={isEditOpen}
//         item={editingItem}
//         onClose={handleCloseEdit}
//         onSave={handleSaveEdit}
//       />
//     </div>
//   );
// }

// v.1.1.5 =====================================================================

// v.1.1.4 =====================================================================
// // src/app/cart/page.tsx

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   Trash2,
//   Loader2,
//   ShoppingCart as CartIcon,
//   Pencil,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";

// import { useShoppingCartPanel } from "@/components/use-shopping-cart-panel";

// export default function CartPage() {
//   const router = useRouter();

//   // เลื่อนขึ้นบนสุดเมื่อเข้าหน้านี้
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   // ✅ ใช้ logic ชุดเดียวกับ mini-cart
//   const {
//     items,
//     selectedItems,
//     loading,
//     totalUniqueItems,
//     selectedUniqueItems,
//     selectedTotalPrice,
//     toggleItemSelection,
//     toggleAllItems,
//     deleteItem,
//     updateQuantity, // ⭐ ใช้สำหรับบันทึกผลจาก modal
//   } = useShoppingCartPanel(true); // ให้โหลดทันทีเมื่อเข้า /cart

//   // ========= ราคารวม / ค่าจัดส่ง =========
//   const subtotal: number = selectedTotalPrice;
//   const shippingFee: number =
//     subtotal === 0 ? 0 : subtotal > 5000 ? 0 : 0; // ปรับตรรกะค่าจัดส่งได้ตรงนี้
//   const total: number = subtotal + shippingFee;

//   // ========= state สำหรับ Modal แก้ไขสินค้า =========
//   const [editingItemId, setEditingItemId] = useState<number | null>(null);
//   const [editQty, setEditQty] = useState<number>(1);

//   const editingItem = useMemo(
//     () => items.find((i) => i.id === editingItemId) ?? null,
//     [items, editingItemId],
//   );

//   // ตั้งค่าเริ่มต้นจำนวนเมื่อเปิด modal
//   useEffect(() => {
//     if (editingItem) {
//       const qty = Number(editingItem.quantity) || 1;
//       setEditQty(qty < 1 ? 1 : qty);
//     }
//   }, [editingItem]);

//   const handleOpenEdit = (id: number) => {
//     setEditingItemId(id);
//   };

//   const handleCloseEdit = () => {
//     setEditingItemId(null);
//   };

//   const handleChangeEditQty = (delta: number) => {
//     setEditQty((prev) => {
//       const next = prev + delta;
//       return next < 1 ? 1 : next;
//     });
//   };

//   const handleEditQtyInput = (value: string) => {
//     const n = Number(value);
//     if (Number.isNaN(n)) return;
//     setEditQty(n < 1 ? 1 : n);
//   };

//   const handleSaveEdit = () => {
//     if (!editingItem) return;
//     const safeQty = editQty < 1 ? 1 : editQty;
//     updateQuantity(editingItem.id, safeQty); // ✅ ตอนนี้ยังอัปเดตแค่ฝั่ง UI (เหมือนใน hook)
//     setEditingItemId(null);
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         {/* Header */}
//         <div className="flex items-center gap-4 mb-6">
//           <Button variant="ghost" size="icon" onClick={() => router.back()}>
//             <ArrowLeft className="h-5 w-5" />
//           </Button>
//           <h1 className="text-2xl font-bold flex items-center gap-2">
//             <CartIcon className="h-5 w-5" />
//             ตะกร้าสินค้า
//             <span className="text-base font-normal text-muted-foreground">
//               ({totalUniqueItems} รายการ)
//             </span>
//           </h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ซ้าย: รายการสินค้าในตะกร้า */}
//           <div className="lg:col-span-2 space-y-4">
//             {loading ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-sm gap-3 bg-card rounded-lg border">
//                 <Loader2 className="h-6 w-6 animate-spin" />
//                 <p>กำลังโหลดตะกร้าสินค้า...</p>
//               </div>
//             ) : items.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-card rounded-lg border">
//                 <CartIcon className="h-12 w-12 mb-4" />
//                 <p>ตะกร้าสินค้าว่าง</p>
//               </div>
//             ) : (
//               <>
//                 {/* แถวเลือกทั้งหมด */}
//                 <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
//                   <Checkbox
//                     checked={
//                       selectedItems.length === items.length && items.length > 0
//                     }
//                     onCheckedChange={toggleAllItems}
//                   />
//                   <span className="font-medium">
//                     เลือกทั้งหมด ({totalUniqueItems} รายการ)
//                   </span>
//                 </div>

//                 {/* รายการสินค้า (layout เหมือน mini-cart) */}
//                 {items.map((item) => {
//                   const discountLabel =
//                     item.discountPercent != null && item.discountPercent > 0
//                       ? `ประหยัด ${item.discountPercent}%`
//                       : null;

//                   return (
//                     <div
//                       key={item.id}
//                       className="p-4 bg-card rounded-lg border"
//                     >
//                       <div className="flex items-start gap-3">
//                         {/* Checkbox ทีละรายการ */}
//                         <Checkbox
//                           checked={selectedItems.includes(item.id)}
//                           onCheckedChange={() => toggleItemSelection(item.id)}
//                         />

//                         {/* รูปสินค้า */}
//                         {/* eslint-disable-next-line @next/next/no-img-element */}
//                         <img
//                           src={item.image}
//                           alt={item.name}
//                           className="w-20 h-20 object-cover rounded border"
//                         />

//                         <div className="flex-1 min-w-0 space-y-1">
//                           {/* ชื่อสินค้า */}
//                           <h3 className="font-semibold text-sm line-clamp-2">
//                             {item.name}
//                           </h3>

//                           {/* SKU */}
//                           <div className="text-[11px] font-semibold text-foreground">
//                             SKU: {item.sku}
//                           </div>

//                           {/* Brand (ถ้ามี) */}
//                           {item.brand && (
//                             <div className="text-[11px] text-muted-foreground">
//                               Brand: {item.brand}
//                             </div>
//                           )}

//                           {/* ราคา / หน่วย + ส่วนลด */}
//                           <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
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

//                             {item.originalPrice != null &&
//                               item.originalPrice > item.price && (
//                                 <span className="text-[11px] text-muted-foreground line-through">
//                                   ฿{item.originalPrice.toLocaleString()}
//                                 </span>
//                               )}

//                             {discountLabel && (
//                               <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600">
//                                 {discountLabel}
//                               </span>
//                             )}
//                           </div>

//                           {/* จำนวน + ปุ่มแก้ไข (simplified) */}
//                           <div className="mt-1 flex items-center justify-between gap-3">
//                             <div className="text-[11px] text-muted-foreground">
//                               จำนวน:{" "}
//                               <span className="font-medium text-foreground">
//                                 {item.quantity} {item.uom ? item.uom : ""}
//                               </span>
//                             </div>

//                             <Button
//                               type="button"
//                               variant="outline"
//                               size="sm"
//                               className="h-8 px-2 text-xs flex items-center gap-1"
//                               onClick={() => handleOpenEdit(item.id)}
//                             >
//                               <Pencil className="h-3 w-3" />
//                               แก้ไขสินค้า
//                             </Button>
//                           </div>

//                           {/* ราคารวมต่อบรรทัด */}
//                           <div className="text-sm">
//                             ราคารวม:{" "}
//                             <span className="font-bold text-red-600 text-base">
//                               ฿{item.lineTotal.toLocaleString()}
//                             </span>
//                           </div>
//                         </div>

//                         {/* ปุ่มลบ (ยิง /api/cart/remove แบบ mini-cart) */}
//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           className="h-8 w-8 text-destructive"
//                           onClick={() => deleteItem(item.id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </>
//             )}
//           </div>

//           {/* ขวา: สรุปคำสั่งซื้อ / ราคารวม */}
//           <div className="space-y-4">
//             <div className="p-4 bg-card rounded-lg border">
//               <h3 className="font-bold mb-4">สรุปคำสั่งซื้อ</h3>

//               {items.length === 0 && !loading ? (
//                 <p className="text-sm text-muted-foreground">
//                   ยังไม่มีสินค้าในตะกร้า
//                 </p>
//               ) : (
//                 <>
//                   <div className="space-y-3 text-sm">
//                     <div className="flex justify-between">
//                       <span>ยอดรวม ({selectedUniqueItems} รายการ)</span>
//                       <span>฿{subtotal.toLocaleString()}</span>
//                     </div>

//                     <div className="flex justify-between">
//                       <span>ค่าจัดส่ง</span>
//                       <span
//                         className={
//                           shippingFee === 0 && subtotal > 0
//                             ? "text-green-600"
//                             : ""
//                         }
//                       >
//                         {subtotal === 0
//                           ? "-"
//                           : shippingFee === 0
//                           ? "ฟรี"
//                           : `฿${shippingFee.toLocaleString()}`}
//                       </span>
//                     </div>

//                     <Separator />

//                     <div className="flex justify-between font-bold text-lg">
//                       <span>รวมทั้งสิ้น</span>
//                       <span className="text-primary">
//                         ฿{total.toLocaleString()}
//                       </span>
//                     </div>

//                     <p className="text-xs text-muted-foreground">
//                       รวม VAT แล้ว
//                     </p>
//                   </div>

//                   <Link href="/checkout">
//                     <Button
//                       className="w-full mt-4"
//                       size="lg"
//                       disabled={
//                         selectedItems.length === 0 || items.length === 0
//                       }
//                     >
//                       ดำเนินการชำระเงิน ({selectedUniqueItems})
//                     </Button>
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ===== Modal แก้ไขสินค้า (Simplified Layout) ===== */}
//       <Dialog open={!!editingItem} onOpenChange={(open) => !open && handleCloseEdit()}>
//         <DialogContent className="max-w-lg">
//           {editingItem && (
//             <>
//               <DialogHeader>
//                 <DialogTitle className="flex items-center gap-2">
//                   แก้ไขสินค้าในตะกร้า
//                 </DialogTitle>
//                 <DialogDescription className="text-xs sm:text-sm">
//                   ปรับจำนวนสินค้าที่ต้องการ แล้วกดบันทึกการแก้ไข
//                 </DialogDescription>
//               </DialogHeader>

//               <div className="flex flex-col sm:flex-row gap-4 mt-2">
//                 {/* รูปสินค้า */}
//                 {/* eslint-disable-next-line @next/next/no-img-element */}
//                 <img
//                   src={editingItem.image}
//                   alt={editingItem.name}
//                   className="w-24 h-24 object-cover rounded border self-start"
//                 />

//                 {/* ข้อมูลสินค้า & form แก้ไขจำนวน */}
//                 <div className="flex-1 space-y-3">
//                   <div>
//                     <div className="font-semibold text-sm line-clamp-2">
//                       {editingItem.name}
//                     </div>
//                     <div className="text-[11px] text-muted-foreground">
//                       SKU: {editingItem.sku}
//                     </div>
//                     {editingItem.brand && (
//                       <div className="text-[11px] text-muted-foreground">
//                         Brand: {editingItem.brand}
//                       </div>
//                     )}
//                   </div>

//                   <div className="space-y-1 text-sm">
//                     <div className="flex items-baseline gap-2">
//                       <span className="font-semibold text-primary text-lg">
//                         ฿{editingItem.price.toLocaleString()}
//                       </span>
//                       {editingItem.uom && (
//                         <span className="text-xs text-muted-foreground">
//                           / {editingItem.uom}
//                         </span>
//                       )}
//                     </div>
//                     {editingItem.originalPrice != null &&
//                       editingItem.originalPrice > editingItem.price && (
//                         <div className="text-xs text-muted-foreground line-through">
//                           ฿{editingItem.originalPrice.toLocaleString()}
//                         </div>
//                       )}
//                   </div>

//                   {/* ฟอร์มแก้ไขจำนวนแบบง่าย */}
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium">
//                       จำนวนที่ต้องการ
//                     </label>
//                     <div className="flex items-center gap-2">
//                       <Button
//                         type="button"
//                         variant="outline"
//                         size="icon"
//                         className="h-9 w-9"
//                         onClick={() => handleChangeEditQty(-1)}
//                         disabled={editQty <= 1}
//                       >
//                         -
//                       </Button>
//                       <Input
//                         type="number"
//                         className="w-20 text-center"
//                         value={editQty}
//                         onChange={(e) => handleEditQtyInput(e.target.value)}
//                         min={1}
//                       />
//                       <Button
//                         type="button"
//                         variant="outline"
//                         size="icon"
//                         className="h-9 w-9"
//                         onClick={() => handleChangeEditQty(1)}
//                       >
//                         +
//                       </Button>
//                       {editingItem.uom && (
//                         <span className="text-sm text-muted-foreground">
//                           {editingItem.uom}
//                         </span>
//                       )}
//                     </div>
//                     <div className="text-xs text-muted-foreground">
//                       ราคารวมใหม่:{" "}
//                       <span className="font-semibold text-foreground">
//                         ฿{(editQty * editingItem.price).toLocaleString()}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* ปุ่มแอคชัน */}
//               <div className="mt-4 flex flex-col sm:flex-row gap-2">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   className="flex-1"
//                   onClick={handleCloseEdit}
//                 >
//                   ยกเลิก
//                 </Button>
//                 <Button
//                   type="button"
//                   className="flex-1"
//                   onClick={handleSaveEdit}
//                 >
//                   บันทึกการแก้ไข
//                 </Button>
//               </div>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// v.1.1.4 =====================================================================

// v.1.1.3 =====================================================================
// // src/app/cart/page.tsx

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   Trash2,
//   Loader2,
//   ShoppingCart as CartIcon,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";

// import {
//   useShoppingCartPanel,
//   type UICartItem,
// } from "@/components/use-shopping-cart-panel";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";

// type CartItemEditModalProps = {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   item: UICartItem | null;
// };

// /**
//  * Modal สำหรับแก้ไขรายการสินค้าในตะกร้า
//  * ตอนนี้ยังเป็นหน้าว่าง ๆ ไว้เป็นโครง (จะยัด UI จาก product detail ทีหลัง)
//  */
// function CartItemEditModal({ open, onOpenChange, item }: CartItemEditModalProps) {
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-3xl">
//         <DialogHeader>
//           <DialogTitle>
//             แก้ไขรายการสินค้า
//             {item ? `: ${item.name}` : ""}
//           </DialogTitle>
//           <DialogDescription>
//             หน้านี้จะใช้สำหรับแก้ไขเงื่อนไข / หน่วย / จำนวน ของสินค้าในตะกร้า
//           </DialogDescription>
//         </DialogHeader>

//         {/* ✅ พื้นที่สำหรับใส่ UI แบบ product detail ในอนาคต */}
//         <div className="min-h-[200px] flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-md">
//           {/* แสดงข้อมูลเบื้องต้นเป็นตัวอย่างก่อน */}
//           {item ? (
//             <div className="space-y-2 text-center">
//               <div>SKU: {item.sku}</div>
//               <div>
//                 จำนวนปัจจุบันในตะกร้า:{" "}
//                 <span className="font-semibold">
//                   {item.quantity} {item.uom ?? ""}
//                 </span>
//               </div>
//               <div>ต่อไปจะเอา UI หน้า Product Detail มาใส่ตรงนี้</div>
//             </div>
//           ) : (
//             <span>ยังไม่มีสินค้าให้แก้ไข</span>
//           )}
//         </div>

//         {/* ปุ่มตัวอย่าง (ตอนนี้ยังไม่ยิง API) */}
//         <div className="mt-4 flex justify-end gap-2">
//           <Button variant="outline" onClick={() => onOpenChange(false)}>
//             ยกเลิก
//           </Button>
//           <Button disabled>
//             บันทึกการแก้ไข (ยังไม่เชื่อม API)
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// export default function CartPage() {
//   const router = useRouter();

//   // เลื่อนขึ้นบนสุดเมื่อเข้าหน้านี้
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   // ✅ ใช้ logic ชุดเดียวกับ mini-cart
//   const {
//     items,
//     selectedItems,
//     loading,
//     totalUniqueItems,
//     selectedUniqueItems,
//     selectedTotalPrice,
//     toggleItemSelection,
//     toggleAllItems,
//     deleteItem,
//   } = useShoppingCartPanel(true); // ให้โหลดทันทีเมื่อเข้า /cart

//   // state สำหรับ modal แก้ไขสินค้า
//   const [editingItemId, setEditingItemId] = useState<number | null>(null);
//   const [isEditOpen, setIsEditOpen] = useState(false);

//   const editingItem =
//     editingItemId != null
//       ? items.find((i) => i.id === editingItemId) ?? null
//       : null;

//   const handleOpenEdit = (itemId: number) => {
//     setEditingItemId(itemId);
//     setIsEditOpen(true);
//   };

//   const handleEditOpenChange = (open: boolean) => {
//     setIsEditOpen(open);
//     if (!open) {
//       setEditingItemId(null);
//     }
//   };

//   // คำนวนค่าจัดส่ง + ราคารวม (ใช้ยอดของ "รายการที่เลือก" เท่านั้น)
//   const subtotal = selectedTotalPrice;
//   const shippingFee: number =
//       subtotal === 0 ? 0 : subtotal > 5000 ? 0 : 0;
//   const total = subtotal + shippingFee;

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         {/* Header */}
//         <div className="flex items-center gap-4 mb-6">
//           <Button variant="ghost" size="icon" onClick={() => router.back()}>
//             <ArrowLeft className="h-5 w-5" />
//           </Button>
//           <h1 className="text-2xl font-bold flex items-center gap-2">
//             <CartIcon className="h-5 w-5" />
//             ตะกร้าสินค้า
//             <span className="text-base font-normal text-muted-foreground">
//               ({totalUniqueItems} รายการ)
//             </span>
//           </h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ซ้าย: รายการสินค้าในตะกร้า */}
//           <div className="lg:col-span-2 space-y-4">
//             {loading ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-sm gap-3 bg-card rounded-lg border">
//                 <Loader2 className="h-6 w-6 animate-spin" />
//                 <p>กำลังโหลดตะกร้าสินค้า...</p>
//               </div>
//             ) : items.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-card rounded-lg border">
//                 <CartIcon className="h-12 w-12 mb-4" />
//                 <p>ตะกร้าสินค้าว่าง</p>
//               </div>
//             ) : (
//               <>
//                 {/* แถวเลือกทั้งหมด (เหมือน mini-cart แต่แบบ full width) */}
//                 <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
//                   <Checkbox
//                     checked={
//                       selectedItems.length === items.length && items.length > 0
//                     }
//                     onCheckedChange={toggleAllItems}
//                   />
//                   <span className="font-medium">
//                     เลือกทั้งหมด ({totalUniqueItems} รายการ)
//                   </span>
//                 </div>

//                 {/* รายการสินค้า (ใช้ layout เดียวกับ mini-cart + ปุ่มแก้ไข) */}
//                 {items.map((item) => {
//                   const discountLabel =
//                     item.discountPercent != null && item.discountPercent > 0
//                       ? `ประหยัด ${item.discountPercent}%`
//                       : null;

//                   return (
//                     <div
//                       key={item.id}
//                       className="p-4 bg-card rounded-lg border"
//                     >
//                       <div className="flex items-start gap-3">
//                         {/* Checkbox ทีละรายการ */}
//                         <Checkbox
//                           checked={selectedItems.includes(item.id)}
//                           onCheckedChange={() => toggleItemSelection(item.id)}
//                         />

//                         {/* รูปสินค้า */}
//                         {/* eslint-disable-next-line @next/next/no-img-element */}
//                         <img
//                           src={item.image}
//                           alt={item.name}
//                           className="w-20 h-20 object-cover rounded border"
//                         />

//                         <div className="flex-1 min-w-0 space-y-1">
//                           {/* ชื่อสินค้า */}
//                           <h3 className="font-semibold text-sm line-clamp-2">
//                             {item.name}
//                           </h3>

//                           {/* SKU */}
//                           <div className="text-[11px] font-semibold text-foreground">
//                             SKU: {item.sku}
//                           </div>

//                           {/* Brand (ถ้ามี) */}
//                           {item.brand && (
//                             <div className="text-[11px] text-muted-foreground">
//                               Brand: {item.brand}
//                             </div>
//                           )}

//                           {/* ราคา / หน่วย + ส่วนลด */}
//                           <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
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

//                             {item.originalPrice != null &&
//                               item.originalPrice > item.price && (
//                                 <span className="text-[11px] text-muted-foreground line-through">
//                                   ฿{item.originalPrice.toLocaleString()}
//                                 </span>
//                               )}

//                             {discountLabel && (
//                               <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600">
//                                 {discountLabel}
//                               </span>
//                             )}
//                           </div>

//                           {/* จำนวน */}
//                           <div className="text-[11px] text-muted-foreground">
//                             จำนวน:{" "}
//                             <span className="font-medium text-foreground">
//                               {item.quantity} {item.uom ? item.uom : ""}
//                             </span>
//                           </div>

//                           {/* ราคารวมต่อบรรทัด */}
//                           <div className="text-sm">
//                             ราคารวม:{" "}
//                             <span className="font-bold text-red-600 text-base">
//                               ฿{item.lineTotal.toLocaleString()}
//                             </span>
//                           </div>
//                         </div>

//                         {/* ปุ่มด้านขวา: แก้ไข + ลบ */}
//                         <div className="flex flex-col items-end gap-2">
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             className="text-xs"
//                             onClick={() => handleOpenEdit(item.id)}
//                           >
//                             แก้ไขรายการ
//                           </Button>
//                           <Button
//                             size="icon"
//                             variant="ghost"
//                             className="h-8 w-8 text-destructive"
//                             onClick={() => deleteItem(item.id)}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </>
//             )}
//           </div>

//           {/* ขวา: สรุปคำสั่งซื้อ / ราคารวม */}
//           <div className="space-y-4">
//             <div className="p-4 bg-card rounded-lg border">
//               <h3 className="font-bold mb-4">สรุปคำสั่งซื้อ</h3>

//               {items.length === 0 && !loading ? (
//                 <p className="text-sm text-muted-foreground">
//                   ยังไม่มีสินค้าในตะกร้า
//                 </p>
//               ) : (
//                 <>
//                   <div className="space-y-3 text-sm">
//                     <div className="flex justify-between">
//                       <span>ยอดรวม ({selectedUniqueItems} รายการ)</span>
//                       <span>฿{subtotal.toLocaleString()}</span>
//                     </div>

//                     <div className="flex justify-between">
//                       <span>ค่าจัดส่ง</span>
//                       <span
//                         className={
//                           shippingFee === 0 && subtotal > 0
//                             ? "text-green-600"
//                             : ""
//                         }
//                       >
//                         {subtotal === 0
//                           ? "-"
//                           : shippingFee === 0
//                           ? "ฟรี"
//                           : `฿${shippingFee.toLocaleString()}`}
//                       </span>
//                     </div>

//                     <Separator />

//                     <div className="flex justify-between font-bold text-lg">
//                       <span>รวมทั้งสิ้น</span>
//                       <span className="text-primary">
//                         ฿{total.toLocaleString()}
//                       </span>
//                     </div>

//                     <p className="text-xs text-muted-foreground">
//                       รวม VAT แล้ว
//                     </p>
//                   </div>

//                   <Link href="/checkout">
//                     <Button
//                       className="w-full mt-4"
//                       size="lg"
//                       disabled={selectedItems.length === 0 || items.length === 0}
//                     >
//                       ดำเนินการชำระเงิน ({selectedUniqueItems})
//                     </Button>
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Modal แก้ไขสินค้าในตะกร้า */}
//       <CartItemEditModal
//         open={isEditOpen}
//         onOpenChange={handleEditOpenChange}
//         item={editingItem}
//       />
//     </div>
//   );
// }

// v.1.1.3 =====================================================================

// v.1.1.2 =====================================================================
// // src/app/cart/page.tsx

// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { ArrowLeft, Trash2, Loader2, ShoppingCart as CartIcon } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";

// import { useShoppingCartPanel } from "@/components/use-shopping-cart-panel";

// export default function CartPage() {
//   const router = useRouter();

//   // เลื่อนขึ้นบนสุดเมื่อเข้าหน้านี้
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   // ✅ ใช้ logic ชุดเดียวกับ mini-cart
//   const {
//     items,
//     selectedItems,
//     loading,
//     totalUniqueItems,
//     selectedUniqueItems,
//     selectedTotalPrice,
//     toggleItemSelection,
//     toggleAllItems,
//     deleteItem,
//   } = useShoppingCartPanel(true); // ให้โหลดทันทีเมื่อเข้า /cart

//   // คำนวนค่าจัดส่ง + ราคารวม (ใช้ยอดของ "รายการที่เลือก" เท่านั้น)
//   const subtotal = selectedTotalPrice;
//   const shippingFee =
//     subtotal === 0 ? 0 : subtotal > 5000 ? 0 : 0; // ฟรีเมื่อเกิน 2000 (ถ้าอยากเปลี่ยนตรรกะปรับตรงนี้ได้เลย)
//   const total = subtotal + shippingFee;

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         {/* Header */}
//         <div className="flex items-center gap-4 mb-6">
//           <Button variant="ghost" size="icon" onClick={() => router.back()}>
//             <ArrowLeft className="h-5 w-5" />
//           </Button>
//           <h1 className="text-2xl font-bold flex items-center gap-2">
//             <CartIcon className="h-5 w-5" />
//             ตะกร้าสินค้า
//             <span className="text-base font-normal text-muted-foreground">
//               ({totalUniqueItems} รายการ)
//             </span>
//           </h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ซ้าย: รายการสินค้าในตะกร้า */}
//           <div className="lg:col-span-2 space-y-4">
//             {loading ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-sm gap-3 bg-card rounded-lg border">
//                 <Loader2 className="h-6 w-6 animate-spin" />
//                 <p>กำลังโหลดตะกร้าสินค้า...</p>
//               </div>
//             ) : items.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-card rounded-lg border">
//                 <CartIcon className="h-12 w-12 mb-4" />
//                 <p>ตะกร้าสินค้าว่าง</p>
//               </div>
//             ) : (
//               <>
//                 {/* แถวเลือกทั้งหมด (เหมือน mini-cart แต่แบบ full width) */}
//                 <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
//                   <Checkbox
//                     checked={
//                       selectedItems.length === items.length && items.length > 0
//                     }
//                     onCheckedChange={toggleAllItems}
//                   />
//                   <span className="font-medium">
//                     เลือกทั้งหมด ({totalUniqueItems} รายการ)
//                   </span>
//                 </div>

//                 {/* รายการสินค้า (ใช้ layout เดียวกับ mini-cart) */}
//                 {items.map((item) => {
//                   const discountLabel =
//                     item.discountPercent != null && item.discountPercent > 0
//                       ? `ประหยัด ${item.discountPercent}%`
//                       : null;

//                   return (
//                     <div
//                       key={item.id}
//                       className="p-4 bg-card rounded-lg border"
//                     >
//                       <div className="flex items-start gap-3">
//                         {/* Checkbox ทีละรายการ */}
//                         <Checkbox
//                           checked={selectedItems.includes(item.id)}
//                           onCheckedChange={() => toggleItemSelection(item.id)}
//                         />

//                         {/* รูปสินค้า */}
//                         {/* eslint-disable-next-line @next/next/no-img-element */}
//                         <img
//                           src={item.image}
//                           alt={item.name}
//                           className="w-20 h-20 object-cover rounded border"
//                         />

//                         <div className="flex-1 min-w-0 space-y-1">
//                           {/* ชื่อสินค้า */}
//                           <h3 className="font-semibold text-sm line-clamp-2">
//                             {item.name}
//                           </h3>

//                           {/* SKU */}
//                           <div className="text-[11px] font-semibold text-foreground">
//                             SKU: {item.sku}
//                           </div>

//                           {/* Brand (ถ้ามี) */}
//                           {item.brand && (
//                             <div className="text-[11px] text-muted-foreground">
//                               Brand: {item.brand}
//                             </div>
//                           )}

//                           {/* ราคา / หน่วย + ส่วนลด */}
//                           <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
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

//                             {item.originalPrice != null &&
//                               item.originalPrice > item.price && (
//                                 <span className="text-[11px] text-muted-foreground line-through">
//                                   ฿{item.originalPrice.toLocaleString()}
//                                 </span>
//                               )}

//                             {discountLabel && (
//                               <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600">
//                                 {discountLabel}
//                               </span>
//                             )}
//                           </div>

//                           {/* จำนวน */}
//                           <div className="text-[11px] text-muted-foreground">
//                             จำนวน:{" "}
//                             <span className="font-medium text-foreground">
//                               {item.quantity} {item.uom ? item.uom : ""}
//                             </span>
//                           </div>

//                           {/* ราคารวมต่อบรรทัด */}
//                           <div className="text-sm">
//                             ราคารวม:{" "}
//                             <span className="font-bold text-red-600 text-base">
//                               ฿{item.lineTotal.toLocaleString()}
//                             </span>
//                           </div>
//                         </div>

//                         {/* ปุ่มลบ (ยิง /api/cart/remove แบบ mini-cart) */}
//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           className="h-8 w-8 text-destructive"
//                           onClick={() => deleteItem(item.id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </>
//             )}
//           </div>

//           {/* ขวา: สรุปคำสั่งซื้อ / ราคารวม */}
//           <div className="space-y-4">
//             <div className="p-4 bg-card rounded-lg border">
//               <h3 className="font-bold mb-4">สรุปคำสั่งซื้อ</h3>

//               {items.length === 0 && !loading ? (
//                 <p className="text-sm text-muted-foreground">
//                   ยังไม่มีสินค้าในตะกร้า
//                 </p>
//               ) : (
//                 <>
//                   <div className="space-y-3 text-sm">
//                     <div className="flex justify-between">
//                       <span>ยอดรวม ({selectedUniqueItems} รายการ)</span>
//                       <span>฿{subtotal.toLocaleString()}</span>
//                     </div>

//                     <div className="flex justify-between">
//                       <span>ค่าจัดส่ง</span>
//                       <span
//                         className={
//                           shippingFee === 0 && subtotal > 0
//                             ? "text-green-600"
//                             : ""
//                         }
//                       >
//                         {subtotal === 0
//                           ? "-"
//                           : shippingFee === 0
//                           ? "ฟรี"
//                           : `฿${shippingFee.toLocaleString()}`}
//                       </span>
//                     </div>

//                     <Separator />

//                     <div className="flex justify-between font-bold text-lg">
//                       <span>รวมทั้งสิ้น</span>
//                       <span className="text-primary">
//                         ฿{total.toLocaleString()}
//                       </span>
//                     </div>

//                     <p className="text-xs text-muted-foreground">
//                       รวม VAT แล้ว
//                     </p>
//                   </div>

//                   <Link href="/checkout">
//                     <Button
//                       className="w-full mt-4"
//                       size="lg"
//                       disabled={selectedItems.length === 0 || items.length === 0}
//                     >
//                       ดำเนินการชำระเงิน ({selectedUniqueItems})
//                     </Button>
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.2 =====================================================================

// // src/app/cart/page.tsx

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { ArrowLeft, Plus, Minus, Trash2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";


// // Mock cart data
// const cartItems = [
//   {
//     id: 1,
//     name: "Switch 24 Port Gigabit",
//     price: 2899,
//     quantity: 1,
//     image: "/assets/switch-24port.jpg",
//     store: "TechMall Official Store"
//   },
//   {
//     id: 2,
//     name: "สายแลน Cat6 UTP Cable 305m",
//     price: 1599,
//     originalPrice: 1799,
//     quantity: 2,
//     image: "/assets/lan-cable-cat6.jpg",
//     store: "NetworkPro Store",
//     discount: "Save ฿200"
//   },
//   {
//     id: 3,
//     name: "WiFi Router AC1200",
//     price: 1899,
//     quantity: 1,
//     image: "/assets/wifi-router-ac1200.jpg",
//     store: "ConnectTech Store"
//   }
// ];

// export default function CartPage() {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   const [items, setItems] = useState(cartItems);
//   const [selectedItems, setSelectedItems] = useState<number[]>(cartItems.map(item => item.id));

//   const toggleItemSelection = (itemId: number) => {
//     setSelectedItems(prev => 
//       prev.includes(itemId) 
//         ? prev.filter(id => id !== itemId)
//         : [...prev, itemId]
//     );
//   };

//   const toggleAllItems = () => {
//     const allSelected = selectedItems.length === items.length && items.length > 0;
//     setSelectedItems(allSelected ? [] : items.map(item => item.id));
//   };

//   const updateQuantity = (id: number, newQuantity: number) => {
//     if (newQuantity <= 0) {
//       setItems(items.filter(item => item.id !== id));
//       setSelectedItems(prev => prev.filter(itemId => itemId !== id));
//     } else {
//       setItems(items.map(item => 
//         item.id === id ? { ...item, quantity: newQuantity } : item
//       ));
//     }
//   };

//   const selectedItemsData = items.filter(item => selectedItems.includes(item.id));
//   const subtotal = selectedItemsData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//   const shippingFee = subtotal > 2000 ? 0 : 99; // Free shipping over ฿2000
//   const total = subtotal + shippingFee;

//   return (
//     <div className="min-h-screen bg-background">
      
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         {/* Header */}
//         <div className="flex items-center gap-4 mb-6">
//           <Button variant="ghost" size="icon" onClick={() => router.back()}>
//             <ArrowLeft className="h-5 w-5" />
//           </Button>
//           <h1 className="text-2xl font-bold">ตะกร้าสินค้า</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Cart Items */}
//           <div className="lg:col-span-2 space-y-4">
//             {/* Select All */}
//             <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
//               <Checkbox
//                 checked={selectedItems.length === items.length && items.length > 0}
//                 onCheckedChange={toggleAllItems}
//               />
//               <span className="font-medium">เลือกทั้งหมด ({items.length} รายการ)</span>
//               <Button variant="ghost" size="sm" className="ml-auto text-destructive">
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             </div>

//             {/* Cart Items List */}
//             {items.map((item) => (
//               <div key={item.id} className="p-4 bg-card rounded-lg border">
//                 <div className="flex items-start gap-3">
//                   <Checkbox
//                     checked={selectedItems.includes(item.id)}
//                     onCheckedChange={() => toggleItemSelection(item.id)}
//                   />
                  
//                   <div className="flex-1">
//                     {/* Store Name */}
//                     <div className="flex items-center gap-2 mb-3">
//                       <span className="text-sm text-muted-foreground">{item.store}</span>
//                     </div>
                    
//                     {/* Product Info */}
//                     <div className="flex gap-4">
//                       <img 
//                         src={item.image} 
//                         alt={item.name}
//                         className="w-20 h-20 object-cover rounded border"
//                       />
                      
//                       <div className="flex-1">
//                         <h3 className="font-medium text-sm mb-2 line-clamp-2">{item.name}</h3>
                        
//                         <div className="flex items-center gap-2 mb-3">
//                           <span className="text-lg font-bold text-primary">
//                             ฿{item.price.toLocaleString()}
//                           </span>
//                           {item.originalPrice && (
//                             <span className="text-sm text-muted-foreground line-through">
//                               ฿{item.originalPrice.toLocaleString()}
//                             </span>
//                           )}
//                           {item.discount && (
//                             <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
//                               {item.discount}
//                             </span>
//                           )}
//                         </div>
                        
//                         <div className="flex items-center justify-between">
//                           {/* Quantity Controls */}
//                           <div className="flex items-center gap-2">
//                             <Button
//                               size="icon"
//                               variant="outline"
//                               className="h-8 w-8"
//                               onClick={() => updateQuantity(item.id, item.quantity - 1)}
//                             >
//                               <Minus className="h-3 w-3" />
//                             </Button>
//                             <span className="w-12 text-center font-medium">{item.quantity}</span>
//                             <Button
//                               size="icon"
//                               variant="outline"
//                               className="h-8 w-8"
//                               onClick={() => updateQuantity(item.id, item.quantity + 1)}
//                             >
//                               <Plus className="h-3 w-3" />
//                             </Button>
//                           </div>
                          
//                           {/* Delete Button */}
//                           <Button
//                             size="icon"
//                             variant="ghost"
//                             className="h-8 w-8 text-destructive"
//                             onClick={() => updateQuantity(item.id, 0)}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Order Summary */}
//           <div className="space-y-4">
//             <div className="p-4 bg-card rounded-lg border">
//               <h3 className="font-bold mb-4">สรุปคำสั่งซื้อ</h3>
              
//               <div className="space-y-3">
//                 <div className="flex justify-between text-sm">
//                   <span>ยอดรวม ({selectedItems.length} รายการ)</span>
//                   <span>฿{subtotal.toLocaleString()}</span>
//                 </div>
                
//                 <div className="flex justify-between text-sm">
//                   <span>ค่าจัดส่ง</span>
//                   <span className={shippingFee === 0 ? "text-green-600" : ""}>
//                     {shippingFee === 0 ? "ฟรี" : `฿${shippingFee}`}
//                   </span>
//                 </div>
                
//                 <Separator />
                
//                 <div className="flex justify-between font-bold text-lg">
//                   <span>รวม</span>
//                   <span className="text-primary">฿{total.toLocaleString()}</span>
//                 </div>
                
//                 <p className="text-xs text-muted-foreground">
//                   รวม VAT แล้ว
//                 </p>
//               </div>
              
//               <Link href="/checkout">
//                 <Button 
//                   className="w-full mt-4" 
//                   size="lg"
//                   disabled={selectedItems.length === 0}
//                 >
//                   ดำเนินการชำระเงิน ({selectedItems.length})
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
      
//     </div>
//   );
// }
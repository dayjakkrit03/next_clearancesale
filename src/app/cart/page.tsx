// v.1.1.3 =====================================================================
// src/app/cart/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  Loader2,
  ShoppingCart as CartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import {
  useShoppingCartPanel,
  type UICartItem,
} from "@/components/use-shopping-cart-panel";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type CartItemEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: UICartItem | null;
};

/**
 * Modal สำหรับแก้ไขรายการสินค้าในตะกร้า
 * ตอนนี้ยังเป็นหน้าว่าง ๆ ไว้เป็นโครง (จะยัด UI จาก product detail ทีหลัง)
 */
function CartItemEditModal({ open, onOpenChange, item }: CartItemEditModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            แก้ไขรายการสินค้า
            {item ? `: ${item.name}` : ""}
          </DialogTitle>
          <DialogDescription>
            หน้านี้จะใช้สำหรับแก้ไขเงื่อนไข / หน่วย / จำนวน ของสินค้าในตะกร้า
          </DialogDescription>
        </DialogHeader>

        {/* ✅ พื้นที่สำหรับใส่ UI แบบ product detail ในอนาคต */}
        <div className="min-h-[200px] flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-md">
          {/* แสดงข้อมูลเบื้องต้นเป็นตัวอย่างก่อน */}
          {item ? (
            <div className="space-y-2 text-center">
              <div>SKU: {item.sku}</div>
              <div>
                จำนวนปัจจุบันในตะกร้า:{" "}
                <span className="font-semibold">
                  {item.quantity} {item.uom ?? ""}
                </span>
              </div>
              <div>ต่อไปจะเอา UI หน้า Product Detail มาใส่ตรงนี้</div>
            </div>
          ) : (
            <span>ยังไม่มีสินค้าให้แก้ไข</span>
          )}
        </div>

        {/* ปุ่มตัวอย่าง (ตอนนี้ยังไม่ยิง API) */}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button disabled>
            บันทึกการแก้ไข (ยังไม่เชื่อม API)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CartPage() {
  const router = useRouter();

  // เลื่อนขึ้นบนสุดเมื่อเข้าหน้านี้
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ✅ ใช้ logic ชุดเดียวกับ mini-cart
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
  } = useShoppingCartPanel(true); // ให้โหลดทันทีเมื่อเข้า /cart

  // state สำหรับ modal แก้ไขสินค้า
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const editingItem =
    editingItemId != null
      ? items.find((i) => i.id === editingItemId) ?? null
      : null;

  const handleOpenEdit = (itemId: number) => {
    setEditingItemId(itemId);
    setIsEditOpen(true);
  };

  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) {
      setEditingItemId(null);
    }
  };

  // คำนวนค่าจัดส่ง + ราคารวม (ใช้ยอดของ "รายการที่เลือก" เท่านั้น)
  const subtotal = selectedTotalPrice;
  const shippingFee: number =
      subtotal === 0 ? 0 : subtotal > 5000 ? 0 : 0;
  const total = subtotal + shippingFee;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
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
          {/* ซ้าย: รายการสินค้าในตะกร้า */}
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
                {/* แถวเลือกทั้งหมด (เหมือน mini-cart แต่แบบ full width) */}
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

                {/* รายการสินค้า (ใช้ layout เดียวกับ mini-cart + ปุ่มแก้ไข) */}
                {items.map((item) => {
                  const discountLabel =
                    item.discountPercent != null && item.discountPercent > 0
                      ? `ประหยัด ${item.discountPercent}%`
                      : null;

                  return (
                    <div
                      key={item.id}
                      className="p-4 bg-card rounded-lg border"
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox ทีละรายการ */}
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => toggleItemSelection(item.id)}
                        />

                        {/* รูปสินค้า */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded border"
                        />

                        <div className="flex-1 min-w-0 space-y-1">
                          {/* ชื่อสินค้า */}
                          <h3 className="font-semibold text-sm line-clamp-2">
                            {item.name}
                          </h3>

                          {/* SKU */}
                          <div className="text-[11px] font-semibold text-foreground">
                            SKU: {item.sku}
                          </div>

                          {/* Brand (ถ้ามี) */}
                          {item.brand && (
                            <div className="text-[11px] text-muted-foreground">
                              Brand: {item.brand}
                            </div>
                          )}

                          {/* ราคา / หน่วย + ส่วนลด */}
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

                          {/* จำนวน */}
                          <div className="text-[11px] text-muted-foreground">
                            จำนวน:{" "}
                            <span className="font-medium text-foreground">
                              {item.quantity} {item.uom ? item.uom : ""}
                            </span>
                          </div>

                          {/* ราคารวมต่อบรรทัด */}
                          <div className="text-sm">
                            ราคารวม:{" "}
                            <span className="font-bold text-red-600 text-base">
                              ฿{item.lineTotal.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* ปุ่มด้านขวา: แก้ไข + ลบ */}
                        <div className="flex flex-col items-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => handleOpenEdit(item.id)}
                          >
                            แก้ไขรายการ
                          </Button>
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
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* ขวา: สรุปคำสั่งซื้อ / ราคารวม */}
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
                      <span>฿{subtotal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>ค่าจัดส่ง</span>
                      <span
                        className={
                          shippingFee === 0 && subtotal > 0
                            ? "text-green-600"
                            : ""
                        }
                      >
                        {subtotal === 0
                          ? "-"
                          : shippingFee === 0
                          ? "ฟรี"
                          : `฿${shippingFee.toLocaleString()}`}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-bold text-lg">
                      <span>รวมทั้งสิ้น</span>
                      <span className="text-primary">
                        ฿{total.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      รวม VAT แล้ว
                    </p>
                  </div>

                  <Link href="/checkout">
                    <Button
                      className="w-full mt-4"
                      size="lg"
                      disabled={selectedItems.length === 0 || items.length === 0}
                    >
                      ดำเนินการชำระเงิน ({selectedUniqueItems})
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal แก้ไขสินค้าในตะกร้า */}
      <CartItemEditModal
        open={isEditOpen}
        onOpenChange={handleEditOpenChange}
        item={editingItem}
      />
    </div>
  );
}

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
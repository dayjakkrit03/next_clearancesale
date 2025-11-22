// v.1.1.5 ==========================================================
// src/components/shopping-cart.tsx
"use client";

/**
 * Wrapper บาง ๆ เอาไว้ใช้ import จาก component อื่น
 * ให้ใช้ <ShoppingCart isOpen={...} onClose={...} /> เหมือนเดิม
 */

import {
  ShoppingCartPanel,
  type ShoppingCartPanelProps,
} from "./shopping-cart-panel";

export type ShoppingCartProps = ShoppingCartPanelProps;

export function ShoppingCart(props: ShoppingCartProps) {
  return <ShoppingCartPanel {...props} />;
}

// v.1.1.5 ==========================================================

// v.1.1.4 ===========================================================
// // src/components/shopping-cart.tsx

// "use client";

// /**
//  * Wrapper บาง ๆ เอาไว้ใช้ import จาก component อื่น
//  * ให้ใช้ <ShoppingCart isOpen={...} onClose={...} /> เหมือนเดิม
//  */

// import {
//   ShoppingCartPanel,
//   type ShoppingCartPanelProps,
// } from "./shopping-cart-panel";

// export type ShoppingCartProps = ShoppingCartPanelProps;

// export function ShoppingCart(props: ShoppingCartProps) {
//   return <ShoppingCartPanel {...props} />;
// }

// v.1.1.4 ===========================================================

// v.1.1.3 ===========================================================
// // src/components/shopping-cart.tsx

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   ShoppingCart as CartIcon,
//   Plus,
//   Minus,
//   Trash2,
//   Loader2, // 🌀 spinner icon
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

// // รูปแบบข้อมูลที่ backend ส่งมา (ปรับตาม /api/cart/list ของคุณได้)
// type ApiCartItem = {
//   id: number;
//   product: string;
//   name?: string | null;
//   imageUrl?: string | null;
//   price: number;
//   quantity: number;
//   amount?: number;
//   checked?: boolean;
// };

// // รูปแบบที่ UI ใช้จริง (แค่ field ที่เราต้องใช้)
// type CartItem = {
//   id: number;
//   name: string;
//   price: number;
//   quantity: number;
//   image: string;
//   checked: boolean;
// };

// interface ShoppingCartProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export const ShoppingCart = ({ isOpen, onClose }: ShoppingCartProps) => {
//   const router = useRouter();

//   const [items, setItems] = useState<CartItem[]>([]);
//   const [selectedItems, setSelectedItems] = useState<number[]>([]);
//   const [loading, setLoading] = useState(false);

//   // โหลดข้อมูลจาก /api/cart/list ทุกครั้งที่เปิดแผงตะกร้า
//   useEffect(() => {
//     if (!isOpen) return;

//     let cancelled = false;
//     const loadCart = async () => {
//       try {
//         setLoading(true);

//         const res = await fetch("/api/cart/list", {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//           cache: "no-store",
//         });

//         if (!res.ok) {
//           console.error("[ShoppingCart] Failed to load cart", res.status);
//           return;
//         }

//         const data = await res.json();
//         const apiItems: ApiCartItem[] = data.items ?? [];

//         const mapped: CartItem[] = apiItems.map((item) => ({
//           id: Number(item.id),
//           name: (item.name ?? item.product ?? "สินค้า").toString(),
//           price: Number(item.price) || 0,
//           quantity: Number(item.quantity) || 0,
//           image: item.imageUrl || "/placeholder.png",
//           checked: item.checked ?? true,
//         }));

//         if (cancelled) return;

//         setItems(mapped);
//         // เลือกทั้งหมดโดย default ตาม checked flag
//         setSelectedItems(mapped.filter((i) => i.checked).map((i) => i.id));
//       } catch (e) {
//         console.error("[ShoppingCart] error loading cart", e);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     loadCart();

//     return () => {
//       cancelled = true;
//     };
//   }, [isOpen]);

//   const totalUniqueItems = items.length;
//   const selectedUniqueItems = selectedItems.length;
//   const selectedTotalPrice = items
//     .filter((item) => selectedItems.includes(item.id))
//     .reduce((sum, item) => sum + item.price * item.quantity, 0);

//   const toggleItemSelection = (itemId: number) => {
//     setSelectedItems((prev) =>
//       prev.includes(itemId)
//         ? prev.filter((id) => id !== itemId)
//         : [...prev, itemId],
//     );
//   };

//   const toggleAllItems = () => {
//     const allSelected = selectedItems.length === items.length;
//     setSelectedItems(allSelected ? [] : items.map((item) => item.id));
//   };

//   // ตอนนี้ยังเป็นแค่แก้ state ฝั่ง UI ก่อน (ยังไม่ยิง /api/cart/update)
//   const updateQuantity = (id: number, newQuantity: number) => {
//     if (newQuantity <= 0) {
//       setItems((prev) => prev.filter((item) => item.id !== id));
//       setSelectedItems((prev) => prev.filter((sid) => sid !== id));
//     } else {
//       setItems((prev) =>
//         prev.map((item) =>
//           item.id === id ? { ...item, quantity: newQuantity } : item,
//         ),
//       );
//     }
//   };

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

//                 {items.map((item) => (
//                   <div
//                     key={item.id}
//                     className="flex flex-col gap-3 p-3 border rounded-lg"
//                   >
//                     <div className="flex items-start gap-3">
//                       <Checkbox
//                         checked={selectedItems.includes(item.id)}
//                         onCheckedChange={() => toggleItemSelection(item.id)}
//                       />
//                       {/* eslint-disable-next-line @next/next/no-img-element */}
//                       <img
//                         src={item.image}
//                         alt={item.name}
//                         className="w-16 h-16 object-cover rounded"
//                       />
//                       <div className="flex-1">
//                         <h4 className="font-medium text-sm">{item.name}</h4>
//                         <div className="flex items-center gap-2 mt-1">
//                           <p className="text-primary font-semibold">
//                             ฿{item.price.toLocaleString()}
//                           </p>
//                         </div>
//                       </div>
//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         className="h-6 w-6 text-destructive"
//                         onClick={() => updateQuantity(item.id, 0)}
//                       >
//                         <Trash2 className="h-3 w-3" />
//                       </Button>
//                     </div>

//                     <div className="flex items-center justify-end gap-2">
//                       <span className="text-sm text-muted-foreground">
//                         จำนวน:
//                       </span>
//                       <div className="flex items-center gap-2">
//                         <Button
//                           size="icon"
//                           variant="outline"
//                           className="h-7 w-7"
//                           onClick={() =>
//                             updateQuantity(item.id, item.quantity - 1)
//                           }
//                         >
//                           <Minus className="h-3 w-3" />
//                         </Button>
//                         <span className="w-8 text-center text-sm">
//                           {item.quantity}
//                         </span>
//                         <Button
//                           size="icon"
//                           variant="outline"
//                           className="h-7 w-7"
//                           onClick={() =>
//                             updateQuantity(item.id, item.quantity + 1)
//                           }
//                         >
//                           <Plus className="h-3 w-3" />
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
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
// };

// v.1.1.3 ===========================================================

// v.1.1.2 ===========================================================
// // src/components/shopping-cart.tsx

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { ShoppingCart as CartIcon, Plus, Minus, Trash2 } from "lucide-react";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetDescription,
// } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";

// // รูปแบบข้อมูลที่ backend ส่งมา (ปรับตาม /api/cart/list ของคุณได้)
// type ApiCartItem = {
//   id: number;
//   product: string;
//   name?: string | null;
//   imageUrl?: string | null;
//   price: number;
//   quantity: number;
//   amount?: number;
//   checked?: boolean;
// };

// // รูปแบบที่ UI ใช้จริง (แค่ field ที่เราต้องใช้)
// type CartItem = {
//   id: number;
//   name: string;
//   price: number;
//   quantity: number;
//   image: string;
//   checked: boolean;
// };

// interface ShoppingCartProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export const ShoppingCart = ({ isOpen, onClose }: ShoppingCartProps) => {
//   const router = useRouter();

//   const [items, setItems] = useState<CartItem[]>([]);
//   const [selectedItems, setSelectedItems] = useState<number[]>([]);
//   const [loading, setLoading] = useState(false);

//   // โหลดข้อมูลจาก /api/cart/list ทุกครั้งที่เปิดแผงตะกร้า
//   useEffect(() => {
//     if (!isOpen) return;

//     let cancelled = false;
//     const loadCart = async () => {
//       try {
//         setLoading(true);

//         const res = await fetch("/api/cart/list", {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//           cache: "no-store",
//         });

//         if (!res.ok) {
//           console.error("[ShoppingCart] Failed to load cart", res.status);
//           return;
//         }

//         const data = await res.json();
//         const apiItems: ApiCartItem[] = data.items ?? [];

//         const mapped: CartItem[] = apiItems.map((item) => ({
//           id: Number(item.id),
//           name: (item.name ?? item.product ?? "สินค้า").toString(),
//           price: Number(item.price) || 0,
//           quantity: Number(item.quantity) || 0,
//           image: item.imageUrl || "/placeholder.png",
//           checked: item.checked ?? true,
//         }));

//         if (cancelled) return;

//         setItems(mapped);
//         // เลือกทั้งหมดโดย default ตาม checked flag
//         setSelectedItems(
//           mapped.filter((i) => i.checked).map((i) => i.id),
//         );
//       } catch (e) {
//         console.error("[ShoppingCart] error loading cart", e);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     loadCart();

//     return () => {
//       cancelled = true;
//     };
//   }, [isOpen]);

//   const totalUniqueItems = items.length;
//   const selectedUniqueItems = selectedItems.length;
//   const selectedTotalPrice = items
//     .filter((item) => selectedItems.includes(item.id))
//     .reduce((sum, item) => sum + item.price * item.quantity, 0);

//   const toggleItemSelection = (itemId: number) => {
//     setSelectedItems((prev) =>
//       prev.includes(itemId)
//         ? prev.filter((id) => id !== itemId)
//         : [...prev, itemId],
//     );
//   };

//   const toggleAllItems = () => {
//     const allSelected = selectedItems.length === items.length;
//     setSelectedItems(allSelected ? [] : items.map((item) => item.id));
//   };

//   // ตอนนี้ยังเป็นแค่แก้ state ฝั่ง UI ก่อน (ยังไม่ยิง /api/cart/update)
//   const updateQuantity = (id: number, newQuantity: number) => {
//     if (newQuantity <= 0) {
//       setItems((prev) => prev.filter((item) => item.id !== id));
//       setSelectedItems((prev) => prev.filter((sid) => sid !== id));
//     } else {
//       setItems((prev) =>
//         prev.map((item) =>
//           item.id === id ? { ...item, quantity: newQuantity } : item,
//         ),
//       );
//     }
//   };

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
//               <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
//                 กำลังโหลดตะกร้าสินค้า...
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

//                 {items.map((item) => (
//                   <div
//                     key={item.id}
//                     className="flex flex-col gap-3 p-3 border rounded-lg"
//                   >
//                     <div className="flex items-start gap-3">
//                       <Checkbox
//                         checked={selectedItems.includes(item.id)}
//                         onCheckedChange={() => toggleItemSelection(item.id)}
//                       />
//                       {/* eslint-disable-next-line @next/next/no-img-element */}
//                       <img
//                         src={item.image}
//                         alt={item.name}
//                         className="w-16 h-16 object-cover rounded"
//                       />
//                       <div className="flex-1">
//                         <h4 className="font-medium text-sm">{item.name}</h4>
//                         <div className="flex items-center gap-2 mt-1">
//                           <p className="text-primary font-semibold">
//                             ฿{item.price.toLocaleString()}
//                           </p>
//                         </div>
//                       </div>
//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         className="h-6 w-6 text-destructive"
//                         onClick={() => updateQuantity(item.id, 0)}
//                       >
//                         <Trash2 className="h-3 w-3" />
//                       </Button>
//                     </div>

//                     <div className="flex items-center justify-end gap-2">
//                       <span className="text-sm text-muted-foreground">
//                         จำนวน:
//                       </span>
//                       <div className="flex items-center gap-2">
//                         <Button
//                           size="icon"
//                           variant="outline"
//                           className="h-7 w-7"
//                           onClick={() =>
//                             updateQuantity(item.id, item.quantity - 1)
//                           }
//                         >
//                           <Minus className="h-3 w-3" />
//                         </Button>
//                         <span className="w-8 text-center text-sm">
//                           {item.quantity}
//                         </span>
//                         <Button
//                           size="icon"
//                           variant="outline"
//                           className="h-7 w-7"
//                           onClick={() =>
//                             updateQuantity(item.id, item.quantity + 1)
//                           }
//                         >
//                           <Plus className="h-3 w-3" />
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
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
// };

// v.1.1.2 ===========================================================

// // src/components/shopping-cart.tsx

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { ShoppingCart as CartIcon, Plus, Minus, Trash2 } from "lucide-react";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetDescription,
// } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";

// // Mock cart data
// const cartItems = [
//   {
//     id: 1,
//     name: "Switch 24 Port Gigabit",
//     price: 2899,
//     quantity: 1,
//     image: "/assets/switch-24port.jpg"
//   },
//   {
//     id: 2,
//     name: "สายแลน Cat6 UTP Cable 305m",
//     price: 1599,
//     originalPrice: 1799,
//     discount: "Save ฿200",
//     quantity: 2,
//     image: "/assets/lan-cable-cat6.jpg"
//   },
//   {
//     id: 3,
//     name: "WiFi Router AC1200",
//     price: 1899,
//     quantity: 1,
//     image: "/assets/wifi-router-ac1200.jpg"
//   }
// ];

// interface ShoppingCartProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export const ShoppingCart = ({ isOpen, onClose }: ShoppingCartProps) => {
//   const router = useRouter();
//   const [items, setItems] = useState(cartItems);
//   const [selectedItems, setSelectedItems] = useState<number[]>(cartItems.map(item => item.id)); // Select all by default

//   const totalUniqueItems = items.length;
//   const selectedUniqueItems = selectedItems.length;
//   const selectedTotalPrice = items
//     .filter(item => selectedItems.includes(item.id))
//     .reduce((sum, item) => sum + (item.price * item.quantity), 0);

//   const toggleItemSelection = (itemId: number) => {
//     setSelectedItems(prev => 
//       prev.includes(itemId) 
//         ? prev.filter(id => id !== itemId)
//         : [...prev, itemId]
//     );
//   };

//   const toggleAllItems = () => {
//     const allSelected = selectedItems.length === items.length;
//     setSelectedItems(allSelected ? [] : items.map(item => item.id));
//   };

//   const updateQuantity = (id: number, newQuantity: number) => {
//     if (newQuantity <= 0) {
//       setItems(items.filter(item => item.id !== id));
//     } else {
//       setItems(items.map(item => 
//         item.id === id ? { ...item, quantity: newQuantity } : item
//       ));
//     }
//   };

//   return (
//     <Sheet open={isOpen} onOpenChange={onClose}>
//       <SheetContent side="right" className="w-96 sm:max-w-md max-w-full overflow-hidden flex flex-col">
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
//             {items.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
//                 <CartIcon className="h-12 w-12 mb-4" />
//                 <p>ตะกร้าสินค้าว่าง</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {/* Select All Checkbox */}
//                 <div className="flex items-center gap-2 pb-2 border-b">
//                   <Checkbox
//                     checked={selectedItems.length === items.length && items.length > 0}
//                     onCheckedChange={toggleAllItems}
//                   />
//                   <span className="text-sm font-medium">เลือกทั้งหมด</span>
//                 </div>
                
//                 {items.map((item) => (
//                   <div key={item.id} className="flex flex-col gap-3 p-3 border rounded-lg">
//                     <div className="flex items-start gap-3">
//                       <Checkbox
//                         checked={selectedItems.includes(item.id)}
//                         onCheckedChange={() => toggleItemSelection(item.id)}
//                       />
//                       <img 
//                         src={item.image} 
//                         alt={item.name}
//                         className="w-16 h-16 object-cover rounded"
//                       />
//                       <div className="flex-1">
//                         <h4 className="font-medium text-sm">{item.name}</h4>
//                         <div className="flex items-center gap-2 mt-1">
//                           <p className="text-primary font-semibold">฿{item.price.toLocaleString()}</p>
//                           {item.originalPrice && (
//                             <>
//                               <span className="text-xs text-muted-foreground line-through">
//                                 ฿{item.originalPrice.toLocaleString()}
//                               </span>
//                               {item.discount && (
//                                 <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
//                                   {item.discount}
//                                 </span>
//                               )}
//                             </>
//                           )}
//                         </div>
//                       </div>
//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         className="h-6 w-6 text-destructive"
//                         onClick={() => updateQuantity(item.id, 0)}
//                       >
//                         <Trash2 className="h-3 w-3" />
//                       </Button>
//                     </div>
                    
//                     <div className="flex items-center justify-end gap-2">
//                       <span className="text-sm text-muted-foreground">จำนวน:</span>
//                       <div className="flex items-center gap-2">
//                         <Button
//                           size="icon"
//                           variant="outline"
//                           className="h-7 w-7"
//                           onClick={() => updateQuantity(item.id, item.quantity - 1)}
//                         >
//                           <Minus className="h-3 w-3" />
//                         </Button>
//                         <span className="w-8 text-center text-sm">{item.quantity}</span>
//                         <Button
//                           size="icon"
//                           variant="outline"
//                           className="h-7 w-7"
//                           onClick={() => updateQuantity(item.id, item.quantity + 1)}
//                         >
//                           <Plus className="h-3 w-3" />
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
          
//           {/* Cart Summary */}
//           {items.length > 0 && (
//             <div className="border-t pt-4 mt-auto space-y-4">
//               <div className="flex justify-between items-center">
//                 <span className="font-medium">รวม ({selectedUniqueItems} รายการ):</span>
//                 <span className="font-bold text-lg text-primary">฿{selectedTotalPrice.toLocaleString()}</span>
//               </div>
              
//               <div className="space-y-2">
//                 <Button
//                   className="w-full" 
//                   size="lg"
//                   disabled={selectedItems.length === 0}
//                   onClick={() => {
//                     router.push('/checkout');
//                     onClose();
//                   }}
//                 >
//                   ชำระเงิน ({selectedUniqueItems} รายการ)
//                 </Button>
//                 <Button 
//                   variant="outline" 
//                   className="w-full"
//                   onClick={() => {
//                     router.push('/cart');
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
// };
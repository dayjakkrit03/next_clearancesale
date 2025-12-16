// v.1.1.7 ===============================================================


// v.1.1.7 ===============================================================

// v.1.1.6 ===============================================================
// src/app/checkout/component/CheckoutSummarySection.tsx
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

import type { CheckoutSummaryProps } from "@/types/checkout";

/* =========================
 * Types
 * ========================= */
type StockCheckItem = {
  sku?: string;
  uom?: string;
  quantity: number;
};

type Props = CheckoutSummaryProps & {
  items?: StockCheckItem[];
  setInsufficientSkus?: (skus: string[]) => void; // ✅ เพิ่ม
};

export default function CheckoutSummarySection({
  itemCount,
  subtotal,
  shippingFee,
  voucherDiscount,
  total,
  onPlaceOrder,
  items = [],
  setInsufficientSkus,
}: Props) {
  const { toast } = useToast();
  const [checkingStock, setCheckingStock] = useState(false);

  const handlePayWithStockCheck = async () => {
    try {
      // ไม่มี items → ทำงานเดิม
      if (!items.length) {
        onPlaceOrder();
        return;
      }

      setCheckingStock(true);

      const payload = {
        items: items
          .filter((i) => !!i.sku)
          .map((i) => {
            if (i.uom === "M.") {
              return {
                sku: i.sku!,
                uom: i.uom,
                quantity: 1,
                total: Number(i.quantity),
              };
            }

            return {
              sku: i.sku!,
              uom: i.uom,
              quantity: i.quantity,
              total: 0,
            };
          }),
      };

      const res = await fetch("/api/stock/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      // ❌ สต๊อกไม่พอ
      if (!result?.ok) {
        const skus: string[] = Array.isArray(result?.insufficientItems)
          ? result.insufficientItems
              .map((i: any) => i.sku)
              .filter(Boolean)
          : [];

        // ส่ง SKU กลับไปให้ Client เพื่อไฮไลต์กรอบแดง
        setInsufficientSkus?.(skus);

        // ✅ auto-scroll ไปตัวแรก
        if (skus.length > 0) {
          requestAnimationFrame(() => {
            const el = document.querySelector(
              `[data-sku="${skus[0]}"]`,
            );
            el?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          });
        }

        toast({
          title: "สต๊อกไม่เพียงพอ",
          description:
            skus.length > 0
              ? `มีสินค้า ${skus.length} รายการที่สต๊อกไม่พอ`
              : "สินค้าบางรายการไม่พอสำหรับจำนวนที่เลือก",
          variant: "destructive",
        });
        return;
      }

      // ✅ ผ่าน → ล้างสถานะ error เดิม แล้วทำงานต่อ
      setInsufficientSkus?.([]);
      onPlaceOrder();
    } catch (err) {
      console.error("[CHECKOUT][STOCK][ERROR]", err);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถตรวจสอบสต๊อกได้",
        variant: "destructive",
      });
    } finally {
      setCheckingStock(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">รายละเอียดคำสั่งซื้อ</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>ราคาสินค้า ({itemCount} รายการ)</span>
          <span>฿{subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>ค่าจัดส่ง</span>
          <span className={shippingFee === 0 ? "text-green-600" : ""}>
            {shippingFee === 0 ? "ฟรี" : `฿${shippingFee.toLocaleString()}`}
          </span>
        </div>

        {voucherDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>ส่วนลด</span>
            <span>-฿{voucherDiscount.toLocaleString()}</span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>ยอดรวมทั้งหมด</span>
          <span className="text-orange-600">
            ฿{total.toLocaleString()}
          </span>
        </div>

        <Button
          className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white"
          size="lg"
          disabled={checkingStock}
          onClick={handlePayWithStockCheck}
        >
          {checkingStock ? "กำลังตรวจสอบสต๊อก..." : "ชำระเงิน"}
        </Button>
      </CardContent>
    </Card>
  );
}

// v.1.1.6 ===============================================================

// v.1.1.5 ===============================================================
// // src/app/checkout/component/CheckoutSummarySection.tsx
// "use client";

// import { useState } from "react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/components/ui/use-toast";

// import type { CheckoutSummaryProps } from "@/types/checkout";

// /** 🔹 เพิ่ม type เสริม (ไม่กระทบของเดิม) */
// type StockCheckItem = {
//   sku?: string;        // ✅ เปลี่ยนตรงนี้
//   uom?: string;
//   quantity: number;
// };

// type Props = CheckoutSummaryProps & {
//   /** ส่งมาก็ได้ ไม่ส่งก็ได้ */
//   items?: StockCheckItem[];
// };

// export default function CheckoutSummarySection({
//   itemCount,
//   subtotal,
//   shippingFee,
//   voucherDiscount,
//   total,
//   onPlaceOrder,
//   items = [],
// }: Props) {
//   const { toast } = useToast();
//   const [checkingStock, setCheckingStock] = useState(false);

//   const handlePayWithStockCheck = async () => {
//     try {
//       // ถ้าไม่มี items → ทำงานเดิมทันที
//       if (!items.length) {
//         onPlaceOrder();
//         return;
//       }

//       setCheckingStock(true);

//       const payload = {
//         items: items
//           .filter((i) => !!i.sku) // ✅ กัน sku undefined
//           .map((i) => {
//             if (i.uom === "M.") {
//               return {
//                 sku: i.sku!,              // ✅ ใช้ ! ได้อย่างปลอดภัย
//                 uom: i.uom,
//                 quantity: 1,
//                 total: Number(i.quantity),
//               };
//             }

//             return {
//               sku: i.sku!,                // ✅
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
//             "สินค้าบางรายการไม่พอสำหรับความยาวที่เลือก กรุณาตรวจสอบรายการ",
//           variant: "destructive",
//         });
//         return;
//       }

//       // ✅ ผ่าน → ทำงานเดิม
//       onPlaceOrder();
//     } catch (err) {
//       console.error("[CHECKOUT][STOCK][ERROR]", err);
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
//     <Card>
//       <CardHeader className="pb-3">
//         <CardTitle className="text-lg">รายละเอียดคำสั่งซื้อ</CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-3">
//         <div className="flex justify-between text-sm">
//           <span>ราคาสินค้า ({itemCount} รายการ)</span>
//           <span>฿{subtotal.toLocaleString()}</span>
//         </div>

//         <div className="flex justify-between text-sm">
//           <span>ค่าจัดส่ง</span>
//           <span className={shippingFee === 0 ? "text-green-600" : ""}>
//             {shippingFee === 0 ? "ฟรี" : `฿${shippingFee.toLocaleString()}`}
//           </span>
//         </div>

//         {voucherDiscount > 0 && (
//           <div className="flex justify-between text-sm text-green-600">
//             <span>ส่วนลด</span>
//             <span>-฿{voucherDiscount.toLocaleString()}</span>
//           </div>
//         )}

//         <Separator />

//         <div className="flex justify-between font-bold text-lg">
//           <span>ยอดรวมทั้งหมด</span>
//           <span className="text-orange-600">
//             ฿{total.toLocaleString()}
//           </span>
//         </div>

//         <Button
//           className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white"
//           size="lg"
//           disabled={checkingStock}
//           onClick={handlePayWithStockCheck}
//         >
//           {checkingStock ? "กำลังตรวจสอบสต๊อก..." : "ชำระเงิน"}
//         </Button>
//       </CardContent>
//     </Card>
//   );
// }

// v.1.1.5 ===============================================================

// v.1.1.4 ===============================================================
// // src/app/checkout/component/CheckoutSummarySection.tsx
// "use client";

// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Button } from "@/components/ui/button";

// import type { CheckoutSummaryProps } from "@/types/checkout";

// export default function CheckoutSummarySection({
//   itemCount,
//   subtotal,
//   shippingFee,
//   voucherDiscount,
//   total,
//   onPlaceOrder,
// }: CheckoutSummaryProps) {
//   return (
//     <Card>
//       <CardHeader className="pb-3">
//         <CardTitle className="text-lg">รายละเอียดคำสั่งซื้อ</CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-3">
//         <div className="flex justify-between text-sm">
//           <span>ราคาสินค้า ({itemCount} รายการ)</span>
//           <span>฿{subtotal.toLocaleString()}</span>
//         </div>

//         <div className="flex justify-between text-sm">
//           <span>ค่าจัดส่ง</span>
//           <span className={shippingFee === 0 ? "text-green-600" : ""}>
//             {shippingFee === 0 ? "ฟรี" : `฿${shippingFee.toLocaleString()}`}
//           </span>
//         </div>

//         {voucherDiscount > 0 && (
//           <div className="flex justify-between text-sm text-green-600">
//             <span>ส่วนลด</span>
//             <span>-฿{voucherDiscount.toLocaleString()}</span>
//           </div>
//         )}

//         <Separator />

//         <div className="flex justify-between font-bold text-lg">
//           <span>ยอดรวมทั้งหมด</span>
//           <span className="text-orange-600">
//             ฿{total.toLocaleString()}
//           </span>
//         </div>

//         <Button
//           className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white"
//           size="lg"
//           onClick={onPlaceOrder}
//         >
//           ชำระเงิน
//         </Button>
//       </CardContent>
//     </Card>
//   );
// }

// v.1.1.4 ===============================================================

// v.1.1.3 ===============================================================
// // src/app/checkout/component/CheckoutSummarySection.tsx
// "use client";

// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Button } from "@/components/ui/button";

// import type { CheckoutSummaryProps } from "@/types/checkout";

// export default function CheckoutSummarySection({
//   itemCount,
//   subtotal,
//   shippingFee,
//   voucherDiscount,
//   total,
//   onPlaceOrder,
// }: CheckoutSummaryProps) {
//   return (
//     <Card>
//       <CardHeader className="pb-3">
//         <CardTitle className="text-lg">รายละเอียดคำสั่งซื้อ</CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-3">
//         <div className="flex justify-between text-sm">
//           <span>ราคาสินค้า ({itemCount} รายการ)</span>
//           <span>฿{subtotal.toLocaleString()}</span>
//         </div>

//         <div className="flex justify-between text-sm">
//           <span>ค่าจัดส่ง</span>
//           <span className={shippingFee === 0 ? "text-green-600" : ""}>
//             {shippingFee === 0 ? "ฟรี" : `฿${shippingFee.toLocaleString()}`}
//           </span>
//         </div>

//         {voucherDiscount > 0 && (
//           <div className="flex justify-between text-sm text-green-600">
//             <span>ส่วนลด</span>
//             <span>-฿{voucherDiscount.toLocaleString()}</span>
//           </div>
//         )}

//         <Separator />

//         <div className="flex justify-between font-bold text-lg">
//           <span>ยอดรวมทั้งหมด</span>
//           <span className="text-orange-600">
//             ฿{total.toLocaleString()}
//           </span>
//         </div>

//         <Button
//           className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white"
//           size="lg"
//           onClick={onPlaceOrder}
//         >
//           ชำระเงิน
//         </Button>
//       </CardContent>
//     </Card>
//   );
// }

// v.1.1.3 ===============================================================

// v.1.1.2 ===============================================================
// // src/app/checkout/component/CheckoutSummarySection.tsx

// "use client";

// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Button } from "@/components/ui/button";

// // ⬇️ ใช้ type กลาง
// import type { CheckoutSummaryProps } from "@/types/checkout";

// export default function CheckoutSummarySection({
//   itemCount,
//   subtotal,
//   shippingFee,
//   voucherDiscount,
//   total,
//   onPlaceOrder,
// }: CheckoutSummaryProps) {

//   return (
//     <Card>
//       <CardHeader className="pb-3">
//         <CardTitle className="text-lg">รายละเอียดคำสั่งซื้อ</CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-3">
//         {/* Subtotal */}
//         <div className="flex justify-between text-sm">
//           <span>ราคาสินค้า ({itemCount} รายการ)</span>
//           <span>฿{subtotal.toLocaleString()}</span>
//         </div>

//         {/* Shipping Fee */}
//         <div className="flex justify-between text-sm">
//           <span>ค่าจัดส่ง</span>
//           <span className={shippingFee === 0 ? "text-green-600" : ""}>
//             {shippingFee === 0 ? "ฟรี" : `฿${shippingFee}`}
//           </span>
//         </div>
        
        
//         <Separator />

//         {/* Total */}
//         <div className="flex justify-between font-bold text-lg">
//           <span>ยอดรวมทั้งหมด</span>
//           <span className="text-orange-600">฿{total.toLocaleString()}</span>
//         </div>

//         <Button
//           className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white"
//           size="lg"
//           onClick={onPlaceOrder}
//         >
//           สั่งซื้อสินค้า
//         </Button>
//       </CardContent>
//     </Card>
//   );
// }

// v.1.1.2 ===============================================================

// // src/app/checkout/component/CheckoutSummarySection.tsx

// "use client";

// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Button } from "@/components/ui/button";

// type Props = {
//   itemCount: number;
//   subtotal: number;
//   shippingFee: number;
//   voucherDiscount: number;
//   total: number;
//   onPlaceOrder: () => void;
// };

// export default function CheckoutSummarySection({
//   itemCount,
//   subtotal,
//   shippingFee,
//   voucherDiscount,
//   total,
//   onPlaceOrder,
// }: Props) {
//   return (
//     <Card>
//       <CardHeader className="pb-3">
//         <CardTitle className="text-lg">รายละเอียดคำสั่งซื้อ</CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-3">
//         <div className="flex justify-between text-sm">
//           <span>ราคาสินค้า ({itemCount} รายการ)</span>
//           <span>฿{subtotal.toLocaleString()}</span>
//         </div>

//         <div className="flex justify-between text-sm">
//           <span>ค่าจัดส่ง</span>
//           <span className={shippingFee === 0 ? "text-green-600" : ""}>
//             {shippingFee === 0 ? "฿65.00" : `฿${shippingFee}`}
//           </span>
//         </div>

//         {voucherDiscount > 0 && (
//           <div className="flex justify-between text-sm">
//             <span>ส่วนลดจากโค้ด</span>
//             <span className="text-green-600">
//               -฿{voucherDiscount.toLocaleString()}
//             </span>
//           </div>
//         )}

//         <div className="flex justify-between text-sm">
//           <span>ส่วนลดค่าจัดส่ง</span>
//           <span className="text-green-600">-฿65.00</span>
//         </div>

//         <Separator />

//         <div className="flex justify-between font-bold text-lg">
//           <span>ยอดรวมทั้งหมด</span>
//           <span className="text-orange-600">฿{total.toLocaleString()}</span>
//         </div>

//         <Button
//           className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white"
//           size="lg"
//           onClick={onPlaceOrder}
//         >
//           สั่งซื้อสินค้า
//         </Button>
//       </CardContent>
//     </Card>
//   );
// }

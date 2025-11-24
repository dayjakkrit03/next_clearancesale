// v.1.1.2 ===============================================================
// src/app/checkout/component/CheckoutSummarySection.tsx

"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

// ⬇️ ใช้ type กลาง
import type { CheckoutSummaryProps } from "../checkout.types";

export default function CheckoutSummarySection({
  itemCount,
  subtotal,
  shippingFee,
  voucherDiscount,
  total,
  onPlaceOrder,
}: CheckoutSummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">รายละเอียดคำสั่งซื้อ</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span>ราคาสินค้า ({itemCount} รายการ)</span>
          <span>฿{subtotal.toLocaleString()}</span>
        </div>

        {/* Shipping Fee */}
        <div className="flex justify-between text-sm">
          <span>ค่าจัดส่ง</span>
          <span className={shippingFee === 0 ? "text-green-600" : ""}>
            {shippingFee === 0 ? "฿65.00" : `฿${shippingFee}`}
          </span>
        </div>

        {/* Voucher Discount */}
        {voucherDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span>ส่วนลดจากโค้ด</span>
            <span className="text-green-600">
              -฿{voucherDiscount.toLocaleString()}
            </span>
          </div>
        )}

        {/* Shipping Discount */}
        <div className="flex justify-between text-sm">
          <span>ส่วนลดค่าจัดส่ง</span>
          <span className="text-green-600">-฿65.00</span>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between font-bold text-lg">
          <span>ยอดรวมทั้งหมด</span>
          <span className="text-orange-600">฿{total.toLocaleString()}</span>
        </div>

        <Button
          className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white"
          size="lg"
          onClick={onPlaceOrder}
        >
          สั่งซื้อสินค้า
        </Button>
      </CardContent>
    </Card>
  );
}

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

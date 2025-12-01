// v.1.1.6 ===============================================================
// src/app/checkout/component/CheckoutPackagesSection.tsx

"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

// ✅ ใช้ type กลางจาก src/types/checkout.ts
import type { CheckoutItem, DeliveryOption } from "@/types/checkout";

type Props = {
  checkoutItems: CheckoutItem[];
  deliveryOption: DeliveryOption; // ตอนนี้ยังรับไว้ก่อน เผื่ออนาคตใช้
  onChangeDeliveryOption: (value: DeliveryOption) => void; // ยังไม่ใช้
  onRemoveItem: (itemId: number) => void;
};

export default function CheckoutPackagesSection({
  checkoutItems,
  deliveryOption: _deliveryOption, // ยังไม่ใช้
  onChangeDeliveryOption: _onChangeDeliveryOption, // ยังไม่ใช้
  onRemoveItem,
}: Props) {
  return (
    <Card className="mt-6">
      <CardContent className="pt-6 space-y-3">
        <h2 className="text-lg font-bold text-gray-800 mb-2">รายการสินค้า</h2>
        {checkoutItems.map((item) => {
          const lineTotal = item.price * item.quantity;

          return (
            <div
              key={item.id}
              className="border rounded-lg p-4 bg-gray-50 flex gap-3"
            >
              {/* รูปสินค้า */}
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded"
              />

              {/* รายละเอียดสินค้า */}
              <div className="flex-1">
                {/* ชื่อสินค้า */}
                <h3 className="font-semibold text-sm text-gray-900">
                  {item.name}
                </h3>

                {/* SKU + Brand */}
                <div className="mt-1 space-y-0.5 text-[11px] text-gray-500">
                  {item.sku && <div>SKU: {item.sku}</div>}
                  {item.brand && (
                    <div>
                      Brand:{" "}
                      <span className="font-medium text-gray-700">
                        {item.brand}
                      </span>
                    </div>
                  )}
                </div>

                {/* ราคา/หน่วย + ป้ายส่วนลด */}
                <div className="mt-1 flex items-center gap-2">
                  <div className="font-semibold text-blue-700">
                    ฿{item.price.toLocaleString()}
                    {item.uom && (
                      <span className="text-xs text-gray-500">
                        {" "}
                        / {item.uom}
                      </span>
                    )}
                  </div>

                  {typeof item.discountPercent === "number" && (
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                      ประหยัด {item.discountPercent}%
                    </span>
                  )}
                </div>

                {/* ราคาปกติ (ถ้ามี) */}
                {typeof item.originalPrice === "number" && (
                  <div className="text-[11px] text-gray-400 line-through">
                    ฿{item.originalPrice.toLocaleString()}
                  </div>
                )}

                {/* จำนวนที่สั่ง */}
                <div className="mt-1 text-[11px] text-gray-600">
                  จำนวน: {item.quantity.toLocaleString()} {item.uom ?? ""}
                </div>

                {/* ราคารวมต่อรายการ */}
                <div className="mt-1 text-sm font-bold text-red-600">
                  ราคารวม: ฿{lineTotal.toLocaleString()}
                </div>
              </div>

              {/* ปุ่มลบ */}
              {/* <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>ยืนยันการลบสินค้า</AlertDialogTitle>
                    <AlertDialogDescription>
                      คุณต้องการลบ "{item.name}" ออกจากรายการสั่งซื้อหรือไม่?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onRemoveItem(item.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      ลบ
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog> */}
              
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// v.1.1.6 ===============================================================

// v.1.1.5 ===============================================================
// // src/app/checkout/component/CheckoutPackagesSection.tsx

// "use client";

// import { Card, CardContent } from "@/components/ui/card";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";
// import { Trash2 } from "lucide-react";

// // ⬇️ ใช้ CheckoutItem จาก types กลาง
// import type { CheckoutItem } from "@/types/checkout";
// // // ⬇️ DeliveryOption ยังใช้จากไฟล์เดิมได้เหมือนเดิม
// import type { DeliveryOption } from "../checkout.types";

// type Props = {
//   checkoutItems: CheckoutItem[];
//   deliveryOption: DeliveryOption; // ตอนนี้ยังรับไว้ก่อน เผื่ออนาคตใช้
//   onChangeDeliveryOption: (value: DeliveryOption) => void; // ยังไม่ใช้
//   onRemoveItem: (itemId: number) => void;
// };

// export default function CheckoutPackagesSection({
//   checkoutItems,
//   deliveryOption: _deliveryOption, // ยังไม่ใช้
//   onChangeDeliveryOption: _onChangeDeliveryOption, // ยังไม่ใช้
//   onRemoveItem,
// }: Props) {
//   return (
//     <Card className="mt-6">
//       <CardContent className="pt-6 space-y-3">
//         {checkoutItems.map((item) => {
//           const lineTotal = item.price * item.quantity;

//           return (
//             <div
//               key={item.id}
//               className="border rounded-lg p-4 bg-gray-50 flex gap-3"
//             >
//               {/* รูปสินค้า */}
//               <img
//                 src={item.image}
//                 alt={item.name}
//                 className="w-20 h-20 object-cover rounded"
//               />

//               {/* รายละเอียดสินค้า */}
//               <div className="flex-1">
//                 {/* ชื่อสินค้า */}
//                 <h3 className="font-semibold text-sm text-gray-900">
//                   {item.name}
//                 </h3>

//                 {/* SKU + Brand */}
//                 <div className="mt-1 space-y-0.5 text-[11px] text-gray-500">
//                   {item.sku && <div>SKU: {item.sku}</div>}
//                   {item.brand && (
//                     <div>
//                       Brand:{" "}
//                       <span className="font-medium text-gray-700">
//                         {item.brand}
//                       </span>
//                     </div>
//                   )}
//                 </div>

//                 {/* ราคา/หน่วย + ป้ายส่วนลด */}
//                 <div className="mt-1 flex items-center gap-2">
//                   <div className="font-semibold text-blue-700">
//                     ฿{item.price.toLocaleString()}
//                     {item.uom && (
//                       <span className="text-xs text-gray-500">
//                         {" "}
//                         / {item.uom}
//                       </span>
//                     )}
//                   </div>

//                   {typeof item.discountPercent === "number" && (
//                     <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
//                       ประหยัด {item.discountPercent}%
//                     </span>
//                   )}
//                 </div>

//                 {/* ราคาปกติ (ถ้ามี) */}
//                 {item.originalPrice && (
//                   <div className="text-[11px] text-gray-400 line-through">
//                     ฿{item.originalPrice.toLocaleString()}
//                   </div>
//                 )}

//                 {/* จำนวนที่สั่ง */}
//                 <div className="mt-1 text-[11px] text-gray-600">
//                   จำนวน: {item.quantity.toLocaleString()} {item.uom ?? ""}
//                 </div>

//                 {/* ราคารวมต่อรายการ */}
//                 <div className="mt-1 text-sm font-bold text-red-600">
//                   ราคารวม: ฿{lineTotal.toLocaleString()}
//                 </div>
//               </div>

//               {/* ปุ่มลบ */}
//               <AlertDialog>
//                 <AlertDialogTrigger asChild>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </AlertDialogTrigger>
//                 <AlertDialogContent>
//                   <AlertDialogHeader>
//                     <AlertDialogTitle>ยืนยันการลบสินค้า</AlertDialogTitle>
//                     <AlertDialogDescription>
//                       คุณต้องการลบ "{item.name}" ออกจากรายการสั่งซื้อหรือไม่?
//                     </AlertDialogDescription>
//                   </AlertDialogHeader>
//                   <AlertDialogFooter>
//                     <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
//                     <AlertDialogAction
//                       onClick={() => onRemoveItem(item.id)}
//                       className="bg-red-600 hover:bg-red-700"
//                     >
//                       ลบ
//                     </AlertDialogAction>
//                   </AlertDialogFooter>
//                 </AlertDialogContent>
//               </AlertDialog>
//             </div>
//           );
//         })}
//       </CardContent>
//     </Card>
//   );
// }

// v.1.1.5 ===============================================================

// v.1.1.4 ===============================================================
// // src/app/checkout/component/CheckoutPackagesSection.tsx

// "use client";

// import { Card, CardContent } from "@/components/ui/card";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";
// import { Trash2 } from "lucide-react";

// // ⬇️ ใช้ type กลาง
// import type { CheckoutItem, DeliveryOption } from "../checkout.types";

// type Props = {
//   checkoutItems: CheckoutItem[];
//   deliveryOption: DeliveryOption; // ตอนนี้ยังรับไว้ก่อน เผื่ออนาคตใช้
//   onChangeDeliveryOption: (value: DeliveryOption) => void; // ยังไม่ใช้
//   onRemoveItem: (itemId: number) => void;
// };

// export default function CheckoutPackagesSection({
//   checkoutItems,
//   deliveryOption: _deliveryOption, // ยังไม่ใช้
//   onChangeDeliveryOption: _onChangeDeliveryOption, // ยังไม่ใช้
//   onRemoveItem,
// }: Props) {
//   return (
//     <Card className="mt-6">
//       <CardContent className="pt-6 space-y-3">
//         {checkoutItems.map((item) => {
//           const lineTotal = item.price * item.quantity;

//           return (
//             <div
//               key={item.id}
//               className="border rounded-lg p-4 bg-gray-50 flex gap-3"
//             >
//               {/* รูปสินค้า */}
//               <img
//                 src={item.image}
//                 alt={item.name}
//                 className="w-20 h-20 object-cover rounded"
//               />

//               {/* รายละเอียดสินค้า */}
//               <div className="flex-1">
//                 {/* ชื่อสินค้า */}
//                 <h3 className="font-semibold text-sm text-gray-900">
//                   {item.name}
//                 </h3>

//                 {/* SKU + Brand */}
//                 <div className="mt-1 space-y-0.5 text-[11px] text-gray-500">
//                   {item.sku && <div>SKU: {item.sku}</div>}
//                   {item.brand && (
//                     <div>
//                       Brand:{" "}
//                       <span className="font-medium text-gray-700">
//                         {item.brand}
//                       </span>
//                     </div>
//                   )}
//                 </div>

//                 {/* ราคา/หน่วย + ป้ายส่วนลด */}
//                 <div className="mt-1 flex items-center gap-2">
//                   <div className="font-semibold text-blue-700">
//                     ฿{item.price.toLocaleString()}
//                     {item.uom && (
//                       <span className="text-xs text-gray-500">
//                         {" "}
//                         / {item.uom}
//                       </span>
//                     )}
//                   </div>

//                   {typeof item.discountPercent === "number" && (
//                     <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
//                         ประหยัด {item.discountPercent}%
//                     </span>
//                   )}

//                 </div>

//                 {/* ราคาปกติ (ถ้ามี) */}
//                 {item.originalPrice && (
//                   <div className="text-[11px] text-gray-400 line-through">
//                     ฿{item.originalPrice.toLocaleString()}
//                   </div>
//                 )}

//                 {/* จำนวนที่สั่ง */}
//                 <div className="mt-1 text-[11px] text-gray-600">
//                   จำนวน: {item.quantity.toLocaleString()}{" "}
//                   {item.uom ?? ""}
//                 </div>

//                 {/* ราคารวมต่อรายการ */}
//                 <div className="mt-1 text-sm font-bold text-red-600">
//                   ราคารวม: ฿{lineTotal.toLocaleString()}
//                 </div>
//               </div>

//               {/* ปุ่มลบ */}
//               <AlertDialog>
//                 <AlertDialogTrigger asChild>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </AlertDialogTrigger>
//                 <AlertDialogContent>
//                   <AlertDialogHeader>
//                     <AlertDialogTitle>ยืนยันการลบสินค้า</AlertDialogTitle>
//                     <AlertDialogDescription>
//                       คุณต้องการลบ "{item.name}" ออกจากรายการสั่งซื้อหรือไม่?
//                     </AlertDialogDescription>
//                   </AlertDialogHeader>
//                   <AlertDialogFooter>
//                     <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
//                     <AlertDialogAction
//                       onClick={() => onRemoveItem(item.id)}
//                       className="bg-red-600 hover:bg-red-700"
//                     >
//                       ลบ
//                     </AlertDialogAction>
//                   </AlertDialogFooter>
//                 </AlertDialogContent>
//               </AlertDialog>
//             </div>
//           );
//         })}
//       </CardContent>
//     </Card>
//   );
// }

// v.1.1.4 ===============================================================

// v.1.1.3 ===============================================================
// // src/app/checkout/component/CheckoutPackagesSection.tsx

// "use client";

// import { Card, CardContent } from "@/components/ui/card";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";
// import { Trash2 } from "lucide-react";

// // ⬇️ ใช้ type กลาง
// import type { CheckoutItem, DeliveryOption } from "../checkout.types";

// type Props = {
//   checkoutItems: CheckoutItem[];
//   deliveryOption: DeliveryOption; // ตอนนี้ยังรับไว้ก่อน เผื่ออนาคตใช้
//   onChangeDeliveryOption: (value: DeliveryOption) => void; // ยังไม่ใช้
//   onRemoveItem: (itemId: number) => void;
// };

// export default function CheckoutPackagesSection({
//   checkoutItems,
//   deliveryOption: _deliveryOption, // ไม่ใช้ตอนนี้ เลย prefix เป็น _
//   onChangeDeliveryOption: _onChangeDeliveryOption, // เผื่ออนาคต
//   onRemoveItem,
// }: Props) {
//   return (
//     <Card className="mt-6">
//       <CardContent className="pt-6 space-y-3">
//         {checkoutItems.map((item) => (
//           <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
//             <div className="flex gap-3">
//               <img
//                 src={item.image}
//                 alt={item.name}
//                 className="w-16 h-16 object-cover rounded"
//               />
//               <div className="flex-1">
//                 <h3 className="font-medium text-sm">{item.name}</h3>
//                 <div className="flex justify-between items-center mt-2">
//                   <div>
//                     <div className="text-orange-600 font-bold">
//                       ฿{item.price.toLocaleString()}
//                     </div>

//                     {item.originalPrice && (
//                       <div className="text-sm text-gray-500 line-through">
//                         ฿{item.originalPrice.toLocaleString()}
//                       </div>
//                     )}

//                     {item.discount && (
//                       <div className="text-sm text-orange-600">
//                         {item.discount}
//                       </div>
//                     )}
//                   </div>

//                   <div className="text-sm text-gray-600">
//                     จำนวน: {item.quantity}
//                   </div>
//                 </div>
//               </div>

//               <AlertDialog>
//                 <AlertDialogTrigger asChild>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </AlertDialogTrigger>
//                 <AlertDialogContent>
//                   <AlertDialogHeader>
//                     <AlertDialogTitle>ยืนยันการลบสินค้า</AlertDialogTitle>
//                     <AlertDialogDescription>
//                       คุณต้องการลบ "{item.name}"
//                       ออกจากรายการสั่งซื้อหรือไม่?
//                     </AlertDialogDescription>
//                   </AlertDialogHeader>
//                   <AlertDialogFooter>
//                     <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
//                     <AlertDialogAction
//                       onClick={() => onRemoveItem(item.id)}
//                       className="bg-red-600 hover:bg-red-700"
//                     >
//                       ลบ
//                     </AlertDialogAction>
//                   </AlertDialogFooter>
//                 </AlertDialogContent>
//               </AlertDialog>
//             </div>
//           </div>
//         ))}
//       </CardContent>
//     </Card>
//   );
// }

// v.1.1.3 ===============================================================

// v.1.1.2 ===============================================================
// // src/app/checkout/component/CheckoutPackagesSection.tsx

// "use client";

// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";
// import { Check, Trash2 } from "lucide-react";

// // ⬇️ ใช้ type กลาง
// import type { CheckoutItem, DeliveryOption } from "../checkout.types";

// type Props = {
//   checkoutItems: CheckoutItem[];
//   deliveryOption: DeliveryOption;
//   onChangeDeliveryOption: (value: DeliveryOption) => void;
//   onRemoveItem: (itemId: number) => void;
// };

// export default function CheckoutPackagesSection({
//   checkoutItems,
//   deliveryOption,
//   onChangeDeliveryOption,
//   onRemoveItem,
// }: Props) {
//   const firstItem = checkoutItems[0];

//   return (
//     <>
//       {/* แพ็กเกจ 1 */}
//       <Card>
//         <CardHeader className="pb-3">
//           <CardTitle className="text-lg">แพ็กเกจ 1 จาก 2</CardTitle>
//           <p className="text-sm text-muted-foreground">
//             จัดส่งโดย TechMall Official Store
//           </p>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <h4 className="font-medium mb-3">เลือกตัวเลือกการจัดส่งของคุณ</h4>
//             <RadioGroup
//               value={deliveryOption}
//               onValueChange={(val) =>
//                 onChangeDeliveryOption(val as DeliveryOption)
//               }
//             >
//               <div className="border rounded-lg p-4 border-teal-500 bg-teal-50">
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem
//                     value="standard"
//                     id="standard"
//                     className="text-teal-600"
//                   />
//                   <Label htmlFor="standard" className="flex-1 cursor-pointer">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <div className="font-medium text-teal-800">
//                           ฿19.52{" "}
//                           <span className="text-gray-500 line-through text-sm">
//                             ฿42.00
//                           </span>
//                         </div>
//                         <div className="text-sm text-gray-600">Standard</div>
//                         <div className="text-sm text-gray-500">
//                           รับประกันส่งภายใน 9 ส.ค. รับ ฿25 LinkRewards
//                           หากพัสดุมาสาย
//                         </div>
//                       </div>
//                       <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center">
//                         <Check className="h-3 w-3 text-white" />
//                       </div>
//                     </div>
//                   </Label>
//                 </div>
//               </div>
//             </RadioGroup>
//           </div>

//           {firstItem && (
//             <div className="border rounded-lg p-4 bg-gray-50">
//               <div className="flex gap-3">
//                 <img
//                   src={firstItem.image}
//                   alt={firstItem.name}
//                   className="w-16 h-16 object-cover rounded"
//                 />
//                 <div className="flex-1">
//                   <h3 className="font-medium text-sm">{firstItem.name}</h3>
//                   <div className="flex justify-between items-center mt-2">
//                     <div className="text-orange-600 font-bold">
//                       ฿{firstItem.price.toLocaleString()}
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       จำนวน: {firstItem.quantity}
//                     </div>
//                   </div>
//                 </div>

//                 <AlertDialog>
//                   <AlertDialogTrigger asChild>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </AlertDialogTrigger>
//                   <AlertDialogContent>
//                     <AlertDialogHeader>
//                       <AlertDialogTitle>ยืนยันการลบสินค้า</AlertDialogTitle>
//                       <AlertDialogDescription>
//                         คุณต้องการลบ "{firstItem.name}"
//                         ออกจากรายการสั่งซื้อหรือไม่?
//                       </AlertDialogDescription>
//                     </AlertDialogHeader>
//                     <AlertDialogFooter>
//                       <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
//                       <AlertDialogAction
//                         onClick={() => onRemoveItem(firstItem.id)}
//                         className="bg-red-600 hover:bg-red-700"
//                       >
//                         ลบ
//                       </AlertDialogAction>
//                     </AlertDialogFooter>
//                   </AlertDialogContent>
//                 </AlertDialog>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* แพ็กเกจ 2 */}
//       <Card>
//         <CardHeader className="pb-3">
//           <CardTitle className="text-lg">แพ็กเกจ 2 จาก 2</CardTitle>
//           <p className="text-sm text-muted-foreground">
//             จัดส่งโดย NetworkPro Store
//           </p>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <h4 className="font-medium mb-3">เลือกตัวเลือกการจัดส่งของคุณ</h4>
//             {/* ตอนนี้ mock เป็น express ตายตัวไว้ก่อน */}
//             <RadioGroup value="express" onValueChange={() => {}}>
//               <div className="border rounded-lg p-4 border-teal-500 bg-teal-50">
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem
//                     value="express"
//                     id="express"
//                     className="text-teal-600"
//                   />
//                   <Label htmlFor="express" className="flex-1 cursor-pointer">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <div className="font-medium text-teal-800">
//                           ฿13.48{" "}
//                           <span className="text-gray-500 line-through text-sm">
//                             ฿29.00
//                           </span>
//                         </div>
//                         <div className="text-sm text-gray-600">Standard</div>
//                         <div className="text-sm text-gray-500">
//                           รับประกันส่งภายใน 9 ส.ค. รับ ฿25 LinkRewards
//                           หากพัสดุมาสาย
//                         </div>
//                       </div>
//                       <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center">
//                         <Check className="h-3 w-3 text-white" />
//                       </div>
//                     </div>
//                   </Label>
//                 </div>
//               </div>
//             </RadioGroup>
//           </div>

//           <div className="space-y-3">
//             {checkoutItems.slice(1).map((item) => (
//               <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
//                 <div className="flex gap-3">
//                   <img
//                     src={item.image}
//                     alt={item.name}
//                     className="w-16 h-16 object-cover rounded"
//                   />
//                   <div className="flex-1">
//                     <h3 className="font-medium text-sm">{item.name}</h3>
//                     <div className="flex justify-between items-center mt-2">
//                       <div>
//                         <div className="text-orange-600 font-bold">
//                           ฿{item.price.toLocaleString()}
//                         </div>
//                         {item.originalPrice && (
//                           <div className="text-sm text-gray-500 line-through">
//                             ฿{item.originalPrice.toLocaleString()}
//                           </div>
//                         )}
//                         {item.discount && (
//                           <div className="text-sm text-orange-600">
//                             {item.discount}
//                           </div>
//                         )}
//                       </div>
//                       <div className="text-sm text-gray-600">
//                         จำนวน: {item.quantity}
//                       </div>
//                     </div>
//                   </div>

//                   <AlertDialog>
//                     <AlertDialogTrigger asChild>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </AlertDialogTrigger>
//                     <AlertDialogContent>
//                       <AlertDialogHeader>
//                         <AlertDialogTitle>ยืนยันการลบสินค้า</AlertDialogTitle>
//                         <AlertDialogDescription>
//                           คุณต้องการลบ "{item.name}"
//                           ออกจากรายการสั่งซื้อหรือไม่?
//                         </AlertDialogDescription>
//                       </AlertDialogHeader>
//                       <AlertDialogFooter>
//                         <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
//                         <AlertDialogAction
//                           onClick={() => onRemoveItem(item.id)}
//                           className="bg-red-600 hover:bg-red-700"
//                         >
//                           ลบ
//                         </AlertDialogAction>
//                       </AlertDialogFooter>
//                     </AlertDialogContent>
//                   </AlertDialog>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </>
//   );
// }

// v.1.1.2 ===============================================================

// // src/app/checkout/component/CheckoutPackagesSection.tsx

// "use client";

// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";
// import { Check, Trash2 } from "lucide-react";

// type CheckoutItem = {
//   id: number;
//   name: string;
//   price: number;
//   quantity: number;
//   image: string;
//   store: string;
//   originalPrice?: number;
//   discount?: string;
// };

// type Props = {
//   checkoutItems: CheckoutItem[];
//   deliveryOption: string;
//   onChangeDeliveryOption: (value: string) => void;
//   onRemoveItem: (itemId: number) => void;
// };

// export default function CheckoutPackagesSection({
//   checkoutItems,
//   deliveryOption,
//   onChangeDeliveryOption,
//   onRemoveItem,
// }: Props) {
//   const firstItem = checkoutItems[0];

//   return (
//     <>
//       {/* แพ็กเกจ 1 */}
//       <Card>
//         <CardHeader className="pb-3">
//           <CardTitle className="text-lg">แพ็กเกจ 1 จาก 2</CardTitle>
//           <p className="text-sm text-muted-foreground">
//             จัดส่งโดย TechMall Official Store
//           </p>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <h4 className="font-medium mb-3">เลือกตัวเลือกการจัดส่งของคุณ</h4>
//             <RadioGroup
//               value={deliveryOption}
//               onValueChange={onChangeDeliveryOption}
//             >
//               <div className="border rounded-lg p-4 border-teal-500 bg-teal-50">
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem
//                     value="standard"
//                     id="standard"
//                     className="text-teal-600"
//                   />
//                   <Label htmlFor="standard" className="flex-1 cursor-pointer">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <div className="font-medium text-teal-800">
//                           ฿19.52{" "}
//                           <span className="text-gray-500 line-through text-sm">
//                             ฿42.00
//                           </span>
//                         </div>
//                         <div className="text-sm text-gray-600">Standard</div>
//                         <div className="text-sm text-gray-500">
//                           รับประกันส่งภายใน 9 ส.ค. รับ ฿25 LinkRewards
//                           หากพัสดุมาสาย
//                         </div>
//                       </div>
//                       <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center">
//                         <Check className="h-3 w-3 text-white" />
//                       </div>
//                     </div>
//                   </Label>
//                 </div>
//               </div>
//             </RadioGroup>
//           </div>

//           {firstItem && (
//             <div className="border rounded-lg p-4 bg-gray-50">
//               <div className="flex gap-3">
//                 <img
//                   src={firstItem.image}
//                   alt={firstItem.name}
//                   className="w-16 h-16 object-cover rounded"
//                 />
//                 <div className="flex-1">
//                   <h3 className="font-medium text-sm">{firstItem.name}</h3>
//                   <div className="flex justify-between items-center mt-2">
//                     <div className="text-orange-600 font-bold">
//                       ฿{firstItem.price.toLocaleString()}
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       จำนวน: {firstItem.quantity}
//                     </div>
//                   </div>
//                 </div>

//                 <AlertDialog>
//                   <AlertDialogTrigger asChild>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </AlertDialogTrigger>
//                   <AlertDialogContent>
//                     <AlertDialogHeader>
//                       <AlertDialogTitle>ยืนยันการลบสินค้า</AlertDialogTitle>
//                       <AlertDialogDescription>
//                         คุณต้องการลบ "{firstItem.name}"
//                         ออกจากรายการสั่งซื้อหรือไม่?
//                       </AlertDialogDescription>
//                     </AlertDialogHeader>
//                     <AlertDialogFooter>
//                       <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
//                       <AlertDialogAction
//                         onClick={() => onRemoveItem(firstItem.id)}
//                         className="bg-red-600 hover:bg-red-700"
//                       >
//                         ลบ
//                       </AlertDialogAction>
//                     </AlertDialogFooter>
//                   </AlertDialogContent>
//                 </AlertDialog>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* แพ็กเกจ 2 */}
//       <Card>
//         <CardHeader className="pb-3">
//           <CardTitle className="text-lg">แพ็กเกจ 2 จาก 2</CardTitle>
//           <p className="text-sm text-muted-foreground">
//             จัดส่งโดย NetworkPro Store
//           </p>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <h4 className="font-medium mb-3">เลือกตัวเลือกการจัดส่งของคุณ</h4>
//             <RadioGroup value="express" onValueChange={() => {}}>
//               <div className="border rounded-lg p-4 border-teal-500 bg-teal-50">
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem
//                     value="express"
//                     id="express"
//                     className="text-teal-600"
//                   />
//                   <Label htmlFor="express" className="flex-1 cursor-pointer">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <div className="font-medium text-teal-800">
//                           ฿13.48{" "}
//                           <span className="text-gray-500 line-through text-sm">
//                             ฿29.00
//                           </span>
//                         </div>
//                         <div className="text-sm text-gray-600">Standard</div>
//                         <div className="text-sm text-gray-500">
//                           รับประกันส่งภายใน 9 ส.ค. รับ ฿25 LinkRewards
//                           หากพัสดุมาสาย
//                         </div>
//                       </div>
//                       <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center">
//                         <Check className="h-3 w-3 text-white" />
//                       </div>
//                     </div>
//                   </Label>
//                 </div>
//               </div>
//             </RadioGroup>
//           </div>

//           <div className="space-y-3">
//             {checkoutItems.slice(1).map((item) => (
//               <div
//                 key={item.id}
//                 className="border rounded-lg p-4 bg-gray-50"
//               >
//                 <div className="flex gap-3">
//                   <img
//                     src={item.image}
//                     alt={item.name}
//                     className="w-16 h-16 object-cover rounded"
//                   />
//                   <div className="flex-1">
//                     <h3 className="font-medium text-sm">{item.name}</h3>
//                     <div className="flex justify-between items-center mt-2">
//                       <div>
//                         <div className="text-orange-600 font-bold">
//                           ฿{item.price.toLocaleString()}
//                         </div>
//                         {item.originalPrice && (
//                           <div className="text-sm text-gray-500 line-through">
//                             ฿{item.originalPrice.toLocaleString()}
//                           </div>
//                         )}
//                         {item.discount && (
//                           <div className="text-sm text-orange-600">
//                             {item.discount}
//                           </div>
//                         )}
//                       </div>
//                       <div className="text-sm text-gray-600">
//                         จำนวน: {item.quantity}
//                       </div>
//                     </div>
//                   </div>

//                   <AlertDialog>
//                     <AlertDialogTrigger asChild>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </AlertDialogTrigger>
//                     <AlertDialogContent>
//                       <AlertDialogHeader>
//                         <AlertDialogTitle>ยืนยันการลบสินค้า</AlertDialogTitle>
//                         <AlertDialogDescription>
//                           คุณต้องการลบ "{item.name}"
//                           ออกจากรายการสั่งซื้อหรือไม่?
//                         </AlertDialogDescription>
//                       </AlertDialogHeader>
//                       <AlertDialogFooter>
//                         <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
//                         <AlertDialogAction
//                           onClick={() => onRemoveItem(item.id)}
//                           className="bg-red-600 hover:bg-red-700"
//                         >
//                           ลบ
//                         </AlertDialogAction>
//                       </AlertDialogFooter>
//                     </AlertDialogContent>
//                   </AlertDialog>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </>
//   );
// }

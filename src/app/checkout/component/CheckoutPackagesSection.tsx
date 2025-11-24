// v.1.1.2 ===============================================================
// src/app/checkout/component/CheckoutPackagesSection.tsx

"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
import { Check, Trash2 } from "lucide-react";

// ⬇️ ใช้ type กลาง
import type { CheckoutItem, DeliveryOption } from "../checkout.types";

type Props = {
  checkoutItems: CheckoutItem[];
  deliveryOption: DeliveryOption;
  onChangeDeliveryOption: (value: DeliveryOption) => void;
  onRemoveItem: (itemId: number) => void;
};

export default function CheckoutPackagesSection({
  checkoutItems,
  deliveryOption,
  onChangeDeliveryOption,
  onRemoveItem,
}: Props) {
  const firstItem = checkoutItems[0];

  return (
    <>
      {/* แพ็กเกจ 1 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">แพ็กเกจ 1 จาก 2</CardTitle>
          <p className="text-sm text-muted-foreground">
            จัดส่งโดย TechMall Official Store
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-3">เลือกตัวเลือกการจัดส่งของคุณ</h4>
            <RadioGroup
              value={deliveryOption}
              onValueChange={(val) =>
                onChangeDeliveryOption(val as DeliveryOption)
              }
            >
              <div className="border rounded-lg p-4 border-teal-500 bg-teal-50">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="standard"
                    id="standard"
                    className="text-teal-600"
                  />
                  <Label htmlFor="standard" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-teal-800">
                          ฿19.52{" "}
                          <span className="text-gray-500 line-through text-sm">
                            ฿42.00
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">Standard</div>
                        <div className="text-sm text-gray-500">
                          รับประกันส่งภายใน 9 ส.ค. รับ ฿25 LinkRewards
                          หากพัสดุมาสาย
                        </div>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {firstItem && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex gap-3">
                <img
                  src={firstItem.image}
                  alt={firstItem.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{firstItem.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-orange-600 font-bold">
                      ฿{firstItem.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      จำนวน: {firstItem.quantity}
                    </div>
                  </div>
                </div>

                <AlertDialog>
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
                        คุณต้องการลบ "{firstItem.name}"
                        ออกจากรายการสั่งซื้อหรือไม่?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onRemoveItem(firstItem.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        ลบ
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* แพ็กเกจ 2 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">แพ็กเกจ 2 จาก 2</CardTitle>
          <p className="text-sm text-muted-foreground">
            จัดส่งโดย NetworkPro Store
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-3">เลือกตัวเลือกการจัดส่งของคุณ</h4>
            {/* ตอนนี้ mock เป็น express ตายตัวไว้ก่อน */}
            <RadioGroup value="express" onValueChange={() => {}}>
              <div className="border rounded-lg p-4 border-teal-500 bg-teal-50">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="express"
                    id="express"
                    className="text-teal-600"
                  />
                  <Label htmlFor="express" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-teal-800">
                          ฿13.48{" "}
                          <span className="text-gray-500 line-through text-sm">
                            ฿29.00
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">Standard</div>
                        <div className="text-sm text-gray-500">
                          รับประกันส่งภายใน 9 ส.ค. รับ ฿25 LinkRewards
                          หากพัสดุมาสาย
                        </div>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            {checkoutItems.slice(1).map((item) => (
              <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        <div className="text-orange-600 font-bold">
                          ฿{item.price.toLocaleString()}
                        </div>
                        {item.originalPrice && (
                          <div className="text-sm text-gray-500 line-through">
                            ฿{item.originalPrice.toLocaleString()}
                          </div>
                        )}
                        {item.discount && (
                          <div className="text-sm text-orange-600">
                            {item.discount}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        จำนวน: {item.quantity}
                      </div>
                    </div>
                  </div>

                  <AlertDialog>
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
                          คุณต้องการลบ "{item.name}"
                          ออกจากรายการสั่งซื้อหรือไม่?
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
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

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

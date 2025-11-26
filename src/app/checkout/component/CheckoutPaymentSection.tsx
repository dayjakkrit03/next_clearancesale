// v.1.1.3 ==========================================================================================
// src/app/checkout/component/CheckoutPaymentSection.tsx

"use client";

import { useState, type ReactNode } from "react";
import {
  CreditCard,
  Wallet,
  QrCode,
  Smartphone,
  Building2,
  ArrowLeftRight,
  Check,
  Trash2,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// ⬇️ Type กลาง
import type { PaymentMethod, PaymentMethodsArray } from "@/types/checkout";

type Props = {
  paymentMethod: PaymentMethod;
  onChangePaymentMethod: (method: PaymentMethod) => void;
};

type MethodInfo = {
  icon: ReactNode;
  bgColor: string;
  name: string;
  description: string;
};

// method ที่ “ยังไม่เปิดให้ใช้”
const DISABLED_METHODS: PaymentMethod[] = [
  "cash",
  "linepay",
  "internetbanking",
  "banktransfer",
];

export default function CheckoutPaymentSection({
  paymentMethod,
  onChangePaymentMethod,
}: Props) {
  const [isPaymentMethodsOpen, setIsPaymentMethodsOpen] = useState(false);
  const [additionalPaymentMethods, setAdditionalPaymentMethods] = useState<
    PaymentMethod[]
  >([]);

  const getPaymentMethodInfo = (
    method: PaymentMethod
  ): MethodInfo | undefined => {
    const methodsMap: Record<PaymentMethod, MethodInfo> = {
      card: {
        icon: <CreditCard className="h-6 w-6 text-blue-600" />,
        bgColor: "bg-blue-100",
        name: "Credit / Debit Card",
        description: "บัตรเครดิต/เดบิต",
      },
      qr: {
        icon: <QrCode className="h-6 w-6 text-blue-600" />,
        bgColor: "bg-blue-100",
        name: "QR PromptPay",
        description: "สแกน QR เพื่อชำระเงิน",
      },
      cash: {
        icon: <Wallet className="h-6 w-6 text-orange-600" />,
        bgColor: "bg-orange-100",
        name: "เก็บเงินปลายทาง",
        description: "ชำระเงินเมื่อสินค้ามาส่ง (เร็ว ๆ นี้)",
      },
      linepay: {
        icon: <Smartphone className="h-6 w-6 text-green-600" />,
        bgColor: "bg-green-100",
        name: "LINE Pay",
        description: "เชื่อมต่อบัตร หรือเติมเงินก่อนช้อป (เร็ว ๆ นี้)",
      },
      internetbanking: {
        icon: <Building2 className="h-6 w-6 text-blue-600" />,
        bgColor: "bg-blue-100",
        name: "Internet Banking",
        description: "เข้าสู่ระบบธนาคารเพื่อชำระเงิน (เร็ว ๆ นี้)",
      },
      banktransfer: {
        icon: <ArrowLeftRight className="h-6 w-6 text-purple-600" />,
        bgColor: "bg-purple-100",
        name: "Bank Transfer",
        description: "โอนเงินไปยังบัญชีของผู้ขาย (เร็ว ๆ นี้)",
      },
    };

    return methodsMap[method];
  };

  // ตอนนี้กด “ยืนยัน” ใน panel ขวาให้เป็น no-op ไปก่อน
  const handleConfirmPaymentMethods = () => {
    setAdditionalPaymentMethods([]); // ยังไม่ให้มี method เพิ่ม
    setIsPaymentMethodsOpen(false);
  };

  const handleRemovePaymentMethod = (methodToRemove: PaymentMethod) => {
    setAdditionalPaymentMethods((prev) =>
      prev.filter((m) => m !== methodToRemove)
    );

    if (paymentMethod === methodToRemove) {
      onChangePaymentMethod("card");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          เลือกวิธีชำระเงิน
          <Sheet
            open={isPaymentMethodsOpen}
            onOpenChange={setIsPaymentMethodsOpen}
          >
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary p-0 h-auto ml-2"
              >
                ดูวิธีการทั้งหมด »
              </Button>
            </SheetTrigger>

            {/* ===== Panel ด้านขวา ===== */}
            <SheetContent side="right" className="w-[500px] max-w-full">
              <SheetHeader>
                <SheetTitle>เลือกวิธีชำระเงิน</SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
                <h3 className="text-sm font-medium text-gray-700">
                  วิธีที่แนะนำ
                </h3>

                {/* card แนะนำ: บัตรเครดิต/เดบิต */}
                <div
                  className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === "card"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200"
                  }`}
                  onClick={() => onChangePaymentMethod("card")}
                >
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      บัตรเครดิต/เดบิต
                    </div>
                    <div className="text-sm text-gray-500">
                      บัตรเครดิต/เดบิต
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <img
                        src="/assets/mastercard-logo.svg"
                        className="h-4 w-auto"
                      />
                      <img
                        src="/assets/jcb-logo.svg"
                        className="h-4 w-auto"
                      />
                      <img
                        src="/assets/visa-logo.svg"
                        className="h-4 w-auto"
                      />
                    </div>
                  </div>
                  {paymentMethod === "card" && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                </div>

                <Separator className="my-4" />

                <h3 className="text-sm font-medium text-gray-700">
                  วิธีอื่น ๆ
                </h3>

                {(
                  [
                    "cash",
                    "qr",
                    "linepay",
                    "internetbanking",
                    "banktransfer",
                  ] as PaymentMethodsArray
                ).map((method) => {
                  const info = getPaymentMethodInfo(method);
                  if (!info) return null;

                  const disabled = DISABLED_METHODS.includes(method);

                  const baseClass =
                    "flex items-center space-x-3 p-4 border-2 rounded-lg transition-colors";
                  const stateClass = disabled
                    ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                    : paymentMethod === method
                    ? "border-primary bg-primary/5 cursor-pointer"
                    : "border-gray-200 cursor-pointer";

                  return (
                    <div
                      key={method}
                      className={`${baseClass} ${stateClass}`}
                      onClick={
                        disabled ? undefined : () => onChangePaymentMethod(method)
                      }
                    >
                      <div className={`${info.bgColor} p-2 rounded-lg`}>
                        {info.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {info.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {info.description}
                        </div>
                      </div>
                      {!disabled && paymentMethod === method && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsPaymentMethodsOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleConfirmPaymentMethods}
                >
                  ยืนยัน
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </CardTitle>
      </CardHeader>

      {/* ===== main radio group ด้านหน้า checkout ===== */}
      <CardContent className="space-y-3">
        <RadioGroup
          value={paymentMethod}
          onValueChange={(m) => onChangePaymentMethod(m as PaymentMethod)}
        >
          {/* card main */}
          <div
            className={`flex items-center space-x-2 p-4 border-2 rounded-lg transition-colors ${
              paymentMethod === "card"
                ? "border-primary bg-primary/5"
                : "border-gray-200"
            }`}
          >
            <RadioGroupItem value="card" id="card" />
            <div className="bg-blue-100 p-2 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <Label htmlFor="card" className="flex-1 cursor-pointer">
              <div className="font-semibold">บัตรเครดิต/เดบิต</div>
              <div className="text-sm text-gray-500">บัตรเครดิต/เดบิต</div>
            </Label>
            {paymentMethod === "card" && (
              <Check className="h-5 w-5 text-green-500" />
            )}
          </div>

          {/* QR main */}
          <div
            className={`flex items-center space-x-2 p-4 border-2 rounded-lg transition-colors ${
              paymentMethod === "qr"
                ? "border-primary bg-primary/5"
                : "border-gray-200"
            }`}
          >
            <RadioGroupItem value="qr" id="qr" />
            <div className="bg-blue-100 p-2 rounded-lg">
              <QrCode className="h-6 w-6 text-blue-600" />
            </div>
            <Label htmlFor="qr" className="flex-1 cursor-pointer">
              <div className="font-semibold">QR PromptPay</div>
              <div className="text-sm text-gray-500">สแกน QR Code</div>
            </Label>
            {paymentMethod === "qr" && (
              <Check className="h-5 w-5 text-green-500" />
            )}
          </div>

          {/* methods เพิ่มเติมจาก panel ขวา (ตอนนี้จะไม่มี เพราะเราไม่เพิ่มแล้ว) */}
          {additionalPaymentMethods.map((method) => {
            const info = getPaymentMethodInfo(method);
            if (!info) return null;

            return (
              <div
                key={method}
                className={`flex items-center space-x-2 p-4 border-2 rounded-lg transition-colors ${
                  paymentMethod === method
                    ? "border-primary bg-primary/5"
                    : "border-gray-200"
                }`}
              >
                <RadioGroupItem value={method} id={method} />
                <div className={`${info.bgColor} p-2 rounded-lg`}>
                  {info.icon}
                </div>
                <Label htmlFor={method} className="flex-1 cursor-pointer">
                  <div className="font-semibold">{info.name}</div>
                  <div className="text-sm text-gray-500">
                    {info.description}
                  </div>
                </Label>

                {paymentMethod === method && (
                  <Check className="h-5 w-5 text-green-500" />
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemovePaymentMethod(method);
                  }}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

// v.1.1.3 ==========================================================================================

// v.1.1.2 ==========================================================================================
// // src/app/checkout/component/CheckoutPaymentSection.tsx

// "use client";

// import { useState, type ReactNode } from "react";
// import {
//   CreditCard,
//   Wallet,
//   QrCode,
//   Smartphone,
//   Building2,
//   ArrowLeftRight,
//   Check,
//   Trash2,
// } from "lucide-react";

// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import { Separator } from "@/components/ui/separator";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";

// // ⬇️ Type กลาง
// import type {
//   PaymentMethod,
//   PaymentMethodsArray,
// } from "@/types/checkout";

// type Props = {
//   paymentMethod: PaymentMethod;
//   onChangePaymentMethod: (method: PaymentMethod) => void;
// };

// type MethodInfo = {
//   icon: ReactNode;
//   bgColor: string;
//   name: string;
//   description: string;
// };

// export default function CheckoutPaymentSection({
//   paymentMethod,
//   onChangePaymentMethod,
// }: Props) {
//   const [isPaymentMethodsOpen, setIsPaymentMethodsOpen] = useState(false);
//   const [additionalPaymentMethods, setAdditionalPaymentMethods] =
//     useState<PaymentMethod[]>([]);

//   const getPaymentMethodInfo = (
//     method: PaymentMethod
//   ): MethodInfo | undefined => {
//     const methodsMap: Record<PaymentMethod, MethodInfo> = {
//       card: {
//         icon: <CreditCard className="h-6 w-6 text-blue-600" />,
//         bgColor: "bg-blue-100",
//         name: "Credit / Debit Card",
//         description: "บัตรเครดิต/เดบิต",
//       },
//       qr: {
//         icon: <QrCode className="h-6 w-6 text-blue-600" />,
//         bgColor: "bg-blue-100",
//         name: "QR PromptPay",
//         description: "สแกน QR เพื่อชำระเงิน",
//       },
//       cash: {
//         icon: <Wallet className="h-6 w-6 text-orange-600" />,
//         bgColor: "bg-orange-100",
//         name: "เก็บเงินปลายทาง",
//         description: "ชำระเงินเมื่อสินค้ามาส่ง",
//       },
//       linepay: {
//         icon: <Smartphone className="h-6 w-6 text-green-600" />,
//         bgColor: "bg-green-100",
//         name: "LINE Pay",
//         description: "เชื่อมต่อบัตร หรือเติมเงินก่อนช้อป",
//       },
//       internetbanking: {
//         icon: <Building2 className="h-6 w-6 text-blue-600" />,
//         bgColor: "bg-blue-100",
//         name: "Internet Banking",
//         description: "เข้าสู่ระบบธนาคารเพื่อชำระเงิน",
//       },
//       banktransfer: {
//         icon: <ArrowLeftRight className="h-6 w-6 text-purple-600" />,
//         bgColor: "bg-purple-100",
//         name: "Bank Transfer",
//         description: "โอนเงินไปยังบัญชีของผู้ขาย",
//       },
//     };

//     return methodsMap[method];
//   };

//   const handleConfirmPaymentMethods = () => {
//     const toAdd: PaymentMethod[] = [];

//     if (
//       !additionalPaymentMethods.includes(paymentMethod) &&
//       paymentMethod !== "card" &&
//       paymentMethod !== "qr"
//     ) {
//       toAdd.push(paymentMethod);
//     }

//     setAdditionalPaymentMethods((prev) => [...prev, ...toAdd]);
//     setIsPaymentMethodsOpen(false);
//   };

//   const handleRemovePaymentMethod = (methodToRemove: PaymentMethod) => {
//     setAdditionalPaymentMethods((prev) =>
//       prev.filter((m) => m !== methodToRemove)
//     );

//     if (paymentMethod === methodToRemove) {
//       onChangePaymentMethod("card");
//     }
//   };

//   return (
//     <Card>
//       <CardHeader className="pb-3">
//         <CardTitle className="text-lg">
//           เลือกวิธีชำระเงิน
//           <Sheet
//             open={isPaymentMethodsOpen}
//             onOpenChange={setIsPaymentMethodsOpen}
//           >
//             <SheetTrigger asChild>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="text-primary p-0 h-auto ml-2"
//               >
//                 ดูวิธีการทั้งหมด »
//               </Button>
//             </SheetTrigger>

//             {/* ===== Panel ด้านขวา ===== */}
//             <SheetContent side="right" className="w-[500px] max-w-full">
//               <SheetHeader>
//                 <SheetTitle>เลือกวิธีชำระเงิน</SheetTitle>
//               </SheetHeader>

//               <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
//                 <h3 className="text-sm font-medium text-gray-700">
//                   วิธีที่แนะนำ
//                 </h3>

//                 {/* card แนะนำ */}
//                 <div
//                   className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
//                     paymentMethod === "card"
//                       ? "border-primary bg-primary/5"
//                       : "border-gray-200"
//                   }`}
//                   onClick={() => onChangePaymentMethod("card")}
//                 >
//                   <div className="bg-blue-100 p-2 rounded-lg">
//                     <CreditCard className="h-6 w-6 text-blue-600" />
//                   </div>
//                   <div className="flex-1">
//                     <div className="font-medium text-gray-900">
//                       บัตรเครดิต/เดบิต
//                     </div>
//                     <div className="text-sm text-gray-500">
//                       บัตรเครดิต/เดบิต
//                     </div>
//                     <div className="flex items-center gap-1 mt-1">
//                       <img
//                         src="/assets/mastercard-logo.svg"
//                         className="h-4 w-auto"
//                       />
//                       <img
//                         src="/assets/jcb-logo.svg"
//                         className="h-4 w-auto"
//                       />
//                       <img src="/assets/visa-logo.svg" className="h-4 w-auto" />
//                     </div>
//                   </div>
//                   {paymentMethod === "card" && (
//                     <Check className="h-5 w-5 text-green-500" />
//                   )}
//                 </div>

//                 <Separator className="my-4" />

//                 <h3 className="text-sm font-medium text-gray-700">
//                   วิธีอื่น ๆ
//                 </h3>

//                 {(
//                   [
//                     "cash",
//                     "qr",
//                     "linepay",
//                     "internetbanking",
//                     "banktransfer",
//                   ] as PaymentMethodsArray
//                 ).map((method) => {
//                   const info = getPaymentMethodInfo(method);
//                   if (!info) return null;

//                   return (
//                     <div
//                       key={method}
//                       className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
//                         paymentMethod === method
//                           ? "border-primary bg-primary/5"
//                           : "border-gray-200"
//                       }`}
//                       onClick={() => onChangePaymentMethod(method)}
//                     >
//                       <div className={`${info.bgColor} p-2 rounded-lg`}>
//                         {info.icon}
//                       </div>
//                       <div className="flex-1">
//                         <div className="font-medium text-gray-900">
//                           {info.name}
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           {info.description}
//                         </div>
//                       </div>
//                       {paymentMethod === method && (
//                         <Check className="h-5 w-5 text-green-500" />
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>

//               <div className="flex justify-end gap-2 mt-6">
//                 <Button
//                   variant="outline"
//                   onClick={() => setIsPaymentMethodsOpen(false)}
//                 >
//                   ยกเลิก
//                 </Button>
//                 <Button
//                   className="bg-orange-500 hover:bg-orange-600 text-white"
//                   onClick={handleConfirmPaymentMethods}
//                 >
//                   ยืนยัน
//                 </Button>
//               </div>
//             </SheetContent>
//           </Sheet>
//         </CardTitle>
//       </CardHeader>

//       {/* ===== main radio group ด้านหน้า checkout ===== */}
//       <CardContent className="space-y-3">
//         <RadioGroup
//           value={paymentMethod}
//           onValueChange={(m) => onChangePaymentMethod(m as PaymentMethod)}
//         >
//           {/* card main */}
//           <div
//             className={`flex items-center space-x-2 p-4 border-2 rounded-lg transition-colors ${
//               paymentMethod === "card"
//                 ? "border-primary bg-primary/5"
//                 : "border-gray-200"
//             }`}
//           >
//             <RadioGroupItem value="card" id="card" />
//             <div className="bg-blue-100 p-2 rounded-lg">
//               <CreditCard className="h-6 w-6 text-blue-600" />
//             </div>
//             <Label htmlFor="card" className="flex-1 cursor-pointer">
//               <div className="font-semibold">บัตรเครดิต/เดบิต</div>
//               <div className="text-sm text-gray-500">บัตรเครดิต/เดบิต</div>
//             </Label>
//             {paymentMethod === "card" && (
//               <Check className="h-5 w-5 text-green-500" />
//             )}
//           </div>

//           {/* QR main */}
//           <div
//             className={`flex items-center space-x-2 p-4 border-2 rounded-lg transition-colors ${
//               paymentMethod === "qr"
//                 ? "border-primary bg-primary/5"
//                 : "border-gray-200"
//             }`}
//           >
//             <RadioGroupItem value="qr" id="qr" />
//             <div className="bg-blue-100 p-2 rounded-lg">
//               <QrCode className="h-6 w-6 text-blue-600" />
//             </div>
//             <Label htmlFor="qr" className="flex-1 cursor-pointer">
//               <div className="font-semibold">QR PromptPay</div>
//               <div className="text-sm text-gray-500">สแกน QR Code</div>
//             </Label>
//             {paymentMethod === "qr" && (
//               <Check className="h-5 w-5 text-green-500" />
//             )}
//           </div>

//           {/* methods เพิ่มเติมจาก panel ขวา */}
//           {additionalPaymentMethods.map((method) => {
//             const info = getPaymentMethodInfo(method);
//             if (!info) return null;

//             return (
//               <div
//                 key={method}
//                 className={`flex items-center space-x-2 p-4 border-2 rounded-lg transition-colors ${
//                   paymentMethod === method
//                     ? "border-primary bg-primary/5"
//                     : "border-gray-200"
//                 }`}
//               >
//                 <RadioGroupItem value={method} id={method} />
//                 <div className={`${info.bgColor} p-2 rounded-lg`}>
//                   {info.icon}
//                 </div>
//                 <Label htmlFor={method} className="flex-1 cursor-pointer">
//                   <div className="font-semibold">{info.name}</div>
//                   <div className="text-sm text-gray-500">
//                     {info.description}
//                   </div>
//                 </Label>

//                 {paymentMethod === method && (
//                   <Check className="h-5 w-5 text-green-500" />
//                 )}

//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={(e) => {
//                     e.preventDefault();
//                     e.stopPropagation();
//                     handleRemovePaymentMethod(method);
//                   }}
//                   className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
//                 >
//                   <Trash2 className="h-4 w-4" />
//                 </Button>
//               </div>
//             );
//           })}
//         </RadioGroup>
//       </CardContent>
//     </Card>
//   );
// }

// v.1.1.2 ==========================================================================================

// // src/app/checkout/component/CheckoutPaymentSection.tsx

// "use client";

// import { useState, type ReactNode } from "react";
// import {
//   CreditCard,
//   Wallet,
//   QrCode,
//   Smartphone,
//   Building2,
//   ArrowLeftRight,
//   Check,
//   Trash2,
// } from "lucide-react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
// import { Separator } from "@/components/ui/separator";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";

// type Props = {
//   paymentMethod: string;
//   onChangePaymentMethod: (method: string) => void;
// };

// type MethodInfo = {
//   icon: ReactNode;
//   bgColor: string;
//   name: string;
//   description: string;
// };

// export default function CheckoutPaymentSection({
//   paymentMethod,
//   onChangePaymentMethod,
// }: Props) {
//   const [isPaymentMethodsOpen, setIsPaymentMethodsOpen] = useState(false);
//   const [additionalPaymentMethods, setAdditionalPaymentMethods] = useState<string[]>([]);

//   const getPaymentMethodInfo = (method: string): MethodInfo | undefined => {
//     const methodsMap: Record<string, MethodInfo> = {
//       linepay: {
//         icon: <Smartphone className="h-6 w-6 text-green-600" />,
//         bgColor: "bg-green-100",
//         name: "LINE Pay",
//         description: "Link your card or add sufficient funds before shopping",
//       },
//       internetbanking: {
//         icon: <Building2 className="h-6 w-6 text-blue-600" />,
//         bgColor: "bg-blue-100",
//         name: "Internet banking",
//         description: "Login with bank account to pay",
//       },
//       banktransfer: {
//         icon: <ArrowLeftRight className="h-6 w-6 text-purple-600" />,
//         bgColor: "bg-purple-100",
//         name: "Bank Transfer",
//         description: "Transfer money directly to merchant's bank account",
//       },
//       cod: {
//         icon: <Wallet className="h-6 w-6 text-orange-600" />,
//         bgColor: "bg-orange-100",
//         name: "Cash on Delivery",
//         description: "Pay when your order is delivered",
//       },
//     };
//     return methodsMap[method];
//   };

//   const handleConfirmPaymentMethods = () => {
//     const methodsToAdd: string[] = [];
//     if (paymentMethod === "linepay" && !additionalPaymentMethods.includes("linepay"))
//       methodsToAdd.push("linepay");
//     if (
//       paymentMethod === "internetbanking" &&
//       !additionalPaymentMethods.includes("internetbanking")
//     )
//       methodsToAdd.push("internetbanking");
//     if (
//       paymentMethod === "banktransfer" &&
//       !additionalPaymentMethods.includes("banktransfer")
//     )
//       methodsToAdd.push("banktransfer");
//     if (paymentMethod === "cash" && !additionalPaymentMethods.includes("cod"))
//       methodsToAdd.push("cod");

//     setAdditionalPaymentMethods((prev) => [...prev, ...methodsToAdd]);
//     setIsPaymentMethodsOpen(false);
//   };

//   const handleRemovePaymentMethod = (methodToRemove: string) => {
//     setAdditionalPaymentMethods((prev) =>
//       prev.filter((method) => method !== methodToRemove)
//     );
//     if (paymentMethod === methodToRemove) {
//       onChangePaymentMethod("card");
//     }
//   };

//   return (
//     <Card>
//       <CardHeader className="pb-3">
//         <CardTitle className="text-lg">
//           เลือกวิธีชำระเงิน
//           <Sheet
//             open={isPaymentMethodsOpen}
//             onOpenChange={setIsPaymentMethodsOpen}
//           >
//             <SheetTrigger asChild>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="text-primary self-start p-0 h-auto ml-2"
//               >
//                 ดูวิธีการทั้งหมด »
//               </Button>
//             </SheetTrigger>
//             <SheetContent
//               side="right"
//               className="w-[500px] max-w-full overflow-hidden"
//             >
//               <SheetHeader>
//                 <SheetTitle>เลือกวิธีชำระเงิน</SheetTitle>
//               </SheetHeader>

//               <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
//                 <h3 className="text-sm font-medium text-gray-700">
//                   วิธียอดนิยม
//                 </h3>
//                 {/* card */}
//                 <div
//                   className={`flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors cursor-pointer ${
//                     paymentMethod === "card"
//                       ? "border-primary bg-primary/5"
//                       : "border-gray-200"
//                   }`}
//                   onClick={() => onChangePaymentMethod("card")}
//                 >
//                   <div className="bg-blue-100 p-2 rounded-lg">
//                     <CreditCard className="h-6 w-6 text-blue-600" />
//                   </div>
//                   <div className="flex-1">
//                     <div className="font-medium text-gray-900">
//                       บัตรเครดิต/เดบิต
//                     </div>
//                     <div className="text-sm text-gray-500">
//                       บัตรเครดิต/เดบิต
//                     </div>
//                     <div className="flex items-center gap-1 mt-1">
//                       <img
//                         src="/assets/mastercard-logo.svg"
//                         alt="Mastercard"
//                         className="h-4 w-auto"
//                       />
//                       <img
//                         src="/assets/jcb-logo.svg"
//                         alt="JCB"
//                         className="h-4 w-auto"
//                       />
//                       <img
//                         src="/assets/visa-logo.svg"
//                         alt="Visa"
//                         className="h-4 w-auto"
//                       />
//                     </div>
//                   </div>
//                   {paymentMethod === "card" && (
//                     <Check className="h-5 w-5 text-green-500" />
//                   )}
//                 </div>

//                 <Separator />

//                 <h3 className="text-sm font-medium text-gray-700">
//                   วิธีชำระเงินอื่น ๆ
//                 </h3>

//                 {/* COD */}
//                 <div
//                   className={`flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors cursor-pointer ${
//                     paymentMethod === "cash"
//                       ? "border-primary bg-primary/5"
//                       : "border-gray-200"
//                   }`}
//                   onClick={() => onChangePaymentMethod("cash")}
//                 >
//                   <div className="bg-green-100 p-2 rounded-lg">
//                     <Wallet className="h-6 w-6 text-green-600" />
//                   </div>
//                   <div className="flex-1">
//                     <div className="font-medium text-gray-900">
//                       เก็บเงินปลายทาง
//                     </div>
//                     <div className="text-sm text-gray-500">เก็บเงินปลายทาง</div>
//                   </div>
//                   {paymentMethod === "cash" && (
//                     <Check className="h-5 w-5 text-green-500" />
//                   )}
//                 </div>

//                 {/* QR */}
//                 <div
//                   className={`flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors cursor-pointer ${
//                     paymentMethod === "qr"
//                       ? "border-primary bg-primary/5"
//                       : "border-gray-200"
//                   }`}
//                   onClick={() => onChangePaymentMethod("qr")}
//                 >
//                   <div className="bg-blue-100 p-2 rounded-lg">
//                     <QrCode className="h-6 w-6 text-blue-600" />
//                   </div>
//                   <div className="flex-1">
//                     <div className="font-medium text-gray-900">
//                       QR PromptPay
//                     </div>
//                     <div className="text-sm text-gray-500">
//                       สแกน QR Code เพื่อชำระเงิน
//                     </div>
//                   </div>
//                   {paymentMethod === "qr" && (
//                     <Check className="h-5 w-5 text-green-500" />
//                   )}
//                 </div>

//                 {/* LINE Pay */}
//                 <div
//                   className={`flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors cursor-pointer ${
//                     paymentMethod === "linepay"
//                       ? "border-primary bg-primary/5"
//                       : "border-gray-200"
//                   }`}
//                   onClick={() => onChangePaymentMethod("linepay")}
//                 >
//                   <div className="bg-green-100 p-2 rounded-lg">
//                     <Smartphone className="h-6 w-6 text-green-600" />
//                   </div>
//                   <div className="flex-1">
//                     <div className="font-medium text-gray-900">LINE Pay</div>
//                     <div className="text-sm text-gray-500">
//                       เชื่อมต่อบัตรหรือเติมเงินก่อนช้อปปิ้ง
//                     </div>
//                   </div>
//                   {paymentMethod === "linepay" && (
//                     <Check className="h-5 w-5 text-green-500" />
//                   )}
//                 </div>

//                 {/* Internet Banking */}
//                 <div
//                   className={`flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors cursor-pointer ${
//                     paymentMethod === "internetbanking"
//                       ? "border-primary bg-primary/5"
//                       : "border-gray-200"
//                   }`}
//                   onClick={() => onChangePaymentMethod("internetbanking")}
//                 >
//                   <div className="bg-blue-100 p-2 rounded-lg">
//                     <Building2 className="h-6 w-6 text-blue-600" />
//                   </div>
//                   <div className="flex-1">
//                     <div className="font-medium text-gray-900">
//                       Internet Banking
//                     </div>
//                     <div className="text-sm text-gray-500">
//                       เข้าสู่ระบบด้วยบัญชีธนาคารเพื่อชำระเงิน
//                     </div>
//                   </div>
//                   {paymentMethod === "internetbanking" && (
//                     <Check className="h-5 w-5 text-green-500" />
//                   )}
//                 </div>

//                 {/* Bank Transfer */}
//                 <div
//                   className={`flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors cursor-pointer ${
//                     paymentMethod === "banktransfer"
//                       ? "border-primary bg-primary/5"
//                       : "border-gray-200"
//                   }`}
//                   onClick={() => onChangePaymentMethod("banktransfer")}
//                 >
//                   <div className="bg-purple-100 p-2 rounded-lg">
//                     <ArrowLeftRight className="h-6 w-6 text-purple-600" />
//                   </div>
//                   <div className="flex-1">
//                     <div className="font-medium text-gray-900">
//                       โอนเงินผ่านธนาคาร
//                     </div>
//                     <div className="text-sm text-gray-500">
//                       โอนเงินโดยตรงไปยังบัญชีของผู้ขาย
//                     </div>
//                   </div>
//                   {paymentMethod === "banktransfer" && (
//                     <Check className="h-5 w-5 text-green-500" />
//                   )}
//                 </div>
//               </div>

//               <div className="flex justify-end gap-2 mt-6">
//                 <Button variant="outline" onClick={() => setIsPaymentMethodsOpen(false)}>
//                   ยกเลิก
//                 </Button>
//                 <Button
//                   className="bg-orange-500 hover:bg-orange-600 text-white"
//                   onClick={handleConfirmPaymentMethods}
//                 >
//                   ยืนยัน
//                 </Button>
//               </div>
//             </SheetContent>
//           </Sheet>
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-3">
//         <RadioGroup
//           value={paymentMethod}
//           onValueChange={onChangePaymentMethod}
//         >
//           {/* card */}
//           <div
//             className={`flex items-center space-x-2 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors ${
//               paymentMethod === "card"
//                 ? "border-primary bg-primary/5"
//                 : "border-gray-200"
//             }`}
//           >
//             <RadioGroupItem value="card" id="card" />
//             <div className="bg-blue-100 p-2 rounded-lg">
//               <CreditCard className="h-6 w-6 text-blue-600" />
//             </div>
//             <div className="flex-1">
//               <Label htmlFor="card" className="cursor-pointer">
//                 <div className="font-semibold text-gray-900">
//                   บัตรเครดิต/เดบิต
//                 </div>
//                 <div className="text-sm text-gray-500">บัตรเครดิต/เดบิต</div>
//               </Label>
//               <div className="flex items-center gap-1 mt-2">
//                 <img
//                   src="/assets/mastercard-logo.svg"
//                   alt="Mastercard"
//                   className="h-4 w-auto"
//                 />
//                 <img
//                   src="/assets/jcb-logo.svg"
//                   alt="JCB"
//                   className="h-4 w-auto"
//                 />
//                 <img
//                   src="/assets/visa-logo.svg"
//                   alt="Visa"
//                   className="h-4 w-auto"
//                 />
//               </div>
//             </div>
//             {paymentMethod === "card" && (
//               <Check className="h-5 w-5 text-green-500" />
//             )}
//           </div>

//           {/* QR main */}
//           <div
//             className={`flex items-center space-x-2 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors ${
//               paymentMethod === "qr"
//                 ? "border-primary bg-primary/5"
//                 : "border-gray-200"
//             }`}
//           >
//             <RadioGroupItem value="qr" id="qr" />
//             <div className="bg-blue-100 p-2 rounded-lg">
//               <QrCode className="h-6 w-6 text-blue-600" />
//             </div>
//             <Label htmlFor="qr" className="flex-1 cursor-pointer">
//               <div className="font-semibold text-gray-900">QR PromptPay</div>
//               <div className="text-sm text-gray-500">
//                 สแกน QR Code เพื่อชำระเงิน
//               </div>
//             </Label>
//             {paymentMethod === "qr" && (
//               <Check className="h-5 w-5 text-green-500" />
//             )}
//           </div>

//           {/* methods ที่เพิ่มจากแผงด้านขวา */}
//           {additionalPaymentMethods.map((method) => {
//             const info = getPaymentMethodInfo(method);
//             if (!info) return null;

//             return (
//               <div
//                 key={method}
//                 className={`flex items-center space-x-2 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors ${
//                   paymentMethod === method
//                     ? "border-primary bg-primary/5"
//                     : "border-gray-200"
//                 }`}
//               >
//                 <RadioGroupItem value={method} id={method} />
//                 <div className={`${info.bgColor} p-2 rounded-lg`}>
//                   {info.icon}
//                 </div>
//                 <Label htmlFor={method} className="flex-1 cursor-pointer">
//                   <div className="font-semibold text-gray-900">
//                     {info.name}
//                   </div>
//                   <div className="text-sm text-gray-500">
//                     {info.description}
//                   </div>
//                 </Label>
//                 {paymentMethod === method && (
//                   <Check className="h-5 w-5 text-green-500" />
//                 )}
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={(e) => {
//                     e.preventDefault();
//                     e.stopPropagation();
//                     handleRemovePaymentMethod(method);
//                   }}
//                   className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
//                 >
//                   <Trash2 className="h-4 w-4" />
//                 </Button>
//               </div>
//             );
//           })}
//         </RadioGroup>
//       </CardContent>
//     </Card>
//   );
// }

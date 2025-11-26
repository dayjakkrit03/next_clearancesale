// v.1.1.2 ===============================================================
// src/app/checkout/component/CheckoutInvoiceSection.tsx

"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// ⬇️ ใช้ type กลาง
import type { CheckoutInvoiceInfo } from "@/types/checkout";

export default function CheckoutInvoiceSection() {
  const [isInvoiceSheetOpen, setIsInvoiceSheetOpen] = useState(false);

  // ⬇️ ใช้ type กลางให้ถูกต้อง
  const [invoiceInfo, setInvoiceInfo] = useState<CheckoutInvoiceInfo>({
    email: "jakrit.dev19@gmail.com",
    billingAddress:
      "สิรดา ธำรำ 0863527663\nสบปิดิ์ ร้ำปี ร่ำวชำกระก๊วยิดส เคลส์ 50/37 ซอย 8 ซิ์ง อ.สิ่ง ลิ. สะหมำเชม/ Saphan Song, 10310, วำงห่องส่ำม/ Wang Thonglang, กรุงเทพมหำนคร/ Bangkok",
    taxId: "",
    headOfficeBranch: "",
  });

  const handleSaveInvoiceInfo = () => setIsInvoiceSheetOpen(false);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          ใบกำกับภาษีและข้อมูลติดต่อ
          <Sheet
            open={isInvoiceSheetOpen}
            onOpenChange={setIsInvoiceSheetOpen}
          >
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-primary">
                แก้ไข
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[500px] max-w-full overflow-hidden"
            >
              <SheetHeader>
                <SheetTitle>ใบกำกับภาษีและข้อมูลติดต่อ</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    * อีเมล
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={invoiceInfo.email}
                    onChange={(e) =>
                      setInvoiceInfo((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="กรอกอีเมลเพื่อรับการอัปเดตสถานะการจัดส่ง"
                  />
                </div>

                {/* Billing Address */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    * ที่อยู่ในการออกใบกำกับภาษี
                  </Label>
                  <Textarea
                    value={invoiceInfo.billingAddress}
                    onChange={(e) =>
                      setInvoiceInfo((prev) => ({
                        ...prev,
                        billingAddress: e.target.value,
                      }))
                    }
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    คลิกเพื่อแก้ไขข้อมูลการเรียกเก็บเงินสำหรับการออกใบกำกับภาษี
                    *กรุณา กรอกชื่อเต็มในช่องที่จำเป็น
                  </p>
                </div>

                {/* Tax ID */}
                <div className="space-y-2">
                  <Label htmlFor="taxId" className="text-sm font-medium">
                    เลขประจำตัวผู้เสียภาษี
                  </Label>
                  <Input
                    id="taxId"
                    value={invoiceInfo.taxId}
                    onChange={(e) =>
                      setInvoiceInfo((prev) => ({
                        ...prev,
                        taxId: e.target.value,
                      }))
                    }
                    placeholder="กรุณากรอกเลขประจำตัวผู้เสียภาษีที่ถูกต้อง"
                  />
                </div>

                {/* Head Office / Branch */}
                <div className="space-y-2">
                  <Label
                    htmlFor="headOfficeBranch"
                    className="text-sm font-medium"
                  >
                    รหัสสำนักงานใหญ่/สาขา (สำหรับบริษัท)
                  </Label>
                  <Input
                    id="headOfficeBranch"
                    value={invoiceInfo.headOfficeBranch}
                    onChange={(e) =>
                      setInvoiceInfo((prev) => ({
                        ...prev,
                        headOfficeBranch: e.target.value,
                      }))
                    }
                    placeholder="กรุณากรอกสำนักงานใหญ่/สาขาเพื่อรับใบกำกับภาษี"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsInvoiceSheetOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
                  onClick={handleSaveInvoiceInfo}
                >
                  บันทึก
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </CardTitle>
      </CardHeader>

      {/* Summary below card */}
      <CardContent className="space-y-3">
        <div className="text-sm">
          <p className="font-medium">Email</p>
          <p className="text-gray-600">{invoiceInfo.email}</p>
        </div>

        <div className="text-sm">
          <p className="font-medium">ที่อยู่ในการออกใบกำกับภาษี</p>
          <p className="text-gray-600 whitespace-pre-line">
            {invoiceInfo.billingAddress}
          </p>
        </div>

        {invoiceInfo.taxId && (
          <div className="text-sm">
            <p className="font-medium">เลขประจำตัวผู้เสียภาษี</p>
            <p className="text-gray-600">{invoiceInfo.taxId}</p>
          </div>
        )}

        {invoiceInfo.headOfficeBranch && (
          <div className="text-sm">
            <p className="font-medium">รหัสสำนักงานใหญ่/สาขา</p>
            <p className="text-gray-600">{invoiceInfo.headOfficeBranch}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// v.1.1.2 ===============================================================

// // src/app/checkout/component/CheckoutInvoiceSection.tsx

// "use client";

// import { useState } from "react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";

// export default function CheckoutInvoiceSection() {
//   const [isInvoiceSheetOpen, setIsInvoiceSheetOpen] = useState(false);
//   const [invoiceInfo, setInvoiceInfo] = useState({
//     email: "jakrit.dev19@gmail.com",
//     billingAddress:
//       "สิรดา ธำรำ 0863527663\nสบปิดิ์ ร้ำปี ร่ำวชำกระก๊วยิดส เคลส์ 50/37 ซอย 8 ซิ์ง อ.สิ่ง ลิ. สะหมำเชม/ Saphan Song, 10310, วำงห่องส่ำม/ Wang Thonglang, กรุงเทพมหำนคร/ Bangkok",
//     taxId: "",
//     headOfficeBranch: "",
//   });

//   const handleSaveInvoiceInfo = () => setIsInvoiceSheetOpen(false);

//   return (
//     <Card>
//       <CardHeader className="pb-3">
//         <CardTitle className="flex items-center justify-between text-lg">
//           ใบกำกับภาษีและข้อมูลติดต่อ
//           <Sheet
//             open={isInvoiceSheetOpen}
//             onOpenChange={setIsInvoiceSheetOpen}
//           >
//             <SheetTrigger asChild>
//               <Button variant="ghost" size="sm" className="text-primary">
//                 แก้ไข
//               </Button>
//             </SheetTrigger>
//             <SheetContent
//               side="right"
//               className="w-[500px] max-w-full overflow-hidden"
//             >
//               <SheetHeader>
//                 <SheetTitle>ใบกำกับภาษีและข้อมูลติดต่อ</SheetTitle>
//               </SheetHeader>

//               <div className="mt-6 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
//                 <div className="space-y-2">
//                   <Label htmlFor="email" className="text-sm font-medium">
//                     * อีเมล
//                   </Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     value={invoiceInfo.email}
//                     onChange={(e) =>
//                       setInvoiceInfo((prev) => ({
//                         ...prev,
//                         email: e.target.value,
//                       }))
//                     }
//                     placeholder="กรอกอีเมลเพื่อรับการอัปเดตสถานะการจัดส่ง"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="text-sm font-medium">
//                     * ที่อยู่ในการออกใบกำกับภาษี
//                   </Label>
//                   <Textarea
//                     value={invoiceInfo.billingAddress}
//                     onChange={(e) =>
//                       setInvoiceInfo((prev) => ({
//                         ...prev,
//                         billingAddress: e.target.value,
//                       }))
//                     }
//                     rows={4}
//                     className="resize-none"
//                   />
//                   <p className="text-xs text-gray-500">
//                     คลิกเพื่อแก้ไขข้อมูลการเรียกเก็บเงินสำหรับการออกใบกำกับภาษี
//                     *กรุณา กรอกชื่อเต็มในช่องที่จำเป็น
//                   </p>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="taxId" className="text-sm font-medium">
//                     เลขประจำตัวผู้เสียภาษี
//                   </Label>
//                   <Input
//                     id="taxId"
//                     value={invoiceInfo.taxId}
//                     onChange={(e) =>
//                       setInvoiceInfo((prev) => ({
//                         ...prev,
//                         taxId: e.target.value,
//                       }))
//                     }
//                     placeholder="กรุณากรอกเลขประจำตัวผู้เสียภาษีที่ถูกต้อง"
//                     className="border-red-200"
//                   />
//                   <p className="text-xs text-red-500">
//                     กรุณากรอกเลขประจำตัวผู้เสียภาษีเพื่อรับใบกำกับภาษี
//                   </p>
//                 </div>

//                 <div className="space-y-2">
//                   <Label
//                     htmlFor="headOfficeBranch"
//                     className="text-sm font-medium"
//                   >
//                     รหัสสำนักงานใหญ่/สาขา (สำหรับบริษัท)
//                   </Label>
//                   <Input
//                     id="headOfficeBranch"
//                     value={invoiceInfo.headOfficeBranch}
//                     onChange={(e) =>
//                       setInvoiceInfo((prev) => ({
//                         ...prev,
//                         headOfficeBranch: e.target.value,
//                       }))
//                     }
//                     placeholder="กรุณากรอกสำนักงานใหญ่/สาขาเพื่อรับใบกำกับภาษี"
//                   />
//                 </div>
//               </div>

//               <div className="flex gap-3 mt-8">
//                 <Button
//                   variant="outline"
//                   className="flex-1"
//                   onClick={() => setIsInvoiceSheetOpen(false)}
//                 >
//                   ยกเลิก
//                 </Button>
//                 <Button
//                   className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
//                   onClick={handleSaveInvoiceInfo}
//                 >
//                   บันทึก
//                 </Button>
//               </div>
//             </SheetContent>
//           </Sheet>
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-3">
//         <div className="text-sm">
//           <p className="font-medium">Email</p>
//           <p className="text-gray-600">{invoiceInfo.email}</p>
//         </div>
//         <div className="text-sm">
//           <p className="font-medium">ที่อยู่ในการออกใบกำกับภาษี</p>
//           <p className="text-gray-600 whitespace-pre-line">
//             {invoiceInfo.billingAddress}
//           </p>
//         </div>
//         {invoiceInfo.taxId && (
//           <div className="text-sm">
//             <p className="font-medium">เลขประจำตัวผู้เสียภาษี</p>
//             <p className="text-gray-600">{invoiceInfo.taxId}</p>
//           </div>
//         )}
//         {invoiceInfo.headOfficeBranch && (
//           <div className="text-sm">
//             <p className="font-medium">รหัสสำนักงานใหญ่/สาขา</p>
//             <p className="text-gray-600">{invoiceInfo.headOfficeBranch}</p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

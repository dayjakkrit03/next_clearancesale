// v.1.1.2 ===============================================================
// src/app/checkout/component/CheckoutVoucherSection.tsx

"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Trash2 } from "lucide-react";

// ⬇️ ใช้ type กลาง
import type { CheckoutVoucher } from "../checkout.types";

type Props = {
  voucherCode: string;
  setVoucherCode: (value: string) => void;
  voucherError: string;
  setVoucherError: (value: string) => void;
  appliedVouchers: CheckoutVoucher[];
  onApplyVoucher: () => void;
  onRemoveVoucher: (code: string) => void;
};

export default function CheckoutVoucherSection({
  voucherCode,
  setVoucherCode,
  voucherError,
  setVoucherError,
  appliedVouchers,
  onApplyVoucher,
  onRemoveVoucher,
}: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Voucher</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            placeholder="กรอกโค้ดส่วนลด"
            value={voucherCode}
            onChange={(e) => {
              setVoucherCode(e.target.value);
              setVoucherError("");
            }}
            className="flex-1"
          />
          <Button
            variant="outline"
            className="bg-teal-500 text-white border-teal-500 hover:bg-teal-600"
            onClick={onApplyVoucher}
          >
            ใช้
          </Button>
        </div>

        {voucherError && (
          <div className="mt-2 text-sm text-red-600">{voucherError}</div>
        )}

        {appliedVouchers.length > 0 && (
          <div className="mt-3 space-y-2">
            {appliedVouchers.map((voucher) => (
              <div
                key={voucher.code}
                className="p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">
                      {voucher.code}
                    </span>
                    <span className="text-sm text-green-600">ใช้แล้ว</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-medium">
                      -฿{voucher.discount}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveVoucher(voucher.code)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// v.1.1.2 ===============================================================

// // src/app/checkout/component/CheckoutVoucherSection.tsx

// "use client";

// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Check, Trash2 } from "lucide-react";

// type Voucher = { code: string; discount: number };

// type Props = {
//   voucherCode: string;
//   setVoucherCode: (value: string) => void;
//   voucherError: string;
//   setVoucherError: (value: string) => void;
//   appliedVouchers: Voucher[];
//   onApplyVoucher: () => void;
//   onRemoveVoucher: (code: string) => void;
// };

// export default function CheckoutVoucherSection({
//   voucherCode,
//   setVoucherCode,
//   voucherError,
//   setVoucherError,
//   appliedVouchers,
//   onApplyVoucher,
//   onRemoveVoucher,
// }: Props) {
//   return (
//     <Card>
//       <CardHeader className="pb-3">
//         <CardTitle className="text-lg">Voucher</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="flex gap-2">
//           <Input
//             placeholder="กรอกโค้ดส่วนลด"
//             value={voucherCode}
//             onChange={(e) => {
//               setVoucherCode(e.target.value);
//               setVoucherError("");
//             }}
//             className="flex-1"
//           />
//           <Button
//             variant="outline"
//             className="bg-teal-500 text-white border-teal-500 hover:bg-teal-600"
//             onClick={onApplyVoucher}
//           >
//             ใช้
//           </Button>
//         </div>

//         {voucherError && (
//           <div className="mt-2 text-sm text-red-600">{voucherError}</div>
//         )}

//         {appliedVouchers.length > 0 && (
//           <div className="mt-3 space-y-2">
//             {appliedVouchers.map((voucher) => (
//               <div
//                 key={voucher.code}
//                 className="p-3 bg-green-50 border border-green-200 rounded-lg"
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <Check className="h-4 w-4 text-green-600" />
//                     <span className="font-medium text-green-800">
//                       {voucher.code}
//                     </span>
//                     <span className="text-sm text-green-600">ใช้แล้ว</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-green-600 font-medium">
//                       -฿{voucher.discount}
//                     </span>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => onRemoveVoucher(voucher.code)}
//                       className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

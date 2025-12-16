// v.1.1.4 =====================================================================
"use client";

import { Truck, Shield, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Type ของ props
 */
export type ServiceFeaturesProps = {
  freeShippingEligible?: boolean;      // true = แสดงส่งฟรี
  freeShipMinimum?: number | null;     // ขั้นต่ำในการส่งฟรี (0 หรือ null = ไม่มีขั้นต่ำ)
  warrantyMonths?: number | null;      // จำนวนเดือนประกัน
  returnDays?: number | null;          // จำนวนวันคืนสินค้า
};

/**
 * helper แปลงเดือน → ข้อความปี/เดือน
 */
function formatWarranty(months?: number | null): string | null {
  if (!months || months <= 0) return null;

  const years = Math.floor(months / 12);
  const remain = months % 12;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ปี`);
  if (remain > 0) parts.push(`${remain} เดือน`);

  if (parts.length === 0) {
    return `${months} เดือน`;
  }
  return parts.join(" ");
}

/**
 * Component หลัก
 */
export function ServiceFeatures({
  freeShippingEligible,
  freeShipMinimum,
  warrantyMonths = 12,
  returnDays = 7,
}: ServiceFeaturesProps) {
  const warrantyText = formatWarranty(warrantyMonths);

  // ทำให้ค่าดูสะอาด ๆ ก่อนใช้
  const isFreeShipping = !!freeShippingEligible; // true เมื่อ free_shipping_eligible = 1
  const min =
    freeShipMinimum != null ? Number(freeShipMinimum) : null;
  const hasMin = min != null && min > 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ส่งฟรี */}
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-success" />
            <div>
              <p className="font-medium text-sm">
                {isFreeShipping ? "ส่งฟรี" : "ค่าจัดส่งตามระยะทาง"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isFreeShipping
                  ? hasMin
                    ? `สั่งซื้อขั้นต่ำ ${min!.toLocaleString()}฿`
                    : "ส่งฟรีทุกออเดอร์"
                  : "ไม่ร่วมรายการส่งฟรี"}
              </p>
            </div>
          </div>

          {/* การรับประกัน */}
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-sm">รับประกัน</p>
              <p className="text-xs text-muted-foreground">
                {warrantyText ?? "ไม่มีการรับประกัน"}
              </p>
            </div>
          </div>

          {/* คืนสินค้า */}
          <div className="flex items-center gap-3">
            <RotateCcw className="h-5 w-5 text-warning" />
            <div>
              <p className="font-medium text-sm">เปลี่ยน/คืนสินค้า</p>
              <p className="text-xs text-muted-foreground">
                {returnDays && returnDays > 0
                  ? `ภายใน ${returnDays} วัน`
                  : "ไม่สามารถคืนสินค้าได้"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// v.1.1.4 =====================================================================

// v.1.1.3 =====================================================================
// // src/app/product/[id]/component/ServiceFeatures.tsx

// "use client";

// import { Truck, Shield, RotateCcw } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";

// /**
//  * Type ของ props
//  */
// export type ServiceFeaturesProps = {
//   freeShippingEligible?: boolean;      // true = แสดงส่งฟรี
//   freeShipMinimum?: number | null;     // ขั้นต่ำในการส่งฟรี
//   warrantyMonths?: number | null;      // จำนวนเดือนประกัน
//   returnDays?: number | null;          // จำนวนวันคืนสินค้า
// };

// /**
//  * helper แปลงเดือน → ข้อความปี/เดือน
//  *  - 12   -> "1 ปี"
//  *  - 24   -> "2 ปี"
//  *  - 18   -> "1 ปี 6 เดือน"
//  *  - 6    -> "6 เดือน"
//  *  - 0/-/null -> null (ให้ไปโชว์ว่าไม่มีการรับประกันแทน)
//  */
// function formatWarranty(months?: number | null): string | null {
//   if (!months || months <= 0) return null;

//   const years = Math.floor(months / 12);
//   const remain = months % 12;

//   const parts: string[] = [];
//   if (years > 0) {
//     parts.push(`${years} ปี`);
//   }
//   if (remain > 0) {
//     parts.push(`${remain} เดือน`);
//   }

//   // กรณีเช่น 1, 2, 6 เดือนที่ไม่เต็มปี → years = 0 → แสดงแค่ "X เดือน"
//   if (parts.length === 0) {
//     return `${months} เดือน`;
//   }

//   return parts.join(" ");
// }

// /**
//  * Component หลัก
//  */
// export function ServiceFeatures({
//   freeShippingEligible = true,
//   freeShipMinimum = 5000,
//   warrantyMonths = 12,
//   returnDays = 7,
// }: ServiceFeaturesProps) {
//   const warrantyText = formatWarranty(warrantyMonths);

//   return (
//     <Card>
//       <CardContent className="p-4">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {/* ส่งฟรี */}
//           <div className="flex items-center gap-3">
//             <Truck className="h-5 w-5 text-success" />
//             <div>
//               <p className="font-medium text-sm">
//                 {freeShippingEligible ? "ส่งฟรี" : "ค่าจัดส่งตามระยะทาง"}
//               </p>
//               {freeShippingEligible && freeShipMinimum ? (
//                 <p className="text-xs text-muted-foreground">
//                   สั่งซื้อขั้นต่ำ {freeShipMinimum.toLocaleString()}฿
//                 </p>
//               ) : (
//                 <p className="text-xs text-muted-foreground">
//                   ไม่ร่วมรายการส่งฟรี
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* การรับประกัน */}
//           <div className="flex items-center gap-3">
//             <Shield className="h-5 w-5 text-primary" />
//             <div>
//               <p className="font-medium text-sm">รับประกัน</p>
//               <p className="text-xs text-muted-foreground">
//                 {warrantyText ?? "ไม่มีการรับประกัน"}
//               </p>
//             </div>
//           </div>

//           {/* คืนสินค้า */}
//           <div className="flex items-center gap-3">
//             <RotateCcw className="h-5 w-5 text-warning" />
//             <div>
//               <p className="font-medium text-sm">เปลี่ยน/คืนสินค้า</p>
//               <p className="text-xs text-muted-foreground">
//                 {returnDays
//                   ? `ภายใน ${returnDays} วัน`
//                   : "ไม่สามารถคืนสินค้าได้"}
//               </p>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// v.1.1.3 =====================================================================


// v.1.1.2 =====================================================================
// // src/app/product/[id]/component/ServiceFeatures.tsx

// "use client";

// import { Truck, Shield, RotateCcw } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";

// /** 
//  * ประกาศ Type ของ props 
//  */
// export type ServiceFeaturesProps = {
//   freeShippingEligible?: boolean;      // true = แสดงส่งฟรี
//   freeShipMinimum?: number | null;     // ขั้นต่ำในการส่งฟรี
//   warrantyMonths?: number | null;      // จำนวนเดือนประกัน
//   returnDays?: number | null;          // จำนวนวันคืนสินค้า
// };

// /**
//  * Component หลัก
//  */
// export function ServiceFeatures({
//   freeShippingEligible = true,
//   freeShipMinimum = 5000,
//   warrantyMonths = 12,
//   returnDays = 7,
// }: ServiceFeaturesProps) {
//   return (
//     <Card>
//       <CardContent className="p-4">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

//           {/* ส่งฟรี */}
//           <div className="flex items-center gap-3">
//             <Truck className="h-5 w-5 text-success" />
//             <div>
//               <p className="font-medium text-sm">
//                 {freeShippingEligible ? "ส่งฟรี" : "ค่าจัดส่งตามระยะทาง"}
//               </p>
//               {freeShippingEligible && freeShipMinimum ? (
//                 <p className="text-xs text-muted-foreground">
//                   สั่งซื้อขั้นต่ำ {freeShipMinimum.toLocaleString()}฿
//                 </p>
//               ) : (
//                 <p className="text-xs text-muted-foreground">
//                   ไม่ร่วมรายการส่งฟรี
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* การรับประกัน */}
//           <div className="flex items-center gap-3">
//             <Shield className="h-5 w-5 text-primary" />
//             <div>
//               <p className="font-medium text-sm">รับประกัน</p>
//               <p className="text-xs text-muted-foreground">
//                 {warrantyMonths
//                   ? `${warrantyMonths} เดือน`
//                   : "ไม่มีการรับประกัน"}
//               </p>
//             </div>
//           </div>

//           {/* คืนสินค้า */}
//           <div className="flex items-center gap-3">
//             <RotateCcw className="h-5 w-5 text-warning" />
//             <div>
//               <p className="font-medium text-sm">เปลี่ยน/คืนสินค้า</p>
//               <p className="text-xs text-muted-foreground">
//                 {returnDays
//                   ? `ภายใน ${returnDays} วัน`
//                   : "ไม่สามารถคืนสินค้าได้"}
//               </p>
//             </div>
//           </div>

//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// v.1.1.2 =====================================================================

// // src/app/product/[id]/component/ServiceFeatures.tsx

// "use client";

// import { Truck, Shield, RotateCcw } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";

// export function ServiceFeatures() {
//   return (
//     <Card>
//       <CardContent className="p-4">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="flex items-center gap-3">
//             <Truck className="h-5 w-5 text-success" />
//             <div>
//               <p className="font-medium text-sm">ส่งฟรี</p>
//               <p className="text-xs text-muted-foreground">
//                 สั่งซื้อขั้นต่ำ 5,000฿
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <Shield className="h-5 w-5 text-primary" />
//             <div>
//               <p className="font-medium text-sm">รับประกัน</p>
//               <p className="text-xs text-muted-foreground">3 ปี</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <RotateCcw className="h-5 w-5 text-warning" />
//             <div>
//               <p className="font-medium text-sm">เปลี่ยน/คืนสินค้า</p>
//               <p className="text-xs text-muted-foreground">ภายใน 7 วัน</p>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
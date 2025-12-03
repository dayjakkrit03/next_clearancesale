// v.1.1.6 ===================================================
// src/app/checkout/component/CheckoutAddressSummary.tsx
"use client";

import type { CheckoutAddress } from "@/types/checkout";

type Props = {
  selectedAddress: CheckoutAddress;
};

/* กล่องคนละสีเล็กน้อยให้รู้ว่าอันไหนจัดส่ง / ออกใบกำกับภาษี */
function getBoxClass(addr: CheckoutAddress): string {
  if (addr.purpose === "shipping") {
    return "border-orange-200 bg-orange-50";
  }
  if (addr.purpose === "billing") {
    return "border-gray-200 bg-gray-50";
  }
  return "border-gray-200 bg-gray-50";
}

export default function CheckoutAddressSummary({ selectedAddress }: Props) {
  const boxClass = getBoxClass(selectedAddress);

  return (
    <div className={`rounded border p-3 ${boxClass}`}>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        {selectedAddress.name && (
          <span className="font-medium">{selectedAddress.name}</span>
        )}
        {selectedAddress.phone && (
          <span className="text-muted-foreground">
            {selectedAddress.phone}
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {selectedAddress.address || "-"}
      </p>
    </div>
  );
}

// v.1.1.6 ===================================================

// v.1.1.5 ===================================================
// // src/app/checkout/component/CheckoutAddressSummary.tsx

// "use client";

// import type { CheckoutAddress } from "@/types/checkout";

// type Props = {
//   selectedAddress: CheckoutAddress;
// };

// /* ======================================================
//  * Helpers
//  * ====================================================== */

// /** ป้ายบอกโหมดโปรไฟล์ */
// function getProfileLabel(addr: CheckoutAddress): string {
//   if (addr.profileMode === "person") return "บุคคลธรรมดา";
//   if (addr.profileMode === "entity") return "นิติบุคคล";

//   // fallback → เดาจาก type คลังเก่า
//   return addr.type === "HOME" ? "บุคคลธรรมดา" : "นิติบุคคล";
// }

// /** สี badge ตามโหมดโปรไฟล์ */
// function getProfileBadgeClass(addr: CheckoutAddress): string {
//   if (addr.profileMode === "person") return "bg-orange-500";
//   if (addr.profileMode === "entity") return "bg-emerald-600";

//   // fallback แบบเก่า
//   return addr.type === "HOME" ? "bg-orange-500" : "bg-emerald-600";
// }

// /** สีกรอบของบล็อก (แยก shipping กับ billing ให้เห็นง่ายขึ้น) */
// function getBoxClass(addr: CheckoutAddress): string {
//   if (addr.purpose === "shipping") {
//     // สีฟ้าอ่อน = ที่อยู่จัดส่ง
//     return "border-blue-200 bg-blue-50";
//   }
//   if (addr.purpose === "billing") {
//     // สีม่วงอ่อน = ที่อยู่ออกใบกำกับภาษี
//     return "border-purple-200 bg-purple-50";
//   }

//   // fallback เดิม (สีส้มอ่อน)
//   return "border-orange-200 bg-orange-50";
// }

// /* ======================================================
//  * Component
//  * ====================================================== */

// export default function CheckoutAddressSummary({ selectedAddress }: Props) {
//   const profileLabel = getProfileLabel(selectedAddress);
//   const badgeClass = getProfileBadgeClass(selectedAddress);
//   const boxClass = getBoxClass(selectedAddress);

//   return (
//     <div className={`rounded border p-3 ${boxClass}`}>
//       <div className="mb-1 flex flex-wrap items-center gap-2">
//         {/* ป้ายโหมดโปรไฟล์ */}
//         <span
//           className={`rounded px-2 py-1 text-xs font-semibold text-white ${badgeClass}`}
//         >
//           {profileLabel}
//         </span>

//         {/* ชื่อ / โทร */}
//         {selectedAddress.name && (
//           <span className="font-medium">{selectedAddress.name}</span>
//         )}

//         {selectedAddress.phone && (
//           <span className="text-muted-foreground">
//             {selectedAddress.phone}
//           </span>
//         )}
//       </div>

//       {/* ที่อยู่ */}
//       <p className="text-sm text-muted-foreground">
//         {selectedAddress.address || "-"}
//       </p>
//     </div>
//   );
// }

// v.1.1.5 ===================================================

// v.1.1.4 ===================================================
// // src/app/checkout/component/CheckoutAddressSummary.tsx

// "use client";

// import type { CheckoutAddress } from "@/types/checkout";

// type Props = {
//   selectedAddress: CheckoutAddress;
// };

// function getProfileLabel(addr: CheckoutAddress): string {
//   if (addr.profileMode === "person") return "บุคคลธรรมดา";
//   if (addr.profileMode === "entity") return "นิติบุคคล";

//   // ✅ fallback กรณีไม่มี profileMode → แปลจาก type เป็นภาษาไทยเหมือนใน slide
//   return addr.type === "HOME" ? "บุคคลธรรมดา" : "นิติบุคคล";
// }

// function getProfileBadgeClass(addr: CheckoutAddress): string {
//   if (addr.profileMode === "person") {
//     // บุคคลธรรมดา = ส้ม
//     return "bg-orange-500";
//   }
//   if (addr.profileMode === "entity") {
//     // นิติบุคคล = เขียว
//     return "bg-emerald-600";
//   }

//   // ✅ fallback ตาม type (ให้สีเหมือน ๆ กัน)
//   return addr.type === "HOME" ? "bg-orange-500" : "bg-emerald-600";
// }

// export default function CheckoutAddressSummary({ selectedAddress }: Props) {
//   const profileLabel = getProfileLabel(selectedAddress);
//   const badgeClass = getProfileBadgeClass(selectedAddress);

//   return (
//     <div className="rounded border border-orange-200 bg-orange-50 p-3">
//       <div className="mb-1 flex flex-wrap items-center gap-2">
//         {/* ป้ายบอกโหมดโปรไฟล์ */}
//         <span
//           className={`rounded px-2 py-1 text-xs font-semibold text-white ${badgeClass}`}
//         >
//           {profileLabel}
//         </span>

//         <span className="font-medium">{selectedAddress.name}</span>
//         <span className="text-muted-foreground">
//           {selectedAddress.phone}
//         </span>
//       </div>

//       <p className="text-sm text-muted-foreground">
//         {selectedAddress.address}
//       </p>
//     </div>
//   );
// }

// v.1.1.4 ===================================================

// v.1.1.3 ===================================================
// // src/app/checkout/component/CheckoutAddressSummary.tsx

// "use client";

// import type { CheckoutAddress } from "@/types/checkout";

// type Props = {
//   /** ถ้าเป็น null หรือ dummy (id = 0 และไม่มีชื่อ) จะขึ้นข้อความแจ้งเตือนแทน */
//   selectedAddress: CheckoutAddress | null;
// };

// function getProfileLabel(addr: CheckoutAddress): string {
//   if (addr.profileMode === "person") return "บุคคลธรรมดา";
//   if (addr.profileMode === "entity") return "นิติบุคคล";

//   // fallback เดิม ถ้ายังไม่มี profileMode (กันกรณี mock อื่น ๆ)
//   return addr.type === "HOME" ? "HOME" : "OFFICE";
// }

// function getProfileBadgeClass(addr: CheckoutAddress): string {
//   if (addr.profileMode === "person") {
//     // บุคคลธรรมดา = ส้ม
//     return "bg-orange-500";
//   }
//   if (addr.profileMode === "entity") {
//     // นิติบุคคล = เขียว
//     return "bg-emerald-600";
//   }
//   // fallback เดิม
//   return addr.type === "HOME" ? "bg-orange-500" : "bg-blue-500";
// }

// export default function CheckoutAddressSummary({ selectedAddress }: Props) {
//   // ถ้าไม่มีที่อยู่จริง (หรือเป็น dummy id = 0 + ไม่มีชื่อ) แสดงข้อความเตือนแทน
//   if (
//     !selectedAddress ||
//     (selectedAddress.id === 0 && !selectedAddress.name)
//   ) {
//     return (
//       <p className="text-sm text-muted-foreground">
//         ยังไม่ได้ตั้งค่าที่อยู่ โปรดเพิ่มที่อยู่ในโปรไฟล์ของคุณก่อนทำการสั่งซื้อ
//       </p>
//     );
//   }

//   const profileLabel = getProfileLabel(selectedAddress);
//   const badgeClass = getProfileBadgeClass(selectedAddress);

//   return (
//     <div className="rounded border border-orange-200 bg-orange-50 p-3">
//       <div className="mb-1 flex flex-wrap items-center gap-2">
//         {/* ป้ายบอกโหมดโปรไฟล์ */}
//         <span
//           className={`rounded px-2 py-1 text-xs font-semibold text-white ${badgeClass}`}
//         >
//           {profileLabel}
//         </span>

//         {selectedAddress.name && (
//           <span className="font-medium">
//             {selectedAddress.name}
//           </span>
//         )}

//         {selectedAddress.phone && (
//           <span className="text-muted-foreground">
//             {selectedAddress.phone}
//           </span>
//         )}
//       </div>

//       {selectedAddress.address && (
//         <p className="text-sm text-muted-foreground">
//           {selectedAddress.address}
//         </p>
//       )}
//     </div>
//   );
// }

// v.1.1.3 ===================================================

// v.1.1.2 ===================================================
// // src/app/checkout/component/CheckoutAddressSummary.tsx

// "use client";

// import type { CheckoutAddress } from "@/types/checkout";

// type Props = {
//   selectedAddress: CheckoutAddress;
// };

// function getProfileLabel(addr: CheckoutAddress): string {
//   if (addr.profileMode === "person") return "บุคคลธรรมดา";
//   if (addr.profileMode === "entity") return "นิติบุคคล";

//   // fallback เดิม ถ้ายังไม่มี profileMode (กันกรณี mock อื่น ๆ)
//   return addr.type === "HOME" ? "HOME" : "OFFICE";
// }

// function getProfileBadgeClass(addr: CheckoutAddress): string {
//   if (addr.profileMode === "person") {
//     // บุคคลธรรมดา = ส้ม
//     return "bg-orange-500";
//   }
//   if (addr.profileMode === "entity") {
//     // นิติบุคคล = เขียว/น้ำเงิน แล้วแต่ชอบ
//     return "bg-emerald-600";
//   }
//   // fallback เดิม
//   return addr.type === "HOME" ? "bg-orange-500" : "bg-blue-500";
// }

// export default function CheckoutAddressSummary({ selectedAddress }: Props) {
//   const profileLabel = getProfileLabel(selectedAddress);
//   const badgeClass = getProfileBadgeClass(selectedAddress);

//   return (
//     <div className="rounded border border-orange-200 bg-orange-50 p-3">
//       <div className="mb-1 flex flex-wrap items-center gap-2">
//         {/* ป้ายบอกโหมดโปรไฟล์ */}
//         <span
//           className={`rounded px-2 py-1 text-xs font-semibold text-white ${badgeClass}`}
//         >
//           {profileLabel}
//         </span>

//         <span className="font-medium">{selectedAddress.name}</span>
//         <span className="text-muted-foreground">
//           {selectedAddress.phone}
//         </span>
//       </div>

//       <p className="text-sm text-muted-foreground">
//         {selectedAddress.address}
//       </p>
//     </div>
//   );
// }

// v.1.1.2 ===================================================

// // src/app/checkout/component/CheckoutAddressSummary.tsx

// "use client";

// import type { CheckoutAddress } from "@/types/checkout";

// type Props = {
//   selectedAddress: CheckoutAddress;
// };

// export default function CheckoutAddressSummary({ selectedAddress }: Props) {
//   return (
//     <div className="bg-orange-50 p-3 rounded border border-orange-200">
//       <div className="flex items-center gap-2 mb-1">
//         <span
//           className={`text-white text-xs px-2 py-1 rounded ${
//             selectedAddress.type === "HOME"
//               ? "bg-orange-500"
//               : "bg-blue-500"
//           }`}
//         >
//           {selectedAddress.type}
//         </span>
//         <span className="font-medium">{selectedAddress.name}</span>
//         <span className="text-muted-foreground">
//           {selectedAddress.phone}
//         </span>
//       </div>
//       <p className="text-sm text-muted-foreground">
//         {selectedAddress.address}
//       </p>
//     </div>
//   );
// }

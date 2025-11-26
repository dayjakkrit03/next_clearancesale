// v.1.1.2 ===================================================
// src/app/checkout/component/CheckoutAddressSummary.tsx

"use client";

import type { CheckoutAddress } from "@/types/checkout";

type Props = {
  selectedAddress: CheckoutAddress;
};

function getProfileLabel(addr: CheckoutAddress): string {
  if (addr.profileMode === "person") return "บุคคลธรรมดา";
  if (addr.profileMode === "entity") return "นิติบุคคล";

  // fallback เดิม ถ้ายังไม่มี profileMode (กันกรณี mock อื่น ๆ)
  return addr.type === "HOME" ? "HOME" : "OFFICE";
}

function getProfileBadgeClass(addr: CheckoutAddress): string {
  if (addr.profileMode === "person") {
    // บุคคลธรรมดา = ส้ม
    return "bg-orange-500";
  }
  if (addr.profileMode === "entity") {
    // นิติบุคคล = เขียว/น้ำเงิน แล้วแต่ชอบ
    return "bg-emerald-600";
  }
  // fallback เดิม
  return addr.type === "HOME" ? "bg-orange-500" : "bg-blue-500";
}

export default function CheckoutAddressSummary({ selectedAddress }: Props) {
  const profileLabel = getProfileLabel(selectedAddress);
  const badgeClass = getProfileBadgeClass(selectedAddress);

  return (
    <div className="rounded border border-orange-200 bg-orange-50 p-3">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        {/* ป้ายบอกโหมดโปรไฟล์ */}
        <span
          className={`rounded px-2 py-1 text-xs font-semibold text-white ${badgeClass}`}
        >
          {profileLabel}
        </span>

        <span className="font-medium">{selectedAddress.name}</span>
        <span className="text-muted-foreground">
          {selectedAddress.phone}
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        {selectedAddress.address}
      </p>
    </div>
  );
}

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

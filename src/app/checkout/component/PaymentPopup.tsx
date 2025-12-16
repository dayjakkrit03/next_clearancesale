// v.1.1.2 ===============================================================
// src/app/checkout/component/PaymentPopup.tsx
"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaymentPopupProps = {
  open: boolean;
  onClose: () => void;
  iframeUrl: string;
  title?: string;
};

export default function PaymentPopup({
  open,
  onClose,
  iframeUrl,
  title = "ชำระเงิน",
}: PaymentPopupProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">{title}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Iframe */}
        <iframe
          name="payment_iframe"
          src={iframeUrl || "about:blank"}
          title="KBank PayNow"
          className="w-full h-full border-0"
          allow="payment *"
        />
      </div>
    </div>
  );
}

// v.1.1.2 ===============================================================

// // src/app/checkout/component/PaymentPopup.tsx
// "use client";

// import { X } from "lucide-react";
// import { Button } from "@/components/ui/button";

// type PaymentPopupProps = {
//   open: boolean;
//   onClose: () => void;
//   iframeUrl: string;
// };

// export default function PaymentPopup({
//   open,
//   onClose,
//   iframeUrl,
// }: PaymentPopupProps) {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
//       <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden">
//         {/* Header */}
//         <div className="flex items-center justify-between px-4 py-3 border-b">
//           <h3 className="text-sm font-semibold">
//             ชำระเงิน (KBank PayNow)
//           </h3>
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={onClose}
//             aria-label="Close"
//           >
//             <X className="h-4 w-4" />
//           </Button>
//         </div>

//         {/* Iframe */}
//         <iframe
//           src={iframeUrl}
//           title="KBank PayNow"
//           className="w-full h-full border-0"
//           allow="payment *"
//         />
//       </div>
//     </div>
//   );
// }

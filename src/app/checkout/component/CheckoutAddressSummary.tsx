// src/app/checkout/component/CheckoutAddressSummary.tsx

"use client";

import type { CheckoutAddress } from "../checkout.types";

type Props = {
  selectedAddress: CheckoutAddress;
};

export default function CheckoutAddressSummary({ selectedAddress }: Props) {
  return (
    <div className="bg-orange-50 p-3 rounded border border-orange-200">
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`text-white text-xs px-2 py-1 rounded ${
            selectedAddress.type === "HOME"
              ? "bg-orange-500"
              : "bg-blue-500"
          }`}
        >
          {selectedAddress.type}
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

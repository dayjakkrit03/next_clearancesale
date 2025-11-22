// v.1.1.2 =============================================
// src/store/cart-store.ts
"use client";

import { create } from "zustand";

type CartSummary = {
  totalQuantity: number;
  totalAmount: number;
};

interface CartStore {
  summary: CartSummary;
  setSummary: (s: CartSummary) => void;
  reset: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  summary: { totalQuantity: 0, totalAmount: 0 },

  setSummary: (summary) =>
    set(() => ({
      summary,
    })),

  reset: () =>
    set(() => ({
      summary: { totalQuantity: 0, totalAmount: 0 },
    })),
}));


// v.1.1.2 =============================================

// // src/store/cart-store.ts
// "use client";

// import { create } from "zustand";

// type CartSummary = {
//   totalQuantity: number;
//   totalAmount: number;
// };

// interface CartStore {
//   summary: CartSummary;
//   setSummary: (s: CartSummary) => void;
//   reset: () => void;
// }

// export const useCartStore = create<CartStore>((set) => ({
//   summary: {
//     totalQuantity: 0,
//     totalAmount: 0,
//   },

//   setSummary: (summary) => set({ summary }),

//   reset: () =>
//     set({
//       summary: { totalQuantity: 0, totalAmount: 0 },
//     }),
// }));

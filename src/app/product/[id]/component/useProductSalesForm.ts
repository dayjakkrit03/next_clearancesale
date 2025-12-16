// v.1.1.7 ==========================================================

// v.1.1.7 ==========================================================

// v.1.1.6 ===========================================================
// src/app/product/[id]/component/useProductSalesForm.ts
// (แก้ TS7006: Parameter 'p' implicitly has an 'any' type.)

"use client";

import { useMemo, useState } from "react";

type UIProduct = any;
type CardPartsVisibility = any;

type RollPairLike = { length?: unknown; len?: unknown; stock?: unknown };

// ===== Helpers =====
const getOriginalPrice = (price: number, discountPercent?: number) => {
  if (!discountPercent || discountPercent <= 0) return undefined;
  const original = price / (1 - discountPercent / 100);
  return Math.round(original);
};

// normalise salesType / type -> "CUT" | "ROLL" | null
const getSalesType = (cond: any): "CUT" | "ROLL" | null => {
  if (!cond) return null;
  const raw = cond.salesType ?? cond.type;
  if (!raw) return null;
  const t = String(raw).toUpperCase();
  if (t === "CUT" || t === "ROLL") return t;
  return null;
};
// ====================

export function useProductSalesForm(
  product: UIProduct,
  visibleParts: CardPartsVisibility,
  hasConditions: boolean,
  options?: {
    initialQuantity?: number;
    initialSalesMode?: "CUT" | "ROLL" | null;
    initialCutLength?: number | null;
    initialRollLength?: number | null;
  },
) {
  const conditions: any[] = Array.isArray(product?.conditions)
    ? (product.conditions as any[])
    : [];

  const firstCond = hasConditions ? conditions[0] : undefined;

  // --- Sales mode & unit ---
  const autoSalesMode = getSalesType(firstCond);
  const [salesMode] = useState<"CUT" | "ROLL" | null>(() => {
    if (options?.initialSalesMode) return options.initialSalesMode;
    return autoSalesMode;
  });

  const [unit] = useState<string>(
    () => (firstCond?.unit ?? product.uom ?? "M.") as string,
  );

  const originalPrice = useMemo(
    () => getOriginalPrice(product.price, product.discountPercent),
    [product.price, product.discountPercent],
  );
  const showDiscountBadge =
    (visibleParts.discountBadge ?? true) && (product.discountPercent ?? 0) > 0;

  // --- CUT Logic ---
  const cutCond = (conditions ?? []).find(
    (c: any) => getSalesType(c) === "CUT",
  ) as any;

  const cutMinimum =
    typeof cutCond?.minimumLength === "number" && cutCond.minimumLength > 0
      ? cutCond.minimumLength
      : 1;

  const cutStepOptions: number[] = Array.isArray(cutCond?.cutStepOptions)
    ? (cutCond.cutStepOptions as number[])
    : Array.isArray((cutCond as any)?.stepOptions)
    ? ((cutCond as any).stepOptions as number[])
    : [];

  const [cutLength, setCutLength] = useState<number>(() => {
    if (options?.initialCutLength != null) {
      const init = Number(options.initialCutLength);
      if (Number.isFinite(init) && init > 0) {
        return Math.max(cutMinimum, init);
      }
    }
    return cutMinimum;
  });

  // --- ROLL Logic ---
  const rollCond = useMemo(() => {
    return (conditions ?? []).find(
      (c: any) => getSalesType(c) === "ROLL",
    ) as any;
  }, [conditions]);

  const rollPairs = useMemo(() => {
    if (Array.isArray(rollCond?.rollPairs)) {
      return (rollCond.rollPairs as RollPairLike[]).map((p: RollPairLike) => ({
        len: Number((p.length ?? p.len ?? 0) as any),
        stock: Number((p.stock ?? 0) as any),
      }));
    }

    const lens: number[] = rollCond?.rollLengths ?? [];
    const stocks: (number | string)[] = rollCond?.rollStocks ?? [];

    return lens.map((len: number, i: number) => ({
      len,
      stock: Number(stocks[i] ?? 0),
    }));
  }, [rollCond]);

  const [rollLength, setRollLength] = useState<number | null>(() => {
    if (options?.initialRollLength != null) {
      const totalInit = Number(options.initialRollLength);
      if (Number.isFinite(totalInit) && totalInit > 0) return totalInit;
    }

    if (Array.isArray(rollCond?.rollLengths) && rollCond.rollLengths.length) {
      return rollCond.rollLengths[0];
    }

    if (Array.isArray(rollCond?.rollPairs) && rollCond.rollPairs.length) {
      const p = rollCond.rollPairs[0] as RollPairLike;
      return Number((p.length ?? p.len ?? 0) as any) || null;
    }

    return null;
  });

  const selectedRollStock = useMemo(() => {
    if (!rollCond || !rollLength) return null;

    if (Array.isArray(rollCond.rollPairs)) {
      const found = (rollCond.rollPairs as RollPairLike[]).find(
        (p: RollPairLike) =>
          Number((p.length ?? p.len ?? 0) as any) === Number(rollLength ?? 0),
      );
      return found ? Number((found.stock ?? 0) as any) : null;
    }

    const idx = (rollCond.rollLengths ?? []).findIndex(
      (l: number) => l === rollLength,
    );
    return idx >= 0 ? Number(rollCond.rollStocks?.[idx] ?? 0) : null;
  }, [rollCond, rollLength]);

  // --- Quantity & Calculations ---
  const initialQty = Math.max(1, Number(options?.initialQuantity ?? 1));
  const [quantity, setQuantity] = useState(() => initialQty);

  const lengthPerItem = useMemo(() => {
    if (!hasConditions || !salesMode) return 1;
    if (salesMode === "CUT") return Math.max(cutMinimum, Number(cutLength));
    if (salesMode === "ROLL") return Math.max(1, Number(rollLength ?? 1));
    return 1;
  }, [hasConditions, salesMode, cutLength, rollLength, cutMinimum]);

  const totalLength = useMemo(
    () => Math.max(1, Number(lengthPerItem)) * Math.max(1, Number(quantity)),
    [lengthPerItem, quantity],
  );

  const totalPrice = useMemo(() => {
    if (hasConditions && salesMode)
      return totalLength * Number(product.price ?? 0);
    return Math.max(1, Number(quantity)) * Number(product.price ?? 0);
  }, [hasConditions, salesMode, totalLength, quantity, product.price]);

  const rawClearanceQty = (product as any).clearanceQuantity;
  const clearanceQty =
    typeof rawClearanceQty === "number"
      ? rawClearanceQty
      : rawClearanceQty != null
      ? Number(rawClearanceQty)
      : null;

  const noStock = clearanceQty != null && clearanceQty <= 0;

  const maxQtyForCut = useMemo(() => {
    if (!hasConditions || salesMode !== "CUT") return null;
    if (clearanceQty == null || clearanceQty <= 0) return 0;
    const perItem = Math.max(cutMinimum, cutLength || cutMinimum);
    if (perItem <= 0) return 0;
    return Math.floor(clearanceQty / perItem);
  }, [hasConditions, salesMode, clearanceQty, cutMinimum, cutLength]);

  const handleCutStep = (delta: number) => {
    if (!hasConditions || salesMode !== "CUT") return;
    if (noStock) return;

    const fromCart = options?.initialQuantity != null;

    setCutLength((prev) => {
      let next = prev + delta;
      if (next < cutMinimum) next = cutMinimum;

      if (!fromCart && clearanceQty != null && clearanceQty > 0) {
        const maxLenForCurrentQty = Math.floor(
          clearanceQty / Math.max(1, quantity),
        );
        if (next > maxLenForCurrentQty) {
          next = Math.max(cutMinimum, maxLenForCurrentQty);
        }
      }

      return next;
    });
  };

  const handleQuantityChange = (change: number) => {
    let next = Math.max(1, quantity + change);

    if (salesMode === "ROLL" && selectedRollStock != null) {
      next = Math.min(next, Math.max(0, selectedRollStock));
    } else if ((!hasConditions || !salesMode) && clearanceQty != null) {
      next = Math.min(next, Math.max(1, clearanceQty));
    } else if (salesMode === "CUT" && maxQtyForCut != null) {
      next = Math.min(next, Math.max(0, maxQtyForCut));
    }

    setQuantity(next);
  };

  const isStockAvailable =
    salesMode === "ROLL"
      ? selectedRollStock != null && selectedRollStock > 0
      : clearanceQty == null || clearanceQty > 0;

  return {
    salesMode,
    unit,
    originalPrice,
    showDiscountBadge,
    cutMinimum,
    cutStepOptions,
    cutLength,
    rollPairs,
    rollLength,
    selectedRollStock,
    quantity,
    lengthPerItem,
    totalLength,
    totalPrice,
    clearanceQty,
    noStock,
    maxQtyForCut,
    isStockAvailable,
    setRollLength,
    handleCutStep,
    handleQuantityChange,
  };
}

// v.1.1.6 ==========================================================

// v.1.1.5 ============================================================
// // src/app/product/[id]/component/useProductSalesForm.ts
// "use client";

// import { useMemo, useState } from "react";

// type UIProduct = any;
// type CardPartsVisibility = any;

// // ===== Helpers =====
// const getOriginalPrice = (price: number, discountPercent?: number) => {
//   if (!discountPercent || discountPercent <= 0) return undefined;
//   const original = price / (1 - discountPercent / 100);
//   return Math.round(original);
// };

// // normalise salesType / type -> "CUT" | "ROLL" | null
// const getSalesType = (cond: any): "CUT" | "ROLL" | null => {
//   if (!cond) return null;
//   const raw = cond.salesType ?? cond.type;
//   if (!raw) return null;
//   const t = String(raw).toUpperCase();
//   if (t === "CUT" || t === "ROLL") return t;
//   return null;
// };
// // ====================

// export function useProductSalesForm(
//   product: UIProduct,
//   visibleParts: CardPartsVisibility,
//   hasConditions: boolean,
//   options?: {
//     initialQuantity?: number;
//     initialSalesMode?: "CUT" | "ROLL" | null;
//     initialCutLength?: number | null;
//     initialRollLength?: number | null;
//   },
// ) {
//   const conditions: any[] = Array.isArray(product?.conditions)
//     ? (product.conditions as any[])
//     : [];

//   const firstCond = hasConditions ? conditions[0] : undefined;

//   // --- Sales mode & unit ---
//   const autoSalesMode = getSalesType(firstCond);
//   const [salesMode] = useState<"CUT" | "ROLL" | null>(() => {
//     if (options?.initialSalesMode) return options.initialSalesMode;
//     return autoSalesMode;
//   });

//   const [unit] = useState<string>(
//     () => (firstCond?.unit ?? product.uom ?? "M.") as string,
//   );

//   const originalPrice = useMemo(
//     () => getOriginalPrice(product.price, product.discountPercent),
//     [product.price, product.discountPercent],
//   );
//   const showDiscountBadge =
//     (visibleParts.discountBadge ?? true) && (product.discountPercent ?? 0) > 0;

//   // --- CUT Logic ---
//   const cutCond = (conditions ?? []).find(
//     (c: any) => getSalesType(c) === "CUT",
//   ) as any;

//   const cutMinimum =
//     typeof cutCond?.minimumLength === "number" && cutCond.minimumLength > 0
//       ? cutCond.minimumLength
//       : 1;

//   const cutStepOptions: number[] = Array.isArray(cutCond?.cutStepOptions)
//     ? (cutCond.cutStepOptions as number[])
//     : Array.isArray((cutCond as any)?.stepOptions)
//     ? ((cutCond as any).stepOptions as number[])
//     : [];

//   const [cutLength, setCutLength] = useState<number>(() => {
//     if (options?.initialCutLength != null) {
//       const init = Number(options.initialCutLength);
//       if (Number.isFinite(init) && init > 0) {
//         return Math.max(cutMinimum, init);
//       }
//     }
//     return cutMinimum;
//   });

//   // --- ROLL Logic ---
//   const rollCond = useMemo(() => {
//     return (conditions ?? []).find(
//       (c: any) => getSalesType(c) === "ROLL",
//     ) as any;
//   }, [conditions]);

//   const rollPairs = useMemo(() => {
//     if (Array.isArray(rollCond?.rollPairs)) {
//       return rollCond.rollPairs.map((p: any) => ({
//         len: Number(p.length ?? p.len ?? 0),
//         stock: Number(p.stock ?? 0),
//       }));
//     }

//     const lens: number[] = rollCond?.rollLengths ?? [];
//     const stocks: (number | string)[] = rollCond?.rollStocks ?? [];

//     return lens.map((len: number, i: number) => ({
//       len,
//       stock: Number(stocks[i] ?? 0),
//     }));
//   }, [rollCond]);

//   const [rollLength, setRollLength] = useState<number | null>(() => {
//     if (options?.initialRollLength != null) {
//       const init = Number(options.initialRollLength);
//       if (Number.isFinite(init) && init > 0) return init;
//     }

//     if (Array.isArray(rollCond?.rollLengths) && rollCond.rollLengths.length) {
//       return rollCond.rollLengths[0];
//     }

//     if (Array.isArray(rollCond?.rollPairs) && rollCond.rollPairs.length) {
//       const p: any = rollCond.rollPairs[0];
//       return Number(p.length ?? p.len ?? 0) || null;
//     }

//     return null;
//   });

//   const selectedRollStock = useMemo(() => {
//     if (!rollCond || !rollLength) return null;

//     if (Array.isArray(rollCond.rollPairs)) {
//       const found = rollCond.rollPairs.find(
//         (p: any) => Number(p.length ?? p.len ?? 0) === Number(rollLength ?? 0),
//       );
//       return found ? Number(found.stock ?? 0) : null;
//     }

//     const idx = (rollCond.rollLengths ?? []).findIndex(
//       (l: number) => l === rollLength,
//     );
//     return idx >= 0 ? Number(rollCond.rollStocks?.[idx] ?? 0) : null;
//   }, [rollCond, rollLength]);

//   // --- Quantity & Calculations ---
//   const initialQty = Math.max(1, Number(options?.initialQuantity ?? 1));
//   const [quantity, setQuantity] = useState(() => initialQty);

//   const lengthPerItem = useMemo(() => {
//     if (!hasConditions || !salesMode) return 1;
//     if (salesMode === "CUT") return Math.max(cutMinimum, Number(cutLength));
//     if (salesMode === "ROLL") return Math.max(1, Number(rollLength ?? 1));
//     return 1;
//   }, [hasConditions, salesMode, cutLength, rollLength, cutMinimum]);

//   const totalLength = useMemo(
//     () => Math.max(1, Number(lengthPerItem)) * Math.max(1, Number(quantity)),
//     [lengthPerItem, quantity],
//   );

//   const totalPrice = useMemo(() => {
//     if (hasConditions && salesMode)
//       return totalLength * Number(product.price ?? 0);
//     return Math.max(1, Number(quantity)) * Number(product.price ?? 0);
//   }, [hasConditions, salesMode, totalLength, quantity, product.price]);

//   const rawClearanceQty = (product as any).clearanceQuantity;
//   const clearanceQty =
//     typeof rawClearanceQty === "number"
//       ? rawClearanceQty
//       : rawClearanceQty != null
//       ? Number(rawClearanceQty)
//       : null;

//   const noStock = clearanceQty != null && clearanceQty <= 0;

//   const maxQtyForCut = useMemo(() => {
//     if (!hasConditions || salesMode !== "CUT") return null;
//     if (clearanceQty == null || clearanceQty <= 0) return 0;
//     const perItem = Math.max(cutMinimum, cutLength || cutMinimum);
//     if (perItem <= 0) return 0;
//     return Math.floor(clearanceQty / perItem);
//   }, [hasConditions, salesMode, clearanceQty, cutMinimum, cutLength]);

//   const handleCutStep = (delta: number) => {
//     if (!hasConditions || salesMode !== "CUT") return;
//     if (noStock) return;

//     const fromCart = options?.initialQuantity != null;

//     setCutLength((prev) => {
//       let next = prev + delta;
//       if (next < cutMinimum) next = cutMinimum;

//       if (!fromCart && clearanceQty != null && clearanceQty > 0) {
//         const maxLenForCurrentQty = Math.floor(
//           clearanceQty / Math.max(1, quantity),
//         );
//         if (next > maxLenForCurrentQty) {
//           next = Math.max(cutMinimum, maxLenForCurrentQty);
//         }
//       }

//       return next;
//     });
//   };

//   const handleQuantityChange = (change: number) => {
//     let next = Math.max(1, quantity + change);

//     if (salesMode === "ROLL" && selectedRollStock != null) {
//       next = Math.min(next, Math.max(0, selectedRollStock));
//     } else if ((!hasConditions || !salesMode) && clearanceQty != null) {
//       next = Math.min(next, Math.max(1, clearanceQty));
//     } else if (salesMode === "CUT" && maxQtyForCut != null) {
//       next = Math.min(next, Math.max(0, maxQtyForCut));
//     }

//     setQuantity(next);
//   };

//   const isStockAvailable =
//     salesMode === "ROLL"
//       ? selectedRollStock != null && selectedRollStock > 0
//       : clearanceQty == null || clearanceQty > 0;

//   return {
//     salesMode,
//     unit,
//     originalPrice,
//     showDiscountBadge,
//     cutMinimum,
//     cutStepOptions,
//     cutLength,
//     rollPairs,
//     rollLength,
//     selectedRollStock,
//     quantity,
//     lengthPerItem,
//     totalLength,
//     totalPrice,
//     clearanceQty,
//     noStock,
//     maxQtyForCut,
//     isStockAvailable,
//     setRollLength,
//     handleCutStep,
//     handleQuantityChange,
//   };
// }


// v.1.1.5 ============================================================

// v.1.1.4 ============================================================
// // src/app/product/[id]/component/useProductSalesForm.ts

// "use client";

// import { useMemo, useState } from "react";

// type UIProduct = any;
// type CardPartsVisibility = any;

// // ===== Helpers =====
// const getOriginalPrice = (price: number, discountPercent?: number) => {
//   if (!discountPercent || discountPercent <= 0) return undefined;
//   const original = price / (1 - discountPercent / 100);
//   return Math.round(original);
// };

// // normalise salesType / type -> "CUT" | "ROLL" | null
// const getSalesType = (cond: any): "CUT" | "ROLL" | null => {
//   if (!cond) return null;
//   const raw = cond.salesType ?? cond.type;
//   if (!raw) return null;
//   const t = String(raw).toUpperCase();
//   if (t === "CUT" || t === "ROLL") return t;
//   return null;
// };
// // ====================

// export function useProductSalesForm(
//   product: UIProduct,
//   visibleParts: CardPartsVisibility,
//   hasConditions: boolean,
//   options?: {
//     /** ใช้ตอนเปิดจาก Cart: ให้ quantity เริ่มต้นเท่ากับที่อยู่ในตะกร้า */
//     initialQuantity?: number;
//     /** ใช้ตอนเปิดจาก Cart: mode เริ่มต้น (CUT / ROLL) */
//     initialSalesMode?: "CUT" | "ROLL" | null;
//     /** ใช้ตอนเปิดจาก Cart: ความยาวเริ่มต้นในโหมด CUT */
//     initialCutLength?: number | null;
//     /** ใช้ตอนเปิดจาก Cart: ความยาวม้วนเริ่มต้นในโหมด ROLL */
//     initialRollLength?: number | null;
//   },
// ) {
//   const conditions: any[] = Array.isArray(product?.conditions)
//     ? (product.conditions as any[])
//     : [];

//   const firstCond = hasConditions ? conditions[0] : undefined;

//   // --- Sales mode & unit ---
//   const autoSalesMode = getSalesType(firstCond);
//   const [salesMode] = useState<"CUT" | "ROLL" | null>(() => {
//     if (options?.initialSalesMode) return options.initialSalesMode;
//     return autoSalesMode;
//   });

//   const [unit] = useState<string>(
//     () => (firstCond?.unit ?? product.uom ?? "M.") as string,
//   );

//   const originalPrice = useMemo(
//     () => getOriginalPrice(product.price, product.discountPercent),
//     [product.price, product.discountPercent],
//   );
//   const showDiscountBadge =
//     (visibleParts.discountBadge ?? true) && (product.discountPercent ?? 0) > 0;

//   // --- CUT Logic ---
//   const cutCond = (conditions ?? []).find(
//     (c: any) => getSalesType(c) === "CUT",
//   ) as any;

//   const cutMinimum =
//     typeof cutCond?.minimumLength === "number" && cutCond.minimumLength > 0
//       ? cutCond.minimumLength
//       : 1;

//   const cutStepOptions: number[] = Array.isArray(cutCond?.cutStepOptions)
//     ? (cutCond.cutStepOptions as number[])
//     : Array.isArray((cutCond as any)?.stepOptions)
//     ? ((cutCond as any).stepOptions as number[])
//     : [];

//   const [cutLength, setCutLength] = useState<number>(() => {
//     if (options?.initialCutLength != null) {
//       const init = Number(options.initialCutLength);
//       if (Number.isFinite(init) && init > 0) {
//         return Math.max(cutMinimum, init);
//       }
//     }
//     return cutMinimum;
//   });

//   // --- ROLL Logic ---
//   const rollCond = useMemo(() => {
//     return (conditions ?? []).find(
//       (c: any) => getSalesType(c) === "ROLL",
//     ) as any;
//   }, [conditions]);

//   const rollPairs = useMemo(() => {
//     // กรณี shape ใหม่จาก DB: rollPairs: [{ length, stock }]
//     if (Array.isArray(rollCond?.rollPairs)) {
//       return rollCond.rollPairs.map((p: any) => ({
//         len: Number(p.length ?? p.len ?? 0),
//         stock: Number(p.stock ?? 0),
//       }));
//     }

//     // shape เดิม: rollLengths + rollStocks
//     const lens: number[] = rollCond?.rollLengths ?? [];
//     const stocks: (number | string)[] = rollCond?.rollStocks ?? [];

//     return lens.map((len: number, i: number) => ({
//       len,
//       stock: Number(stocks[i] ?? 0),
//     }));
//   }, [rollCond]);

//   const [rollLength, setRollLength] = useState<number | null>(() => {
//     if (options?.initialRollLength != null) {
//       const init = Number(options.initialRollLength);
//       if (Number.isFinite(init) && init > 0) return init;
//     }

//     if (Array.isArray(rollCond?.rollLengths) && rollCond.rollLengths.length) {
//       return rollCond.rollLengths[0];
//     }

//     if (Array.isArray(rollCond?.rollPairs) && rollCond.rollPairs.length) {
//       const p = rollCond.rollPairs[0];
//       return Number(p.length ?? p.len ?? 0) || null;
//     }

//     return null;
//   });

//   const selectedRollStock = useMemo(() => {
//     if (!rollCond || !rollLength) return null;

//     // ถ้ามี rollPairs ให้หา stock จากตรงนี้
//     if (Array.isArray(rollCond.rollPairs)) {
//       const found = rollCond.rollPairs.find(
//         (p: any) =>
//           Number(p.length ?? p.len ?? 0) === Number(rollLength ?? 0),
//       );
//       return found ? Number(found.stock ?? 0) : null;
//     }

//     // shape เดิม rollLengths / rollStocks
//     const idx = (rollCond.rollLengths ?? []).findIndex(
//       (l: number) => l === rollLength,
//     );
//     return idx >= 0 ? Number(rollCond.rollStocks?.[idx] ?? 0) : null;
//   }, [rollCond, rollLength]);

//   // --- Quantity & Calculations ---
//   const initialQty = Math.max(1, Number(options?.initialQuantity ?? 1));
//   const [quantity, setQuantity] = useState(() => initialQty);

//   const lengthPerItem = useMemo(() => {
//     if (!hasConditions || !salesMode) return 1;
//     if (salesMode === "CUT") return Math.max(cutMinimum, Number(cutLength));
//     if (salesMode === "ROLL") return Math.max(1, Number(rollLength ?? 1));
//     return 1;
//   }, [hasConditions, salesMode, cutLength, rollLength, cutMinimum]);

//   const totalLength = useMemo(
//     () =>
//       Math.max(1, Number(lengthPerItem)) * Math.max(1, Number(quantity)),
//     [lengthPerItem, quantity],
//   );

//   const totalPrice = useMemo(() => {
//     if (hasConditions && salesMode)
//       return totalLength * Number(product.price ?? 0);
//     return Math.max(1, Number(quantity)) * Number(product.price ?? 0);
//   }, [hasConditions, salesMode, totalLength, quantity, product.price]);

//   // ✅ clearanceQuantity จาก product
//   const rawClearanceQty = (product as any).clearanceQuantity;
//   const clearanceQty =
//     typeof rawClearanceQty === "number"
//       ? rawClearanceQty
//       : rawClearanceQty != null
//       ? Number(rawClearanceQty)
//       : null;

//   const noStock = clearanceQty != null && clearanceQty <= 0;

//   const maxQtyForCut = useMemo(() => {
//     if (!hasConditions || salesMode !== "CUT") return null;
//     if (clearanceQty == null || clearanceQty <= 0) return 0;
//     const perItem = Math.max(cutMinimum, cutLength || cutMinimum);
//     if (perItem <= 0) return 0;
//     return Math.floor(clearanceQty / perItem);
//   }, [hasConditions, salesMode, clearanceQty, cutMinimum, cutLength]);

//   // --- Handlers ---
//   const handleCutStep = (delta: number) => {
//     if (!hasConditions || salesMode !== "CUT") return;
//     if (noStock) return;

//     const fromCart = options?.initialQuantity != null;

//     setCutLength((prev) => {
//       let next = prev + delta;
//       if (next < cutMinimum) next = cutMinimum;

//       // 🟩 ถ้าเรียกจาก Product Detail (ไม่ใช่ Cart) → จำกัดด้วย stock
//       if (!fromCart && clearanceQty != null && clearanceQty > 0) {
//         const maxLenForCurrentQty = Math.floor(
//           clearanceQty / Math.max(1, quantity),
//         );
//         if (next > maxLenForCurrentQty) {
//           next = Math.max(cutMinimum, maxLenForCurrentQty);
//         }
//       }

//       // 🟦 ถ้าเรียกจาก Cart → ยังไม่บังคับ limit ตาม stock เพื่อให้ปุ่มทำงานก่อน
//       return next;
//     });
//   };

//   const handleQuantityChange = (change: number) => {
//     let next = Math.max(1, quantity + change);

//     if (salesMode === "ROLL" && selectedRollStock != null) {
//       next = Math.min(next, Math.max(0, selectedRollStock));
//     } else if ((!hasConditions || !salesMode) && clearanceQty != null) {
//       next = Math.min(next, Math.max(1, clearanceQty));
//     } else if (salesMode === "CUT" && maxQtyForCut != null) {
//       next = Math.min(next, Math.max(0, maxQtyForCut));
//     }

//     setQuantity(next);
//   };

//   const isStockAvailable =
//     salesMode === "ROLL"
//       ? selectedRollStock != null && selectedRollStock > 0
//       : clearanceQty == null || clearanceQty > 0;

//   return {
//     // state / derived
//     salesMode,
//     unit,
//     originalPrice,
//     showDiscountBadge,
//     cutMinimum,
//     cutStepOptions,
//     cutLength,
//     rollPairs,
//     rollLength,
//     selectedRollStock,
//     quantity,
//     lengthPerItem,
//     totalLength,
//     totalPrice,
//     clearanceQty,
//     noStock,
//     maxQtyForCut,
//     isStockAvailable,
//     // handlers
//     setRollLength,
//     handleCutStep,
//     handleQuantityChange,
//   };
// }

// v.1.1.4 ============================================================

// v.1.1.3 ============================================================
// // src/app/product/[id]/component/useProductSalesForm.ts

// "use client";

// import { useMemo, useState } from "react";

// type UIProduct = any;
// type CardPartsVisibility = any;

// // ===== Helpers =====
// const getOriginalPrice = (price: number, discountPercent?: number) => {
//   if (!discountPercent || discountPercent <= 0) return undefined;
//   const original = price / (1 - discountPercent / 100);
//   return Math.round(original);
// };

// // normalise salesType / type -> "CUT" | "ROLL" | null
// const getSalesType = (cond: any): "CUT" | "ROLL" | null => {
//   if (!cond) return null;
//   const raw = cond.salesType ?? cond.type;
//   if (!raw) return null;
//   const t = String(raw).toUpperCase();
//   if (t === "CUT" || t === "ROLL") return t;
//   return null;
// };
// // ====================

// export function useProductSalesForm(
//   product: UIProduct,
//   visibleParts: CardPartsVisibility,
//   hasConditions: boolean,
//   options?: {
//     /** ใช้ตอนเปิดจาก Cart: ให้ quantity เริ่มต้นเท่ากับที่อยู่ในตะกร้า */
//     initialQuantity?: number;
//     /** ใช้ตอนเปิดจาก Cart: mode เริ่มต้น (CUT / ROLL) */
//     initialSalesMode?: "CUT" | "ROLL" | null;
//     /** ใช้ตอนเปิดจาก Cart: ความยาวเริ่มต้นในโหมด CUT */
//     initialCutLength?: number | null;
//     /** ใช้ตอนเปิดจาก Cart: ความยาวม้วนเริ่มต้นในโหมด ROLL */
//     initialRollLength?: number | null;
//   },
// ) {
//   const conditions: any[] = Array.isArray(product?.conditions)
//     ? (product.conditions as any[])
//     : [];

//   const firstCond = hasConditions ? conditions[0] : undefined;

//   // --- Sales mode & unit ---
//   const autoSalesMode = getSalesType(firstCond);
//   const [salesMode] = useState<"CUT" | "ROLL" | null>(() => {
//     if (options?.initialSalesMode) return options.initialSalesMode;
//     return autoSalesMode;
//   });

//   const [unit] = useState<string>(
//     () => (firstCond?.unit ?? product.uom ?? "M.") as string,
//   );

//   const originalPrice = useMemo(
//     () => getOriginalPrice(product.price, product.discountPercent),
//     [product.price, product.discountPercent],
//   );
//   const showDiscountBadge =
//     (visibleParts.discountBadge ?? true) && (product.discountPercent ?? 0) > 0;

//   // --- CUT Logic ---
//   const cutCond = (conditions ?? []).find(
//     (c: any) => getSalesType(c) === "CUT",
//   ) as any;

//   const cutMinimum =
//     typeof cutCond?.minimumLength === "number" && cutCond.minimumLength > 0
//       ? cutCond.minimumLength
//       : 1;

//   const cutStepOptions: number[] = Array.isArray(cutCond?.cutStepOptions)
//     ? (cutCond.cutStepOptions as number[])
//     : Array.isArray((cutCond as any)?.stepOptions)
//     ? ((cutCond as any).stepOptions as number[])
//     : [];

//   const [cutLength, setCutLength] = useState<number>(() => {
//     if (options?.initialCutLength != null) {
//       const init = Number(options.initialCutLength);
//       if (Number.isFinite(init) && init > 0) {
//         return Math.max(cutMinimum, init);
//       }
//     }
//     return cutMinimum;
//   });

//   // --- ROLL Logic ---
//   const rollCond = useMemo(() => {
//     return (conditions ?? []).find(
//       (c: any) => getSalesType(c) === "ROLL",
//     ) as any;
//   }, [conditions]);

//   const rollPairs = useMemo(() => {
//     // กรณี shape ใหม่จาก DB: rollPairs: [{ length, stock }]
//     if (Array.isArray(rollCond?.rollPairs)) {
//       return rollCond.rollPairs.map((p: any) => ({
//         len: Number(p.length ?? p.len ?? 0),
//         stock: Number(p.stock ?? 0),
//       }));
//     }

//     // shape เดิม: rollLengths + rollStocks
//     const lens: number[] = rollCond?.rollLengths ?? [];
//     const stocks: (number | string)[] = rollCond?.rollStocks ?? [];

//     return lens.map((len: number, i: number) => ({
//       len,
//       stock: Number(stocks[i] ?? 0),
//     }));
//   }, [rollCond]);

//   const [rollLength, setRollLength] = useState<number | null>(() => {
//     if (options?.initialRollLength != null) {
//       const init = Number(options.initialRollLength);
//       if (Number.isFinite(init) && init > 0) return init;
//     }

//     if (Array.isArray(rollCond?.rollLengths) && rollCond.rollLengths.length) {
//       return rollCond.rollLengths[0];
//     }

//     if (Array.isArray(rollCond?.rollPairs) && rollCond.rollPairs.length) {
//       const p = rollCond.rollPairs[0];
//       return Number(p.length ?? p.len ?? 0) || null;
//     }

//     return null;
//   });

//   const selectedRollStock = useMemo(() => {
//     if (!rollCond || !rollLength) return null;

//     // ถ้ามี rollPairs ให้หา stock จากตรงนี้
//     if (Array.isArray(rollCond.rollPairs)) {
//       const found = rollCond.rollPairs.find(
//         (p: any) =>
//           Number(p.length ?? p.len ?? 0) === Number(rollLength ?? 0),
//       );
//       return found ? Number(found.stock ?? 0) : null;
//     }

//     // shape เดิม rollLengths / rollStocks
//     const idx = (rollCond.rollLengths ?? []).findIndex(
//       (l: number) => l === rollLength,
//     );
//     return idx >= 0 ? Number(rollCond.rollStocks?.[idx] ?? 0) : null;
//   }, [rollCond, rollLength]);

//   // --- Quantity & Calculations ---
//   const [quantity, setQuantity] = useState(() =>
//     Math.max(1, Number(options?.initialQuantity ?? 1)),
//   );

//   const lengthPerItem = useMemo(() => {
//     if (!hasConditions || !salesMode) return 1;
//     if (salesMode === "CUT") return Math.max(cutMinimum, Number(cutLength));
//     if (salesMode === "ROLL") return Math.max(1, Number(rollLength ?? 1));
//     return 1;
//   }, [hasConditions, salesMode, cutLength, rollLength, cutMinimum]);

//   const totalLength = useMemo(
//     () =>
//       Math.max(1, Number(lengthPerItem)) * Math.max(1, Number(quantity)),
//     [lengthPerItem, quantity],
//   );

//   const totalPrice = useMemo(() => {
//     if (hasConditions && salesMode)
//       return totalLength * Number(product.price ?? 0);
//     return Math.max(1, Number(quantity)) * Number(product.price ?? 0);
//   }, [hasConditions, salesMode, totalLength, quantity, product.price]);

//   // ✅ clearanceQuantity จาก product
//   const rawClearanceQty = (product as any).clearanceQuantity;
//   const clearanceQty =
//     typeof rawClearanceQty === "number"
//       ? rawClearanceQty
//       : rawClearanceQty != null
//       ? Number(rawClearanceQty)
//       : null;

//   const noStock = clearanceQty != null && clearanceQty <= 0;

//   const maxQtyForCut = useMemo(() => {
//     if (!hasConditions || salesMode !== "CUT") return null;
//     if (clearanceQty == null || clearanceQty <= 0) return 0;
//     const perItem = Math.max(cutMinimum, cutLength || cutMinimum);
//     if (perItem <= 0) return 0;
//     return Math.floor(clearanceQty / perItem);
//   }, [hasConditions, salesMode, clearanceQty, cutMinimum, cutLength]);

//   // --- Handlers ---
//   const handleCutStep = (delta: number) => {
//     if (!hasConditions || salesMode !== "CUT") return;
//     if (noStock) return;
//     setCutLength((prev) => {
//       let next = prev + delta;
//       if (next < cutMinimum) next = cutMinimum;

//       if (clearanceQty != null && clearanceQty > 0) {
//         const maxLenForCurrentQty = Math.floor(
//           clearanceQty / Math.max(1, quantity),
//         );
//         if (next > maxLenForCurrentQty) {
//           next = Math.max(cutMinimum, maxLenForCurrentQty);
//         }
//       }
//       return next;
//     });
//   };

//   const handleQuantityChange = (change: number) => {
//     let next = Math.max(1, quantity + change);

//     if (salesMode === "ROLL" && selectedRollStock != null) {
//       next = Math.min(next, Math.max(0, selectedRollStock));
//     } else if ((!hasConditions || !salesMode) && clearanceQty != null) {
//       next = Math.min(next, Math.max(1, clearanceQty));
//     } else if (salesMode === "CUT" && maxQtyForCut != null) {
//       next = Math.min(next, Math.max(0, maxQtyForCut));
//     }

//     setQuantity(next);
//   };

//   const isStockAvailable =
//     salesMode === "ROLL"
//       ? selectedRollStock != null && selectedRollStock > 0
//       : clearanceQty == null || clearanceQty > 0;

//   return {
//     // state / derived
//     salesMode,
//     unit,
//     originalPrice,
//     showDiscountBadge,
//     cutMinimum,
//     cutStepOptions,
//     cutLength,
//     rollPairs,
//     rollLength,
//     selectedRollStock,
//     quantity,
//     lengthPerItem,
//     totalLength,
//     totalPrice,
//     clearanceQty,
//     noStock,
//     maxQtyForCut,
//     isStockAvailable,
//     // handlers
//     setRollLength,
//     handleCutStep,
//     handleQuantityChange,
//   };
// }

// v.1.1.3 ============================================================

// v.1.1.2 ============================================================
// // src/app/product/[id]/component/useProductSalesForm.ts

// "use client";

// import { useMemo, useState } from "react";

// type UIProduct = any;
// type CardPartsVisibility = any;

// // ===== Helpers =====
// const getOriginalPrice = (price: number, discountPercent?: number) => {
//   if (!discountPercent || discountPercent <= 0) return undefined;
//   const original = price / (1 - discountPercent / 100);
//   return Math.round(original);
// };
// // ====================

// export function useProductSalesForm(
//   product: UIProduct,
//   visibleParts: CardPartsVisibility,
//   hasConditions: boolean,
//   options?: {
//     /** ใช้ตอนเปิดจาก Cart: ให้ quantity เริ่มต้นเท่ากับที่อยู่ในตะกร้า */
//     initialQuantity?: number;
//   },
// ) {
//   // Sales Condition State Logic
//   const firstCond = hasConditions ? (product.conditions![0] as any) : undefined;
//   const [salesMode] = useState<"CUT" | "ROLL" | null>(
//     () => firstCond?.salesType ?? null,
//   );
//   const [unit] = useState<string>(
//     () => (firstCond?.unit ?? product.uom ?? "M.") as string,
//   );

//   const originalPrice = useMemo(
//     () => getOriginalPrice(product.price, product.discountPercent),
//     [product.price, product.discountPercent],
//   );
//   const showDiscountBadge =
//     (visibleParts.discountBadge ?? true) && (product.discountPercent ?? 0) > 0;

//   // --- CUT Logic ---
//   const cutCond = (product.conditions ?? []).find(
//     (c: any) => c.salesType === "CUT",
//   ) as any;

//   const cutMinimum =
//     typeof cutCond?.minimumLength === "number" && cutCond.minimumLength > 0
//       ? cutCond.minimumLength
//       : 1;

//   const cutStepOptions: number[] = Array.isArray(cutCond?.cutStepOptions)
//     ? (cutCond!.cutStepOptions as number[])
//     : Array.isArray((cutCond as any)?.stepOptions)
//     ? ((cutCond as any).stepOptions as number[])
//     : [];

//   const [cutLength, setCutLength] = useState<number>(() => cutMinimum);

//   // --- ROLL Logic ---
//   const rollCond = useMemo(() => {
//     return (product?.conditions ?? []).find(
//       (c: any) => c.salesType === "ROLL",
//     ) as any;
//   }, [product]);

//   const rollPairs = useMemo(() => {
//     const lens: number[] = rollCond?.rollLengths ?? [];
//     const stocks: (number | string)[] = rollCond?.rollStocks ?? [];

//     return lens.map((len: number, i: number) => ({
//       len,
//       stock: Number(stocks[i] ?? 0),
//     }));
//   }, [rollCond]);

//   const [rollLength, setRollLength] = useState<number | null>(() => {
//     if (rollCond?.rollLengths?.length) return rollCond.rollLengths[0];
//     return null;
//   });

//   const selectedRollStock = useMemo(() => {
//     if (!rollCond || !rollLength) return null;
//     const idx = (rollCond.rollLengths ?? []).findIndex(
//       (l: number) => l === rollLength,
//     );
//     return idx >= 0 ? Number(rollCond.rollStocks?.[idx] ?? 0) : null;
//   }, [rollCond, rollLength]);

//   // --- Quantity & Calculations ---
//   const [quantity, setQuantity] = useState(() =>
//     Math.max(1, Number(options?.initialQuantity ?? 1)),
//   );

//   const lengthPerItem = useMemo(() => {
//     if (!hasConditions || !salesMode) return 1;
//     if (salesMode === "CUT") return Math.max(cutMinimum, Number(cutLength));
//     if (salesMode === "ROLL") return Math.max(1, Number(rollLength ?? 1));
//     return 1;
//   }, [hasConditions, salesMode, cutLength, rollLength, cutMinimum]);

//   const totalLength = useMemo(
//     () =>
//       Math.max(1, Number(lengthPerItem)) * Math.max(1, Number(quantity)),
//     [lengthPerItem, quantity],
//   );
//   const totalPrice = useMemo(() => {
//     if (hasConditions && salesMode)
//       return totalLength * Number(product.price ?? 0);
//     return Math.max(1, Number(quantity)) * Number(product.price ?? 0);
//   }, [hasConditions, salesMode, totalLength, quantity, product.price]);

//   // ✅ clearanceQuantity จาก product
//   const rawClearanceQty = (product as any).clearanceQuantity;
//   const clearanceQty =
//     typeof rawClearanceQty === "number"
//       ? rawClearanceQty
//       : rawClearanceQty != null
//       ? Number(rawClearanceQty)
//       : null;

//   const noStock = clearanceQty != null && clearanceQty <= 0;

//   const maxQtyForCut = useMemo(() => {
//     if (!hasConditions || salesMode !== "CUT") return null;
//     if (clearanceQty == null || clearanceQty <= 0) return 0;
//     const perItem = Math.max(cutMinimum, cutLength || cutMinimum);
//     if (perItem <= 0) return 0;
//     return Math.floor(clearanceQty / perItem);
//   }, [hasConditions, salesMode, clearanceQty, cutMinimum, cutLength]);

//   // --- Handlers ---
//   const handleCutStep = (delta: number) => {
//     if (!hasConditions || salesMode !== "CUT") return;
//     if (noStock) return;
//     setCutLength((prev) => {
//       let next = prev + delta;
//       if (next < cutMinimum) next = cutMinimum;

//       if (clearanceQty != null && clearanceQty > 0) {
//         const maxLenForCurrentQty = Math.floor(
//           clearanceQty / Math.max(1, quantity),
//         );
//         if (next > maxLenForCurrentQty) {
//           next = Math.max(cutMinimum, maxLenForCurrentQty);
//         }
//       }
//       return next;
//     });
//   };

//   const handleQuantityChange = (change: number) => {
//     let next = Math.max(1, quantity + change);

//     if (salesMode === "ROLL" && selectedRollStock != null) {
//       next = Math.min(next, Math.max(0, selectedRollStock));
//     } else if ((!hasConditions || !salesMode) && clearanceQty != null) {
//       next = Math.min(next, Math.max(1, clearanceQty));
//     } else if (salesMode === "CUT" && maxQtyForCut != null) {
//       next = Math.min(next, Math.max(0, maxQtyForCut));
//     }

//     setQuantity(next);
//   };

//   const isStockAvailable =
//     salesMode === "ROLL"
//       ? selectedRollStock != null && selectedRollStock > 0
//       : clearanceQty == null || clearanceQty > 0;

//   return {
//     // state / derived
//     salesMode,
//     unit,
//     originalPrice,
//     showDiscountBadge,
//     cutMinimum,
//     cutStepOptions,
//     cutLength,
//     rollPairs,
//     rollLength,
//     selectedRollStock,
//     quantity,
//     lengthPerItem,
//     totalLength,
//     totalPrice,
//     clearanceQty,
//     noStock,
//     maxQtyForCut,
//     isStockAvailable,
//     // handlers
//     setRollLength,
//     handleCutStep,
//     handleQuantityChange,
//   };
// }

// v.1.1.2 ============================================================

// // src/app/product/[id]/component/useProductSalesForm.ts
// "use client";

// import { useMemo, useState } from "react";

// type UIProduct = any;
// type CardPartsVisibility = any;

// // ===== Helpers =====
// const getOriginalPrice = (price: number, discountPercent?: number) => {
//   if (!discountPercent || discountPercent <= 0) return undefined;
//   const original = price / (1 - discountPercent / 100);
//   return Math.round(original);
// };
// // ====================

// export function useProductSalesForm(
//   product: UIProduct,
//   visibleParts: CardPartsVisibility,
//   hasConditions: boolean
// ) {
//   // Sales Condition State Logic
//   const firstCond = hasConditions ? (product.conditions![0] as any) : undefined;
//   const [salesMode] = useState<"CUT" | "ROLL" | null>(
//     () => firstCond?.salesType ?? null
//   );
//   const [unit] = useState<string>(
//     () => (firstCond?.unit ?? product.uom ?? "M.") as string
//   );

//   const originalPrice = useMemo(
//     () => getOriginalPrice(product.price, product.discountPercent),
//     [product.price, product.discountPercent]
//   );
//   const showDiscountBadge =
//     (visibleParts.discountBadge ?? true) && (product.discountPercent ?? 0) > 0;

//   // --- CUT Logic ---
//   const cutCond = (product.conditions ?? []).find(
//     (c: any) => c.salesType === "CUT"
//   ) as any;

//   const cutMinimum =
//     typeof cutCond?.minimumLength === "number" && cutCond.minimumLength > 0
//       ? cutCond.minimumLength
//       : 1;

//   const cutStepOptions: number[] = Array.isArray(cutCond?.cutStepOptions)
//     ? (cutCond!.cutStepOptions as number[])
//     : Array.isArray((cutCond as any)?.stepOptions)
//     ? ((cutCond as any).stepOptions as number[])
//     : [];

//   const [cutLength, setCutLength] = useState<number>(() => cutMinimum);

//   // --- ROLL Logic ---
//   const rollCond = useMemo(() => {
//     return (product?.conditions ?? []).find(
//       (c: any) => c.salesType === "ROLL"
//     ) as any;
//   }, [product]);

//   const rollPairs = useMemo(() => {
//     const lens: number[] = rollCond?.rollLengths ?? [];
//     const stocks: (number | string)[] = rollCond?.rollStocks ?? [];

//     return lens.map((len: number, i: number) => ({
//       len,
//       stock: Number(stocks[i] ?? 0),
//     }));
//   }, [rollCond]);

//   const [rollLength, setRollLength] = useState<number | null>(() => {
//     if (rollCond?.rollLengths?.length) return rollCond.rollLengths[0];
//     return null;
//   });

//   const selectedRollStock = useMemo(() => {
//     if (!rollCond || !rollLength) return null;
//     const idx = (rollCond.rollLengths ?? []).findIndex(
//       (l: number) => l === rollLength
//     );
//     return idx >= 0 ? Number(rollCond.rollStocks?.[idx] ?? 0) : null;
//   }, [rollCond, rollLength]);

//   // --- Quantity & Calculations ---
//   const [quantity, setQuantity] = useState(1);

//   const lengthPerItem = useMemo(() => {
//     if (!hasConditions || !salesMode) return 1;
//     if (salesMode === "CUT") return Math.max(cutMinimum, Number(cutLength));
//     if (salesMode === "ROLL") return Math.max(1, Number(rollLength ?? 1));
//     return 1;
//   }, [hasConditions, salesMode, cutLength, rollLength, cutMinimum]);

//   const totalLength = useMemo(
//     () =>
//       Math.max(1, Number(lengthPerItem)) * Math.max(1, Number(quantity)),
//     [lengthPerItem, quantity]
//   );
//   const totalPrice = useMemo(() => {
//     if (hasConditions && salesMode)
//       return totalLength * Number(product.price ?? 0);
//     return Math.max(1, Number(quantity)) * Number(product.price ?? 0);
//   }, [hasConditions, salesMode, totalLength, quantity, product.price]);

//   // ✅ clearanceQuantity จาก product
//   const rawClearanceQty = (product as any).clearanceQuantity;
//   const clearanceQty =
//     typeof rawClearanceQty === "number"
//       ? rawClearanceQty
//       : rawClearanceQty != null
//       ? Number(rawClearanceQty)
//       : null;

//   const noStock = clearanceQty != null && clearanceQty <= 0;

//   const maxQtyForCut = useMemo(() => {
//     if (!hasConditions || salesMode !== "CUT") return null;
//     if (clearanceQty == null || clearanceQty <= 0) return 0;
//     const perItem = Math.max(cutMinimum, cutLength || cutMinimum);
//     if (perItem <= 0) return 0;
//     return Math.floor(clearanceQty / perItem);
//   }, [hasConditions, salesMode, clearanceQty, cutMinimum, cutLength]);

//   // --- Handlers ---
//   const handleCutStep = (delta: number) => {
//     if (!hasConditions || salesMode !== "CUT") return;
//     if (noStock) return;
//     setCutLength((prev) => {
//       let next = prev + delta;
//       if (next < cutMinimum) next = cutMinimum;

//       if (clearanceQty != null && clearanceQty > 0) {
//         const maxLenForCurrentQty = Math.floor(
//           clearanceQty / Math.max(1, quantity)
//         );
//         if (next > maxLenForCurrentQty) {
//           next = Math.max(cutMinimum, maxLenForCurrentQty);
//         }
//       }
//       return next;
//     });
//   };

//   const handleQuantityChange = (change: number) => {
//     let next = Math.max(1, quantity + change);

//     if (salesMode === "ROLL" && selectedRollStock != null) {
//       next = Math.min(next, Math.max(0, selectedRollStock));
//     } else if ((!hasConditions || !salesMode) && clearanceQty != null) {
//       next = Math.min(next, Math.max(1, clearanceQty));
//     } else if (salesMode === "CUT" && maxQtyForCut != null) {
//       next = Math.min(next, Math.max(0, maxQtyForCut));
//     }

//     setQuantity(next);
//   };

//   const isStockAvailable =
//     salesMode === "ROLL"
//       ? selectedRollStock != null && selectedRollStock > 0
//       : clearanceQty == null || clearanceQty > 0;

//   return {
//     // state / derived
//     salesMode,
//     unit,
//     originalPrice,
//     showDiscountBadge,
//     cutMinimum,
//     cutStepOptions,
//     cutLength,
//     rollPairs,
//     rollLength,
//     selectedRollStock,
//     quantity,
//     lengthPerItem,
//     totalLength,
//     totalPrice,
//     clearanceQty,
//     noStock,
//     maxQtyForCut,
//     isStockAvailable,
//     // handlers
//     setRollLength,
//     handleCutStep,
//     handleQuantityChange,
//   };
// }

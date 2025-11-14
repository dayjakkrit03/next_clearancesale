// src/app/product/[id]/component/useProductSalesForm.ts
"use client";

import { useMemo, useState } from "react";

type UIProduct = any;
type CardPartsVisibility = any;

// ===== Helpers =====
const getOriginalPrice = (price: number, discountPercent?: number) => {
  if (!discountPercent || discountPercent <= 0) return undefined;
  const original = price / (1 - discountPercent / 100);
  return Math.round(original);
};
// ====================

export function useProductSalesForm(
  product: UIProduct,
  visibleParts: CardPartsVisibility,
  hasConditions: boolean
) {
  // Sales Condition State Logic
  const firstCond = hasConditions ? (product.conditions![0] as any) : undefined;
  const [salesMode] = useState<"CUT" | "ROLL" | null>(
    () => firstCond?.salesType ?? null
  );
  const [unit] = useState<string>(
    () => (firstCond?.unit ?? product.uom ?? "M.") as string
  );

  const originalPrice = useMemo(
    () => getOriginalPrice(product.price, product.discountPercent),
    [product.price, product.discountPercent]
  );
  const showDiscountBadge =
    (visibleParts.discountBadge ?? true) && (product.discountPercent ?? 0) > 0;

  // --- CUT Logic ---
  const cutCond = (product.conditions ?? []).find(
    (c: any) => c.salesType === "CUT"
  ) as any;

  const cutMinimum =
    typeof cutCond?.minimumLength === "number" && cutCond.minimumLength > 0
      ? cutCond.minimumLength
      : 1;

  const cutStepOptions: number[] = Array.isArray(cutCond?.cutStepOptions)
    ? (cutCond!.cutStepOptions as number[])
    : Array.isArray((cutCond as any)?.stepOptions)
    ? ((cutCond as any).stepOptions as number[])
    : [];

  const [cutLength, setCutLength] = useState<number>(() => cutMinimum);

  // --- ROLL Logic ---
  const rollCond = useMemo(() => {
    return (product?.conditions ?? []).find(
      (c: any) => c.salesType === "ROLL"
    ) as any;
  }, [product]);

  const rollPairs = useMemo(() => {
    const lens: number[] = rollCond?.rollLengths ?? [];
    const stocks: (number | string)[] = rollCond?.rollStocks ?? [];

    return lens.map((len: number, i: number) => ({
      len,
      stock: Number(stocks[i] ?? 0),
    }));
  }, [rollCond]);

  const [rollLength, setRollLength] = useState<number | null>(() => {
    if (rollCond?.rollLengths?.length) return rollCond.rollLengths[0];
    return null;
  });

  const selectedRollStock = useMemo(() => {
    if (!rollCond || !rollLength) return null;
    const idx = (rollCond.rollLengths ?? []).findIndex(
      (l: number) => l === rollLength
    );
    return idx >= 0 ? Number(rollCond.rollStocks?.[idx] ?? 0) : null;
  }, [rollCond, rollLength]);

  // --- Quantity & Calculations ---
  const [quantity, setQuantity] = useState(1);

  const lengthPerItem = useMemo(() => {
    if (!hasConditions || !salesMode) return 1;
    if (salesMode === "CUT") return Math.max(cutMinimum, Number(cutLength));
    if (salesMode === "ROLL") return Math.max(1, Number(rollLength ?? 1));
    return 1;
  }, [hasConditions, salesMode, cutLength, rollLength, cutMinimum]);

  const totalLength = useMemo(
    () =>
      Math.max(1, Number(lengthPerItem)) * Math.max(1, Number(quantity)),
    [lengthPerItem, quantity]
  );
  const totalPrice = useMemo(() => {
    if (hasConditions && salesMode)
      return totalLength * Number(product.price ?? 0);
    return Math.max(1, Number(quantity)) * Number(product.price ?? 0);
  }, [hasConditions, salesMode, totalLength, quantity, product.price]);

  // ✅ clearanceQuantity จาก product
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

  // --- Handlers ---
  const handleCutStep = (delta: number) => {
    if (!hasConditions || salesMode !== "CUT") return;
    if (noStock) return;
    setCutLength((prev) => {
      let next = prev + delta;
      if (next < cutMinimum) next = cutMinimum;

      if (clearanceQty != null && clearanceQty > 0) {
        const maxLenForCurrentQty = Math.floor(
          clearanceQty / Math.max(1, quantity)
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
    // state / derived
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
    // handlers
    setRollLength,
    handleCutStep,
    handleQuantityChange,
  };
}

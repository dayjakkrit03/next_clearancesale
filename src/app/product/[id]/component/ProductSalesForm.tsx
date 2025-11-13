// src/app/product/[id]/component/ProductSalesForm.tsx

"use client";

import { useMemo, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

// ***************************************************************
// ***** แก้ไข Error 2305: Type Placeholder (นำมาแทนการ Import) *****
// ***************************************************************
type UIProduct = any; 
type CardPartsVisibility = any; 

// ===== Helpers (ย้ายมาที่นี่) =====
const getOriginalPrice = (price: number, discountPercent?: number) => {
    if (!discountPercent || discountPercent <= 0) return undefined;
    const original = price / (1 - discountPercent / 100);
    return Math.round(original);
};
// ==================================

interface SalesFormProps {
    product: UIProduct;
    visibleParts: CardPartsVisibility;
    hasConditions: boolean;
    onAddToCart: () => void;
}

export function ProductSalesForm({
    product,
    visibleParts,
    hasConditions,
    onAddToCart,
}: SalesFormProps) {
    const router = useRouter();
    
    // Sales Condition State Logic (ย้ายมาที่นี่)
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

    // 🎯 แก้ไข Error 7006 (Implicit 'any' type) สำหรับ len และ i
    const rollPairs = useMemo(() => {
        const lens: number[] = rollCond?.rollLengths ?? [];
        const stocks: (number | string)[] = rollCond?.rollStocks ?? [];
        
        return lens.map((len: number, i: number) => ({ 
            len, 
            stock: Number(stocks[i] ?? 0) 
        }));
    }, [rollCond]);

    const [rollLength, setRollLength] = useState<number | null>(() => {
        if (rollCond?.rollLengths?.length) return rollCond.rollLengths[0];
        return null;
    });

    const selectedRollStock = useMemo(() => {
        if (!rollCond || !rollLength) return null;
        const idx = (rollCond.rollLengths ?? []).findIndex((l: number) => l === rollLength);
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

    // --- Handlers ---
    const handleCutStep = (delta: number) => {
        if (!hasConditions || salesMode !== "CUT") return;
        setCutLength((prev) => {
            const next = prev + delta;
            return next < cutMinimum ? cutMinimum : next;
        });
    };

    const handleQuantityChange = (change: number) => {
        let next = Math.max(1, quantity + change);
        if (salesMode === "ROLL" && selectedRollStock != null) {
            next = Math.min(next, Math.max(0, selectedRollStock));
        }
        setQuantity(next);
    };
    // ===================================
    
    const isRollStockAvailable = salesMode !== "ROLL" || (selectedRollStock != null && selectedRollStock > 0);

    return (
        <div className="space-y-4">
            {/* Price */}
            <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                    {visibleParts.price !== false && (
                        <span className="text-2xl md:text-3xl font-bold text-sale">
                            ฿{product.price.toLocaleString()}
                            {hasConditions && salesMode ? ` / ${unit}` : ""}
                        </span>
                    )}
                    {visibleParts.originalPrice !== false && originalPrice && (
                        <span className="text-lg md:text-xl text-muted-foreground line-through">
                            ฿{originalPrice.toLocaleString()}
                        </span>
                    )}
                    {showDiscountBadge && (
                        <Badge className="bg-sale text-sale-foreground text-sm px-3 py-1">
                            ประหยัด {product.discountPercent}%
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">รวม VAT แล้ว</p>
            </div>

            {/* Sales Type */}
            {hasConditions && salesMode && (
                <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
                    <span className="text-muted-foreground font-medium text-sm md:text-base">
                        ประเภทการขาย:
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center rounded-lg border border-muted px-3 py-1.5 text-sm bg-white shadow-sm">
                            {salesMode === "CUT"
                                ? "ตัดแบ่งขาย (Cut)"
                                : "ขายยกม้วน (Roll)"}
                        </span>
                    </div>
                </div>
            )}

            {/* Length (CUT) */}
            {hasConditions && salesMode === "CUT" && (
                <div className="space-y-2">
                    <div className="sm:flex sm:items-center sm:gap-4">
                        <span className="text-muted-foreground font-medium text-sm md:text-base">
                            ความยาวตัดขาย:
                        </span>
                        <div className="flex items-center gap-3">
                            <span
                                className="inline-flex items-center rounded-lg border border-muted px-3 py-2 text-sm bg-muted/20"
                                title="ความยาวที่ตัดขายต่อ 1 รายการ"
                            >
                                {cutLength.toLocaleString()} {unit}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                ขั้นต่ำ {cutMinimum.toLocaleString()} {unit}
                            </span>
                        </div>
                    </div>

                    {/* ปุ่มเพิ่ม/ลดตาม stepOptions */}
                    {cutStepOptions.length > 0 && (
                        <div className="sm:flex sm:items-center sm:gap-4">
                            <span className="text-muted-foreground font-medium text-xs md:text-sm">
                                เพิ่ม/ลดความยาว:
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                                {cutStepOptions.map((step) => (
                                    <div key={step} className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCutStep(-step)}
                                            disabled={cutLength - step < cutMinimum}
                                            title={`ลด -${step.toLocaleString()} ${unit}`}
                                        >
                                            -{step.toLocaleString()} {unit}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCutStep(step)}
                                            title={`เพิ่ม +${step.toLocaleString()} ${unit}`}
                                        >
                                            +{step.toLocaleString()} {unit}
                                        </Button>
                                    </div>
                                ))}
                                <span className="text-xs text-muted-foreground">
                                    (กดเพิ่ม/ลดจากค่าขั้นต่ำ)
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Length (ROLL) */}
            {hasConditions && salesMode === "ROLL" && (
                <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
                    <span className="text-muted-foreground font-medium text-sm md:text-base">
                        ความยาวม้วน:
                    </span>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* 🎯 แก้ไข Error 7031: กำหนด Type ให้กับ len และ stock */}
                        {rollPairs.map(({ len, stock }: { len: number, stock: number }) => {
                            const isActive = rollLength === len;
                            const soldOut = stock <= 0;
                            return (
                                <button
                                    key={len}
                                    onClick={() => !soldOut && setRollLength(len)}
                                    disabled={soldOut}
                                    className={[
                                        "cursor-pointer border rounded-lg px-3 py-2 transition-colors text-sm",
                                        isActive
                                            ? "border-primary text-primary"
                                            : "border-muted hover:bg-muted/50",
                                        soldOut ? "opacity-50 cursor-not-allowed" : "",
                                    ].join(" ")}
                                    title={
                                        soldOut
                                            ? "สินค้าหมด"
                                            : `สต๊อก: ${stock.toLocaleString()} ม้วน`
                                    }
                                >
                                    {len.toLocaleString()} {unit}
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        ({soldOut ? "หมด" : stock.toLocaleString()})
                                    </span>
                                </button>
                            );
                        })}
                        <span className="text-sm text-muted-foreground">
                            {rollLength ? `(${rollLength.toLocaleString()} ${unit})` : ""}
                        </span>
                    </div>
                </div>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2">
                {salesMode === "ROLL" ? (
                    selectedRollStock != null ? (
                        selectedRollStock > 0 ? (
                            <>
                                <div className="w-2 h-2 bg-success rounded-full" />
                                <span className="text-success font-medium">
                                    สต๊อก {selectedRollStock.toLocaleString()} ม้วน (ขนาด{" "}
                                    {rollLength?.toLocaleString()} {unit})
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 bg-destructive rounded-full" />
                                <span className="text-destructive font-medium">
                                    ขนาดที่เลือกหมดสต๊อก
                                </span>
                            </>
                        )
                    ) : (
                        <>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                            <span className="text-muted-foreground">
                                เลือกความยาวม้วนเพื่อดูสต๊อก
                            </span>
                        </>
                    )
                ) : (
                    <>
                        <div className="w-2 h-2 bg-success rounded-full" />
                        <span className="text-success font-medium">
                            มีสินค้าในสต๊อก
                        </span>
                    </>
                )}
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <span className="font-medium text-muted-foreground">
                        Quantity:
                    </span>
                    <div className="flex items-center border rounded-lg">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(-1)}
                            className="h-10 w-10 p-0"
                            disabled={quantity <= 1}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-4 py-2 min-w-[3rem] text-center">
                            {quantity}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(1)}
                            className="h-10 w-10 p-0"
                            disabled={salesMode === "ROLL" && selectedRollStock != null && quantity >= selectedRollStock}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Summary */}
                <div className="text-sm text-muted-foreground space-y-1">
                    {hasConditions && salesMode ? (
                        <>
                            <div>
                                ความยาวรวม:{" "}
                                <span className="font-medium text-foreground">
                                    {totalLength.toLocaleString()} {unit}
                                </span>
                            </div>
                            <div>
                                ราคารวม:{" "}
                                <span className="font-bold text-foreground">
                                    ฿{totalPrice.toLocaleString()}
                                </span>
                            </div>
                            {salesMode === "ROLL" && selectedRollStock != null && (
                                <div className="text-xs">
                                    สต๊อกสูงสุดสำหรับขนาดนี้:{" "}
                                    {selectedRollStock.toLocaleString()} ม้วน
                                </div>
                            )}
                            <div className="text-xs">
                                ({quantity.toLocaleString()} ×{" "}
                                {Number(lengthPerItem).toLocaleString()} {unit} × ฿
                                {Number(product.price).toLocaleString()}/{unit})
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                ราคารวม:{" "}
                                <span className="font-bold text-foreground">
                                    ฿{totalPrice.toLocaleString()}
                                </span>
                            </div>
                            <div className="text-xs">
                                ({quantity.toLocaleString()} × ฿
                                {Number(product.price).toLocaleString()} / ชิ้น)
                            </div>
                        </>
                    )}
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        size="lg"
                        className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={() => router.push("/checkout")}
                        disabled={!isRollStockAvailable}
                    >
                        Buy Now
                    </Button>
                    <Button
                        size="lg"
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={onAddToCart}
                        disabled={!isRollStockAvailable}
                    >
                        Add to Cart
                    </Button>
                </div>
            </div>
        </div>
    );
}
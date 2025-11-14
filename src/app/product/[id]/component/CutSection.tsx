// src/app/product/[id]/component/CutSection.tsx
"use client";

import { Button } from "@/components/ui/button";

export type CutSectionProps = {
  hasConditions: boolean;
  salesMode: "CUT" | "ROLL" | null;
  cutMinimum: number;
  cutStepOptions: number[];
  cutLength: number;
  unit: string;
  clearanceQty: number | null;
  quantity: number;
  noStock: boolean;
  handleCutStep: (delta: number) => void;
};

export function CutSection({
  hasConditions,
  salesMode,
  cutMinimum,
  cutStepOptions,
  cutLength,
  unit,
  clearanceQty,
  quantity,
  noStock,
  handleCutStep,
}: CutSectionProps) {
  if (!hasConditions || salesMode !== "CUT") return null;

  return (
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

      {cutStepOptions.length > 0 && (
        <div className="sm:flex sm:items-center sm:gap-4">
          <span className="text-muted-foreground font-medium text-xs md:text-sm">
            เพิ่ม/ลดความยาว:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {cutStepOptions.map((step) => {
              const nextPlus = cutLength + step;
              const exceedStock =
                clearanceQty != null &&
                clearanceQty > 0 &&
                nextPlus * quantity > clearanceQty;

              return (
                <div key={step} className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCutStep(-step)}
                    disabled={cutLength - step < cutMinimum || noStock}
                    title={`ลด -${step.toLocaleString()} ${unit}`}
                  >
                    -{step.toLocaleString()} {unit}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCutStep(step)}
                    disabled={exceedStock || noStock}
                    title={`เพิ่ม +${step.toLocaleString()} {unit}`}
                  >
                    +{step.toLocaleString()} {unit}
                  </Button>
                </div>
              );
            })}
            <span className="text-xs text-muted-foreground">
              (กดเพิ่ม/ลดจากค่าขั้นต่ำ)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

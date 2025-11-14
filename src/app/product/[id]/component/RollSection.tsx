// src/app/product/[id]/component/RollSection.tsx
"use client";

export type RollSectionProps = {
  hasConditions: boolean;
  salesMode: "CUT" | "ROLL" | null;
  rollPairs: { len: number; stock: number }[];
  rollLength: number | null;
  unit: string;
  setRollLength: (len: number) => void;
};

export function RollSection({
  hasConditions,
  salesMode,
  rollPairs,
  rollLength,
  unit,
  setRollLength,
}: RollSectionProps) {
  if (!hasConditions || salesMode !== "ROLL") return null;

  return (
    <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
      <span className="text-muted-foreground font-medium text-sm md:text-base">
        ความยาวม้วน:
      </span>

      <div className="flex flex-wrap items-center gap-3">
        {rollPairs.map(({ len, stock }) => {
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
                soldOut ? "สินค้าหมด" : `สต๊อก: ${stock.toLocaleString()} ม้วน`
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
  );
}

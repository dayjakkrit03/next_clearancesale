// src/app/admin/components/products/Pageination.tsx

"use client";
import React from "react";

type Props = {
  itemsInPage: number;
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;

  onPageSizeChange: (n: number) => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function Pagination({
  itemsInPage,
  total,
  page,
  totalPages,
  pageSize,
  onPageSizeChange,
  onPrev,
  onNext,
}: Props) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
      <div className="text-muted-foreground">
        แสดง {itemsInPage.toLocaleString("th-TH")} รายการ • ทั้งหมด {total.toLocaleString("th-TH")} รายการ • หน้า {page}/{totalPages}
      </div>
      <div className="flex items-center gap-2">
        <select
          className="rounded-md border px-2 py-1"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value) || 24)}
        >
          {[12, 24, 36, 48].map((n) => (
            <option key={n} value={n}>
              {n}/หน้า
            </option>
          ))}
        </select>
        <button className="rounded-md border px-2 py-1 disabled:opacity-50" onClick={onPrev} disabled={!canPrev}>
          ← ก่อนหน้า
        </button>
        <button className="rounded-md border px-2 py-1 disabled:opacity-50" onClick={onNext} disabled={!canNext}>
          ถัดไป →
        </button>
      </div>
    </div>
  );
}

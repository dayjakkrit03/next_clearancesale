// src/app/admin/components/products/BulkActionsBar.tsx

"use client";
import React from "react";
import type { CategoryOption } from "./Toolbar";

type Props = {
  selectedCount: number;
  onSelectAllThisPage: () => void;
  onClearSelection: () => void;

  onBulkHide: () => void;
  onBulkShow: () => void;
  onBulkDelete: () => Promise<void>;

  categoryOptions: CategoryOption[];
  bulkCat: string;
  onBulkCatChange: (v: string) => void;
  onBulkMove: () => void;
  disabledMove: boolean;
};

export default function BulkActionsBar({
  selectedCount,
  onSelectAllThisPage,
  onClearSelection,
  onBulkHide,
  onBulkShow,
  onBulkDelete,
  categoryOptions,
  bulkCat,
  onBulkCatChange,
  onBulkMove,
  disabledMove,
}: Props) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-md border px-3 py-2 bg-muted/50">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <button className="rounded-md border px-2 py-1 hover:bg-white" onClick={onSelectAllThisPage}>
            เลือกทั้งหมดในหน้านี้
          </button>
          <button className="rounded-md border px-2 py-1 hover:bg-white" onClick={onClearSelection}>
            ล้างการเลือก
          </button>
          <span className="text-muted-foreground">เลือกแล้ว: {selectedCount}</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-white" onClick={onBulkHide} disabled={!selectedCount}>
            ซ่อน (Bulk)
          </button>
          <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-white" onClick={onBulkShow} disabled={!selectedCount}>
            แสดง (Bulk)
          </button>
          <button
            className="rounded-md border border-destructive/50 text-destructive px-3 py-1.5 text-sm hover:bg-white"
            onClick={onBulkDelete}
            disabled={!selectedCount}
          >
            ลบ (Bulk)
          </button>
        </div>
      </div>

      {/* Move category */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-muted-foreground">ย้ายหมวดหมู่:</label>
        <select
          className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 min-w-[220px]"
          value={bulkCat}
          onChange={(e) => onBulkCatChange(e.target.value)}
        >
          <option value="">— เลือกหมวดปลายทาง —</option>
          {categoryOptions.map((c) => (
            <option key={String(c.id)} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
          onClick={onBulkMove}
          disabled={disabledMove}
          title={!bulkCat ? "กรุณาเลือกหมวดปลายทาง" : ""}
        >
          ย้ายหมวด (Bulk)
        </button>
      </div>
    </div>
  );
}

// src/app/admin/components/products/CardSettingsDialog.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type CardPartsVisibility,
  defaultCardPartsVisibility,
  mergeAndSave,
} from "./cardSettings";

type Props = {
  open: boolean;
  parts: CardPartsVisibility;                 // ค่าปัจจุบันจาก parent
  onChange: (next: CardPartsVisibility) => void; // เรียกทุกครั้งที่มีการเปลี่ยนค่า (live)
  onClose: () => void;
};

export default function CardSettingsDialog({ open, parts, onChange, onClose }: Props) {
  const [local, setLocal] = useState<CardPartsVisibility>(parts);

  useEffect(() => {
    if (open) setLocal(parts);
  }, [open, parts]);

  const groups = useMemo(
    () => [
      {
        title: "บนรูปสินค้า",
        items: [
          { key: "image", label: "รูปภาพสินค้า" },
          { key: "discountBadge", label: "ป้ายเปอร์เซ็นต์ส่วนลด" },
          { key: "brandLogo", label: "โลโก้ยี่ห้อ (บนรูป)" },
          { key: "frame", label: "กรอบรูป (draw/image)" },
        ] as Array<{ key: keyof CardPartsVisibility; label: string }>,
      },
      {
        title: "ข้อมูลใต้รูป",
        items: [
          { key: "brandName", label: "ชื่อยี่ห้อ (ตัวหนังสือ)" },
          { key: "sku", label: "SKU" },
          { key: "name", label: "ชื่อสินค้า" },
          { key: "ratingReview", label: "เรตติ้ง + รีวิว" },
          { key: "category", label: "หมวดหมู่" },
          { key: "price", label: "ราคาขายปัจจุบัน" },
          { key: "originalPrice", label: "ราคาก่อนลด (ขีดฆ่า)" },
          { key: "uom", label: "หน่วยสินค้า (UoM)" },
        ] as Array<{ key: keyof CardPartsVisibility; label: string }>,
      },
    ],
    [],
  );

  if (!open) return null;

  const setOne = (key: keyof CardPartsVisibility, value: boolean) => {
    const next = mergeAndSave(local, { [key]: value });
    setLocal(next);
    onChange(next);
  };

  const setMany = (patch: Partial<CardPartsVisibility>) => {
    const next = mergeAndSave(local, patch);
    setLocal(next);
    onChange(next);
  };

  const selectAll = () => {
    const next: CardPartsVisibility = Object.fromEntries(
      Object.keys(defaultCardPartsVisibility).map((k) => [k, true]),
    ) as CardPartsVisibility;
    setMany(next);
  };

  const clearAll = () => {
    const next: CardPartsVisibility = Object.fromEntries(
      Object.keys(defaultCardPartsVisibility).map((k) => [k, false]),
    ) as CardPartsVisibility;
    setMany(next);
  };

  const resetDefault = () => {
    setMany({ ...defaultCardPartsVisibility });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-2xl rounded-xl bg-card shadow-lg border border-border flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="text-lg font-semibold">ตั้งค่าการแสดงผลการ์ดสินค้า</div>
          <div className="text-xs text-muted-foreground">
            เลือกเปิด/ปิดองค์ประกอบที่ต้องการให้แสดงบนการ์ดและแถวสินค้า
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5 flex-1 overflow-y-auto overscroll-contain touch-pan-y">
          {/* Quick actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
              onClick={selectAll}
            >
              เปิดทั้งหมด
            </button>
            <button
              type="button"
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
              onClick={clearAll}
            >
              ปิดทั้งหมด
            </button>
            <button
              type="button"
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
              onClick={resetDefault}
            >
              รีเซ็ตค่าเริ่มต้น
            </button>
          </div>

          {groups.map((g) => (
            <div key={g.title} className="space-y-3">
              <div className="text-sm font-medium">{g.title}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {g.items.map(({ key, label }) => (
                  <label
                    key={String(key)}
                    className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 bg-background hover:bg-muted/40"
                  >
                    <span className="text-sm">{label}</span>
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={!!local[key]}
                      onChange={(e) => setOne(key, e.target.checked)}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
            onClick={onClose}
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

// src/app/admin/components/products/Toolbar.tsx

"use client";
import React from "react";

export type CategoryOption = { id: string | number; name: string };

type Props = {
  q: string;
  onQChange: (v: string) => void;

  categoryOptions: CategoryOption[];
  categoryId?: string | number;
  onCategoryChange: (v: string | number | undefined) => void;

  includeHidden: "all" | "visibleOnly";
  onIncludeHiddenChange: (v: "all" | "visibleOnly") => void;

  sort: "order" | "price" | "name";
  order: "asc" | "desc";
  onSortOrderChange: (sort: "order" | "price" | "name", order: "asc" | "desc") => void;

  onResetPage: () => void; // เรียก setPage(1)
};

export default function Toolbar({
  q,
  onQChange,
  categoryOptions,
  categoryId,
  onCategoryChange,
  includeHidden,
  onIncludeHiddenChange,
  sort,
  order,
  onSortOrderChange,
  onResetPage,
}: Props) {
  return (
    <div className="mb-3 grid grid-cols-1 md:grid-cols-4 gap-3">
      {/* ค้นหา */}
      <input
        value={q}
        onChange={(e) => {
          onQChange(e.target.value);
          onResetPage();
        }}
        placeholder="ค้นหาชื่อ/แบรนด์/SKU…"
        className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
      />

      {/* หมวด */}
      <select
        value={String(categoryId ?? "")}
        onChange={(e) => {
          const v = e.target.value;
          const n = Number(v);
          onCategoryChange(v === "" ? undefined : (Number.isFinite(n) && String(n) === v ? n : v));
          onResetPage();
        }}
        className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="">ทุกหมวดหมู่</option>
        {categoryOptions.map((c) => (
          <option key={String(c.id)} value={String(c.id)}>
            {c.name}
          </option>
        ))}
      </select>

      {/* แสดง: ทั้งหมด/เฉพาะที่ visible */}
      <select
        value={includeHidden}
        onChange={(e) => {
          onIncludeHiddenChange(e.target.value as "all" | "visibleOnly");
          onResetPage();
        }}
        className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="all">แสดงทั้งหมด</option>
        <option value="visibleOnly">เฉพาะที่แสดงอยู่</option>
      </select>

      {/* เรียง */}
      <select
        value={`${sort}:${order}`}
        onChange={(e) => {
          const [s, o] = e.target.value.split(":") as [typeof sort, typeof order];
          onSortOrderChange(s, o);
          onResetPage();
        }}
        className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="order:asc">เรียงตามลำดับ</option>
        <option value="price:asc">ราคาต่ำ → สูง</option>
        <option value="price:desc">ราคาสูง → ต่ำ</option>
        <option value="name:asc">ชื่อ A → Z</option>
        <option value="name:desc">ชื่อ Z → A</option>
      </select>
    </div>
  );
}

// src/app/admin/components/products/HeaderBar.tsx

"use client";
import React from "react";
import { LayoutGrid, List as ListIcon } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  onTitleChange: (v: string) => void;
  onSubtitleChange: (v: string) => void;

  viewMode: "grid" | "list";
  onViewModeChange: (m: "grid" | "list") => void;

  quickEdit: boolean;
  onToggleQuickEdit: () => void;

  selectMode: boolean;
  onToggleSelectMode: () => void;

  onCreate: () => void;
};

export default function HeaderBar({
  title,
  subtitle,
  onTitleChange,
  onSubtitleChange,
  viewMode,
  onViewModeChange,
  quickEdit,
  onToggleQuickEdit,
  selectMode,
  onToggleSelectMode,
  onCreate,
}: Props) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      {/* Title & Subtitle */}
      <div className="flex-1">
        <div className="text-2xl font-semibold mb-2">
          <input
            className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            aria-label="Title"
          />
        </div>
        <input
          className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
          value={subtitle}
          onChange={(e) => onSubtitleChange(e.target.value)}
          aria-label="Subtitle"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* View switch */}
        <div className="inline-flex rounded-md border overflow-hidden">
          <button
            className={`px-3 py-2 text-sm ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            onClick={() => onViewModeChange("grid")}
            title="มุมมองกริด"
            aria-pressed={viewMode === "grid"}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            className={`px-3 py-2 text-sm ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            onClick={() => onViewModeChange("list")}
            title="มุมมองรายการ"
            aria-pressed={viewMode === "list"}
          >
            <ListIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Quick edit */}
        <button
          type="button"
          className={`rounded-md border px-3 py-2 text-sm ${quickEdit ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          onClick={onToggleQuickEdit}
        >
          {quickEdit ? "ปิด Quick edit" : "Quick edit"}
        </button>

        {/* Select mode */}
        <button
          type="button"
          className={`rounded-md border px-3 py-2 text-sm ${selectMode ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          onClick={onToggleSelectMode}
        >
          {selectMode ? "ปิดโหมดเลือก" : "เลือกหลายรายการ"}
        </button>

        {/* Create */}
        <button
          type="button"
          className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
          onClick={onCreate}
        >
          + เพิ่มสินค้า
        </button>
      </div>
    </div>
  );
}

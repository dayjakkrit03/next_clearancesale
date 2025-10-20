// src/components/admin/hero-banners/hero-banner-row-admin.tsx

"use client";

import Image from "next/image";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import AdminEditableFloating from "@/app/admin/components/AdminEditableFloating";
import { cn } from "@/lib/utils";

export type LayoutMode = "image" | "overlay" | "split";

export type HeroBannerRow = {
  id: string;
  order: number;
  isActive: boolean;
  layoutMode: LayoutMode;
  imageUrlDesktop: string;
  title?: string;
  subtitle?: string;
  startAt?: string;
  endAt?: string;
  altText?: string;
};

type Props = {
  item: HeroBannerRow;

  // actions (ใช้กับปุ่มลอย)
  onEdit: (id: string) => void;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;

  // เลือกหลายรายการ (optional)
  selectable?: boolean;
  selected?: boolean;
  onSelectToggle?: (id: string, checked: boolean) => void;
};

export default function HeroBannerRowAdmin({
  item,
  onEdit,
  onToggleActive,
  onDelete,
  selectable,
  selected,
  onSelectToggle,
}: Props) {
  // รองรับลากย้ายด้วย dnd-kit (ถ้า parent เปิดใช้งาน SortableContext)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  const scheduleText =
    item.startAt || item.endAt
      ? `${item.startAt ? new Date(item.startAt).toLocaleDateString() : "-"} → ${
          item.endAt ? new Date(item.endAt).toLocaleDateString() : "-"
        }`
      : undefined;

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "opacity-70")}>
      <AdminEditableFloating
        visible={item.isActive}
        onToggleVisible={() => onToggleActive(item.id)}
        onEdit={() => onEdit(item.id)}
        onDelete={() => onDelete(item.id)}
        dragHandleProps={{ ...attributes, ...listeners }} // ปุ่ม “⇅” ใช้ลากแถว
      >
        <div
          className={cn(
            "relative flex items-stretch gap-3 rounded-xl bg-card shadow-soft overflow-hidden p-3 sm:p-4",
            item.isActive ? "hover:-translate-y-0.5 transition" : "opacity-70 ring-1 ring-amber-300/60"
          )}
        >
          {/* checkbox (เลือกหลายรายการ) */}
          {selectable && (
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={!!selected}
                onChange={(e) => onSelectToggle?.(item.id, e.target.checked)}
              />
            </div>
          )}

          {/* thumbnail */}
          <div className="relative h-20 w-36 sm:h-24 sm:w-44 rounded-lg overflow-hidden bg-muted/30 shrink-0">
            <Image
              src={item.imageUrlDesktop || "/placeholder.png"}
              alt={item.altText || item.title || item.id}
              fill
              sizes="176px"
              className="object-cover"
            />
            {/* สถานะซ่อน/แสดง */}
            {!item.isActive && (
              <span className="absolute top-1 right-1 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-1.5 py-0.5">
                INACTIVE
              </span>
            )}
          </div>

          {/* เนื้อหา */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="min-w-0">
                {/* บรรทัด meta ด้านบน */}
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
                  <span className="font-mono">#{item.order}</span>
                  <span className="uppercase rounded bg-muted px-1.5 py-0.5">{item.layoutMode}</span>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 font-medium",
                      item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted"
                    )}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* title / subtitle */}
                {(item.title || item.subtitle) ? (
                  <>
                    {item.title && (
                      <div className="font-medium text-sm sm:text-base leading-tight line-clamp-2">
                        {item.title}
                      </div>
                    )}
                    {item.subtitle && (
                      <div className="text-[12px] sm:text-sm text-muted-foreground leading-tight line-clamp-2">
                        {item.subtitle}
                      </div>
                    )}
                  </>
                ) : (
                  // ถ้าไม่มี title/subtitle ให้แสดง id เพื่อระบุรายการ
                  <div className="font-mono text-sm text-muted-foreground">{item.id}</div>
                )}

                {/* path รูป */}
                <div className="mt-1 text-[11px] text-muted-foreground truncate">
                  {item.imageUrlDesktop}
                </div>

                {/* ช่วงเวลา */}
                {scheduleText && (
                  <div className="mt-1 text-[11px] text-muted-foreground">ช่วงเวลา: {scheduleText}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AdminEditableFloating>
    </div>
  );
}

// src/components/pageination-bar.tsx

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  page: number;                 // หน้า (1-based)
  pageSize: number;             // จำนวนต่อหน้า
  total: number;                // จำนวนทั้งหมด
  pageSizeOptions?: number[];   // ตัวเลือกต่อหน้า (default [12,24,48,96])
  onChangePage: (p: number) => void;
  onChangePageSize: (s: number) => void;
  className?: string;
};

export default function PaginationBar({
  page,
  pageSize,
  total,
  pageSizeOptions = [12, 24, 48, 96],
  onChangePage,
  onChangePageSize,
  className = "",
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showing = Math.min(total, page * pageSize);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;

  return (
    <div className={`w-full flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
      {/* ซ้าย: ข้อความสรุป */}
      <div className="text-xs sm:text-sm text-muted-foreground">
        แสดง {from.toLocaleString()}–{showing.toLocaleString()} รายการ • ทั้งหมด {total.toLocaleString()} รายการ • หน้า {page}/{totalPages}
      </div>

      {/* ขวา: ตัวเลือกต่อหน้า + ปุ่มก่อนหน้า/ถัดไป */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onChangePageSize(Number(v))}
          >
            <SelectTrigger className="h-8 w-[90px] text-xs sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}/หน้า
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onChangePage(page - 1)}
          className="text-xs sm:text-sm"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          ก่อนหน้า
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onChangePage(page + 1)}
          className="text-xs sm:text-sm"
        >
          ถัดไป
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

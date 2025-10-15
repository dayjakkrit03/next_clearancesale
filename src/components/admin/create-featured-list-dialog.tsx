// src/components/admin/create-featured-list-dialog.tsx
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FeaturedList = {
  key: string;
  title: string;
  subtitle?: string;
  limit?: number;
  items: Array<{ productId: string | number; order: number }>;
};

function validateKey(key: string) {
  const trimmed = key.trim();
  if (!trimmed) return "กรุณาระบุ key";
  if (!/^[a-z0-9_-]+$/i.test(trimmed)) {
    return "ใช้ตัวอักษร/ตัวเลข/ขีดกลาง/ขีดล่าง เท่านั้น (a-z, 0-9, -, _)";
  }
  if (trimmed.length > 64) return "key ยาวเกินไป (สูงสุด 64 ตัวอักษร)";
  return null;
}

export default function CreateFeaturedListDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (created: FeaturedList) => void;
}) {
  const [key, setKey] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [subtitle, setSubtitle] = React.useState("");
  const [limit, setLimit] = React.useState<string>("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const reset = () => {
    setKey("");
    setTitle("");
    setSubtitle("");
    setLimit("");
    setError(null);
  };

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) reset();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    const msg = validateKey(key);
    if (msg) {
      setError(msg);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/mock/featured-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: key.trim(),
          title: title.trim() || undefined,
          subtitle: subtitle.trim() || undefined,
          limit: limit ? Number(limit) : undefined,
          items: [],
        }),
      });

      if (res.status === 409) {
        setError(`ลิสต์ key "${key.trim()}" มีอยู่แล้ว`);
        return;
      }
      if (!res.ok) throw new Error("create failed");

      const created: FeaturedList = await res.json();
      onCreated(created);
      handleClose(false);
    } catch (err: any) {
      setError(err?.message ?? "เกิดข้อผิดพลาดในการสร้างลิสต์");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>สร้างลิสต์ใหม่</DialogTitle>
          <DialogDescription>
            ตั้งค่ารายละเอียดพื้นฐานของลิสต์ “สินค้าแนะนำ”
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="text-sm mb-1 font-medium">Key (ต้องไม่ซ้ำ)</div>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="เช่น home_weekly_2"
              autoFocus
            />
            <div className="text-xs text-muted-foreground mt-1">
              ใช้ตัวอักษร/ตัวเลข/ขีดกลาง/ขีดล่าง เท่านั้น (a-z, 0-9, -, _)
            </div>
          </div>

          <div>
            <div className="text-sm mb-1 font-medium">ชื่อหัวข้อ (ไม่บังคับ)</div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เว้นว่าง = ใช้ key เป็นชื่อหัวข้อ"
            />
          </div>

          <div>
            <div className="text-sm mb-1 font-medium">คำอธิบาย (ไม่บังคับ)</div>
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="คำอธิบายสั้น ๆ"
            />
          </div>

          <div>
            <div className="text-sm mb-1 font-medium">จำนวนสูงสุด (limit) — ไม่บังคับ</div>
            <Input
              type="number"
              min={1}
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="เว้นว่าง = ไม่จำกัด"
            />
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <DialogFooter className="gap-2">
            <Button type="button" variant="secondary" onClick={() => handleClose(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "กำลังสร้าง..." : "สร้างลิสต์"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// src/app/admin/components/AdminProductEditDialog.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { validateProductInput } from "@/lib/validation/product";

export type ProductEditValues = {
  name: string;
  brand?: string;
  sku?: string;
  price: number;
  discountPercent?: number;
  image_url?: string;
};

export default function AdminProductEditDialog({
  open,
  initial,
  onClose,
  onSave,
  mode = "edit",
}: {
  open: boolean;
  initial: ProductEditValues;
  onClose: () => void;
  onSave: (values: ProductEditValues) => Promise<void> | void;
  mode?: "create" | "edit";
}) {
  const [form, setForm] = useState<ProductEditValues>(initial);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setForm(initial);
      setError(null);
      setUploading(false);
      setSaving(false);
    }
  }, [open, initial]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(f.type)) {
      setError("รองรับเฉพาะ PNG/JPG/WEBP");
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setError("ไฟล์ต้องไม่เกิน 2MB");
      return;
    }
    uploadFile(f);
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    setError(null);
    try {
      const res = await fetch("/api/uploads/products", { method: "POST", body: formData });
      if (!res.ok) throw new Error((await res.text().catch(() => "")) || "Upload failed");
      const data = await res.json();
      if (!data?.url) throw new Error("No URL returned");
      setForm((v) => ({ ...v, image_url: data.url as string }));
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      // validate ฝั่ง client
      const parsed = validateProductInput(form);
      await onSave(parsed);
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const title = mode === "create" ? "เพิ่มสินค้า" : "แก้ไขสินค้า";
  const submitLabel = saving ? "Saving…" : mode === "create" ? "เพิ่ม" : "บันทึก";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-4 shadow-lg">
        <div className="mb-3 text-lg font-semibold">{title}</div>

        {error && (
          <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">ชื่อสินค้า</label>
            <input
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="เช่น Fiber Optic Cable 305m"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">แบรนด์</label>
            <input
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
              value={form.brand ?? ""}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              placeholder="เช่น COMMSCOPE"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">SKU</label>
            <input
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
              value={form.sku ?? ""}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="เช่น AM-2120-02XG"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">ราคา (บาท)</label>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })}
              placeholder="เช่น 82150"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">ส่วนลด (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
              value={form.discountPercent ?? 0}
              onChange={(e) => setForm({ ...form, discountPercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
              placeholder="0, 60, 70, 80, 90"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">รูปภาพ</label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 overflow-hidden rounded-lg border bg-muted">
                {form.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">ไม่มีรูป</div>
                )}
              </div>
              <div>
                <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} />
                <p className="mt-1 text-xs text-muted-foreground">รองรับ PNG/JPG/WEBP ขนาดไม่เกิน 2MB (จะแปลงเป็น WEBP อัตโนมัติ)</p>
              </div>
            </div>
            {uploading && <div className="mt-2 text-xs text-muted-foreground">Uploading…</div>}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border px-3 py-2 text-sm hover:bg-muted" disabled={saving || uploading}>
            ยกเลิก
          </button>
          <button
            onClick={submit}
            className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
            disabled={saving || uploading}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

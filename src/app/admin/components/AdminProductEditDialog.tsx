// v.1.1.5 =================================================
// src/app/admin/components/AdminProductEditDialog.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { validateProductInput } from "@/lib/validation/product";

export type CategoryOption = { id: number | string; name: string };

export type ProductEditValues = {
  name: string;
  brand?: string;
  sku?: string;
  price: number;
  discountPercent?: number;
  image_url?: string;
  category_id?: number | string;
  rating?: number;
  reviews?: number;
  uom?: string;
};

export default function AdminProductEditDialog({
  open,
  initial,
  onClose,
  onSave,
  mode = "edit",
  categories,
}: {
  open: boolean;
  initial: ProductEditValues;
  onClose: () => void;
  onSave: (values: ProductEditValues) => Promise<void> | void;
  mode?: "create" | "edit";
  categories?: CategoryOption[];
}) {
  const [form, setForm] = useState<ProductEditValues>(initial);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [catOptions, setCatOptions] = useState<CategoryOption[] | null>(categories ?? null);
  const [catLoading, setCatLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial);
      setError(null);
      setUploading(false);
      setSaving(false);

      if (!categories && !catOptions) {
        (async () => {
          try {
            setCatLoading(true);
            const res = await fetch("/api/mock/categories", { cache: "no-store" });
            const data = await res.json().catch(() => ({}));
            const items = (data?.items ?? []) as Array<{ id: number | string; name: string }>;
            setCatOptions(items.map((x) => ({ id: x.id, name: x.name })));
          } catch {
            setCatOptions([]);
          } finally {
            setCatLoading(false);
          }
        })();
      } else if (categories) {
        setCatOptions(categories);
      }
    }
  }, [open, initial, categories, catOptions]);

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

  const parseCategoryValue = (v: string) => {
    if (v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) && String(n) === v ? n : v;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-3 sm:p-6">
      {/* กล่อง dialog: คอลัมน์ + จำกัดความสูง + สกรอลเฉพาะ content */}
      <div className="w-full max-w-xl rounded-xl bg-white shadow-lg border border-border flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        {/* Header (ตรึง) */}
        <div className="p-4 sm:p-5 border-b shrink-0">
          <div className="text-lg font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground">
            กรอกข้อมูลสินค้าและอัปโหลดรูปภาพ (WEBP/PNG/JPG)
          </div>
        </div>

        {/* Content (ส่วนที่สกรอล) */}
        <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-4 sm:p-5 space-y-4 scrollArea">
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ชื่อ & แบรนด์ */}
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

            {/* SKU & ราคา */}
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

            {/* ส่วนลด & หน่วยสินค้า */}
            <div>
              <label className="mb-1 block text-sm font-medium">ส่วนลด (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                value={form.discountPercent ?? 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discountPercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                  })
                }
                placeholder="0, 60, 70, 80, 90"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">หน่วยสินค้า (UoM)</label>
              <input
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                value={form.uom ?? ""}
                onChange={(e) => setForm({ ...form, uom: e.target.value })}
                placeholder="เช่น PC, EA, ST"
              />
            </div>

            {/* Category */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Category</label>
              <select
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-muted"
                disabled={catLoading || !catOptions || catOptions.length === 0}
                value={String(form.category_id ?? "")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category_id: parseCategoryValue(e.target.value),
                  })
                }
              >
                <option value="">{catLoading ? "กำลังโหลด…" : "— เลือกหมวดหมู่ —"}</option>
                {catOptions?.map((c) => (
                  <option key={String(c.id)} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating & Reviews */}
            <div>
              <label className="mb-1 block text-sm font-medium">Rating (0–5)</label>
              <input
                type="number"
                min={0}
                max={5}
                step="0.1"
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                value={form.rating ?? 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rating: Math.max(0, Math.min(5, Number(e.target.value) || 0)),
                  })
                }
                placeholder="เช่น 4.5"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Reviews</label>
              <input
                type="number"
                min={0}
                step="1"
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                value={form.reviews ?? 0}
                onChange={(e) => setForm({ ...form, reviews: Math.max(0, Number(e.target.value) || 0) })}
                placeholder="เช่น 156"
              />
            </div>

            {/* อัปโหลดรูป */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">รูปภาพ</label>
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-lg border bg-muted">
                  {form.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      ไม่มีรูป
                    </div>
                  )}
                </div>
                <div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} />
                  <p className="mt-1 text-xs text-muted-foreground">
                    รองรับ PNG/JPG/WEBP ขนาดไม่เกิน 2MB (จะแปลงเป็น WEBP อัตโนมัติ)
                  </p>
                </div>
              </div>
              {uploading && <div className="mt-2 text-xs text-muted-foreground">Uploading…</div>}
            </div>
          </div>
        </div>

        {/* Footer (ตรึง) */}
        <div className="p-4 sm:p-5 border-t flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
            disabled={saving || uploading}
          >
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

      {/* สไตล์สกรอลบาร์เฉพาะคอมโพเนนต์นี้ */}
      <style jsx>{`
        .scrollArea {
          scrollbar-gutter: stable both-edges;
          scrollbar-width: thin;            /* Firefox */
          scrollbar-color: rgba(0,0,0,.25) transparent;
        }
        .scrollArea::-webkit-scrollbar {
          width: 10px;
        }
        .scrollArea::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollArea::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.25);
          border-radius: 9999px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .scrollArea::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.35);
          border: 2px solid transparent;
          background-clip: padding-box;
        }
      `}</style>
    </div>
  );
}

// v.1.1.5 =================================================

// v.1.1.4 =================================================
// // src/app/admin/components/AdminProductEditDialog.tsx

// "use client";

// import { useEffect, useRef, useState } from "react";
// import { validateProductInput } from "@/lib/validation/product";

// export type CategoryOption = { id: number | string; name: string };

// export type ProductEditValues = {
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number;
//   image_url?: string;

//   // ฟิลด์ที่เพิ่มใหม่
//   category_id?: number | string;
//   rating?: number;   // 0-5 (รองรับทศนิยม)
//   reviews?: number;  // จำนวนรีวิว
//   uom?: string;      // หน่วยสินค้า เช่น PC / EA / ST
// };

// export default function AdminProductEditDialog({
//   open,
//   initial,
//   onClose,
//   onSave,
//   mode = "edit",
//   categories,
// }: {
//   open: boolean;
//   initial: ProductEditValues;
//   onClose: () => void;
//   onSave: (values: ProductEditValues) => Promise<void> | void;
//   mode?: "create" | "edit";
//   categories?: CategoryOption[];
// }) {
//   const [form, setForm] = useState<ProductEditValues>(initial);
//   const [uploading, setUploading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const fileRef = useRef<HTMLInputElement | null>(null);

//   // ตัวเลือกหมวดหมู่ (ใช้ prop ถ้ามี, ไม่งั้น fetch เองตอนเปิด)
//   const [catOptions, setCatOptions] = useState<CategoryOption[] | null>(categories ?? null);
//   const [catLoading, setCatLoading] = useState(false);

//   useEffect(() => {
//     if (open) {
//       setForm(initial);
//       setError(null);
//       setUploading(false);
//       setSaving(false);

//       if (!categories && !catOptions) {
//         (async () => {
//           try {
//             setCatLoading(true);
//             const res = await fetch("/api/mock/categories", { cache: "no-store" });
//             const data = await res.json().catch(() => ({}));
//             const items = (data?.items ?? []) as Array<{ id: number | string; name: string }>;
//             setCatOptions(items.map((x) => ({ id: x.id, name: x.name })));
//           } catch {
//             setCatOptions([]);
//           } finally {
//             setCatLoading(false);
//           }
//         })();
//       } else if (categories) {
//         setCatOptions(categories);
//       }
//     }
//   }, [open, initial, categories, catOptions]);

//   const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const f = e.target.files?.[0];
//     if (!f) return;
//     if (!/^image\/(png|jpe?g|webp)$/i.test(f.type)) {
//       setError("รองรับเฉพาะ PNG/JPG/WEBP");
//       return;
//     }
//     if (f.size > 2 * 1024 * 1024) {
//       setError("ไฟล์ต้องไม่เกิน 2MB");
//       return;
//     }
//     uploadFile(f);
//   };

//   const uploadFile = async (file: File) => {
//     const formData = new FormData();
//     formData.append("file", file);
//     setUploading(true);
//     setError(null);
//     try {
//       const res = await fetch("/api/uploads/products", { method: "POST", body: formData });
//       if (!res.ok) throw new Error((await res.text().catch(() => "")) || "Upload failed");
//       const data = await res.json();
//       if (!data?.url) throw new Error("No URL returned");
//       setForm((v) => ({ ...v, image_url: data.url as string }));
//     } catch (e: any) {
//       setError(e?.message ?? "Upload failed");
//     } finally {
//       setUploading(false);
//       if (fileRef.current) fileRef.current.value = "";
//     }
//   };

//   const submit = async () => {
//     setSaving(true);
//     setError(null);
//     try {
//       // validate + coerce ให้เรียบร้อยก่อนบันทึก
//       const parsed = validateProductInput(form);
//       await onSave(parsed); // ใช้ค่าที่ถูกแปลงแล้ว
//       onClose();
//     } catch (e: any) {
//       setError(e?.message ?? "Save failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (!open) return null;

//   const title = mode === "create" ? "เพิ่มสินค้า" : "แก้ไขสินค้า";
//   const submitLabel = saving ? "Saving…" : mode === "create" ? "เพิ่ม" : "บันทึก";

//   // helper: แปลงค่าที่ select เป็น number ถ้าเป็นตัวเลขล้วน มิฉะนั้นเป็น string
//   const parseCategoryValue = (v: string) => {
//     if (v === "") return undefined;
//     const n = Number(v);
//     return Number.isFinite(n) && String(n) === v ? n : v;
//   };

//   return (
//     // ⬇⬇ overlay เปิดสกรอลได้
//     <div className="fixed inset-0 z-50 bg-black/30 p-3 sm:p-6 overflow-y-auto">
//       {/* กล่อง dialog */}
//       <div className="w-full max-w-xl mx-auto rounded-xl bg-white shadow-lg p-4 sm:p-5 max-h-[90vh] overflow-y-auto">
//         <div className="mb-3 text-lg font-semibold">{title}</div>

//         {error && (
//           <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//             {error}
//           </div>
//         )}

//         {/* เนื้อหาแบบกริด — ตัวกล่องหลักเป็นสกรอลอยู่แล้ว */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* ชื่อ & แบรนด์ */}
//           <div>
//             <label className="mb-1 block text-sm font-medium">ชื่อสินค้า</label>
//             <input
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               placeholder="เช่น Fiber Optic Cable 305m"
//             />
//           </div>
//           <div>
//             <label className="mb-1 block text-sm font-medium">แบรนด์</label>
//             <input
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.brand ?? ""}
//               onChange={(e) => setForm({ ...form, brand: e.target.value })}
//               placeholder="เช่น COMMSCOPE"
//             />
//           </div>

//           {/* SKU & ราคา */}
//           <div>
//             <label className="mb-1 block text-sm font-medium">SKU</label>
//             <input
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.sku ?? ""}
//               onChange={(e) => setForm({ ...form, sku: e.target.value })}
//               placeholder="เช่น AM-2120-02XG"
//             />
//           </div>
//           <div>
//             <label className="mb-1 block text-sm font-medium">ราคา (บาท)</label>
//             <input
//               type="number"
//               step="0.01"
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.price}
//               onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })}
//               placeholder="เช่น 82150"
//             />
//           </div>

//           {/* ส่วนลด & หน่วยสินค้า */}
//           <div>
//             <label className="mb-1 block text-sm font-medium">ส่วนลด (%)</label>
//             <input
//               type="number"
//               min={0}
//               max={100}
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.discountPercent ?? 0}
//               onChange={(e) =>
//                 setForm({
//                   ...form,
//                   discountPercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
//                 })
//               }
//               placeholder="0, 60, 70, 80, 90"
//             />
//           </div>
//           <div>
//             <label className="mb-1 block text-sm font-medium">หน่วยสินค้า (UoM)</label>
//             <input
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.uom ?? ""}
//               onChange={(e) => setForm({ ...form, uom: e.target.value })}
//               placeholder="เช่น PC, EA, ST"
//             />
//           </div>

//           {/* Category */}
//           <div className="md:col-span-2">
//             <label className="mb-1 block text-sm font-medium">Category</label>
//             <select
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-muted"
//               disabled={catLoading || !catOptions || catOptions.length === 0}
//               value={String(form.category_id ?? "")}
//               onChange={(e) =>
//                 setForm({
//                   ...form,
//                   category_id: parseCategoryValue(e.target.value),
//                 })
//               }
//             >
//               <option value="">{catLoading ? "กำลังโหลด…" : "— เลือกหมวดหมู่ —"}</option>
//               {catOptions?.map((c) => (
//                 <option key={String(c.id)} value={String(c.id)}>
//                   {c.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Rating & Reviews */}
//           <div>
//             <label className="mb-1 block text-sm font-medium">Rating (0–5)</label>
//             <input
//               type="number"
//               min={0}
//               max={5}
//               step="0.1"
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.rating ?? 0}
//               onChange={(e) =>
//                 setForm({
//                   ...form,
//                   rating: Math.max(0, Math.min(5, Number(e.target.value) || 0)),
//                 })
//               }
//               placeholder="เช่น 4.5"
//             />
//           </div>
//           <div>
//             <label className="mb-1 block text-sm font-medium">Reviews</label>
//             <input
//               type="number"
//               min={0}
//               step="1"
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.reviews ?? 0}
//               onChange={(e) => setForm({ ...form, reviews: Math.max(0, Number(e.target.value) || 0) })}
//               placeholder="เช่น 156"
//             />
//           </div>

//           {/* อัปโหลดรูป */}
//           <div className="md:col-span-2">
//             <label className="mb-1 block text-sm font-medium">รูปภาพ</label>
//             <div className="flex items-center gap-3">
//               <div className="h-16 w-16 overflow-hidden rounded-lg border bg-muted">
//                 {form.image_url ? (
//                   // eslint-disable-next-line @next/next/no-img-element
//                   <img src={form.image_url} alt="" className="h-full w-full object-cover" />
//                 ) : (
//                   <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
//                     ไม่มีรูป
//                   </div>
//                 )}
//               </div>
//               <div>
//                 <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} />
//                 <p className="mt-1 text-xs text-muted-foreground">
//                   รองรับ PNG/JPG/WEBP ขนาดไม่เกิน 2MB (จะแปลงเป็น WEBP อัตโนมัติ)
//                 </p>
//               </div>
//             </div>
//             {uploading && <div className="mt-2 text-xs text-muted-foreground">Uploading…</div>}
//           </div>
//         </div>

//         {/* แถบปุ่ม — ติดพื้นเวลาสกรอล */}
//         <div className="sticky bottom-0 bg-white pt-3 mt-6 -mx-4 sm:-mx-5 px-4 sm:px-5 border-t flex justify-end gap-2">
//           <button
//             onClick={onClose}
//             className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
//             disabled={saving || uploading}
//           >
//             ยกเลิก
//           </button>
//           <button
//             onClick={submit}
//             className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
//             disabled={saving || uploading}
//           >
//             {submitLabel}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.4 =================================================

// v.1.1.3 =================================================
// // src/app/admin/components/AdminProductEditDialog.tsx

// "use client";

// import { useEffect, useRef, useState } from "react";
// import { validateProductInput } from "@/lib/validation/product";

// export type CategoryOption = { id: number | string; name: string };

// export type ProductEditValues = {
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number;
//   image_url?: string;

//   // ฟิลด์ที่เพิ่มใหม่
//   category_id?: number | string;
//   rating?: number;   // 0-5 (รองรับทศนิยม)
//   reviews?: number;  // จำนวนรีวิว
//   uom?: string;      // หน่วยสินค้า เช่น PC / EA / ST
// };

// export default function AdminProductEditDialog({
//   open,
//   initial,
//   onClose,
//   onSave,
//   mode = "edit",
//   categories,
// }: {
//   open: boolean;
//   initial: ProductEditValues;
//   onClose: () => void;
//   onSave: (values: ProductEditValues) => Promise<void> | void;
//   mode?: "create" | "edit";
//   categories?: CategoryOption[];
// }) {
//   const [form, setForm] = useState<ProductEditValues>(initial);
//   const [uploading, setUploading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const fileRef = useRef<HTMLInputElement | null>(null);

//   // ตัวเลือกหมวดหมู่ (ใช้ prop ถ้ามี, ไม่งั้น fetch เองตอนเปิด)
//   const [catOptions, setCatOptions] = useState<CategoryOption[] | null>(categories ?? null);
//   const [catLoading, setCatLoading] = useState(false);

//   useEffect(() => {
//     if (open) {
//       setForm(initial);
//       setError(null);
//       setUploading(false);
//       setSaving(false);

//       if (!categories && !catOptions) {
//         (async () => {
//           try {
//             setCatLoading(true);
//             const res = await fetch("/api/mock/categories", { cache: "no-store" });
//             const data = await res.json().catch(() => ({}));
//             const items = (data?.items ?? []) as Array<{ id: number | string; name: string }>;
//             setCatOptions(items.map((x) => ({ id: x.id, name: x.name })));
//           } catch {
//             setCatOptions([]);
//           } finally {
//             setCatLoading(false);
//           }
//         })();
//       } else if (categories) {
//         setCatOptions(categories);
//       }
//     }
//   }, [open, initial, categories, catOptions]);

//   const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const f = e.target.files?.[0];
//     if (!f) return;
//     if (!/^image\/(png|jpe?g|webp)$/i.test(f.type)) {
//       setError("รองรับเฉพาะ PNG/JPG/WEBP");
//       return;
//     }
//     if (f.size > 2 * 1024 * 1024) {
//       setError("ไฟล์ต้องไม่เกิน 2MB");
//       return;
//     }
//     uploadFile(f);
//   };

//   const uploadFile = async (file: File) => {
//     const formData = new FormData();
//     formData.append("file", file);
//     setUploading(true);
//     setError(null);
//     try {
//       const res = await fetch("/api/uploads/products", { method: "POST", body: formData });
//       if (!res.ok) throw new Error((await res.text().catch(() => "")) || "Upload failed");
//       const data = await res.json();
//       if (!data?.url) throw new Error("No URL returned");
//       setForm((v) => ({ ...v, image_url: data.url as string }));
//     } catch (e: any) {
//       setError(e?.message ?? "Upload failed");
//     } finally {
//       setUploading(false);
//       if (fileRef.current) fileRef.current.value = "";
//     }
//   };

//   const submit = async () => {
//     setSaving(true);
//     setError(null);
//     try {
//       // validate + coerce ให้เรียบร้อยก่อนบันทึก
//       const parsed = validateProductInput(form);
//       await onSave(parsed); // ใช้ค่าที่ถูกแปลงแล้ว
//       onClose();
//     } catch (e: any) {
//       setError(e?.message ?? "Save failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (!open) return null;

//   const title = mode === "create" ? "เพิ่มสินค้า" : "แก้ไขสินค้า";
//   const submitLabel = saving ? "Saving…" : mode === "create" ? "เพิ่ม" : "บันทึก";

//   // helper: แปลงค่าที่ select เป็น number ถ้าเป็นตัวเลขล้วน มิฉะนั้นเป็น string
//   const parseCategoryValue = (v: string) => {
//     if (v === "") return undefined;
//     const n = Number(v);
//     return Number.isFinite(n) && String(n) === v ? n : v;
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
//       <div className="w-full max-w-xl rounded-xl bg-white p-4 shadow-lg">
//         <div className="mb-3 text-lg font-semibold">{title}</div>

//         {error && (
//           <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//             {error}
//           </div>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* ชื่อ & แบรนด์ */}
//           <div>
//             <label className="mb-1 block text-sm font-medium">ชื่อสินค้า</label>
//             <input
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               placeholder="เช่น Fiber Optic Cable 305m"
//             />
//           </div>
//           <div>
//             <label className="mb-1 block text-sm font-medium">แบรนด์</label>
//             <input
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.brand ?? ""}
//               onChange={(e) => setForm({ ...form, brand: e.target.value })}
//               placeholder="เช่น COMMSCOPE"
//             />
//           </div>

//           {/* SKU & ราคา */}
//           <div>
//             <label className="mb-1 block text-sm font-medium">SKU</label>
//             <input
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.sku ?? ""}
//               onChange={(e) => setForm({ ...form, sku: e.target.value })}
//               placeholder="เช่น AM-2120-02XG"
//             />
//           </div>
//           <div>
//             <label className="mb-1 block text-sm font-medium">ราคา (บาท)</label>
//             <input
//               type="number"
//               step="0.01"
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.price}
//               onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })}
//               placeholder="เช่น 82150"
//             />
//           </div>

//           {/* ส่วนลด & หน่วยสินค้า */}
//           <div>
//             <label className="mb-1 block text-sm font-medium">ส่วนลด (%)</label>
//             <input
//               type="number"
//               min={0}
//               max={100}
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.discountPercent ?? 0}
//               onChange={(e) =>
//                 setForm({
//                   ...form,
//                   discountPercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
//                 })
//               }
//               placeholder="0, 60, 70, 80, 90"
//             />
//           </div>
//           <div>
//             <label className="mb-1 block text-sm font-medium">หน่วยสินค้า (UoM)</label>
//             <input
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.uom ?? ""}
//               onChange={(e) => setForm({ ...form, uom: e.target.value })}
//               placeholder="เช่น PC, EA, ST"
//             />
//           </div>

//           {/* Category */}
//           <div className="md:col-span-2">
//             <label className="mb-1 block text-sm font-medium">Category</label>
//             <select
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-muted"
//               disabled={catLoading || !catOptions || catOptions.length === 0}
//               value={String(form.category_id ?? "")}
//               onChange={(e) =>
//                 setForm({
//                   ...form,
//                   category_id: parseCategoryValue(e.target.value),
//                 })
//               }
//             >
//               <option value="">{catLoading ? "กำลังโหลด…" : "— เลือกหมวดหมู่ —"}</option>
//               {catOptions?.map((c) => (
//                 <option key={String(c.id)} value={String(c.id)}>
//                   {c.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Rating & Reviews */}
//           <div>
//             <label className="mb-1 block text-sm font-medium">Rating (0–5)</label>
//             <input
//               type="number"
//               min={0}
//               max={5}
//               step="0.1"
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.rating ?? 0}
//               onChange={(e) =>
//                 setForm({
//                   ...form,
//                   rating: Math.max(0, Math.min(5, Number(e.target.value) || 0)),
//                 })
//               }
//               placeholder="เช่น 4.5"
//             />
//           </div>
//           <div>
//             <label className="mb-1 block text-sm font-medium">Reviews</label>
//             <input
//               type="number"
//               min={0}
//               step="1"
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.reviews ?? 0}
//               onChange={(e) => setForm({ ...form, reviews: Math.max(0, Number(e.target.value) || 0) })}
//               placeholder="เช่น 156"
//             />
//           </div>

//           {/* อัปโหลดรูป */}
//           <div className="md:col-span-2">
//             <label className="mb-1 block text-sm font-medium">รูปภาพ</label>
//             <div className="flex items-center gap-3">
//               <div className="h-16 w-16 overflow-hidden rounded-lg border bg-muted">
//                 {form.image_url ? (
//                   // eslint-disable-next-line @next/next/no-img-element
//                   <img src={form.image_url} alt="" className="h-full w-full object-cover" />
//                 ) : (
//                   <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
//                     ไม่มีรูป
//                   </div>
//                 )}
//               </div>
//               <div>
//                 <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} />
//                 <p className="mt-1 text-xs text-muted-foreground">
//                   รองรับ PNG/JPG/WEBP ขนาดไม่เกิน 2MB (จะแปลงเป็น WEBP อัตโนมัติ)
//                 </p>
//               </div>
//             </div>
//             {uploading && <div className="mt-2 text-xs text-muted-foreground">Uploading…</div>}
//           </div>
//         </div>

//         <div className="mt-6 flex justify-end gap-2">
//           <button
//             onClick={onClose}
//             className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
//             disabled={saving || uploading}
//           >
//             ยกเลิก
//           </button>
//           <button
//             onClick={submit}
//             className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
//             disabled={saving || uploading}
//           >
//             {submitLabel}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.3 =================================================

// v.1.1.2 =================================================
// // src/app/admin/components/AdminProductEditDialog.tsx

// "use client";

// import { useEffect, useRef, useState } from "react";
// import { validateProductInput } from "@/lib/validation/product";

// export type CategoryOption = { id: number | string; name: string };

// export type ProductEditValues = {
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number;
//   image_url?: string;

//   // ฟิลด์ที่เพิ่มใหม่
//   category_id?: number | string;
//   rating?: number;   // 0-5 (รองรับทศนิยม)
//   reviews?: number;  // จำนวนรีวิว
//   uom?: string;      // หน่วยสินค้า เช่น PC / EA / ST
// };

// export default function AdminProductEditDialog({
//   open,
//   initial,
//   onClose,
//   onSave,
//   mode = "edit",
//   // ทางเลือก: ให้ parent ส่งรายการหมวดหมู่มาให้
//   categories,
// }: {
//   open: boolean;
//   initial: ProductEditValues;
//   onClose: () => void;
//   onSave: (values: ProductEditValues) => Promise<void> | void;
//   mode?: "create" | "edit";
//   categories?: CategoryOption[];
// }) {
//   const [form, setForm] = useState<ProductEditValues>(initial);
//   const [uploading, setUploading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const fileRef = useRef<HTMLInputElement | null>(null);

//   // ตัวเลือกหมวดหมู่ (ใช้ prop ถ้ามี, ไม่งั้น fetch เองตอนเปิด)
//   const [catOptions, setCatOptions] = useState<CategoryOption[] | null>(categories ?? null);
//   const [catLoading, setCatLoading] = useState(false);

//   useEffect(() => {
//     if (open) {
//       setForm(initial);
//       setError(null);
//       setUploading(false);
//       setSaving(false);

//       if (!categories && !catOptions) {
//         (async () => {
//           try {
//             setCatLoading(true);
//             const res = await fetch("/api/mock/categories", { cache: "no-store" });
//             const data = await res.json().catch(() => ({}));
//             const items = (data?.items ?? []) as Array<{ id: number | string; name: string }>;
//             setCatOptions(items.map((x) => ({ id: x.id, name: x.name })));
//           } catch {
//             setCatOptions([]);
//           } finally {
//             setCatLoading(false);
//           }
//         })();
//       } else if (categories) {
//         setCatOptions(categories);
//       }
//     }
//   }, [open, initial, categories, catOptions]);

//   const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const f = e.target.files?.[0];
//     if (!f) return;
//     if (!/^image\/(png|jpe?g|webp)$/i.test(f.type)) {
//       setError("รองรับเฉพาะ PNG/JPG/WEBP");
//       return;
//     }
//     if (f.size > 2 * 1024 * 1024) {
//       setError("ไฟล์ต้องไม่เกิน 2MB");
//       return;
//     }
//     uploadFile(f);
//   };

//   const uploadFile = async (file: File) => {
//     const formData = new FormData();
//     formData.append("file", file);
//     setUploading(true);
//     setError(null);
//     try {
//       const res = await fetch("/api/uploads/products", { method: "POST", body: formData });
//       if (!res.ok) throw new Error((await res.text().catch(() => "")) || "Upload failed");
//       const data = await res.json();
//       if (!data?.url) throw new Error("No URL returned");
//       setForm((v) => ({ ...v, image_url: data.url as string }));
//     } catch (e: any) {
//       setError(e?.message ?? "Upload failed");
//     } finally {
//       setUploading(false);
//       if (fileRef.current) fileRef.current.value = "";
//     }
//   };

//   const submit = async () => {
//     setSaving(true);
//     setError(null);
//     try {
//       // validate ฝั่ง client (ใช้ตัวเดิมสำหรับคอร์หลัก)
//       validateProductInput(form);
//       // ส่งค่าเต็ม (มีทั้งฟิลด์เดิม + ใหม่) กลับไปให้ parent / API
//       await onSave(form);
//       onClose();
//     } catch (e: any) {
//       setError(e?.message ?? "Save failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (!open) return null;

//   const title = mode === "create" ? "เพิ่มสินค้า" : "แก้ไขสินค้า";
//   const submitLabel = saving ? "Saving…" : mode === "create" ? "เพิ่ม" : "บันทึก";

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
//       <div className="w-full max-w-xl rounded-xl bg-white p-4 shadow-lg">
//         <div className="mb-3 text-lg font-semibold">{title}</div>

//         {error && (
//           <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//             {error}
//           </div>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* ชื่อ & แบรนด์ */}
//           <div>
//             <label className="mb-1 block text-sm font-medium">ชื่อสินค้า</label>
//             <input
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               placeholder="เช่น Fiber Optic Cable 305m"
//             />
//           </div>
//           <div>
//             <label className="mb-1 block text-sm font-medium">แบรนด์</label>
//             <input
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.brand ?? ""}
//               onChange={(e) => setForm({ ...form, brand: e.target.value })}
//               placeholder="เช่น COMMSCOPE"
//             />
//           </div>

//           {/* SKU & ราคา */}
//           <div>
//             <label className="mb-1 block text-sm font-medium">SKU</label>
//             <input
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.sku ?? ""}
//               onChange={(e) => setForm({ ...form, sku: e.target.value })}
//               placeholder="เช่น AM-2120-02XG"
//             />
//           </div>
//           <div>
//             <label className="mb-1 block text-sm font-medium">ราคา (บาท)</label>
//             <input
//               type="number"
//               step="0.01"
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.price}
//               onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })}
//               placeholder="เช่น 82150"
//             />
//           </div>

//           {/* ส่วนลด & หน่วยสินค้า */}
//           <div>
//             <label className="mb-1 block text-sm font-medium">ส่วนลด (%)</label>
//             <input
//               type="number"
//               min={0}
//               max={100}
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.discountPercent ?? 0}
//               onChange={(e) =>
//                 setForm({
//                   ...form,
//                   discountPercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
//                 })
//               }
//               placeholder="0, 60, 70, 80, 90"
//             />
//           </div>
//           <div>
//             <label className="mb-1 block text-sm font-medium">หน่วยสินค้า (UoM)</label>
//             <input
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.uom ?? ""}
//               onChange={(e) => setForm({ ...form, uom: e.target.value })}
//               placeholder="เช่น PC, EA, ST"
//             />
//           </div>

//           {/* Category */}
//           <div className="md:col-span-2">
//             <label className="mb-1 block text-sm font-medium">Category</label>
//             <select
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-muted"
//               disabled={catLoading || !catOptions || catOptions.length === 0}
//               value={form.category_id ?? ""}
//               onChange={(e) =>
//                 setForm({
//                   ...form,
//                   category_id: e.target.value === "" ? undefined : e.target.value,
//                 })
//               }
//             >
//               <option value="">{catLoading ? "กำลังโหลด…" : "— เลือกหมวดหมู่ —"}</option>
//               {catOptions?.map((c) => (
//                 <option key={String(c.id)} value={String(c.id)}>
//                   {c.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Rating & Reviews */}
//           <div>
//             <label className="mb-1 block text-sm font-medium">Rating (0–5)</label>
//             <input
//               type="number"
//               min={0}
//               max={5}
//               step="0.1"
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.rating ?? 0}
//               onChange={(e) =>
//                 setForm({
//                   ...form,
//                   rating: Math.max(0, Math.min(5, Number(e.target.value) || 0)),
//                 })
//               }
//               placeholder="เช่น 4.5"
//             />
//           </div>
//           <div>
//             <label className="mb-1 block text-sm font-medium">Reviews</label>
//             <input
//               type="number"
//               min={0}
//               step="1"
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.reviews ?? 0}
//               onChange={(e) => setForm({ ...form, reviews: Math.max(0, Number(e.target.value) || 0) })}
//               placeholder="เช่น 156"
//             />
//           </div>

//           {/* อัปโหลดรูป */}
//           <div className="md:col-span-2">
//             <label className="mb-1 block text-sm font-medium">รูปภาพ</label>
//             <div className="flex items-center gap-3">
//               <div className="h-16 w-16 overflow-hidden rounded-lg border bg-muted">
//                 {form.image_url ? (
//                   // eslint-disable-next-line @next/next/no-img-element
//                   <img src={form.image_url} alt="" className="h-full w-full object-cover" />
//                 ) : (
//                   <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
//                     ไม่มีรูป
//                   </div>
//                 )}
//               </div>
//               <div>
//                 <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} />
//                 <p className="mt-1 text-xs text-muted-foreground">
//                   รองรับ PNG/JPG/WEBP ขนาดไม่เกิน 2MB (จะแปลงเป็น WEBP อัตโนมัติ)
//                 </p>
//               </div>
//             </div>
//             {uploading && <div className="mt-2 text-xs text-muted-foreground">Uploading…</div>}
//           </div>
//         </div>

//         <div className="mt-6 flex justify-end gap-2">
//           <button
//             onClick={onClose}
//             className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
//             disabled={saving || uploading}
//           >
//             ยกเลิก
//           </button>
//           <button
//             onClick={submit}
//             className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
//             disabled={saving || uploading}
//           >
//             {submitLabel}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.2 =================================================

// // src/app/admin/components/AdminProductEditDialog.tsx

// "use client";

// import { useEffect, useRef, useState } from "react";
// import { validateProductInput } from "@/lib/validation/product";

// export type ProductEditValues = {
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number;
//   image_url?: string;
// };

// export default function AdminProductEditDialog({
//   open,
//   initial,
//   onClose,
//   onSave,
//   mode = "edit",
// }: {
//   open: boolean;
//   initial: ProductEditValues;
//   onClose: () => void;
//   onSave: (values: ProductEditValues) => Promise<void> | void;
//   mode?: "create" | "edit";
// }) {
//   const [form, setForm] = useState<ProductEditValues>(initial);
//   const [uploading, setUploading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const fileRef = useRef<HTMLInputElement | null>(null);

//   useEffect(() => {
//     if (open) {
//       setForm(initial);
//       setError(null);
//       setUploading(false);
//       setSaving(false);
//     }
//   }, [open, initial]);

//   const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const f = e.target.files?.[0];
//     if (!f) return;
//     if (!/^image\/(png|jpe?g|webp)$/i.test(f.type)) {
//       setError("รองรับเฉพาะ PNG/JPG/WEBP");
//       return;
//     }
//     if (f.size > 2 * 1024 * 1024) {
//       setError("ไฟล์ต้องไม่เกิน 2MB");
//       return;
//     }
//     uploadFile(f);
//   };

//   const uploadFile = async (file: File) => {
//     const formData = new FormData();
//     formData.append("file", file);
//     setUploading(true);
//     setError(null);
//     try {
//       const res = await fetch("/api/uploads/products", { method: "POST", body: formData });
//       if (!res.ok) throw new Error((await res.text().catch(() => "")) || "Upload failed");
//       const data = await res.json();
//       if (!data?.url) throw new Error("No URL returned");
//       setForm((v) => ({ ...v, image_url: data.url as string }));
//     } catch (e: any) {
//       setError(e?.message ?? "Upload failed");
//     } finally {
//       setUploading(false);
//       if (fileRef.current) fileRef.current.value = "";
//     }
//   };

//   const submit = async () => {
//     setSaving(true);
//     setError(null);
//     try {
//       // validate ฝั่ง client
//       const parsed = validateProductInput(form);
//       await onSave(parsed);
//       onClose();
//     } catch (e: any) {
//       setError(e?.message ?? "Save failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (!open) return null;

//   const title = mode === "create" ? "เพิ่มสินค้า" : "แก้ไขสินค้า";
//   const submitLabel = saving ? "Saving…" : mode === "create" ? "เพิ่ม" : "บันทึก";

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
//       <div className="w-full max-w-xl rounded-xl bg-white p-4 shadow-lg">
//         <div className="mb-3 text-lg font-semibold">{title}</div>

//         {error && (
//           <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//             {error}
//           </div>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="mb-1 block text-sm font-medium">ชื่อสินค้า</label>
//             <input
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               placeholder="เช่น Fiber Optic Cable 305m"
//             />
//           </div>
//           <div>
//             <label className="mb-1 block text-sm font-medium">แบรนด์</label>
//             <input
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.brand ?? ""}
//               onChange={(e) => setForm({ ...form, brand: e.target.value })}
//               placeholder="เช่น COMMSCOPE"
//             />
//           </div>
//           <div>
//             <label className="mb-1 block text-sm font-medium">SKU</label>
//             <input
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.sku ?? ""}
//               onChange={(e) => setForm({ ...form, sku: e.target.value })}
//               placeholder="เช่น AM-2120-02XG"
//             />
//           </div>
//           <div>
//             <label className="mb-1 block text-sm font-medium">ราคา (บาท)</label>
//             <input
//               type="number"
//               step="0.01"
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.price}
//               onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })}
//               placeholder="เช่น 82150"
//             />
//           </div>
//           <div>
//             <label className="mb-1 block text-sm font-medium">ส่วนลด (%)</label>
//             <input
//               type="number"
//               min={0}
//               max={100}
//               className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//               value={form.discountPercent ?? 0}
//               onChange={(e) => setForm({ ...form, discountPercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
//               placeholder="0, 60, 70, 80, 90"
//             />
//           </div>
//           <div className="md:col-span-2">
//             <label className="mb-1 block text-sm font-medium">รูปภาพ</label>
//             <div className="flex items-center gap-3">
//               <div className="h-16 w-16 overflow-hidden rounded-lg border bg-muted">
//                 {form.image_url ? (
//                   // eslint-disable-next-line @next/next/no-img-element
//                   <img src={form.image_url} alt="" className="h-full w-full object-cover" />
//                 ) : (
//                   <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">ไม่มีรูป</div>
//                 )}
//               </div>
//               <div>
//                 <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} />
//                 <p className="mt-1 text-xs text-muted-foreground">รองรับ PNG/JPG/WEBP ขนาดไม่เกิน 2MB (จะแปลงเป็น WEBP อัตโนมัติ)</p>
//               </div>
//             </div>
//             {uploading && <div className="mt-2 text-xs text-muted-foreground">Uploading…</div>}
//           </div>
//         </div>

//         <div className="mt-6 flex justify-end gap-2">
//           <button onClick={onClose} className="rounded-md border px-3 py-2 text-sm hover:bg-muted" disabled={saving || uploading}>
//             ยกเลิก
//           </button>
//           <button
//             onClick={submit}
//             className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
//             disabled={saving || uploading}
//           >
//             {submitLabel}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

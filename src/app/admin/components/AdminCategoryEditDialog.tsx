// v.1.1.2 ================================================
// src/app/admin/components/AdminCategoryEditDialog.tsx

"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type EditValues = {
  name: string;
  slug: string;
  image_url?: string;
};

export default function AdminCategoryEditDialog({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: EditValues;
  onClose: () => void;
  onSave: (values: EditValues) => Promise<void> | void;
}) {
  const [name, setName] = useState(initial.name ?? "");
  const [slug, setSlug] = useState(initial.slug ?? "");
  const [imageUrl, setImageUrl] = useState<string | undefined>(initial.image_url);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // เปิด dialog ใหม่ให้ sync ค่าเริ่มต้น
  useEffect(() => {
    if (open) {
      setName(initial.name ?? "");
      setSlug(initial.slug ?? "");
      setImageUrl(initial.image_url);
      setError(null);
      setUploading(false);
      setSaving(false);
    }
  }, [open, initial]);

  // สร้าง slug อัตโนมัติเมื่อแก้ชื่อ (ถ้า slug ยังตรงกับชื่อเดิม)
  const slugify = (s: string) =>
    s.toLowerCase().trim()
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const handleNameChange = (v: string) => {
    // auto-slug ถ้า slug ยังว่างหรือยังเท่ากับ slugify(name เก่า)
    const currentAuto = slugify(name);
    const isUntouched = slug.length === 0 || slug === currentAuto;
    setName(v);
    if (isUntouched) {
      setSlug(slugify(v));
    }
  };

  // อัปโหลดไฟล์ไป /api/uploads/categories → ได้ url .webp กลับมา
  const uploadFile = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    setError(null);
    try {
      const res = await fetch("/api/uploads/categories", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Upload failed");
      }
      const data = await res.json();
      if (!data?.url) throw new Error("No URL returned");
      setImageUrl(data.url as string);
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

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

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({ name: name.trim(), slug: slug.trim(), image_url: imageUrl });
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-lg">
        <div className="mb-3 text-lg font-semibold">แก้ไขหมวดหมู่</div>

        {error && (
          <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">ชื่อ (name)</label>
            <input
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="เช่น LAN (UTP) System"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Slug</label>
            <input
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="เช่น lan-utp"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              ใช้เป็นส่วนของ URL: <code>/products?category={slug}</code>
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">รูปภาพ</label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 overflow-hidden rounded-lg border bg-muted">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="" className="h-full w-full object-cover" />
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

        <div className="mt-6 flex justify-end gap-2">
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
            {saving ? "Saving…" : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}

// v.1.1.2 ================================================

// // src/app/admin/components/AdminCategoryEditDialog.tsx

// "use client";

// import { useEffect, useMemo, useState } from "react";

// export type EditValues = {
//   name: string;
//   slug: string;
//   image_url?: string;
// };

// function slugify(input: string) {
//   return input
//     .toLowerCase()
//     .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/(^-|-$)+/g, "")
//     .replace(/--+/g, "-");
// }

// export default function AdminCategoryEditDialog({
//   open,
//   initial,
//   onClose,
//   onSave,
// }: {
//   open: boolean;
//   initial: EditValues;
//   onClose: () => void;
//   onSave: (v: EditValues) => Promise<void> | void;
// }) {
//   const [name, setName] = useState(initial.name);
//   const [slug, setSlug] = useState(initial.slug);
//   const [image, setImage] = useState(initial.image_url ?? "");
//   const [touchedSlug, setTouchedSlug] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (open) {
//       setName(initial.name);
//       setSlug(initial.slug);
//       setImage(initial.image_url ?? "");
//       setTouchedSlug(false);
//       setError(null);
//     }
//   }, [open, initial]);

//   // auto-slug ชื่อ เมื่อผู้ใช้ยังไม่แก้ slug เอง
//   useEffect(() => {
//     if (!touchedSlug) {
//       setSlug(slugify(name || ""));
//     }
//   }, [name, touchedSlug]);

//   const isValid = useMemo(() => {
//     return name.trim().length > 0 && slug.trim().length > 0;
//   }, [name, slug]);

//   const handleSave = async () => {
//     if (!isValid) {
//       setError("กรุณากรอก Name/Slug ให้ครบ");
//       return;
//     }
//     setSaving(true);
//     setError(null);
//     try {
//       await onSave({ name: name.trim(), slug: slug.trim(), image_url: image.trim() || undefined });
//       onClose();
//     } catch (e: any) {
//       setError(e?.message ?? "บันทึกไม่สำเร็จ");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
//       <div className="w-full max-w-md rounded-xl bg-white shadow-lg ring-1 ring-black/10">
//         <div className="border-b px-4 py-3 font-semibold">แก้ไขหมวดหมู่</div>

//         <div className="p-4 space-y-3">
//           {error && (
//             <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//               {error}
//             </div>
//           )}

//           <label className="block text-sm font-medium">
//             Name
//             <input
//               className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ring-primary/30"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="ชื่อหมวดหมู่"
//             />
//           </label>

//           <label className="block text-sm font-medium">
//             Slug
//             <input
//               className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ring-primary/30"
//               value={slug}
//               onChange={(e) => { setSlug(e.target.value); setTouchedSlug(true); }}
//               placeholder="slug-เช่น-lan-utp"
//             />
//             <p className="mt-1 text-xs text-muted-foreground">
//               ใช้เป็น path ใน URL — ปกติจะสร้างจากชื่อให้อัตโนมัติ คุณแก้เองได้
//             </p>
//           </label>

//           <label className="block text-sm font-medium">
//             Image URL
//             <input
//               className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ring-primary/30"
//               value={image}
//               onChange={(e) => setImage(e.target.value)}
//               placeholder="เช่น /assets/category-lan-utp.jpg หรือ https://..."
//             />
//           </label>

//           {image && (
//             <div className="pt-2">
//               {/* แสดง preview แบบง่าย */}
//               {/* eslint-disable-next-line @next/next/no-img-element */}
//               <img src={image} alt="preview" className="h-16 w-16 rounded-lg object-cover border" />
//             </div>
//           )}
//         </div>

//         <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
//           <button
//             className="rounded-md px-3 py-2 text-sm hover:bg-muted"
//             onClick={onClose}
//             disabled={saving}
//           >
//             ยกเลิก
//           </button>
//           <button
//             className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
//             onClick={handleSave}
//             disabled={saving || !isValid}
//           >
//             {saving ? "กำลังบันทึก..." : "บันทึก"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

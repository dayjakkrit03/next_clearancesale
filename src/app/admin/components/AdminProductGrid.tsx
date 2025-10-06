
// v.1.1.8 =================================================
// src/app/admin/components/AdminProductGrid.tsx

"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import AdminEditable from "./AdminEditable";
import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ================= Types ================= */
export type UIProduct = {
  id: number | string;
  name: string;
  brand?: string;
  sku?: string;
  price: number;
  discountPercent?: number; // 0..100
  image_url?: string;
  visible?: boolean;
  order?: number;

  rating?: number;
  reviews?: number;

  category_id?: number | string;
  uom?: string; // <<< หน่วยสินค้า
};

type UIMeta = { title: string; subtitle: string };
type UICategoryLite = { id: number | string; name: string; slug?: string };

const API_BASE = "/api/mock/products";
const CAT_API = "/api/mock/categories";

/* =============== Helpers =============== */
function calcOriginalPrice(price: number, discountPercent?: number) {
  if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
  const original = Math.round(price / (1 - discountPercent / 100));
  return original > price ? original : undefined;
}

// สีกรอบตามส่วนลด
function frameBorderClass(p?: number) {
  if (!p || p < 10) return "border-transparent";
  if (p >= 90) return "border-red-500";
  if (p >= 80) return "border-yellow-500";
  if (p >= 70) return "border-amber-500";
  if (p >= 60) return "border-sky-500";
  return "border-slate-300";
}

// ปรับ SVG ให้ดาวที่ไม่ได้เลือก "ไม่มี fill" (แก้ปัญหาสีดำ)
function Stars({ rating = 0 }: { rating?: number }) {
  const full = Math.max(0, Math.min(5, Math.floor(rating)));
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        return (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className={`h-3.5 w-3.5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
            fill={filled ? "currentColor" : "none"}
            stroke={filled ? "none" : "currentColor"}
            strokeWidth={filled ? 0 : 1.3}
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.947 5.956 6.562.954-4.755 4.634 1.123 6.545z" />
          </svg>
        );
      })}
    </div>
  );
}

// หา path โลโก้จากชื่อ brand (ไฟล์อยู่ใน /public/brand_logo/{slug}_logo.png)
function brandLogoPath(brand?: string): string | null {
  if (!brand) return null;
  const key = brand.toLowerCase().replace(/[^a-z0-9]+/g, "");
  // ปรับแมปชื่อที่อาจสะกดต่างกันให้ตรงไฟล์
  const map: Record<string, string> = {
    commscope: "commscope",   // กันสะกดเพี้ยนจาก COMMSCOPE
    commscopee: "commscope",
    commscopex: "commscope",
    germanyrack: "germanyrack",
    link: "link",
    // เผื่อกรณีชื่อถูกต้องตรง ๆ อยู่แล้ว
    commscopee1: "commscope",
  };
  const slug = map[key] ?? key;
  return `/brand_logo/${slug}_logo.png`;
}

/* =============== Sortable Card (styled like frontend) =============== */
function SortableProduct({
  item,
  onDelete,
  onToggleVisible,
  onEdit,
  categoryName,
}: {
  item: UIProduct;
  onDelete: (id: UIProduct["id"]) => void;
  onToggleVisible: (id: UIProduct["id"]) => void;
  onEdit: (id: UIProduct["id"]) => void;
  categoryName?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

  const isHidden = item.visible === false;
  const originalPrice = calcOriginalPrice(item.price, item.discountPercent);

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
      <AdminEditable
        onDelete={() => onDelete(item.id)}
        onToggleVisible={() => onToggleVisible(item.id)}
        onEdit={() => onEdit(item.id)}
        visible={item.visible ?? true}
        dragHandleProps={{ ...attributes, ...listeners }}
      >
        <div
          className={[
            "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
            isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
          ].join(" ")}
        >
          {/* ภาพ + ป้ายลดราคา + กรอบสีส่วนลด + โลโก้แบรนด์ */}
          <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-xl">
            <Image
              src={item.image_url ?? "/placeholder.png"}
              alt={item.name}
              fill
              sizes="(max-width: 1280px) 33vw, 16vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* กรอบ overlay ครบ 4 ด้าน (บาง) */}
            <div
              className={[
                "pointer-events-none absolute inset-0 rounded-xl border-2",
                frameBorderClass(item.discountPercent),
              ].join(" ")}
            />

            {/* ป้ายส่วนลด */}
            {!!item.discountPercent && item.discountPercent > 0 && (
              <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
                -{item.discountPercent}%
              </span>
            )}

            {/* โลโก้แบรนด์ (คงสัดส่วน, ซ่อนถ้าโหลดไม่ได้) */}
            {(() => {
              const logo = brandLogoPath(item.brand);
              return logo ? (
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-white/85 backdrop-blur-sm rounded-md px-1.5 py-1 shadow-soft">
                    <img
                      src={logo}
                      alt={item.brand ?? "brand"}
                      className="h-7 w-auto max-w-[72px] object-contain"
                      onError={(e) => {
                        (e.currentTarget.style.display = "none");
                      }}
                      loading="lazy"
                    />
                  </div>
                </div>
              ) : null;
            })()}

            {isHidden && (
              <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
                HIDDEN
              </span>
            )}
          </div>

          {/* เนื้อหา (เดิมทั้งหมด) */}
          <div className="p-3 sm:p-4 flex flex-col gap-1">
            {item.brand && <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>}
            {item.sku && <div className="text-[11px] text-muted-foreground">SKU: {item.sku}</div>}

            <div className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">{item.name}</div>

            {(item.rating || item.reviews) && (
              <div className="mt-1 flex items-center gap-2">
                <Stars rating={item.rating} />
                {typeof item.reviews === "number" && (
                  <span className="text-[11px] text-muted-foreground">({item.reviews})</span>
                )}
              </div>
            )}

            {categoryName && <div className="text-[11px] text-muted-foreground">{categoryName}</div>}

            <div className="mt-1 flex items-baseline gap-2">
              <div className={originalPrice ? "text-destructive font-bold" : "text-primary font-bold"}>
                ฿{Math.round(item.price).toLocaleString("th-TH")}
              </div>
              {originalPrice && (
                <div className="text-xs text-muted-foreground line-through">฿{originalPrice.toLocaleString("th-TH")}</div>
              )}
              {item.uom && <div className="text-[11px] text-muted-foreground">/ {item.uom}</div>}
            </div>
          </div>
        </div>
      </AdminEditable>
    </div>
  );
}

/* ================= Main Grid ================= */
export default function AdminProductGrid({
  initial,
  initialMeta,
}: {
  initial: UIProduct[];
  initialMeta?: UIMeta;
}) {
  const [items, setItems] = useState<UIProduct[]>(initial);
  const [meta, setMeta] = useState<UIMeta>(
    initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" },
  );
  const [catMap, setCatMap] = useState<Record<string | number, UICategoryLite>>({});

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metaSaving, setMetaSaving] = useState(false);

  const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
  const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
  const [creating, setCreating] = useState(false);

  useEffect(() => setItems(initial), [initial]);

  useEffect(() => {
    if (!initialMeta) {
      (async () => {
        try {
          const res = await fetch(API_BASE, { cache: "no-store" });
          if (!res.ok) return;
          const data = await res.json();
          if (data?.meta) setMeta(data.meta as UIMeta);
        } catch {}
      })();
    }

    (async () => {
      try {
        const res = await fetch(CAT_API, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const items: Array<{ id: number | string; name: string; slug?: string }> = data?.items ?? [];
        const map: Record<string | number, UICategoryLite> = {};
        for (const c of items) map[c.id] = { id: c.id, name: c.name, slug: c.slug };
        setCatMap(map);
      } catch {}
    })();
  }, [initialMeta]);

  const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
  const saveAbortRef = useRef<AbortController | null>(null);
  const reorderTimer = useRef<NodeJS.Timeout | null>(null);
  const metaTimer = useRef<NodeJS.Timeout | null>(null);
  const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

  const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
    if (reorderTimer.current) clearTimeout(reorderTimer.current);
    lastOrdersRef.current = orders;
    reorderTimer.current = setTimeout(async () => {
      try {
        setSaving(true);
        setError(null);
        saveAbortRef.current?.abort();
        saveAbortRef.current = new AbortController();

        const res = await fetch(`${API_BASE}/reorder`, {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({ orders: lastOrdersRef.current }),
          signal: saveAbortRef.current.signal,
        });
        if (!res.ok) throw new Error("REORDER failed");
      } catch (e: any) {
        setError(e?.message ?? "Reorder failed");
      } finally {
        setSaving(false);
      }
    }, 400);
  };

  const patchMeta = (patch: Partial<UIMeta>) => {
    if (metaTimer.current) clearTimeout(metaTimer.current);
    setMeta((m) => ({ ...m, ...patch }));

    metaTimer.current = setTimeout(async () => {
      try {
        setMetaSaving(true);
        const res = await fetch(`${API_BASE}/meta`, {
          method: "PATCH",
          headers: jsonHeaders,
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error("Update meta failed");
      } catch {
      } finally {
        setMetaSaving(false);
      }
    }, 500);
  };

  const handleDelete = async (id: UIProduct["id"]) => {
    const snapshot = items;
    setItems((prev) => prev.filter((x) => x.id !== id));
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("DELETE failed");
    } catch (e: any) {
      setItems(snapshot);
      setError(e?.message ?? "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: UIProduct["id"]) => {
    const snapshot = items;
    const current = snapshot.find((x) => x.id === id);
    const nextVisible = !(current?.visible ?? true);

    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify({ visible: nextVisible }),
      });
      if (!res.ok) throw new Error("PATCH failed");
    } catch (e: any) {
      setItems(snapshot);
      setError(e?.message ?? "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const onDragEnd = (ev: DragEndEvent) => {
    const { active, over } = ev;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);

    const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
    setItems(next);
    postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
  };

  // create
  const saveCreate = async (values: ProductEditValues) => {
    const res = await fetch(`${API_BASE}`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        ...values,
        visible: false, // default: ซ่อนก่อน
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(t || "Create failed");
    }
    const data = await res.json();
    const item = data?.item as UIProduct | undefined;
    if (!item) throw new Error("No item returned");
    setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
  };

  // edit
  const saveEdit = async (values: ProductEditValues) => {
    if (!editingItem) return;
    const id = editingItem.id;

    const snapshot = items;
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("PATCH failed");
    } catch (e: any) {
      setItems(snapshot);
      throw e;
    }
  };

  return (
    <section className="py-4 relative">
      {(saving || metaSaving) && (
        <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
          {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
          {metaSaving && (
            <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>
          )}
        </div>
      )}

      {error && (
        <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Header + Add */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-2xl font-semibold mb-2">
            <input
              className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
              value={meta.title}
              onChange={(e) => patchMeta({ title: e.target.value })}
              aria-label="Title"
            />
          </div>
          <input
            className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
            value={meta.subtitle}
            onChange={(e) => patchMeta({ subtitle: e.target.value })}
            aria-label="Subtitle"
          />
        </div>
        <button
          type="button"
          className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
          onClick={() => setCreating(true)}
        >
          + เพิ่มสินค้า
        </button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
            {items.map((item) => (
              <SortableProduct
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onToggleVisible={handleToggle}
                onEdit={(id) => setEditingId(id)}
                categoryName={item.category_id != null ? catMap[item.category_id]?.name : undefined}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Create */}
      <AdminProductEditDialog
        open={creating}
        initial={{ name: "", brand: "", sku: "", price: 0, discountPercent: 0, image_url: undefined }}
        onClose={() => setCreating(false)}
        onSave={async (vals) => {
          await saveCreate(vals);
          setCreating(false);
        }}
        mode="create"
      />

      {/* Edit */}
      <AdminProductEditDialog
        open={!!editingItem}
        initial={
          editingItem
            ? {
                name: editingItem.name,
                brand: editingItem.brand ?? "",
                sku: editingItem.sku ?? "",
                price: editingItem.price,
                discountPercent: editingItem.discountPercent ?? 0,
                image_url: editingItem.image_url,
              }
            : { name: "", brand: "", sku: "", price: 0, discountPercent: 0 }
        }
        onClose={() => setEditingId(null)}
        onSave={async (vals) => {
          await saveEdit(vals);
          setEditingId(null);
        }}
        mode="edit"
      />
    </section>
  );
}


// v.1.1.8 =================================================

// v.1.1.7 =================================================
// // src/app/admin/components/AdminProductGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;

//   rating?: number;
//   reviews?: number;

//   category_id?: number | string;
//   uom?: string; // <<< หน่วยสินค้า
// };

// type UIMeta = { title: string; subtitle: string };
// type UICategoryLite = { id: number | string; name: string; slug?: string };

// const API_BASE = "/api/mock/products";
// const CAT_API = "/api/mock/categories";

// /* =============== Helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// // สีกรอบตามส่วนลด
// function frameBorderClass(p?: number) {
//   if (!p || p < 10) return "border-transparent";
//   if (p >= 90) return "border-red-500";
//   if (p >= 80) return "border-yellow-500";
//   if (p >= 70) return "border-amber-500";
//   if (p >= 60) return "border-sky-500";
//   return "border-slate-300";
// }

// // ปรับ SVG ให้ดาวที่ไม่ได้เลือก "ไม่มี fill" (แก้ปัญหาสีดำ)
// function Stars({ rating = 0 }: { rating?: number }) {
//   const full = Math.max(0, Math.min(5, Math.floor(rating)));
//   return (
//     <div className="flex items-center gap-1">
//       {Array.from({ length: 5 }).map((_, i) => {
//         const filled = i < full;
//         return (
//           <svg
//             key={i}
//             viewBox="0 0 20 20"
//             className={`h-3.5 w-3.5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
//             fill={filled ? "currentColor" : "none"}
//             stroke={filled ? "none" : "currentColor"}
//             strokeWidth={filled ? 0 : 1.3}
//           >
//             <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.947 5.956 6.562.954-4.755 4.634 1.123 6.545z" />
//           </svg>
//         );
//       })}
//     </div>
//   );
// }

// /* =============== Sortable Card (styled like frontend) =============== */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
//   categoryName,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
//   categoryName?: string;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

//   const isHidden = item.visible === false;
//   const originalPrice = calcOriginalPrice(item.price, item.discountPercent);

//   return (
//     <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
//       <AdminEditable
//         onDelete={() => onDelete(item.id)}
//         onToggleVisible={() => onToggleVisible(item.id)}
//         onEdit={() => onEdit(item.id)}
//         visible={item.visible ?? true}
//         dragHandleProps={{ ...attributes, ...listeners }}
//       >
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {/* ภาพ + ป้ายลดราคา + กรอบสีส่วนลด (ใหม่) */}
//           <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-xl">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 1280px) 33vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
//             />

//             {/* กรอบ overlay ครบ 4 ด้าน (บาง) */}
//             <div
//               className={[
//                 "pointer-events-none absolute inset-0 rounded-xl border-2",
//                 frameBorderClass(item.discountPercent),
//               ].join(" ")}
//             />

//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
//                 -{item.discountPercent}%
//               </span>
//             )}
//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           {/* เนื้อหา (เดิมทั้งหมด) */}
//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>}
//             {item.sku && <div className="text-[11px] text-muted-foreground">SKU: {item.sku}</div>}

//             <div className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">{item.name}</div>

//             {(item.rating || item.reviews) && (
//               <div className="mt-1 flex items-center gap-2">
//                 <Stars rating={item.rating} />
//                 {typeof item.reviews === "number" && (
//                   <span className="text-[11px] text-muted-foreground">({item.reviews})</span>
//                 )}
//               </div>
//             )}

//             {categoryName && <div className="text-[11px] text-muted-foreground">{categoryName}</div>}

//             <div className="mt-1 flex items-baseline gap-2">
//               <div className={originalPrice ? "text-destructive font-bold" : "text-primary font-bold"}>
//                 ฿{Math.round(item.price).toLocaleString("th-TH")}
//               </div>
//               {originalPrice && (
//                 <div className="text-xs text-muted-foreground line-through">฿{originalPrice.toLocaleString("th-TH")}</div>
//               )}
//               {item.uom && <div className="text-[11px] text-muted-foreground">/ {item.uom}</div>}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" },
//   );
//   const [catMap, setCatMap] = useState<Record<string | number, UICategoryLite>>({});

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (!initialMeta) {
//       (async () => {
//         try {
//           const res = await fetch(API_BASE, { cache: "no-store" });
//           if (!res.ok) return;
//           const data = await res.json();
//           if (data?.meta) setMeta(data.meta as UIMeta);
//         } catch {}
//       })();
//     }

//     (async () => {
//       try {
//         const res = await fetch(CAT_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const items: Array<{ id: number | string; name: string; slug?: string }> = data?.items ?? [];
//         const map: Record<string | number, UICategoryLite> = {};
//         for (const c of items) map[c.id] = { id: c.id, name: c.name, slug: c.slug };
//         setCatMap(map);
//       } catch {}
//     })();
//   }, [initialMeta]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));

//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch {
//       } finally {
//         setMetaSaving(false);
//       }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as UIProduct | undefined;
//     if (!item) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-6 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <button
//           type="button"
//           className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//           onClick={() => setCreating(true)}
//         >
//           + เพิ่มสินค้า
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableProduct
//                 key={item.id}
//                 item={item}
//                 onDelete={handleDelete}
//                 onToggleVisible={handleToggle}
//                 onEdit={(id) => setEditingId(id)}
//                 categoryName={item.category_id != null ? catMap[item.category_id]?.name : undefined}
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{ name: "", brand: "", sku: "", price: 0, discountPercent: 0, image_url: undefined }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//         mode="create"
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//               }
//             : { name: "", brand: "", sku: "", price: 0, discountPercent: 0 }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//         mode="edit"
//       />
//     </section>
//   );
// }

// v.1.1.7 =================================================

// v.1.1.6 =================================================
// // src/app/admin/components/AdminProductGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;

//   rating?: number;
//   reviews?: number;

//   category_id?: number | string;
//   uom?: string; // <<< เพิ่มหน่วยสินค้า
// };

// type UIMeta = { title: string; subtitle: string };
// type UICategoryLite = { id: number | string; name: string; slug?: string };

// const API_BASE = "/api/mock/products";
// const CAT_API = "/api/mock/categories";

// /* =============== Helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// // ปรับ SVG ให้ดาวที่ไม่ได้เลือก "ไม่มี fill" (แก้ปัญหาสีดำ)
// function Stars({ rating = 0 }: { rating?: number }) {
//   const full = Math.max(0, Math.min(5, Math.floor(rating)));
//   return (
//     <div className="flex items-center gap-1">
//       {Array.from({ length: 5 }).map((_, i) => {
//         const filled = i < full;
//         return (
//           <svg
//             key={i}
//             viewBox="0 0 20 20"
//             className={`h-3.5 w-3.5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
//             fill={filled ? "currentColor" : "none"}
//             stroke={filled ? "none" : "currentColor"}
//             strokeWidth={filled ? 0 : 1.3}
//           >
//             <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.947 5.956 6.562.954-4.755 4.634 1.123 6.545z" />
//           </svg>
//         );
//       })}
//     </div>
//   );
// }

// /* =============== Sortable Card (styled like frontend) =============== */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
//   categoryName,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
//   categoryName?: string;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

//   const isHidden = item.visible === false;
//   const originalPrice = calcOriginalPrice(item.price, item.discountPercent);

//   return (
//     <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
//       <AdminEditable
//         onDelete={() => onDelete(item.id)}
//         onToggleVisible={() => onToggleVisible(item.id)}
//         onEdit={() => onEdit(item.id)}
//         visible={item.visible ?? true}
//         dragHandleProps={{ ...attributes, ...listeners }}
//       >
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {/* ภาพ + ป้ายลดราคา */}
//           <div className="relative aspect-square overflow-hidden bg-muted/30">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 1280px) 33vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
//             />
//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
//                 -{item.discountPercent}%
//               </span>
//             )}
//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           {/* เนื้อหา */}
//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>}
//             {item.sku && <div className="text-[11px] text-muted-foreground">SKU: {item.sku}</div>}

//             <div className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">{item.name}</div>

//             {(item.rating || item.reviews) && (
//               <div className="mt-1 flex items-center gap-2">
//                 <Stars rating={item.rating} />
//                 {typeof item.reviews === "number" && (
//                   <span className="text-[11px] text-muted-foreground">({item.reviews})</span>
//                 )}
//               </div>
//             )}

//             {categoryName && <div className="text-[11px] text-muted-foreground">{categoryName}</div>}

//             <div className="mt-1 flex items-baseline gap-2">
//               <div className={originalPrice ? "text-destructive font-bold" : "text-primary font-bold"}>
//                 ฿{Math.round(item.price).toLocaleString("th-TH")}
//               </div>
//               {originalPrice && (
//                 <div className="text-xs text-muted-foreground line-through">฿{originalPrice.toLocaleString("th-TH")}</div>
//               )}
//               {item.uom && <div className="text-[11px] text-muted-foreground">/ {item.uom}</div>}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" },
//   );
//   const [catMap, setCatMap] = useState<Record<string | number, UICategoryLite>>({});

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (!initialMeta) {
//       (async () => {
//         try {
//           const res = await fetch(API_BASE, { cache: "no-store" });
//           if (!res.ok) return;
//           const data = await res.json();
//           if (data?.meta) setMeta(data.meta as UIMeta);
//         } catch {}
//       })();
//     }

//     (async () => {
//       try {
//         const res = await fetch(CAT_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const items: Array<{ id: number | string; name: string; slug?: string }> = data?.items ?? [];
//         const map: Record<string | number, UICategoryLite> = {};
//         for (const c of items) map[c.id] = { id: c.id, name: c.name, slug: c.slug };
//         setCatMap(map);
//       } catch {}
//     })();
//   }, [initialMeta]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));

//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch {
//       } finally {
//         setMetaSaving(false);
//       }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as UIProduct | undefined;
//     if (!item) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-6 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <button
//           type="button"
//           className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//           onClick={() => setCreating(true)}
//         >
//           + เพิ่มสินค้า
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableProduct
//                 key={item.id}
//                 item={item}
//                 onDelete={handleDelete}
//                 onToggleVisible={handleToggle}
//                 onEdit={(id) => setEditingId(id)}
//                 categoryName={item.category_id != null ? catMap[item.category_id]?.name : undefined}
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{ name: "", brand: "", sku: "", price: 0, discountPercent: 0, image_url: undefined }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//         mode="create"
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//               }
//             : { name: "", brand: "", sku: "", price: 0, discountPercent: 0 }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//         mode="edit"
//       />
//     </section>
//   );
// }

// v.1.1.6 =================================================

// v.1.1.5 ===============================================
// // src/app/admin/components/AdminProductGrid.tsx
// //  v.1.1.5 — show category + tags in edit dialog

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;

//   rating?: number;
//   reviews?: number;

//   category_id?: number | string;
// };

// type UIMeta = { title: string; subtitle: string };

// // สำหรับ categories ที่ดึงมาจาก mock
// type UICategoryLite = { id: number | string; name: string; slug?: string };

// const API_BASE = "/api/mock/products";
// const CAT_API = "/api/mock/categories";

// /* =============== Small helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// function Stars({ rating = 0 }: { rating?: number }) {
//   const stars = Math.max(0, Math.min(5, Math.floor(rating)));
//   return (
//     <div className="flex items-center gap-1">
//       {Array.from({ length: 5 }).map((_, i) => (
//         <svg
//           key={i}
//           viewBox="0 0 20 20"
//           className={`h-3.5 w-3.5 ${i < stars ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
//         >
//           <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.947 5.956 6.562.954-4.755 4.634 1.123 6.545z" />
//         </svg>
//       ))}
//     </div>
//   );
// }

// /* =============== Sortable Card (styled like frontend) =============== */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
//   categoryName,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
//   categoryName?: string;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

//   const isHidden = item.visible === false;
//   const originalPrice = calcOriginalPrice(item.price, item.discountPercent);

//   return (
//     <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
//       <AdminEditable
//         onDelete={() => onDelete(item.id)}
//         onToggleVisible={() => onToggleVisible(item.id)}
//         onEdit={() => onEdit(item.id)}
//         visible={item.visible ?? true}
//         dragHandleProps={{ ...attributes, ...listeners }}
//       >
//         {/* การ์ดสไตล์เดียวกับ ProductCard (grid view) */}
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {/* ภาพสินค้า + ป้ายลดราคา */}
//           <div className="relative aspect-square overflow-hidden bg-muted/30">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 1280px) 33vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
//             />
//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
//                 -{item.discountPercent}%
//               </span>
//             )}
//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           {/* เนื้อหาเหมือน ProductCard */}
//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>}
//             {item.sku && <div className="text-[11px] text-muted-foreground">SKU: {item.sku}</div>}

//             <div className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">{item.name}</div>

//             {/* Stars + reviews */}
//             {(item.rating || item.reviews) && (
//               <div className="mt-1 flex items-center gap-2">
//                 <Stars rating={item.rating} />
//                 {typeof item.reviews === "number" && (
//                   <span className="text-[11px] text-muted-foreground">({item.reviews})</span>
//                 )}
//               </div>
//             )}

//             {/* ชื่อหมวดหมู่ (มาจาก category map) */}
//             {categoryName && (
//               <div className="text-[11px] text-muted-foreground">{categoryName}</div>
//             )}

//             {/* ราคา / ราคาเดิม */}
//             <div className="mt-1 flex items-baseline gap-2">
//               <div className={originalPrice ? "text-destructive font-bold" : "text-primary font-bold"}>
//                 ฿{Math.round(item.price).toLocaleString("th-TH")}
//               </div>
//               {originalPrice && (
//                 <div className="text-xs text-muted-foreground line-through">฿{originalPrice.toLocaleString("th-TH")}</div>
//               )}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" },
//   );

//   // โหลด categories มาแม็พ id -> name
//   const [catMap, setCatMap] = useState<Record<string | number, UICategoryLite>>({});

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   // edit/create dialog
//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     // โหลด meta products ถ้า server ไม่ได้ส่งมา
//     if (!initialMeta) {
//       (async () => {
//         try {
//           const res = await fetch(API_BASE, { cache: "no-store" });
//           if (!res.ok) return;
//           const data = await res.json();
//           if (data?.meta) setMeta(data.meta as UIMeta);
//         } catch {}
//       })();
//     }

//     // โหลด categories เพื่อทำ map
//     (async () => {
//       try {
//         const res = await fetch(CAT_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const items: Array<{ id: number | string; name: string; slug?: string; visible?: boolean }> =
//           data?.items ?? [];
//         const map: Record<string | number, UICategoryLite> = {};
//         for (const c of items) map[c.id] = { id: c.id, name: c.name, slug: c.slug };
//         setCatMap(map);
//       } catch {}
//     })();
//   }, [initialMeta]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));

//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch {
//       } finally {
//         setMetaSaving(false);
//       }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as UIProduct | undefined;
//     if (!item) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-6 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <button
//           type="button"
//           className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//           onClick={() => setCreating(true)}
//         >
//           + เพิ่มสินค้า
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableProduct
//                 key={item.id}
//                 item={item}
//                 onDelete={handleDelete}
//                 onToggleVisible={handleToggle}
//                 onEdit={(id) => setEditingId(id)}
//                 categoryName={item.category_id != null ? catMap[item.category_id]?.name : undefined}
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{ name: "", brand: "", sku: "", price: 0, discountPercent: 0, image_url: undefined }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//         mode="create"
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//               }
//             : { name: "", brand: "", sku: "", price: 0, discountPercent: 0 }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//         mode="edit"
//       />
//     </section>
//   );
// }

// v.1.1.5 ===============================================


// v.1.1.4 ===============================================
// // src/app/admin/components/AdminProductGrid.tsx
// // v.1.2.0 — show rating/reviews + SKU line + UOM next to price

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Star } from "lucide-react";
// import { cn } from "@/lib/utils";

// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;
//   rating?: number;
//   reviews?: number;
//   uom?: string; // ⭐ หน่วยสินค้า
// };

// type UIMeta = { title: string; subtitle: string };

// const API_BASE = "/api/mock/products";

// /* =============== Helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// /* =============== Sortable Card =============== */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

//   const isHidden = item.visible === false;
//   const originalPrice = calcOriginalPrice(item.price, item.discountPercent);

//   return (
//     <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
//       <AdminEditable
//         onDelete={() => onDelete(item.id)}
//         onToggleVisible={() => onToggleVisible(item.id)}
//         onEdit={() => onEdit(item.id)}
//         visible={item.visible ?? true}
//         dragHandleProps={{ ...attributes, ...listeners }}
//       >
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           <div className="relative aspect-square overflow-hidden bg-muted/30">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 1280px) 33vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
//             />

//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
//                 -{item.discountPercent}%
//               </span>
//             )}

//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && (
//               <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>
//             )}
//             {/* ⭐ SKU บรรทัดถัดจากยี่ห้อ */}
//             {item.sku && (
//               <div className="text-[11px] text-muted-foreground/80">SKU: {item.sku}</div>
//             )}

//             <div className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">
//               {item.name}
//             </div>

//             {/* Rating + reviews */}
//             {typeof item.rating === "number" && (
//               <div className="flex items-center gap-1 mb-1">
//                 <div className="flex items-center">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className={cn(
//                         "h-3.5 w-3.5",
//                         i < Math.floor(item.rating ?? 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
//                       )}
//                     />
//                   ))}
//                 </div>
//                 <span className="text-xs text-muted-foreground">
//                   ({item.reviews ?? 0})
//                 </span>
//               </div>
//             )}

//             {/* ราคา + UOM */}
//             <div className="mt-1 flex items-baseline gap-2">
//               <div className={originalPrice ? "text-destructive font-bold" : "text-primary font-bold"}>
//                 ฿{Math.round(item.price).toLocaleString("th-TH")}
//               </div>
//               {originalPrice && (
//                 <div className="text-xs text-muted-foreground line-through">
//                   ฿{originalPrice.toLocaleString("th-TH")}
//                 </div>
//               )}
//               {item.uom && (
//                 <span className="ml-1 text-xs text-muted-foreground">/ {item.uom}</span>
//               )}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" }
//   );

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (initialMeta) return;
//     (async () => {
//       try {
//         const res = await fetch(API_BASE, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         if (data?.meta) setMeta(data.meta as UIMeta);
//       } catch { /* noop */ }
//     })();
//   }, [initialMeta]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));
//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch { /* noop */ }
//       finally { setMetaSaving(false); }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally { setSaving(false); }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally { setSaving(false); }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as UIProduct | undefined;
//     if (!item) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
//           {metaSaving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-6 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <button
//           type="button"
//           className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//           onClick={() => setCreating(true)}
//         >
//           + เพิ่มสินค้า
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableProduct
//                 key={item.id}
//                 item={item}
//                 onDelete={handleDelete}
//                 onToggleVisible={handleToggle}
//                 onEdit={(id) => setEditingId(id)}
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{ name: "", brand: "", sku: "", price: 0, discountPercent: 0, image_url: undefined }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => { await saveCreate(vals); setCreating(false); }}
//         mode="create"
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//               }
//             : { name: "", brand: "", sku: "", price: 0, discountPercent: 0 }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => { await saveEdit(vals); setEditingId(null); }}
//         mode="edit"
//       />
//     </section>
//   );
// }

// v.1.1.4 ===============================================

// v.1.1.3 ===============================================  
// // src/app/admin/components/AdminProductGrid.tsx
// // v.1.1.3  — show rating/reviews on admin product card

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Star } from "lucide-react";
// import { cn } from "@/lib/utils";

// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;
//   rating?: number;   // ⭐️ added
//   reviews?: number;  // ⭐️ added
// };

// type UIMeta = { title: string; subtitle: string };

// const API_BASE = "/api/mock/products";

// /* =============== Small helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// /* =============== Sortable Card (styled like frontend) =============== */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

//   const isHidden = item.visible === false;
//   const originalPrice = calcOriginalPrice(item.price, item.discountPercent);

//   return (
//     <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
//       <AdminEditable
//         onDelete={() => onDelete(item.id)}
//         onToggleVisible={() => onToggleVisible(item.id)}
//         onEdit={() => onEdit(item.id)}
//         visible={item.visible ?? true}
//         dragHandleProps={{ ...attributes, ...listeners }}
//       >
//         {/* การ์ดสไตล์เดียวกับ ProductCard (grid view) */}
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {/* ภาพสินค้า: aspect-square + badge ส่วนลด */}
//           <div className="relative aspect-square overflow-hidden bg-muted/30">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 1280px) 33vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
//             />

//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
//                 -{item.discountPercent}%
//               </span>
//             )}

//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           {/* เนื้อหาเหมือน ProductCard */}
//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && (
//               <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>
//             )}

//             <div className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">
//               {item.name}
//             </div>

//             {/* ⭐️ rating + reviews */}
//             {typeof item.rating === "number" && (
//               <div className="flex items-center gap-1 mb-1">
//                 <div className="flex items-center">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className={cn(
//                         "h-3.5 w-3.5",
//                         i < Math.floor(item.rating ?? 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
//                       )}
//                     />
//                   ))}
//                 </div>
//                 <span className="text-xs text-muted-foreground">
//                   ({item.reviews ?? 0})
//                 </span>
//               </div>
//             )}

//             {/* ราคา */}
//             <div className="mt-1 flex items-baseline gap-2">
//               <div className={originalPrice ? "text-destructive font-bold" : "text-primary font-bold"}>
//                 ฿{Math.round(item.price).toLocaleString("th-TH")}
//               </div>
//               {originalPrice && (
//                 <div className="text-xs text-muted-foreground line-through">
//                   ฿{originalPrice.toLocaleString("th-TH")}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" }
//   );

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   // edit/create dialog
//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (initialMeta) return;
//     (async () => {
//       try {
//         const res = await fetch(API_BASE, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         if (data?.meta) setMeta(data.meta as UIMeta);
//       } catch {
//         /* noop */
//       }
//     })();
//   }, [initialMeta]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));

//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch {
//         /* noop */
//       } finally {
//         setMetaSaving(false);
//       }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as UIProduct | undefined;
//     if (!item) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>
//           )}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-6 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <button
//           type="button"
//           className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//           onClick={() => setCreating(true)}
//         >
//           + เพิ่มสินค้า
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableProduct
//                 key={item.id}
//                 item={item}
//                 onDelete={handleDelete}
//                 onToggleVisible={handleToggle}
//                 onEdit={(id) => setEditingId(id)}
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{ name: "", brand: "", sku: "", price: 0, discountPercent: 0, image_url: undefined }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//         mode="create"
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//               }
//             : { name: "", brand: "", sku: "", price: 0, discountPercent: 0 }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//         mode="edit"
//       />
//     </section>
//   );
// }

// v.1.1.3 ===============================================

// v.1.1.2 ===============================================

// // src/app/admin/components/AdminProductGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;
//   // ถ้าภายหลังอยากโชว์เรตติ้งในแอดมิน เพิ่มสองบรรทัดนี้ใน _store ได้
//   rating?: number;
//   reviews?: number;
// };

// type UIMeta = { title: string; subtitle: string };

// const API_BASE = "/api/mock/products";

// /* =============== Small helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// /* =============== Sortable Card (styled like frontend) =============== */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

//   const isHidden = item.visible === false;
//   const originalPrice = calcOriginalPrice(item.price, item.discountPercent);

//   return (
//     <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
//       <AdminEditable
//         onDelete={() => onDelete(item.id)}
//         onToggleVisible={() => onToggleVisible(item.id)}
//         onEdit={() => onEdit(item.id)}
//         visible={item.visible ?? true}
//         dragHandleProps={{ ...attributes, ...listeners }}
//       >
//         {/* การ์ดสไตล์เดียวกับ ProductCard (grid view) */}
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {/* ภาพสินค้า: aspect-square + badge ส่วนลด */}
//           <div className="relative aspect-square overflow-hidden bg-muted/30">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 1280px) 33vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
//             />

//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
//                 -{item.discountPercent}%
//               </span>
//             )}

//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           {/* เนื้อหาเหมือน ProductCard */}
//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && (
//               <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>
//             )}
//             <div className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">
//               {item.name}
//             </div>

//             <div className="mt-1 flex items-baseline gap-2">
//               <div className={originalPrice ? "text-destructive font-bold" : "text-primary font-bold"}>
//                 {/* แอดมินโชว์ราคาแบบเร็ว ๆ (ไม่มีสกุลเงิน formatter ก็ได้) */}
//                 ฿{Math.round(item.price).toLocaleString("th-TH")}
//               </div>
//               {originalPrice && (
//                 <div className="text-xs text-muted-foreground line-through">
//                   ฿{originalPrice.toLocaleString("th-TH")}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" }
//   );

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   // edit/create dialog
//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (initialMeta) return;
//     (async () => {
//       try {
//         const res = await fetch(API_BASE, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         if (data?.meta) setMeta(data.meta as UIMeta);
//       } catch {
//         /* noop */
//       }
//     })();
//   }, [initialMeta]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));

//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch {
//         /* noop */
//       } finally {
//         setMetaSaving(false);
//       }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as UIProduct | undefined;
//     if (!item) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>
//           )}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-6 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <button
//           type="button"
//           className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//           onClick={() => setCreating(true)}
//         >
//           + เพิ่มสินค้า
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableProduct
//                 key={item.id}
//                 item={item}
//                 onDelete={handleDelete}
//                 onToggleVisible={handleToggle}
//                 onEdit={(id) => setEditingId(id)}
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{ name: "", brand: "", sku: "", price: 0, discountPercent: 0, image_url: undefined }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//         mode="create"
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//               }
//             : { name: "", brand: "", sku: "", price: 0, discountPercent: 0 }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//         mode="edit"
//       />
//     </section>
//   );
// }

// v.1.1.2 ===============================================


// // src/app/admin/components/AdminProductGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0, 60, 70, 80, 90
//   image_url?: string;
//   visible?: boolean;
//   order?: number;
// };

// type UIMeta = { title: string; subtitle: string };

// const API_BASE = "/api/mock/products";

// /* ---------- Sortable Card ---------- */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;
//   const isHidden = item.visible === false;

//   // กรอบสีตามเปอร์เซ็นต์
//   const ringByDiscount =
//     item.discountPercent && item.discountPercent >= 90
//       ? "ring-red-500"
//       : item.discountPercent && item.discountPercent >= 80
//       ? "ring-yellow-500"
//       : item.discountPercent && item.discountPercent >= 70
//       ? "ring-amber-500"
//       : item.discountPercent && item.discountPercent >= 60
//       ? "ring-sky-500"
//       : "ring-transparent";

//   return (
//     <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
//       <AdminEditable
//         onDelete={() => onDelete(item.id)}
//         onToggleVisible={() => onToggleVisible(item.id)}
//         onEdit={() => onEdit(item.id)}
//         visible={item.visible ?? true}
//         dragHandleProps={{ ...attributes, ...listeners }}
//       >
//         <div
//           className={[
//             "relative flex flex-col p-4 rounded-xl bg-card shadow-soft transition-all",
//             "ring-2", ringByDiscount,
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-2 ring-amber-300" : "",
//           ].join(" ")}
//         >
//           {isHidden && (
//             <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//               HIDDEN
//             </span>
//           )}

//           {item.discountPercent ? (
//             <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-md bg-black/80 text-white text-[10px] px-2 py-0.5">
//               -{item.discountPercent}%
//             </span>
//           ) : null}

//           <div className="mb-3 flex items-center justify-center">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               width={96}
//               height={96}
//               className="w-24 h-24 object-cover rounded-lg shadow-soft"
//             />
//           </div>

//           <div className="text-xs text-muted-foreground">{item.brand}</div>
//           <div className="text-sm font-medium leading-tight line-clamp-2 h-10">{item.name}</div>
//           <div className="mt-1 text-primary font-semibold">฿{Math.round(item.price).toLocaleString("th-TH")}</div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ---------- Main Grid ---------- */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" }
//   );

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   // edit/create dialog
//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find(i => i.id === editingId) ?? null : null;

//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (initialMeta) return;
//     (async () => {
//       try {
//         const res = await fetch(API_BASE, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         if (data?.meta) setMeta(data.meta as UIMeta);
//       } catch { /* noop */ }
//     })();
//   }, [initialMeta]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();
//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));
//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch { /* noop */ }
//       finally { setMetaSaving(false); }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally { setSaving(false); }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally { setSaving(false); }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;
//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);
//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as UIProduct | undefined;
//     if (!item) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;
//     const snapshot = items;
//     setItems(prev => prev.map(x => x.id === id ? { ...x, ...values } : x));
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
//           {metaSaving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-6 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <button
//           type="button"
//           className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//           onClick={() => setCreating(true)}
//         >
//           + เพิ่มสินค้า
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableProduct
//                 key={item.id}
//                 item={item}
//                 onDelete={handleDelete}
//                 onToggleVisible={handleToggle}
//                 onEdit={(id) => setEditingId(id)}
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{ name: "", brand: "", sku: "", price: 0, discountPercent: 0, image_url: undefined }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => { await saveCreate(vals); setCreating(false); }}
//         mode="create"
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//               }
//             : { name: "", brand: "", sku: "", price: 0, discountPercent: 0 }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => { await saveEdit(vals); setEditingId(null); }}
//         mode="edit"
//       />
//     </section>
//   );
// }

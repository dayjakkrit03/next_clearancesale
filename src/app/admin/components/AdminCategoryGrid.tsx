// v.1.1.9 =============================================
// src/app/admin/components/AdminCategoryGrid.tsxห

"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import AdminEditable from "./AdminEditable";
import AdminCategoryEditDialog, { EditValues } from "./AdminCategoryEditDialog";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type UICategory = {
  id: number | string;
  name: string;
  slug: string;
  image_url?: string;
  visible?: boolean;
  order?: number;
};

type UIMeta = {
  title: string;
  subtitle: string;
};

const API_BASE = "/api/mock/categories";

/* --------------------------- Sortable item card --------------------------- */
function SortableItem({
  item,
  onDelete,
  onToggleVisible,
  onEdit,
}: {
  item: UICategory;
  onDelete: (id: UICategory["id"]) => void;
  onToggleVisible: (id: UICategory["id"]) => void;
  onEdit: (id: UICategory["id"]) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;
  const isHidden = item.visible === false;

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
            "relative flex flex-col items-center p-6 rounded-xl bg-card shadow-soft transition-all",
            isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "",
          ].join(" ")}
        >
          {isHidden && (
            <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
              HIDDEN
            </span>
          )}

          <div className="mb-4">
            <Image
              src={item.image_url ?? "/placeholder.png"}
              alt={item.name}
              width={64}
              height={64}
              className="w-16 h-16 object-cover rounded-2xl shadow-soft"
            />
          </div>
          <span className="text-sm font-medium text-center leading-tight h-10">
            {item.name}
          </span>
        </div>
      </AdminEditable>
    </div>
  );
}

/* ------------------------------- Main grid ------------------------------- */
export default function AdminCategoryGrid({
  initial,
  initialMeta,
}: {
  initial: UICategory[];
  initialMeta?: UIMeta;
}) {
  const [items, setItems] = useState<UICategory[]>(initial);
  const [meta, setMeta] = useState<UIMeta>(
    initialMeta ?? { title: "Categories Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/categories" }
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metaSaving, setMetaSaving] = useState(false);

  // สำหรับแก้ไข
  const [editingId, setEditingId] = useState<UICategory["id"] | null>(null);
  const editingItem = editingId != null ? items.find(i => i.id === editingId) ?? null : null;

  // สำหรับ "เพิ่มใหม่"
  const [creating, setCreating] = useState(false);

  useEffect(() => setItems(initial), [initial]);

  useEffect(() => {
    if (initialMeta) return;
    (async () => {
      try {
        const res = await fetch(API_BASE, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.meta) setMeta(data.meta as UIMeta);
      } catch { /* noop */ }
    })();
  }, [initialMeta]);

  const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
  const saveAbortRef = useRef<AbortController | null>(null);
  const reorderTimer = useRef<NodeJS.Timeout | null>(null);
  const metaTimer = useRef<NodeJS.Timeout | null>(null);
  const lastOrdersRef = useRef<Array<{ id: UICategory["id"]; order: number }>>([]);

  const postReorder = (orders: Array<{ id: UICategory["id"]; order: number }>) => {
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
      } catch { /* noop */ }
      finally { setMetaSaving(false); }
    }, 500);
  };

  const handleDelete = async (id: UICategory["id"]) => {
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
    } finally { setSaving(false); }
  };

  const handleToggle = async (id: UICategory["id"]) => {
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
    } finally { setSaving(false); }
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

  // ===== สร้างใหม่ =====
  const saveCreate = async (values: EditValues) => {
    const res = await fetch(`${API_BASE}`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        name: values.name,
        slug: values.slug,
        image_url: values.image_url,
        visible: false,
      }),
    });

    if (!res.ok) {
      // ดึงข้อความ error จาก server (error หรือ errors[])
      let msg = "Create failed";
      try {
        const data = await res.json();
        if (Array.isArray(data?.errors) && data.errors.length) {
          msg = data.errors.join(", ");
        } else if (typeof data?.error === "string") {
          msg = data.error;
        }
      } catch {
        // ถ้า parse json ไม่ได้ fallback เป็นข้อความเดิม
      }
      throw new Error(msg);
    }

    const data = await res.json();
    const item = data?.item as UICategory | undefined;
    if (!item) throw new Error("No item returned");

    setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
  };

  // ===== แก้ไข (ชื่อ/slug/รูป) =====
  const saveEdit = async (values: EditValues) => {
    if (!editingItem) return;
    const id = editingItem.id;

    // optimistic update
    const snapshot = items;
    setItems(prev => prev.map(x =>
      x.id === id ? { ...x, name: values.name, slug: values.slug, image_url: values.image_url } : x
    ));

    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      // rollback แล้วโยน error รายละเอียดจาก server
      setItems(snapshot);
      let msg = "PATCH failed";
      try {
        const data = await res.json();
        if (Array.isArray(data?.errors) && data.errors.length) {
          msg = data.errors.join(", ");
        } else if (typeof data?.error === "string") {
          msg = data.error;
        }
      } catch {
        // ignore
      }
      throw new Error(msg);
    }
  };

  return (
    <section className="py-6 relative">
      {(saving || metaSaving) && (
        <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
          {saving && (
            <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">
              Saving…
            </span>
          )}
          {metaSaving && (
            <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">
              Saving title…
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Header + Add button */}
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
          + เพิ่มหมวดหมู่
        </button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
            {items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onToggleVisible={handleToggle}
                onEdit={(id) => setEditingId(id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Dialog: สร้างใหม่ */}
      <AdminCategoryEditDialog
        open={creating}
        initial={{ name: "", slug: "", image_url: undefined }}
        onClose={() => setCreating(false)}
        onSave={async (vals) => {
          await saveCreate(vals);
          setCreating(false);
        }}
        mode="create"
      />

      {/* Dialog: แก้ไข */}
      <AdminCategoryEditDialog
        open={!!editingItem}
        initial={
          editingItem
            ? { name: editingItem.name, slug: editingItem.slug, image_url: editingItem.image_url }
            : { name: "", slug: "" }
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

// v.1.1.9 =============================================

// v.1.1.8 ==============================================
// // src/app/admin/components/AdminCategoryGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminCategoryEditDialog, { EditValues } from "./AdminCategoryEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import {
//   SortableContext,
//   useSortable,
//   arrayMove,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// export type UICategory = {
//   id: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   visible?: boolean;
//   order?: number;
// };

// type UIMeta = {
//   title: string;
//   subtitle: string;
// };

// const API_BASE = "/api/mock/categories";

// /* --------------------------- Sortable item card --------------------------- */
// function SortableItem({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
// }: {
//   item: UICategory;
//   onDelete: (id: UICategory["id"]) => void;
//   onToggleVisible: (id: UICategory["id"]) => void;
//   onEdit: (id: UICategory["id"]) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;
//   const isHidden = item.visible === false;

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
//             "relative flex flex-col items-center p-6 rounded-xl bg-card shadow-soft transition-all",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "",
//           ].join(" ")}
//         >
//           {isHidden && (
//             <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//               HIDDEN
//             </span>
//           )}

//           <div className="mb-4">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               width={64}
//               height={64}
//               className="w-16 h-16 object-cover rounded-2xl shadow-soft"
//             />
//           </div>
//           <span className="text-sm font-medium text-center leading-tight h-10">
//             {item.name}
//           </span>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ------------------------------- Main grid ------------------------------- */
// export default function AdminCategoryGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UICategory[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UICategory[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Categories Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/categories" }
//   );

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   // สำหรับแก้ไข
//   const [editingId, setEditingId] = useState<UICategory["id"] | null>(null);
//   const editingItem = editingId != null ? items.find(i => i.id === editingId) ?? null : null;

//   // สำหรับ "เพิ่มใหม่"
//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (initialMeta) return;
//     (async () => {
//       try {
//         const res = await fetch(API_BASE, { cache: "no-store" });
//       if (!res.ok) return;
//         const data = await res.json();
//         if (data?.meta) setMeta(data.meta as UIMeta);
//       } catch { /* noop */ }
//     })();
//   }, [initialMeta]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UICategory["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UICategory["id"]; order: number }>) => {
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

//   const handleDelete = async (id: UICategory["id"]) => {
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

//   const handleToggle = async (id: UICategory["id"]) => {
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

//   // ===== สร้างใหม่ =====
//   const saveCreate = async (values: EditValues) => {
//     // ยิง POST ไปสร้าง แล้ว append item กลับเข้ากริด
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         name: values.name,
//         slug: values.slug,
//         image_url: values.image_url,
//         visible: true,
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as UICategory | undefined;
//     if (!item) throw new Error("No item returned");

//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // ===== แก้ไข (ชื่อ/slug/รูป) =====
//   const saveEdit = async (values: EditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     // optimistic update
//     const snapshot = items;
//     setItems(prev => prev.map(x =>
//       x.id === id ? { ...x, name: values.name, slug: values.slug, image_url: values.image_url } : x
//     ));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot); // rollback
//       throw e;
//     }
//   };

//   return (
//     <section className="py-6 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">
//               Saving…
//             </span>
//           )}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">
//               Saving title…
//             </span>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add button */}
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
//           + เพิ่มหมวดหมู่
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableItem
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

//       {/* Dialog: สร้างใหม่ */}
//       <AdminCategoryEditDialog
//         open={creating}
//         initial={{ name: "", slug: "", image_url: undefined }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//         mode="create"              // 👈 เพิ่มบอกโหมด
//       />

//       {/* Dialog: แก้ไข */}
//       <AdminCategoryEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? { name: editingItem.name, slug: editingItem.slug, image_url: editingItem.image_url }
//             : { name: "", slug: "" }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//         mode="edit"                // 👈 เพิ่มบอกโหมด
//       />
      
//     </section>
//   );
// }

// v.1.1.8 ==============================================


// v.1.1.7 ===============================================
// // src/app/admin/components/AdminCategoryGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminCategoryEditDialog, { EditValues } from "./AdminCategoryEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import {
//   SortableContext,
//   useSortable,
//   arrayMove,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// export type UICategory = {
//   id: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   visible?: boolean;
//   order?: number;
// };

// type UIMeta = {
//   title: string;
//   subtitle: string;
// };

// const API_BASE = "/api/mock/categories";

// /* --------------------------- Sortable item card --------------------------- */
// function SortableItem({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
// }: {
//   item: UICategory;
//   onDelete: (id: UICategory["id"]) => void;
//   onToggleVisible: (id: UICategory["id"]) => void;
//   onEdit: (id: UICategory["id"]) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;
//   const isHidden = item.visible === false;

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
//             "relative flex flex-col items-center p-6 rounded-xl bg-card shadow-soft transition-all",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "",
//           ].join(" ")}
//         >
//           {isHidden && (
//             <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//               HIDDEN
//             </span>
//           )}

//           <div className="mb-4">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               width={64}
//               height={64}
//               className="w-16 h-16 object-cover rounded-2xl shadow-soft"
//             />
//           </div>
//           <span className="text-sm font-medium text-center leading-tight h-10">
//             {item.name}
//           </span>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ------------------------------- Main grid ------------------------------- */
// export default function AdminCategoryGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UICategory[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UICategory[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Categories Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/categories" }
//   );

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   // สำหรับแก้ไข
//   const [editingId, setEditingId] = useState<UICategory["id"] | null>(null);
//   const editingItem = editingId != null ? items.find(i => i.id === editingId) ?? null : null;

//   // สำหรับ "เพิ่มใหม่"
//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (initialMeta) return;
//     (async () => {
//       try {
//         const res = await fetch(API_BASE, { cache: "no-store" });
//       if (!res.ok) return;
//         const data = await res.json();
//         if (data?.meta) setMeta(data.meta as UIMeta);
//       } catch { /* noop */ }
//     })();
//   }, [initialMeta]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UICategory["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UICategory["id"]; order: number }>) => {
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

//   const handleDelete = async (id: UICategory["id"]) => {
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

//   const handleToggle = async (id: UICategory["id"]) => {
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

//   // ===== สร้างใหม่ =====
//   const saveCreate = async (values: EditValues) => {
//     // ยิง POST ไปสร้าง แล้ว append item กลับเข้ากริด
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         name: values.name,
//         slug: values.slug,
//         image_url: values.image_url,
//         visible: true,
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as UICategory | undefined;
//     if (!item) throw new Error("No item returned");

//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // ===== แก้ไข (ชื่อ/slug/รูป) =====
//   const saveEdit = async (values: EditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     // optimistic update
//     const snapshot = items;
//     setItems(prev => prev.map(x =>
//       x.id === id ? { ...x, name: values.name, slug: values.slug, image_url: values.image_url } : x
//     ));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot); // rollback
//       throw e;
//     }
//   };

//   return (
//     <section className="py-6 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">
//               Saving…
//             </span>
//           )}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">
//               Saving title…
//             </span>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add button */}
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
//           + เพิ่มหมวดหมู่
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableItem
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

//       {/* Dialog: สร้างใหม่ */}
//       <AdminCategoryEditDialog
//         open={creating}
//         initial={{ name: "", slug: "", image_url: undefined }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//       />

//       {/* Dialog: แก้ไข */}
//       <AdminCategoryEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? { name: editingItem.name, slug: editingItem.slug, image_url: editingItem.image_url }
//             : { name: "", slug: "" }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//       />
//     </section>
//   );
// }

// v.1.1.7 ===============================================

// v.1.1.6 ===============================================
// // src/app/admin/components/AdminCategoryGrid.tsx
// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminCategoryEditDialog, { EditValues } from "./AdminCategoryEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import {
//   SortableContext,
//   useSortable,
//   arrayMove,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// export type UICategory = {
//   id: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   visible?: boolean;
//   order?: number;
// };

// type UIMeta = {
//   title: string;
//   subtitle: string;
// };

// const API_BASE = "/api/mock/categories";

// /* --------------------------- Sortable item card --------------------------- */
// function SortableItem({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
// }: {
//   item: UICategory;
//   onDelete: (id: UICategory["id"]) => void;
//   onToggleVisible: (id: UICategory["id"]) => void;
//   onEdit: (id: UICategory["id"]) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;
//   const isHidden = item.visible === false;

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
//             "relative flex flex-col items-center p-6 rounded-xl bg-card shadow-soft transition-all",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "",
//           ].join(" ")}
//         >
//           {isHidden && (
//             <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//               HIDDEN
//             </span>
//           )}

//           <div className="mb-4">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               width={64}
//               height={64}
//               className="w-16 h-16 object-cover rounded-2xl shadow-soft"
//             />
//           </div>
//           <span className="text-sm font-medium text-center leading-tight h-10">
//             {item.name}
//           </span>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ------------------------------- Main grid ------------------------------- */
// export default function AdminCategoryGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UICategory[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UICategory[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Categories Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/categories" }
//   );

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   // สำหรับแก้ไข
//   const [editingId, setEditingId] = useState<UICategory["id"] | null>(null);
//   const editingItem = editingId != null ? items.find(i => i.id === editingId) ?? null : null;

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
//   const lastOrdersRef = useRef<Array<{ id: UICategory["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UICategory["id"]; order: number }>) => {
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

//   const handleDelete = async (id: UICategory["id"]) => {
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

//   const handleToggle = async (id: UICategory["id"]) => {
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

//   // ★ บันทึกการแก้ไข (ชื่อ/slug/รูป)
//   const saveEdit = async (values: EditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     // optimistic update
//     const snapshot = items;
//     setItems(prev => prev.map(x =>
//       x.id === id ? { ...x, name: values.name, slug: values.slug, image_url: values.image_url } : x
//     ));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot); // rollback
//       throw e;            // ส่งให้ dialog แสดง error ต่อ
//     }
//   };

//   return (
//     <section className="py-6 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">
//               Saving…
//             </span>
//           )}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">
//               Saving title…
//             </span>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       <div className="mb-6">
//         <div className="text-2xl font-semibold mb-2">
//           <input
//             className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//             value={meta.title}
//             onChange={(e) => patchMeta({ title: e.target.value })}
//             aria-label="Title"
//           />
//         </div>
//         <input
//           className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//           value={meta.subtitle}
//           onChange={(e) => patchMeta({ subtitle: e.target.value })}
//           aria-label="Subtitle"
//         />
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableItem
//                 key={item.id}
//                 item={item}
//                 onDelete={handleDelete}
//                 onToggleVisible={handleToggle}
//                 onEdit={(id) => setEditingId(id)}   // ★ เปิด dialog
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* ★ Dialog แก้ไข */}
//       <AdminCategoryEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? { name: editingItem.name, slug: editingItem.slug, image_url: editingItem.image_url }
//             : { name: "", slug: "" }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={saveEdit}
//       />
//     </section>
//   );
// }

// v.1.1.6 ===============================================

// v.1.1.5 ================================================
// // src/app/admin/components/AdminCategoryGrid.tsx
// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import {
//   SortableContext,
//   useSortable,
//   arrayMove,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// export type UICategory = {
//   id: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   visible?: boolean; // ซ่อน/แสดงฝั่ง front
//   order?: number;    // ลำดับ
// };

// type UIMeta = {
//   title: string;
//   subtitle: string;
// };

// const API_BASE = "/api/mock/categories";

// /* --------------------------- Sortable item card --------------------------- */
// function SortableItem({
//   item,
//   onDelete,
//   onToggleVisible,
// }: {
//   item: UICategory;
//   onDelete: (id: UICategory["id"]) => void;
//   onToggleVisible: (id: UICategory["id"]) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

//   const isHidden = item.visible === false; // ★ ตรวจสถานะซ่อน

//   return (
//     <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
//       <AdminEditable
//         onDelete={() => onDelete(item.id)}
//         onToggleVisible={() => onToggleVisible(item.id)}
//         visible={item.visible ?? true}
//         dragHandleProps={{ ...attributes, ...listeners }}
//       >
//         <div
//           className={[
//             "relative flex flex-col items-center p-6 rounded-xl bg-card shadow-soft transition-all",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "",
//           ].join(" ")}
//         >
//           {/* ★ Badge มุมบนซ้าย แสดงตลอดถ้าถูกซ่อน */}
//           {isHidden && (
//             <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//               HIDDEN
//             </span>
//           )}

//           <div className="mb-4">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               width={64}
//               height={64}
//               className="w-16 h-16 object-cover rounded-2xl shadow-soft"
//             />
//           </div>
//           <span className="text-sm font-medium text-center leading-tight h-10">
//             {item.name}
//           </span>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ------------------------------- Main grid ------------------------------- */
// export default function AdminCategoryGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UICategory[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UICategory[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Categories Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/categories" }
//   );

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

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
//   const lastOrdersRef = useRef<Array<{ id: UICategory["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UICategory["id"]; order: number }>) => {
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

//   const handleDelete = async (id: UICategory["id"]) => {
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

//   const handleToggle = async (id: UICategory["id"]) => {
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

//   return (
//     <section className="py-6 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">
//               Saving…
//             </span>
//           )}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">
//               Saving title…
//             </span>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       <div className="mb-6">
//         <div className="text-2xl font-semibold mb-2">
//           <input
//             className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//             value={meta.title}
//             onChange={(e) => patchMeta({ title: e.target.value })}
//             aria-label="Title"
//           />
//         </div>
//         <input
//           className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//           value={meta.subtitle}
//           onChange={(e) => patchMeta({ subtitle: e.target.value })}
//           aria-label="Subtitle"
//         />
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableItem
//                 key={item.id}
//                 item={item}
//                 onDelete={handleDelete}
//                 onToggleVisible={handleToggle}
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>
//     </section>
//   );
// }

// v.1.1.5 ================================================


// v.1.1.4 ================================================
// // src/app/admin/components/AdminCategoryGrid.tsx
// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import {
//   SortableContext,
//   useSortable,
//   arrayMove,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// export type UICategory = {
//   id: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   visible?: boolean; // ซ่อน/แสดงฝั่ง front
//   order?: number;    // ลำดับ
// };

// type UIMeta = {
//   title: string;
//   subtitle: string;
// };

// const API_BASE = "/api/mock/categories";

// /* --------------------------- Sortable item card --------------------------- */
// function SortableItem({
//   item,
//   onDelete,
//   onToggleVisible,
// }: {
//   item: UICategory;
//   onDelete: (id: UICategory["id"]) => void;
//   onToggleVisible: (id: UICategory["id"]) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

//   return (
//     <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
//       <AdminEditable
//         onDelete={() => onDelete(item.id)}
//         onToggleVisible={() => onToggleVisible(item.id)}
//         visible={item.visible ?? true}
//         dragHandleProps={{ ...attributes, ...listeners }}
//       >
//         <div className="flex flex-col items-center p-6 rounded-xl bg-card shadow-soft transition-all">
//           <div className="mb-4">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               width={64}
//               height={64}
//               className="w-16 h-16 object-cover rounded-2xl shadow-soft"
//             />
//           </div>
//           <span className="text-sm font-medium text-center leading-tight h-10">
//             {item.name}
//           </span>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ------------------------------- Main grid ------------------------------- */
// export default function AdminCategoryGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UICategory[];
//   /** ออปชัน: ส่ง meta มาด้วยจาก server; ถ้าไม่ส่งจะ fetch เอง */
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UICategory[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(initialMeta ?? { title: "Categories Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/categories" });

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   // ซิงค์กับ prop ถ้ามีการเปลี่ยนจาก parent
//   useEffect(() => setItems(initial), [initial]);

//   // ถ้าไม่มี initialMeta ให้ดึงจาก API
//   useEffect(() => {
//     if (initialMeta) return;
//     (async () => {
//       try {
//         const res = await fetch(API_BASE, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         if (data?.meta) setMeta(data.meta as UIMeta);
//       } catch {
//         // เงียบไว้ ใช้ค่า default
//       }
//     })();
//   }, [initialMeta]);

//   /* ------------------------------ utilities ------------------------------ */
//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UICategory["id"]; order: number }>>([]);

//   // POST reorder (debounce)
//   const postReorder = (orders: Array<{ id: UICategory["id"]; order: number }>) => {
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

//   // PATCH meta (debounce)
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
//       } catch (e) {
//         // แค่แสดงสถานะ ไม่ rollback
//       } finally {
//         setMetaSaving(false);
//       }
//     }, 500);
//   };

//   /* -------------------------------- actions ------------------------------- */
//   const handleDelete = async (id: UICategory["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//     } catch (e: any) {
//       setItems(snapshot); // rollback
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UICategory["id"]) => {
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
//       setItems(snapshot); // rollback
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
//     setItems(next); // optimistic
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   /* -------------------------------- render -------------------------------- */
//   return (
//     <section className="py-6 relative">
//       {/* saving badges */}
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">
//               Saving…
//             </span>
//           )}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">
//               Saving title…
//             </span>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Editable title/subtitle */}
//       <div className="mb-6">
//         <div className="text-2xl font-semibold mb-2">
//           <input
//             className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//             value={meta.title}
//             onChange={(e) => patchMeta({ title: e.target.value })}
//             aria-label="Title"
//           />
//         </div>
//         <input
//           className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//           value={meta.subtitle}
//           onChange={(e) => patchMeta({ subtitle: e.target.value })}
//           aria-label="Subtitle"
//         />
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableItem
//                 key={item.id}
//                 item={item}
//                 onDelete={handleDelete}
//                 onToggleVisible={handleToggle}
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>
//     </section>
//   );
// }

// v.1.1.4 ================================================

// v.1.1.3 ================================================
// // src/app/admin/components/AdminCategoryGrid.tsx
// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import {
//   DndContext,
//   closestCenter,
//   DragEndEvent,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   useSortable,
//   arrayMove,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// export type UICategory = {
//   id: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   visible?: boolean; // ซ่อน/แสดงฝั่ง front
//   order?: number;    // ลำดับ
// };

// const API_BASE = "/api/mock/categories";

// function SortableItem({
//   item,
//   onDelete,
//   onToggleVisible,
// }: {
//   item: UICategory;
//   onDelete: (id: UICategory["id"]) => void;
//   onToggleVisible: (id: UICategory["id"]) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   } as React.CSSProperties;

//   return (
//     <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
//       <AdminEditable
//         onDelete={() => onDelete(item.id)}
//         onToggleVisible={() => onToggleVisible(item.id)}
//         visible={item.visible ?? true}
//         dragHandleProps={{ ...attributes, ...listeners }}
//       >
//         <div className="flex flex-col items-center p-6 rounded-xl bg-card shadow-soft transition-all">
//           <div className="mb-4">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               width={64}
//               height={64}
//               className="w-16 h-16 object-cover rounded-2xl shadow-soft"
//             />
//           </div>
//           <span className="text-sm font-medium text-center leading-tight h-10">
//             {item.name}
//           </span>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// export default function AdminCategoryGrid({ initial }: { initial: UICategory[] }) {
//   const [items, setItems] = useState<UICategory[]>(initial);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // ซิงค์กับ prop ถ้ามีการเปลี่ยนจาก parent
//   useEffect(() => setItems(initial), [initial]);

//   // ---- utilities ------------------------------------------------------------
//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const abortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UICategory["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UICategory["id"]; order: number }>) => {
//     // กันยิงถี่: debounce 400ms และยกเลิก req เก่าที่ค้างอยู่
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         abortRef.current?.abort();
//         abortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: abortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//         // ไม่ rollback ที่นี่ เพราะเราอัปเดตแบบ optimistic ไปแล้ว
//         // ถ้าต้อง rollback ให้เก็บ snapshot ก่อนหน้าแล้วเรียก setItems(snapshot)
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   // ---- actions --------------------------------------------------------------
//   const handleDelete = async (id: UICategory["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//     } catch (e: any) {
//       setItems(snapshot); // rollback
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UICategory["id"]) => {
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
//       setItems(snapshot); // rollback
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

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({
//       ...x,
//       order: i,
//     }));

//     setItems(next); // optimistic
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // ---- render ---------------------------------------------------------------
//   return (
//     <section className="py-6 relative">
//       {saving && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2">
//           <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">
//             Saving…
//           </span>
//         </div>
//       )}
//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       <div className="text-2xl font-semibold mb-2">Categories Management</div>
//       <p className="text-muted-foreground mb-6">
//         หน้านี้เชื่อมกับ <code>/api/mock/categories</code>
//       </p>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableItem
//                 key={item.id}
//                 item={item}
//                 onDelete={handleDelete}
//                 onToggleVisible={handleToggle}
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>
//     </section>
//   );
// }

// v.1.1.3 ================================================

// v.1.1.2 ================================================
// // src/app/admin/components/AdminCategoryGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import {
//   DndContext,
//   closestCenter,
//   DragEndEvent,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   useSortable,
//   arrayMove,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// export type UICategory = {
//   id: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   visible?: boolean;     // สำหรับซ่อน/แสดงในหน้า front
//   order?: number;        // ใช้กับ reorder
// };

// const API_BASE = "/api/mock/categories";

// function SortableItem({
//   item,
//   onDelete,
//   onToggleVisible,
// }: {
//   item: UICategory;
//   onDelete: (id: UICategory["id"]) => void;
//   onToggleVisible: (id: UICategory["id"]) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id: item.id });
//   const style = { transform: CSS.Transform.toString(transform), transition };

//   return (
//     <div ref={setNodeRef} style={style}>
//       <AdminEditable
//         onDelete={() => onDelete(item.id)}
//         onToggleVisible={() => onToggleVisible(item.id)}
//         visible={item.visible ?? true}
//         dragHandleProps={{ ...attributes, ...listeners }}
//       >
//         <div className="flex flex-col items-center p-6 rounded-xl bg-card shadow-soft transition-all">
//           <div className="mb-4">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               width={64}
//               height={64}
//               className="w-16 h-16 object-cover rounded-2xl shadow-soft"
//             />
//           </div>
//           <span className="text-sm font-medium text-center leading-tight h-10">
//             {item.name}
//           </span>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// export default function AdminCategoryGrid({ initial }: { initial: UICategory[] }) {
//   const [items, setItems] = useState<UICategory[]>(initial);

//   // เผื่อ initial ถูกอัพเดตจาก parent
//   useEffect(() => setItems(initial), [initial]);

//   // ลบ (optimistic + rollback)
//   const handleDelete = async (id: UICategory["id"]) => {
//     const prev = items;
//     setItems(prev.filter((x) => x.id !== id));

//     const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//     if (!res.ok) {
//       console.error("DELETE failed");
//       setItems(prev); // rollback
//     }
//   };

//   // ซ่อน/แสดง (optimistic + rollback)
//   const handleToggle = async (id: UICategory["id"]) => {
//     const prev = items;
//     const current = prev.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems(prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));

//     const res = await fetch(`${API_BASE}/${id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ visible: nextVisible }),
//     });
//     if (!res.ok) {
//       console.error("PATCH failed");
//       setItems(prev); // rollback
//     }
//   };

//   // เรียงลำดับ (optimistic + rollback)
//   const onDragEnd = async (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);
//     const prev = items;

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({
//       ...x,
//       order: i,
//     }));
//     setItems(next);

//     const res = await fetch(`${API_BASE}/reorder`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         orders: next.map((x) => ({ id: x.id, order: x.order ?? 0 })),
//       }),
//     });
//     if (!res.ok) {
//       console.error("REORDER failed");
//       setItems(prev); // rollback
//     }
//   };

//   return (
//     <section className="py-6">
//       <div className="text-2xl font-semibold mb-2">Categories Management</div>
//       <p className="text-muted-foreground mb-6">
//         หน้านี้เชื่อมกับ <code>/api/mock/categories</code> (Mock API). พร้อมสลับไป DB จริงเมื่อถึงเวลา
//       </p>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableItem
//                 key={item.id}
//                 item={item}
//                 onDelete={handleDelete}
//                 onToggleVisible={handleToggle}
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>
//     </section>
//   );
// }

// v.1.1.2 ================================================


// // src/app/admin/components/AdminCategoryGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import {
//   DndContext, closestCenter, DragEndEvent,
// } from "@dnd-kit/core";
// import {
//   SortableContext, useSortable, arrayMove, verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// export type UICategory = {
//   id: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   visible?: boolean; // สำหรับซ่อน/แสดงในหน้า front
// };

// function SortableItem({
//   item,
//   onDelete,
//   onToggleVisible,
// }: {
//   item: UICategory;
//   onDelete: (id: UICategory["id"]) => void;
//   onToggleVisible: (id: UICategory["id"]) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
//   const style = { transform: CSS.Transform.toString(transform), transition };

//   return (
//     <div ref={setNodeRef} style={style}>
//       <AdminEditable
//         onDelete={() => onDelete(item.id)}
//         onToggleVisible={() => onToggleVisible(item.id)}
//         visible={item.visible ?? true}
//         dragHandleProps={{ ...attributes, ...listeners }}
//       >
//         <div className="flex flex-col items-center p-6 rounded-xl bg-card shadow-soft transition-all">
//           <div className="mb-4">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               width={64}
//               height={64}
//               className="w-16 h-16 object-cover rounded-2xl shadow-soft"
//             />
//           </div>
//           <span className="text-sm font-medium text-center leading-tight h-10">
//             {item.name}
//           </span>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// export default function AdminCategoryGrid({ initial }: { initial: UICategory[] }) {
//   const [items, setItems] = useState<UICategory[]>(initial);

//   // ลบ
//   const handleDelete = (id: UICategory["id"]) => {
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     // TODO: เรียก DELETE /api/admin/clearance/categories/:id
//   };

//   // ซ่อน/แสดง
//   const handleToggle = (id: UICategory["id"]) => {
//     setItems((prev) =>
//       prev.map((x) => (x.id === id ? { ...x, visible: !(x.visible ?? true) } : x))
//     );
//     // TODO: PATCH visible
//   };

//   // เรียงลำดับ
//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;
//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);
//     const next = arrayMove(items, oldIndex, newIndex);
//     setItems(next);
//     // TODO: POST /api/admin/clearance/categories/reorder  ส่ง [{id, order}, ...]
//   };

//   return (
//     <section className="py-6">
//       <div className="text-2xl font-semibold mb-2">Categories Management</div>
//       <p className="text-muted-foreground mb-6">
//         หน้านี้เป็น mock ยังไม่เชื่อม API — ขั้นต่อไปเชื่อมกับ <code>/api/admin/clearance/categories</code>
//       </p>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableItem
//                 key={item.id}
//                 item={item}
//                 onDelete={handleDelete}
//                 onToggleVisible={handleToggle}
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>
//     </section>
//   );
// }

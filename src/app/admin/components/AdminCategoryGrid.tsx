// v.1.1.3 ================================================
// src/app/admin/components/AdminCategoryGrid.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import AdminEditable from "./AdminEditable";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
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
  visible?: boolean; // ซ่อน/แสดงฝั่ง front
  order?: number;    // ลำดับ
};

const API_BASE = "/api/mock/categories";

function SortableItem({
  item,
  onDelete,
  onToggleVisible,
}: {
  item: UICategory;
  onDelete: (id: UICategory["id"]) => void;
  onToggleVisible: (id: UICategory["id"]) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
      <AdminEditable
        onDelete={() => onDelete(item.id)}
        onToggleVisible={() => onToggleVisible(item.id)}
        visible={item.visible ?? true}
        dragHandleProps={{ ...attributes, ...listeners }}
      >
        <div className="flex flex-col items-center p-6 rounded-xl bg-card shadow-soft transition-all">
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

export default function AdminCategoryGrid({ initial }: { initial: UICategory[] }) {
  const [items, setItems] = useState<UICategory[]>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ซิงค์กับ prop ถ้ามีการเปลี่ยนจาก parent
  useEffect(() => setItems(initial), [initial]);

  // ---- utilities ------------------------------------------------------------
  const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
  const abortRef = useRef<AbortController | null>(null);
  const reorderTimer = useRef<NodeJS.Timeout | null>(null);
  const lastOrdersRef = useRef<Array<{ id: UICategory["id"]; order: number }>>([]);

  const postReorder = (orders: Array<{ id: UICategory["id"]; order: number }>) => {
    // กันยิงถี่: debounce 400ms และยกเลิก req เก่าที่ค้างอยู่
    if (reorderTimer.current) clearTimeout(reorderTimer.current);
    lastOrdersRef.current = orders;
    reorderTimer.current = setTimeout(async () => {
      try {
        setSaving(true);
        setError(null);
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        const res = await fetch(`${API_BASE}/reorder`, {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({ orders: lastOrdersRef.current }),
          signal: abortRef.current.signal,
        });
        if (!res.ok) throw new Error("REORDER failed");
      } catch (e: any) {
        setError(e?.message ?? "Reorder failed");
        // ไม่ rollback ที่นี่ เพราะเราอัปเดตแบบ optimistic ไปแล้ว
        // ถ้าต้อง rollback ให้เก็บ snapshot ก่อนหน้าแล้วเรียก setItems(snapshot)
      } finally {
        setSaving(false);
      }
    }, 400);
  };

  // ---- actions --------------------------------------------------------------
  const handleDelete = async (id: UICategory["id"]) => {
    const snapshot = items;
    setItems((prev) => prev.filter((x) => x.id !== id));
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("DELETE failed");
    } catch (e: any) {
      setItems(snapshot); // rollback
      setError(e?.message ?? "Delete failed");
    } finally {
      setSaving(false);
    }
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
      setItems(snapshot); // rollback
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

    const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({
      ...x,
      order: i,
    }));

    setItems(next); // optimistic
    postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
  };

  // ---- render ---------------------------------------------------------------
  return (
    <section className="py-6 relative">
      {saving && (
        <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2">
          <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">
            Saving…
          </span>
        </div>
      )}
      {error && (
        <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="text-2xl font-semibold mb-2">Categories Management</div>
      <p className="text-muted-foreground mb-6">
        หน้านี้เชื่อมกับ <code>/api/mock/categories</code>
      </p>

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
            {items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onToggleVisible={handleToggle}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}

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

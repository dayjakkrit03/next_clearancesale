// v.1.1.4 =============================================
// src/components/admin/hero-banners/hero-banners-list-admin.tsx

"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import HeroBannerRowAdmin, {
  type HeroBannerRow,
} from "./hero-banner-row-admin";

type Props = {
  rows: HeroBannerRow[];

  // multiple select controls
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string, checked: boolean) => void;

  // row actions
  onEdit: (id: string) => void;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function HeroBannersListAdmin({
  rows,
  selectable = false,
  selectedIds = new Set<string>(),
  onToggleSelect,
  onEdit,
  onToggleActive,
  onDelete,
}: Props) {
  if (!rows?.length) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">
        ไม่พบรายการ
      </div>
    );
  }

  // ใช้ SortableContext ถ้า parent setup DnD แล้ว (จะมีผลกับปุ่ม ⇅ ในแต่ละแถว)
  return (
    <div className="space-y-3">
      <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
        {rows.map((r) => (
          <HeroBannerRowAdmin
            key={r.id}
            item={r}
            onEdit={onEdit}
            onToggleActive={onToggleActive}
            onDelete={onDelete}
            selectable={selectable}
            selected={selectedIds.has(r.id)}
            onSelectToggle={onToggleSelect}
          />
        ))}
      </SortableContext>
    </div>
  );
}

// v.1.1.4 =============================================

// v.1.1.3 =============================================
// // src/components/admin/hero-banners/hero-banners-list-admin.tsx
// "use client";

// import { useMemo } from "react";
// import { Button } from "@/components/ui/button";
// import AdminEditableFloating from "@/app/admin/components/AdminEditableFloating";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import {
//   SortableContext,
//   useSortable,
//   verticalListSortingStrategy,
//   arrayMove,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// export type Row = {
//   id: string;
//   order: number;
//   isActive: boolean;
//   layoutMode: "image" | "overlay" | "split";
//   imageUrlDesktop: string;
//   title?: string;
//   startAt?: string;
//   endAt?: string;
// };

// type Props = {
//   rows: Row[];
//   selectedIds: Set<string>;
//   onToggleSelect: (id: string) => void;
//   onToggleSelectAll: (checked: boolean, idsOnPage: string[]) => void;

//   onEdit: (id: string) => void;
//   onToggleActive: (id: string) => void;
//   onDelete: (id: string) => void;

//   /** ส่งมาเพื่อให้ List view ลากเรียงได้ (ออปชัน) */
//   onReorder?: (orderedIds: string[]) => void;
// };

// export default function HeroBannersListAdmin({
//   rows,
//   selectedIds,
//   onToggleSelect,
//   onToggleSelectAll,
//   onEdit,
//   onToggleActive,
//   onDelete,
//   onReorder,
// }: Props) {
//   const allIds = useMemo(() => rows.map((r) => r.id), [rows]);
//   const allChecked = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
//   const indeterminate = !allChecked && allIds.some((id) => selectedIds.has(id));

//   const scheduleText = (r: Row) =>
//     r.startAt || r.endAt
//       ? `${r.startAt ? new Date(r.startAt).toLocaleDateString() : "-"} → ${
//           r.endAt ? new Date(r.endAt).toLocaleDateString() : "-"
//         }`
//       : "—";

//   const handleDragEnd = (e: DragEndEvent) => {
//     if (!onReorder) return;
//     const { active, over } = e;
//     if (!over || active.id === over.id) return;

//     const current = rows.map((r) => r.id);
//     const oldIndex = current.indexOf(String(active.id));
//     const newIndex = current.indexOf(String(over.id));
//     if (oldIndex < 0 || newIndex < 0) return;

//     const next = arrayMove(current, oldIndex, newIndex);
//     onReorder(next);
//   };

//   return (
//     <div className="rounded-lg border bg-card">
//       {/* Header row (pseudo-table head) */}
//       <div className="grid grid-cols-[42px_80px_minmax(220px,1fr)_110px_110px_minmax(220px,1fr)_minmax(200px,1fr)_140px] items-center gap-3 px-4 py-3 bg-muted/40 text-sm font-medium text-foreground/80">
//         <div>
//           <input
//             type="checkbox"
//             checked={allChecked}
//             ref={(el) => {
//               if (el) el.indeterminate = indeterminate;
//             }}
//             onChange={(e) => onToggleSelectAll(e.target.checked, allIds)}
//           />
//         </div>
//         <div>Order</div>
//         <div>ID</div>
//         <div>Mode</div>
//         <div>Active</div>
//         <div>Desktop Image</div>
//         <div>Title / Schedule</div>
//         <div className="text-right pr-1">Actions</div>
//       </div>

//       {/* Body rows (sortable list) */}
//       <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
//           {rows.length === 0 ? (
//             <div className="px-4 py-8 text-center text-muted-foreground text-sm">ไม่พบรายการ</div>
//           ) : (
//             rows.map((r) => (
//               <RowItem
//                 key={r.id}
//                 data={r}
//                 checked={selectedIds.has(r.id)}
//                 onCheck={() => onToggleSelect(r.id)}
//                 onEdit={() => onEdit(r.id)}
//                 onToggleActive={() => onToggleActive(r.id)}
//                 onDelete={() => onDelete(r.id)}
//               />
//             ))
//           )}
//         </SortableContext>
//       </DndContext>
//     </div>
//   );
// }

// /* ---------- Single Row (div-based, table-look) ---------- */

// function RowItem({
//   data,
//   checked,
//   onCheck,
//   onEdit,
//   onToggleActive,
//   onDelete,
// }: {
//   data: Row;
//   checked: boolean;
//   onCheck: () => void;
//   onEdit: () => void;
//   onToggleActive: () => void;
//   onDelete: () => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
//     id: data.id,
//   });
//   const style: React.CSSProperties = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className={[
//         "relative grid grid-cols-[42px_80px_minmax(220px,1fr)_110px_110px_minmax(220px,1fr)_minmax(200px,1fr)_140px]",
//         "items-center gap-3 px-4 py-3 border-t",
//         isDragging ? "opacity-70" : "",
//       ].join(" ")}
//     >
//       {/* ปุ่มลอย (ลาก/แก้ไข/ซ่อน/ลบ) — สไตล์เดียวกับ Product pages */}
//       <div className="col-span-full -mt-6 -mb-2">
//         <AdminEditableFloating
//           visible={data.isActive}
//           onToggleVisible={onToggleActive}
//           onEdit={onEdit}
//           onDelete={onDelete}
//           dragHandleProps={{ ...attributes, ...listeners }}
//           className="pointer-events-none"
//         >
//           {/* empty children (overlay only) */}
//           <div />
//         </AdminEditableFloating>
//       </div>

//       {/* Checkbox */}
//       <div>
//         <input type="checkbox" checked={checked} onChange={onCheck} />
//       </div>

//       {/* Order */}
//       <div className="font-mono text-sm text-muted-foreground">#{data.order}</div>

//       {/* ID */}
//       <div className="font-mono truncate">{data.id}</div>

//       {/* Mode */}
//       <div>
//         <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] bg-muted">
//           {data.layoutMode}
//         </span>
//       </div>

//       {/* Active */}
//       <div>
//         <span
//           className={[
//             "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium",
//             data.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground",
//           ].join(" ")}
//         >
//           {data.isActive ? "Active" : "Inactive"}
//         </span>
//       </div>

//       {/* Image path */}
//       <div className="truncate text-muted-foreground">{data.imageUrlDesktop || "—"}</div>

//       {/* Title / Schedule */}
//       <div className="min-w-0">
//         <div className="truncate">{data.title ?? "—"}</div>
//         <div className="text-xs text-muted-foreground">
//           {data.startAt || data.endAt
//             ? `${data.startAt ? new Date(data.startAt).toLocaleDateString() : "-"} → ${
//                 data.endAt ? new Date(data.endAt).toLocaleDateString() : "-"
//               }`
//             : "—"}
//         </div>
//       </div>

//       {/* Actions (สำรอง ปุ่มตรงแถว — เผื่อใช้คลิกได้ทันที) */}
//       <div className="justify-self-end flex items-center gap-2">
//         <Button size="sm" variant="secondary" onClick={onToggleActive}>
//           {data.isActive ? "ปิด" : "เปิด"}
//         </Button>
//         <Button size="sm" onClick={onEdit}>
//           แก้ไข
//         </Button>
//         <Button size="sm" variant="destructive" onClick={onDelete}>
//           ลบ
//         </Button>
//       </div>
//     </div>
//   );
// }

// v.1.1.3 =============================================

// v.1.1.2 =============================================
// // src/components/admin/hero-banners/hero-banners-list-admin.tsx
// "use client";

// import { useMemo } from "react";

// export type Row = {
//   id: string;
//   order: number;
//   isActive: boolean;
//   layoutMode: "image" | "overlay" | "split";
//   imageUrlDesktop: string;
//   title?: string;
//   startAt?: string;
//   endAt?: string;
// };

// type Props = {
//   rows: Row[];
//   selectedIds: Set<string>;
//   onToggleSelect: (id: string) => void;
//   onToggleSelectAll: (checked: boolean, idsOnPage: string[]) => void;

//   onEdit: (id: string) => void;
//   onToggleActive: (id: string) => void;
//   onDelete: (id: string) => void;

//   /** ปุ่มเสริม (มี/ไม่มีก็ได้) */
//   onDuplicate?: (id: string) => void;
//   onQuickEdit?: (id: string) => void;
// };

// /** ปุ่มไอคอนสไตล์เดียวกับ AdminEditableFloating */
// function ActionIcon({
//   title,
//   label,
//   bg,
//   onClick,
// }: {
//   title: string;
//   label: string; // ใช้อีโมจิ/สัญลักษณ์ให้เหมือน toolbar
//   bg:
//     | "slate"
//     | "violet"
//     | "cyan"
//     | "blue"
//     | "emerald"
//     | "amber"
//     | "rose";
//   onClick: () => void;
// }) {
//   const cls = useMemo(() => {
//     const map: Record<string, string> = {
//       slate: "bg-slate-100 hover:bg-slate-200",
//       violet: "bg-violet-100 hover:bg-violet-200",
//       cyan: "bg-cyan-100 hover:bg-cyan-200",
//       blue: "bg-blue-100 hover:bg-blue-200",
//       emerald: "bg-emerald-100 hover:bg-emerald-200",
//       amber: "bg-amber-100 hover:bg-amber-200",
//       rose: "bg-rose-100 hover:bg-rose-200",
//     };
//     return map[bg] ?? map.slate;
//   }, [bg]);

//   return (
//     <button
//       type="button"
//       title={title}
//       aria-label={title}
//       className={`inline-flex h-7 w-7 items-center justify-center rounded ${cls} text-[13px] leading-none`}
//       onClick={onClick}
//     >
//       {label}
//     </button>
//   );
// }

// export default function HeroBannersListAdmin({
//   rows,
//   selectedIds,
//   onToggleSelect,
//   onToggleSelectAll,
//   onEdit,
//   onToggleActive,
//   onDelete,
//   onDuplicate,
//   onQuickEdit,
// }: Props) {
//   const allIds = rows.map((r) => r.id);
//   const allChecked = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
//   const indeterminate = !allChecked && allIds.some((id) => selectedIds.has(id));

//   const scheduleText = (r: Row) =>
//     r.startAt || r.endAt
//       ? `${r.startAt ? new Date(r.startAt).toLocaleDateString() : "-"} → ${
//           r.endAt ? new Date(r.endAt).toLocaleDateString() : "-"
//         }`
//       : "—";

//   return (
//     <div className="rounded-lg border bg-card overflow-x-auto">
//       <table className="min-w-full text-sm">
//         <thead className="bg-muted/40">
//           <tr className="text-left">
//             <th className="px-4 py-3 w-10">
//               <input
//                 type="checkbox"
//                 checked={allChecked}
//                 ref={(el) => {
//                   if (el) el.indeterminate = indeterminate;
//                 }}
//                 onChange={(e) => onToggleSelectAll(e.target.checked, allIds)}
//               />
//             </th>
//             <th className="px-4 py-3 w-16">Order</th>
//             <th className="px-4 py-3">ID</th>
//             <th className="px-4 py-3">Mode</th>
//             <th className="px-4 py-3">Active</th>
//             <th className="px-4 py-3">Desktop Image</th>
//             <th className="px-4 py-3">Title</th>
//             <th className="px-4 py-3 w-40">ช่วงเวลา</th>
//             <th className="px-4 py-3 w-[220px]">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {rows.length === 0 ? (
//             <tr>
//               <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
//                 ไม่พบรายการ
//               </td>
//             </tr>
//           ) : (
//             rows.map((r) => (
//               <tr key={r.id} className="border-t hover:bg-muted/30">
//                 <td className="px-4 py-3 align-middle">
//                   <input
//                     type="checkbox"
//                     checked={selectedIds.has(r.id)}
//                     onChange={() => onToggleSelect(r.id)}
//                   />
//                 </td>
//                 <td className="px-4 py-3 font-mono align-middle">#{r.order}</td>
//                 <td className="px-4 py-3 font-mono align-middle">{r.id}</td>
//                 <td className="px-4 py-3 align-middle">{r.layoutMode}</td>
//                 <td className="px-4 py-3 align-middle">
//                   <span
//                     className={[
//                       "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium",
//                       r.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground",
//                     ].join(" ")}
//                   >
//                     {r.isActive ? "Active" : "Inactive"}
//                   </span>
//                 </td>
//                 <td className="px-4 py-3 align-middle">
//                   <span className="truncate block max-w-[340px] text-muted-foreground">
//                     {r.imageUrlDesktop}
//                   </span>
//                 </td>
//                 <td className="px-4 py-3 align-middle">
//                   <span className="truncate block max-w-[260px]">{r.title ?? "—"}</span>
//                 </td>
//                 <td className="px-4 py-3 align-middle text-muted-foreground">
//                   {scheduleText(r)}
//                 </td>
//                 <td className="px-4 py-2 align-middle">
//                   <div className="flex flex-wrap items-center gap-2">
//                     {/* duplicate (ถ้ามี handler) */}
//                     {onDuplicate && (
//                       <ActionIcon
//                         title="ทำซ้ำ"
//                         label="⧉"
//                         bg="violet"
//                         onClick={() => onDuplicate(r.id)}
//                       />
//                     )}

//                     {/* quick edit (ถ้ามี handler) */}
//                     {onQuickEdit && (
//                       <ActionIcon
//                         title="แก้ไขด่วน"
//                         label="✨"
//                         bg="cyan"
//                         onClick={() => onQuickEdit(r.id)}
//                       />
//                     )}

//                     {/* edit */}
//                     <ActionIcon
//                       title="แก้ไข"
//                       label="✏️"
//                       bg="blue"
//                       onClick={() => onEdit(r.id)}
//                     />

//                     {/* toggle active */}
//                     <ActionIcon
//                       title={r.isActive ? "ซ่อน" : "แสดง"}
//                       label={r.isActive ? "👁" : "🚫"}
//                       bg={r.isActive ? "emerald" : "amber"}
//                       onClick={() => onToggleActive(r.id)}
//                     />

//                     {/* delete */}
//                     <ActionIcon
//                       title="ลบ"
//                       label="🗑"
//                       bg="rose"
//                       onClick={() => onDelete(r.id)}
//                     />
//                   </div>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// v.1.1.2 =============================================

// //  src/components/admin/hero-banners/hero-banners-list-admin.tsx

// "use client";

// import { Button } from "@/components/ui/button";

// export type Row = {
//   id: string;
//   order: number;
//   isActive: boolean;
//   layoutMode: "image" | "overlay" | "split";
//   imageUrlDesktop: string;
//   title?: string;
//   startAt?: string;
//   endAt?: string;
// };

// type Props = {
//   rows: Row[];
//   selectedIds: Set<string>;
//   onToggleSelect: (id: string) => void;
//   onToggleSelectAll: (checked: boolean, idsOnPage: string[]) => void;

//   onEdit: (id: string) => void;
//   onToggleActive: (id: string) => void;
//   onDelete: (id: string) => void;
// };

// export default function HeroBannersListAdmin({
//   rows,
//   selectedIds,
//   onToggleSelect,
//   onToggleSelectAll,
//   onEdit,
//   onToggleActive,
//   onDelete,
// }: Props) {
//   const allIds = rows.map((r) => r.id);
//   const allChecked = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
//   const indeterminate = !allChecked && allIds.some((id) => selectedIds.has(id));

//   const scheduleText = (r: Row) =>
//     r.startAt || r.endAt
//       ? `${r.startAt ? new Date(r.startAt).toLocaleDateString() : "-"} → ${
//           r.endAt ? new Date(r.endAt).toLocaleDateString() : "-"
//         }`
//       : "—";

//   return (
//     <div className="rounded-lg border bg-card overflow-x-auto">
//       <table className="min-w-full text-sm">
//         <thead className="bg-muted/40">
//           <tr className="text-left">
//             <th className="px-4 py-3 w-10">
//               <input
//                 type="checkbox"
//                 checked={allChecked}
//                 ref={(el) => {
//                   if (el) el.indeterminate = indeterminate;
//                 }}
//                 onChange={(e) => onToggleSelectAll(e.target.checked, allIds)}
//               />
//             </th>
//             <th className="px-4 py-3 w-16">Order</th>
//             <th className="px-4 py-3">ID</th>
//             <th className="px-4 py-3">Mode</th>
//             <th className="px-4 py-3">Active</th>
//             <th className="px-4 py-3">Desktop Image</th>
//             <th className="px-4 py-3">Title</th>
//             <th className="px-4 py-3 w-40">ช่วงเวลา</th>
//             <th className="px-4 py-3 w-36">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {rows.length === 0 ? (
//             <tr>
//               <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
//                 ไม่พบรายการ
//               </td>
//             </tr>
//           ) : (
//             rows.map((r) => (
//               <tr key={r.id} className="border-t">
//                 <td className="px-4 py-3">
//                   <input
//                     type="checkbox"
//                     checked={selectedIds.has(r.id)}
//                     onChange={() => onToggleSelect(r.id)}
//                   />
//                 </td>
//                 <td className="px-4 py-3 font-mono">#{r.order}</td>
//                 <td className="px-4 py-3 font-mono">{r.id}</td>
//                 <td className="px-4 py-3">{r.layoutMode}</td>
//                 <td className="px-4 py-3">
//                   <span
//                     className={[
//                       "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium",
//                       r.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground",
//                     ].join(" ")}
//                   >
//                     {r.isActive ? "Active" : "Inactive"}
//                   </span>
//                 </td>
//                 <td className="px-4 py-3">
//                   <span className="truncate block max-w-[300px] text-muted-foreground">
//                     {r.imageUrlDesktop}
//                   </span>
//                 </td>
//                 <td className="px-4 py-3">
//                   <span className="truncate block max-w-[260px]">{r.title ?? "—"}</span>
//                 </td>
//                 <td className="px-4 py-3 text-muted-foreground">{scheduleText(r)}</td>
//                 <td className="px-4 py-3">
//                   <div className="flex items-center gap-2">
//                     <Button size="sm" variant="secondary" onClick={() => onToggleActive(r.id)}>
//                       {r.isActive ? "ปิด" : "เปิด"}
//                     </Button>
//                     <Button size="sm" onClick={() => onEdit(r.id)}>แก้ไข</Button>
//                     <Button size="sm" variant="destructive" onClick={() => onDelete(r.id)}>
//                       ลบ
//                     </Button>
//                   </div>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }

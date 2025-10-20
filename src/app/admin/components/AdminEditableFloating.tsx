// v.1.1.5 =============================================
// src/app/admin/components/AdminEditableFloating.tsx

"use client";

import { ReactNode, MouseEvent } from "react";

type Props = {
  children: ReactNode;

  // actions หลัก
  onDelete?: () => void;
  onToggleVisible?: () => void;
  onEdit?: () => void;
  visible?: boolean;

  // drag handle:
  // - list view (dnd-kit): ใช้ dragHandleProps
  // - card view (native): ใช้ onHandleDragStart
  dragHandleProps?: any;
  onHandleDragStart?: () => void;

  // ตัวเลือกเสริม
  showAlways?: boolean;
  disabled?: boolean;
  className?: string;

  // ปุ่มเสริม
  onDuplicate?: () => void;
  onQuickEdit?: () => void;
};

export default function AdminEditableFloating({
  children,
  onDelete,
  onToggleVisible,
  onEdit,
  visible = true,
  dragHandleProps,
  onHandleDragStart,
  showAlways = false,
  disabled = false,
  className = "",
  onDuplicate,
  onQuickEdit,
}: Props) {
  const stop = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className={[
        "relative group rounded-xl overflow-visible",
        className,
        visible ? "" : "ring-1 ring-amber-300/60",
      ].join(" ")}
    >
      {children}

      {/* toolbar ลอย */}
      <div
        className={`absolute -top-2 -right-2 z-10 transition pointer-events-none
          ${showAlways ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        aria-hidden={!showAlways}
      >
        <div
          className="flex items-center gap-1 rounded-lg bg-white/90 shadow px-1.5 py-1 ring-1 ring-black/5 pointer-events-auto"
          onClick={stop}
        >
          {/* ⇅ drag handle */}
          <button
            type="button"
            {...dragHandleProps /* dnd-kit mode */}
            draggable={!!onHandleDragStart /* native mode */}
            onDragStart={(e) => {
              if (onHandleDragStart) {
                try {
                  e.dataTransfer?.setData("text/plain", "drag");
                  e.dataTransfer!.effectAllowed = "move";
                } catch {}
                onHandleDragStart();
              }
            }}
            className="px-2 py-1 rounded text-xs bg-slate-100 hover:bg-slate-200 disabled:opacity-50 cursor-move"
            title="ลากย้าย"
            aria-label="ลากย้าย"
            disabled={disabled}
            // อย่าทำ stopPropagation บน onMouseDown ของปุ่มนี้ เพื่อให้ drag เริ่มได้
          >
            ⇅
          </button>

          {onDuplicate && (
            <button
              type="button"
              onClick={(e) => {
                stop(e);
                onDuplicate();
              }}
              className="px-2 py-1 rounded text-xs bg-violet-100 hover:bg-violet-200 disabled:opacity-50"
              title="ทำซ้ำ"
              aria-label="ทำซ้ำ"
              disabled={disabled}
            >
              ⧉
            </button>
          )}

          {onQuickEdit && (
            <button
              type="button"
              onClick={(e) => {
                stop(e);
                onQuickEdit();
              }}
              className="px-2 py-1 rounded text-xs bg-cyan-100 hover:bg-cyan-200 disabled:opacity-50"
              title="แก้ไขด่วน"
              aria-label="แก้ไขด่วน"
              disabled={disabled}
            >
              ✨
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                stop(e);
                onEdit();
              }}
              className="px-2 py-1 rounded text-xs bg-blue-100 hover:bg-blue-200 disabled:opacity-50"
              title="แก้ไข"
              aria-label="แก้ไข"
              disabled={disabled}
            >
              ✏️
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              stop(e);
              onToggleVisible?.();
            }}
            className={`px-2 py-1 rounded text-xs disabled:opacity-50 ${
              visible ? "bg-emerald-100 hover:bg-emerald-200" : "bg-amber-100 hover:bg-amber-200"
            }`}
            title={visible ? "ซ่อน" : "แสดง"}
            aria-pressed={visible}
            aria-label={visible ? "ซ่อน" : "แสดง"}
            disabled={disabled}
          >
            {visible ? "👁" : "🚫"}
          </button>

          <button
            type="button"
            onClick={(e) => {
              stop(e);
              onDelete?.();
            }}
            className="px-2 py-1 rounded text-xs bg-rose-100 hover:bg-rose-200 disabled:opacity-50"
            title="ลบ"
            aria-label="ลบ"
            disabled={disabled}
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}

// v.1.1.5 =============================================

// v.1.1.4 =============================================
// // src/app/admin/components/AdminEditableFloating.tsx
// "use client";

// import { ReactNode, MouseEvent } from "react";

// type Props = {
//   children: ReactNode;

//   // actions หลัก
//   onDelete?: () => void;
//   onToggleVisible?: () => void;
//   onEdit?: () => void;
//   visible?: boolean;

//   // drag handle:
//   // - list view (dnd-kit): ใช้ dragHandleProps
//   // - card view (native): ใช้ onHandleDragStart
//   dragHandleProps?: any;
//   onHandleDragStart?: () => void;

//   // ตัวเลือกเสริม
//   showAlways?: boolean;
//   disabled?: boolean;
//   className?: string;

//   // ปุ่มเสริม (มี/ไม่มีก็ได้)
//   onDuplicate?: () => void;
//   onQuickEdit?: () => void;
// };

// export default function AdminEditableFloating({
//   children,
//   onDelete,
//   onToggleVisible,
//   onEdit,
//   visible = true,
//   dragHandleProps,
//   onHandleDragStart,
//   showAlways = false,
//   disabled = false,
//   className = "",
//   onDuplicate,
//   onQuickEdit,
// }: Props) {
//   const stop = (e: MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };

//   return (
//     <div
//       className={[
//         "relative group rounded-xl overflow-visible", // ⭐ กัน toolbar โดน clip
//         className,
//         visible ? "" : "ring-1 ring-amber-300/60",
//       ].join(" ")}
//     >
//       {children}

//       {/* toolbar ลอย */}
//       <div
//         className={`absolute -top-2 -right-2 z-10 transition pointer-events-none
//           ${showAlways ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
//         aria-hidden={!showAlways}
//       >
//         <div
//           className="flex items-center gap-1 rounded-lg bg-white/90 shadow px-1.5 py-1 ring-1 ring-black/5 pointer-events-auto"
//           onClick={stop}
//           onMouseDown={stop}
//         >
//           {/* drag */}
//           <button
//             type="button"
//             // โหมด dnd-kit: ใช้ props จากภายนอก
//             {...dragHandleProps}
//             // โหมด native: ทำให้ปุ่มเป็น drag handle จริง
//             draggable={!!onHandleDragStart}
//             onDragStart={(e) => {
//               if (onHandleDragStart) {
//                 try {
//                   e.dataTransfer?.setData("text/plain", "drag");
//                   e.dataTransfer!.effectAllowed = "move";
//                 } catch {}
//                 onHandleDragStart();
//               }
//             }}
//             className="px-2 py-1 rounded text-xs bg-slate-100 hover:bg-slate-200 disabled:opacity-50 cursor-move"
//             title="ลากย้าย"
//             aria-label="ลากย้าย"
//             disabled={disabled}
//             onClick={stop}
//             onMouseDown={stop}
//           >
//             ⇅
//           </button>

//           {/* duplicate (ถ้ามี) */}
//           {onDuplicate && (
//             <button
//               type="button"
//               onClick={(e) => {
//                 stop(e);
//                 onDuplicate();
//               }}
//               className="px-2 py-1 rounded text-xs bg-violet-100 hover:bg-violet-200 disabled:opacity-50"
//               title="ทำซ้ำ"
//               aria-label="ทำซ้ำ"
//               disabled={disabled}
//             >
//               ⧉
//             </button>
//           )}

//           {/* quick edit (ถ้ามี) */}
//           {onQuickEdit && (
//             <button
//               type="button"
//               onClick={(e) => {
//                 stop(e);
//                 onQuickEdit();
//               }}
//               className="px-2 py-1 rounded text-xs bg-cyan-100 hover:bg-cyan-200 disabled:opacity-50"
//               title="แก้ไขด่วน"
//               aria-label="แก้ไขด่วน"
//               disabled={disabled}
//             >
//               ✨
//             </button>
//           )}

//           {/* edit */}
//           {onEdit && (
//             <button
//               type="button"
//               onClick={(e) => {
//                 stop(e);
//                 onEdit();
//               }}
//               className="px-2 py-1 rounded text-xs bg-blue-100 hover:bg-blue-200 disabled:opacity-50"
//               title="แก้ไข"
//               aria-label="แก้ไข"
//               disabled={disabled}
//             >
//               ✏️
//             </button>
//           )}

//           {/* toggle visible */}
//           <button
//             type="button"
//             onClick={(e) => {
//               stop(e);
//               onToggleVisible?.();
//             }}
//             className={`px-2 py-1 rounded text-xs disabled:opacity-50 ${
//               visible ? "bg-emerald-100 hover:bg-emerald-200" : "bg-amber-100 hover:bg-amber-200"
//             }`}
//             title={visible ? "ซ่อน" : "แสดง"}
//             aria-pressed={visible}
//             aria-label={visible ? "ซ่อน" : "แสดง"}
//             disabled={disabled}
//           >
//             {visible ? "👁" : "🚫"}
//           </button>

//           {/* delete */}
//           <button
//             type="button"
//             onClick={(e) => {
//               stop(e);
//               onDelete?.();
//             }}
//             className="px-2 py-1 rounded text-xs bg-rose-100 hover:bg-rose-200 disabled:opacity-50"
//             title="ลบ"
//             aria-label="ลบ"
//             disabled={disabled}
//           >
//             🗑
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.4 =============================================

// v.1.1.3 =============================================
// // src/app/admin/components/AdminEditableFloating.tsx
// "use client";

// import { ReactNode, MouseEvent } from "react";

// type Props = {
//   children: ReactNode;

//   // actions หลัก
//   onDelete?: () => void;
//   onToggleVisible?: () => void;
//   onEdit?: () => void;
//   visible?: boolean;

//   // drag handle (เช่นจาก dnd-kit: {...attributes, ...listeners})
//   dragHandleProps?: any;

//   // ตัวเลือกเสริม
//   showAlways?: boolean;
//   disabled?: boolean;
//   className?: string;

//   // ปุ่มเสริม (มี/ไม่มีก็ได้)
//   onDuplicate?: () => void;
//   onQuickEdit?: () => void;
// };

// export default function AdminEditableFloating({
//   children,
//   onDelete,
//   onToggleVisible,
//   onEdit,
//   visible = true,
//   dragHandleProps,
//   showAlways = false,
//   disabled = false,
//   className = "",
//   onDuplicate,
//   onQuickEdit,
// }: Props) {
//   const stop = (e: MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };

//   return (
//     <div
//       className={[
//         "relative group rounded-xl overflow-visible", // ⭐ สำคัญ: กัน toolbar โดน clip
//         className,
//         visible ? "" : "ring-1 ring-amber-300/60",
//       ].join(" ")}
//     >
//       {children}

//       {/* toolbar ลอย */}
//       <div
//         className={`absolute -top-2 -right-2 z-10 transition pointer-events-none
//           ${showAlways ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
//         aria-hidden={!showAlways}
//       >
//         <div
//           className="flex items-center gap-1 rounded-lg bg-white/90 shadow px-1.5 py-1 ring-1 ring-black/5 pointer-events-auto"
//           onClick={stop}
//           onMouseDown={stop}
//         >
//           {/* drag */}
//           <button
//             type="button"
//             {...dragHandleProps}
//             className="px-2 py-1 rounded text-xs bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
//             title="ลากย้าย" aria-label="ลากย้าย"
//             disabled={disabled}
//             onClick={stop} onMouseDown={stop}
//           >
//             ⇅
//           </button>

//           {/* duplicate (ถ้ามี) */}
//           {onDuplicate && (
//             <button
//               type="button"
//               onClick={(e) => { stop(e); onDuplicate(); }}
//               className="px-2 py-1 rounded text-xs bg-violet-100 hover:bg-violet-200 disabled:opacity-50"
//               title="ทำซ้ำ" aria-label="ทำซ้ำ"
//               disabled={disabled}
//             >
//               ⧉
//             </button>
//           )}

//           {/* quick edit (ถ้ามี) */}
//           {onQuickEdit && (
//             <button
//               type="button"
//               onClick={(e) => { stop(e); onQuickEdit(); }}
//               className="px-2 py-1 rounded text-xs bg-cyan-100 hover:bg-cyan-200 disabled:opacity-50"
//               title="แก้ไขด่วน" aria-label="แก้ไขด่วน"
//               disabled={disabled}
//             >
//               ✨
//             </button>
//           )}

//           {/* edit */}
//           {onEdit && (
//             <button
//               type="button"
//               onClick={(e) => { stop(e); onEdit(); }}
//               className="px-2 py-1 rounded text-xs bg-blue-100 hover:bg-blue-200 disabled:opacity-50"
//               title="แก้ไข" aria-label="แก้ไข"
//               disabled={disabled}
//             >
//               ✏️
//             </button>
//           )}

//           {/* toggle visible */}
//           <button
//             type="button"
//             onClick={(e) => { stop(e); onToggleVisible?.(); }}
//             className={`px-2 py-1 rounded text-xs disabled:opacity-50 ${
//               visible ? "bg-emerald-100 hover:bg-emerald-200" : "bg-amber-100 hover:bg-amber-200"
//             }`}
//             title={visible ? "ซ่อน" : "แสดง"}
//             aria-pressed={visible} aria-label={visible ? "ซ่อน" : "แสดง"}
//             disabled={disabled}
//           >
//             {visible ? "👁" : "🚫"}
//           </button>

//           {/* delete */}
//           <button
//             type="button"
//             onClick={(e) => { stop(e); onDelete?.(); }}
//             className="px-2 py-1 rounded text-xs bg-rose-100 hover:bg-rose-200 disabled:opacity-50"
//             title="ลบ" aria-label="ลบ"
//             disabled={disabled}
//           >
//             🗑
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.3 =============================================

// v.1.1.2 =============================================
// // src/app/admin/components/AdminEditableFloating.tsx

// "use client";

// import { ReactNode, MouseEvent } from "react";

// type Props = {
//   children: ReactNode;
//   onDelete?: () => void;
//   onToggleVisible?: () => void;
//   onEdit?: () => void;            // ★ ใหม่: ปุ่มแก้ไข
//   visible?: boolean;
//   dragHandleProps?: any;
//   showAlways?: boolean;
//   disabled?: boolean;
//   className?: string;
// };

// export default function AdminEditable({
//   children,
//   onDelete,
//   onToggleVisible,
//   onEdit,
//   visible = true,
//   dragHandleProps,
//   showAlways = false,
//   disabled = false,
//   className = "",
// }: Props) {
//   const stop = (e: MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };

//   return (
//     <div
//       className={[
//         "relative group rounded-xl",
//         className,
//         visible ? "" : "ring-1 ring-amber-300/60",
//       ].join(" ")}
//     >
//       {children}

//       <div
//         className={`absolute -top-2 -right-2 z-10 transition pointer-events-none
//           ${showAlways ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
//         aria-hidden={!showAlways}
//       >
//         <div
//           className="flex items-center gap-1 rounded-lg bg-white/90 shadow px-1.5 py-1 ring-1 ring-black/5 pointer-events-auto"
//           onClick={stop}
//           onMouseDown={stop}
//         >
//           <button
//             type="button"
//             {...dragHandleProps}
//             className="px-2 py-1 rounded text-xs bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
//             title="ลากย้าย" aria-label="ลากย้าย"
//             disabled={disabled}
//             onClick={stop} onMouseDown={stop}
//           >
//             ⇅
//           </button>

//           {onEdit && (
//             <button
//               type="button"
//               onClick={(e) => { stop(e); onEdit(); }}
//               className="px-2 py-1 rounded text-xs bg-blue-100 hover:bg-blue-200 disabled:opacity-50"
//               title="แก้ไข" aria-label="แก้ไข"
//               disabled={disabled}
//             >
//               ✏️
//             </button>
//           )}

//           <button
//             type="button"
//             onClick={(e) => { stop(e); onToggleVisible?.(); }}
//             className={`px-2 py-1 rounded text-xs disabled:opacity-50 ${
//               visible ? "bg-emerald-100 hover:bg-emerald-200" : "bg-amber-100 hover:bg-amber-200"
//             }`}
//             title={visible ? "ซ่อน" : "แสดง"}
//             aria-pressed={visible} aria-label={visible ? "ซ่อน" : "แสดง"}
//             disabled={disabled}
//           >
//             {visible ? "👁" : "🚫"}
//           </button>

//           <button
//             type="button"
//             onClick={(e) => { stop(e); onDelete?.(); }}
//             className="px-2 py-1 rounded text-xs bg-rose-100 hover:bg-rose-200 disabled:opacity-50"
//             title="ลบ" aria-label="ลบ"
//             disabled={disabled}
//           >
//             🗑
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
// v.1.1.2 =============================================

// // src/app/admin/components/AdminEditableFloating.tsx

// "use client";

// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";
// import {
//   Copy,
//   GripVertical,
//   Pencil,
//   Sparkles,
//   Trash2,
//   Eye,
//   EyeOff,
// } from "lucide-react";
// import * as React from "react";

// type Props = {
//   children: React.ReactNode;

//   /** แสดง/ซ่อน (ไอคอนตา) */
//   visible?: boolean;
//   onToggleVisible?: () => void;

//   /** การกระทำหลัก */
//   onEdit?: () => void;
//   onDelete?: () => void;

//   /** เสริม */
//   onDuplicate?: () => void;
//   onQuickEdit?: () => void;

//   /** สำหรับ dnd-kit: {...attributes, ...listeners} */
//   dragHandleProps?: React.HTMLAttributes<HTMLElement>;

//   className?: string;
// };

// /**
//  * AdminEditableFloating
//  * - wrapper ภายนอก (overflow-visible) เพื่อให้ toolbar ลอยเหนือกรอบการ์ด
//  * - toolbar โชว์เฉพาะตอน hover/focus ภายในกลุ่ม (group)
//  * - ออกแบบให้เป็นคอมโพเนนต์ใหม่ -> ไม่กระทบ AdminEditable เดิม
//  */
// export default function AdminEditableFloating({
//   children,
//   visible = true,
//   onToggleVisible,
//   onEdit,
//   onDelete,
//   onDuplicate,
//   onQuickEdit,
//   dragHandleProps,
//   className,
// }: Props) {
//   return (
//     <div className={cn("relative overflow-visible group", className)}>
//       {/* floating toolbar (เหนือการ์ด) */}
//       <div className="-top-3 right-2 absolute z-30 hidden items-center gap-1 group-hover:flex group-focus-within:flex">
//         {/* drag handle */}
//         <button
//           type="button"
//           title="ลากเพื่อจัดลำดับ"
//           aria-label="ลากเพื่อจัดลำดับ"
//           className="h-8 w-8 rounded-md bg-background/95 shadow-sm ring-1 ring-border flex items-center justify-center cursor-grab active:cursor-grabbing"
//           {...dragHandleProps}
//         >
//           <GripVertical className="h-4 w-4 text-muted-foreground" />
//         </button>

//         {/* duplicate */}
//         {onDuplicate && (
//           <Button
//             type="button"
//             size="icon"
//             variant="secondary"
//             className="h-8 w-8 shadow-sm"
//             title="Duplicate"
//             onClick={onDuplicate}
//           >
//             <Copy className="h-4 w-4" />
//           </Button>
//         )}

//         {/* quick edit */}
//         {onQuickEdit && (
//           <Button
//             type="button"
//             size="icon"
//             variant="secondary"
//             className="h-8 w-8 shadow-sm"
//             title="Quick edit"
//             onClick={onQuickEdit}
//           >
//             <Sparkles className="h-4 w-4" />
//           </Button>
//         )}

//         {/* edit */}
//         {onEdit && (
//           <Button
//             type="button"
//             size="icon"
//             variant="secondary"
//             className="h-8 w-8 shadow-sm"
//             title="แก้ไข"
//             onClick={onEdit}
//           >
//             <Pencil className="h-4 w-4" />
//           </Button>
//         )}

//         {/* toggle visible */}
//         {onToggleVisible && (
//           <Button
//             type="button"
//             size="icon"
//             variant="secondary"
//             className="h-8 w-8 shadow-sm"
//             title={visible ? "ซ่อน" : "แสดง"}
//             onClick={onToggleVisible}
//           >
//             {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//           </Button>
//         )}

//         {/* delete */}
//         {onDelete && (
//           <Button
//             type="button"
//             size="icon"
//             variant="destructive"
//             className="h-8 w-8 shadow-sm"
//             title="ลบ"
//             onClick={onDelete}
//           >
//             <Trash2 className="h-4 w-4" />
//           </Button>
//         )}
//       </div>

//       {/* เนื้อหาการ์ดจริง */}
//       {children}
//     </div>
//   );
// }

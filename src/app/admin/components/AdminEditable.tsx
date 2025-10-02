// v.1.1.4 ================================================
// src/app/admin/components/AdminEditable.tsx

"use client";

import { ReactNode, MouseEvent } from "react";

type Props = {
  children: ReactNode;
  onDelete?: () => void;
  onToggleVisible?: () => void;
  onEdit?: () => void;            // ★ ใหม่: ปุ่มแก้ไข
  visible?: boolean;
  dragHandleProps?: any;
  showAlways?: boolean;
  disabled?: boolean;
  className?: string;
};

export default function AdminEditable({
  children,
  onDelete,
  onToggleVisible,
  onEdit,
  visible = true,
  dragHandleProps,
  showAlways = false,
  disabled = false,
  className = "",
}: Props) {
  const stop = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className={[
        "relative group rounded-xl",
        className,
        visible ? "" : "ring-1 ring-amber-300/60",
      ].join(" ")}
    >
      {children}

      <div
        className={`absolute -top-2 -right-2 z-10 transition pointer-events-none
          ${showAlways ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        aria-hidden={!showAlways}
      >
        <div
          className="flex items-center gap-1 rounded-lg bg-white/90 shadow px-1.5 py-1 ring-1 ring-black/5 pointer-events-auto"
          onClick={stop}
          onMouseDown={stop}
        >
          <button
            type="button"
            {...dragHandleProps}
            className="px-2 py-1 rounded text-xs bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
            title="ลากย้าย" aria-label="ลากย้าย"
            disabled={disabled}
            onClick={stop} onMouseDown={stop}
          >
            ⇅
          </button>

          {onEdit && (
            <button
              type="button"
              onClick={(e) => { stop(e); onEdit(); }}
              className="px-2 py-1 rounded text-xs bg-blue-100 hover:bg-blue-200 disabled:opacity-50"
              title="แก้ไข" aria-label="แก้ไข"
              disabled={disabled}
            >
              ✏️
            </button>
          )}

          <button
            type="button"
            onClick={(e) => { stop(e); onToggleVisible?.(); }}
            className={`px-2 py-1 rounded text-xs disabled:opacity-50 ${
              visible ? "bg-emerald-100 hover:bg-emerald-200" : "bg-amber-100 hover:bg-amber-200"
            }`}
            title={visible ? "ซ่อน" : "แสดง"}
            aria-pressed={visible} aria-label={visible ? "ซ่อน" : "แสดง"}
            disabled={disabled}
          >
            {visible ? "👁" : "🚫"}
          </button>

          <button
            type="button"
            onClick={(e) => { stop(e); onDelete?.(); }}
            className="px-2 py-1 rounded text-xs bg-rose-100 hover:bg-rose-200 disabled:opacity-50"
            title="ลบ" aria-label="ลบ"
            disabled={disabled}
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}

// v.1.1.4 ================================================

// v.1.1.3 ================================================
// // src/app/admin/components/AdminEditable.tsx
// "use client";

// import { ReactNode, MouseEvent } from "react";

// type Props = {
//   children: ReactNode;
//   onDelete?: () => void;
//   onToggleVisible?: () => void;
//   visible?: boolean;
//   dragHandleProps?: any;          // จาก dnd-kit
//   showAlways?: boolean;           // บางทีอยากให้ toolbar โผล่ตลอด (เช่นบนมือถือ)
//   disabled?: boolean;             // ปิดปุ่มชั่วคราวตอนกำลังบันทึก
//   className?: string;             // เผื่ออยากใส่คลาสจากภายนอก
// };

// export default function AdminEditable({
//   children,
//   onDelete,
//   onToggleVisible,
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
//         "relative group rounded-xl",               // มีมุมโค้งไว้ให้ ring ดูเรียบร้อย
//         className,
//         visible ? "" : "ring-1 ring-amber-300/60", // ★ กรอบบาง ๆ สำหรับรายการที่ซ่อน
//       ].join(" ")}
//     >
//       {/* เนื้อหาการ์ด */}
//       {children}

//       {/* Toolbar overlay */}
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
//             title="ลากย้าย"
//             aria-label="ลากย้าย"
//             disabled={disabled}
//             onClick={stop}
//             onMouseDown={stop}
//           >
//             ⇅
//           </button>

//           <button
//             type="button"
//             onClick={(e) => { stop(e); onToggleVisible?.(); }}
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

//           <button
//             type="button"
//             onClick={(e) => { stop(e); onDelete?.(); }}
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

// v.1.1.3 ================================================

// v.1.1.2 ================================================
// // src/app/admin/components/AdminEditable.tsx
// "use client";

// import { ReactNode, MouseEvent } from "react";

// type Props = {
//   children: ReactNode;
//   onDelete?: () => void;
//   onToggleVisible?: () => void;
//   visible?: boolean;
//   dragHandleProps?: any;          // จาก dnd-kit
//   showAlways?: boolean;           // บางทีอยากให้ toolbar โผล่ตลอด (เช่นบนมือถือ)
//   disabled?: boolean;             // ปิดปุ่มชั่วคราวตอนกำลังบันทึก
//   className?: string;             // เผื่ออยากใส่คลาสจากภายนอก
// };

// export default function AdminEditable({
//   children,
//   onDelete,
//   onToggleVisible,
//   visible = true,
//   dragHandleProps,
//   showAlways = false,
//   disabled = false,
//   className = "",
// }: Props) {
//   // กัน event เด้งไปหา parent (เช่นการ์ดเป็นลิงก์แล้วกดปุ่มจะถูกพาไปหน้าอื่น)
//   const stop = (e: MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };

//   return (
//     <div className={`relative group ${className}`}>
//       {/* ตัวจริงที่แสดงบนหน้า */}
//       {children}

//       {/* Toolbar overlay */}
//       <div
//         className={`absolute -top-2 -right-2 z-10 transition pointer-events-none
//           ${showAlways ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
//         // ให้ overlay ไม่กินคลิกทั้งหมด ยกเว้นที่ปุ่ม (ปุ่มจะเปิด pointer-events)
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
//             title="ลากย้าย"
//             aria-label="ลากย้าย"
//             disabled={disabled}
//             onClick={stop}
//             onMouseDown={stop}
//           >
//             ⇅
//           </button>

//           <button
//             type="button"
//             onClick={(e) => { stop(e); onToggleVisible?.(); }}
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

//           <button
//             type="button"
//             onClick={(e) => { stop(e); onDelete?.(); }}
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

// v.1.1.2 ================================================

// // src/app/admin/components/AdminEditable.tsx

// "use client";

// import { ReactNode } from "react";

// type Props = {
//   children: ReactNode;
//   onDelete?: () => void;
//   onToggleVisible?: () => void;
//   visible?: boolean;
//   dragHandleProps?: any; // รับ props จาก dnd-kit
// };

// export default function AdminEditable({
//   children,
//   onDelete,
//   onToggleVisible,
//   visible = true,
//   dragHandleProps,
// }: Props) {
//   return (
//     <div className="relative group">
//       {children}

//       {/* Toolbar overlay */}
//       <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition">
//         <div className="flex items-center gap-1 rounded-lg bg-white/90 shadow px-1.5 py-1 ring-1 ring-black/5">
//           <button
//             {...dragHandleProps}
//             className="px-2 py-1 rounded text-xs bg-slate-100 hover:bg-slate-200"
//             title="ลากย้าย"
//           >
//             ⇅
//           </button>
//           <button
//             onClick={onToggleVisible}
//             className={`px-2 py-1 rounded text-xs ${
//               visible ? "bg-emerald-100 hover:bg-emerald-200" : "bg-amber-100 hover:bg-amber-200"
//             }`}
//             title={visible ? "ซ่อน" : "แสดง"}
//           >
//             {visible ? "👁" : "🚫"}
//           </button>
//           <button
//             onClick={onDelete}
//             className="px-2 py-1 rounded text-xs bg-rose-100 hover:bg-rose-200"
//             title="ลบ"
//           >
//             🗑
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

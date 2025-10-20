// v.1.1.6 ===========================================
"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import AdminEditableFloating from "@/app/admin/components/AdminEditableFloating";

type LayoutMode = "image" | "overlay" | "split";

export type HeroBannerCardData = {
  id: string;
  isActive: boolean;
  order: number;
  layoutMode: LayoutMode;
  imageUrlDesktop: string;
  title?: string;
  subtitle?: string;
  overlay?: { color: string; opacity: number };
  altText?: string;
};

type Props = {
  data: HeroBannerCardData;

  // drag-n-drop (native)
  draggable?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;

  // actions
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete?: () => void;

  // เสริม
  onDuplicate?: () => void;
  onQuickEdit?: () => void;
};

export default function HeroBannerCardAdmin({
  data: b,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onToggleActive,
  onEdit,
  onDelete,
  onDuplicate,
  onQuickEdit,
}: Props) {
  return (
    <div
      className="relative overflow-visible cursor-move select-none"
      draggable={draggable}
      onDragStart={(e) => {
        try {
          e.dataTransfer?.setData("text/plain", b.id);
          e.dataTransfer!.effectAllowed = "move";
        } catch {}
        onDragStart?.();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(e);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop?.();
      }}
    >
      <AdminEditableFloating
        className="w-full"
        visible={b.isActive}
        onToggleVisible={onToggleActive}
        onEdit={onEdit}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onQuickEdit={onQuickEdit}
        // ✅ ทำปุ่ม ⇅ เป็น native drag handle (card view)
        onHandleDragStart={() => {
          onDragStart?.();
        }}
      >
        <div
          className={cn(
            "overflow-hidden rounded-xl border bg-card shadow-sm transition",
            "hover:shadow-md focus-within:ring-2 focus-within:ring-primary"
          )}
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b">
            <span className="text-xs font-mono text-muted-foreground">#{b.order}</span>
            <span className="text-xs rounded bg-muted px-1.5 py-0.5">{b.layoutMode}</span>
            <span
              className={cn(
                "ml-1 inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium",
                b.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
              )}
            >
              {b.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="relative h-44 md:h-52">
            <Image
              src={b.imageUrlDesktop || "/placeholder.png"}
              alt={b.altText || b.title || b.id}
              fill
              className="object-cover pointer-events-none select-none"
              draggable={false} // ✅ ไม่ให้ภาพแย่ง drag
              sizes="(max-width: 768px) 100vw, 33vw"
            />

            {b.layoutMode === "overlay" && b.overlay && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundColor: b.overlay.color, opacity: b.overlay.opacity ?? 0.35 }}
              />
            )}

            {(b.title || b.subtitle) && (
              <div className="absolute inset-0 p-3 md:p-4 flex pointer-events-none">
                <div className="mt-auto rounded-md bg-black/35 text-white backdrop-blur-[1px] px-3 py-2 max-w-[80%] text-xs md:text-sm">
                  {b.title && <div className="font-semibold leading-tight truncate">{b.title}</div>}
                  {b.subtitle && (
                    <div className="opacity-90 leading-tight truncate">{b.subtitle}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="px-3 py-2 text-xs text-muted-foreground border-t">
            <div className="truncate flex items-baseline gap-2">
              <span className="font-medium text-foreground">{b.id}</span>
              <span className="truncate block max-w-[60%]">{b.imageUrlDesktop}</span>
            </div>
          </div>
        </div>
      </AdminEditableFloating>
    </div>
  );
}

// v.1.1.6 ===========================================

// v.1.1.5 ============================================
// // src/components/admin/hero-banners/hero-banner-card-admin.tsx

// "use client";

// import Image from "next/image";
// import { cn } from "@/lib/utils";
// import AdminEditableFloating from "@/app/admin/components/AdminEditableFloating";

// type LayoutMode = "image" | "overlay" | "split";

// export type HeroBannerCardData = {
//   id: string;
//   isActive: boolean;
//   order: number;
//   layoutMode: LayoutMode;
//   imageUrlDesktop: string;
//   title?: string;
//   subtitle?: string;
//   overlay?: { color: string; opacity: number };
//   altText?: string;
// };

// type Props = {
//   data: HeroBannerCardData;

//   // drag-n-drop
//   draggable?: boolean;
//   onDragStart?: () => void;
//   onDragOver?: (e: React.DragEvent) => void;
//   onDrop?: () => void;
//   dragHandleProps?: React.HTMLAttributes<HTMLElement>; // (ใช้กับ dnd-kit ใน list view)

//   // actions
//   onToggleActive: () => void;
//   onEdit: () => void;
//   onDelete?: () => void;

//   // เสริม
//   onDuplicate?: () => void;
//   onQuickEdit?: () => void;
// };

// export default function HeroBannerCardAdmin({
//   data: b,
//   draggable,
//   onDragStart,
//   onDragOver,
//   onDrop,
//   dragHandleProps,
//   onToggleActive,
//   onEdit,
//   onDelete,
//   onDuplicate,
//   onQuickEdit,
// }: Props) {
//   return (
//     // wrapper ภายนอกไว้รองรับ draggable + ให้ overflow ของ toolbar ลอยได้
//     <div
//       className="relative overflow-visible cursor-move select-none"
//       draggable={draggable}
//       onDragStart={(e) => {
//         try {
//           e.dataTransfer?.setData("text/plain", b.id);
//           e.dataTransfer!.effectAllowed = "move";
//         } catch {}
//         onDragStart?.();
//       }}
//       onDragOver={(e) => {
//         e.preventDefault(); // สำคัญ: อนุญาต drop
//         onDragOver?.(e);
//       }}
//       onDrop={(e) => {
//         e.preventDefault();
//         onDrop?.();
//       }}
//     >
//       {/* Toolbar ลอยเหนือการ์ด */}
//       <AdminEditableFloating
//         className="w-full"
//         visible={b.isActive}
//         onToggleVisible={onToggleActive}
//         onEdit={onEdit}
//         onDelete={onDelete}
//         onDuplicate={onDuplicate}
//         onQuickEdit={onQuickEdit}
//         dragHandleProps={dragHandleProps}
//         // ✅ ทำให้ปุ่มลอยเป็น native drag handle ใน view การ์ด
//         onHandleDragStart={() => {
//           onDragStart?.();
//         }}
//       >
//         {/* การ์ดจริง */}
//         <div
//           className={cn(
//             "overflow-hidden rounded-xl border bg-card shadow-sm transition",
//             "hover:shadow-md focus-within:ring-2 focus-within:ring-primary"
//           )}
//         >
//           {/* Header (meta) */}
//           <div className="flex items-center gap-2 px-3 py-2 border-b">
//             <span className="text-xs font-mono text-muted-foreground">#{b.order}</span>
//             <span className="text-xs rounded bg-muted px-1.5 py-0.5">{b.layoutMode}</span>
//             <span
//               className={cn(
//                 "ml-1 inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium",
//                 b.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
//               )}
//             >
//               {b.isActive ? "Active" : "Inactive"}
//             </span>
//           </div>

//           {/* Preview */}
//           <div className="relative h-44 md:h-52">
//             <Image
//               src={b.imageUrlDesktop || "/placeholder.png"}
//               alt={b.altText || b.title || b.id}
//               fill
//               className="object-cover pointer-events-none select-none"
//               draggable={false} // ✅ ไม่ให้ภาพแย่ง event drag
//               sizes="(max-width: 768px) 100vw, 33vw"
//               priority={false}
//             />

//             {b.layoutMode === "overlay" && b.overlay && (
//               <div
//                 className="absolute inset-0 pointer-events-none"
//                 style={{ backgroundColor: b.overlay.color, opacity: b.overlay.opacity ?? 0.35 }}
//               />
//             )}

//             {(b.title || b.subtitle) && (
//               <div className="absolute inset-0 p-3 md:p-4 flex pointer-events-none">
//                 <div className="mt-auto rounded-md bg-black/35 text-white backdrop-blur-[1px] px-3 py-2 max-w-[80%] text-xs md:text-sm">
//                   {b.title && <div className="font-semibold leading-tight truncate">{b.title}</div>}
//                   {b.subtitle && (
//                     <div className="opacity-90 leading-tight truncate">{b.subtitle}</div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Footer (path) */}
//           <div className="px-3 py-2 text-xs text-muted-foreground border-t">
//             <div className="truncate flex items-baseline gap-2">
//               <span className="font-medium text-foreground">{b.id}</span>
//               <span className="truncate block max-w-[60%]">{b.imageUrlDesktop}</span>
//             </div>
//           </div>
//         </div>
//       </AdminEditableFloating>
//     </div>
//   );
// }

// v.1.1.5 ============================================

// v.1.1.4 =============================================
// // src/components/admin/hero-banners/hero-banner-card-admin.tsx

// "use client";

// import Image from "next/image";
// import { cn } from "@/lib/utils";
// import AdminEditableFloating from "@/app/admin/components/AdminEditableFloating";

// type LayoutMode = "image" | "overlay" | "split";

// export type HeroBannerCardData = {
//   id: string;
//   isActive: boolean;
//   order: number;
//   layoutMode: LayoutMode;
//   imageUrlDesktop: string;
//   title?: string;
//   subtitle?: string;
//   overlay?: { color: string; opacity: number };
//   altText?: string;
// };

// type Props = {
//   data: HeroBannerCardData;

//   // drag-n-drop
//   draggable?: boolean;
//   onDragStart?: () => void;
//   onDragOver?: (e: React.DragEvent) => void;
//   onDrop?: () => void;
//   dragHandleProps?: React.HTMLAttributes<HTMLElement>; // ถ้าใช้ dnd-kit จากภายนอก

//   // actions
//   onToggleActive: () => void;
//   onEdit: () => void;
//   onDelete?: () => void;

//   // ใหม่: ตามคำขอ
//   onDuplicate?: () => void;
//   onQuickEdit?: () => void;
// };

// export default function HeroBannerCardAdmin({
//   data: b,
//   draggable,
//   onDragStart,
//   onDragOver,
//   onDrop,
//   dragHandleProps,
//   onToggleActive,
//   onEdit,
//   onDelete,
//   onDuplicate,
//   onQuickEdit,
// }: Props) {
//   return (
//     // wrapper ภายนอกไว้รองรับ draggable + ให้ overflow ของ toolbar ลอยได้
//     <div
//       className="relative overflow-visible"
//       draggable={draggable}
//       onDragStart={onDragStart}
//       onDragOver={onDragOver}
//       onDrop={onDrop}
//     >
//       {/* Toolbar ลอยเหนือการ์ด (แบบเดียวกับ Products) */}
//       <AdminEditableFloating
//         className="w-full"
//         visible={b.isActive}
//         onToggleVisible={onToggleActive}
//         onEdit={onEdit}
//         onDelete={onDelete}
//         onDuplicate={onDuplicate}
//         onQuickEdit={onQuickEdit}
//         dragHandleProps={dragHandleProps}
//       >
//         {/* การ์ดจริง (ให้ overflow-hidden เฉพาะตัวการ์ด ไม่กระทบ toolbar) */}
//         <div
//           className={cn(
//             "overflow-hidden rounded-xl border bg-card shadow-sm transition",
//             "hover:shadow-md focus-within:ring-2 focus-within:ring-primary"
//           )}
//         >
//           {/* Header (ข้อมูลประกอบ) */}
//           <div className="flex items-center gap-2 px-3 py-2 border-b">
//             <span className="text-xs font-mono text-muted-foreground">#{b.order}</span>
//             <span className="text-xs rounded bg-muted px-1.5 py-0.5">{b.layoutMode}</span>
//             <span
//               className={cn(
//                 "ml-1 inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium",
//                 b.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
//               )}
//             >
//               {b.isActive ? "Active" : "Inactive"}
//             </span>
//           </div>

//           {/* Preview */}
//           <div className="relative h-44 md:h-52">
            
//             <Image
//               src={b.imageUrlDesktop || "/placeholder.png"}
//               alt={b.altText || b.title || b.id}
//               fill
//               className="object-cover"
//               sizes="(max-width: 768px) 100vw, 33vw"
//               priority={false}
//             />

//             {b.layoutMode === "overlay" && b.overlay && (
//               <div
//                 className="absolute inset-0"
//                 style={{ backgroundColor: b.overlay.color, opacity: b.overlay.opacity ?? 0.35 }}
//               />
//             )}

//             {(b.title || b.subtitle) && (
//               <div className="absolute inset-0 p-3 md:p-4 flex">
//                 <div className="mt-auto rounded-md bg-black/35 text-white backdrop-blur-[1px] px-3 py-2 max-w-[80%] text-xs md:text-sm">
//                   {b.title && <div className="font-semibold leading-tight truncate">{b.title}</div>}
//                   {b.subtitle && <div className="opacity-90 leading-tight truncate">{b.subtitle}</div>}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Footer (path) */}
//           <div className="px-3 py-2 text-xs text-muted-foreground border-t">
//             <div className="truncate flex items-baseline gap-2">
//               <span className="font-medium text-foreground">{b.id}</span>
//               <span className="truncate block max-w-[60%]">{b.imageUrlDesktop}</span>
//             </div>
//           </div>
//         </div>
//       </AdminEditableFloating>
//     </div>
//   );
// }

// v.1.1.4 =============================================

// v.1.1.3 =============================================
// // src/components/admin/hero-banners/hero-banner-card-admin.tsx

// "use client";

// import Image from "next/image";
// import { cn } from "@/lib/utils";
// import AdminEditable from "@/app/admin/components/AdminEditable"; // ← ใช้ตัวเดียวกับ Products

// type LayoutMode = "image" | "overlay" | "split";

// export type HeroBannerCardData = {
//   id: string;
//   isActive: boolean;
//   order: number;
//   layoutMode: LayoutMode;
//   imageUrlDesktop: string;
//   title?: string;
//   subtitle?: string;
//   overlay?: { color: string; opacity: number };
//   altText?: string;
// };

// type Props = {
//   data: HeroBannerCardData;

//   // drag-n-drop
//   draggable?: boolean;
//   onDragStart?: () => void;
//   onDragOver?: (e: React.DragEvent) => void;
//   onDrop?: () => void;
//   dragHandleProps?: React.HTMLAttributes<HTMLElement>; // ถ้าใช้ dnd-kit จากภายนอก

//   // actions
//   onToggleActive: () => void;
//   onEdit: () => void;
//   onDelete?: () => void;
// };

// export default function HeroBannerCardAdmin({
//   data: b,
//   draggable,
//   onDragStart,
//   onDragOver,
//   onDrop,
//   dragHandleProps,
//   onToggleActive,
//   onEdit,
//   onDelete,
// }: Props) {
//   return (
//     <div
//       className={cn(
//         "group relative overflow-hidden rounded-xl border bg-card shadow-sm transition",
//         "hover:shadow-md focus-within:ring-2 focus-within:ring-primary"
//       )}
//       draggable={draggable}
//       onDragStart={onDragStart}
//       onDragOver={onDragOver}
//       onDrop={onDrop}
//     >
//       {/* 
//         ✅ ใช้ AdminEditable แสดงไอคอน hover เหมือน ProductCardAdmin:
//         - ไอคอนจะโผล่ก็ต่อเมื่อ hover การ์ด
//         - ส่ง dragHandleProps ให้จับลาก
//         - ส่ง onToggleVisible/onEdit/onDelete ให้ทำงาน
//       */}
//       <AdminEditable
//         visible={b.isActive}
//         onToggleVisible={onToggleActive}
//         onEdit={onEdit}
//         onDelete={onDelete}
//         dragHandleProps={dragHandleProps}
//       >
//         {/* Header (เบา ๆ แค่ข้อมูลประกอบ) */}
//         <div className="flex items-center gap-2 px-3 py-2 border-b">
//           <span className="text-xs font-mono text-muted-foreground">#{b.order}</span>
//           <span className="text-xs rounded bg-muted px-1.5 py-0.5">{b.layoutMode}</span>
//           <span
//             className={cn(
//               "ml-1 inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium",
//               b.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
//             )}
//           >
//             {b.isActive ? "Active" : "Inactive"}
//           </span>
//         </div>

//         {/* Preview */}
//         <div className="relative h-44 md:h-52">
          
//           <Image
//             src={b.imageUrlDesktop || "/placeholder.png"}
//             alt={b.altText || b.title || b.id}
//             fill
//             className="object-cover"
//             sizes="(max-width: 768px) 100vw, 33vw"
//             priority={false}
//           />
//           {b.layoutMode === "overlay" && b.overlay && (
//             <div
//               className="absolute inset-0"
//               style={{ backgroundColor: b.overlay.color, opacity: b.overlay.opacity ?? 0.35 }}
//             />
//           )}

//           {(b.title || b.subtitle) && (
//             <div className="absolute inset-0 p-3 md:p-4 flex">
//               <div className="mt-auto rounded-md bg-black/35 text-white backdrop-blur-[1px] px-3 py-2 max-w-[80%] text-xs md:text-sm">
//                 {b.title && <div className="font-semibold leading-tight truncate">{b.title}</div>}
//                 {b.subtitle && <div className="opacity-90 leading-tight truncate">{b.subtitle}</div>}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer (path) */}
//         <div className="px-3 py-2 text-xs text-muted-foreground border-t">
//           <div className="truncate flex items-baseline gap-2">
//             <span className="font-medium text-foreground">{b.id}</span>
//             <span className="truncate block max-w-[60%]">{b.imageUrlDesktop}</span>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// v.1.1.3 =============================================

// v.1.1.2 =============================================
// // src/components/admin/hero-banners/hero-banner-card-admin.tsx

// "use client";

// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";
// import { MoreHorizontal } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// type AlignX = "left" | "center" | "right";
// type AlignY = "top" | "center" | "bottom";
// type LayoutMode = "image" | "overlay" | "split";

// export type HeroBannerCardData = {
//   id: string;
//   isActive: boolean;
//   order: number;
//   layoutMode: LayoutMode;
//   imageUrlDesktop: string;
//   title?: string;
//   subtitle?: string;
//   overlay?: { color: string; opacity: number };
//   altText?: string;
// };

// type Props = {
//   data: HeroBannerCardData;
//   draggable?: boolean;
//   onDragStart?: () => void;
//   onDragOver?: (e: React.DragEvent) => void;
//   onDrop?: () => void;
//   onToggleActive: () => void;
//   onEdit: () => void;
// };

// export default function HeroBannerCardAdmin({
//   data,
//   draggable,
//   onDragStart,
//   onDragOver,
//   onDrop,
//   onToggleActive,
//   onEdit,
// }: Props) {
//   const b = data;

//   return (
//     <div
//       className={cn(
//         // ✅ ป้องกันล้น + เงา/โฟกัส
//         "group relative overflow-hidden rounded-xl border bg-card shadow-sm",
//         "transition hover:shadow-md focus-within:ring-2 focus-within:ring-primary"
//       )}
//       draggable={draggable}
//       onDragStart={onDragStart}
//       onDragOver={onDragOver}
//       onDrop={onDrop}
//     >
//       {/* Header */}
//       <div className="flex items-start gap-2 px-3 py-2 border-b">
//         {/* กลุ่มซ้าย: อนุญาต wrap เพื่อไม่ดันปุ่มหลุดกรอบ */}
//         <div className="min-w-0 flex-1 flex flex-wrap items-center gap-1">
//           <span
//             className="cursor-grab select-none text-muted-foreground"
//             title="ลากเพื่อจัดลำดับ"
//           >
//             ⋮⋮
//           </span>
//           <span className="text-xs font-mono text-muted-foreground">#{b.order}</span>
//           <span className="text-xs rounded bg-muted px-1.5 py-0.5">{b.layoutMode}</span>
//           <span
//             className={cn(
//               "ml-1 inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium",
//               b.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
//             )}
//           >
//             {b.isActive ? "Active" : "Inactive"}
//           </span>
//         </div>

//         {/* กลุ่มขวา: ปุ่มเต็มสำหรับจอ ≥ sm */}
//         <div className="hidden sm:flex items-center gap-1 shrink-0">
//           <Button size="sm" variant="secondary" onClick={onToggleActive}>
//             {b.isActive ? "ปิด" : "เปิด"}
//           </Button>
//           <Button size="sm" onClick={onEdit}>
//             แก้ไข
//           </Button>
//         </div>

//         {/* กลุ่มขวา: จอเล็กใช้เมนู ⋯ แทนปุ่มยาว */}
//         <div className="sm:hidden shrink-0">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="icon" className="h-8 w-8">
//                 <MoreHorizontal className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="min-w-[160px]">
//               <DropdownMenuItem onClick={onToggleActive}>
//                 {b.isActive ? "ปิดการแสดงผล" : "เปิดการแสดงผล"}
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={onEdit}>แก้ไข</DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>

//       {/* Preview */}
//       <div className="relative h-44 md:h-52">
        
//         <Image
//           src={b.imageUrlDesktop || "/placeholder.png"}
//           alt={b.altText || b.title || b.id}
//           fill
//           className="object-cover"
//           sizes="(max-width: 768px) 100vw, 33vw"
//         />
//         {b.layoutMode === "overlay" && b.overlay && (
//           <div
//             className="absolute inset-0"
//             style={{ backgroundColor: b.overlay.color, opacity: b.overlay.opacity ?? 0.35 }}
//           />
//         )}
//         {(b.title || b.subtitle) && (
//           <div className="absolute inset-0 p-3 md:p-4 flex">
//             <div
//               className={cn(
//                 "mt-auto rounded-md bg-black/35 text-white backdrop-blur-[1px] px-3 py-2",
//                 "max-w-[80%] text-xs md:text-sm"
//               )}
//             >
//               {b.title && <div className="font-semibold leading-tight truncate">{b.title}</div>}
//               {b.subtitle && (
//                 <div className="opacity-90 leading-tight truncate">{b.subtitle}</div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Footer */}
//       <div className="px-3 py-2 text-xs text-muted-foreground border-t">
//         <div className="truncate flex items-baseline gap-2">
//           <span className="font-medium text-foreground">{b.id}</span>
//           <span className="truncate block max-w-[60%]">{b.imageUrlDesktop}</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.2 =============================================

// // src/components/admin/hero-banners/hero-banner-card-admin.tsx

// "use client";

// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";

// type AlignX = "left" | "center" | "right";
// type AlignY = "top" | "center" | "bottom";
// type LayoutMode = "image" | "overlay" | "split";

// export type HeroBannerCardData = {
//   id: string;
//   isActive: boolean;
//   order: number;
//   layoutMode: LayoutMode;
//   imageUrlDesktop: string;
//   title?: string;
//   subtitle?: string;
//   overlay?: { color: string; opacity: number };
//   altText?: string;
// };

// type Props = {
//   data: HeroBannerCardData;
//   draggable?: boolean;
//   onDragStart?: () => void;
//   onDragOver?: (e: React.DragEvent) => void;
//   onDrop?: () => void;
//   onToggleActive: () => void;
//   onEdit: () => void;
// };

// export default function HeroBannerCardAdmin({
//   data,
//   draggable,
//   onDragStart,
//   onDragOver,
//   onDrop,
//   onToggleActive,
//   onEdit,
// }: Props) {
//   const b = data;

//   return (
//     <div
//       className="group relative rounded-xl border bg-card shadow-sm transition hover:shadow-md focus-within:ring-2 focus-within:ring-primary"
//       draggable={draggable}
//       onDragStart={onDragStart}
//       onDragOver={onDragOver}
//       onDrop={onDrop}
//     >
//       {/* Header */}
//       <div className="flex items-center justify-between px-3 py-2 border-b">
//         <div className="flex items-center gap-2">
//           <span
//             className="cursor-grab select-none text-muted-foreground"
//             title="ลากเพื่อจัดลำดับ"
//           >
//             ⋮⋮
//           </span>
//           <span className="text-xs font-mono text-muted-foreground">#{b.order}</span>
//           <span className="text-sm font-medium">{b.layoutMode}</span>
//           <span
//             className={cn(
//               "ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium",
//               b.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
//             )}
//           >
//             {b.isActive ? "Active" : "Inactive"}
//           </span>
//         </div>

//         <div className="flex items-center gap-2">
//           <Button size="sm" variant="secondary" onClick={onToggleActive}>
//             {b.isActive ? "ปิด" : "เปิด"}
//           </Button>
//           <Button size="sm" onClick={onEdit}>
//             แก้ไข
//           </Button>
//         </div>
//       </div>

//       {/* Preview */}
//       <div className="relative h-44 md:h-52">
        
//         <Image
//           src={b.imageUrlDesktop || "/placeholder.png"}
//           alt={b.altText || b.title || b.id}
//           fill
//           className="object-cover"
//           sizes="(max-width: 768px) 100vw, 33vw"
//         />
//         {b.layoutMode === "overlay" && b.overlay && (
//           <div
//             className="absolute inset-0"
//             style={{ backgroundColor: b.overlay.color, opacity: b.overlay.opacity ?? 0.35 }}
//           />
//         )}
//         {(b.title || b.subtitle) && (
//           <div className="absolute inset-0 p-3 md:p-4 flex">
//             <div
//               className={cn(
//                 "mt-auto rounded-md bg-black/35 text-white backdrop-blur-[1px] px-3 py-2",
//                 "max-w-[80%] text-xs md:text-sm"
//               )}
//             >
//               {b.title && <div className="font-semibold leading-tight truncate">{b.title}</div>}
//               {b.subtitle && (
//                 <div className="opacity-90 leading-tight truncate">{b.subtitle}</div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Footer */}
//       <div className="px-3 py-2 text-xs text-muted-foreground border-t">
//         <div className="truncate">
//           <span className="font-medium text-foreground">{b.id}</span>
//           <span className="mx-2">·</span>
//           <span className="truncate inline-block max-w-[60%] align-bottom">
//             {b.imageUrlDesktop}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

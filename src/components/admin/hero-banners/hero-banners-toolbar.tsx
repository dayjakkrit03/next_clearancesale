// v.1.1.3 =============================================
// src/components/admin/hero-banners/hero-banners-toolbar.tsx

"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ViewMode = "card" | "list";

type Props = {
  total: number;
  loading?: boolean;
  saving?: boolean;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  onCreate: () => void;

  // search & filters
  search: string;
  onSearchChange: (v: string) => void;
  filterActive: "all" | "active" | "inactive";
  onFilterActiveChange: (v: "all" | "active" | "inactive") => void;
  filterMode: "all" | "image" | "overlay" | "split";
  onFilterModeChange: (v: "all" | "image" | "overlay" | "split") => void;

  // selection & bulk actions
  selectedCount: number;
  onBulkEnable: () => void;
  onBulkDisable: () => void;
  onBulkDelete: () => void;
};

export default function HeroBannersToolbar({
  total,
  loading,
  saving,
  view,
  onViewChange,
  onCreate,
  search,
  onSearchChange,
  filterActive,
  onFilterActiveChange,
  filterMode,
  onFilterModeChange,
  selectedCount,
  onBulkEnable,
  onBulkDisable,
  onBulkDelete,
}: Props) {
  const hasSelection = selectedCount > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          ทั้งหมด <span className="font-medium text-foreground">{total}</span> รายการ
          {loading ? " • กำลังโหลด..." : ""}
          {saving ? " • กำลังบันทึกลำดับ..." : ""}
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle view */}
          <div className="inline-flex rounded-md border bg-card p-1">
            <button
              type="button"
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition",
                view === "card"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
              )}
              onClick={() => onViewChange("card")}
              aria-pressed={view === "card"}
            >
              การ์ด
            </button>
            <button
              type="button"
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition",
                view === "list"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
              )}
              onClick={() => onViewChange("list")}
              aria-pressed={view === "list"}
            >
              รายการ
            </button>
          </div>

          <Button onClick={onCreate}>+ เพิ่มแบนเนอร์</Button>
        </div>
      </div>

      {/* Search + Filters + Bulk actions */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ค้นหา: id / title / subtitle / path"
          className="h-9 w-full sm:w-72 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
        />

        <select
          value={filterActive}
          onChange={(e) => onFilterActiveChange(e.target.value as any)}
          className="h-9 rounded-md border bg-background px-2 text-sm"
          title="สถานะ"
        >
          <option value="all">สถานะทั้งหมด</option>
          <option value="active">เฉพาะ Active</option>
          <option value="inactive">เฉพาะ Inactive</option>
        </select>

        <select
          value={filterMode}
          onChange={(e) => onFilterModeChange(e.target.value as any)}
          className="h-9 rounded-md border bg-background px-2 text-sm"
          title="โหมด"
        >
          <option value="all">โหมดทั้งหมด</option>
          <option value="image">Image</option>
          <option value="overlay">Overlay</option>
          <option value="split">Split</option>
        </select>

        {/* Bulk actions (เฉพาะตอนมี selection) */}
        {hasSelection && (
          <div className="ml-auto flex items-center gap-2">
            <Button variant="secondary" size="sm" className="h-8" onClick={onBulkEnable}>
              เปิดที่เลือก
            </Button>
            <Button variant="secondary" size="sm" className="h-8" onClick={onBulkDisable}>
              ปิดที่เลือก
            </Button>
            <Button variant="destructive" size="sm" className="h-8" onClick={onBulkDelete}>
              ลบที่เลือก
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// v.1.1.3 =============================================

// v.1.1.2 =============================================
// // src/components/admin/hero-banners/hero-banners-toolbar.tsx

// "use client";

// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";

// export type ViewMode = "card" | "list";

// type Props = {
//   total: number;
//   loading?: boolean;
//   saving?: boolean;
//   view: ViewMode;
//   onViewChange: (v: ViewMode) => void;
//   onCreate: () => void;

//   // search & filters
//   search: string;
//   onSearchChange: (v: string) => void;
//   filterActive: "all" | "active" | "inactive";
//   onFilterActiveChange: (v: "all" | "active" | "inactive") => void;
//   filterMode: "all" | "image" | "overlay" | "split";
//   onFilterModeChange: (v: "all" | "image" | "overlay" | "split") => void;

//   // selection & bulk actions
//   selectedCount: number;
//   onBulkEnable: () => void;
//   onBulkDisable: () => void;
//   onBulkDelete: () => void;
// };

// export default function HeroBannersToolbar({
//   total,
//   loading,
//   saving,
//   view,
//   onViewChange,
//   onCreate,
//   search,
//   onSearchChange,
//   filterActive,
//   onFilterActiveChange,
//   filterMode,
//   onFilterModeChange,
//   selectedCount,
//   onBulkEnable,
//   onBulkDisable,
//   onBulkDelete,
// }: Props) {
//   const hasSelection = selectedCount > 0;

//   return (
//     <div className="flex flex-col gap-3">
//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <div className="text-sm text-muted-foreground">
//           ทั้งหมด <span className="font-medium text-foreground">{total}</span> รายการ
//           {loading ? " • กำลังโหลด..." : ""}
//           {saving ? " • กำลังบันทึกลำดับ..." : ""}
//         </div>

//         <div className="flex items-center gap-2">
//           {/* Toggle view */}
//           <div className="inline-flex rounded-md border bg-card p-1">
//             <button
//               type="button"
//               className={cn(
//                 "px-3 py-1.5 text-sm rounded-md transition",
//                 view === "card"
//                   ? "bg-primary text-primary-foreground"
//                   : "hover:bg-muted text-foreground"
//               )}
//               onClick={() => onViewChange("card")}
//               aria-pressed={view === "card"}
//             >
//               การ์ด
//             </button>
//             <button
//               type="button"
//               className={cn(
//                 "px-3 py-1.5 text-sm rounded-md transition",
//                 view === "list"
//                   ? "bg-primary text-primary-foreground"
//                   : "hover:bg-muted text-foreground"
//               )}
//               onClick={() => onViewChange("list")}
//               aria-pressed={view === "list"}
//             >
//               รายการ
//             </button>
//           </div>

//           <Button onClick={onCreate}>+ เพิ่มแบนเนอร์</Button>
//         </div>
//       </div>

//       {/* Search + Filters + Bulk actions */}
//       <div className="flex flex-wrap items-center gap-2">
//         <input
//           value={search}
//           onChange={(e) => onSearchChange(e.target.value)}
//           placeholder="ค้นหา: id / title / subtitle / path"
//           className="h-9 w-full sm:w-72 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
//         />

//         <select
//           value={filterActive}
//           onChange={(e) => onFilterActiveChange(e.target.value as any)}
//           className="h-9 rounded-md border bg-background px-2 text-sm"
//           title="สถานะ"
//         >
//           <option value="all">สถานะทั้งหมด</option>
//           <option value="active">เฉพาะ Active</option>
//           <option value="inactive">เฉพาะ Inactive</option>
//         </select>

//         <select
//           value={filterMode}
//           onChange={(e) => onFilterModeChange(e.target.value as any)}
//           className="h-9 rounded-md border bg-background px-2 text-sm"
//           title="โหมด"
//         >
//           <option value="all">โหมดทั้งหมด</option>
//           <option value="image">Image</option>
//           <option value="overlay">Overlay</option>
//           <option value="split">Split</option>
//         </select>

//         {/* Bulk actions (เฉพาะตอนมี selection) */}
//         {hasSelection && (
//           <div className="ml-auto flex items-center gap-2">
//             <Button variant="secondary" size="sm" onClick={onBulkEnable}>
//               เปิดที่เลือก
//             </Button>
//             <Button variant="secondary" size="sm" onClick={onBulkDisable}>
//               ปิดที่เลือก
//             </Button>
//             <Button variant="destructive" size="sm" onClick={onBulkDelete}>
//               ลบที่เลือก
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// v.1.1.2 =============================================

// // src/components/admin/hero-banners/hero-banners-toolbar.tsx

// "use client";

// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";

// export type ViewMode = "card" | "list";

// type Props = {
//   total: number;
//   loading?: boolean;
//   saving?: boolean;
//   view: ViewMode;
//   onViewChange: (v: ViewMode) => void;
//   onCreate: () => void;
// };

// export default function HeroBannersToolbar({
//   total,
//   loading,
//   saving,
//   view,
//   onViewChange,
//   onCreate,
// }: Props) {
//   return (
//     <div className="flex flex-wrap items-center justify-between gap-3">
//       <div className="text-sm text-muted-foreground">
//         ทั้งหมด <span className="font-medium text-foreground">{total}</span> รายการ
//         {loading ? " • กำลังโหลด..." : ""}
//         {saving ? " • กำลังบันทึกลำดับ..." : ""}
//       </div>

//       <div className="flex items-center gap-2">
//         {/* Toggle view */}
//         <div className="inline-flex rounded-md border bg-card p-1">
//           <button
//             type="button"
//             className={cn(
//               "px-3 py-1.5 text-sm rounded-md transition",
//               view === "card"
//                 ? "bg-primary text-primary-foreground"
//                 : "hover:bg-muted text-foreground"
//             )}
//             onClick={() => onViewChange("card")}
//             aria-pressed={view === "card"}
//           >
//             การ์ด
//           </button>
//           <button
//             type="button"
//             className={cn(
//               "px-3 py-1.5 text-sm rounded-md transition",
//               view === "list"
//                 ? "bg-primary text-primary-foreground"
//                 : "hover:bg-muted text-foreground"
//             )}
//             onClick={() => onViewChange("list")}
//             aria-pressed={view === "list"}
//           >
//             รายการ
//           </button>
//         </div>

//         <Button onClick={onCreate}>+ เพิ่มแบนเนอร์</Button>
//       </div>
//     </div>
//   );
// }

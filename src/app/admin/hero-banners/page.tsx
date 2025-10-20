// v.1.1.2 =============================================
// src/app/admin/hero-banners/page.tsx

import { absoluteUrl } from "@/lib/base-url";
import HeroBannersClient, { type HeroBanner } from "@/components/admin/hero-banners/hero-banners-client";

export const revalidate = 0;
export const dynamic = "force-dynamic";

async function getBanners(): Promise<HeroBanner[]> {
  const url = await absoluteUrl("/api/mock/hero-banners");
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return (json?.items ?? []) as HeroBanner[];
}

export default async function AdminHeroBannersPage() {
  const items = await getBanners();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hero Banners</h1>
          <p className="text-sm text-muted-foreground">
            จัดการแบนเนอร์หน้าแรก รองรับรูปแบบ Image / Overlay / Split และตั้งเวลาแสดงผล
          </p>
        </div>
      </div>

      {/* Info bar */}
      <div className="mb-6 rounded-lg border bg-card p-4 text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-medium">อัปโหลดรูปไว้ที่:</span>
          <code className="rounded bg-muted px-2 py-1">/public/uploads/banners</code>
          <span className="text-muted-foreground">
            โดยเก็บพาธในฟิลด์ <code className="rounded bg-muted px-1">/uploads/banners/...</code>
          </span>
        </div>
      </div>

      {/* Visual View (การ์ด + Drag reorder + ปุ่มแก้ไข) */}
      <HeroBannersClient initialItems={items} />
    </div>
  );
}

// v.1.1.2 =============================================

// // src/app/admin/hero-banners/page.tsx
// import { absoluteUrl } from "@/lib/base-url";
// import Link from "next/link";

// export const revalidate = 0; // dev: ไม่ cache
// export const dynamic = "force-dynamic";

// type AlignX = "left" | "center" | "right";
// type AlignY = "top" | "center" | "bottom";
// type LayoutMode = "image" | "overlay" | "split";

// type HeroBanner = {
//   id: string;
//   isActive: boolean;
//   order: number;
//   startAt?: string;
//   endAt?: string;
//   layoutMode: LayoutMode;
//   imageUrlDesktop: string;
//   imageUrlMobile?: string;
//   title?: string;
//   subtitle?: string;
//   textAlign?: { x: AlignX; y: AlignY };
//   overlay?: { color: string; opacity: number };
//   linkUrl?: string;
//   altText?: string;
//   locale?: string;
//   ctas?: Array<{ label: string; href: string; variant?: "primary" | "outline" | "ghost" }>;
// };

// async function getBanners(): Promise<HeroBanner[]> {
//   const url = await absoluteUrl("/api/mock/hero-banners");
//   const res = await fetch(url, { cache: "no-store" });
//   if (!res.ok) return [];
//   const json = await res.json();
//   return (json?.items ?? []) as HeroBanner[];
// }

// export default async function AdminHeroBannersPage() {
//   const items = await getBanners();

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="mb-6 flex items-start justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold">Hero Banners</h1>
//           <p className="text-sm text-muted-foreground">
//             จัดการแบนเนอร์หน้าแรก รองรับรูปแบบ Image / Overlay / Split และตั้งเวลาแสดงผล
//           </p>
//         </div>

//         {/* ปุ่มเพิ่ม (จะต่อให้เปิด Drawer/Editor ในสเต็ปถัดไป) */}
//         <Link
//           href="#"
//           className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:opacity-90"
//           // TODO: ต่อให้เปิด Drawer ฝั่ง client ในขั้นตอนถัดไป
//         >
//           + เพิ่มแบนเนอร์
//         </Link>
//       </div>

//       {/* Info bar */}
//       <div className="mb-6 rounded-lg border bg-card p-4 text-sm">
//         <div className="flex flex-wrap items-center gap-3">
//           <span className="font-medium">อัปโหลดรูปไว้ที่:</span>
//           <code className="rounded bg-muted px-2 py-1">/public/uploads/banners</code>
//           <span className="text-muted-foreground">
//             โดยเก็บพาธในฟิลด์ <code className="rounded bg-muted px-1">/uploads/banners/...</code>
//           </span>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="rounded-lg border bg-card">
//         <div className="border-b px-4 py-3 text-sm text-muted-foreground">
//           ทั้งหมด {items.length} รายการ
//         </div>

//         {items.length === 0 ? (
//           <div className="p-8 text-center text-sm text-muted-foreground">
//             ยังไม่มีแบนเนอร์ — กด “เพิ่มแบนเนอร์” เพื่อเริ่มต้น
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full text-sm">
//               <thead className="bg-muted/40">
//                 <tr className="text-left">
//                   <th className="px-4 py-3 w-16">Order</th>
//                   <th className="px-4 py-3">ID</th>
//                   <th className="px-4 py-3">Mode</th>
//                   <th className="px-4 py-3">Active</th>
//                   <th className="px-4 py-3">Desktop Image</th>
//                   <th className="px-4 py-3">Title</th>
//                   <th className="px-4 py-3 w-32">ช่วงเวลา</th>
//                   <th className="px-4 py-3 w-28">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {items.map((b) => {
//                   const schedule =
//                     b.startAt || b.endAt
//                       ? `${b.startAt ? new Date(b.startAt).toLocaleDateString() : "-"} → ${
//                           b.endAt ? new Date(b.endAt).toLocaleDateString() : "-"
//                         }`
//                       : "—";

//                   return (
//                     <tr key={b.id} className="border-t">
//                       <td className="px-4 py-3 font-mono">{b.order}</td>
//                       <td className="px-4 py-3 font-mono">{b.id}</td>
//                       <td className="px-4 py-3">{b.layoutMode}</td>
//                       <td className="px-4 py-3">
//                         <span
//                           className={[
//                             "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
//                             b.isActive
//                               ? "bg-emerald-100 text-emerald-700"
//                               : "bg-muted text-muted-foreground",
//                           ].join(" ")}
//                         >
//                           {b.isActive ? "Active" : "Inactive"}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className="truncate block max-w-[240px] text-muted-foreground">
//                           {b.imageUrlDesktop}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className="truncate block max-w-[240px]">{b.title ?? "—"}</span>
//                       </td>
//                       <td className="px-4 py-3 text-muted-foreground">{schedule}</td>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-2">
//                           <Link
//                             href="#"
//                             className="text-primary hover:underline"
//                             title="แก้ไข"
//                           >
//                             แก้ไข
//                           </Link>
//                           <span className="text-muted-foreground">·</span>
//                           <Link
//                             href="#"
//                             className="text-destructive hover:underline"
//                             title="ลบ"
//                           >
//                             ลบ
//                           </Link>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* หมายเหตุ: ต่อไปเราจะใส่ Client components:
//           - hero-banners-client.tsx (state + CRUD + optimistic)
//           - hero-banners-table.tsx (ตารางแบบลาก reorder)
//           - hero-banner-editor.tsx (Drawer/Modal + form + live preview)
//           - hero-banner-preview.tsx (desktop/mobile preview)
//         */}
//     </div>
//   );
// }

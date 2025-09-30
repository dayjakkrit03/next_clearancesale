// v.1.1.4 ================================================
// src/app/admin/layout.tsx

import type { Metadata } from "next";
import AdminSidebar from "@/app/admin/components/sidebar";

export const metadata: Metadata = {
  title: "Admin | Interlink Shop",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Full-bleed layout, พื้นที่ทำงานเต็มจอ */}
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[260px_1fr]">
        <div className="md:sticky md:top-0 md:h-screen">
          <AdminSidebar />
        </div>
        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}

// v.1.1.4 ===============================================

// v.1.1.3 ================================================

// // src/app/admin/layout.tsx
// import Link from "next/link";
// import type { Metadata } from "next";
// import { headers } from "next/headers";

// export const metadata: Metadata = {
//   title: "Admin | Interlink Shop",
// };

// async function AdminNav() {
//   // ต้อง await ในเวอร์ชันนี้
//   const h = await headers();
//   // ใช้สักตัวเพื่อไฮไลต์เมนู (ถ้าหา header นี้ไม่เจอ ก็ไม่เป็นไร เรามีเมนูเดียว)
//   const path = h.get("x-invoke-path") ?? "";

//   const active =
//     path.startsWith("/admin") ? "bg-primary/10 text-primary ring-1 ring-primary/30" : "hover:bg-muted";

//   return (
//     <aside className="h-full border-r bg-card/60 backdrop-blur p-4">
//       <div className="mb-2 text-sm font-medium text-muted-foreground">Management</div>
//       <nav className="flex flex-col gap-2">
//         <Link href="/admin" className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${active}`}>
//           Categories Management
//         </Link>
//       </nav>
//     </aside>
//   );
// }

// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="min-h-screen bg-muted/20">
//       {/* full-bleed ไม่มีขอบซ้ายขวา */}
//       <div className="grid min-h-screen grid-cols-1 md:grid-cols-[260px_1fr]">
//         <div className="md:sticky md:top-0 md:h-screen">
//           {/* Server Component async ใช้ได้ */}
//           <AdminNav />
//         </div>
//         <div className="p-4 md:p-6">{children}</div>
//       </div>
//     </div>
//   );
// }

// v.1.1.3 ================================================

// v.1.1.2 ================================================
// // src/app/admin/layout.tsx

// // Server Component
// import Link from "next/link";
// import { use } from "react";
// import { clsx } from "clsx";
// import { headers } from "next/headers";
// import { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "Admin | Interlink Shop",
// };

// function AdminNav() {
//   // ใช้ headers() แทน usePathname() ฝั่งเซิร์ฟเวอร์ เพื่อไฮไลต์เมนู
//   const h = use(headers());
//   const path = h.get("x-invoke-path") || h.get("referer") || "/";
//   const isCategories = path.includes("/admin");

//   return (
//     <aside className="rounded-xl border bg-card p-3">
//       <div className="mb-2 text-sm font-medium text-muted-foreground">Management</div>
//       <nav className="flex flex-col gap-2">
//         <Link
//           href="/admin"
//           className={clsx(
//             "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition",
//             isCategories
//               ? "bg-primary/10 text-primary ring-1 ring-primary/30"
//               : "hover:bg-muted"
//           )}
//         >
//           Categories Management
//         </Link>
//       </nav>
//     </aside>
//   );
// }

// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="min-h-screen bg-muted/20">
//       <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-12 gap-6">
//         <div className="col-span-12 md:col-span-3">
//           <AdminNav />
//         </div>
//         <div className="col-span-12 md:col-span-9">
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.2 ================================================

// // src/app/admin/layout.tsx
// export const metadata = {
//   title: "Admin | Interlink Shop",
// };

// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="min-h-screen grid grid-cols-[240px_1fr]">
//       <aside className="border-r bg-card/30 p-4">
//         <h2 className="text-sm font-semibold text-muted-foreground mb-3">Management</h2>
//         <nav className="flex flex-col gap-2">
//           <a href="/admin/categories" className="px-3 py-2 rounded-md hover:bg-accent">
//             Categories Management
//           </a>
//           {/* ไว้เพิ่มเมนูอื่นภายหลังได้ */}
//         </nav>
//       </aside>

//       <main className="p-6">{children}</main>
//     </div>
//   );
// }


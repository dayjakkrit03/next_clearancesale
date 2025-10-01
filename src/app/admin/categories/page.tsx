// v.1.1.4 ================================================
// src/app/admin/categories/page.tsx

import { absoluteUrl } from '@/lib/base-url';
import type { UICategory } from '../components/AdminCategoryGrid';
import AdminCategoriesClient from './AdminCategoriesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getCategories(): Promise<UICategory[]> {
  try {
    const url = await absoluteUrl('/api/mock/categories');
    const res = await fetch(url, { cache: 'no-store', next: { revalidate: 0 } });
    if (!res.ok) return [];
    const data = await res.json();
    const items = (data?.items ?? []) as UICategory[];
    return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch (err) {
    console.error('getCategories failed:', err);
    return [];
  }
}

export default async function AdminCategoriesPage() {
  const items = await getCategories();
  return <AdminCategoriesClient items={items} />;
}

// v.1.1.4 ================================================

// v.1.1.3 ================================================
// // src/app/admin/categories/page.tsx
// import AdminCategoryGrid, { UICategory } from "../components/AdminCategoryGrid";
// import { absoluteUrl } from "@/lib/base-url";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// async function getCategories(): Promise<UICategory[]> {
//   try {
//     const url = await absoluteUrl("/api/mock/categories"); // ✅ ได้ URL เต็มเสมอ
//     const res = await fetch(url, { cache: "no-store" });
//     if (!res.ok) return [];
//     const data = await res.json();
//     const items = (data?.items ?? []) as UICategory[];
//     // เผื่ออนาคตมีฟิลด์ order ให้เรียงเสถียร
//     return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
//   } catch (err) {
//     console.error("getCategories failed:", err);
//     return [];
//   }
// }

// export default async function AdminCategoriesPage() {
//   const items = await getCategories();
//   return <AdminCategoryGrid initial={items} />;
// }

// v.1.1.3 ================================================

// v.1.1.3 ================================================
// // src/app/admin/categories/page.tsx
// import AdminCategoryGrid, { UICategory } from "../components/AdminCategoryGrid";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// async function getCategories(): Promise<UICategory[]> {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/mock/categories`, {
//     cache: "no-store",
//     next: { revalidate: 0 },
//   });
//   if (!res.ok) return [];
//   const { items } = await res.json();
//   return items as UICategory[];
// }

// export default async function AdminCategoriesPage() {
//   const items = await getCategories();
//   return <AdminCategoryGrid initial={items} />;
// }

// v.1.1.3 ================================================

// v.1.1.2 ================================================
// // src/app/admin/categories/page.tsx

// import AdminCategoryGrid, { UICategory } from "../components/AdminCategoryGrid";

// const MOCK: UICategory[] = [
//   { id: 1, slug: "lan-utp", name: "LAN (UTP) System", image_url: "/assets/category-lan-utp.jpg", visible: true },
//   { id: 2, slug: "fiber-optic", name: "FIBER OPTIC System", image_url: "/assets/category-fiber-optic.jpg", visible: true },
//   { id: 3, slug: "telephone", name: "Telephone CABLE", image_url: "/assets/category-telephone.jpg", visible: true },
//   { id: 4, slug: "fttr-fttx", name: "FTTR/FTTx OVAL / FLAT CABLE", image_url: "/assets/category-fttr-fttx.jpg", visible: true },
//   { id: 5, slug: "data-center", name: "DATA CENTER System", image_url: "/assets/category-data-center.jpg", visible: true },
//   { id: 6, slug: "coaxial", name: "COAXIAL (RG) System", image_url: "/assets/category-coaxial.jpg", visible: true },
//   { id: 7, slug: "solar", name: "SOLAR CABLE", image_url: "/assets/category-solar.jpg", visible: true },
//   { id: 8, slug: "security-control", name: "SECURITY AND CONTROL System", image_url: "/assets/category-security-control.jpg", visible: true },
//   { id: 9, slug: "networking", name: "NETWORKING System", image_url: "/assets/category-networking.jpg", visible: true },
//   { id: 10, slug: "germany-rack", name: "GERMANY RACK", image_url: "/assets/category-germany-rack.jpg", visible: true },
//   { id: 11, slug: "cctv-cabinet", name: "CCTV OUTDOOR CABINET", image_url: "/assets/category-cctv-cabinet.jpg", visible: true },
//   { id: 12, slug: "link-rack", name: "LINK RACK", image_url: "/assets/category-link-rack.jpg", visible: true },
// ];

// export default async function AdminCategoriesPage() {
//   // TODO: ดึงจาก /api/categories เหมือนหน้า Front (หรือ /api/admin/...) แล้ว map -> UICategory
//   return <AdminCategoryGrid initial={MOCK} />;
// }

// v.1.1.2 ================================================


// export default function AdminCategoriesPage() {
//     return (
//         <div className="space-y-4">
//         <h1 className="text-2xl font-bold">Categories Management</h1>
//         <p className="mt-1 text-sm text-muted-foreground">
//             หน้านี้เป็น mock ยังไม่เชื่อม API — ขั้นต่อไปเราจะผูกกับ <code className="font-mono">/api/admin/clearance/categories</code>
//         </p>
//             <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//                 {[
//                 "LAN (UTP) System",
//                 "FIBER OPTIC System",
//                 "Telephone CABLE",
//                 ].map((name) => (
//                 <div
//                     key={name}
//                     className="rounded-xl border bg-background p-4 shadow-sm"
//                 >
//                     <div className="text-sm text-muted-foreground mb-1">ตัวอย่างรายการ</div>
//                     <div className="font-semibold">{name}</div>
//                 </div>
//                 ))}
//             </div>
//         </div>
//     );
// }

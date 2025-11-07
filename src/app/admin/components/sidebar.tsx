// v.1.1.8 ========================================================================
// src/app/admin/components/sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Zap } from "lucide-react"; // เพิ่ม Icon สำหรับกลุ่ม Automation

type Item = { label: string; href: string };

const managementItems: Item[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Categories Management", href: "/admin/categories" },
  { label: "Product Management", href: "/admin/products" },
  { label: "Category Products", href: "/admin/category-products" },
  { label: "Featured Lists", href: "/admin/featured-lists" },
  { label: "Hero Banners", href: "/admin/hero-banners" },
  { label: "Discount Rules", href: "/admin/discount-rules" },
];

// 💡 กลุ่มเมนูใหม่สำหรับ API Call / Workflow
const automationItems: Item[] = [
  { label: "Category Import API", href: "/admin/import-category" }, 
  // 🎯 เพิ่ม Product Import API
  { label: "Product Import API", href: "/admin/import-product" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const cleanPath = (pathname ?? "").replace(/\/+$/, "") || "/";

  const isActive = (href: string) => {
    // ให้ /admin/import-category/page.tsx และ /admin/import-product/page.tsx ทำงานได้
    const currentPath = cleanPath === "/admin" ? "/admin" : cleanPath;
    return currentPath === href || currentPath.startsWith(href + "/");
  };

  const renderNavItems = (items: Item[]) => (
    <nav className="flex flex-col gap-2">
      {items.map((it) => {
        const active = isActive(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            className={[
              "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition",
              active
                ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                : "hover:bg-muted text-foreground",
            ].join(" ")}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <aside className="h-full border-r bg-card/60 backdrop-blur p-4 flex flex-col space-y-6">
      
      {/* 1. Management Group */}
      <div className="flex flex-col space-y-2">
        <div className="mb-1 text-sm font-medium text-muted-foreground flex items-center">
          <Settings className="w-4 h-4 mr-2" /> Management
        </div>
        {renderNavItems(managementItems)}
      </div>

      {/* 2. Automation / Import Group (เมนูใหม่) */}
      <div className="flex flex-col space-y-2 pt-6 border-t border-dashed border-gray-200">
        <div className="mb-1 text-sm font-medium text-muted-foreground flex items-center text-orange-600">
          <Zap className="w-4 h-4 mr-2" /> API & Automation
        </div>
        {renderNavItems(automationItems)}
      </div>
      
    </aside>
  );
}
// v.1.1.8 ========================================================================

// v.1.1.7 ================================================
// // src/app/admin/components/sidebar.tsx

// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { Settings, Zap } from "lucide-react"; // เพิ่ม Icon สำหรับกลุ่ม Automation

// type Item = { label: string; href: string };

// const managementItems: Item[] = [
//   { label: "Dashboard", href: "/admin" },
//   { label: "Categories Management", href: "/admin/categories" },
//   { label: "Product Management", href: "/admin/products" },
//   { label: "Category Products", href: "/admin/category-products" },
//   { label: "Featured Lists", href: "/admin/featured-lists" },
//   { label: "Hero Banners", href: "/admin/hero-banners" },
//   { label: "Discount Rules", href: "/admin/discount-rules" },
// ];

// // 💡 กลุ่มเมนูใหม่สำหรับ API Call / Workflow
// const automationItems: Item[] = [
//   { label: "Category Import API", href: "/admin/import-category" }, 
//   // คุณสามารถเพิ่ม { label: "Product Import API", href: "/admin/import-product" } ได้ในอนาคต
// ];

// export default function AdminSidebar() {
//   const pathname = usePathname();
//   const cleanPath = (pathname ?? "").replace(/\/+$/, "") || "/";

//   const isActive = (href: string) => {
//     // ให้ /admin/import-category/page.tsx ทำงานได้
//     const currentPath = cleanPath === "/admin" ? "/admin" : cleanPath;
//     return currentPath === href || currentPath.startsWith(href + "/");
//   };

//   const renderNavItems = (items: Item[]) => (
//     <nav className="flex flex-col gap-2">
//       {items.map((it) => {
//         const active = isActive(it.href);
//         return (
//           <Link
//             key={it.href}
//             href={it.href}
//             prefetch={false}
//             aria-current={active ? "page" : undefined}
//             className={[
//               "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition",
//               active
//                 ? "bg-primary/10 text-primary ring-1 ring-primary/30"
//                 : "hover:bg-muted text-foreground",
//             ].join(" ")}
//           >
//             {it.label}
//           </Link>
//         );
//       })}
//     </nav>
//   );

//   return (
//     <aside className="h-full border-r bg-card/60 backdrop-blur p-4 flex flex-col space-y-6">
      
//       {/* 1. Management Group */}
//       <div className="flex flex-col space-y-2">
//         <div className="mb-1 text-sm font-medium text-muted-foreground flex items-center">
//           <Settings className="w-4 h-4 mr-2" /> Management
//         </div>
//         {renderNavItems(managementItems)}
//       </div>

//       {/* 2. Automation / Import Group (เมนูใหม่) */}
//       <div className="flex flex-col space-y-2 pt-6 border-t border-dashed border-gray-200">
//         <div className="mb-1 text-sm font-medium text-muted-foreground flex items-center text-orange-600">
//           <Zap className="w-4 h-4 mr-2" /> API & Automation
//         </div>
//         {renderNavItems(automationItems)}
//       </div>
      
//     </aside>
//   );
// }
// v.1.1.7 ================================================

// v.1.1.6 ================================================
// // src/app/admin/components/sidebar.tsx
// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";

// type Item = { label: string; href: string };

// const items: Item[] = [
//   { label: "Dashboard", href: "/admin" },
//   { label: "Categories Management", href: "/admin/categories" },
//   { label: "Product Management", href: "/admin/products" },
//   { label: "Category Products", href: "/admin/category-products" },
//   { label: "Featured Lists", href: "/admin/featured-lists" },
//   { label: "Hero Banners", href: "/admin/hero-banners" }, // ⬅️ เมนูใหม่
//   { label: "Discount Rules", href: "/admin/discount-rules" },
// ];

// export default function AdminSidebar() {
//   const pathname = usePathname();
//   const cleanPath = (pathname ?? "").replace(/\/+$/, "") || "/";

//   const isActive = (href: string) => {
//     if (href === "/admin") return cleanPath === "/admin";
//     return cleanPath === href || cleanPath.startsWith(href + "/");
//   };

//   return (
//     <aside className="h-full border-r bg-card/60 backdrop-blur p-4">
//       <div className="mb-2 text-sm font-medium text-muted-foreground">Management</div>
//       <nav className="flex flex-col gap-2">
//         {items.map((it) => {
//           const active = isActive(it.href);
//           return (
//             <Link
//               key={it.href}
//               href={it.href}
//               prefetch={false}
//               aria-current={active ? "page" : undefined}
//               className={[
//                 "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition",
//                 active
//                   ? "bg-primary/10 text-primary ring-1 ring-primary/30"
//                   : "hover:bg-muted text-foreground",
//               ].join(" ")}
//             >
//               {it.label}
//             </Link>
//           );
//         })}
//       </nav>
//     </aside>
//   );
// }

// v.1.1.6 ================================================

// v.1.1.5 ================================================
// // src/app/admin/components/sidebar.tsx
// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";

// type Item = { label: string; href: string };

// const items: Item[] = [
//   { label: "Dashboard", href: "/admin" },
//   { label: "Categories Management", href: "/admin/categories" },
//   { label: "Product Management", href: "/admin/products" },
//   { label: "Category Products", href: "/admin/category-products" }, // ⬅️ เมนูใหม่
//   { label: "Featured Lists", href: "/admin/featured-lists" },
//   { label: "Discount Rules", href: "/admin/discount-rules" },
// ];

// export default function AdminSidebar() {
//   const pathname = usePathname();
//   const cleanPath = (pathname ?? "").replace(/\/+$/, "") || "/";

//   const isActive = (href: string) => {
//     if (href === "/admin") return cleanPath === "/admin";
//     return cleanPath === href || cleanPath.startsWith(href + "/");
//   };

//   return (
//     <aside className="h-full border-r bg-card/60 backdrop-blur p-4">
//       <div className="mb-2 text-sm font-medium text-muted-foreground">Management</div>
//       <nav className="flex flex-col gap-2">
//         {items.map((it) => {
//           const active = isActive(it.href);
//           return (
//             <Link
//               key={it.href}
//               href={it.href}
//               prefetch={false}
//               aria-current={active ? "page" : undefined}
//               className={[
//                 "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition",
//                 active
//                   ? "bg-primary/10 text-primary ring-1 ring-primary/30"
//                   : "hover:bg-muted text-foreground",
//               ].join(" ")}
//             >
//               {it.label}
//             </Link>
//           );
//         })}
//       </nav>
//     </aside>
//   );
// }

// v.1.1.5 ================================================

// v.1.1.4 ================================================
// // src/app/admin/components/sidebar.tsx
// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";

// type Item = { label: string; href: string };

// const items: Item[] = [
//   { label: "Dashboard", href: "/admin" },
//   { label: "Categories Management", href: "/admin/categories" },
//   { label: "Product Management", href: "/admin/products" },
//   { label: "Featured Lists", href: "/admin/featured-lists" }, // ⬅️ เพิ่มเมนูใหม่
//   { label: "Discount Rules", href: "/admin/discount-rules" },
// ];

// export default function AdminSidebar() {
//   const pathname = usePathname();
//   const cleanPath = (pathname ?? "").replace(/\/+$/, "") || "/";

//   const isActive = (href: string) => {
//     if (href === "/admin") return cleanPath === "/admin";
//     return cleanPath === href || cleanPath.startsWith(href + "/");
//   };

//   return (
//     <aside className="h-full border-r bg-card/60 backdrop-blur p-4">
//       <div className="mb-2 text-sm font-medium text-muted-foreground">Management</div>
//       <nav className="flex flex-col gap-2">
//         {items.map((it) => {
//           const active = isActive(it.href);
//           return (
//             <Link
//               key={it.href}
//               href={it.href}
//               prefetch={false}
//               aria-current={active ? "page" : undefined}
//               className={[
//                 "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition",
//                 active
//                   ? "bg-primary/10 text-primary ring-1 ring-primary/30"
//                   : "hover:bg-muted text-foreground",
//               ].join(" ")}
//             >
//               {it.label}
//             </Link>
//           );
//         })}
//       </nav>
//     </aside>
//   );
// }

// v.1.1.4 ================================================

// v.1.1.3 ================================================
// // src/app/admin/components/sidebar.tsx

// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";

// type Item = { label: string; href: string };

// const items: Item[] = [
//   { label: "Dashboard", href: "/admin" },
//   { label: "Categories Management", href: "/admin/categories" },
//   { label: "Product Management", href: "/admin/products" },
//   { label: "Discount Rules", href: "/admin/discount-rules" },
// ];

// export default function AdminSidebar() {
//   const pathname = usePathname();
//   const cleanPath = (pathname ?? "").replace(/\/+$/, "") || "/";

//   const isActive = (href: string) => {
//     if (href === "/admin") return cleanPath === "/admin";
//     return cleanPath === href || cleanPath.startsWith(href + "/");
//   };

//   return (
//     <aside className="h-full border-r bg-card/60 backdrop-blur p-4">
//       <div className="mb-2 text-sm font-medium text-muted-foreground">Management</div>
//       <nav className="flex flex-col gap-2">
//         {items.map((it) => {
//           const active = isActive(it.href);
//           return (
//             <Link
//               key={it.href}
//               href={it.href}
//               prefetch={false}
//               className={[
//                 "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition",
//                 active
//                   ? "bg-primary/10 text-primary ring-1 ring-primary/30"
//                   : "hover:bg-muted text-foreground",
//               ].join(" ")}
//             >
//               {it.label}
//             </Link>
//           );
//         })}
//       </nav>
//     </aside>
//   );
// }

// v.1.1.3 ================================================

// v.1.1.2 ================================================
// // src/app/admin/components/sidebar.tsx

// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";

// type Item = { label: string; href: string };

// const items: Item[] = [
//   { label: "Dashboard", href: "/admin" },
//   { label: "Categories Management", href: "/admin/categories" },
// ];

// export default function AdminSidebar() {
//   const pathname = usePathname();
//   // ตัด slash ท้าย (กันกรณี /admin/ )
//   const cleanPath = (pathname ?? "").replace(/\/+$/, "") || "/";

//   const isActive = (href: string) => {
//     if (href === "/admin") {
//       return cleanPath === "/admin"; // ตรงเป๊ะเท่านั้น
//     }
//     return cleanPath === href || cleanPath.startsWith(href + "/"); // ยอมรับเพจย่อย
//   };

//   return (
//     <aside className="h-full border-r bg-card/60 backdrop-blur p-4">
//       <div className="mb-2 text-sm font-medium text-muted-foreground">Management</div>
//       <nav className="flex flex-col gap-2">
//         {items.map((it) => {
//           const active = isActive(it.href);
//           return (
//             <Link
//               key={it.href}
//               href={it.href}
//               prefetch={false}
//               className={[
//                 "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition",
//                 active
//                   ? "bg-primary/10 text-primary ring-1 ring-primary/30"
//                   : "hover:bg-muted text-foreground",
//               ].join(" ")}
//             >
//               {it.label}
//             </Link>
//           );
//         })}
//       </nav>
//     </aside>
//   );
// }

// v.1.1.2 ================================================


// // src/app/amin/components/sidebar.tsx

// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";

// type Item = { label: string; href: string };

// const items: Item[] = [
//   { label: "Dashboard", href: "/admin" },
//   { label: "Categories Management", href: "/admin/categories" },
// ];

// export default function AdminSidebar() {
//   const pathname = usePathname();

//   return (
//     <aside className="h-full border-r bg-card/60 backdrop-blur p-4">
//       <div className="mb-2 text-sm font-medium text-muted-foreground">Management</div>
//       <nav className="flex flex-col gap-2">
//         {items.map((it) => {
//           const active = pathname === it.href || pathname?.startsWith(it.href + "/");
//           return (
//             <Link
//               key={it.href}
//               href={it.href}
//               className={[
//                 "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition",
//                 active
//                   ? "bg-primary/10 text-primary ring-1 ring-primary/30"
//                   : "hover:bg-muted text-foreground",
//               ].join(" ")}
//             >
//               {it.label}
//             </Link>
//           );
//         })}
//       </nav>
//     </aside>
//   );
// }

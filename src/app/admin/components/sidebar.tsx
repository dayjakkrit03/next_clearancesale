// v.1.1.2 ================================================
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { label: string; href: string };

const items: Item[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Categories Management", href: "/admin/categories" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  // ตัด slash ท้าย (กันกรณี /admin/ )
  const cleanPath = (pathname ?? "").replace(/\/+$/, "") || "/";

  const isActive = (href: string) => {
    if (href === "/admin") {
      return cleanPath === "/admin"; // ตรงเป๊ะเท่านั้น
    }
    return cleanPath === href || cleanPath.startsWith(href + "/"); // ยอมรับเพจย่อย
  };

  return (
    <aside className="h-full border-r bg-card/60 backdrop-blur p-4">
      <div className="mb-2 text-sm font-medium text-muted-foreground">Management</div>
      <nav className="flex flex-col gap-2">
        {items.map((it) => {
          const active = isActive(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              prefetch={false}
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
    </aside>
  );
}

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

// v.1.1.10 =====================================================================
// src/components/category-grid.tsx

"use client";

import { useMemo } from "react";
import Link from "next/link";

export interface MainImage {
  image_path: string;
  image_name: string;
}

export interface Category {
  id?: number | string;
  name: string;
  slug: string;
  main_image?: MainImage | null;
  visible?: boolean;
  order?: number;
}

interface CategoryGridProps {
  items?: Category[];
  title?: string;
  subtitle?: string;
}

const DEFAULT_TITLE = "หมวดหมู่สินค้า";
const DEFAULT_SUBTITLE =
  "เลือกซื้ออุปกรณ์เครือข่ายคุณภาพสูงจากหมวดหมู่ที่หลากหลาย";

const getImageUrl = (mainImage?: MainImage | null): string | null => {
  if (mainImage && mainImage.image_path && mainImage.image_name) {
    const path = mainImage.image_path.endsWith("/")
      ? mainImage.image_path.slice(0, -1)
      : mainImage.image_path;
    const fileName = mainImage.image_name.startsWith("/")
      ? mainImage.image_name.slice(1)
      : mainImage.image_name;
    return `${path}/${fileName}`;
  }
  return null;
};

const categoryHref = (c: Pick<Category, "name">) =>
  `/products?category=${encodeURIComponent((c.name ?? "").trim())}`;

export const CategoryGrid = ({ items, title, subtitle }: CategoryGridProps) => {
  const data = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    return list
      .filter((c) => c.visible !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [items]);

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {title ?? DEFAULT_TITLE}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {subtitle ?? DEFAULT_SUBTITLE}
          </p>
        </div>

        {data.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            ไม่มีหมวดหมู่ให้แสดง
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
            {data.map((category, index) => {
              const imageUrl = getImageUrl(category.main_image);

              return (
                <Link
                  key={(category.id ?? category.slug) ?? index}
                  href={categoryHref(category)}
                  className="group flex flex-col items-center justify-between
                             p-4 sm:p-5 rounded-xl bg-card hover:bg-gradient-card
                             shadow-soft hover:shadow-card-hover
                             transition-all duration-300
                             opacity-0 animate-fade-in
                             min-h-[150px] sm:min-h-[170px] lg:min-h-[190px]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* กล่องรูปภาพ + hover zoom & tilt */}
                  <div
                    className="flex-1 flex items-center justify-center w-full mb-2 sm:mb-3
                               overflow-hidden"  // กันรูปไม่ล้น
                  >
                    <img
                      src={imageUrl ?? "/placeholder.png"}
                      alt={category.name}
                      className="
                        w-auto
                        max-h-24         /* มือถือ: 96px */
                        sm:max-h-28      /* 110px */
                        md:max-h-32      /* 128px */
                        lg:max-h-36      /* 144px */
                        object-contain rounded-2xl shadow-soft
                        transition-transform duration-300
                        group-hover:scale-110 group-hover:-translate-y-1 group-hover:rotate-1
                      "
                    />
                  </div>

                  <span
                    className="
                      mt-1
                      text-[11px] sm:text-xs md:text-sm
                      font-medium text-center
                      group-hover:text-primary
                      transition-colors
                      leading-tight
                    "
                  >
                    {category.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

// v.1.1.10 =====================================================================

// v.1.1.9 ======================================================================
// // src/components/category-grid.tsx
// "use client";

// import { useMemo } from "react";
// import Link from "next/link";

// export interface MainImage {
//   image_path: string;
//   image_name: string;
// }

// export interface Category {
//   id?: number | string;
//   name: string;
//   slug: string;
//   main_image?: MainImage | null;
//   visible?: boolean;
//   order?: number;
// }

// interface CategoryGridProps {
//   items?: Category[];
//   title?: string;
//   subtitle?: string;
// }

// const DEFAULT_TITLE = "หมวดหมู่สินค้า";
// const DEFAULT_SUBTITLE =
//   "เลือกซื้ออุปกรณ์เครือข่ายคุณภาพสูงจากหมวดหมู่ที่หลากหลาย";

// const getImageUrl = (mainImage?: MainImage | null): string | null => {
//   if (mainImage && mainImage.image_path && mainImage.image_name) {
//     const path = mainImage.image_path.endsWith("/")
//       ? mainImage.image_path.slice(0, -1)
//       : mainImage.image_path;
//     const fileName = mainImage.image_name.startsWith("/")
//       ? mainImage.image_name.slice(1)
//       : mainImage.image_name;
//     return `${path}/${fileName}`;
//   }
//   return null;
// };

// const categoryHref = (c: Pick<Category, "name">) =>
//   `/products?category=${encodeURIComponent((c.name ?? "").trim())}`;

// export const CategoryGrid = ({ items, title, subtitle }: CategoryGridProps) => {
//   const data = useMemo(() => {
//     const list = Array.isArray(items) ? items : [];
//     return list
//       .filter((c) => c.visible !== false)
//       .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
//   }, [items]);

//   return (
//     <section className="py-12 bg-background">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-10">
//           <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
//             {title ?? DEFAULT_TITLE}
//           </h2>
//           <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
//             {subtitle ?? DEFAULT_SUBTITLE}
//           </p>
//         </div>

//         {data.length === 0 ? (
//           <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
//             ไม่มีหมวดหมู่ให้แสดง
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {data.map((category, index) => {
//               const imageUrl = getImageUrl(category.main_image);

//               return (
//                 <Link
//                   key={(category.id ?? category.slug) ?? index}
//                   href={categoryHref(category)}
//                   className="flex flex-col items-center justify-between
//                              p-4 sm:p-5 rounded-xl bg-card hover:bg-gradient-card
//                              shadow-soft hover:shadow-card-hover
//                              transition-all duration-300 group
//                              opacity-0 animate-fade-in
//                              min-h-[150px] sm:min-h-[170px] lg:min-h-[190px]"
//                   style={{ animationDelay: `${index * 0.1}s` }}
//                 >
//                   {/* กล่องของรูปภาพ ให้กินพื้นที่การ์ดเยอะ ๆ แต่ไม่ล้น */}
//                   <div className="flex-1 flex items-center justify-center w-full mb-2 sm:mb-3">
//                     <img
//                       src={imageUrl ?? "/placeholder.png"}
//                       alt={category.name}
//                       className="
//                         w-auto
//                         max-h-16 sm:max-h-20 md:max-h-24 lg:max-h-28
//                         object-contain
//                         rounded-2xl shadow-soft
//                       "
//                     />
//                   </div>

//                   {/* ชื่อหมวดหมู่ – เล็กลง และไม่ล้นการ์ด */}
//                   <span
//                     className="
//                       mt-1
//                       text-[11px] sm:text-xs md:text-sm
//                       font-medium text-center
//                       group-hover:text-primary
//                       transition-colors
//                       leading-tight
//                     "
//                   >
//                     {category.name}
//                   </span>
//                 </Link>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// v.1.1.9 ======================================================================

// v.1.1.8 ======================================================================
// // src/components/category-grid.tsx
// "use client";

// import { useMemo } from "react";
// import Link from "next/link"; // ✅ ใช้ Link ให้เนวิเกชันเหมือนเมนู

// export interface MainImage {
//   image_path: string;
//   image_name: string;
// }

// export interface Category {
//   id?: number | string;
//   name: string;
//   slug: string;
//   main_image?: MainImage | null;
//   visible?: boolean;
//   order?: number;
// }

// interface CategoryGridProps {
//   items?: Category[];
//   title?: string;
//   subtitle?: string;
// }

// const DEFAULT_TITLE = "หมวดหมู่สินค้า";
// const DEFAULT_SUBTITLE = "เลือกซื้ออุปกรณ์เครือข่ายคุณภาพสูงจากหมวดหมู่ที่หลากหลาย";

// const getImageUrl = (mainImage?: MainImage | null): string | null => {
//   if (mainImage && mainImage.image_path && mainImage.image_name) {
//     const path = mainImage.image_path.endsWith("/")
//       ? mainImage.image_path.slice(0, -1)
//       : mainImage.image_path;
//     const fileName = mainImage.image_name.startsWith("/")
//       ? mainImage.image_name.slice(1)
//       : mainImage.image_name;
//     return `${path}/${fileName}`;
//   }
//   return null;
// };

// // ✅ สร้าง href ให้ตรงรูปแบบ /products?category=...
// // const categoryHref = (c: Pick<Category, "slug" | "name">) =>
// //   `/products?category=${encodeURIComponent(c.slug ?? c.name)}`;

// const categoryHref = (c: Pick<Category, "name">) =>
//   `/products?category=${encodeURIComponent((c.name ?? "").trim())}`;

// export const CategoryGrid = ({ items, title, subtitle }: CategoryGridProps) => {
//   const data = useMemo(() => {
//     const list = Array.isArray(items) ? items : [];
//     return list
//       .filter((c) => c.visible !== false)
//       .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
//   }, [items]);

//   return (
//     <section className="py-12 bg-background">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-10">
//           <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
//             {title ?? DEFAULT_TITLE}
//           </h2>
//           <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
//             {subtitle ?? DEFAULT_SUBTITLE}
//           </p>
//         </div>

//         {data.length === 0 ? (
//           <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
//             ไม่มีหมวดหมู่ให้แสดง
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {data.map((category, index) => {
//               const imageUrl = getImageUrl(category.main_image);

//               return (
//                 <Link
//                   key={(category.id ?? category.slug) ?? index}
//                   href={categoryHref(category)} // ✅ กดการ์ดแล้ววิ่งไป /products?category=...
//                   className="flex flex-col items-center p-6 rounded-xl bg-card hover:bg-gradient-card shadow-soft hover:shadow-card-hover transition-all duration-300 group opacity-0 animate-fade-in"
//                   style={{ animationDelay: `${index * 0.1}s` }}
//                 >
//                   <div className="mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
//                     <img
//                       src={imageUrl ?? "/placeholder.png"}
//                       alt={category.name}
//                       width={64}
//                       height={64}
//                       className="w-16 h-16 object-cover rounded-2xl shadow-soft"
//                     />
//                   </div>
//                   <span className="text-sm font-medium text-center group-hover:text-primary transition-colors leading-tight h-10">
//                     {category.name}
//                   </span>
//                 </Link>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// v.1.1.8 ======================================================================

// v.1.1.7 ================================================
// // src/components/category-grid.tsx

// "use client";

// import { useMemo } from "react";
// // ❌ ลบ import useRouter และ next/navigation ออก เพราะทำให้เกิด ERROR
// // import { useRouter } from "next/navigation"; 
// // ❌ ลบ import Image และ next/image ออก เพราะทำให้เกิด ERROR
// // import Image from "next/image"; 

// // 💡 สร้าง Type สำหรับข้อมูลรูปภาพหลักที่ถูก JOIN มาจาก Backend
// export interface MainImage {
//   image_path: string; // มาจาก ui_categories.image_url เดิม (คือ path โฟลเดอร์)
//   image_name: string; // มาจาก images_categories.image_name (คือชื่อไฟล์ที่ display_order = 0)
// }

// export interface Category {
//   id?: number | string;
//   name: string;
//   slug: string;
  
//   // ➕ เพิ่มโครงสร้างข้อมูลใหม่สำหรับรูปภาพหลัก
//   main_image?: MainImage | null;
//   visible?: boolean;
//   order?: number;
// }

// interface CategoryGridProps {
//   items?: Category[];
//   title?: string;
//   subtitle?: string;
// }

// const DEFAULT_TITLE = "หมวดหมู่สินค้า";
// const DEFAULT_SUBTITLE = "เลือกซื้ออุปกรณ์เครือข่ายคุณภาพสูงจากหมวดหมู่ที่หลากหลาย";

// /**
//  * 💡 ฟังก์ชันช่วยสร้าง URL รูปภาพที่สมบูรณ์จาก Path และ ชื่อไฟล์
//  * @param mainImage - ออบเจ็กต์ MainImage ที่มี image_path และ image_name
//  * @returns string URL รูปภาพที่สมบูรณ์ หรือ null ถ้าข้อมูลไม่ครบ
//  */
// const getImageUrl = (mainImage?: MainImage | null): string | null => {
//   if (mainImage && mainImage.image_path && mainImage.image_name) {
//     // 1. นำ image_path (Path โฟลเดอร์ เช่น /uploads/categories/lan-utp)
//     // 2. ตามด้วย "/"
//     // 3. ตามด้วย image_name (ชื่อไฟล์ เช่น lan-utp.webp)
    
//     // ตรวจสอบและตัด "/" ที่เกินมาเพื่อป้องกัน URL ผิดพลาด
//     const path = mainImage.image_path.endsWith('/') 
//       ? mainImage.image_path.slice(0, -1) 
//       : mainImage.image_path;

//     const fileName = mainImage.image_name.startsWith('/') 
//       ? mainImage.image_name.slice(1) 
//       : mainImage.image_name;
      
//     return `${path}/${fileName}`;
//   }
//   return null;
// };


// export const CategoryGrid = ({ items, title, subtitle }: CategoryGridProps) => {
//   // 💡 ปรับปรุง: ลบ const router = useRouter(); ออก
//   // const router = useRouter(); 

//   // ✅ กรองเฉพาะที่มองเห็น + เรียงตาม order ถ้ามี
//   const data = useMemo(() => {
//     const list = Array.isArray(items) ? items : [];
//     return list
//       .filter((c) => c.visible !== false)
//       .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
//   }, [items]);

//   // 💡 ปรับปรุง: เปลี่ยนไปใช้ window.location.href แทน router.push เพื่อให้คอมไพล์ได้
//   const handleCategoryClick = (category: { slug?: string; name: string }) => {
//     const url = `/products?category=${encodeURIComponent(category.slug ?? category.name)}`;
//     if (typeof window !== 'undefined') {
//         window.location.href = url;
//     }
//   };

//   return (
//     <section className="py-12 bg-background">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-10">
//           <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
//             {title ?? DEFAULT_TITLE}
//           </h2>
//           <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
//             {subtitle ?? DEFAULT_SUBTITLE}
//           </p>
//         </div>

//         {/* ถ้าไม่มีข้อมูล แสดง empty state สวย ๆ */}
//         {data.length === 0 ? (
//           <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
//             ไม่มีหมวดหมู่ให้แสดง
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {data.map((category, index) => {
//               // 💡 ปรับปรุง: ใช้ getImageUrl ในการสร้าง URL รูปภาพ
//               const imageUrl = getImageUrl(category.main_image);
              
//               return (
//                 <div
//                   key={(category.id ?? category.slug) ?? index}
//                   onClick={() => handleCategoryClick(category)}
//                   className="flex flex-col items-center p-6 rounded-xl bg-card hover:bg-gradient-card shadow-soft hover:shadow-card-hover transition-all duration-300 cursor-pointer group opacity-0 animate-fade-in"
//                   style={{ animationDelay: `${index * 0.1}s` }}
//                 >
//                   <div className="mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
//                     {/* 💡 ปรับปรุง: เปลี่ยนจาก <Image> Component เป็น <img> มาตรฐาน */}
//                     <img
//                       src={imageUrl ?? "/placeholder.png"} 
//                       alt={category.name}
//                       width={64}
//                       height={64}
//                       className="w-16 h-16 object-cover rounded-2xl shadow-soft"
//                     />
//                   </div>
//                   <span className="text-sm font-medium text-center group-hover:text-primary transition-colors leading-tight h-10">
//                     {category.name}
//                   </span>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// v.1.1.7 ================================================


// v.1.1.6 ================================================
// // src/components/category-grid.tsx
// "use client";

// import { useMemo } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";

// export interface Category {
//   id?: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   image?: string;
//   visible?: boolean;
//   order?: number;
// }

// interface CategoryGridProps {
//   items?: Category[];
//   title?: string;
//   subtitle?: string;
// }

// const DEFAULT_TITLE = "หมวดหมู่สินค้า";
// const DEFAULT_SUBTITLE = "เลือกซื้ออุปกรณ์เครือข่ายคุณภาพสูงจากหมวดหมู่ที่หลากหลาย";

// export const CategoryGrid = ({ items, title, subtitle }: CategoryGridProps) => {
//   const router = useRouter();

//   // ✅ กรองเฉพาะที่มองเห็น + เรียงตาม order ถ้ามี
//   const data = useMemo(() => {
//     const list = Array.isArray(items) ? items : [];
//     return list
//       .filter((c) => c.visible !== false)
//       .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
//   }, [items]);

//   const handleCategoryClick = (category: { slug?: string; name: string }) => {
//     router.push(`/products?category=${encodeURIComponent(category.slug ?? category.name)}`);
//   };

//   return (
//     <section className="py-12 bg-background">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-10">
//           <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
//             {title ?? DEFAULT_TITLE}
//           </h2>
//         <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
//             {subtitle ?? DEFAULT_SUBTITLE}
//           </p>
//         </div>

//         {/* ถ้าไม่มีข้อมูล แสดง empty state สวย ๆ */}
//         {data.length === 0 ? (
//           <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
//             ไม่มีหมวดหมู่ให้แสดง
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {data.map((category, index) => (
//               <div
//                 key={(category.id ?? category.slug) ?? index}
//                 onClick={() => handleCategoryClick(category)}
//                 className="flex flex-col items-center p-6 rounded-xl bg-card hover:bg-gradient-card shadow-soft hover:shadow-card-hover transition-all duration-300 cursor-pointer group opacity-0 animate-fade-in"
//                 style={{ animationDelay: `${index * 0.1}s` }}
//               >
//                 <div className="mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
//                   <Image
//                     src={category.image_url ?? category.image ?? "/placeholder.png"}
//                     alt={category.name}
//                     width={64}
//                     height={64}
//                     className="w-16 h-16 object-cover rounded-2xl shadow-soft"
//                   />
//                 </div>
//                 <span className="text-sm font-medium text-center group-hover:text-primary transition-colors leading-tight h-10">
//                   {category.name}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// v.1.1.6 ================================================

// v.1.1.5 ================================================
// // src/components/category-grid.tsx

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";

// export interface Category {
//   id?: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   image?: string;
//   visible?: boolean;
//   order?: number;
// }

// interface CategoryGridProps {
//   items?: Category[];
//   title?: string;
//   subtitle?: string;
// }

// const DEFAULT_TITLE = "หมวดหมู่สินค้า";
// const DEFAULT_SUBTITLE = "เลือกซื้ออุปกรณ์เครือข่ายคุณภาพสูงจากหมวดหมู่ที่หลากหลาย";

// export const CategoryGrid = ({ items, title, subtitle }: CategoryGridProps) => {
//   const router = useRouter();
//   const data = items && items.length > 0 ? items : [];

//   const handleCategoryClick = (category: { slug?: string; name: string }) => {
//     router.push(`/products?category=${encodeURIComponent(category.slug ?? category.name)}`);
//   };

//   return (
//     <section className="py-12 bg-background">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-10">
//           <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
//             {title ?? DEFAULT_TITLE}
//           </h2>
//           <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
//             {subtitle ?? DEFAULT_SUBTITLE}
//           </p>
//         </div>

//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//           {data.map((category, index) => (
//             <div
//               key={(category.id ?? category.slug) ?? index}
//               onClick={() => handleCategoryClick(category)}
//               className="flex flex-col items-center p-6 rounded-xl bg-card hover:bg-gradient-card shadow-soft hover:shadow-card-hover transition-all duration-300 cursor-pointer group opacity-0 animate-fade-in"
//               style={{ animationDelay: `${index * 0.1}s` }}
//             >
//               <div className="mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
//                 <Image
//                   src={category.image_url ?? category.image ?? "/placeholder.png"}
//                   alt={category.name}
//                   width={64}
//                   height={64}
//                   className="w-16 h-16 object-cover rounded-2xl shadow-soft"
//                 />
//               </div>
//               <span className="text-sm font-medium text-center group-hover:text-primary transition-colors leading-tight h-10">
//                 {category.name}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// v.1.1.5 ================================================

// v.1.1.4 ================================================
// // src/components/category-grid.tsx

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";

// export interface Category {
//   id?: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   image?: string;
//   visible?: boolean;
//   order?: number;
// }

// const MOCK_CATEGORIES: Category[] = [/* ...เดิม... */];

// interface CategoryGridProps {
//   items?: Category[]; // ถ้ามี = ใช้เลย ไม่ต้อง fetch
// }

// export const CategoryGrid = ({ items: initial }: CategoryGridProps) => {
//   const router = useRouter();

//   // ถ้ามี initial ใช้อันนั้น, ถ้าไม่มีค่อยใช้ mock เป็นค่าเริ่ม
//   const [items, setItems] = useState<Category[]>(
//     initial && initial.length > 0 ? initial : MOCK_CATEGORIES
//   );

//   const shouldFetchFromClient = !initial || initial.length === 0;

//   useEffect(() => {
//     if (!shouldFetchFromClient) return;        // <-- กัน fetch ซ้ำ
//     let cancelled = false;
//     (async () => {
//       try {
//         const res = await fetch("/api/mock/categories", { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const next: Category[] = (data?.items ?? [])
//           .filter((c: Category) => c.visible !== false)
//           .sort((a: Category, b: Category) => (a.order ?? 0) - (b.order ?? 0));
//         if (!cancelled && next.length > 0) setItems(next);
//       } catch {}
//     })();
//     return () => { cancelled = true; };
//   }, [shouldFetchFromClient]);

//   const handleCategoryClick = (category: { slug?: string; name: string }) => {
//     router.push(`/products?category=${encodeURIComponent(category.slug ?? category.name)}`);
//   };

//   const data = useMemo(() => items ?? MOCK_CATEGORIES, [items]);

//   return (
//     <section className="py-12 bg-background">
//       <div className="container mx-auto px-4">
        
//         <div className="text-center mb-10">
//            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
//              หมวดหมู่สินค้า
//            </h2>
//            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
//              เลือกซื้ออุปกรณ์เครือข่ายคุณภาพสูงจากหมวดหมู่ที่หลากหลาย
//            </p>           
//          </div>

//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//           {data.map((category, index) => (
//             <div
//               key={(category.id ?? category.slug) ?? index}
//               onClick={() => handleCategoryClick(category)}
//               className="flex flex-col items-center p-6 rounded-xl bg-card hover:bg-gradient-card shadow-soft hover:shadow-card-hover transition-all duration-300 cursor-pointer group opacity-0 animate-fade-in"
//               style={{ animationDelay: `${index * 0.1}s` }}
//             >
//               <div className="mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
//                 <Image
//                   src={category.image_url ?? category.image ?? "/placeholder.png"}
//                   alt={category.name}
//                   width={64}
//                   height={64}
//                   className="w-16 h-16 object-cover rounded-2xl shadow-soft"
//                 />
//               </div>
//               <span className="text-sm font-medium text-center group-hover:text-primary transition-colors leading-tight h-10">
//                 {category.name}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// v.1.1.4 ================================================

// v.1.1.3 ================================================
// // src/components/category-grid.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";

// export interface Category {
//   id?: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   image?: string;
//   /** ฟิลด์จากฝั่ง admin mock api */
//   visible?: boolean;
//   order?: number;
// }

// const MOCK_CATEGORIES: Category[] = [
//   { slug: "lan-utp", image: "/assets/category-lan-utp.jpg", name: "LAN (UTP) System" },
//   { slug: "fiber-optic", image: "/assets/category-fiber-optic.jpg", name: "FIBER OPTIC System" },
//   { slug: "fttr-fttx", image: "/assets/category-fttr-fttx.jpg", name: "FTTR/FTTx OVAL / FLAT CABLE" },
//   { slug: "data-center", image: "/assets/category-data-center.jpg", name: "DATA CENTER System" },
//   { slug: "coaxial", image: "/assets/category-coaxial.jpg", name: "COAXIAL (RG) System" },
//   { slug: "telephone", image: "/assets/category-telephone.jpg", name: "Telephone CABLE" },
//   { slug: "solar", image: "/assets/category-solar.jpg", name: "SOLAR CABLE" },
//   { slug: "security-control", image: "/assets/category-security-control.jpg", name: "SECURITY AND CONTROL System" },
//   { slug: "networking", image: "/assets/category-networking.jpg", name: "NETWORKING System" },
//   { slug: "germany-rack", image: "/assets/category-germany-rack.jpg", name: "GERMANY RACK" },
//   { slug: "cctv-cabinet", image: "/assets/category-cctv-cabinet.jpg", name: "CCTV OUTDOOR CABINET" },
//   { slug: "link-rack", image: "/assets/category-link-rack.jpg", name: "LINK RACK" },
// ];

// interface CategoryGridProps {
//   items?: Category[]; // ยังรองรับการส่งเข้ามาจาก server ได้
// }

// export const CategoryGrid = ({ items: initial }: CategoryGridProps) => {
//   const router = useRouter();
//   const [items, setItems] = useState<Category[]>(
//     initial && initial.length > 0 ? initial : MOCK_CATEGORIES
//   );
//   const [loadedFromApi, setLoadedFromApi] = useState(false);

//   useEffect(() => {
//     let cancelled = false;

//     async function load() {
//       try {
//         // ฝั่ง client ใช้ path แบบ relative ได้เลย
//         const res = await fetch("/api/mock/categories", { cache: "no-store" });
//         if (!res.ok) throw new Error("bad status");
//         const data = await res.json();

//         // กรองเฉพาะที่แสดง (visible !== false) และเรียงตาม order
//         const next: Category[] = (data?.items ?? [])
//           .filter((c: Category) => c.visible !== false)
//           .sort((a: Category, b: Category) => (a.order ?? 0) - (b.order ?? 0));

//         if (!cancelled && next.length > 0) {
//           setItems(next);
//           setLoadedFromApi(true);
//         }
//       } catch (_err) {
//         // ถ้าเรียกไม่สำเร็จจะคง mock ไว้ และไม่โยน error ไป UI
//         if (!cancelled) setLoadedFromApi(false);
//       }
//     }

//     load();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const data = items && items.length > 0 ? items : MOCK_CATEGORIES;

//   const handleCategoryClick = (category: { slug?: string; name: string }) => {
//     router.push(`/products?category=${encodeURIComponent(category.slug ?? category.name)}`);
//   };

//   return (
//     <section className="py-12 bg-background">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-10">
//           <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
//             หมวดหมู่สินค้า
//           </h2>
//           <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
//             เลือกซื้ออุปกรณ์เครือข่ายคุณภาพสูงจากหมวดหมู่ที่หลากหลาย
//           </p>
//           {!loadedFromApi && (
//             <p className="text-xs text-muted-foreground">
//               * แสดงข้อมูลจาก mock (ชั่วคราว) หรือโหลด API ไม่สำเร็จ
//             </p>
//           )}
//         </div>

//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//           {data.map((category, index) => (
//             <div
//               key={(category.id ?? category.slug) ?? index}
//               onClick={() => handleCategoryClick(category)}
//               className="flex flex-col items-center p-6 rounded-xl bg-card hover:bg-gradient-card shadow-soft hover:shadow-card-hover transition-all duration-300 cursor-pointer group opacity-0 animate-fade-in"
//               style={{ animationDelay: `${index * 0.1}s` }}
//             >
//               <div className="mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
//                 <Image
//                   src={category.image_url ?? category.image ?? "/placeholder.png"}
//                   alt={category.name}
//                   width={64}
//                   height={64}
//                   className="w-16 h-16 object-cover rounded-2xl shadow-soft"
//                 />
//               </div>
//               <span className="text-sm font-medium text-center group-hover:text-primary transition-colors leading-tight h-10">
//                 {category.name}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// v.1.1.3 ================================================

// v.1.1.2 ================================================
// // src/components/category-grid.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";

// export interface Category {
//   id?: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   image?: string;
//   /** ฟิลด์จากฝั่ง admin mock api */
//   visible?: boolean;
//   order?: number;
// }

// const MOCK_CATEGORIES: Category[] = [
//   { slug: "lan-utp", image: "/assets/category-lan-utp.jpg", name: "LAN (UTP) System" },
//   { slug: "fiber-optic", image: "/assets/category-fiber-optic.jpg", name: "FIBER OPTIC System" },
//   { slug: "fttr-fttx", image: "/assets/category-fttr-fttx.jpg", name: "FTTR/FTTx OVAL / FLAT CABLE" },
//   { slug: "data-center", image: "/assets/category-data-center.jpg", name: "DATA CENTER System" },
//   { slug: "coaxial", image: "/assets/category-coaxial.jpg", name: "COAXIAL (RG) System" },
//   { slug: "telephone", image: "/assets/category-telephone.jpg", name: "Telephone CABLE" },
//   { slug: "solar", image: "/assets/category-solar.jpg", name: "SOLAR CABLE" },
//   { slug: "security-control", image: "/assets/category-security-control.jpg", name: "SECURITY AND CONTROL System" },
//   { slug: "networking", image: "/assets/category-networking.jpg", name: "NETWORKING System" },
//   { slug: "germany-rack", image: "/assets/category-germany-rack.jpg", name: "GERMANY RACK" },
//   { slug: "cctv-cabinet", image: "/assets/category-cctv-cabinet.jpg", name: "CCTV OUTDOOR CABINET" },
//   { slug: "link-rack", image: "/assets/category-link-rack.jpg", name: "LINK RACK" },
// ];

// interface CategoryGridProps {
//   items?: Category[]; // ยังรองรับการส่งเข้ามาจาก server ได้
// }

// export const CategoryGrid = ({ items: initial }: CategoryGridProps) => {
//   const router = useRouter();
//   const [items, setItems] = useState<Category[]>(
//     initial && initial.length > 0 ? initial : MOCK_CATEGORIES
//   );
//   const [loadedFromApi, setLoadedFromApi] = useState(false);

//   useEffect(() => {
//     let cancelled = false;

//     async function load() {
//       try {
//         // ฝั่ง client ใช้ path แบบ relative ได้เลย
//         const res = await fetch("/api/mock/categories", { cache: "no-store" });
//         if (!res.ok) throw new Error("bad status");
//         const data = await res.json();

//         // กรองเฉพาะที่แสดง (visible !== false) และเรียงตาม order
//         const next: Category[] = (data?.items ?? [])
//           .filter((c: Category) => c.visible !== false)
//           .sort((a: Category, b: Category) => (a.order ?? 0) - (b.order ?? 0));

//         if (!cancelled && next.length > 0) {
//           setItems(next);
//           setLoadedFromApi(true);
//         }
//       } catch (_err) {
//         // ถ้าเรียกไม่สำเร็จจะคง mock ไว้ และไม่โยน error ไป UI
//         if (!cancelled) setLoadedFromApi(false);
//       }
//     }

//     load();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const data = items && items.length > 0 ? items : MOCK_CATEGORIES;

//   const handleCategoryClick = (category: { slug?: string; name: string }) => {
//     router.push(`/products?category=${encodeURIComponent(category.slug ?? category.name)}`);
//   };

//   return (
//     <section className="py-12 bg-background">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-10">
//           <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
//             หมวดหมู่สินค้า
//           </h2>
//           <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
//             เลือกซื้ออุปกรณ์เครือข่ายคุณภาพสูงจากหมวดหมู่ที่หลากหลาย
//           </p>
//           {!loadedFromApi && (
//             <p className="text-xs text-muted-foreground">
//               * แสดงข้อมูลจาก mock (ชั่วคราว) หรือโหลด API ไม่สำเร็จ
//             </p>
//           )}
//         </div>

//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//           {data.map((category, index) => (
//             <div
//               key={(category.id ?? category.slug) ?? index}
//               onClick={() => handleCategoryClick(category)}
//               className="flex flex-col items-center p-6 rounded-xl bg-card hover:bg-gradient-card shadow-soft hover:shadow-card-hover transition-all duration-300 cursor-pointer group opacity-0 animate-fade-in"
//               style={{ animationDelay: `${index * 0.1}s` }}
//             >
//               <div className="mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
//                 <Image
//                   src={category.image_url ?? category.image ?? "/placeholder.png"}
//                   alt={category.name}
//                   width={64}
//                   height={64}
//                   className="w-16 h-16 object-cover rounded-2xl shadow-soft"
//                 />
//               </div>
//               <span className="text-sm font-medium text-center group-hover:text-primary transition-colors leading-tight h-10">
//                 {category.name}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// v.1.1.2 ================================================

// // src/components/category-grid.tsx

// "use client";

// import { useRouter } from "next/navigation";
// import Image from "next/image";

// export interface Category {
//   id?: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   image?: string;
// }

// const MOCK_CATEGORIES: Category[] = [
//   { slug: "lan-utp", image: "/assets/category-lan-utp.jpg", name: "LAN (UTP) System" },
//   { slug: "fiber-optic", image: "/assets/category-fiber-optic.jpg", name: "FIBER OPTIC System" },
//   { slug: "fttr-fttx", image: "/assets/category-fttr-fttx.jpg", name: "FTTR/FTTx OVAL / FLAT CABLE" },
//   { slug: "data-center", image: "/assets/category-data-center.jpg", name: "DATA CENTER System" },
//   { slug: "coaxial", image: "/assets/category-coaxial.jpg", name: "COAXIAL (RG) System" },
//   { slug: "telephone", image: "/assets/category-telephone.jpg", name: "Telephone CABLE" },
//   { slug: "solar", image: "/assets/category-solar.jpg", name: "SOLAR CABLE" },
//   { slug: "security-control", image: "/assets/category-security-control.jpg", name: "SECURITY AND CONTROL System" },
//   { slug: "networking", image: "/assets/category-networking.jpg", name: "NETWORKING System" },
//   { slug: "germany-rack", image: "/assets/category-germany-rack.jpg", name: "GERMANY RACK" },
//   { slug: "cctv-cabinet", image: "/assets/category-cctv-cabinet.jpg", name: "CCTV OUTDOOR CABINET" },
//   { slug: "link-rack", image: "/assets/category-link-rack.jpg", name: "LINK RACK" },
// ];

// interface CategoryGridProps {
//   items?: Category[];
// }

// export const CategoryGrid = ({ items }: CategoryGridProps) => {
//   const router = useRouter();

//   const data = items && items.length > 0 ? items : MOCK_CATEGORIES;

//   const handleCategoryClick = (category: { slug?: string; name: string }) => {
//     router.push(`/products?category=${encodeURIComponent(category.slug ?? category.name)}`);
//   };

//   return (
//     <section className="py-12 bg-background">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-10">
//           <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
//             หมวดหมู่สินค้า
//           </h2>
//           <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
//             เลือกซื้ออุปกรณ์เครือข่ายคุณภาพสูงจากหมวดหมู่ที่หลากหลาย
//           </p>
//         </div>

//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//           {data.map((category, index) => (
//             <div
//               key={category.slug ?? index}
//               onClick={() => handleCategoryClick(category)}
//               className="flex flex-col items-center p-6 rounded-xl bg-card hover:bg-gradient-card shadow-soft hover:shadow-card-hover transition-all duration-300 cursor-pointer group opacity-0 animate-fade-in"
//               style={{ animationDelay: `${index * 0.1}s` }}
//             >
//               <div className="mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
//                 <Image
//                   src={category.image_url ?? category.image ?? "/placeholder.png"}
//                   alt={category.name}
//                   width={64}
//                   height={64}
//                   className="w-16 h-16 object-cover rounded-2xl shadow-soft"
//                 />
//               </div>
//               <span className="text-sm font-medium text-center group-hover:text-primary transition-colors leading-tight h-10">
//                 {category.name}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };
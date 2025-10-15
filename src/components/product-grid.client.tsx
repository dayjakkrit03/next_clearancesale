// v.1.1.5 ==============================================
// src/components/product-grid.client.tsx
"use client";

/* Client Component: ไม่ fetch อะไรอีกแล้ว
   รับ items(ที่มี frameInfo/หมวด) + visibleParts + viewMode แล้ว render อย่างเดียว */
import { useMemo } from "react";
import { ProductCard } from "./product-card";
import type { ProductCardProps } from "./product-card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

/* ====== Types ให้ตรงกับฝั่ง server ====== */
type UIProductBase = {
  id: number | string;
  name: string;
  price: number;
  discountPercent?: number;
  image_url?: string;
  rating?: number;
  reviews?: number;
  brand?: string;
  sku?: string;
  uom?: string;
  category_id?: number | string;
  slug?: string;
};

type VisibleParts = Partial<{
  image: boolean;
  discountBadge: boolean;
  brandLogo: boolean;
  frame: boolean;

  brandName: boolean;
  sku: boolean;
  name: boolean;
  ratingReview: boolean;
  category: boolean;
  price: boolean;
  originalPrice: boolean;
  uom: boolean;
}>;

type UIProductReady = UIProductBase & {
  frameInfo?: ProductCardProps["frameInfo"] | null;
  categoryName?: string;
};

export interface ProductGridClientProps {
  items: UIProductReady[];
  visibleParts?: VisibleParts;
  viewMode?: "grid" | "list";
  onAddToCart?: () => void;

  /** หัวข้อ/คำอธิบายของ section (สำหรับลิสต์แนะนำแต่ละก้อน) */
  title?: string;
  subtitle?: string;
}

export function ProductGridClient({
  items,
  visibleParts,
  viewMode = "grid",
  onAddToCart,
  title = "สินค้าแนะนำ",
  subtitle,
}: ProductGridClientProps) {
  const gridCols = useMemo(
    () =>
      viewMode === "grid"
        ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
        : "flex flex-col gap-4",
    [viewMode]
  );

  const getOriginalPrice = (price: number, discountPercent?: number) => {
    if (!discountPercent || discountPercent <= 0) return undefined;
    const original = price / (1 - discountPercent / 100);
    return Math.round(original);
  };

  return (
    <section className="py-12 bg-muted">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            ดูทั้งหมด
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Grid */}
        <div className={gridCols}>
          {items.map((p, index) => {
            const original = getOriginalPrice(p.price, p.discountPercent);

            return (
              <div
                key={p.id}
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 0.08}s` }} // ไล่ดีเลย์ 80ms/ใบ
              >
                <ProductCard
                  id={p.id}
                  slug={p.slug}
                  name={p.name}
                  price={p.price}
                  originalPrice={original}
                  discount={p.discountPercent}
                  rating={p.rating ?? 0}
                  reviews={p.reviews ?? 0}
                  image={p.image_url ?? "/placeholder.png"}
                  onAddToCart={onAddToCart}
                  viewMode={viewMode}
                  visibleParts={visibleParts}
                  // NEW info (เหมือนเดิม)
                  brand={p.brand}
                  sku={p.sku}
                  uom={p.uom}
                  categoryName={p.categoryName}
                  // กรอบที่คำนวณจาก server พร้อมใช้ตั้งแต่เฟรมแรก
                  frameInfo={p.frameInfo ?? null}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ProductGridClient;

// v.1.1.5 ==============================================


// v.1.1.4 ==============================================
// // src/components/product-grid.client.tsx
// "use client";

// /* Client Component: ไม่ fetch อะไรอีกแล้ว
//    รับ items(ที่มี frameInfo/หมวด) + visibleParts + viewMode แล้ว render อย่างเดียว */
// import { useMemo } from "react";
// import { ProductCard } from "./product-card";
// import type { ProductCardProps } from "./product-card";
// import { Button } from "@/components/ui/button";
// import { ChevronRight } from "lucide-react";

// /* ====== Types ให้ตรงกับฝั่ง server ====== */
// type UIProductBase = {
//   id: number | string;
//   name: string;
//   price: number;
//   discountPercent?: number;
//   image_url?: string;
//   rating?: number;
//   reviews?: number;
//   brand?: string;
//   sku?: string;
//   uom?: string;
//   category_id?: number | string;
//   slug?: string;
// };

// type VisibleParts = Partial<{
//   image: boolean;
//   discountBadge: boolean;
//   brandLogo: boolean;
//   frame: boolean;

//   brandName: boolean;
//   sku: boolean;
//   name: boolean;
//   ratingReview: boolean;
//   category: boolean;
//   price: boolean;
//   originalPrice: boolean;
//   uom: boolean;
// }>;

// type UIProductReady = UIProductBase & {
//   frameInfo?: ProductCardProps["frameInfo"] | null;
//   categoryName?: string;
// };

// export interface ProductGridClientProps {
//   items: UIProductReady[];
//   visibleParts?: VisibleParts;
//   viewMode?: "grid" | "list";
//   onAddToCart?: () => void;
// }

// export function ProductGridClient({
//   items,
//   visibleParts,
//   viewMode = "grid",
//   onAddToCart,
// }: ProductGridClientProps) {
//   const gridCols = useMemo(
//     () =>
//       viewMode === "grid"
//         ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
//         : "flex flex-col gap-4",
//     [viewMode]
//   );

//   const getOriginalPrice = (price: number, discountPercent?: number) => {
//     if (!discountPercent || discountPercent <= 0) return undefined;
//     const original = price / (1 - discountPercent / 100);
//     return Math.round(original);
//   };

//   return (
//     <section className="py-12 bg-muted">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl sm:text-2xl font-bold text-foreground">สินค้าแนะนำ</h2>
//           <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
//             ดูทั้งหมด
//             <ChevronRight className="h-4 w-4 ml-1" />
//           </Button>
//         </div>

//         <div className={gridCols}>
//           {items.map((p, index) => {
//             const original = getOriginalPrice(p.price, p.discountPercent);

//             return (
//               <div
//                 key={p.id}
//                 className="opacity-0 animate-fade-in"
//                 style={{ animationDelay: `${index * 0.08}s` }} // ไล่ดีเลย์ 80ms/ใบ
//               >
//                 <ProductCard
//                   id={p.id}
//                   slug={p.slug}
//                   name={p.name}
//                   price={p.price}
//                   originalPrice={original}
//                   discount={p.discountPercent}
//                   rating={p.rating ?? 0}
//                   reviews={p.reviews ?? 0}
//                   image={p.image_url ?? "/placeholder.png"}
//                   onAddToCart={onAddToCart}
//                   viewMode={viewMode}
//                   visibleParts={visibleParts}
//                   // NEW info (เหมือนเดิม)
//                   brand={p.brand}
//                   sku={p.sku}
//                   uom={p.uom}
//                   categoryName={p.categoryName}
//                   // กรอบที่คำนวณจาก server พร้อมใช้ตั้งแต่เฟรมแรก
//                   frameInfo={p.frameInfo ?? null}
//                 />
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }

// export default ProductGridClient;

// v.1.1.4 ==============================================

// v.1.1.3 ==============================================
// // src/components/product-grid.client.tsx
// "use client";

// /* Client Component: ไม่ fetch อะไรอีกแล้ว
//    รับ items(ที่มี frameInfo/หมวด) + visibleParts + viewMode แล้ว render อย่างเดียว */
// import { useMemo } from "react";
// import { ProductCard } from "./product-card";
// import type { ProductCardProps } from "./product-card";
// import { Button } from "@/components/ui/button";
// import { ChevronRight } from "lucide-react";

// /* ====== Types ให้ตรงกับฝั่ง server ====== */
// type UIProductBase = {
//   id: number | string;
//   name: string;
//   price: number;
//   discountPercent?: number;
//   image_url?: string;
//   rating?: number;
//   reviews?: number;
//   brand?: string;
//   sku?: string;
//   uom?: string;
//   category_id?: number | string;
//   slug?: string;
// };

// type VisibleParts = Partial<{
//   image: boolean;
//   discountBadge: boolean;
//   brandLogo: boolean;
//   frame: boolean;

//   brandName: boolean;
//   sku: boolean;
//   name: boolean;
//   ratingReview: boolean;
//   category: boolean;
//   price: boolean;
//   originalPrice: boolean;
//   uom: boolean;
// }>;

// type UIProductReady = UIProductBase & {
//   frameInfo?: ProductCardProps["frameInfo"] | null;
//   categoryName?: string;
// };

// export interface ProductGridClientProps {
//   items: UIProductReady[];
//   visibleParts?: VisibleParts;
//   viewMode?: "grid" | "list";
//   onAddToCart?: () => void;
// }

// export function ProductGridClient({
//   items,
//   visibleParts,
//   viewMode = "grid",
//   onAddToCart,
// }: ProductGridClientProps) {
//   const gridCols = useMemo(
//     () =>
//       viewMode === "grid"
//         ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
//         : "flex flex-col gap-4",
//     [viewMode]
//   );

//   const getOriginalPrice = (price: number, discountPercent?: number) => {
//     if (!discountPercent || discountPercent <= 0) return undefined;
//     const original = price / (1 - discountPercent / 100);
//     return Math.round(original);
//   };

//   return (
//     <section className="py-12 bg-muted">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl sm:text-2xl font-bold text-foreground">สินค้าแนะนำ</h2>
//           <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
//             ดูทั้งหมด
//             <ChevronRight className="h-4 w-4 ml-1" />
//           </Button>
//         </div>

//         <div className={gridCols}>
//           {items.map((p) => {
//             const original = getOriginalPrice(p.price, p.discountPercent);

//             return (
//               <ProductCard
//                 key={p.id}
//                 id={p.id}
//                 slug={p.slug}
//                 name={p.name}
//                 price={p.price}
//                 originalPrice={original}
//                 discount={p.discountPercent}
//                 rating={p.rating ?? 0}
//                 reviews={p.reviews ?? 0}
//                 image={p.image_url ?? "/placeholder.png"}
//                 onAddToCart={onAddToCart}
//                 viewMode={viewMode}
//                 visibleParts={visibleParts}
//                 // NEW info (เหมือนเดิม)
//                 brand={p.brand}
//                 sku={p.sku}
//                 uom={p.uom}
//                 categoryName={p.categoryName}
//                 // กรอบที่คำนวณจาก server พร้อมใช้ตั้งแต่เฟรมแรก
//                 frameInfo={p.frameInfo ?? null}
//               />
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }

// export default ProductGridClient;

// v.1.1.3 ==============================================

// v.1.1.2 ======================================================
// // src/components/product-grid.client.tsx
// "use client";

// import { useMemo } from "react";
// import { ProductCard } from "./product-card";

// // ✅ helpers ที่เพิ่งสร้าง
// import {
//   pickRuleFromPercent,
//   toFrameInfo,
//   type DiscountRuleLite,
// } from "@/lib/products/frame";

// import { brandLogoPath } from "@/lib/products/brands";

// type UIProduct = {
//   id: number | string;
//   name: string;
//   price: number;
//   discountPercent?: number;
//   image_url?: string;
//   rating?: number;
//   reviews?: number;
//   brand?: string;
//   sku?: string;
//   uom?: string;
// };

// type VisibleParts = Partial<{
//   image: boolean;
//   discountBadge: boolean;
//   ratingReview: boolean;
//   price: boolean;
//   originalPrice: boolean;

//   // ✅ เพิ่มคีย์ที่เกี่ยวกับแบรนด์/กรอบ/ข้อมูลเสริม
//   frame: boolean;
//   brandLogo: boolean;
//   brandName: boolean;
//   sku: boolean;
//   uom: boolean;
// }>;

// export function ProductGridClient({
//   items,
//   visibleParts,
//   viewMode = "grid",
//   // ✅ (optional) ถ้าหน้า parent มี rules จาก API ส่งเข้ามาได้
//   rules,
// }: {
//   items: UIProduct[];
//   visibleParts?: VisibleParts;
//   viewMode?: "grid" | "list";
//   rules?: DiscountRuleLite[];
// }) {
//   const gridCls = useMemo(
//     () =>
//       viewMode === "grid"
//         ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
//         : "flex flex-col gap-4",
//     [viewMode]
//   );

//   const getOriginalPrice = (price: number, discountPercent?: number) =>
//     !discountPercent || discountPercent <= 0
//       ? undefined
//       : Math.round(price / (1 - discountPercent / 100));

//   return (
//     <section className="py-12 bg-muted">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl sm:text-2xl font-bold text-foreground">สินค้าแนะนำ</h2>
//         </div>

//         <div className={gridCls}>
//           {items.map((p) => {
//             // ✅ คำนวณกรอบจากส่วนลด + rules (ถ้ามี)
//             const matched = pickRuleFromPercent(p.discountPercent, rules ?? []);
//             const frameInfo =
//               visibleParts?.frame === false ? null : toFrameInfo(matched);

//             // ✅ โลโก้แบรนด์ (ถ้าปิดก็ไม่ส่ง)
//             const brandLogoUrl =
//               visibleParts?.brandLogo === false
//                 ? undefined
//                 : brandLogoPath(p.brand) || undefined;

//             return (
//               <ProductCard
//                 key={p.id}
//                 id={p.id}
//                 name={p.name}
//                 price={p.price}
//                 originalPrice={getOriginalPrice(p.price, p.discountPercent)}
//                 discount={p.discountPercent}
//                 rating={p.rating ?? 0}
//                 reviews={p.reviews ?? 0}
//                 image={p.image_url ?? "/placeholder.png"}
//                 viewMode={viewMode}
//                 visibleParts={visibleParts}
//                 // ✅ ส่งข้อมูลแบรนด์/sku/uom ให้การ์ดไปตัดสินใจแสดงตาม visibleParts
//                 brandName={p.brand}
//                 sku={p.sku}
//                 uom={p.uom}
//                 // ✅ ส่งกรอบ + โลโก้
//                 frameInfo={frameInfo}
//                 brandLogoUrl={brandLogoUrl}
//               />
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }

// v.1.1.2 ======================================================

// // src/components/product-grid.client.tsx (Client Component)

// "use client";
// import { useMemo } from "react";
// import { ProductCard } from "./product-card";

// type UIProduct = {
//   id: number | string;
//   name: string;
//   price: number;
//   discountPercent?: number;
//   image_url?: string;
//   rating?: number;
//   reviews?: number;
//   brand?: string;
//   sku?: string;
//   uom?: string;
// };

// type VisibleParts = Partial<{
//   image: boolean;
//   discountBadge: boolean;
//   ratingReview: boolean;
//   price: boolean;
//   originalPrice: boolean;
//   brandLogo: boolean;
//   brandName: boolean;
//   sku: boolean;
//   uom: boolean;
// }>;

// export function ProductGridClient({
//   items,
//   visibleParts,
//   viewMode = "grid",
// }: {
//   items: UIProduct[];
//   visibleParts?: VisibleParts;
//   viewMode?: "grid" | "list";
// }) {
//   const gridCls = useMemo(
//     () =>
//       viewMode === "grid"
//         ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
//         : "flex flex-col gap-4",
//     [viewMode],
//   );

//   const getOriginalPrice = (price: number, discountPercent?: number) =>
//     !discountPercent || discountPercent <= 0 ? undefined : Math.round(price / (1 - discountPercent / 100));

//   return (
//     <section className="py-12 bg-muted">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl sm:text-2xl font-bold text-foreground">สินค้าแนะนำ</h2>
//         </div>

//         <div className={gridCls}>
//           {items.map((p) => (
//             <ProductCard
//               key={p.id}
//               id={p.id}
//               name={p.name}
//               price={p.price}
//               originalPrice={getOriginalPrice(p.price, p.discountPercent)}
//               discount={p.discountPercent}
//               rating={p.rating ?? 0}
//               reviews={p.reviews ?? 0}
//               image={p.image_url ?? "/placeholder.png"}
//               // ถ้าจะโชว์ brand/sku/uom ด้วย ส่งมาเลย:
//               brand={p.brand}
//               sku={p.sku}
//               uom={p.uom}
//               visibleParts={visibleParts}
//               viewMode={viewMode}
//             />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

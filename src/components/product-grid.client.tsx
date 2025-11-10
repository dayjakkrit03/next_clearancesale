// v.1.1.9 ==============================================
// src/components/product-grid.client.tsx

"use client";

import { useMemo, useState, useMemo as useReactMemo } from "react";
import { ProductCard } from "./product-card";
import type { ProductCardProps } from "./product-card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

/* ====== Types ====== */
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

  title?: string;
  subtitle?: string;

  initialVisibleCount?: number;
  loadStep?: number;
}

export function ProductGridClient({
  items,
  visibleParts,
  viewMode = "grid",
  onAddToCart,
  title = "สินค้าแนะนำ",
  subtitle,
  initialVisibleCount = 6,
  loadStep = 6,
}: ProductGridClientProps) {
  if (!items || items.length === 0) return null;

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

  const [visibleCount, setVisibleCount] = useState<number>(
    Math.min(Math.max(1, initialVisibleCount), items.length)
  );

  const canLoadMore = visibleCount < items.length;
  const onLoadMore = () => {
    setVisibleCount((v) => Math.min(items.length, v + Math.max(1, loadStep)));
  };

  const visibleItems = useReactMemo(() => items.slice(0, visibleCount), [items, visibleCount]);

  return (
    <section className="py-12 bg-muted">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            ดูทั้งหมด
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Grid */}
        <div className={gridCols}>
          {visibleItems.map((p, index) => {
            const original = getOriginalPrice(p.price, p.discountPercent);

            return (
              <div
                key={p.id}
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 0.08}s` }}
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
                  // ✅ รับจาก image_url (ปลอดภัย) และกันเคสอนาคตที่ server เผลอส่ง field image มา
                  image={(p as any).image ?? p.image_url ?? "/placeholder.png"}
                  onAddToCart={onAddToCart}
                  viewMode={viewMode}
                  visibleParts={visibleParts}
                  brand={p.brand}
                  sku={p.sku}
                  uom={p.uom}
                  categoryName={p.categoryName}
                  frameInfo={p.frameInfo ?? null}
                />
              </div>
            );
          })}
        </div>

        {/* Load More (ปุ่มหลักสีฟ้า) */}
        {canLoadMore && (
          <div className="mt-8 flex justify-center">
            <Button onClick={onLoadMore} variant="default">
              โหลดเพิ่ม
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductGridClient;

// v.1.1.9 ==============================================

// v.1.1.8 ==============================================
// // src/components/product-grid.client.tsx

// "use client";

// import { useMemo, useState, useMemo as useReactMemo } from "react";
// import { ProductCard } from "./product-card";
// import type { ProductCardProps } from "./product-card";
// import { Button } from "@/components/ui/button";
// import { ChevronRight } from "lucide-react";

// /* ====== Types ====== */
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

//   title?: string;
//   subtitle?: string;

//   initialVisibleCount?: number;
//   loadStep?: number;
// }

// export function ProductGridClient({
//   items,
//   visibleParts,
//   viewMode = "grid",
//   onAddToCart,
//   title = "สินค้าแนะนำ",
//   subtitle,
//   initialVisibleCount = 6,
//   loadStep = 6,
// }: ProductGridClientProps) {
//   if (!items || items.length === 0) return null;

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

//   const [visibleCount, setVisibleCount] = useState<number>(
//     Math.min(Math.max(1, initialVisibleCount), items.length)
//   );

//   const canLoadMore = visibleCount < items.length;
//   const onLoadMore = () => {
//     setVisibleCount((v) => Math.min(items.length, v + Math.max(1, loadStep)));
//   };

//   const visibleItems = useReactMemo(() => items.slice(0, visibleCount), [items, visibleCount]);



//   return (
//     <section className="py-12 bg-muted">
//       <div className="container mx-auto px-4">
//         {/* Header */}
//         <div className="mb-6 flex items-start justify-between gap-4">
//           <div>
//             <h2 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
//             {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
//           </div>
//           <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
//             ดูทั้งหมด
//             <ChevronRight className="h-4 w-4 ml-1" />
//           </Button>
//         </div>

//         {/* Grid */}
//         <div className={gridCols}>
//           {visibleItems.map((p, index) => {
//             const original = getOriginalPrice(p.price, p.discountPercent);

//             return (
//               <div
//                 key={p.id}
//                 className="opacity-0 animate-fade-in"
//                 style={{ animationDelay: `${index * 0.08}s` }}
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
//                   brand={p.brand}
//                   sku={p.sku}
//                   uom={p.uom}
//                   categoryName={p.categoryName}
//                   frameInfo={p.frameInfo ?? null}
//                 />
//               </div>
//             );
//           })}
//         </div>

//         {/* Load More (ปุ่มหลักสีฟ้า) */}
//         {canLoadMore && (
//           <div className="mt-8 flex justify-center">
//             <Button onClick={onLoadMore} variant="default">
//               โหลดเพิ่ม
//             </Button>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }

// export default ProductGridClient;


// v.1.1.8 =============================================

// v.1.1.7 ==============================================
// // src/components/product-grid.client.tsx

// "use client";

// /* Client Component: เริ่มด้วย items หน้าที่ 1 จาก server
//    และรองรับปุ่ม “โหลดเพิ่ม” โดยไปดึงหน้าถัดไปจาก /api/mock/featured-lists
//    แล้วโหลดรายละเอียดสินค้าด้วย /api/mock/products/by-ids */

// import { useCallback, useMemo, useState } from "react";
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

//   // เสริมที่ server คำนวณให้ (เฟรมแรก)
//   frameInfo?: ProductCardProps["frameInfo"] | null;
//   categoryName?: string;
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

// type RuleCtx = {
//   id: string | number;
//   minPercent?: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   frameMode?: "image" | "draw";
//   frameImageUrl?: string;
//   frameInsetPx?: number;
//   frameOpacity?: number;
//   frameObjectFit?: "contain" | "cover" | "stretch";
//   enabled?: boolean;
//   order?: number;
// };

// type CategoryMini = { id: number | string; name: string };

// export interface ProductGridClientProps {
//   items: UIProductBase[];
//   visibleParts?: VisibleParts;
//   viewMode?: "grid" | "list";
//   onAddToCart?: () => void;

//   /** หัวข้อ/คำอธิบายของ section (สำหรับลิสต์แนะนำแต่ละก้อน) */
//   title?: string;
//   subtitle?: string;

//   /** สำหรับ “โหลดเพิ่ม” */
//   listKey?: string;
//   pageSize?: number;
//   hasMoreInitial?: boolean;

//   /** context สำหรับคำนวณ frame/category ตอนโหลดเพิ่ม */
//   ruleCtx: RuleCtx[];
//   categoriesCtx: CategoryMini[];
// }

// /* ===== Helpers (client) ===== */
// const toFrameInfo = (rule: RuleCtx | null): ProductCardProps["frameInfo"] => {
//   if (!rule) return null;
//   if (rule.frameMode === "image" && rule.frameImageUrl) {
//     const objFit: "contain" | "cover" | "fill" =
//       rule.frameObjectFit === "stretch" ? "fill" : ((rule.frameObjectFit ?? "contain") as "contain" | "cover");
//     return {
//       mode: "image",
//       imageUrl: rule.frameImageUrl,
//       inset: Math.max(0, Number(rule.frameInsetPx ?? 0)),
//       opacity: typeof rule.frameOpacity === "number" ? rule.frameOpacity : 1,
//       objectFit: objFit,
//     };
//   }
//   return {
//     mode: "draw",
//     borderWidth: rule.borderWidth,
//     borderColorHex: rule.borderColorHex,
//   };
// };

// const pickRuleFactory = (rules: RuleCtx[]) => {
//   return (percent?: number): RuleCtx | null => {
//     if (percent == null) return null;
//     for (const r of rules) {
//       const lowerOk = percent >= (r.minPercent ?? 0);
//       const upperOk = typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
//       if (lowerOk && upperOk) return r;
//     }
//     return null;
//   };
// };

// export function ProductGridClient({
//   items,
//   visibleParts,
//   viewMode = "grid",
//   onAddToCart,
//   title = "สินค้าแนะนำ",
//   subtitle,

//   listKey,
//   pageSize,
//   hasMoreInitial = false,

//   ruleCtx,
//   categoriesCtx,
// }: ProductGridClientProps) {
//   const [listItems, setListItems] = useState<UIProductBase[]>(items);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState<boolean>(!!hasMoreInitial);
//   const [loadingMore, setLoadingMore] = useState(false);

//   const gridCols = useMemo(
//     () =>
//       viewMode === "grid"
//         ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
//         : "flex flex-col gap-4",
//     [viewMode]
//   );

//   const catMap = useMemo(() => {
//     const m = new Map<string | number, string>();
//     categoriesCtx.forEach((c) => m.set(c.id, c.name));
//     return m;
//   }, [categoriesCtx]);

//   const pickRule = useMemo(() => pickRuleFactory(ruleCtx), [ruleCtx]);

//   const getOriginalPrice = (price: number, discountPercent?: number) => {
//     if (!discountPercent || discountPercent <= 0) return undefined;
//     const original = price / (1 - discountPercent / 100);
//     return Math.round(original);
//   };

//   const handleLoadMore = useCallback(async () => {
//     if (!listKey || !pageSize || loadingMore || !hasMore) return;
//     try {
//       setLoadingMore(true);

//       // 1) ขอหน้าใหม่ของ featured-lists
//       const nextPage = page + 1;
//       const listRes = await fetch(
//         `/api/mock/featured-lists?key=${encodeURIComponent(listKey)}&page=${nextPage}&pageSize=${pageSize}`,
//         { cache: "no-store" }
//       );
//       if (!listRes.ok) throw new Error("load more: list failed");
//       const listJson = await listRes.json();
//       const ids: (string | number)[] = (listJson?.items ?? []).map((it: any) => it.productId);

//       if (ids.length === 0) {
//         setHasMore(false);
//         setPage(nextPage);
//         return;
//       }

//       // 2) โหลดรายละเอียดสินค้า
//       const detailRes = await fetch(`/api/mock/products/by-ids?ids=${encodeURIComponent(ids.join(","))}`, {
//         cache: "no-store",
//       });
//       const detailJson = detailRes.ok ? await detailRes.json() : { items: [] };
//       const products: UIProductBase[] = (detailJson?.items ?? []) as UIProductBase[];

//       // เรียงตาม order ที่ได้มาจากลิสต์
//       const orderMap = new Map<string | number, number>();
//       for (const it of (listJson?.items ?? [])) orderMap.set(it.productId, it.order ?? 0);
//       products.sort((a, b) => (orderMap.get(a.id)! - orderMap.get(b.id)!));

//       // คำนวณ frame & categoryName ฝั่ง client
//       const computed = products.map((p) => {
//         const frameRule = pickRule(p.discountPercent);
//         const frameInfo = toFrameInfo(frameRule);
//         const categoryName = p.category_id != null ? catMap.get(p.category_id as any) : undefined;
//         return { ...p, frameInfo, categoryName };
//       });

//       setListItems((prev) => [...prev, ...computed]);
//       setHasMore(!!listJson?.hasMore);
//       setPage(nextPage);
//     } catch {
//       // เงียบ ๆ พอ (ไม่ให้ UX สะดุด)
//     } finally {
//       setLoadingMore(false);
//     }
//   }, [listKey, pageSize, page, hasMore, loadingMore, catMap, pickRule]);

//   return (
//     <section className="py-12 bg-muted">
//       <div className="container mx-auto px-4">
//         {/* Header */}
//         <div className="mb-6 flex items-start justify-between gap-4">
//           <div>
//             <h2 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
//             {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
//           </div>
//           <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
//             ดูทั้งหมด
//             <ChevronRight className="h-4 w-4 ml-1" />
//           </Button>
//         </div>

//         {/* Grid */}
//         <div className={gridCols}>
//           {listItems.map((p, index) => {
//             const original = getOriginalPrice(p.price, p.discountPercent);
//             return (
//               <div
//                 key={p.id}
//                 className="opacity-0 animate-fade-in"
//                 style={{ animationDelay: `${index * 0.08}s` }}
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
//                   brand={p.brand}
//                   sku={p.sku}
//                   uom={p.uom}
//                   categoryName={p.categoryName}
//                   frameInfo={p.frameInfo ?? null}
//                 />
//               </div>
//             );
//           })}
//         </div>

//         {/* Load More */}
//         {listKey && pageSize && hasMore && (
//           <div className="mt-8 flex justify-center">
//             <Button onClick={handleLoadMore} disabled={loadingMore}>
//               {loadingMore ? "กำลังโหลด..." : "โหลดเพิ่ม"}
//             </Button>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }

// export default ProductGridClient;

// v.1.1.7 ==============================================

// v.1.1.6 ==============================================
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

//   /** หัวข้อ/คำอธิบายของ section (สำหรับลิสต์แนะนำแต่ละก้อน) */
//   title?: string;
//   subtitle?: string;

//   /** ปุ่มส่วนหัว (ดูทั้งหมด) — ใส่ลิงก์เพื่อให้คลิกได้จริง */
//   ctaHref?: string;
//   ctaText?: string;

//   /** โหลดเพิ่ม (ทางเลือก) — ถ้าให้มาครบจะโชว์ปุ่ม “โหลดเพิ่ม” ท้ายกริด */
//   hasMore?: boolean;
//   loadingMore?: boolean;
//   onLoadMore?: () => void;
// }

// export function ProductGridClient({
//   items,
//   visibleParts,
//   viewMode = "grid",
//   onAddToCart,
//   title = "สินค้าแนะนำ",
//   subtitle,
//   ctaHref,
//   ctaText = "ดูทั้งหมด",
//   hasMore,
//   loadingMore,
//   onLoadMore,
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
//         {/* Header */}
//         <div className="mb-6 flex items-start justify-between gap-4">
//           <div>
//             <h2 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
//             {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
//           </div>

//           {/* ปุ่มส่วนหัว (ดูทั้งหมด) จะโชว์เฉพาะเมื่อมี href */}
//           {ctaHref && (
//             <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary/80">
//               <a href={ctaHref}>
//                 {ctaText}
//                 <ChevronRight className="h-4 w-4 ml-1" />
//               </a>
//             </Button>
//           )}
//         </div>

//         {/* Empty state */}
//         {items.length === 0 && (
//           <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground bg-background">
//             ยังไม่มีสินค้าในส่วนนี้
//           </div>
//         )}

//         {/* Grid */}
//         {items.length > 0 && (
//           <div className={gridCols}>
//             {items.map((p, index) => {
//               const original = getOriginalPrice(p.price, p.discountPercent);
//               return (
//                 <div
//                   key={p.id}
//                   className="opacity-0 animate-fade-in"
//                   style={{ animationDelay: `${index * 0.08}s` }} // ไล่ดีเลย์ 80ms/ใบ
//                 >
//                   <ProductCard
//                     id={p.id}
//                     slug={p.slug}
//                     name={p.name}
//                     price={p.price}
//                     originalPrice={original}
//                     discount={p.discountPercent}
//                     rating={p.rating ?? 0}
//                     reviews={p.reviews ?? 0}
//                     image={p.image_url ?? "/placeholder.png"}
//                     onAddToCart={onAddToCart}
//                     viewMode={viewMode}
//                     visibleParts={visibleParts}
//                     brand={p.brand}
//                     sku={p.sku}
//                     uom={p.uom}
//                     categoryName={p.categoryName}
//                     frameInfo={p.frameInfo ?? null}
//                   />
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* Load more (optional) */}
//         {items.length > 0 && hasMore && onLoadMore && (
//           <div className="mt-8 flex justify-center">
//             <Button onClick={onLoadMore} disabled={loadingMore}>
//               {loadingMore ? "กำลังโหลด..." : "โหลดเพิ่ม"}
//             </Button>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }

// export default ProductGridClient;

// v.1.1.6 ==============================================

// v.1.1.5 ==============================================
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

//   /** หัวข้อ/คำอธิบายของ section (สำหรับลิสต์แนะนำแต่ละก้อน) */
//   title?: string;
//   subtitle?: string;
// }

// export function ProductGridClient({
//   items,
//   visibleParts,
//   viewMode = "grid",
//   onAddToCart,
//   title = "สินค้าแนะนำ",
//   subtitle,
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
//         {/* Header */}
//         <div className="mb-6 flex items-start justify-between gap-4">
//           <div>
//             <h2 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
//             {subtitle && (
//               <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
//             )}
//           </div>
//           <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
//             ดูทั้งหมด
//             <ChevronRight className="h-4 w-4 ml-1" />
//           </Button>
//         </div>

//         {/* Grid */}
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

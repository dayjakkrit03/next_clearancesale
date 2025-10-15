// v.1.1.6 ==============================================
// src/components/product-grid.tsx
// no "use client" — ตัวนี้เป็นแค่ re-export

export { ProductGridServer as ProductGrid } from "./product-grid.server";
export { ProductGridServer as default } from "./product-grid.server";

// (ถ้าต้องการใช้ชนิดพร็อพ)
export type { ProductGridServerProps as ProductGridProps } from "./product-grid.server";


// v.1.1.6 ==============================================

// v.1.1.5 ==============================================
// // File: src/components/product-grid.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { ProductCard } from "./product-card";
// import type { ProductCardProps } from "./product-card";
// import { Button } from "@/components/ui/button";
// import { ChevronRight } from "lucide-react";

// // ============ Types from API ============
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
//   category_id?: number | string;
// };

// type CardPartsFromAdmin = Partial<{
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

// type ListResponse = {
//   items: UIProduct[];
//   total: number;
//   page: number;
//   pageSize: number;
//   meta?: { cardParts?: CardPartsFromAdmin };
// };

// type DiscountRuleLite = {
//   id: string | number;
//   minPercent?: number;
//   maxPercent?: number;
//   // draw
//   borderWidth: number;
//   borderColorHex: string;
//   // image
//   frameMode?: "image" | "draw";
//   frameImageUrl?: string;
//   frameInsetPx?: number;
//   frameOpacity?: number; // 0..1
//   frameObjectFit?: "contain" | "cover" | "stretch";
// };

// type CategoryLite = { id: number | string; name: string; slug?: string };

// // ============ Props ============
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

// interface ProductGridProps {
//   onAddToCart?: () => void;
//   /** (optional) override จากหน้าเพจ */
//   visibleParts?: VisibleParts;
//   viewMode?: "grid" | "list";
// }

// export const ProductGrid = ({ onAddToCart, visibleParts, viewMode = "grid" }: ProductGridProps) => {
//   const [items, setItems] = useState<UIProduct[]>([]);
//   const [adminParts, setAdminParts] = useState<CardPartsFromAdmin | null>(null);
//   const [rules, setRules] = useState<DiscountRuleLite[]>([]);
//   const [catMap, setCatMap] = useState<Record<string | number, CategoryLite>>({});
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState<string | null>(null);

//   // load products (รวม meta.cardParts)
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setErr(null);
//         const params = new URLSearchParams({
//           page: "1",
//           pageSize: "24",
//           sort: "order",
//           order: "asc",
//           includeHidden: "0",
//         });
//         const res = await fetch(`/api/mock/products?${params.toString()}`, { cache: "no-store" });
//         if (!res.ok) throw new Error("fetch products failed");
//         const data: ListResponse = await res.json();
//         if (!alive) return;
//         setItems(data.items ?? []);
//         setAdminParts(data.meta?.cardParts ?? null);
//       } catch (e: any) {
//         if (alive) setErr(e?.message ?? "load failed");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, []);

//   // load discount rules (เหมือนแอดมิน)
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch("/api/mock/discount-rules", { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const list: DiscountRuleLite[] = (data?.items ?? [])
//           .filter((r: any) => r && r.enabled)
//           .map((r: any): DiscountRuleLite => ({
//             id: r.id,
//             minPercent: Number(r.minPercent) || 0,
//             maxPercent: typeof r.maxPercent === "number" ? r.maxPercent : undefined,
//             borderWidth: Number(r.borderWidth) || 2,
//             borderColorHex: String(r.borderColorHex || "#000000"),
//             frameMode: r.frameMode === "image" ? "image" : "draw",
//             frameImageUrl: r.frameImageUrl || undefined,
//             frameInsetPx: typeof r.frameInsetPx === "number" ? r.frameInsetPx : undefined,
//             frameOpacity:
//               typeof r.frameOpacity === "number"
//                 ? Math.max(0, Math.min(1, Number(r.frameOpacity)))
//                 : undefined,
//             frameObjectFit:
//               r.frameObjectFit === "cover"
//                 ? "cover"
//                 : r.frameObjectFit === "stretch"
//                 ? "stretch"
//                 : r.frameMode === "image"
//                 ? "contain"
//                 : undefined,
//           }))
//           .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
//         setRules(list);
//       } catch {}
//     })();
//   }, []);

//   // load categories (เพื่อโชว์ชื่อหมวด)
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch("/api/mock/categories", { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const items: Array<{ id: number | string; name: string; slug?: string }> = data?.items ?? [];
//         const map: Record<string | number, CategoryLite> = {};
//         for (const c of items) map[c.id] = { id: c.id, name: c.name, slug: c.slug };
//         setCatMap(map);
//       } catch {}
//     })();
//   }, []);

//   /** เลือกกฎตามส่วนลด (%) */
//   const pickRule = (percent?: number): DiscountRuleLite | null => {
//     if (percent == null) return null;
//     for (const r of rules) {
//       const lowerOk = percent >= (r.minPercent ?? 0);
//       const upperOk = typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
//       if (lowerOk && upperOk) return r;
//     }
//     return null;
//   };

//   /** map adminParts -> visibleParts ที่ Card ใช้ */
//   const mergedVisibleParts: VisibleParts | undefined = useMemo(() => {
//     const fromAdmin: VisibleParts | undefined = adminParts
//       ? {
//           image: adminParts.image,
//           discountBadge: adminParts.discountBadge,
//           brandLogo: adminParts.brandLogo,
//           frame: adminParts.frame,

//           brandName: adminParts.brandName,
//           sku: adminParts.sku,
//           name: adminParts.name,
//           ratingReview: adminParts.ratingReview,
//           category: adminParts.category,
//           price: adminParts.price,
//           originalPrice: adminParts.originalPrice,
//           uom: adminParts.uom,
//         }
//       : undefined;
//     return { ...(fromAdmin ?? {}), ...(visibleParts ?? {}) };
//   }, [adminParts, visibleParts]);

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

//   /** สร้าง frameInfo จากกฎที่เลือก */
//   const toFrameInfo = (rule: DiscountRuleLite | null): ProductCardProps["frameInfo"] => {
//     if (!rule) return null;

//     if (rule.frameMode === "image" && rule.frameImageUrl) {
//       // บังคับชนิดเป็นลิเทอรัล "contain" | "cover" | "fill"
//       const objFit: "contain" | "cover" | "fill" =
//         rule.frameObjectFit === "stretch"
//           ? "fill"
//           : ((rule.frameObjectFit ?? "contain") as "contain" | "cover");

//       return {
//         mode: "image",
//         imageUrl: rule.frameImageUrl,
//         inset: Math.max(0, Number(rule.frameInsetPx ?? 0)),
//         opacity: typeof rule.frameOpacity === "number" ? rule.frameOpacity : 1,
//         objectFit: objFit,
//       };
//     }

//     return {
//       mode: "draw",
//       borderWidth: rule.borderWidth,
//       borderColorHex: rule.borderColorHex,
//     };
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

//         {err && (
//           <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive mb-4">
//             {err}
//           </div>
//         )}

//         {loading ? (
//           <div className="text-sm text-muted-foreground">กำลังโหลดสินค้า…</div>
//         ) : (
//           <div className={gridCols}>
//             {items.map((p) => {
//               const original = getOriginalPrice(p.price, p.discountPercent);
//               const rule = pickRule(p.discountPercent);
//               const frameInfo = toFrameInfo(rule);
//               const categoryName = p.category_id != null ? catMap[p.category_id]?.name : undefined;

//               return (
//                 <ProductCard
//                   key={p.id}
//                   id={p.id}
//                   name={p.name}
//                   price={p.price}
//                   originalPrice={original}
//                   discount={p.discountPercent}
//                   rating={p.rating ?? 0}
//                   reviews={p.reviews ?? 0}
//                   image={p.image_url ?? "/placeholder.png"}
//                   onAddToCart={onAddToCart}
//                   viewMode={viewMode}
//                   visibleParts={mergedVisibleParts}

//                   // NEW info
//                   brand={p.brand}
//                   sku={p.sku}
//                   uom={p.uom}
//                   categoryName={categoryName}
//                   frameInfo={frameInfo}
//                 />
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// v.1.1.5 ==============================================

// v.1.1.4 ==============================================
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { ProductCard } from "./product-card";
// import { Button } from "@/components/ui/button";
// import { ChevronRight } from "lucide-react";

// type UIProduct = {
//   id: number | string;
//   name: string;
//   price: number;
//   discountPercent?: number;
//   image_url?: string;
//   rating?: number;
//   reviews?: number;
// };

// type CardPartsFromAdmin = Partial<{
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

// type ListResponse = {
//   items: UIProduct[];
//   total: number;
//   page: number;
//   pageSize: number;
//   meta?: { cardParts?: CardPartsFromAdmin };
// };

// type VisibleParts = Partial<{
//   image: boolean;
//   discountBadge: boolean;
//   ratingReview: boolean;
//   price: boolean;
//   originalPrice: boolean;
// }>;

// interface ProductGridProps {
//   onAddToCart?: () => void;
//   /** (optional) ถ้าฝั่งหน้าเพจอยาก override ค่าแอดมิน */
//   visibleParts?: VisibleParts;
//   viewMode?: "grid" | "list";
// }

// export const ProductGrid = ({ onAddToCart, visibleParts, viewMode = "grid" }: ProductGridProps) => {
//   const [items, setItems] = useState<UIProduct[]>([]);
//   const [adminParts, setAdminParts] = useState<CardPartsFromAdmin | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState<string | null>(null);

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setErr(null);
//         const params = new URLSearchParams({
//           page: "1",
//           pageSize: "24",
//           sort: "order",
//           order: "asc",
//           includeHidden: "0", // ลูกค้าไม่ควรเห็นสินค้าซ่อน
//         });
//         const res = await fetch(`/api/mock/products?${params.toString()}`, { cache: "no-store" });
//         if (!res.ok) throw new Error("fetch products failed");
//         const data: ListResponse = await res.json();
//         if (!alive) return;
//         setItems(data.items ?? []);
//         setAdminParts(data.meta?.cardParts ?? null);
//       } catch (e: any) {
//         if (alive) setErr(e?.message ?? "load failed");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, []);

//   /** map adminParts -> visibleParts ที่ ProductCard ใช้ */
//   const mergedVisibleParts: VisibleParts | undefined = useMemo(() => {
//     const fromAdmin: VisibleParts | undefined = adminParts
//       ? {
//           image: adminParts.image,
//           discountBadge: adminParts.discountBadge,
//           ratingReview: adminParts.ratingReview,
//           price: adminParts.price,
//           originalPrice: adminParts.originalPrice,
//         }
//       : undefined;

//     // ลำดับการรวม: default(เปิดทั้งหมดใน ProductCard) <- fromAdmin <- visibleParts (override จาก props ถ้ามี)
//     return { ...(fromAdmin ?? {}), ...(visibleParts ?? {}) };
//   }, [adminParts, visibleParts]);

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

//         {err && (
//           <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive mb-4">
//             {err}
//           </div>
//         )}

//         {loading ? (
//           <div className="text-sm text-muted-foreground">กำลังโหลดสินค้า…</div>
//         ) : (
//           <div className={gridCols}>
//             {items.map((p) => {
//               const original = getOriginalPrice(p.price, p.discountPercent);
//               return (
//                 <ProductCard
//                   key={p.id}
//                   id={p.id}
//                   name={p.name}
//                   price={p.price}
//                   originalPrice={original}
//                   discount={p.discountPercent}
//                   rating={p.rating ?? 0}
//                   reviews={p.reviews ?? 0}
//                   image={p.image_url ?? "/placeholder.png"}
//                   onAddToCart={onAddToCart}
//                   viewMode={viewMode}
//                   visibleParts={mergedVisibleParts} // ← ซิงก์ตามแอดมิน
//                 />
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// v.1.1.4 ==============================================

// v.1.1.3 ==============================================
// // src/components/product-grid.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { ProductCard } from "./product-card";
// import { Button } from "@/components/ui/button";
// import { ChevronRight } from "lucide-react";

// /** โครงของข้อมูลจาก API (ตัดมาเฉพาะที่ต้องใช้ในหน้า customer) */
// type UIProduct = {
//   id: number | string;
//   name: string;
//   price: number;
//   discountPercent?: number;
//   image_url?: string;
//   rating?: number;
//   reviews?: number;
// };

// type ListResponse = {
//   items: UIProduct[];
//   total: number;
//   page: number;
//   pageSize: number;
//   // meta?: { cardParts?: Partial<Record<string, boolean>> }  // ถ้าภายหลังจะซิงก์การตั้งค่าจากแอดมิน
// };

// type VisibleParts = Partial<{
//   image: boolean;
//   discountBadge: boolean;
//   ratingReview: boolean;
//   price: boolean;
//   originalPrice: boolean;
// }>;

// interface ProductGridProps {
//   onAddToCart?: () => void;
//   /** (optional) ซิงก์การตั้งค่าจากแอดมิน ถ้ายังไม่มี ให้ไม่ต้องส่งมาก็ได้ */
//   visibleParts?: VisibleParts;
//   viewMode?: "grid" | "list";
// }

// export const ProductGrid = ({ onAddToCart, visibleParts, viewMode = "grid" }: ProductGridProps) => {
//   const [items, setItems] = useState<UIProduct[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState<string | null>(null);

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setErr(null);
//         const params = new URLSearchParams({
//           page: "1",
//           pageSize: "24",
//           sort: "order",
//           order: "asc",
//           includeHidden: "1",
//         });
//         const res = await fetch(`/api/mock/products?${params.toString()}`, { cache: "no-store" });
//         if (!res.ok) throw new Error("fetch products failed");
//         const data: ListResponse = await res.json();
//         if (alive) setItems(data.items ?? []);
//       } catch (e: any) {
//         if (alive) setErr(e?.message ?? "load failed");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, []);

//   /** helper: คิดราคาก่อนลดจากส่วนลด (%) */
//   const getOriginalPrice = (price: number, discountPercent?: number) => {
//     if (!discountPercent || discountPercent <= 0) return undefined;
//     const original = price / (1 - discountPercent / 100);
//     return Math.round(original);
//   };

//   const gridCols = useMemo(
//     () =>
//       viewMode === "grid"
//         ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
//         : "flex flex-col gap-4",
//     [viewMode]
//   );

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

//         {err && (
//           <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive mb-4">
//             {err}
//           </div>
//         )}

//         {loading ? (
//           <div className="text-sm text-muted-foreground">กำลังโหลดสินค้า…</div>
//         ) : (
//           <div className={gridCols}>
//             {items.map((p) => {
//               const original = getOriginalPrice(p.price, p.discountPercent);
//               return (
//                 <ProductCard
//                   key={p.id}
//                   id={p.id}
//                   name={p.name}
//                   price={p.price}
//                   originalPrice={original}
//                   discount={p.discountPercent}
//                   rating={p.rating ?? 0}
//                   reviews={p.reviews ?? 0}
//                   image={p.image_url ?? "/placeholder.png"}
//                   onAddToCart={onAddToCart}
//                   viewMode={viewMode}
//                   visibleParts={visibleParts} // ถ้ามีการตั้งค่าจากแอดมิน ให้ส่งมาที่นี่
//                 />
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// v.1.1.3 ==============================================

// v.1.1.2 ==============================================
// // src/components/product-grid.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { ProductCard } from "./product-card";
// import { Button } from "@/components/ui/button";
// import { ChevronRight } from "lucide-react";

// // === types จาก API mock ===
// type ApiProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number;
//   image_url?: string;
//   rating?: number;
//   reviews?: number;
//   uom?: string;
// };

// type CardPartsVisibility = {
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
// };

// type ListResponse = {
//   items: ApiProduct[];
//   total: number;
//   page: number;
//   pageSize: number;
//   meta?: {
//     title?: string;
//     subtitle?: string;
//     cardParts?: Partial<CardPartsVisibility>;
//   };
// };

// const defaultParts: CardPartsVisibility = {
//   image: true,
//   discountBadge: true,
//   brandLogo: true,
//   frame: true,
//   brandName: true,
//   sku: true,
//   name: true,
//   ratingReview: true,
//   category: true,
//   price: true,
//   originalPrice: true,
//   uom: true,
// };

// interface ProductGridProps {
//   onAddToCart?: () => void;
// }

// export const ProductGrid = ({ onAddToCart }: ProductGridProps) => {
//   const [items, setItems] = useState<ApiProduct[]>([]);
//   const [parts, setParts] = useState<CardPartsVisibility>(defaultParts);
//   const [title, setTitle] = useState<string>("สินค้าแนะนำ");

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch(
//           `/api/mock/products?pageSize=24&includeHidden=1`,
//           { cache: "no-store" }
//         );
//         if (!res.ok) throw new Error("fetch failed");
//         const data: ListResponse = await res.json();

//         setItems(data.items ?? []);
//         // โหลดชื่อหัวข้อจาก meta ด้วย (ถ้าอยากให้หน้าแรก sync กับแอดมิน)
//         if (data.meta?.title) setTitle(data.meta.title);

//         // รวมค่า default + ของจากแอดมิน
//         const v = { ...defaultParts, ...(data.meta?.cardParts ?? {}) };
//         setParts(v as CardPartsVisibility);
//       } catch {
//         // เงียบไว้ก่อน — อาจใส่ toast/error ได้
//       }
//     })();
//   }, []);

//   // helper: คำนวณราคาก่อนลดจาก price + discountPercent
//   const calcOriginal = (price: number, discountPercent?: number) => {
//     if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//     const base = price / (1 - discountPercent / 100);
//     return Math.round(base);
//   };

//   return (
//     <section className="py-12 bg-muted">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl sm:text-2xl font-bold text-foreground">
//             {title || "สินค้าแนะนำ"}
//           </h2>
//           <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
//             ดูทั้งหมด
//             <ChevronRight className="h-4 w-4 ml-1" />
//           </Button>
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
//           {items.map((p) => (
//             <ProductCard
//               key={p.id}
//               id={p.id}
//               name={p.name}
//               price={p.price}
//               originalPrice={calcOriginal(p.price, p.discountPercent)}
//               discount={p.discountPercent ?? 0}
//               rating={p.rating ?? 0}
//               reviews={p.reviews ?? 0}
//               image={p.image_url ?? "/placeholder.png"}
//               isLiked={false}
//               isFreeShipping={false}
//               onAddToCart={onAddToCart}
//               // ถ้าคุณอัปเดต product-card.tsx ให้รองรับ prop นี้แล้ว จะซ่อน/แสดงตามแอดมินได้เลย
//               visibleParts={parts as any}
//             />
//           ))}

//           {!items.length && (
//             <div className="col-span-full text-center text-sm text-muted-foreground">
//               กำลังโหลดสินค้า…
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// };

// v.1.1.2 ==============================================

// // src/components/product-grid.tsx

// import { ProductCard } from "./product-card";
// import { Button } from "@/components/ui/button";
// import { ChevronRight } from "lucide-react";

// const products = [
//   {
//     id: 1,
//     name: "Fiber Optic Cable Single Mode 305m",
//     price: 2150,
//     originalPrice: 2750,
//     discount: 22,
//     rating: 4.8,
//     reviews: 156,
//     image: "/assets/fiber-optic-cable.jpg",
//     isLiked: true,
//     isFreeShipping: true,
//   },
//   {
//     id: 2,
//     name: "24-Port Gigabit Network Switch",
//     price: 3890,
//     originalPrice: 4500,
//     discount: 14,
//     rating: 4.6,
//     reviews: 234,
//     image: "/assets/network-switch-professional.jpg",
//     isFreeShipping: true,
//   },
//   {
//     id: 3,
//     name: "RG-6 Coaxial Cable 305m",
//     price: 1450,
//     originalPrice: 1850,
//     discount: 22,
//     rating: 4.5,
//     reviews: 189,
//     image: "/assets/coaxial-cable-reel.jpg",
//     isLiked: false,
//   },
//   {
//     id: 4,
//     name: "Solar Cable 4mm² PV Wire 100m",
//     price: 2800,
//     originalPrice: 3200,
//     discount: 13,
//     rating: 4.7,
//     reviews: 145,
//     image: "/assets/solar-cable-red.jpg",
//     isFreeShipping: true,
//   },
//   {
//     id: 5,
//     name: "Telephone Cable 4-Pair Indoor 305m",
//     price: 980,
//     originalPrice: 1250,
//     discount: 22,
//     rating: 4.4,
//     reviews: 98,
//     image: "/assets/telephone-cable.jpg",
//   },
//   {
//     id: 6,
//     name: "19\" Server Rack Cabinet 42U",
//     price: 15800,
//     originalPrice: 18500,
//     discount: 15,
//     rating: 4.9,
//     reviews: 87,
//     image: "/assets/server-rack-19inch.jpg",
//     isFreeShipping: true,
//   },
//   {
//     id: 7,
//     name: "US-9035 CAT 5E UTP Cable Indoor 305m",
//     price: 6094,
//     originalPrice: 6800,
//     discount: 10,
//     rating: 4.7,
//     reviews: 178,
//     image: "/assets/lan-cat5e-box.jpg",
//     isLiked: true,
//   },
//   {
//     id: 8,
//     name: "UT-0216 Fiber Media Converter RJ45",
//     price: 2247,
//     originalPrice: 2800,
//     discount: 20,
//     rating: 4.6,
//     reviews: 124,
//     image: "/assets/fiber-media-converter.jpg",
//     isFreeShipping: true,
//   },
// ];

// interface ProductGridProps {
//   onAddToCart?: () => void;
// }

// export const ProductGrid = ({ onAddToCart }: ProductGridProps) => {
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
        
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
//           {products.map((product) => (
//             <ProductCard key={product.id} {...product} onAddToCart={onAddToCart} />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };
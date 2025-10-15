// v.1.1.5 ======================================================
// src/components/product-grid.server.tsx
/* Server Component: ดึง products(+meta/rules/categories) หรือดึงตาม featured list
   แล้วคำนวณ frameInfo ให้แต่ละสินค้า ส่งทั้งหมดให้ฝั่ง client render */
import { ProductGridClient } from "./product-grid.client";
import type { ProductCardProps } from "./product-card";
import { absoluteUrl } from "@/lib/base-url";

/* ====== Types ====== */
type UIProduct = {
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

type CardPartsFromAdmin = Partial<{
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

type VisibleParts = CardPartsFromAdmin;

type DiscountRuleLite = {
  id: string | number;
  minPercent?: number;
  maxPercent?: number;
  borderWidth: number;
  borderColorHex: string;
  frameMode?: "image" | "draw";
  frameImageUrl?: string;
  frameInsetPx?: number;
  frameOpacity?: number; // 0..1
  frameObjectFit?: "contain" | "cover" | "stretch";
  enabled?: boolean;
  order?: number;
};

type ListResponse = {
  items: UIProduct[];
  total: number;
  page: number;
  pageSize: number;
  meta?: { cardParts?: CardPartsFromAdmin };
};

type CategoryLite = { id: number | string; name: string; slug?: string };

type FeaturedListItem = { productId: string | number; order: number };
type FeaturedList = {
  key: string;
  title: string;
  subtitle?: string;
  items: FeaturedListItem[];
  limit?: number;
};

export interface ProductGridServerProps {
  /** (optional) override จากหน้าเพจ */
  visibleParts?: VisibleParts;
  viewMode?: "grid" | "list";

  /** โหมด “ลิสต์แนะนำ” — ถ้าส่งมา จะดึงเฉพาะสินค้าตามลิสต์นี้ */
  listKey?: string;
  /** จำกัดจำนวนชิ้น (จะ override limit ในลิสต์ได้) */
  limit?: number;

  /** ตั้งหัวข้อ/คำอธิบายทับได้เอง (ถ้าไม่ส่ง จะใช้ค่าจากลิสต์) */
  title?: string;
  subtitle?: string;
}

/* ====== Helpers ====== */
const toFrameInfo = (rule: DiscountRuleLite | null): ProductCardProps["frameInfo"] => {
  if (!rule) return null;

  if (rule.frameMode === "image" && rule.frameImageUrl) {
    const objFit: "contain" | "cover" | "fill" =
      rule.frameObjectFit === "stretch" ? "fill" : ((rule.frameObjectFit ?? "contain") as "contain" | "cover");
    return {
      mode: "image",
      imageUrl: rule.frameImageUrl,
      inset: Math.max(0, Number(rule.frameInsetPx ?? 0)),
      opacity: typeof rule.frameOpacity === "number" ? rule.frameOpacity : 1,
      objectFit: objFit,
    };
  }
  return {
    mode: "draw",
    borderWidth: rule.borderWidth,
    borderColorHex: rule.borderColorHex,
  };
};

const pickRuleFactory = (rules: DiscountRuleLite[]) => {
  return (percent?: number): DiscountRuleLite | null => {
    if (percent == null) return null;
    for (const r of rules) {
      const lowerOk = percent >= (r.minPercent ?? 0);
      const upperOk = typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
      if (lowerOk && upperOk) return r;
    }
    return null;
  };
};

const normalizeCardParts = (adminParts?: CardPartsFromAdmin, override?: VisibleParts): VisibleParts => {
  const defaults: Required<VisibleParts> = {
    image: true,
    discountBadge: true,
    brandLogo: true,
    frame: true,

    brandName: true,
    sku: true,
    name: true,
    ratingReview: true,
    category: true,
    price: true,
    originalPrice: true,
    uom: true,
  };
  return { ...defaults, ...(adminParts ?? {}), ...(override ?? {}) };
};

/* ====== Server Component ====== */
export async function ProductGridServer({
  visibleParts,
  viewMode = "grid",
  listKey,
  limit,
  title,
  subtitle,
}: ProductGridServerProps) {
  // URLs ที่ใช้ร่วม
  const metaUrl = await absoluteUrl(`/api/mock/products/meta`);
  const rulesUrl = await absoluteUrl(`/api/mock/discount-rules`);
  const catsUrl = await absoluteUrl(`/api/mock/categories`);

  // ถ้าเป็นโหมด “ลิสต์แนะนำ”
  let featuredList: FeaturedList | null = null;
  if (listKey) {
    const listUrl = await absoluteUrl(
      `/api/mock/featured-lists?key=${encodeURIComponent(listKey)}${limit ? `&limit=${limit}` : ""}`
    );
    const listRes = await fetch(listUrl, { cache: "no-store" });
    if (listRes.ok) {
      featuredList = (await listRes.json()) as FeaturedList;
    } else {
      // key ไม่เจอ → ใช้ลิสต์ว่างเพื่อไม่ให้หน้าแตก
      featuredList = { key: listKey, title: "", items: [] };
    }
  }

  // products:
  // - ไม่มี listKey → ดึงแบบเดิม
  // - มี listKey → ดึงเยอะหน่อยแล้ว filter ตาม productId ในลิสต์
  const params = new URLSearchParams({
    page: "1",
    pageSize: listKey ? "1000" : "24",
    sort: "order",
    order: "asc",
    includeHidden: "0",
  });
  const productsUrl = await absoluteUrl(`/api/mock/products?${params.toString()}`);

  const [prodRes, metaRes, ruleRes, catRes] = await Promise.all([
    fetch(productsUrl, { cache: "no-store" }),
    fetch(metaUrl, { cache: "no-store" }),
    fetch(rulesUrl, { cache: "no-store" }),
    fetch(catsUrl, { cache: "no-store" }),
  ]);

  if (!prodRes.ok) throw new Error("fetch products failed");
  const prodData: ListResponse = await prodRes.json();

  const metaJson = metaRes.ok ? await metaRes.json() : { meta: {} };
  const ruleJson = ruleRes.ok ? await ruleRes.json() : { items: [] };
  const catJson = catRes.ok ? await catRes.json() : { items: [] };

  const adminParts: CardPartsFromAdmin | undefined = metaJson?.meta?.cardParts;

  const rules: DiscountRuleLite[] = (ruleJson?.items ?? [])
    .filter((r: any) => r && (r.enabled ?? true))
    .map((r: any): DiscountRuleLite => ({
      id: r.id,
      minPercent: Number(r.minPercent) || 0,
      maxPercent: typeof r.maxPercent === "number" ? r.maxPercent : undefined,
      borderWidth: Number(r.borderWidth) || 2,
      borderColorHex: String(r.borderColorHex || "#000000"),
      frameMode: r.frameMode === "image" ? "image" : "draw",
      frameImageUrl: r.frameImageUrl || undefined,
      frameInsetPx: typeof r.frameInsetPx === "number" ? r.frameInsetPx : undefined,
      frameOpacity: typeof r.frameOpacity === "number" ? Math.max(0, Math.min(1, Number(r.frameOpacity))) : undefined,
      frameObjectFit:
        r.frameObjectFit === "cover"
          ? "cover"
          : r.frameObjectFit === "stretch"
          ? "stretch"
          : r.frameMode === "image"
          ? "contain"
          : undefined,
      enabled: r.enabled,
      order: typeof r.order === "number" ? r.order : undefined,
    }))
    .sort((a: DiscountRuleLite, b: DiscountRuleLite) => (a.order ?? 0) - (b.order ?? 0));

  const categories: CategoryLite[] = catJson?.items ?? [];
  const catMap = new Map<string | number, CategoryLite>();
  for (const c of categories) catMap.set(c.id, c);

  const pickRule = pickRuleFactory(rules);

  // เตรียม items สำหรับ client
  let itemsSource: UIProduct[] = prodData.items ?? [];

  if (featuredList) {
    const idToOrder = new Map<string | number, number>();
    for (const it of featuredList.items) idToOrder.set(it.productId, it.order ?? 0);

    itemsSource = (prodData.items ?? [])
      .filter((p) => idToOrder.has(p.id))
      .sort((a, b) => (idToOrder.get(a.id)! - idToOrder.get(b.id)!));

    const lim = limit ?? featuredList.limit;
    if (lim && lim > 0) itemsSource = itemsSource.slice(0, lim);
  }

  const itemsForClient = itemsSource.map((p) => {
    const rule = pickRule(p.discountPercent);
    const frameInfo = toFrameInfo(rule);
    const categoryName = p.category_id != null ? catMap.get(p.category_id as any)?.name : undefined;
    return { ...p, frameInfo, categoryName };
  });

  const mergedVisibleParts = normalizeCardParts(adminParts, visibleParts);

  // ✅ เลือกหัวข้อ/คำอธิบาย: override > จากลิสต์ > ค่าเริ่มต้น
  const resolvedTitle = title ?? featuredList?.title ?? "สินค้าแนะนำ";
  const resolvedSubtitle = subtitle ?? featuredList?.subtitle;

  return (
    <ProductGridClient
      items={itemsForClient}
      visibleParts={mergedVisibleParts}
      viewMode={viewMode}
      title={resolvedTitle}
      subtitle={resolvedSubtitle}
    />
  );
}

export default ProductGridServer;

// v.1.1.5 ======================================================

// v.1.1.4 ======================================================
// // src/components/product-grid.server.tsx
// /* Server Component: ดึง products(+meta/rules/categories) หรือดึงตาม featured list
//    แล้วคำนวณ frameInfo ให้แต่ละสินค้า ส่งทั้งหมดให้ฝั่ง client render */
// import { ProductGridClient } from "./product-grid.client";
// import type { ProductCardProps } from "./product-card";
// import { absoluteUrl } from "@/lib/base-url";

// /* ====== Types ====== */
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
//   slug?: string;
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

// type VisibleParts = CardPartsFromAdmin;

// type DiscountRuleLite = {
//   id: string | number;
//   minPercent?: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   frameMode?: "image" | "draw";
//   frameImageUrl?: string;
//   frameInsetPx?: number;
//   frameOpacity?: number; // 0..1
//   frameObjectFit?: "contain" | "cover" | "stretch";
//   enabled?: boolean;
//   order?: number;
// };

// type ListResponse = {
//   items: UIProduct[];
//   total: number;
//   page: number;
//   pageSize: number;
//   meta?: { cardParts?: CardPartsFromAdmin };
// };

// type CategoryLite = { id: number | string; name: string; slug?: string };

// type FeaturedListItem = { productId: string | number; order: number };
// type FeaturedList = {
//   key: string;
//   title: string;
//   subtitle?: string;
//   items: FeaturedListItem[];
//   limit?: number;
// };

// export interface ProductGridServerProps {
//   /** (optional) override จากหน้าเพจ */
//   visibleParts?: VisibleParts;
//   viewMode?: "grid" | "list";

//   /** โหมด “ลิสต์แนะนำ” — ถ้าส่งมา จะดึงเฉพาะสินค้าตามลิสต์นี้ */
//   listKey?: string;
//   /** จำกัดจำนวนชิ้น (จะ override limit ในลิสต์ได้) */
//   limit?: number;
// }

// /* ====== Helpers ====== */
// const toFrameInfo = (rule: DiscountRuleLite | null): ProductCardProps["frameInfo"] => {
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

// const pickRuleFactory = (rules: DiscountRuleLite[]) => {
//   return (percent?: number): DiscountRuleLite | null => {
//     if (percent == null) return null;
//     for (const r of rules) {
//       const lowerOk = percent >= (r.minPercent ?? 0);
//       const upperOk = typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
//       if (lowerOk && upperOk) return r;
//     }
//     return null;
//   };
// };

// const normalizeCardParts = (adminParts?: CardPartsFromAdmin, override?: VisibleParts): VisibleParts => {
//   const defaults: Required<VisibleParts> = {
//     image: true,
//     discountBadge: true,
//     brandLogo: true,
//     frame: true,

//     brandName: true,
//     sku: true,
//     name: true,
//     ratingReview: true,
//     category: true,
//     price: true,
//     originalPrice: true,
//     uom: true,
//   };
//   return { ...defaults, ...(adminParts ?? {}), ...(override ?? {}) };
// };

// /* ====== Server Component ====== */
// export async function ProductGridServer({
//   visibleParts,
//   viewMode = "grid",
//   listKey,
//   limit,
// }: ProductGridServerProps) {
//   // URLs ที่ใช้ร่วม
//   const metaUrl = await absoluteUrl(`/api/mock/products/meta`);
//   const rulesUrl = await absoluteUrl(`/api/mock/discount-rules`);
//   const catsUrl = await absoluteUrl(`/api/mock/categories`);

//   // ถ้าเป็นโหมด “ลิสต์แนะนำ”
//   let featuredList: FeaturedList | null = null;
//   if (listKey) {
//     const listUrl = await absoluteUrl(
//       `/api/mock/featured-lists?key=${encodeURIComponent(listKey)}${limit ? `&limit=${limit}` : ""}`
//     );
//     const listRes = await fetch(listUrl, { cache: "no-store" });
//     if (listRes.ok) {
//       featuredList = (await listRes.json()) as FeaturedList;
//     } else {
//       // ถ้า key ไม่เจอ ให้ fallback = ลิสต์ว่าง (ไม่พังทั้งหน้า)
//       featuredList = { key: listKey, title: "", items: [] };
//     }
//   }

//   // products: 
//   // - ถ้าไม่มี listKey → ดึงแบบเดิม
//   // - ถ้ามี listKey → เพื่อความง่าย (mock) ดึงมากพอแล้ว filter ตาม productId ในลิสต์
//   const params = new URLSearchParams({
//     page: "1",
//     pageSize: listKey ? "1000" : "24", // mock: ดึงเยอะหน่อยเพื่อให้ครอบ productIds
//     sort: "order",
//     order: "asc",
//     includeHidden: "0",
//   });
//   const productsUrl = await absoluteUrl(`/api/mock/products?${params.toString()}`);

//   const [prodRes, metaRes, ruleRes, catRes] = await Promise.all([
//     fetch(productsUrl, { cache: "no-store" }),
//     fetch(metaUrl, { cache: "no-store" }),
//     fetch(rulesUrl, { cache: "no-store" }),
//     fetch(catsUrl, { cache: "no-store" }),
//   ]);

//   if (!prodRes.ok) throw new Error("fetch products failed");
//   const prodData: ListResponse = await prodRes.json();

//   const metaJson = metaRes.ok ? await metaRes.json() : { meta: {} };
//   const ruleJson = ruleRes.ok ? await ruleRes.json() : { items: [] };
//   const catJson = catRes.ok ? await catRes.json() : { items: [] };

//   const adminParts: CardPartsFromAdmin | undefined = metaJson?.meta?.cardParts;

//   const rules: DiscountRuleLite[] = (ruleJson?.items ?? [])
//     .filter((r: any) => r && (r.enabled ?? true))
//     .map((r: any): DiscountRuleLite => ({
//       id: r.id,
//       minPercent: Number(r.minPercent) || 0,
//       maxPercent: typeof r.maxPercent === "number" ? r.maxPercent : undefined,
//       borderWidth: Number(r.borderWidth) || 2,
//       borderColorHex: String(r.borderColorHex || "#000000"),
//       frameMode: r.frameMode === "image" ? "image" : "draw",
//       frameImageUrl: r.frameImageUrl || undefined,
//       frameInsetPx: typeof r.frameInsetPx === "number" ? r.frameInsetPx : undefined,
//       frameOpacity: typeof r.frameOpacity === "number" ? Math.max(0, Math.min(1, Number(r.frameOpacity))) : undefined,
//       frameObjectFit:
//         r.frameObjectFit === "cover"
//           ? "cover"
//           : r.frameObjectFit === "stretch"
//           ? "stretch"
//           : r.frameMode === "image"
//           ? "contain"
//           : undefined,
//       enabled: r.enabled,
//       order: typeof r.order === "number" ? r.order : undefined,
//     }))
//     .sort((a: DiscountRuleLite, b: DiscountRuleLite) => (a.order ?? 0) - (b.order ?? 0));

//   const categories: CategoryLite[] = catJson?.items ?? [];
//   const catMap = new Map<string | number, CategoryLite>();
//   for (const c of categories) catMap.set(c.id, c);

//   const pickRule = pickRuleFactory(rules);

//   // เตรียม items สำหรับ client
//   let itemsSource: UIProduct[] = prodData.items ?? [];

//   // ถ้ามี listKey → filter + sort ตามลิสต์
//   if (featuredList) {
//     const idToOrder = new Map<string | number, number>();
//     for (const it of featuredList.items) idToOrder.set(it.productId, it.order ?? 0);

//     itemsSource = (prodData.items ?? [])
//       .filter((p) => idToOrder.has(p.id))
//       .sort((a, b) => (idToOrder.get(a.id)! - idToOrder.get(b.id)!));

//     // บังคับ limit ถ้ามี
//     const lim = limit ?? featuredList.limit;
//     if (lim && lim > 0) itemsSource = itemsSource.slice(0, lim);
//   }

//   const itemsForClient = itemsSource.map((p) => {
//     const rule = pickRule(p.discountPercent);
//     const frameInfo = toFrameInfo(rule);
//     const categoryName = p.category_id != null ? catMap.get(p.category_id as any)?.name : undefined;
//     return { ...p, frameInfo, categoryName };
//   });

//   const mergedVisibleParts = normalizeCardParts(adminParts, visibleParts);

//   return (
//     <ProductGridClient
//       items={itemsForClient}
//       visibleParts={mergedVisibleParts}
//       viewMode={viewMode}
//     />
//   );
// }

// export default ProductGridServer;

// v.1.1.4 ======================================================

// v.1.1.3 ======================================================
// // src/components/product-grid.server.tsx
// /* Server Component: ดึง products + meta.cardParts + rules + categories
//    คำนวณ frameInfo ให้แต่ละสินค้า แล้วส่งทั้งหมดให้ฝั่ง client render แบบไร้ fetch */
// import { ProductGridClient } from "./product-grid.client";
// import type { ProductCardProps } from "./product-card";
// import { absoluteUrl } from "@/lib/base-url";

// /* ====== Types (ยึดตามฝั่งเดิม) ====== */
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
//   slug?: string;
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

// type VisibleParts = CardPartsFromAdmin;

// type DiscountRuleLite = {
//   id: string | number;
//   minPercent?: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   frameMode?: "image" | "draw";
//   frameImageUrl?: string;
//   frameInsetPx?: number;
//   frameOpacity?: number; // 0..1
//   frameObjectFit?: "contain" | "cover" | "stretch";
//   enabled?: boolean;
//   order?: number;
// };

// type ListResponse = {
//   items: UIProduct[];
//   total: number;
//   page: number;
//   pageSize: number;
//   meta?: { cardParts?: CardPartsFromAdmin };
// };

// type CategoryLite = { id: number | string; name: string; slug?: string };

// export interface ProductGridServerProps {
//   /** (optional) override จากหน้าเพจ */
//   visibleParts?: VisibleParts;
//   viewMode?: "grid" | "list";
// }

// /* ====== Helpers (same logic asเดิม) ====== */
// const toFrameInfo = (rule: DiscountRuleLite | null): ProductCardProps["frameInfo"] => {
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

// const pickRuleFactory = (rules: DiscountRuleLite[]) => {
//   return (percent?: number): DiscountRuleLite | null => {
//     if (percent == null) return null;
//     for (const r of rules) {
//       const lowerOk = percent >= (r.minPercent ?? 0);
//       const upperOk = typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
//       if (lowerOk && upperOk) return r;
//     }
//     return null;
//   };
// };

// const normalizeCardParts = (adminParts?: CardPartsFromAdmin, override?: VisibleParts): VisibleParts => {
//   const defaults: Required<VisibleParts> = {
//     image: true,
//     discountBadge: true,
//     brandLogo: true,
//     frame: true,

//     brandName: true,
//     sku: true,
//     name: true,
//     ratingReview: true,
//     category: true,
//     price: true,
//     originalPrice: true,
//     uom: true,
//   };
//   return { ...defaults, ...(adminParts ?? {}), ...(override ?? {}) };
// };

// /* ====== Server Component ====== */
// export async function ProductGridServer({ visibleParts, viewMode = "grid" }: ProductGridServerProps) {
//   // ✅ ใช้ absolute URL เสมอเมื่อ fetch บน Server
//   const params = new URLSearchParams({
//     page: "1",
//     pageSize: "24",
//     sort: "order",
//     order: "asc",
//     includeHidden: "0",
//   });

//   const productsUrl = await absoluteUrl(`/api/mock/products?${params.toString()}`);
//   const metaUrl = await absoluteUrl(`/api/mock/products/meta`);
//   const rulesUrl = await absoluteUrl(`/api/mock/discount-rules`);
//   const catsUrl = await absoluteUrl(`/api/mock/categories`);

//   const [prodRes, metaRes, ruleRes, catRes] = await Promise.all([
//     fetch(productsUrl, { cache: "no-store" }),
//     fetch(metaUrl, { cache: "no-store" }),
//     fetch(rulesUrl, { cache: "no-store" }),
//     fetch(catsUrl, { cache: "no-store" }),
//   ]);

//   if (!prodRes.ok) throw new Error("fetch products failed");
//   const prodData: ListResponse = await prodRes.json();

//   const metaJson = metaRes.ok ? await metaRes.json() : { meta: {} };
//   const ruleJson = ruleRes.ok ? await ruleRes.json() : { items: [] };
//   const catJson = catRes.ok ? await catRes.json() : { items: [] };

//   const adminParts: CardPartsFromAdmin | undefined = metaJson?.meta?.cardParts;

//   const rules: DiscountRuleLite[] = (ruleJson?.items ?? [])
//     .filter((r: any) => r && (r.enabled ?? true))
//     .map((r: any): DiscountRuleLite => ({
//       id: r.id,
//       minPercent: Number(r.minPercent) || 0,
//       maxPercent: typeof r.maxPercent === "number" ? r.maxPercent : undefined,
//       borderWidth: Number(r.borderWidth) || 2,
//       borderColorHex: String(r.borderColorHex || "#000000"),
//       frameMode: r.frameMode === "image" ? "image" : "draw",
//       frameImageUrl: r.frameImageUrl || undefined,
//       frameInsetPx: typeof r.frameInsetPx === "number" ? r.frameInsetPx : undefined,
//       frameOpacity: typeof r.frameOpacity === "number" ? Math.max(0, Math.min(1, Number(r.frameOpacity))) : undefined,
//       frameObjectFit:
//         r.frameObjectFit === "cover"
//           ? "cover"
//           : r.frameObjectFit === "stretch"
//           ? "stretch"
//           : r.frameMode === "image"
//           ? "contain"
//           : undefined,
//       enabled: r.enabled,
//       order: typeof r.order === "number" ? r.order : undefined,
//     }))
//     .sort((a: DiscountRuleLite, b: DiscountRuleLite) => (a.order ?? 0) - (b.order ?? 0));

//   const categories: CategoryLite[] = catJson?.items ?? [];
//   const catMap = new Map<string | number, CategoryLite>();
//   for (const c of categories) catMap.set(c.id, c);

//   const pickRule = pickRuleFactory(rules);

//   // เตรียมชุดข้อมูล “พร้อมใช้” ให้ Client
//   const itemsForClient = (prodData.items ?? []).map((p) => {
//     const rule = pickRule(p.discountPercent);
//     const frameInfo = toFrameInfo(rule);
//     const categoryName = p.category_id != null ? catMap.get(p.category_id as any)?.name : undefined;

//     return {
//       ...p,
//       frameInfo,
//       categoryName,
//     };
//   });

//   const mergedVisibleParts = normalizeCardParts(adminParts, visibleParts);

//   return <ProductGridClient items={itemsForClient} visibleParts={mergedVisibleParts} viewMode={viewMode} />;
// }

// export default ProductGridServer;

// v.1.1.3 ======================================================

// v.1.1.2 ======================================================
// // src/components/product-grid.server.tsx
// /* Server Component: ดึง products + meta.cardParts + rules + categories
//    คำนวณ frameInfo ให้แต่ละสินค้า แล้วส่งทั้งหมดให้ฝั่ง client render แบบไร้ fetch */
// import { ProductGridClient } from "./product-grid.client";
// import type { ProductCardProps } from "./product-card";

// /* ====== Types (ยึดตามฝั่งเดิม) ====== */
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
//   slug?: string;
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

// type VisibleParts = CardPartsFromAdmin;

// type DiscountRuleLite = {
//   id: string | number;
//   minPercent?: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   frameMode?: "image" | "draw";
//   frameImageUrl?: string;
//   frameInsetPx?: number;
//   frameOpacity?: number; // 0..1
//   frameObjectFit?: "contain" | "cover" | "stretch";
//   enabled?: boolean;
//   order?: number;
// };

// type ListResponse = {
//   items: UIProduct[];
//   total: number;
//   page: number;
//   pageSize: number;
//   meta?: { cardParts?: CardPartsFromAdmin };
// };

// type CategoryLite = { id: number | string; name: string; slug?: string };

// export interface ProductGridServerProps {
//   /** (optional) override จากหน้าเพจ */
//   visibleParts?: VisibleParts;
//   viewMode?: "grid" | "list";
// }

// /* ====== Helpers (same logic asเดิม) ====== */
// const toFrameInfo = (rule: DiscountRuleLite | null): ProductCardProps["frameInfo"] => {
//   if (!rule) return null;

//   if (rule.frameMode === "image" && rule.frameImageUrl) {
//     const objFit: "contain" | "cover" | "fill" =
//       rule.frameObjectFit === "stretch"
//         ? "fill"
//         : ((rule.frameObjectFit ?? "contain") as "contain" | "cover");
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

// const pickRuleFactory = (rules: DiscountRuleLite[]) => {
//   return (percent?: number): DiscountRuleLite | null => {
//     if (percent == null) return null;
//     // หา rule ตัวแรกที่ min/max ครอบเปอร์เซ็นต์
//     for (const r of rules) {
//       const lowerOk = percent >= (r.minPercent ?? 0);
//       const upperOk = typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
//       if (lowerOk && upperOk) return r;
//     }
//     return null;
//   };
// };

// const normalizeCardParts = (
//   adminParts?: CardPartsFromAdmin,
//   override?: VisibleParts
// ): VisibleParts => {
//   // ดีฟอลต์ "เปิดทั้งหมด" แบบที่คุณใช้ใน ProductCard จากนั้น merge meta และ override
//   const defaults: Required<VisibleParts> = {
//     image: true,
//     discountBadge: true,
//     brandLogo: true,
//     frame: true,

//     brandName: true,
//     sku: true,
//     name: true,
//     ratingReview: true,
//     category: true,
//     price: true,
//     originalPrice: true,
//     uom: true,
//   };
//   return { ...defaults, ...(adminParts ?? {}), ...(override ?? {}) };
// };

// /* ====== Server Component ====== */
// export async function ProductGridServer({
//   visibleParts,
//   viewMode = "grid",
// }: ProductGridServerProps) {
//   // ดึงข้อมูลทั้งหมด “บนฝั่ง Server” ที่เดียว
//   const [prodRes, metaRes, ruleRes, catRes] = await Promise.all([
//     fetch(`/api/mock/products?` + new URLSearchParams({
//       page: "1",
//       pageSize: "24",
//       sort: "order",
//       order: "asc",
//       includeHidden: "0",
//     }), { cache: "no-store" }),
//     fetch(`/api/mock/products/meta`, { cache: "no-store" }),
//     fetch(`/api/mock/discount-rules`, { cache: "no-store" }),
//     fetch(`/api/mock/categories`, { cache: "no-store" }),
//   ]);

//   if (!prodRes.ok) throw new Error("fetch products failed");
//   const prodData: ListResponse = await prodRes.json();

//   const metaJson = metaRes.ok ? await metaRes.json() : { meta: {} };
//   const ruleJson = ruleRes.ok ? await ruleRes.json() : { items: [] };
//   const catJson  = catRes.ok  ? await catRes.json()  : { items: [] };

//   const adminParts: CardPartsFromAdmin | undefined = metaJson?.meta?.cardParts;
//   // กรองเฉพาะ rules ที่ enabled และเรียงตาม order (ถ้ามี)
//   const rules: DiscountRuleLite[] = (ruleJson?.items ?? [])
//     .filter((r: any) => r && (r.enabled ?? true))
//     .map((r: any): DiscountRuleLite => ({
//       id: r.id,
//       minPercent: Number(r.minPercent) || 0,
//       maxPercent: typeof r.maxPercent === "number" ? r.maxPercent : undefined,
//       borderWidth: Number(r.borderWidth) || 2,
//       borderColorHex: String(r.borderColorHex || "#000000"),
//       frameMode: r.frameMode === "image" ? "image" : "draw",
//       frameImageUrl: r.frameImageUrl || undefined,
//       frameInsetPx: typeof r.frameInsetPx === "number" ? r.frameInsetPx : undefined,
//       frameOpacity:
//         typeof r.frameOpacity === "number" ? Math.max(0, Math.min(1, Number(r.frameOpacity))) : undefined,
//       frameObjectFit:
//         r.frameObjectFit === "cover"
//           ? "cover"
//           : r.frameObjectFit === "stretch"
//           ? "stretch"
//           : r.frameMode === "image"
//           ? "contain"
//           : undefined,
//       enabled: r.enabled,
//       order: typeof r.order === "number" ? r.order : undefined,
//     }))
//     .sort((a: DiscountRuleLite, b: DiscountRuleLite) => (a.order ?? 0) - (b.order ?? 0));

//   const categories: CategoryLite[] = catJson?.items ?? [];
//   const catMap = new Map<string | number, CategoryLite>();
//   for (const c of categories) catMap.set(c.id, c);

//   const pickRule = pickRuleFactory(rules);

//   // เตรียมชุดข้อมูล “พร้อมใช้” ให้ Client: ใส่ frameInfo และ categoryName ให้แต่ละ item
//   const itemsForClient = (prodData.items ?? []).map((p) => {
//     const rule = pickRule(p.discountPercent);
//     const frameInfo = toFrameInfo(rule);
//     const categoryName =
//       p.category_id != null ? catMap.get(p.category_id as any)?.name : undefined;

//     return {
//       ...p,
//       frameInfo,
//       categoryName,
//     };
//   });

//   const mergedVisibleParts = normalizeCardParts(adminParts, visibleParts);

//   return (
//     <ProductGridClient
//       items={itemsForClient}
//       visibleParts={mergedVisibleParts}
//       viewMode={viewMode}
//     />
//   );
// }

// export default ProductGridServer;

// v.1.1.2 ======================================================

// src/components/product-grid.server.tsx (Server Component)

// import { ProductGridClient } from "./product-grid.client";

// export default async function ProductGridServer() {
//   const params = new URLSearchParams({
//     page: "1",
//     pageSize: "24",
//     sort: "order",
//     order: "asc",
//     includeHidden: "0", // ลูกค้าไม่ต้องดึงของที่ซ่อน
//   });

//   const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/mock/products?${params}`, {
//     // ถ้าต่อ DB จริง: ใช้ revalidate เพื่อ cache หน้า
//     next: { revalidate: 30 },
//     // หรือ force-dynamic ถ้าอยากสดตลอด (แต่จะช้ากว่า)
//   });
//   const data = await res.json();

//   return (
//     <ProductGridClient
//       items={data.items ?? []}
//       visibleParts={data?.meta?.cardParts ?? undefined}
//       viewMode="grid"
//     />
//   );
// }

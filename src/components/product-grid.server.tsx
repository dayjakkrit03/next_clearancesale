// v.1.1.11 ===========================================================================
/* Server Component: ดึง products(+meta/rules/categories) หรือดึงตาม featured list
   แล้วคำนวณ frameInfo ให้แต่ละสินค้า ส่งทั้งหมดให้ฝั่ง client render (พร้อมโหลดเพิ่มฝั่ง client) */
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
  order?: number;
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
  visibleParts?: VisibleParts;
  viewMode?: "grid" | "list";

  listKey?: string;
  /** จำกัดจำนวนที่ “แสดงตั้งต้น” และใช้เป็น step โหลดเพิ่ม (ถ้าไม่ส่งจะใช้ limit ของลิสต์, ถ้าไม่มีก็ 6) */
  limit?: number;

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
  const metaUrl = await absoluteUrl(`/api/mock/products/meta`);
  const rulesUrl = await absoluteUrl(`/api/mock/discount-rules`);
  const catsUrl = await absoluteUrl(`/api/mock/categories`);

  // ===== Featured list (อ่านแบบแบ่งหน้า: {items, meta}) =====
  let featuredList: FeaturedList | null = null;
  if (listKey) {
    const listUrl = await absoluteUrl(
      `/api/mock/featured-lists?key=${encodeURIComponent(listKey)}&page=1&pageSize=10000`
    );
    const listRes = await fetch(listUrl, { cache: "no-store" });
    if (listRes.ok) {
      const payload = await listRes.json();
      featuredList = {
        key: listKey,
        title: payload?.meta?.title ?? "",
        subtitle: payload?.meta?.subtitle ?? undefined,
        limit: typeof payload?.meta?.limit === "number" ? payload.meta.limit : undefined,
        items: Array.isArray(payload?.items) ? payload.items : [],
      };
    } else {
      featuredList = { key: listKey, title: "", items: [] };
    }
  }

  // products
  const params = new URLSearchParams({
    page: "1",
    pageSize: "10000",
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
      frameOpacity:
        typeof r.frameOpacity === "number" ? Math.max(0, Math.min(1, Number(r.frameOpacity))) : undefined,
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

  // เตรียม items ทั้งหมดให้ client
  let itemsSource: UIProduct[] = prodData.items ?? [];

  if (featuredList) {
    const idToOrder = new Map<string | number, number>();
    for (const it of featuredList.items) idToOrder.set(String(it.productId), it.order ?? 0);

    itemsSource = (prodData.items ?? [])
      .filter((p) => idToOrder.has(String(p.id)))
      .sort((a: UIProduct, b: UIProduct) => {
        const ao = idToOrder.get(String(a.id)) ?? 0;
        const bo = idToOrder.get(String(b.id)) ?? 0;
        return ao - bo;
      });
    // ไม่ slice ที่นี่ เพื่อให้ client โหลดเพิ่มได้เรื่อย ๆ
  }

  const itemsForClient = itemsSource.map((p) => {
    const rule = pickRule(p.discountPercent);
    const frameInfo = toFrameInfo(rule);
    const categoryName = p.category_id != null ? catMap.get(p.category_id as any)?.name : undefined;

    // ✅ ใช้ image_url เดิม และทำ fallback ที่นี่
    const imageUrl = p.image_url ?? "/placeholder.png";

    return {
      ...p,
      frameInfo,
      categoryName,
      image_url: imageUrl,
    };
  });

  // ถ้าลิสต์ว่าง → ไม่เรนเดอร์ทั้งบล็อก
  if (listKey && itemsForClient.length === 0) {
    return null;
  }

  const mergedVisibleParts = normalizeCardParts(adminParts, visibleParts);

  // ใช้หัวข้อ/คำอธิบายจาก meta ของลิสต์ (ถ้าไม่ override)
  const resolvedTitle = title ?? featuredList?.title ?? "สินค้าแนะนำ";
  const resolvedSubtitle = subtitle ?? featuredList?.subtitle;

  // จำนวนโชว์เริ่มต้น + ก้าว
  const initialVisible = Math.max(1, limit ?? featuredList?.limit ?? 6);
  const step = initialVisible;

  return (
    <ProductGridClient
      items={itemsForClient}
      visibleParts={mergedVisibleParts}
      viewMode={viewMode}
      title={resolvedTitle}
      subtitle={resolvedSubtitle}
      initialVisibleCount={initialVisible}
      loadStep={step}
    />
  );
}

export default ProductGridServer;

// v.1.1.11 ===========================================================================

// v.1.1.10 ===========================================================================
// // src/components/product-grid.server.tsx

// /* Server Component: ดึง products(+meta/rules/categories) หรือดึงตาม featured list
//    แล้วคำนวณ frameInfo ให้แต่ละสินค้า ส่งทั้งหมดให้ฝั่ง client render (พร้อมโหลดเพิ่มฝั่ง client) */
// import { ProductGridClient } from "./product-grid.client";
// import type { ProductCardProps } from "./product-card";
// import { absoluteUrl } from "@/lib/base-url";

// /* ====== Types ====== */
// type UIProduct = {
//   id: number | string;
//   name: string;
//   price: number;
//   discountPercent?: number;
//   image_url?: string;
//   rating?: number;
//   reviews?: number;
//   brand?: string;
//   sku?: string;
//   uom?: string;
//   category_id?: number | string;
//   slug?: string;
//   order?: number;
// };

// type CardPartsFromAdmin = Partial<{
//   image: boolean;
//   discountBadge: boolean;
//   brandLogo: boolean;
//   frame: boolean;

//   brandName: boolean;
//   sku: boolean;
//   name: boolean;
//   ratingReview: boolean;
//   category: boolean;
//   price: boolean;
//   originalPrice: boolean;
//   uom: boolean;
// }>;

// type VisibleParts = CardPartsFromAdmin;

// type DiscountRuleLite = {
//   id: string | number;
//   minPercent?: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   frameMode?: "image" | "draw";
//   frameImageUrl?: string;
//   frameInsetPx?: number;
//   frameOpacity?: number; // 0..1
//   frameObjectFit?: "contain" | "cover" | "stretch";
//   enabled?: boolean;
//   order?: number;
// };

// type ListResponse = {
//   items: UIProduct[];
//   total: number;
//   page: number;
//   pageSize: number;
//   meta?: { cardParts?: CardPartsFromAdmin };
// };

// type CategoryLite = { id: number | string; name: string; slug?: string };

// type FeaturedListItem = { productId: string | number; order: number };
// type FeaturedList = {
//   key: string;
//   title: string;
//   subtitle?: string;
//   items: FeaturedListItem[];
//   limit?: number;
// };

// export interface ProductGridServerProps {
//   visibleParts?: VisibleParts;
//   viewMode?: "grid" | "list";

//   listKey?: string;
//   /** จำกัดจำนวนที่ “แสดงตั้งต้น” และใช้เป็น step โหลดเพิ่ม (ถ้าไม่ส่งจะใช้ limit ของลิสต์, ถ้าไม่มีก็ 6) */
//   limit?: number;

//   title?: string;
//   subtitle?: string;
// }

// /* ====== Helpers ====== */
// const toFrameInfo = (rule: DiscountRuleLite | null): ProductCardProps["frameInfo"] => {
//   if (!rule) return null;

//   if (rule.frameMode === "image" && rule.frameImageUrl) {
//     const objFit: "contain" | "cover" | "fill" =
//       rule.frameObjectFit === "stretch" ? "fill" : ((rule.frameObjectFit ?? "contain") as "contain" | "cover");
//     return {
//       mode: "image",
//       imageUrl: rule.frameImageUrl,
//       inset: Math.max(0, Number(rule.frameInsetPx ?? 0)),
//       opacity: typeof rule.frameOpacity === "number" ? rule.frameOpacity : 1,
//       objectFit: objFit,
//     };
//   }
//   return {
//     mode: "draw",
//     borderWidth: rule.borderWidth,
//     borderColorHex: rule.borderColorHex,
//   };
// };

// const pickRuleFactory = (rules: DiscountRuleLite[]) => {
//   return (percent?: number): DiscountRuleLite | null => {
//     if (percent == null) return null;
//     for (const r of rules) {
//       const lowerOk = percent >= (r.minPercent ?? 0);
//       const upperOk = typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
//       if (lowerOk && upperOk) return r;
//     }
//     return null;
//   };
// };

// const normalizeCardParts = (adminParts?: CardPartsFromAdmin, override?: VisibleParts): VisibleParts => {
//   const defaults: Required<VisibleParts> = {
//     image: true,
//     discountBadge: true,
//     brandLogo: true,
//     frame: true,

//     brandName: true,
//     sku: true,
//     name: true,
//     ratingReview: true,
//     category: true,
//     price: true,
//     originalPrice: true,
//     uom: true,
//   };
//   return { ...defaults, ...(adminParts ?? {}), ...(override ?? {}) };
// };

// /* ====== Server Component ====== */
// export async function ProductGridServer({
//   visibleParts,
//   viewMode = "grid",
//   listKey,
//   limit,
//   title,
//   subtitle,
// }: ProductGridServerProps) {
//   const metaUrl = await absoluteUrl(`/api/mock/products/meta`);
//   const rulesUrl = await absoluteUrl(`/api/mock/discount-rules`);
//   const catsUrl = await absoluteUrl(`/api/mock/categories`);

//   // ===== Featured list (อ่านแบบแบ่งหน้า: {items, meta}) =====
//   let featuredList: FeaturedList | null = null;
//   if (listKey) {
//     // Note: โค้ดนี้สมมติว่าคุณได้แก้ไขให้ fetch จาก Service Layer แทน Mock API แล้ว (ตามที่เราคุยกันก่อนหน้า)
//     // แต่เพื่อความถูกต้องตามโค้ดล่าสุดที่คุณให้มา ผมจะใช้ URL เดิม
//     const listUrl = await absoluteUrl(
//       `/api/mock/featured-lists?key=${encodeURIComponent(listKey)}&page=1&pageSize=10000`
//     );
//     const listRes = await fetch(listUrl, { cache: "no-store" });
//     if (listRes.ok) {
//       const payload = await listRes.json();
//       featuredList = {
//         key: listKey,
//         title: payload?.meta?.title ?? "",
//         // 🛑 แก้ไข Type Error: subtitle จาก API/DB อาจเป็น null ต้องแปลงเป็น undefined
//         subtitle: payload?.meta?.subtitle ?? undefined,
//         limit: typeof payload?.meta?.limit === "number" ? payload.meta.limit : undefined,
//         items: Array.isArray(payload?.items) ? payload.items : [],
//       };
//     } else {
//       featuredList = { key: listKey, title: "", items: [] };
//     }
//   }

//   // products
//   const params = new URLSearchParams({
//     page: "1",
//     pageSize: "10000",
//     sort: "order",
//     order: "asc",
//     includeHidden: "0",
//   });
//   const productsUrl = await absoluteUrl(`/api/mock/products?${params.toString()}`);

//   const [prodRes, metaRes, ruleRes, catRes] = await Promise.all([
//     fetch(productsUrl, { cache: "no-store" }),
//     fetch(metaUrl, { cache: "no-store" }),
//     fetch(rulesUrl, { cache: "no-store" }),
//     fetch(catsUrl, { cache: "no-store" }),
//   ]);

//   if (!prodRes.ok) throw new Error("fetch products failed");
//   const prodData: ListResponse = await prodRes.json();

//   // --- LOG 1: ตรวจสอบข้อมูลดิบที่ได้รับมาจาก API (UIProduct) ---
//   console.log("--- SVR LOG 1: ข้อมูลดิบจาก API (product_id, image_url) ---");
//   (prodData.items ?? []).slice(0, 3).forEach((p, index) => {
//     console.log(`[Prod ${p.id}] image_url: ${p.image_url}`);
//   });
//   console.log("-------------------------------------------------------");
//   // --- END LOG 1 ---

//   const metaJson = metaRes.ok ? await metaRes.json() : { meta: {} };
//   const ruleJson = ruleRes.ok ? await ruleRes.json() : { items: [] };
//   const catJson = catRes.ok ? await catRes.json() : { items: [] };

//   const adminParts: CardPartsFromAdmin | undefined = metaJson?.meta?.cardParts;

//   const rules: DiscountRuleLite[] = (ruleJson?.items ?? [])
//     .filter((r: any) => r && (r.enabled ?? true))
//     .map((r: any): DiscountRuleLite => ({
//       id: r.id,
//       minPercent: Number(r.minPercent) || 0,
//       maxPercent: typeof r.maxPercent === "number" ? r.maxPercent : undefined,
//       borderWidth: Number(r.borderWidth) || 2,
//       borderColorHex: String(r.borderColorHex || "#000000"),
//       frameMode: r.frameMode === "image" ? "image" : "draw",
//       frameImageUrl: r.frameImageUrl || undefined,
//       frameInsetPx: typeof r.frameInsetPx === "number" ? r.frameInsetPx : undefined,
//       frameOpacity:
//         typeof r.frameOpacity === "number" ? Math.max(0, Math.min(1, Number(r.frameOpacity))) : undefined,
//       frameObjectFit:
//         r.frameObjectFit === "cover"
//           ? "cover"
//           : r.frameObjectFit === "stretch"
//           ? "stretch"
//           : r.frameMode === "image"
//           ? "contain"
//           : undefined,
//       enabled: r.enabled,
//       order: typeof r.order === "number" ? r.order : undefined,
//     }))
//     .sort((a: DiscountRuleLite, b: DiscountRuleLite) => (a.order ?? 0) - (b.order ?? 0));

//   const categories: CategoryLite[] = catJson?.items ?? [];
//   const catMap = new Map<string | number, CategoryLite>();
//   for (const c of categories) catMap.set(c.id, c);

//   const pickRule = pickRuleFactory(rules);

//   // เตรียม items ทั้งหมดให้ client
//   let itemsSource: UIProduct[] = prodData.items ?? [];

//   if (featuredList) {
//     const idToOrder = new Map<string | number, number>();
//     
//     // 🛑 แก้ไข 1: แปลง productId จาก Featured List (ซึ่งเป็น Number จาก DB) ให้เป็น String 
//     // เพื่อให้ Key ของ Map ตรงกับ Product ID (ซึ่งเป็น String จาก Mock API)
//     for (const it of featuredList.items) idToOrder.set(String(it.productId), it.order ?? 0);

//     itemsSource = (prodData.items ?? [])
//       // 🛑 แก้ไข 2: แปลง p.id จาก Mock Product (ซึ่งเป็น String) ให้เป็น String ก่อนเปรียบเทียบ
//       .filter((p) => idToOrder.has(String(p.id)))
//       .sort((a: UIProduct, b: UIProduct) => {
//         // 🛑 แก้ไข 3: แปลง ID ให้เป็น String ก่อนดึงค่า Order
//         const ao = idToOrder.get(String(a.id)) ?? 0;
//         const bo = idToOrder.get(String(b.id)) ?? 0;
//         return ao - bo;
//       });
//     // ไม่ slice ที่นี่ เพื่อให้ client โหลดเพิ่มได้เรื่อย ๆ
//   }

//   const itemsForClient = itemsSource.map((p) => {
//     const rule = pickRule(p.discountPercent);
//     const frameInfo = toFrameInfo(rule);
//     const categoryName = p.category_id != null ? catMap.get(p.category_id as any)?.name : undefined;
//     
//     // ⚠️ ตรวจสอบและกำหนดค่า image
//     const imagePath = p.image_url || "/placeholder.png";

//     return { 
//       ...p, 
//       frameInfo, 
//       categoryName, 
//       // ⬇️ ใส่ค่า image ที่นี่ ⬇️
//       image: imagePath, 
//     };
//   });

//   // --- LOG 2: ตรวจสอบข้อมูลที่ถูกส่งให้ Client Component (ProductCardProps) ---
//   console.log("--- SVR LOG 2: ข้อมูลที่ส่งให้ Client Component (id, image) ---");
//   itemsForClient.slice(0, 3).forEach((item, index) => {
//     console.log(`[Item ${item.id}] image: ${item.image}`);
//   });
//   console.log("----------------------------------------------------------");
//   // --- END LOG 2 ---


//   // ถ้าลิสต์ว่าง → ไม่เรนเดอร์ทั้งบล็อก
//   if (listKey && itemsForClient.length === 0) {
//     return null;
//   }

//   const mergedVisibleParts = normalizeCardParts(adminParts, visibleParts);

//   // ใช้หัวข้อ/คำอธิบายจาก meta ของลิสต์ (ถ้าไม่ override)
//   const resolvedTitle = title ?? featuredList?.title ?? "สินค้าแนะนำ";
//   const resolvedSubtitle = subtitle ?? featuredList?.subtitle;

//   // จำนวนโชว์เริ่มต้น + ก้าว
//   const initialVisible = Math.max(1, limit ?? featuredList?.limit ?? 6);
//   const step = initialVisible;

//   return (
//     <ProductGridClient
//       items={itemsForClient}
//       visibleParts={mergedVisibleParts}
//       viewMode={viewMode}
//       title={resolvedTitle}
//       subtitle={resolvedSubtitle}
//       initialVisibleCount={initialVisible}
//       loadStep={step}
//     />
//   );
// }

// export default ProductGridServer;

// v.1.1.10 ===========================================================================

// v.1.1.9 ===================================================== db service call version
// // src/components/product-grid.server.tsx

// /* Server Component: ดึง products(+meta/rules/categories) หรือดึงตาม featured list
//    แล้วคำนวณ frameInfo ให้แต่ละสินค้า ส่งทั้งหมดให้ฝั่ง client render (พร้อมโหลดเพิ่มฝั่ง client) */
// import { ProductGridClient } from "./product-grid.client";
// import type { ProductCardProps } from "./product-card";
// import { absoluteUrl } from "@/lib/base-url";

// /* ====== Types ====== */
// type UIProduct = {
//   id: number | string;
//   name: string;
//   price: number;
//   discountPercent?: number;
//   image_url?: string;
//   rating?: number;
//   reviews?: number;
//   brand?: string;
//   sku?: string;
//   uom?: string;
//   category_id?: number | string;
//   slug?: string;
//   order?: number;
// };

// type CardPartsFromAdmin = Partial<{
//   image: boolean;
//   discountBadge: boolean;
//   brandLogo: boolean;
//   frame: boolean;

//   brandName: boolean;
//   sku: boolean;
//   name: boolean;
//   ratingReview: boolean;
//   category: boolean;
//   price: boolean;
//   originalPrice: boolean;
//   uom: boolean;
// }>;

// type VisibleParts = CardPartsFromAdmin;

// type DiscountRuleLite = {
//   id: string | number;
//   minPercent?: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   frameMode?: "image" | "draw";
//   frameImageUrl?: string;
//   frameInsetPx?: number;
//   frameOpacity?: number; // 0..1
//   frameObjectFit?: "contain" | "cover" | "stretch";
//   enabled?: boolean;
//   order?: number;
// };

// type ListResponse = {
//   items: UIProduct[];
//   total: number;
//   page: number;
//   pageSize: number;
//   meta?: { cardParts?: CardPartsFromAdmin };
// };

// type CategoryLite = { id: number | string; name: string; slug?: string };

// type FeaturedListItem = { productId: string | number; order: number };
// type FeaturedList = {
//   key: string;
//   title: string;
//   subtitle?: string;
//   items: FeaturedListItem[];
//   limit?: number;
// };

// export interface ProductGridServerProps {
//   visibleParts?: VisibleParts;
//   viewMode?: "grid" | "list";

//   listKey?: string;
//   /** จำกัดจำนวนที่ “แสดงตั้งต้น” และใช้เป็น step โหลดเพิ่ม (ถ้าไม่ส่งจะใช้ limit ของลิสต์, ถ้าไม่มีก็ 6) */
//   limit?: number;

//   title?: string;
//   subtitle?: string;
// }

// /* ====== Helpers ====== */
// const toFrameInfo = (rule: DiscountRuleLite | null): ProductCardProps["frameInfo"] => {
//   if (!rule) return null;

//   if (rule.frameMode === "image" && rule.frameImageUrl) {
//     const objFit: "contain" | "cover" | "fill" =
//       rule.frameObjectFit === "stretch" ? "fill" : ((rule.frameObjectFit ?? "contain") as "contain" | "cover");
//     return {
//       mode: "image",
//       imageUrl: rule.frameImageUrl,
//       inset: Math.max(0, Number(rule.frameInsetPx ?? 0)),
//       opacity: typeof rule.frameOpacity === "number" ? rule.frameOpacity : 1,
//       objectFit: objFit,
//     };
//   }
//   return {
//     mode: "draw",
//     borderWidth: rule.borderWidth,
//     borderColorHex: rule.borderColorHex,
//   };
// };

// const pickRuleFactory = (rules: DiscountRuleLite[]) => {
//   return (percent?: number): DiscountRuleLite | null => {
//     if (percent == null) return null;
//     for (const r of rules) {
//       const lowerOk = percent >= (r.minPercent ?? 0);
//       const upperOk = typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
//       if (lowerOk && upperOk) return r;
//     }
//     return null;
//   };
// };

// const normalizeCardParts = (adminParts?: CardPartsFromAdmin, override?: VisibleParts): VisibleParts => {
//   const defaults: Required<VisibleParts> = {
//     image: true,
//     discountBadge: true,
//     brandLogo: true,
//     frame: true,

//     brandName: true,
//     sku: true,
//     name: true,
//     ratingReview: true,
//     category: true,
//     price: true,
//     originalPrice: true,
//     uom: true,
//   };
//   return { ...defaults, ...(adminParts ?? {}), ...(override ?? {}) };
// };

// /* ====== Server Component ====== */
// export async function ProductGridServer({
//   visibleParts,
//   viewMode = "grid",
//   listKey,
//   limit,
//   title,
//   subtitle,
// }: ProductGridServerProps) {
//   const metaUrl = await absoluteUrl(`/api/mock/products/meta`);
//   const rulesUrl = await absoluteUrl(`/api/mock/discount-rules`);
//   const catsUrl = await absoluteUrl(`/api/mock/categories`);

//   // ===== Featured list (อ่านแบบแบ่งหน้า: {items, meta}) =====
//   let featuredList: FeaturedList | null = null;
//   if (listKey) {
//     // Note: โค้ดนี้สมมติว่าคุณได้แก้ไขให้ fetch จาก Service Layer แทน Mock API แล้ว (ตามที่เราคุยกันก่อนหน้า)
//     // แต่เพื่อความถูกต้องตามโค้ดล่าสุดที่คุณให้มา ผมจะใช้ URL เดิม
//     const listUrl = await absoluteUrl(
//       `/api/mock/featured-lists?key=${encodeURIComponent(listKey)}&page=1&pageSize=10000`
//     );
//     const listRes = await fetch(listUrl, { cache: "no-store" });
//     if (listRes.ok) {
//       const payload = await listRes.json();
//       featuredList = {
//         key: listKey,
//         title: payload?.meta?.title ?? "",
//         // 🛑 แก้ไข Type Error: subtitle จาก API/DB อาจเป็น null ต้องแปลงเป็น undefined
//         subtitle: payload?.meta?.subtitle ?? undefined,
//         limit: typeof payload?.meta?.limit === "number" ? payload.meta.limit : undefined,
//         items: Array.isArray(payload?.items) ? payload.items : [],
//       };
//     } else {
//       featuredList = { key: listKey, title: "", items: [] };
//     }
//   }

//   // products
//   const params = new URLSearchParams({
//     page: "1",
//     pageSize: "10000",
//     sort: "order",
//     order: "asc",
//     includeHidden: "0",
//   });
//   const productsUrl = await absoluteUrl(`/api/mock/products?${params.toString()}`);

//   const [prodRes, metaRes, ruleRes, catRes] = await Promise.all([
//     fetch(productsUrl, { cache: "no-store" }),
//     fetch(metaUrl, { cache: "no-store" }),
//     fetch(rulesUrl, { cache: "no-store" }),
//     fetch(catsUrl, { cache: "no-store" }),
//   ]);

//   if (!prodRes.ok) throw new Error("fetch products failed");
//   const prodData: ListResponse = await prodRes.json();

//   const metaJson = metaRes.ok ? await metaRes.json() : { meta: {} };
//   const ruleJson = ruleRes.ok ? await ruleRes.json() : { items: [] };
//   const catJson = catRes.ok ? await catRes.json() : { items: [] };

//   const adminParts: CardPartsFromAdmin | undefined = metaJson?.meta?.cardParts;

//   const rules: DiscountRuleLite[] = (ruleJson?.items ?? [])
//     .filter((r: any) => r && (r.enabled ?? true))
//     .map((r: any): DiscountRuleLite => ({
//       id: r.id,
//       minPercent: Number(r.minPercent) || 0,
//       maxPercent: typeof r.maxPercent === "number" ? r.maxPercent : undefined,
//       borderWidth: Number(r.borderWidth) || 2,
//       borderColorHex: String(r.borderColorHex || "#000000"),
//       frameMode: r.frameMode === "image" ? "image" : "draw",
//       frameImageUrl: r.frameImageUrl || undefined,
//       frameInsetPx: typeof r.frameInsetPx === "number" ? r.frameInsetPx : undefined,
//       frameOpacity:
//         typeof r.frameOpacity === "number" ? Math.max(0, Math.min(1, Number(r.frameOpacity))) : undefined,
//       frameObjectFit:
//         r.frameObjectFit === "cover"
//           ? "cover"
//           : r.frameObjectFit === "stretch"
//           ? "stretch"
//           : r.frameMode === "image"
//           ? "contain"
//           : undefined,
//       enabled: r.enabled,
//       order: typeof r.order === "number" ? r.order : undefined,
//     }))
//     .sort((a: DiscountRuleLite, b: DiscountRuleLite) => (a.order ?? 0) - (b.order ?? 0));

//   const categories: CategoryLite[] = catJson?.items ?? [];
//   const catMap = new Map<string | number, CategoryLite>();
//   for (const c of categories) catMap.set(c.id, c);

//   const pickRule = pickRuleFactory(rules);

//   // เตรียม items ทั้งหมดให้ client
//   let itemsSource: UIProduct[] = prodData.items ?? [];

//   if (featuredList) {
//     const idToOrder = new Map<string | number, number>();
    
//     // 🛑 แก้ไข 1: แปลง productId จาก Featured List (ซึ่งเป็น Number จาก DB) ให้เป็น String 
//     // เพื่อให้ Key ของ Map ตรงกับ Product ID (ซึ่งเป็น String จาก Mock API)
//     for (const it of featuredList.items) idToOrder.set(String(it.productId), it.order ?? 0);

//     itemsSource = (prodData.items ?? [])
//       // 🛑 แก้ไข 2: แปลง p.id จาก Mock Product (ซึ่งเป็น String) ให้เป็น String ก่อนเปรียบเทียบ
//       .filter((p) => idToOrder.has(String(p.id)))
//       .sort((a: UIProduct, b: UIProduct) => {
//         // 🛑 แก้ไข 3: แปลง ID ให้เป็น String ก่อนดึงค่า Order
//         const ao = idToOrder.get(String(a.id)) ?? 0;
//         const bo = idToOrder.get(String(b.id)) ?? 0;
//         return ao - bo;
//       });
//     // ไม่ slice ที่นี่ เพื่อให้ client โหลดเพิ่มได้เรื่อย ๆ
//   }

//   const itemsForClient = itemsSource.map((p) => {
//     const rule = pickRule(p.discountPercent);
//     const frameInfo = toFrameInfo(rule);
//     const categoryName = p.category_id != null ? catMap.get(p.category_id as any)?.name : undefined;
//     return { ...p, frameInfo, categoryName };
//   });



//   // ถ้าลิสต์ว่าง → ไม่เรนเดอร์ทั้งบล็อก
//   if (listKey && itemsForClient.length === 0) {
//     return null;
//   }

//   const mergedVisibleParts = normalizeCardParts(adminParts, visibleParts);

//   // ใช้หัวข้อ/คำอธิบายจาก meta ของลิสต์ (ถ้าไม่ override)
//   const resolvedTitle = title ?? featuredList?.title ?? "สินค้าแนะนำ";
//   const resolvedSubtitle = subtitle ?? featuredList?.subtitle;

//   // จำนวนโชว์เริ่มต้น + ก้าว
//   const initialVisible = Math.max(1, limit ?? featuredList?.limit ?? 6);
//   const step = initialVisible;

//   return (
//     <ProductGridClient
//       items={itemsForClient}
//       visibleParts={mergedVisibleParts}
//       viewMode={viewMode}
//       title={resolvedTitle}
//       subtitle={resolvedSubtitle}
//       initialVisibleCount={initialVisible}
//       loadStep={step}
//     />
//   );
// }

// export default ProductGridServer;

// v.1.1.9 =====================================================


// v.1.1.8 ===================================================== mock data version
// // src/components/product-grid.server.tsx

// /* Server Component: ดึง products(+meta/rules/categories) หรือดึงตาม featured list
//    แล้วคำนวณ frameInfo ให้แต่ละสินค้า ส่งทั้งหมดให้ฝั่ง client render (พร้อมโหลดเพิ่มฝั่ง client) */
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
//   order?: number;
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
//   visibleParts?: VisibleParts;
//   viewMode?: "grid" | "list";

//   listKey?: string;
//   /** จำกัดจำนวนที่ “แสดงตั้งต้น” และใช้เป็น step โหลดเพิ่ม (ถ้าไม่ส่งจะใช้ limit ของลิสต์, ถ้าไม่มีก็ 6) */
//   limit?: number;

//   title?: string;
//   subtitle?: string;
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
//   title,
//   subtitle,
// }: ProductGridServerProps) {
//   const metaUrl = await absoluteUrl(`/api/mock/products/meta`);
//   const rulesUrl = await absoluteUrl(`/api/mock/discount-rules`);
//   const catsUrl = await absoluteUrl(`/api/mock/categories`);

//   // ===== Featured list (อ่านแบบแบ่งหน้า: {items, meta}) =====
//   let featuredList: FeaturedList | null = null;
//   if (listKey) {
//     const listUrl = await absoluteUrl(
//       `/api/mock/featured-lists?key=${encodeURIComponent(listKey)}&page=1&pageSize=10000`
//     );
//     const listRes = await fetch(listUrl, { cache: "no-store" });
//     if (listRes.ok) {
//       const payload = await listRes.json();
//       featuredList = {
//         key: listKey,
//         title: payload?.meta?.title ?? "",
//         subtitle: payload?.meta?.subtitle ?? undefined,
//         limit: typeof payload?.meta?.limit === "number" ? payload.meta.limit : undefined,
//         items: Array.isArray(payload?.items) ? payload.items : [],
//       };
//     } else {
//       featuredList = { key: listKey, title: "", items: [] };
//     }
//   }

//   // products
//   const params = new URLSearchParams({
//     page: "1",
//     pageSize: "10000",
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

//   // เตรียม items ทั้งหมดให้ client
//   let itemsSource: UIProduct[] = prodData.items ?? [];

//   if (featuredList) {
//     const idToOrder = new Map<string | number, number>();
//     for (const it of featuredList.items) idToOrder.set(it.productId, it.order ?? 0);

//     itemsSource = (prodData.items ?? [])
//       .filter((p) => idToOrder.has(p.id))
//       .sort((a: UIProduct, b: UIProduct) => {
//         const ao = idToOrder.get(a.id) ?? 0;
//         const bo = idToOrder.get(b.id) ?? 0;
//         return ao - bo;
//       });
//     // ไม่ slice ที่นี่ เพื่อให้ client โหลดเพิ่มได้เรื่อย ๆ
//   }

//   const itemsForClient = itemsSource.map((p) => {
//     const rule = pickRule(p.discountPercent);
//     const frameInfo = toFrameInfo(rule);
//     const categoryName = p.category_id != null ? catMap.get(p.category_id as any)?.name : undefined;
//     return { ...p, frameInfo, categoryName };
//   });

//   // ถ้าลิสต์ว่าง → ไม่เรนเดอร์ทั้งบล็อก
//   if (listKey && itemsForClient.length === 0) {
//     return null;
//   }

//   const mergedVisibleParts = normalizeCardParts(adminParts, visibleParts);

//   // ใช้หัวข้อ/คำอธิบายจาก meta ของลิสต์ (ถ้าไม่ override)
//   const resolvedTitle = title ?? featuredList?.title ?? "สินค้าแนะนำ";
//   const resolvedSubtitle = subtitle ?? featuredList?.subtitle;

//   // จำนวนโชว์เริ่มต้น + ก้าว
//   const initialVisible = Math.max(1, limit ?? featuredList?.limit ?? 6);
//   const step = initialVisible;

//   return (
//     <ProductGridClient
//       items={itemsForClient}
//       visibleParts={mergedVisibleParts}
//       viewMode={viewMode}
//       title={resolvedTitle}
//       subtitle={resolvedSubtitle}
//       initialVisibleCount={initialVisible}
//       loadStep={step}
//     />
//   );
// }

// export default ProductGridServer;


// v.1.1.8 =====================================================

// v.1.1.7 ======================================================
// // src/components/product-grid.server.tsx

// /* Server Component: ดึงสินค้าตาม featured list (แบบแบ่งหน้าเริ่มต้น)
//    + meta/rules/categories แล้วคำนวณ frameInfo ให้ชุดแรก
//    จากนั้นส่ง context (rules/cats) ให้ฝั่ง client ใช้ตอน "โหลดเพิ่ม" */
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

// type CategoryLite = { id: number | string; name: string; slug?: string };

// type FeaturedListItem = { productId: string | number; order: number };
// type FeaturedListPage = {
//   items: FeaturedListItem[];
//   total: number;
//   page: number;
//   pageSize: number;
//   hasMore: boolean;
//   meta: { key: string; title?: string; subtitle?: string; limit?: number };
// };

// export interface ProductGridServerProps {
//   visibleParts?: VisibleParts;
//   viewMode?: "grid" | "list";
//   listKey?: string;
//   /** override จำนวนต่อหน้าเริ่มต้น (ถ้าไม่ส่งจะใช้ limit ของลิสต์ หรือ 24) */
//   limit?: number;
//   /** override ชื่อหัวข้อ / คำอธิบาย */
//   title?: string;
//   subtitle?: string;
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
//   title,
//   subtitle,
// }: ProductGridServerProps) {
//   // URLs
//   const metaUrl = await absoluteUrl(`/api/mock/products/meta`);
//   const rulesUrl = await absoluteUrl(`/api/mock/discount-rules`);
//   const catsUrl = await absoluteUrl(`/api/mock/categories`);

//   // ดึงกฎกรอบส่วนลด + หมวดหมู่ + card parts จาก admin
//   const [metaRes, ruleRes, catRes] = await Promise.all([
//     fetch(metaUrl, { cache: "no-store" }),
//     fetch(rulesUrl, { cache: "no-store" }),
//     fetch(catsUrl, { cache: "no-store" }),
//   ]);

//   const metaJson = metaRes.ok ? await metaRes.json() : { meta: {} };
//   const adminParts: CardPartsFromAdmin | undefined = metaJson?.meta?.cardParts;

//   const rules: DiscountRuleLite[] = (ruleRes.ok ? (await ruleRes.json())?.items : [])
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
//         r.frameObjectFit === "cover" ? "cover" :
//         r.frameObjectFit === "stretch" ? "stretch" :
//         r.frameMode === "image" ? "contain" : undefined,
//       enabled: r.enabled,
//       order: typeof r.order === "number" ? r.order : undefined,
//     }))
//     .sort((a: DiscountRuleLite, b: DiscountRuleLite) => (a.order ?? 0) - (b.order ?? 0));

//   const categories: CategoryLite[] = catRes.ok ? ((await catRes.json())?.items ?? []) : [];
//   const catMap = new Map<string | number, CategoryLite>();
//   for (const c of categories) catMap.set(c.id, c);

//   const pickRule = pickRuleFactory(rules);
//   const mergedVisibleParts = normalizeCardParts(adminParts, visibleParts);

//   // ถ้าไม่มี listKey → (โปรเจ็กต์นี้เราใช้ลิสต์) ขอยึดตามลิสต์เป็นหลัก
//   if (!listKey) {
//     return (
//       <ProductGridClient
//         items={[]}
//         visibleParts={mergedVisibleParts}
//         viewMode={viewMode}
//         title={title ?? "สินค้าแนะนำ"}
//         subtitle={subtitle}
//         // ไม่มีโหลดเพิ่ม
//         listKey={undefined}
//         pageSize={undefined}
//         hasMoreInitial={false}
//         ruleCtx={[]}
//         categoriesCtx={[]}
//       />
//     );
//   }

//   // 1) อ่านหน้าที่ 1 ของลิสต์
//   const pageSizeParam = limit ? `&pageSize=${limit}` : "";
//   const listUrl = await absoluteUrl(`/api/mock/featured-lists?key=${encodeURIComponent(listKey)}&page=1${pageSizeParam}`);
//   const listRes = await fetch(listUrl, { cache: "no-store" });
//   if (!listRes.ok) {
//     return (
//       <ProductGridClient
//         items={[]}
//         visibleParts={mergedVisibleParts}
//         viewMode={viewMode}
//         title={title ?? "สินค้าแนะนำ"}
//         subtitle={subtitle}
//         listKey={listKey}
//         pageSize={limit}
//         hasMoreInitial={false}
//         ruleCtx={rules}
//         categoriesCtx={categories.map(c => ({ id: c.id, name: c.name }))}
//       />
//     );
//   }

//   const listPage = (await listRes.json()) as FeaturedListPage;
//   const ids = listPage.items.map((it) => it.productId);
//   // 2) ดึง detail ของสินค้าหน้าแรกด้วย by-ids
//   let itemsForClient: UIProduct[] = [];
//   if (ids.length > 0) {
//     const byIdsUrl = await absoluteUrl(`/api/mock/products/by-ids?ids=${encodeURIComponent(ids.join(","))}`);
//     const byIdsRes = await fetch(byIdsUrl, { cache: "no-store" });
//     const byIdsJson = byIdsRes.ok ? await byIdsRes.json() : { items: [] };
//     const products: UIProduct[] = (byIdsJson?.items ?? []) as UIProduct[];

//     // เรียงตาม order ของลิสต์
//     const orderMap = new Map<string | number, number>();
//     for (const it of listPage.items) orderMap.set(it.productId, it.order ?? 0);
//     const sorted = products.sort((a, b) => (orderMap.get(a.id)! - orderMap.get(b.id)!));

//     // คำนวณ frame + categoryName
//     itemsForClient = sorted.map((p) => {
//       const frameRule = pickRule(p.discountPercent);
//       const frameInfo = toFrameInfo(frameRule);
//       const categoryName = p.category_id != null ? catMap.get(p.category_id as any)?.name : undefined;
//       return { ...p, frameInfo, categoryName } as any;
//     });
//   }

//   // resolved heading
//   const resolvedTitle = title ?? listPage.meta?.title ?? "สินค้าแนะนำ";
//   const resolvedSubtitle = subtitle ?? listPage.meta?.subtitle;

//   return (
//     <ProductGridClient
//       items={itemsForClient}
//       visibleParts={mergedVisibleParts}
//       viewMode={viewMode}
//       title={resolvedTitle}
//       subtitle={resolvedSubtitle}
//       // context สำหรับ “โหลดเพิ่ม”
//       listKey={listKey}
//       pageSize={listPage.pageSize}
//       hasMoreInitial={listPage.hasMore}
//       ruleCtx={rules}
//       categoriesCtx={categories.map(c => ({ id: c.id, name: c.name }))}
//     />
//   );
// }

// export default ProductGridServer;

// v.1.1.7 ======================================================

// v.1.1.6 ======================================================
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
// type FeaturedListPage = {
//   items: FeaturedListItem[];
//   total: number;
//   page: number;
//   pageSize: number;
//   hasMore: boolean;
//   meta: {
//     key: string;
//     title: string;
//     subtitle?: string;
//     limit?: number;
//   };
// };

// export interface ProductGridServerProps {
//   /** (optional) override จากหน้าเพจ */
//   visibleParts?: VisibleParts;
//   viewMode?: "grid" | "list";

//   /** โหมด “ลิสต์แนะนำ” — ถ้าส่งมา จะดึงเฉพาะสินค้าตามลิสต์นี้ */
//   listKey?: string;
//   /** จำกัดจำนวนชิ้นของ “หน้าแรก” (override limit ในลิสต์ได้) */
//   limit?: number;

//   /** ตั้งหัวข้อ/คำอธิบายทับได้เอง (ถ้าไม่ส่ง จะใช้ค่าจากลิสต์) */
//   title?: string;
//   subtitle?: string;
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
//   title,
//   subtitle,
// }: ProductGridServerProps) {
//   // URLs ที่ใช้ร่วม
//   const metaUrl = await absoluteUrl(`/api/mock/products/meta`);
//   const rulesUrl = await absoluteUrl(`/api/mock/discount-rules`);
//   const catsUrl = await absoluteUrl(`/api/mock/categories`);

//   // โหลดส่วนตั้งค่าจากระบบ
//   const [metaRes, ruleRes, catRes] = await Promise.all([
//     fetch(metaUrl, { cache: "no-store" }),
//     fetch(rulesUrl, { cache: "no-store" }),
//     fetch(catsUrl, { cache: "no-store" }),
//   ]);

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

//   /* ---------- โหมด “ลิสต์แนะนำ” (ดึงแบบแบ่งหน้า + by-ids) ---------- */
//   if (listKey) {
//     // 1) เรียก featured list หน้าแรก
//     const qs = new URLSearchParams({ key: listKey, page: "1" });
//     if (typeof limit === "number" && limit > 0) qs.set("pageSize", String(Math.floor(limit)));
//     const listUrl = await absoluteUrl(`/api/mock/featured-lists?${qs.toString()}`);

//     const listRes = await fetch(listUrl, { cache: "no-store" });
//     if (!listRes.ok) {
//       // กรณี key ไม่เจอ → แสดงว่าง ๆ แต่ไม่ทำให้หน้าแตก
//       return (
//         <ProductGridClient
//           items={[]}
//           visibleParts={normalizeCardParts(adminParts, visibleParts)}
//           viewMode={viewMode}
//           title={title ?? "สินค้าแนะนำ"}
//           subtitle={subtitle}
//         />
//       );
//     }

//     const listPage: FeaturedListPage = await listRes.json();

//     // 2) ดึงรายละเอียดสินค้าจริงตาม ids
//     const ids = listPage.items.map((it) => String(it.productId));
//     let products: UIProduct[] = [];
//     if (ids.length) {
//       const byIdsUrl = await absoluteUrl(`/api/mock/products/by-ids?ids=${encodeURIComponent(ids.join(","))}`);
//       const pRes = await fetch(byIdsUrl, { cache: "no-store" });
//       if (pRes.ok) {
//         const data = await pRes.json();
//         products = (data?.items ?? []) as UIProduct[];
//       }
//     }

//     // 3) จัดเรียงตาม order ของลิสต์
//     const orderMap = new Map<string, number>();
//     listPage.items.forEach((it) => orderMap.set(String(it.productId), it.order));
//     products.sort((a, b) => (orderMap.get(String(a.id)) ?? 0) - (orderMap.get(String(b.id)) ?? 0));

//     // 4) enrich การแสดงผล
//     const itemsForClient = products.map((p) => {
//       const rule = pickRule(p.discountPercent);
//       const frameInfo = toFrameInfo(rule);
//       const categoryName = p.category_id != null ? catMap.get(p.category_id as any)?.name : undefined;
//       return { ...p, frameInfo, categoryName };
//     });

//     const mergedVisibleParts = normalizeCardParts(adminParts, visibleParts);

//     // ใช้หัวข้อ/คำอธิบายจาก meta ของลิสต์ (ถ้าไม่ได้ override)
//     const resolvedTitle = title ?? listPage.meta?.title ?? "สินค้าแนะนำ";
//     const resolvedSubtitle = subtitle ?? listPage.meta?.subtitle;

//     return (
//       <ProductGridClient
//         items={itemsForClient}
//         visibleParts={mergedVisibleParts}
//         viewMode={viewMode}
//         title={resolvedTitle}
//         subtitle={resolvedSubtitle}
//       />
//     );
//   }

//   /* ---------- โหมดทั่วไป (ไม่ใช้ listKey) — คงพฤติกรรมเดิม ---------- */
//   const params = new URLSearchParams({
//     page: "1",
//     pageSize: "24",
//     sort: "order",
//     order: "asc",
//     includeHidden: "0",
//   });
//   const productsUrl = await absoluteUrl(`/api/mock/products?${params.toString()}`);
//   const prodRes = await fetch(productsUrl, { cache: "no-store" });
//   if (!prodRes.ok) throw new Error("fetch products failed");
//   const prodData: ListResponse = await prodRes.json();

//   const itemsForClient = (prodData.items ?? []).map((p) => {
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
//       title={title ?? "สินค้าแนะนำ"}
//       subtitle={subtitle}
//     />
//   );
// }

// export default ProductGridServer;

// v.1.1.6 ======================================================

// v.1.1.5 ======================================================
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

//   /** ตั้งหัวข้อ/คำอธิบายทับได้เอง (ถ้าไม่ส่ง จะใช้ค่าจากลิสต์) */
//   title?: string;
//   subtitle?: string;
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
//   title,
//   subtitle,
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
//       // key ไม่เจอ → ใช้ลิสต์ว่างเพื่อไม่ให้หน้าแตก
//       featuredList = { key: listKey, title: "", items: [] };
//     }
//   }

//   // products:
//   // - ไม่มี listKey → ดึงแบบเดิม
//   // - มี listKey → ดึงเยอะหน่อยแล้ว filter ตาม productId ในลิสต์
//   const params = new URLSearchParams({
//     page: "1",
//     pageSize: listKey ? "1000" : "24",
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

//   if (featuredList) {
//     const idToOrder = new Map<string | number, number>();
//     for (const it of featuredList.items) idToOrder.set(it.productId, it.order ?? 0);

//     itemsSource = (prodData.items ?? [])
//       .filter((p) => idToOrder.has(p.id))
//       .sort((a, b) => (idToOrder.get(a.id)! - idToOrder.get(b.id)!));

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

//   // ✅ เลือกหัวข้อ/คำอธิบาย: override > จากลิสต์ > ค่าเริ่มต้น
//   const resolvedTitle = title ?? featuredList?.title ?? "สินค้าแนะนำ";
//   const resolvedSubtitle = subtitle ?? featuredList?.subtitle;

//   return (
//     <ProductGridClient
//       items={itemsForClient}
//       visibleParts={mergedVisibleParts}
//       viewMode={viewMode}
//       title={resolvedTitle}
//       subtitle={resolvedSubtitle}
//     />
//   );
// }

// export default ProductGridServer;

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

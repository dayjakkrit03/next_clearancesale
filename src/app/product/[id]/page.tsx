// v.1.1.3 ==========================================================
// src/app/product/[id]/page.tsx

import { notFound } from "next/navigation";
import { headers } from "next/headers";
// 🎯 นำเข้า Types ที่เป็น Single Source of Truth จาก Service Layer
import { getById, getMeta, UIProduct, CardPartsVisibility } from "@/app/api/mock/products/_store";
import ProductClient from "./ProductClient";

// ====== Types ที่ยังคงอยู่ในไฟล์นี้ (เนื่องจากมาจาก API ภายนอก) ======
type DiscountRuleLite = {
  id: string | number;
  minPercent?: number;
  maxPercent?: number;
  borderWidth: number;
  borderColorHex: string;
  frameMode?: "image" | "draw";
  frameImageUrl?: string;
  frameInsetPx?: number;
  frameOpacity?: number;
  frameObjectFit?: "contain" | "cover" | "stretch";
  enabled?: boolean;
  order?: number;
};

// ❌ REMOVED: Type VisibleParts ถูกลบออกไปและถูกแทนที่ด้วย CardPartsVisibility

export const dynamic = "force-dynamic"; // ต้องการข้อมูลสดเสมอ
export const revalidate = 0;

// ✅ FIX 1: headers() ต้อง await ก่อนเรียก .get()
async function getBaseUrlFromHeaders() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

async function fetchDiscountRules(): Promise<DiscountRuleLite[]> {
  const base = await getBaseUrlFromHeaders();
  const r = await fetch(`${base}/api/mock/discount-rules`, { cache: "no-store" });
  const j = await r.json().catch(() => ({}));
  const rules: DiscountRuleLite[] = (j?.items ?? [])
    .filter((x: any) => x && (x.enabled ?? true))
    // ✅ FIX 2: ใส่ type ให้ a,b เพื่อเลี่ยง warning TS7006
    .sort((a: DiscountRuleLite, b: DiscountRuleLite) => Number(a.order ?? 0) - Number(b.order ?? 0))
    .map((r: any) => ({
      id: r.id,
      minPercent: Number(r.minPercent) || 0,
      maxPercent: typeof r.maxPercent === "number" ? r.maxPercent : undefined,
      borderWidth: Number(r.borderWidth) || 2,
      borderColorHex: String(r.borderColorHex || "#000000"),
      frameMode: r.frameMode === "image" ? "image" : "draw",
      frameImageUrl: r.frameMode === "image" ? r.frameImageUrl : undefined,
      frameInsetPx: typeof r.frameInsetPx === "number" ? r.frameInsetPx : undefined,
      frameOpacity:
        typeof r.frameOpacity === "number" ? Math.max(0, Math.min(1, Number(r.frameOpacity))) : undefined,
      frameObjectFit:
        r.frameObjectFit === "cover" ? "cover" : r.frameObjectFit === "stretch" ? "stretch" : "contain",
      enabled: r.enabled,
      order: typeof r.order === "number" ? r.order : undefined,
    }));
  return rules;
}

export default async function Page({ params }: { params: { id: string } }) {
  // 🎯 ใช้ UIProduct ที่ Import มาจาก Service Layer
  const product: UIProduct | undefined = await getById(params.id);
  if (!product) return notFound();

  const meta = await getMeta();
  // 🎯 ใช้ CardPartsVisibility ที่ Import มาแทน VisibleParts เดิม
  const visibleParts: CardPartsVisibility | undefined = meta?.cardParts;
  const rules = await fetchDiscountRules();

  return (
    <ProductClient
      // 🎯 ไม่จำเป็นต้องใช้ 'as any' แล้ว เพราะ product ถูก Type อย่างถูกต้องแล้ว
      product={product}
      visibleParts={visibleParts}
      rules={rules}
    />
  );
}

// v.1.1.3 ==========================================================

// v.1.1.2 ==========================================================
// // src/app/product/[id]/page.tsx

// import { notFound } from "next/navigation";
// import { headers } from "next/headers";
// import { getById, getMeta } from "@/app/api/mock/products/_store";
// import ProductClient from "./ProductClient";

// // ====== Types ให้ตรงกับฝั่ง Client ======
// type DiscountRuleLite = {
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

// export const dynamic = "force-dynamic"; // ต้องการข้อมูลสดเสมอ
// export const revalidate = 0;

// // ✅ FIX 1: headers() ต้อง await ก่อนเรียก .get()
// async function getBaseUrlFromHeaders() {
//   const h = await headers();
//   const proto = h.get("x-forwarded-proto") ?? "http";
//   const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
//   return `${proto}://${host}`;
// }

// async function fetchDiscountRules(): Promise<DiscountRuleLite[]> {
//   const base = await getBaseUrlFromHeaders();
//   const r = await fetch(`${base}/api/mock/discount-rules`, { cache: "no-store" });
//   const j = await r.json().catch(() => ({}));
//   const rules: DiscountRuleLite[] = (j?.items ?? [])
//     .filter((x: any) => x && (x.enabled ?? true))
//     // ✅ FIX 2: ใส่ type ให้ a,b เพื่อเลี่ยง warning TS7006
//     .sort((a: DiscountRuleLite, b: DiscountRuleLite) => Number(a.order ?? 0) - Number(b.order ?? 0))
//     .map((r: any) => ({
//       id: r.id,
//       minPercent: Number(r.minPercent) || 0,
//       maxPercent: typeof r.maxPercent === "number" ? r.maxPercent : undefined,
//       borderWidth: Number(r.borderWidth) || 2,
//       borderColorHex: String(r.borderColorHex || "#000000"),
//       frameMode: r.frameMode === "image" ? "image" : "draw",
//       frameImageUrl: r.frameMode === "image" ? r.frameImageUrl : undefined,
//       frameInsetPx: typeof r.frameInsetPx === "number" ? r.frameInsetPx : undefined,
//       frameOpacity:
//         typeof r.frameOpacity === "number" ? Math.max(0, Math.min(1, Number(r.frameOpacity))) : undefined,
//       frameObjectFit:
//         r.frameObjectFit === "cover" ? "cover" : r.frameObjectFit === "stretch" ? "stretch" : "contain",
//       enabled: r.enabled,
//       order: typeof r.order === "number" ? r.order : undefined,
//     }));
//   return rules;
// }

// export default async function Page({ params }: { params: { id: string } }) {
//   const product = await getById(params.id);
//   if (!product) return notFound();

//   const meta = await getMeta();
//   const visibleParts: VisibleParts | undefined = meta?.cardParts;
//   const rules = await fetchDiscountRules();

//   return (
//     <ProductClient
//       product={product as any}
//       visibleParts={visibleParts}
//       rules={rules}
//     />
//   );
// }

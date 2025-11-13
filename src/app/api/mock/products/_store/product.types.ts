// src/app/api/mock/products/_store/product.types.ts

import { defaultCardPartsVisibility } from "./product.helpers";

/** ===== Types (คงแบบเดิม + images) ===== */
export type UIProduct = {
  id: number | string;
  name: string;
  brand?: string;
  sku?: string;
  price: number;
  discountPercent?: number; // 0..100
  image_url?: string;
  visible?: boolean;
  order: number;

  rating?: number;  // 0..5
  reviews?: number; // count

  category_id?: number | string;
  uom?: string;

  /** NEW: รูปทั้งหมดของสินค้า (เรียงตาม display_order) */
  images?: Array<{ url: string; order: number; isPrimary?: boolean }>;

  /** NEW: เงื่อนไขการขาย (ถ้ามี) */
  conditions?: ProductCondition[];

};

/** ===== Sales conditions types ===== */
export type SalesType = "CUT" | "ROLL";

export type ProductCondition = {
  salesType: SalesType;        // CUT | ROLL
  unit: string;                // หน่วยหลัก เช่น "M."
  minimumLength?: number;      // CUT เท่านั้น
  rollLengths?: number[];      // ROLL เท่านั้น (หลายความยาว)
  /** CUT เท่านั้น: ตัวเลือก step ในการเพิ่มความยาว (เช่น 10;30;50 -> [10,30,50]) */
  stepOptions?: number[];
  /** ROLL เท่านั้น: จำนวนสต๊อกของแต่ละความยาว (index ตรงกับ rollLengths) */
  rollStocks?: number[];
};

/** ===== Card parts visibility ===== */
export type CardPartsVisibility = {
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
};
export { defaultCardPartsVisibility };

export type ProductsMeta = {
  title: string;
  subtitle: string;
  updatedAt?: string;
  cardParts: CardPartsVisibility;
};

export type ProductQuery = {
  q?: string;
  category_id?: number | string;
  matchCategoryIds?: Array<number | string>;
  visible?: boolean;
  sort?: "order" | "newest" | "price_asc" | "price_desc" | "discount_desc" | "rating_desc";
  page?: number;     // 1-based
  pageSize?: number; // e.g. 24/48/96
};

export type MetaPatch = Partial<Omit<ProductsMeta, "cardParts">> & { cardParts?: Partial<CardPartsVisibility> };
// v.1.1.3 =================================================================
import { defaultCardPartsVisibility } from "./product.helpers";

/** ======================================================
 *  รูปสินค้า (ใช้กับ gallery)
 * ====================================================== */
export type UIProductImage = {
  url: string;
  order: number;
  isPrimary?: boolean;
};

/** ======================================================
 *  Product (UI Model)
 * ====================================================== */
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

  rating?: number; // 0..5
  reviews?: number; // count

  category_id?: number | string;
  uom?: string;

  /* ===== fields จาก products_clearance ===== */
  product_new?: number; // 0/1 จาก DB
  product_best?: number; // 0/1 จาก DB
  users_action?: number | null;

  clearanceSales?: boolean;
  clearanceQuantity?: number; // จำนวนคงเหลือรวม (เมตร)

  /* ===== Service Features ===== */
  freeShippingEligible?: boolean;
  freeShipMinimum?: number;
  warrantyMonths?: number;
  returnDays?: number;

  /** รูปทั้งหมดของสินค้า (เรียงตาม display_order) */
  images?: UIProductImage[];

  /** เงื่อนไขการขาย (CUT / ROLL) */
  conditions?: ProductCondition[];
};

/** ======================================================
 *  Sales Conditions
 * ====================================================== */
export type SalesType = "CUT" | "ROLL";

/** 🔹 ใช้กับ ROLL (โครงสร้างใหม่: 1 length = 1 stock) */
export type RollPair = {
  length: number; // ความยาวม้วน
  stock: number; // จำนวนม้วน
};

export type ProductCondition = {
  salesType: SalesType; // "CUT" | "ROLL"
  unit: string; // หน่วยหลัก เช่น "M."

  /* ---------------- CUT ---------------- */
  /** ความยาวขั้นต่ำที่ขายได้ */
  minimumLength?: number;

  /** ตัวเลือก step สำหรับเพิ่ม/ลดความยาว (เช่น [10,30,50]) */
  stepOptions?: number[];

  /* ---------------- ROLL (รองรับ 2 รูปแบบ) ---------------- */

  /** ✅ รูปแบบเก่า (ยังรองรับไว้) */
  rollLengths?: number[]; // [100, 200, 300]
  rollStocks?: number[]; // [5, 2, 0]

  /** ✅ รูปแบบใหม่ (แนะนำให้ใช้) */
  rollPairs?: RollPair[]; // [{ length: 100, stock: 5 }, ...]
};

/** ======================================================
 *  Card parts visibility
 * ====================================================== */
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

/** ======================================================
 *  Meta / Query
 * ====================================================== */
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
  sort?:
    | "order"
    | "newest"
    | "price_asc"
    | "price_desc"
    | "discount_desc"
    | "discount_asc"
    | "rating_desc";
  page?: number; // 1-based
  pageSize?: number; // e.g. 24/48/96
};

export type MetaPatch = Partial<Omit<ProductsMeta, "cardParts">> & {
  cardParts?: Partial<CardPartsVisibility>;
};

// v.1.1.3 =================================================================

// v.1.1.2 =================================================================
// // src/app/api/mock/products/_store/product.types.ts

// import { defaultCardPartsVisibility } from "./product.helpers";

// /** รูปสินค้า 1 รูป (ไว้ใช้กับ gallery) */
// export type UIProductImage = {
//   url: string;
//   order: number;
//   isPrimary?: boolean;
// };

// /** ===== Types (คงแบบเดิม + images) ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;

//   rating?: number; // 0..5
//   reviews?: number; // count

//   category_id?: number | string;
//   uom?: string;

//   // NEW: ฟิลด์จากตาราง products_clearance
//   product_new?: number; // 0/1 จาก DB
//   product_best?: number; // 0/1 จาก DB
//   users_action?: number | null; // จำนวนคลิก
//   clearanceSales?: boolean; // boolean จาก DB
//   clearanceQuantity?: number; // จำนวนคงเหลือ

//   // 💙 NEW: Service Features fields
//   freeShippingEligible?: boolean; // -> free_shipping_eligible
//   freeShipMinimum?: number; // -> free_ship_minimum
//   warrantyMonths?: number; // -> warranty_months
//   returnDays?: number; // -> return_days

//   /** NEW: รูปทั้งหมดของสินค้า (เรียงตาม display_order) */
//   images?: UIProductImage[];

//   /** NEW: เงื่อนไขการขาย (ถ้ามี) */
//   conditions?: ProductCondition[];
// };

// /** ===== Sales conditions types ===== */
// export type SalesType = "CUT" | "ROLL";

// export type ProductCondition = {
//   salesType: SalesType; // CUT | ROLL
//   unit: string; // หน่วยหลัก เช่น "M."
//   minimumLength?: number; // CUT เท่านั้น
//   rollLengths?: number[]; // ROLL เท่านั้น (หลายความยาว)
//   /** CUT เท่านั้น: ตัวเลือก step ในการเพิ่มความยาว (เช่น 10;30;50 -> [10,30,50]) */
//   stepOptions?: number[];
//   /** ROLL เท่านั้น: จำนวนสต๊อกของแต่ละความยาว (index ตรงกับ rollLengths) */
//   rollStocks?: number[];
// };

// /** ===== Card parts visibility ===== */
// export type CardPartsVisibility = {
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

// export { defaultCardPartsVisibility };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
//   cardParts: CardPartsVisibility;
// };

// export type ProductQuery = {
//   q?: string;
//   category_id?: number | string;
//   matchCategoryIds?: Array<number | string>;
//   visible?: boolean;
//   sort?:
//     | "order"
//     | "newest"
//     | "price_asc"
//     | "price_desc"
//     | "discount_desc"
//     | "discount_asc"
//     | "rating_desc";
//   page?: number; // 1-based
//   pageSize?: number; // e.g. 24/48/96
// };

// export type MetaPatch = Partial<Omit<ProductsMeta, "cardParts">> & {
//   cardParts?: Partial<CardPartsVisibility>;
// };

// v.1.1.2 =================================================================

// // src/app/api/mock/products/_store/product.types.ts

// import { defaultCardPartsVisibility } from "./product.helpers";

// /** ===== Types (คงแบบเดิม + images) ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;

//   rating?: number;  // 0..5
//   reviews?: number; // count

//   category_id?: number | string;
//   uom?: string;

//   // NEW: ฟิลด์จากตาราง products_clearance
//   product_new?: number;         // 0/1 จาก DB
//   product_best?: number;        // 0/1 จาก DB
//   users_action?: number | null; // จำนวนคลิก
//   clearanceSales?: boolean;     // boolean จาก DB
//   clearanceQuantity?: number;   // จำนวนคงเหลือ

//   // 💙 NEW: Service Features fields  
//   freeShippingEligible?: boolean;  // -> free_shipping_eligible
//   freeShipMinimum?: number;        // -> free_ship_minimum
//   warrantyMonths?: number;         // -> warranty_months
//   returnDays?: number;             // -> return_days

//   /** NEW: รูปทั้งหมดของสินค้า (เรียงตาม display_order) */
//   images?: Array<{ url: string; order: number; isPrimary?: boolean }>;

//   /** NEW: เงื่อนไขการขาย (ถ้ามี) */
//   conditions?: ProductCondition[];

// };

// /** ===== Sales conditions types ===== */
// export type SalesType = "CUT" | "ROLL";

// export type ProductCondition = {
//   salesType: SalesType;        // CUT | ROLL
//   unit: string;                // หน่วยหลัก เช่น "M."
//   minimumLength?: number;      // CUT เท่านั้น
//   rollLengths?: number[];      // ROLL เท่านั้น (หลายความยาว)
//   /** CUT เท่านั้น: ตัวเลือก step ในการเพิ่มความยาว (เช่น 10;30;50 -> [10,30,50]) */
//   stepOptions?: number[];
//   /** ROLL เท่านั้น: จำนวนสต๊อกของแต่ละความยาว (index ตรงกับ rollLengths) */
//   rollStocks?: number[];
// };

// /** ===== Card parts visibility ===== */
// export type CardPartsVisibility = {
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
// export { defaultCardPartsVisibility };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
//   cardParts: CardPartsVisibility;
// };

// export type ProductQuery = {
//   q?: string;
//   category_id?: number | string;
//   matchCategoryIds?: Array<number | string>;
//   visible?: boolean;
//   sort?: "order" | "newest" | "price_asc" | "price_desc" | "discount_desc" | "discount_asc" | "rating_desc";
//   page?: number;     // 1-based
//   pageSize?: number; // e.g. 24/48/96
// };

// export type MetaPatch = Partial<Omit<ProductsMeta, "cardParts">> & { cardParts?: Partial<CardPartsVisibility> };
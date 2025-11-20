// src/types/cart.ts

/* ================================
 *  Cart module shared types
 * ================================ */

/** ฟอร์แมตตอนส่งข้อมูลจาก product detail → /api/cart/add */
export type AddToCartRequest = {
  product: string;      // SKU
  uom: string;          // หน่วย เช่น "EA"
  quantity: number;     // จำนวนที่ต้องการเพิ่ม
  price: number;        // ราคาต่อหน่วย
};

/** รูปแบบข้อมูลที่บริการ check stock (ItemAvail2) คืนกลับ */
export type StockCheckResult = {
  itemAvail: number;    // คงเหลือแบบ (Stock - lock คนอื่น + lock ตัวเอง)
};

/** Response สถานะที่เหมือน Laravel 100% */
export type AddToCartResponse =
  | { status: "success" }
  | { status: "login" }
  | { status: "less-left"; itemAvail: number }
  | { status: "sold-out" };

/** ข้อมูล item ในตะกร้าตาม Laravel Cart model */
export type CartItem = {
  id: number;
  id_customer: number;
  product: string;         // SKU
  uom: string;
  quantity: number;
  price: number;
  price_amount: number;
  check_product: boolean;
  cart_status: number;     // 0=normal, 3=deleted
  reserve: number;         // 0=normal, 1=reserve
  event_sale: string;      // "clearance-2024"
  created_at?: string;
  updated_at?: string;
};

/** สถานะในตะกร้า */
export type CartStatus = 0 | 1 | 2 | 3;

/** ประเภท event sale */
export type EventSaleType = `clearance-${number}`;

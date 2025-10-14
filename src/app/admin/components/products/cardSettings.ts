// src/app/admin/components/products/cardSettings.ts

// สวิตช์เปิด/ปิดส่วนต่างๆ ของการ์ดสินค้า
export type CardPartsVisibility = {
  // กลุ่มบนรูป
  image: boolean;            // รูปภาพสินค้า
  discountBadge: boolean;    // ป้ายเปอร์เซ็นต์ส่วนลด
  brandLogo: boolean;        // โลโก้ยี่ห้อ
  frame: boolean;            // กรอบรูป (draw/image)

  // ข้อมูลใต้รูป
  brandName: boolean;        // ชื่อยี่ห้อ (ตัวหนังสือ)
  sku: boolean;              // SKU
  name: boolean;             // ชื่อสินค้า
  ratingReview: boolean;     // ดาว + จำนวนรีวิว
  category: boolean;         // ชื่อหมวดหมู่
  price: boolean;            // ราคาขายปัจจุบัน
  originalPrice: boolean;    // ราคาก่อนลด (ขีดฆ่า)
  uom: boolean;              // หน่วย /UoM
};

export const CARD_SETTINGS_STORAGE_KEY = "admin.cardParts@v1";

export const defaultCardPartsVisibility: CardPartsVisibility = {
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

// โหลดจาก localStorage (ถ้าไม่มีให้คืนค่า default)
export function loadCardSettings(): CardPartsVisibility {
  if (typeof window === "undefined") return { ...defaultCardPartsVisibility };
  try {
    const raw = localStorage.getItem(CARD_SETTINGS_STORAGE_KEY);
    if (!raw) return { ...defaultCardPartsVisibility };
    const parsed = JSON.parse(raw);
    return { ...defaultCardPartsVisibility, ...parsed };
  } catch {
    return { ...defaultCardPartsVisibility };
  }
}

// บันทึกลง localStorage
export function saveCardSettings(next: CardPartsVisibility) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CARD_SETTINGS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

// helper: รวม patch แล้วบันทึก
export function mergeAndSave(
  prev: CardPartsVisibility,
  patch: Partial<CardPartsVisibility>,
): CardPartsVisibility {
  const next = { ...prev, ...patch };
  saveCardSettings(next);
  return next;
}

// src/services/cart/cart.helpers.ts

import type { CartItem, EventSaleType } from "@/types/cart";

/** event sale ปัจจุบัน เช่น "clearance-2025" */
export const CURRENT_EVENT_SALE: EventSaleType =
  `clearance-${new Date().getFullYear()}`;

/** ให้แน่ใจว่า quantity เป็นเลขบวก และปัดเป็นจำนวนเต็ม */
export function normalizeQuantity(qty: number): number {
  if (!Number.isFinite(qty)) return 0;
  return Math.max(0, Math.floor(qty));
}

/** คำนวณ price_amount = quantity * price (ปัดทศนิยม 2 ตำแหน่ง) */
export function calcPriceAmount(quantity: number, price: number): number {
  const q = normalizeQuantity(quantity);
  const p = Number.isFinite(price) ? price : 0;
  return Math.round(q * p * 100) / 100;
}

/** แปลง row จาก Prisma carts → CartItem (type กลาง) */
export function mapCartRowToCartItem(row: any): CartItem {
  return {
    id: Number(row.id),
    id_customer: Number(row.id__customers),
    product: row.product,
    uom: row.uom ?? "",
    quantity: Number(row.quantity),
    price: row.price !== null ? Number(row.price) : 0,
    price_amount: row.price_amount !== null ? Number(row.price_amount) : 0,
    check_product: Boolean(row.check_product),
    cart_status: Number(row.cart_status ?? 0),
    reserve: Number(row.reserve ?? 0),
    event_sale: row.event_sale ?? "",
    created_at: row.created_at?.toISOString?.() ?? undefined,
    updated_at: row.updated_at?.toISOString?.() ?? undefined,
  };
}

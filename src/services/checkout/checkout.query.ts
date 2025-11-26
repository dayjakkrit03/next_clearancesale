// v.1.1.3 ================================================================
// // src/services/checkout/checkout.query.ts

// import {
//   prismaShop,
//   prismaInterlink,
//   setShopSessionTZ,
//   setInterlinkSessionTZ,
// } from "@/lib/db";

// import {
//   CURRENT_EVENT_SALE,
//   mapCartRowToCartItem,
// } from "@/services/cart/cart.helpers";

// import type { CartItem } from "@/types/cart";
// import type { ProductForCheckout } from "@/types/checkout";

// /* ============================================================
//  * 1) ดึงเฉพาะ Cart ที่ถูกเลือก (checked=true)
//  * ============================================================
//  */
// export async function fetchSelectedCartItems(
//   customerId: number
// ): Promise<CartItem[]> {
//   await setShopSessionTZ();

//   const rows = await prismaShop.carts.findMany({
//     where: {
//       id__customers: BigInt(customerId),
//       cart_status: 0,
//       reserve: 0,
//       check_product: true,
//       event_sale: CURRENT_EVENT_SALE as any,
//     },
//     orderBy: { id: "asc" },
//   });

//   return rows.map((row: any) => mapCartRowToCartItem(row));
// }

/* ============================================================
 * 2) ดึงข้อมูลสินค้า (products_clearance) จาก SKU
 *    คืนค่าเป็น map[sku] = ProductForCheckout
 *
 *    schema จริง:
 *      - product_id        Int
 *      - product_sku       String?
 *      - product_name      String?
 *      - product_brand     String?
 *      - product_uom       String?
 *      - image_url         String?
 * ============================================================
 */
// export async function fetchProductsForCart(
//   skus: string[]
// ): Promise<Record<string, ProductForCheckout>> {
//   if (!skus.length) return {};

//   const uniqueSkus = Array.from(new Set(skus));

//   await setInterlinkSessionTZ();

//   const productsRaw = await prismaInterlink.products_clearance.findMany({
//     where: {
//       product_sku: { in: uniqueSkus },
//     },
//     select: {
//       product_id: true,
//       product_sku: true,
//       product_name: true,
//       product_brand: true,
//       product_uom: true,
//       image_url: true,
//     },
//   });

//   const result: Record<string, ProductForCheckout> = {};

//   for (const p of productsRaw as any[]) {
//     const sku = String(p.product_sku ?? "");

//     result[sku] = {
//       id: Number(p.product_id),
//       sku,
//       name: p.product_name ?? sku,
//       brand: p.product_brand ?? null,
//       image_url: p.image_url ?? null,
//       uom_default: p.product_uom ?? null,
//     };
//   }

//   return result;
// }

// v.1.1.3 ================================================================

// v.1.1.2 ================================================================
// // src/services/checkout/checkout.query.ts

// import {
//   prismaShop,
//   prismaInterlink,
//   setShopSessionTZ,
//   setInterlinkSessionTZ,
// } from "@/lib/db";
// import {
//   CURRENT_EVENT_SALE,
//   mapCartRowToCartItem,
// } from "@/services/cart/cart.helpers";
// import type { CartItem } from "@/types/cart";
// import type { ProductForCheckout } from "@/types/checkout";

// /**
//  * ดึง carts เฉพาะ:
//  * - ลูกค้าคนนี้
//  * - cart_status = 0
//  * - reserve = 0
//  * - check_product = true
//  * - event_sale = CURRENT_EVENT_SALE
//  */
// export async function fetchSelectedCartItems(
//   customerId: number
// ): Promise<CartItem[]> {
//   await setShopSessionTZ();

//   const rows = await prismaShop.carts.findMany({
//     where: {
//       id__customers: BigInt(customerId),
//       cart_status: 0,
//       reserve: 0,
//       check_product: true,
//       event_sale: CURRENT_EVENT_SALE as any,
//     },
//     orderBy: { id: "asc" },
//   });

//   return rows.map((row: any) => mapCartRowToCartItem(row));
// }

// /**
//  * ดึงข้อมูลสินค้า products_clearance จาก SKU (product_sku)
//  * คืนค่าเป็น map[sku] = ProductForCheckout
//  */
// export async function fetchProductsForCart(
//   skus: string[]
// ): Promise<Record<string, ProductForCheckout>> {
//   if (!skus.length) return {};

//   // กัน duplicate SKU เฉย ๆ
//   const uniqueSkus = Array.from(new Set(skus));

//   await setInterlinkSessionTZ();

//   const productsRaw = await prismaInterlink.products_clearance.findMany({
//   where: {
//     product_sku: {
//       in: skus,
//     },
//   },
//   select: {
//     product_id: true,
//     product_sku: true,
//     product_name: true,
//     brand_name: true,
//     brand: true,
//     image_url: true,
//     uom: true,
//     uom_default: true,
//   },
// });


//   const result: Record<string, ProductForCheckout> = {};

//   for (const p of productsRaw as any[]) {
//     const sku = String(p.product_sku);

//     result[sku] = {
//       id: Number(p.product_id ?? p.id ?? 0),
//       sku,
//       name: p.product_name ?? p.name ?? sku,
//       brand: p.brand_name ?? p.brand ?? null,
//       image_url: p.image_url ?? null,
//       uom_default: p.uom ?? p.uom_default ?? null,
//     };
//   }

//   return result;
// }

// v.1.1.2 ================================================================

// // src/services/checkout/checkout.query.ts

// import {
//   prismaShop,
//   prismaInterlink,
//   setShopSessionTZ,
//   setInterlinkSessionTZ,
// } from "@/lib/db";
// import { CURRENT_EVENT_SALE, mapCartRowToCartItem } from "@/services/cart/cart.helpers";
// import type { CartItem } from "@/types/cart";
// import type { ProductForCheckout } from "@/types/checkout";

// /**
//  * ดึง carts เฉพาะ:
//  * - ลูกค้าคนนี้
//  * - cart_status = 0
//  * - reserve = 0
//  * - check_product = true
//  * - event_sale = CURRENT_EVENT_SALE
//  */
// export async function fetchSelectedCartItems(
//   customerId: number
// ): Promise<CartItem[]> {
//   await setShopSessionTZ();

//   const rows = await prismaShop.carts.findMany({
//     where: {
//       id__customers: BigInt(customerId),
//       cart_status: 0,
//       reserve: 0,
//       check_product: true,
//       event_sale: CURRENT_EVENT_SALE as any,
//     },
//     orderBy: { id: "asc" },
//   });

//   return rows.map((row: any) => mapCartRowToCartItem(row));
// }

// /**
//  * ดึงข้อมูลสินค้า products_clearance จาก SKU (product_sku)
//  * คืนค่าเป็น map[sku] = ProductForCheckout
//  */
// export async function fetchProductsForCart(
//   skus: string[]
// ): Promise<Record<string, ProductForCheckout>> {
//   if (!skus.length) return {};

//   await setInterlinkSessionTZ();

//   const productsRaw = await prismaInterlink.products_clearance.findMany({
//     where: {
//       product_sku: {
//         in: skus,
//       },
//     },
//   });

//   const result: Record<string, ProductForCheckout> = {};
//   for (const p of productsRaw as any[]) {
//     const sku = String(p.product_sku);
//     result[sku] = {
//       id: Number(p.product_id ?? p.id ?? 0),
//       sku,
//       name: p.product_name ?? p.name ?? sku,
//       brand: p.brand_name ?? p.brand ?? null,
//       image_url: p.image_url ?? null,
//       uom_default: p.uom ?? p.uom_default ?? null,
//     };
//   }

//   return result;
// }

// v.1.1.8 ================================================================
// src/services/checkout/checkout.query.ts

import {
  prismaShop,
  prismaInterlink,
  setShopSessionTZ,
  setInterlinkSessionTZ,
} from "@/lib/db";

import type { CartItem } from "@/types/cart";
import type { ProductForCheckout } from "@/types/checkout";

// ✅ reuse helper/constant จาก cart module
import {
  CURRENT_EVENT_SALE,
  mapCartRowToCartItem,
} from "@/services/cart/cart.helpers";

/* ======================================================
 * 1) Cart Queries (DB: shop)
 * ====================================================== */

/**
 * ดึงรายการ cart ที่ “พร้อมสำหรับ checkout” ของลูกค้าคนหนึ่ง
 * - cart_status = 0
 * - reserve = 0 (ตะกร้าปกติ)
 * - event_sale = CURRENT_EVENT_SALE (เช่น clearance-2025)
 * - check_product = true (เฉพาะรายการที่ติ๊กเลือก)
 */
export async function getCartItemsForCheckout(
  customerId: number | bigint
): Promise<CartItem[]> {
  await setShopSessionTZ();

  const cid = BigInt(customerId);

  console.log("----------------------------------------------------");
  console.log("[checkout.query] START getCartItemsForCheckout", cid);
  console.log("----------------------------------------------------");

  const rows = await prismaShop.carts.findMany({
    where: {
      id__customers: cid,
      cart_status: 0,
      reserve: 0,
      event_sale: CURRENT_EVENT_SALE as any,
      check_product: true,
    },
    orderBy: { id: "asc" },
  });

  console.log("[checkout.query] cart rows =", rows.length);
  if (rows.length > 0) {
    console.log("[checkout.query] cart sample =", rows[0]);
  }

  // แปลงเป็น CartItem type กลาง
  const items = rows.map((row) => mapCartRowToCartItem(row as any));

  return items;
}

/* ======================================================
 * 2) Product Queries (DB: interlink / products_clearance)
 * ====================================================== */

/**
 * ดึงข้อมูลสินค้าเพื่อใช้แสดงในหน้า checkout จากตาราง products_clearance
 * โดยอิงจาก SKUs ที่อยู่ใน cart
 */
export async function getProductsForCheckout(
  skus: string[]
): Promise<ProductForCheckout[]> {
  if (!skus.length) return [];

  await setInterlinkSessionTZ();

  console.log("[checkout.query] getProductsForCheckout skus =", skus);

  const productsRaw = await prismaInterlink.products_clearance.findMany({
    where: {
      product_sku: { in: skus },
    },
    select: {
      product_id: true,
      product_sku: true,
      product_name: true,
      product_brand: true,
      product_uom: true,
      product_price: true,
      discount_label: true,
      category_id: true,
      clearanceSales: true,
      clearanceQuantity: true,
      free_shipping_eligible: true,
      free_ship_minimum: true,
      warranty_months: true,
      return_days: true,
    },
  });

  console.log("[checkout.query] found products =", productsRaw.length);

  const result: ProductForCheckout[] = [];

  // ✅ import helper ทีเดียวก่อนลูป (ไม่ต้อง import ซ้ำในแต่ละสินค้า)
  const { getProductImageUrl } = await import("@/lib/image-path");

  for (const p of productsRaw) {
    const pid = Number(p.product_id);
    const pSku = String(p.product_sku ?? "");

    const imageUrl = await getProductImageUrl(pid);

    console.log("[checkout.query] imgPath", {
      product_sku: p.product_sku,
      product_id: pid,
      url: imageUrl,
    });

    result.push({
      id: pid,
      sku: pSku,
      name: p.product_name ?? "",
      brand: p.product_brand ?? null,
      image_url: imageUrl ?? null,
      uom_default: p.product_uom ?? null,

      originalPrice:
        p.product_price != null ? Number(p.product_price) : null,
      discountLabel: p.discount_label ?? null,
      clearanceSales: p.clearanceSales ?? null,
      clearanceQuantity:
        p.clearanceQuantity != null ? Number(p.clearanceQuantity) : null,
      freeShippingEligible: p.free_shipping_eligible ?? null,
      freeShipMinimum:
        p.free_ship_minimum != null ? Number(p.free_ship_minimum) : null,
      warrantyMonths:
        p.warranty_months != null ? Number(p.warranty_months) : null,
      returnDays: p.return_days != null ? Number(p.return_days) : null,

      // ยังไม่ต่อ conditions ใน version นี้
      conditions: null,
    });
  }

  if (result.length > 0) {
    console.log("[checkout.query] product sample =", result[0]);
  }

  return result;
}

/* ======================================================
 * 3) Helper รวม cart + product
 * ====================================================== */

export async function getCartAndProductsForCheckout(
  customerId: number | bigint
): Promise<{
  cartItems: CartItem[];
  products: ProductForCheckout[];
}> {
  console.log("----------------------------------------------------");
  console.log(
    "[checkout.query] START getCartAndProductsForCheckout cid =",
    BigInt(customerId)
  );
  console.log("----------------------------------------------------");

  const cartItems = await getCartItemsForCheckout(customerId);

  const skus = Array.from(
    new Set(
      cartItems
        .map((c: any) => c.product)
        .filter((sku) => sku != null)
        .map(String)
    )
  );

  console.log("[checkout.query] extracted SKUs =", skus);

  const products = await getProductsForCheckout(skus);

  console.log("[checkout.query] FINAL cartItems =", cartItems.length);
  console.log("[checkout.query] FINAL products =", products.length);

  return { cartItems, products };
}

// v.1.1.8 ================================================================

// v.1.1.7 ================================================================
// // src/services/checkout/checkout.query.ts

// import {
//   prismaShop,
//   prismaInterlink,
//   setShopSessionTZ,
//   setInterlinkSessionTZ,
// } from "@/lib/db";

// import type { CartItem } from "@/types/cart";
// import type { ProductForCheckout } from "@/types/checkout";

// // ✅ reuse helper/constant จาก cart module
// import {
//   CURRENT_EVENT_SALE,
//   mapCartRowToCartItem,
// } from "@/services/cart/cart.helpers";

// /* ======================================================
//  * 1) Cart Queries (DB: shop)
//  * ====================================================== */

// /**
//  * ดึงรายการ cart ที่ “พร้อมสำหรับ checkout” ของลูกค้าคนหนึ่ง
//  * - cart_status = 0
//  * - reserve = 0 (ตะกร้าปกติ)
//  * - event_sale = CURRENT_EVENT_SALE (เช่น clearance-2025)
//  * - check_product = true (เฉพาะรายการที่ติ๊กเลือก)
//  */
// export async function getCartItemsForCheckout(
//   customerId: number | bigint
// ): Promise<CartItem[]> {
//   await setShopSessionTZ();

//   const cid = BigInt(customerId);

//   console.log(
//     "----------------------------------------------------"
//   );
//   console.log(
//     "[checkout.query] START getCartItemsForCheckout",
//     cid
//   );
//   console.log(
//     "----------------------------------------------------"
//   );

//   const rows = await prismaShop.carts.findMany({
//     where: {
//       id__customers: cid,
//       cart_status: 0,
//       reserve: 0,
//       event_sale: CURRENT_EVENT_SALE as any,
//       check_product: true,
//     },
//     orderBy: { id: "asc" },
//   });

//   console.log("[checkout.query] cart rows =", rows.length);
//   if (rows.length > 0) {
//     console.log("[checkout.query] cart sample =", rows[0]);
//   }

//   // แปลงเป็น CartItem type กลาง
//   const items = rows.map((row) => mapCartRowToCartItem(row as any));

//   return items;
// }

// /* ======================================================
//  * 2) Product Queries (DB: interlink / products_clearance)
//  * ====================================================== */

// /**
//  * ดึงข้อมูลสินค้าเพื่อใช้แสดงในหน้า checkout จากตาราง products_clearance
//  * โดยอิงจาก SKUs ที่อยู่ใน cart
//  */
// export async function getProductsForCheckout(
//   skus: string[]
// ): Promise<ProductForCheckout[]> {
//   if (!skus.length) return [];

//   await setInterlinkSessionTZ();

//   console.log("[checkout.query] getProductsForCheckout skus =", skus);

//   const productsRaw = await prismaInterlink.products_clearance.findMany({
//     where: {
//       product_sku: { in: skus },
//     },
//     select: {
//       product_id: true,
//       product_sku: true,
//       product_name: true,
//       product_brand: true,
//       product_uom: true,
//       product_price: true,
//       discount_label: true,
//       category_id: true,
//       clearanceSales: true,
//       clearanceQuantity: true,
//       free_shipping_eligible: true,
//       free_ship_minimum: true,
//       warranty_months: true,
//       return_days: true,
//     },
//   });

//   console.log(
//     "[checkout.query] found products =",
//     productsRaw.length
//   );

//   // ถ้ามีตาราง conditions ก็สามารถ join เพิ่มตรงนี้ (ตอนนี้ยังไม่ดึง)
//   const result: ProductForCheckout[] = [];

//   for (const p of productsRaw) {
//     const pid = Number(p.product_id);
//     const pSku = String(p.product_sku ?? "");

//     // ถ้ามี image helper (จาก lib/image-path) ให้ใช้เหมือน /api/cart/list
//     // ตอนนี้ขอ import แบบ lazy เพื่อกัน circular
//     const { getProductImageUrl } = await import("@/lib/image-path");
//     const imageUrl = await getProductImageUrl(pid);

//     console.log("[checkout.query] imgPath", {
//       product_sku: p.product_sku,
//       product_id: pid,
//       url: imageUrl,
//     });

//     result.push({
//       id: pid,
//       sku: pSku,
//       name: p.product_name ?? "",
//       brand: p.product_brand ?? null,
//       image_url: imageUrl ?? null,
//       uom_default: p.product_uom ?? null,

//       originalPrice:
//         p.product_price != null ? Number(p.product_price) : null,
//       discountLabel: p.discount_label ?? null,
//       clearanceSales: p.clearanceSales ?? null,
//       clearanceQuantity:
//         p.clearanceQuantity != null
//           ? Number(p.clearanceQuantity)
//           : null,
//       freeShippingEligible: p.free_shipping_eligible ?? null,
//       freeShipMinimum:
//         p.free_ship_minimum != null
//           ? Number(p.free_ship_minimum)
//           : null,
//       warrantyMonths:
//         p.warranty_months != null ? Number(p.warranty_months) : null,
//       returnDays:
//         p.return_days != null ? Number(p.return_days) : null,
//       // ยังไม่ต่อ conditions ใน version นี้
//       conditions: null,
//     });
//   }

//   if (result.length > 0) {
//     console.log(
//       "[checkout.query] product sample =",
//       result[0]
//     );
//   }

//   return result;
// }

// /* ======================================================
//  * 3) Helper รวม cart + product
//  * ====================================================== */

// export async function getCartAndProductsForCheckout(
//   customerId: number | bigint
// ): Promise<{
//   cartItems: CartItem[];
//   products: ProductForCheckout[];
// }> {
//   console.log(
//     "----------------------------------------------------"
//   );
//   console.log(
//     "[checkout.query] START getCartAndProductsForCheckout cid =",
//     BigInt(customerId)
//   );
//   console.log(
//     "----------------------------------------------------"
//   );

//   const cartItems = await getCartItemsForCheckout(customerId);

//   const skus = Array.from(
//     new Set(
//       cartItems
//         .map((c: any) => c.product)
//         .filter((sku) => sku != null)
//         .map(String)
//     )
//   );

//   console.log(
//     "[checkout.query] extracted SKUs =",
//     skus
//   );

//   const products = await getProductsForCheckout(skus);

//   console.log("[checkout.query] FINAL cartItems =", cartItems.length);
//   console.log("[checkout.query] FINAL products =", products.length);

//   return { cartItems, products };
// }

// v.1.1.7 ================================================================

// v.1.1.6 ================================================================
// // src/services/checkout/checkout.query.ts

// import {
//   prismaShop,
//   prismaInterlink,
//   setShopSessionTZ,
//   setInterlinkSessionTZ,
// } from "@/lib/db";

// import type { CartItem } from "@/types/cart";
// import type { ProductForCheckout } from "@/types/checkout";
// import { mapCartRowToCartItem } from "@/services/cart/cart.helpers";
// import { getProductImageUrl } from "@/lib/image-path";

// /* ======================================================
//  * 1) Cart Queries
//  * ====================================================== */

// export async function getCartItemsForCheckout(
//   customerId: number | bigint
// ): Promise<CartItem[]> {
//   console.log("\n----------------------------------------------------");
//   console.log("[checkout.query] START getCartItemsForCheckout", customerId);
//   console.log("----------------------------------------------------\n");

//   await setShopSessionTZ();

//   const rows = await prismaShop.carts.findMany({
//     where: {
//       id__customers: BigInt(customerId),
//       cart_status: 0,
//       reserve: 0,
//     },
//     orderBy: { id: "asc" },
//   });

//   console.log("[checkout.query] cart rows =", rows.length);
//   if (rows.length > 0) console.log("[checkout.query] cart sample =", rows[0]);

//   return rows.map(mapCartRowToCartItem);
// }

// /* ======================================================
//  * 2) Product + Conditions Queries
//  * (เหมือน logic ใน /api/cart/list)
//  * ====================================================== */

// const parseNumberList = (raw?: string | null): number[] => {
//   if (!raw) return [];
//   return String(raw)
//     .split(";")
//     .map((s) => s.trim())
//     .filter((s) => s.length > 0)
//     .map((s) => Number(s))
//     .filter((n) => Number.isFinite(n));
// };

// export async function getProductsForCheckout(
//   skus: string[]
// ): Promise<ProductForCheckout[]> {
//   console.log("[checkout.query] getProductsForCheckout skus =", skus);

//   if (!skus.length) {
//     console.log("[checkout.query] skus empty → return []");
//     return [];
//   }

//   await setInterlinkSessionTZ();

//   const products = await prismaInterlink.products_clearance.findMany({
//     where: { product_sku: { in: skus } },
//     select: {
//       product_id: true,
//       product_sku: true,
//       product_name: true,
//       product_uom: true,
//       product_brand: true,
//       product_price: true,
//       discount_label: true,
//       category_id: true,
//       clearanceSales: true,
//       clearanceQuantity: true,
//       free_shipping_eligible: true,
//       free_ship_minimum: true,
//       warranty_months: true,
//       return_days: true,
//     },
//   });

//   console.log("[checkout.query] found products =", products.length);

//   const productIdKeys = products
//     .map((p) => p.product_id)
//     .filter((id) => id != null) as number[];

//   // load conditions
//   const productConditions =
//     productIdKeys.length > 0
//       ? await prismaInterlink.product_conditions.findMany({
//           where: { pro_id: { in: productIdKeys } },
//         })
//       : [];

//   const conditionsByProductId = new Map<string, any[]>();

//   for (const cond of productConditions) {
//     const pidKey = String(cond.pro_id);
//     const lengths = parseNumberList(cond.minimum_length);
//     const stocks = parseNumberList(cond.num_stock);
//     const steps = parseNumberList(cond.cut_steps);
//     const unit = cond.units_system ?? "M.";

//     let converted: any;

//     if ((cond.sales_type ?? "").toUpperCase() === "ROLL") {
//       converted = {
//         type: "ROLL",
//         unit,
//         rollPairs: lengths.map((len, idx) => ({
//           length: len,
//           stock: stocks[idx] ?? null,
//         })),
//         raw: cond,
//       };
//     } else {
//       converted = {
//         type: "CUT",
//         unit,
//         minimumLength: lengths[0] ?? null,
//         stepOptions: steps,
//         raw: cond,
//       };
//     }

//     if (!conditionsByProductId.has(pidKey)) {
//       conditionsByProductId.set(pidKey, []);
//     }
//     conditionsByProductId.get(pidKey)!.push(converted);
//   }

//   // compose final products
//   const result: ProductForCheckout[] = [];
//   for (const p of products) {
//     const pid = Number(p.product_id);
//     const pidKey = String(p.product_id);

//     const imageUrl = await getProductImageUrl(pid);

//     console.log("[checkout.query] imgPath", {
//       product_sku: p.product_sku,
//       product_id: pid,
//       url: imageUrl,
//     });

//     result.push({
//       id: pid,
//       sku: p.product_sku ?? "",
//       name: p.product_name ?? "",
//       brand: p.product_brand ?? null,
//       image_url: imageUrl ?? null,
//       uom_default: p.product_uom ?? null,
//       categoryId: p.category_id != null ? Number(p.category_id) : null,
//       originalPrice:
//         p.product_price != null ? Number(p.product_price) : null,
//       discountLabel: p.discount_label ?? null,
//       clearanceSales: p.clearanceSales ?? null,
//       clearanceQuantity:
//         p.clearanceQuantity != null ? Number(p.clearanceQuantity) : null,
//       freeShippingEligible: p.free_shipping_eligible ?? null,
//       freeShipMinimum:
//         p.free_ship_minimum != null
//           ? Number(p.free_ship_minimum)
//           : null,
//       warrantyMonths:
//         p.warranty_months != null ? Number(p.warranty_months) : null,
//       returnDays: p.return_days != null ? Number(p.return_days) : null,
//       conditions: conditionsByProductId.get(pidKey) ?? null,
//     });
//   }

//   if (result.length > 0) {
//     console.log("[checkout.query] product sample =", result[0]);
//   }

//   return result;
// }

// /* ======================================================
//  * 3) Combine cart + products
//  * ====================================================== */

// export async function getCartAndProductsForCheckout(customerId: number | bigint) {
//   console.log("\n----------------------------------------------------");
//   console.log("[checkout.query] START getCartAndProductsForCheckout cid =", customerId);
//   console.log("----------------------------------------------------");

//   const cartItems = await getCartItemsForCheckout(customerId);

//   const skus = Array.from(new Set(cartItems.map((c) => c.product))).filter(
//     Boolean
//   );

//   console.log("[checkout.query] extracted SKUs =", skus);

//   const products = await getProductsForCheckout(skus);

//   console.log("[checkout.query] FINAL cartItems =", cartItems.length);
//   console.log("[checkout.query] FINAL products =", products.length);

//   return { cartItems, products };
// }

// v.1.1.6 ================================================================

// v.1.1.5 ================================================================
// // src/services/checkout/checkout.query.ts

// import {
//   prismaShop,
//   prismaInterlink,
//   setShopSessionTZ,
//   setInterlinkSessionTZ,
// } from "@/lib/db";

// import type { CartItem } from "@/types/cart";
// import type { ProductForCheckout } from "@/types/checkout";

// /* ======================================================
//  * 1) Cart Queries (DB: shop)
//  * ====================================================== */

// /**
//  * ดึงรายการ cart ที่ “พร้อมสำหรับ checkout” ของลูกค้าคนหนึ่ง
//  */
// export async function getCartItemsForCheckout(
//   customerId: number | bigint
// ): Promise<CartItem[]> {
//   console.log("[checkout.query] getCartItemsForCheckout → customerId =", customerId);

//   await setShopSessionTZ();

//   const rows = await prismaShop.carts.findMany({
//     where: {
//       id__customers: BigInt(customerId),
//       cart_status: 0,
//     },
//     orderBy: { id: "asc" },
//   });

//   console.log("[checkout.query] cart rows =", rows.length, "sample =", rows[0]);

//   return rows as unknown as CartItem[];
// }

// /* ======================================================
//  * 2) Product Queries (DB: interlink / products_clearance)
//  * ====================================================== */

// /**
//  * ดึงข้อมูลสินค้าเพื่อใช้แสดงในหน้า checkout จากตาราง products_clearance
//  */
// export async function getProductsForCheckout(
//   productIds: Array<number | bigint>
// ): Promise<ProductForCheckout[]> {
//   console.log("[checkout.query] getProductsForCheckout productIds =", productIds);

//   if (!productIds.length) {
//     console.log("[checkout.query] ไม่มี productIds → ส่ง []");
//     return [];
//   }

//   await setInterlinkSessionTZ();

//   // convert ids → BigInt
//   const idsAsBigInt = productIds.map((id) => BigInt(id));

//   console.log("[checkout.query] idsAsBigInt =", idsAsBigInt);

//   // PK ใช้ field ชื่ออะไรใน prisma?
//   const where: any = {
//     id: { in: idsAsBigInt },
//   };

//   console.log("[checkout.query] products where filter =", where);

//   const rows = await prismaInterlink.products_clearance.findMany({
//     where,
//   });

//   console.log("[checkout.query] products rows =", rows.length, "sample =", rows[0]);

//   const products: ProductForCheckout[] = rows.map((row: any) => ({
//     id: Number(row.id),
//     sku: row.sku ?? row.product_sku ?? row.product_code ?? "",
//     name: row.name ?? row.product_name ?? row.product ?? "",
//     brand: row.brand ?? row.brand_name ?? null,
//     image_url:
//       row.image_url ??
//       row.image ??
//       row.product_image ??
//       null,
//     uom_default: row.uom_default ?? row.uom ?? null,
//   }));

//   console.log("[checkout.query] products final mapped =", products.length, "sample =", products[0]);

//   return products;
// }

// /* ======================================================
//  * 3) Helper รวม cart + product (optional)
//  * ====================================================== */

// /**
//  * ดึง cart + products ทีเดียว แล้วคืนแยกเป็น 2 ก้อน
//  * ให้ checkout.service เอาไป join ต่อ
//  */
// export async function getCartAndProductsForCheckout(
//   customerId: number | bigint
// ): Promise<{
//   cartItems: CartItem[];
//   products: ProductForCheckout[];
// }> {
//   console.log("----------------------------------------------------");
//   console.log("[checkout.query] START getCartAndProductsForCheckout cid =", customerId);
//   console.log("----------------------------------------------------");

//   const cartItems = await getCartItemsForCheckout(customerId);

//   const productIds = Array.from(
//     new Set(
//       cartItems
//         .map((c: any) => c.id__products_clearance ?? c.productId ?? c.product_id)
//         .filter((id) => id != null)
//     )
//   ) as Array<number | bigint>;

//   console.log("[checkout.query] extracted productIds =", productIds);

//   const products = await getProductsForCheckout(productIds);

//   console.log("[checkout.query] FINAL cartItems =", cartItems.length);
//   console.log("[checkout.query] FINAL products =", products.length);

//   return { cartItems, products };
// }

// v.1.1.5 ================================================================

// v.1.1.4 ================================================================
// // src/services/checkout/checkout.query.ts

// import {
//   prismaShop,
//   prismaInterlink,
//   setShopSessionTZ,
//   setInterlinkSessionTZ,
// } from "@/lib/db";

// import type { CartItem } from "@/types/cart";
// import type { ProductForCheckout } from "@/types/checkout";

// /* ======================================================
//  * 1) Cart Queries (DB: shop)
//  * ====================================================== */

// /**
//  * ดึงรายการ cart ที่ “พร้อมสำหรับ checkout” ของลูกค้าคนหนึ่ง
//  */
// export async function getCartItemsForCheckout(
//   customerId: number | bigint
// ): Promise<CartItem[]> {
//   await setShopSessionTZ();

//   const rows = await prismaShop.carts.findMany({
//     where: {
//       id__customers: BigInt(customerId),
//       cart_status: 0,
//       // ถ้ามี field สำหรับเลือกสินค้า เช่น check_product = true
//       // สามารถเติมตรงนี้ภายหลังได้
//       // check_product: true,
//     },
//     orderBy: { id: "asc" },
//   });

//   return rows as unknown as CartItem[];
// }

// /* ======================================================
//  * 2) Product Queries (DB: interlink / products_clearance)
//  * ====================================================== */

// /**
//  * ดึงข้อมูลสินค้าเพื่อใช้แสดงในหน้า checkout จากตาราง products_clearance
//  */
// export async function getProductsForCheckout(
//   productIds: Array<number | bigint>
// ): Promise<ProductForCheckout[]> {
//   if (!productIds.length) return [];

//   await setInterlinkSessionTZ();

//   const idsAsBigInt = productIds.map((id) => BigInt(id));

//   // ให้ where เป็น any เพื่อไม่ให้ TS ฟ้องเรื่องชื่อ column
//   const where: any = {
//     // ถ้าใน Prisma model ของคุณ field PK ไม่ได้ชื่อ id
//     // ให้มาแก้ตรงนี้ภายหลัง เช่น:
//     // id__products_clearance: { in: idsAsBigInt },
//     id: { in: idsAsBigInt },
//   };

//   const rows = await prismaInterlink.products_clearance.findMany({
//     where,
//   });

//   const products: ProductForCheckout[] = rows.map((row: any) => ({
//     id: Number(row.id),
//     sku: row.sku ?? row.product_sku ?? row.product_code ?? "",
//     name: row.name ?? row.product_name ?? row.product ?? "",
//     brand: row.brand ?? row.brand_name ?? null,
//     image_url:
//       row.image_url ??
//       row.image ??
//       row.product_image ??
//       null,
//     uom_default: row.uom_default ?? row.uom ?? null,
//   }));

//   return products;
// }

// /* ======================================================
//  * 3) Helper รวม cart + product (optional)
//  * ====================================================== */

// /**
//  * ดึง cart + products ทีเดียว แล้วคืนแยกเป็น 2 ก้อน
//  * ให้ checkout.service เอาไป join ต่อ
//  */
// export async function getCartAndProductsForCheckout(
//   customerId: number | bigint
// ): Promise<{
//   cartItems: CartItem[];
//   products: ProductForCheckout[];
// }> {
//   const cartItems = await getCartItemsForCheckout(customerId);

//   const productIds = Array.from(
//     new Set(
//       cartItems
//         .map((c: any) => c.id__products_clearance ?? c.productId)
//         .filter((id) => id != null)
//     )
//   ) as Array<number | bigint>;

//   const products = await getProductsForCheckout(productIds);

//   return { cartItems, products };
// }

// v.1.1.4 ================================================================

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

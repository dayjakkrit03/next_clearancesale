// v.1.1.4 ======================================================================
// src/services/cart/cart.service.ts

import type {
  AddToCartRequest,
  AddToCartResponse,
  EventSaleType,
} from "@/types/cart";
import { CURRENT_EVENT_SALE, normalizeQuantity } from "./cart.helpers";
import {
  getLocationCodeForProductSku,
  getTotalLockOrder,
  getTotalYouLockOrder,
} from "./cart.query";
import { upsertCartItem, clearExpiredLockOrders } from "./cart.crud";
import {
  prismaShop,
  prismaInterlink,
  setShopSessionTZ,
  setInterlinkSessionTZ,
} from "@/lib/db";

/* ================================
 *  Navision token / config
 * ================================ */

const NAVISION_HOST_KEY = process.env.NAVISION_HOST_KEY ?? "prod";
const NAVISION_BASE_URL =
  process.env.NAVISION_BASE_URL ?? "http://navision.interlink.co.th:8084";
const NAVISION_USERNAME = process.env.NAVISION_USERNAME ?? "";
const NAVISION_PASSWORD = process.env.NAVISION_PASSWORD ?? "";

/**
 * อ่านหรือสร้าง Navision token (เหมือน Laravel ServiceController::__construct)
 */
async function getNavisionAuthHeader(): Promise<Record<string, string>> {
  await setShopSessionTZ();

  const nowSec = Math.floor(Date.now() / 1000);

  const existing = await prismaShop.navisions.findFirst({
    where: { host: NAVISION_HOST_KEY },
  });

  if (existing && Number(existing.exp) >= nowSec && existing.token) {
    return { Authorization: `Bearer ${existing.token}` };
  }

  if (!NAVISION_USERNAME || !NAVISION_PASSWORD) {
    throw new Error(
      "[cart.service] NAVISION_USERNAME or NAVISION_PASSWORD missing",
    );
  }

  const tokenUrl = `${NAVISION_BASE_URL}/token`;

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "password",
      username: NAVISION_USERNAME,
      password: NAVISION_PASSWORD,
    }),
  });

  if (!res.ok) {
    throw new Error(
      `[cart.service] Navision token fetch failed: ${res.status} ${res.statusText}`,
    );
  }

  const json = (await res.json()) as { access_token: string };

  const expSec = nowSec + 1036800; // 12 days
  const expBigInt = BigInt(expSec);

  // update/create by id
  if (existing) {
    await prismaShop.navisions.update({
      where: { id: existing.id },
      data: {
        token: json.access_token,
        exp: expBigInt,
        updated_at: new Date(),
      },
    });
  } else {
    await prismaShop.navisions.create({
      data: {
        host: NAVISION_HOST_KEY,
        token: json.access_token,
        exp: expBigInt,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  return { Authorization: `Bearer ${json.access_token}` };
}

/* ================================
 *  Check Item Availability
 * ================================ */

/**
 * เทียบเท่า Laravel: ItemAvail2()
 *
 * • ยิง Navision → rawStock
 * • อัปเดต interlink.products_clearance.clearanceQuantity = rawStock
 * • เคลียร์ lock timeout
 * • คำนวณ inventories สำหรับ “ลูกค้าปัจจุบัน”
 */
async function checkItemAvail2(params: {
  product: string;
  uom: string;
  customerId: number | null;
}): Promise<number> {
  const { product, uom, customerId } = params;

  // หา location code จาก discountpercentage_clearance_tb
  const locationCode = await getLocationCodeForProductSku(product);
  if (!locationCode) {
    return 0;
  }

  const headers = await getNavisionAuthHeader();

  const url = `${NAVISION_BASE_URL}/api/NAV/ItemAvail?No=${encodeURIComponent(
    product,
  )}&locationCode=${encodeURIComponent(
    locationCode,
  )}&UOM=${encodeURIComponent(uom)}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      headers,
    });
  } catch (err) {
    console.error("[cart.service] Navision fetch failed", err);
    // ถ้าเรียก Navision ไม่ได้ ให้ถือว่าไม่มีของ (กันไม่ให้ /api/cart/add ตาย 500)
    return 0;
  }

  if (!res.ok) {
    console.error(
      "[cart.service] Navision response not ok",
      res.status,
      res.statusText,
    );
    return 0;
  }

  const json = await res.json();
  const rawStock = Number(json);

  if (!Number.isFinite(rawStock)) {
    return 0;
  }

  await clearExpiredLockOrders(locationCode);

  const totalLock = await getTotalLockOrder({
    sku: product,
    uom,
    location: locationCode,
  });

  const yourLock =
    customerId != null
      ? await getTotalYouLockOrder({
          sku: product,
          uom,
          location: locationCode,
          customerId,
        })
      : 0;

  const inventories = rawStock - totalLock + yourLock;
  const finalInventories = inventories > 0 ? inventories : 0;

  try {
    await setInterlinkSessionTZ();
    await prismaInterlink.products_clearance.updateMany({
      where: { product_sku: product },
      data: { clearanceQuantity: finalInventories },
    });
  } catch (e) {
    console.error(
      "[cart.service] Failed to update products_clearance.clearanceQuantity",
      e,
    );
  }

  return finalInventories;
}

/**
 * debug ใช้สำหรับ API /api/debug/cart/check
 */
export async function debugCheckItemAvail2(params: {
  product: string;
  uom: string;
  customerId: number | null;
}) {
  return checkItemAvail2(params);
}

/* ================================
 *  Add To Cart Service
 * ================================ */

export async function addToCartService(params: {
  customerId: number | null;
  payload: AddToCartRequest;
  eventSale?: EventSaleType;
}): Promise<AddToCartResponse> {
  const { customerId, payload, eventSale = CURRENT_EVENT_SALE } = params;
  const { product, uom, quantity, price } = payload;

  const qty = normalizeQuantity(quantity);

  if (qty <= 0) {
    return { status: "sold-out" };
  }

  const itemAvail = await checkItemAvail2({
    product,
    uom,
    customerId,
  });

  if (itemAvail >= qty) {
    if (!customerId) {
      return { status: "login" };
    }

    await upsertCartItem({
      customerId,
      product,
      quantity: qty,
      uom,
      price,
      eventSale,
      reserve: 0,
    });

    return { status: "success" };
  }

  if (itemAvail > 0) {
    return {
      status: "less-left",
      itemAvail,
    };
  }

  return { status: "sold-out" };
}

/* ================================
 *  Cart Summary
 * ================================ */

export async function getCartSummary(customerId: number | null) {
  if (!customerId) {
    return {
      // จำนวน "รายการสินค้า" (แถวในตะกร้า)
      totalQuantity: 0,
      // ยอดรวมราคาสินค้าทั้งหมด
      totalAmount: 0,
    };
  }

  await setShopSessionTZ();

  const rows = await prismaShop.carts.findMany({
    where: {
      id__customers: BigInt(customerId),
      cart_status: 0,
      reserve: 0,                 // ✅ เฉพาะตะกร้าปกติ
      event_sale: CURRENT_EVENT_SALE as any, // ✅ เฉพาะ clearance-2025
    },
    select: {
      price_amount: true,
    },
  });

  // ✅ จำนวนแถวในตะกร้า (จำนวนสินค้า ไม่สน quantity ในแต่ละแถว)
  const totalQuantity = rows.length;

  // ✅ ยอดรวมราคาทั้งหมด (ใช้ price_amount จาก DB)
  const totalAmount = rows.reduce(
    (sum, r) => sum + Number(r.price_amount ?? 0),
    0,
  );

  return {
    totalQuantity,
    totalAmount,
  };
}



// v.1.1.4 ======================================================================

// v.1.1.3 ======================================================================
// // src/services/cart/cart.service.ts

// import type { AddToCartRequest, AddToCartResponse, EventSaleType } from "@/types/cart";
// import { CURRENT_EVENT_SALE, normalizeQuantity } from "./cart.helpers";
// import {
//   getLocationCodeForProductSku,
//   getTotalLockOrder,
//   getTotalYouLockOrder,
// } from "./cart.query";
// import { upsertCartItem, clearExpiredLockOrders } from "./cart.crud";
// import {
//   prismaShop,
//   prismaInterlink,
//   setShopSessionTZ,
//   setInterlinkSessionTZ,
// } from "@/lib/db";

// /* ================================
//  *  Navision token / config
//  * ================================ */

// const NAVISION_HOST_KEY = process.env.NAVISION_HOST_KEY ?? "prod";
// const NAVISION_BASE_URL =
//   process.env.NAVISION_BASE_URL ?? "http://navision.interlink.co.th:8084";
// const NAVISION_USERNAME = process.env.NAVISION_USERNAME ?? "";
// const NAVISION_PASSWORD = process.env.NAVISION_PASSWORD ?? "";

// /**
//  * อ่านหรือสร้าง Navision token (เหมือน Laravel ServiceController::__construct)
//  */
// async function getNavisionAuthHeader(): Promise<Record<string, string>> {
//   await setShopSessionTZ();

//   const nowSec = Math.floor(Date.now() / 1000);

//   const existing = await prismaShop.navisions.findFirst({
//     where: { host: NAVISION_HOST_KEY },
//   });

//   if (existing && Number(existing.exp) >= nowSec && existing.token) {
//     return { Authorization: `Bearer ${existing.token}` };
//   }

//   if (!NAVISION_USERNAME || !NAVISION_PASSWORD) {
//     throw new Error("[cart.service] NAVISION_USERNAME or NAVISION_PASSWORD missing");
//   }

//   const tokenUrl = `${NAVISION_BASE_URL}/token`;

//   const res = await fetch(tokenUrl, {
//     method: "POST",
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     body: new URLSearchParams({
//       grant_type: "password",
//       username: NAVISION_USERNAME,
//       password: NAVISION_PASSWORD,
//     }),
//   });

//   if (!res.ok) {
//     throw new Error(
//       `[cart.service] Navision token fetch failed: ${res.status} ${res.statusText}`
//     );
//   }

//   const json = (await res.json()) as { access_token: string };

//   const expSec = nowSec + 1036800; // 12 days
//   const expBigInt = BigInt(expSec);

//   // update/create by id
//   if (existing) {
//     await prismaShop.navisions.update({
//       where: { id: existing.id },
//       data: {
//         token: json.access_token,
//         exp: expBigInt,
//         updated_at: new Date(),
//       },
//     });
//   } else {
//     await prismaShop.navisions.create({
//       data: {
//         host: NAVISION_HOST_KEY,
//         token: json.access_token,
//         exp: expBigInt,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//     });
//   }

//   return { Authorization: `Bearer ${json.access_token}` };
// }

// /* ================================
//  *  Check Item Availability
//  * ================================ */

// /**
//  * เทียบเท่า Laravel: ItemAvail2()
//  *
//  * • ยิง Navision → rawStock
//  * • อัปเดต interlink.products_clearance.clearanceQuantity = rawStock
//  * • เคลียร์ lock timeout
//  * • คำนวณ inventories สำหรับ “ลูกค้าปัจจุบัน”
//  */
// async function checkItemAvail2(params: {
//   product: string;
//   uom: string;
//   customerId: number | null;
// }): Promise<number> {
//   const { product, uom, customerId } = params;

//   // หา location code จาก discountpercentage_clearance_tb
//   const locationCode = await getLocationCodeForProductSku(product);
//   if (!locationCode) {
//     return 0;
//   }

//   const headers = await getNavisionAuthHeader();

//   const url = `${NAVISION_BASE_URL}/api/NAV/ItemAvail?No=${encodeURIComponent(
//     product,
//   )}&locationCode=${encodeURIComponent(
//     locationCode,
//   )}&UOM=${encodeURIComponent(uom)}`;

//   let res: Response;
//   try {
//     res = await fetch(url, {
//       method: "GET",
//       headers,
//     });
//   } catch (err) {
//     console.error("[cart.service] Navision fetch failed", err);
//     // ถ้าเรียก Navision ไม่ได้ ให้ถือว่าไม่มีของ (กันไม่ให้ /api/cart/add ตาย 500)
//     return 0;
//   }

//   if (!res.ok) {
//     console.error(
//       "[cart.service] Navision response not ok",
//       res.status,
//       res.statusText,
//     );
//     return 0;
//   }

//   const json = await res.json();
//   const rawStock = Number(json);

//   if (!Number.isFinite(rawStock)) {
//     return 0;
//   }

//   await clearExpiredLockOrders(locationCode);

//   const totalLock = await getTotalLockOrder({
//     sku: product,
//     uom,
//     location: locationCode,
//   });

//   const yourLock =
//     customerId != null
//       ? await getTotalYouLockOrder({
//           sku: product,
//           uom,
//           location: locationCode,
//           customerId,
//         })
//       : 0;

//   const inventories = rawStock - totalLock + yourLock;
//   const finalInventories = inventories > 0 ? inventories : 0;

//   try {
//     await setInterlinkSessionTZ();
//     await prismaInterlink.products_clearance.updateMany({
//       where: { product_sku: product },
//       data: { clearanceQuantity: finalInventories },
//     });
//   } catch (e) {
//     console.error(
//       "[cart.service] Failed to update products_clearance.clearanceQuantity",
//       e,
//     );
//   }

//   return finalInventories;
// }

// /**
//  * debug ใช้สำหรับ API /api/debug/cart/check
//  */
// export async function debugCheckItemAvail2(params: {
//   product: string;
//   uom: string;
//   customerId: number | null;
// }) {
//   return checkItemAvail2(params);
// }

// /* ================================
//  *  Add To Cart Service
//  * ================================ */

// export async function addToCartService(params: {
//   customerId: number | null;
//   payload: AddToCartRequest;
//   eventSale?: EventSaleType;
// }): Promise<AddToCartResponse> {
//   const { customerId, payload, eventSale = CURRENT_EVENT_SALE } = params;
//   const { product, uom, quantity, price } = payload;

//   const qty = normalizeQuantity(quantity);

//   if (qty <= 0) {
//     return { status: "sold-out" };
//   }

//   const itemAvail = await checkItemAvail2({
//     product,
//     uom,
//     customerId,
//   });

//   if (itemAvail >= qty) {
//     if (!customerId) {
//       return { status: "login" };
//     }

//     await upsertCartItem({
//       customerId,
//       product,
//       quantity: qty,
//       uom,
//       price,
//       eventSale,
//       reserve: 0,
//     });

//     return { status: "success" };
//   }

//   if (itemAvail > 0) {
//     return {
//       status: "less-left",
//       itemAvail,
//     };
//   }

//   return { status: "sold-out" };
// }

// /* ================================
//  *  Cart Summary
//  * ================================ */

// export async function getCartSummary(customerId: number | null) {
//   if (!customerId) {
//     return {
//       totalQuantity: 0,
//       totalAmount: 0,
//     };
//   }

//   await setShopSessionTZ();

//   const items = await prismaShop.carts.findMany({
//     where: {
//       id__customers: BigInt(customerId),
//       cart_status: 0,
//     },
//     select: { quantity: true, price_amount: true },
//   });

//   const totalQuantity = items.reduce(
//     (sum, r) => sum + Number(r.quantity ?? 0),
//     0
//   );

//   const totalAmount = items.reduce(
//     (sum, r) => sum + Number(r.price_amount ?? 0),
//     0
//   );

//   return {
//     totalQuantity,
//     totalAmount,
//   };
// }


// v.1.1.3 ======================================================================

// v.1.1.2 ======================================================================
// // src/services/cart/cart.service.ts

// import type { AddToCartRequest, AddToCartResponse, EventSaleType } from "@/types/cart";
// import { CURRENT_EVENT_SALE, normalizeQuantity } from "./cart.helpers";
// import {
//   getLocationCodeForProductSku,
//   getTotalLockOrder,
//   getTotalYouLockOrder,
// } from "./cart.query";
// import { upsertCartItem, clearExpiredLockOrders } from "./cart.crud";
// import {
//   prismaShop,
//   prismaInterlink,
//   setShopSessionTZ,
//   setInterlinkSessionTZ,
// } from "@/lib/db";

// /* ================================
//  *  Navision token & config helpers
//  * ================================ */

// const NAVISION_HOST_KEY = process.env.NAVISION_HOST_KEY ?? "prod";
// const NAVISION_BASE_URL = process.env.NAVISION_BASE_URL ?? "http://192.168.0.250:8084";
// const NAVISION_USERNAME = process.env.NAVISION_USERNAME ?? "";
// const NAVISION_PASSWORD = process.env.NAVISION_PASSWORD ?? "";

// /**
//  * อ่าน / สร้าง token สำหรับ Navision
//  * เทียบเท่า logic ใน ServiceController::__construct()
//  */
// async function getNavisionAuthHeader(): Promise<Record<string, string>> {
//   await setShopSessionTZ();

//   // 1) ลองอ่าน token เดิมจากตาราง navisions
//   const nowSec = Math.floor(Date.now() / 1000);
//   const existing = await prismaShop.navisions.findFirst({
//     where: { host: NAVISION_HOST_KEY },
//   });

//   if (existing && Number(existing.exp) >= nowSec && existing.token) {
//     return { Authorization: `Bearer ${existing.token}` };
//   }

//   // 2) ถ้าไม่มี / หมดอายุ → ขอ token ใหม่จาก Navision
//   if (!NAVISION_USERNAME || !NAVISION_PASSWORD) {
//     throw new Error(
//       "[cart.service] NAVISION_USERNAME or NAVISION_PASSWORD is not set",
//     );
//   }

//   const tokenUrl = `${NAVISION_BASE_URL}/token`;

//   const res = await fetch(tokenUrl, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     // Laravel ใช้ asForm() → ส่งเป็น form-data
//     body: new URLSearchParams({
//       grant_type: "password",
//       username: NAVISION_USERNAME,
//       password: NAVISION_PASSWORD,
//     }),
//   });

//   if (!res.ok) {
//     throw new Error(
//       `[cart.service] Failed to fetch Navision token: ${res.status} ${res.statusText}`,
//     );
//   }

//   const json = (await res.json()) as { access_token: string };

//   const expSec = nowSec + 1036800; // ~12 วัน ตามโค้ดเดิม
//   const expBigInt = BigInt(expSec);

//   // ❌ เลิกใช้ upsert(where: { host }) เพราะ host ไม่ใช่ unique key
//   // ✅ ใช้ findFirst + update(create) แทน โดย where: { id: existing.id }
//   if (existing) {
//     await prismaShop.navisions.update({
//       where: { id: existing.id },
//       data: {
//         token: json.access_token,
//         exp: expBigInt,
//         updated_at: new Date(),
//       },
//     });
//   } else {
//     await prismaShop.navisions.create({
//       data: {
//         host: NAVISION_HOST_KEY,
//         token: json.access_token,
//         exp: expBigInt,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//     });
//   }

//   return { Authorization: `Bearer ${json.access_token}` };
// }

// /**
//  * เรียก Navision /api/NAV/ItemAvail แบบเดียวกับ ItemAvail2
//  * แล้วคำนวณ inventories = (stock - lockOrderทั้งหมด) + lockOrderของตัวเอง
//  */
// async function checkItemAvail2(params: {
//   product: string;
//   uom: string;
//   customerId: number | null;
// }): Promise<number> {
//   const { product, uom, customerId } = params;

//   // หา location code จาก discountpercentage_clearance_tb
//   const locationCode = await getLocationCodeForProductSku(product);
//   if (!locationCode) {
//     // ถ้าหาไม่ได้ถือว่าไม่มีของ
//     return 0;
//   }

//   const headers = await getNavisionAuthHeader();

//   // เรียก Navision เหมือน Laravel:
//   // GET /api/NAV/ItemAvail?No={product}&locationCode={locationCode}&UOM={uom}
//   const url = `${NAVISION_BASE_URL}/api/NAV/ItemAvail?No=${encodeURIComponent(
//     product,
//   )}&locationCode=${encodeURIComponent(
//     locationCode,
//   )}&UOM=${encodeURIComponent(uom)}`;

//   const res = await fetch(url, {
//     method: "GET",
//     headers,
//   });

//   if (!res.ok) {
//     // ถ้า Navision error ให้ถือว่าไม่มีของ
//     return 0;
//   }

//   const json = await res.json();
//   const rawStock = Number(json);

//   // ถ้าไม่ใช่ตัวเลข → ถือว่า sold out (เหมือน Laravel)
//   if (!Number.isFinite(rawStock)) {
//     // NOTE: Laravel เดิมจะไปอัปเดต column '13' ด้วย แต่เราไม่ทำตรงนี้
//     return 0;
//   }

//   // เคลียร์ lock order ที่ timeout ก่อนเหมือน __construct()
//   await clearExpiredLockOrders(locationCode);

//   // รวม lock order ทั้งหมด
//   const totalLock = await getTotalLockOrder({
//     sku: product,
//     uom,
//     location: locationCode,
//   });

//   // รวม lock order ของตัวเอง
//   const yourLock =
//     customerId != null
//       ? await getTotalYouLockOrder({
//           sku: product,
//           uom,
//           location: locationCode,
//           customerId,
//         })
//       : 0;

//   // inventories = (stock - lockคนอื่นทั้งหมด) + lockของตัวเอง
//   const inventories = rawStock - totalLock + yourLock;

//   // ไม่ให้ติดลบ
//   const finalInventories = inventories > 0 ? inventories : 0;

//   // ✅ อัปเดตจำนวนคงเหลือล่าสุดลง interlink.products_clearance.clearanceQuantity
//   try {
//     await setInterlinkSessionTZ();
//     await prismaInterlink.products_clearance.updateMany({
//       where: { product_sku: product },
//       data: {
//         clearanceQuantity: finalInventories,
//       },
//     });
//   } catch (e) {
//     console.error(
//       "[cart.service] Failed to update products_clearance.clearanceQuantity",
//       e,
//     );
//   }

//   return finalInventories;
// }

// /** 🔍 ฟังก์ชันสำหรับ debug เท่านั้น */
// export async function debugCheckItemAvail2(params: {
//   product: string;
//   uom: string;
//   customerId: number | null;
// }): Promise<number> {
//   return checkItemAvail2(params);
// }


// /* ================================
//  *  Public service: Add to Cart
//  * ================================ */

// /**
//  * เลียนแบบ CartController@add ของ Laravel:
//  *
//  * 1) เรียก ItemAvail2 → ได้ itemAvail
//  * 2) ถ้า itemAvail >= quantity:
//  *      - ถ้าไม่ login → ส่ง "login"
//  *      - ถ้า login → upsert row ใน carts แล้วคืน "success"
//  *    else if itemAvail > 0 → "less-left" + itemAvail
//  *    else → "sold-out"
//  */
// export async function addToCartService(params: {
//   customerId: number | null;
//   payload: AddToCartRequest;
//   eventSale?: EventSaleType;
// }): Promise<AddToCartResponse> {
//   const { customerId, payload, eventSale = CURRENT_EVENT_SALE } = params;
//   const { product, uom, quantity, price } = payload;

//   const qty = normalizeQuantity(quantity);

//   if (qty <= 0) {
//     // ไม่เพิ่มของจำนวน 0 ลงตะกร้า
//     return { status: "sold-out" }; // หรือจะถือว่า success เฉย ๆ ก็ได้ ถ้าอยากเปลี่ยนค่อยว่ากัน
//   }

//   // 1) เช็คจำนวนที่สามารถขายได้ตาม ItemAvail2
//   const itemAvail = await checkItemAvail2({
//     product,
//     uom,
//     customerId,
//   });

//   if (itemAvail >= qty) {
//     // มีของพอ

//     // 1.1 ถ้ายังไม่ได้ login → ทำเหมือน Laravel: คืน "login"
//     if (!customerId) {
//       return { status: "login" };
//     }

//     // 1.2 ถ้า login แล้ว → upsert ลงตาราง carts
//     await upsertCartItem({
//       customerId,
//       product,
//       quantity: qty,
//       uom,
//       price,
//       eventSale,
//       reserve: 0,
//     });

//     return { status: "success" };
//   }

//   // 2) มีของเหลือ แต่ไม่พอจำนวนที่ขอ
//   if (itemAvail > 0) {
//     return {
//       status: "less-left",
//       itemAvail,
//     };
//   }

//   // 3) ไม่มีของเลย
//   return { status: "sold-out" };
// }

// v.1.1.2 ======================================================================

// // src/services/cart/cart.service.ts

// import type { AddToCartRequest, AddToCartResponse } from "@/types/cart";
// import type { EventSaleType } from "@/types/cart";
// import {
//   CURRENT_EVENT_SALE,
//   normalizeQuantity,
// } from "./cart.helpers";
// import {
//   getLocationCodeForProductSku,
//   getTotalLockOrder,
//   getTotalYouLockOrder,
// } from "./cart.query";
// import { upsertCartItem, clearExpiredLockOrders } from "./cart.crud";
// import { prismaShop } from "@/lib/db";
// import { setShopSessionTZ } from "@/lib/db";

// /* ================================
//  *  Navision token & config helpers
//  * ================================ */

// const NAVISION_HOST_KEY = process.env.NAVISION_HOST_KEY ?? "prod";
// const NAVISION_BASE_URL =
//   process.env.NAVISION_BASE_URL ?? "http://navision.interlink.co.th:8084";
// const NAVISION_USERNAME = process.env.NAVISION_USERNAME ?? "";
// const NAVISION_PASSWORD = process.env.NAVISION_PASSWORD ?? "";

// /**
//  * อ่าน / สร้าง token สำหรับ Navision
//  * เทียบเท่า logic ใน ServiceController::__construct()
//  */
// async function getNavisionAuthHeader(): Promise<Record<string, string>> {
//   await setShopSessionTZ();

//   // 1) ลองอ่าน token เดิมจากตาราง navisions
//   const now = Math.floor(Date.now() / 1000);
//   const existing = await prismaShop.navisions.findFirst({
//     where: { host: NAVISION_HOST_KEY },
//   });

//   if (existing && Number(existing.exp) >= now && existing.token) {
//     return { Authorization: `Bearer ${existing.token}` };
//   }

//   // 2) ถ้าไม่มี / หมดอายุ → ขอ token ใหม่จาก Navision
//   if (!NAVISION_USERNAME || !NAVISION_PASSWORD) {
//     throw new Error(
//       "[cart.service] NAVISION_USERNAME or NAVISION_PASSWORD is not set"
//     );
//   }

//   const tokenUrl = `${NAVISION_BASE_URL}/token`;

//   const res = await fetch(tokenUrl, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     // Laravel ใช้ asForm() → ส่งเป็น form-data
//     body: new URLSearchParams({
//       grant_type: "password",
//       username: NAVISION_USERNAME,
//       password: NAVISION_PASSWORD,
//     }),
//   });

//   if (!res.ok) {
//     throw new Error(
//       `[cart.service] Failed to fetch Navision token: ${res.status} ${res.statusText}`
//     );
//   }

//   const json = (await res.json()) as { access_token: string };

//   const exp = now + 1036800; // ~12 วัน ตามโค้ดเดิม

//   await prismaShop.navisions.upsert({
//     where: { host: NAVISION_HOST_KEY },
//     update: {
//       token: json.access_token,
//       exp: BigInt(exp),
//       updated_at: new Date(),
//     },
//     create: {
//       host: NAVISION_HOST_KEY,
//       token: json.access_token,
//       exp: BigInt(exp),
//       created_at: new Date(),
//       updated_at: new Date(),
//     },
//   });

//   return { Authorization: `Bearer ${json.access_token}` };
// }

// /**
//  * เรียก Navision /api/NAV/ItemAvail แบบเดียวกับ ItemAvail2
//  * แล้วคำนวณ inventories = (stock - lockOrderทั้งหมด) + lockOrderของตัวเอง
//  */
// async function checkItemAvail2(params: {
//   product: string;
//   uom: string;
//   customerId: number | null;
// }): Promise<number> {
//   const { product, uom, customerId } = params;

//   // หา location code จาก discountpercentage_clearance_tb
//   const locationCode = await getLocationCodeForProductSku(product);
//   if (!locationCode) {
//     // ถ้าหาไม่ได้ถือว่าไม่มีของ
//     return 0;
//   }

//   const headers = await getNavisionAuthHeader();

//   // เรียก Navision เหมือน Laravel:
//   // GET /api/NAV/ItemAvail?No={product}&locationCode={locationCode}&UOM={uom}
//   const url = `${NAVISION_BASE_URL}/api/NAV/ItemAvail?No=${encodeURIComponent(
//     product
//   )}&locationCode=${encodeURIComponent(
//     locationCode
//   )}&UOM=${encodeURIComponent(uom)}`;

//   const res = await fetch(url, {
//     method: "GET",
//     headers,
//   });

//   if (!res.ok) {
//     // ถ้า Navision error ให้ถือว่าไม่มีของ
//     return 0;
//   }

//   const json = await res.json();
//   const rawStock = Number(json);

//   // ถ้าไม่ใช่ตัวเลข → ถือว่า sold out (เหมือน Laravel)
//   if (!Number.isFinite(rawStock)) {
//     // NOTE: Laravel ยังไป update product column '13' ด้วย
//     return 0;
//   }

//   // เคลียร์ lock order ที่ timeout ก่อนเหมือน __construct()
//   await clearExpiredLockOrders(locationCode);

//   // รวม lock order ทั้งหมด
//   const totalLock = await getTotalLockOrder({
//     sku: product,
//     uom,
//     location: locationCode,
//   });

//   // รวม lock order ของตัวเอง
//   const yourLock =
//     customerId != null
//       ? await getTotalYouLockOrder({
//           sku: product,
//           uom,
//           location: locationCode,
//           customerId,
//         })
//       : 0;

//   // inventories = (stock - lockคนอื่นทั้งหมด) + lockของตัวเอง
//   const inventories = rawStock - totalLock + yourLock;

//   return inventories > 0 ? inventories : 0;
// }

// /* ================================
//  *  Public service: Add to Cart
//  * ================================ */

// /**
//  * เลียนแบบ CartController@add ของ Laravel:
//  *
//  * 1) เรียก ItemAvail2 → ได้ itemAvail
//  * 2) ถ้า itemAvail >= quantity:
//  *      - ถ้าไม่ login → ส่ง "login"
//  *      - ถ้า login → upsert row ใน carts แล้วคืน "success"
//  *    else if itemAvail > 0 → "less-left" + itemAvail
//  *    else → "sold-out"
//  */
// export async function addToCartService(params: {
//   customerId: number | null;
//   payload: AddToCartRequest;
//   eventSale?: EventSaleType;
// }): Promise<AddToCartResponse> {
//   const { customerId, payload, eventSale = CURRENT_EVENT_SALE } = params;
//   const { product, uom, quantity, price } = payload;

//   const qty = normalizeQuantity(quantity);

//   if (qty <= 0) {
//     // ไม่เพิ่มของจำนวน 0 ลงตะกร้า
//     return { status: "sold-out" }; // หรือจะถือว่า success เฉย ๆ ก็ได้ ถ้าอยากเปลี่ยนค่อยว่ากัน
//   }

//   // 1) เช็คจำนวนที่สามารถขายได้ตาม ItemAvail2
//   const itemAvail = await checkItemAvail2({
//     product,
//     uom,
//     customerId,
//   });

//   if (itemAvail >= qty) {
//     // มีของพอ

//     // 1.1 ถ้ายังไม่ได้ login → ทำเหมือน Laravel: คืน "login"
//     if (!customerId) {
//       return { status: "login" };
//     }

//     // 1.2 ถ้า login แล้ว → upsert ลงตาราง carts
//     await upsertCartItem({
//       customerId,
//       product,
//       quantity: qty,
//       uom,
//       price,
//       eventSale,
//       reserve: 0,
//     });

//     return { status: "success" };
//   }

//   // 2) มีของเหลือ แต่ไม่พอจำนวนที่ขอ
//   if (itemAvail > 0) {
//     return {
//       status: "less-left",
//       itemAvail,
//     };
//   }

//   // 3) ไม่มีของเลย
//   return { status: "sold-out" };
// }

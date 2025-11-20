// v.1.1.3 ================================================
// src/services/cart/cart.crud.ts

import { prismaShop } from "@/lib/db";
import { setShopSessionTZ } from "@/lib/db";
import { calcPriceAmount, mapCartRowToCartItem } from "./cart.helpers";
import type { CartItem, EventSaleType } from "@/types/cart";
import { findCartRowForCustomerProduct } from "./cart.query";

/**
 * เคลียร์ lock order ที่ timeout แล้ว (เทียบเท่า __construct() ของ ServiceController)
 * ถ้าอยากเปลี่ยนให้ dynamic location สามารถส่ง param เข้ามาได้
 */
export async function clearExpiredLockOrders(location: string = "13") {
  await setShopSessionTZ();

  await prismaShop.lock_orders.updateMany({
    where: {
      status: 1,
      location,
      timeout: { lt: BigInt(Math.floor(Date.now() / 1000)) },
    },
    data: {
      status: 0,
    },
  });
}

/**
 * updateOrCreate cart ตาม logic Laravel:
 * where: (id__customers, product, cart_status=0, reserve)
 *
 * - ถ้าหา row เดิมเจอ → บวก quantity เพิ่มเข้าไป และคำนวณ price_amount ใหม่
 * - ถ้าไม่เจอ → create แถวใหม่
 */
export async function upsertCartItem(params: {
  customerId: number;
  product: string;
  quantity: number;
  uom: string;
  price: number;
  eventSale: EventSaleType;
  reserve?: 0 | 1;
}): Promise<CartItem> {
  const {
    customerId,
    product,
    quantity,
    uom,
    price,
    eventSale,
    reserve = 0,
  } = params;

  await setShopSessionTZ();

  const existing = await findCartRowForCustomerProduct({
    customerId,
    product,
    reserve,
  });

  const now = new Date();

  let row: any;

  if (existing) {
    // ✅ ถ้ามีอยู่แล้วในตะกร้า → บวกจำนวนเพิ่มเข้าไป
    const currentQty = BigInt(existing.quantity ?? 0);
    const addedQty = BigInt(quantity);
    const newQty = currentQty + addedQty;

    const newPriceAmount = calcPriceAmount(Number(newQty), price);

    row = await prismaShop.carts.update({
      where: { id: existing.id },
      data: {
        quantity: newQty,
        price,
        price_amount: newPriceAmount,
        check_product: true,
        cart_status: 0,
        reserve,
        event_sale: eventSale,
        updated_at: now,
      },
    });
  } else {
    // ✅ สร้างแถวใหม่
    const priceAmount = calcPriceAmount(quantity, price);

    row = await prismaShop.carts.create({
      data: {
        id__customers: BigInt(customerId),
        product,
        quantity: BigInt(quantity),
        uom,
        price,
        price_amount: priceAmount,
        check_product: true,
        cart_status: 0,
        reserve,
        event_sale: eventSale,
        created_at: now,
        updated_at: now,
      },
    });
  }

  return mapCartRowToCartItem(row);
}

// v.1.1.3 ================================================

// v.1.1.2 ================================================
// // src/services/cart/cart.crud.ts

// import { prismaShop } from "@/lib/db";
// import { setShopSessionTZ } from "@/lib/db";
// import { calcPriceAmount, mapCartRowToCartItem } from "./cart.helpers";
// import type { CartItem, EventSaleType } from "@/types/cart";
// import { findCartRowForCustomerProduct } from "./cart.query";

// /**
//  * เคลียร์ lock order ที่ timeout แล้ว (เทียบเท่า __construct() ของ ServiceController)
//  * ถ้าอยากเปลี่ยนให้ dynamic location สามารถส่ง param เข้ามาได้
//  */
// export async function clearExpiredLockOrders(location: string = "13") {
//   await setShopSessionTZ();

//   await prismaShop.lock_orders.updateMany({
//     where: {
//       status: 1,
//       location,
//       timeout: { lt: BigInt(Math.floor(Date.now() / 1000)) },
//     },
//     data: {
//       status: 0,
//     },
//   });
// }

// /**
//  * updateOrCreate cart ตาม logic Laravel:
//  * where: (id__customers, product, cart_status=0, reserve)
//  */
// // export async function upsertCartItem(params: {
// //   customerId: number;
// //   product: string;
// //   quantity: number;
// //   uom: string;
// //   price: number;
// //   eventSale: EventSaleType;
// //   reserve?: 0 | 1;
// // }): Promise<CartItem> {
// //   const {
// //     customerId,
// //     product,
// //     quantity,
// //     uom,
// //     price,
// //     eventSale,
// //     reserve = 0,
// //   } = params;

// //   await setShopSessionTZ();

// //   const priceAmount = calcPriceAmount(quantity, price);
// //   const now = new Date();

// //   const existing = await findCartRowForCustomerProduct({
// //     customerId,
// //     product,
// //     reserve,
// //   });

// //   const baseData = {
// //     id__customers: BigInt(customerId),
// //     product,
// //     quantity: BigInt(quantity),
// //     uom,
// //     price,
// //     price_amount: priceAmount,
// //     check_product: true,
// //     cart_status: 0,
// //     reserve,
// //     event_sale: eventSale,
// //   };

// //   let row: any;

// //   if (existing) {
// //     // อัปเดตแถวเดิม → เปลี่ยน updated_at เท่านั้น
// //     row = await prismaShop.carts.update({
// //       where: { id: existing.id },
// //       data: {
// //         ...baseData,
// //         updated_at: now,
// //       },
// //     });
// //   } else {
// //     // สร้างแถวใหม่ → ใส่ทั้ง created_at และ updated_at
// //     row = await prismaShop.carts.create({
// //       data: {
// //         ...baseData,
// //         created_at: now,
// //         updated_at: now,
// //       },
// //     });
// //   }

// //   return mapCartRowToCartItem(row);
// // }


// export async function upsertCartItem(params: {
//   customerId: number;
//   product: string;
//   quantity: number;
//   uom: string;
//   price: number;
//   eventSale: EventSaleType;
//   reserve?: 0 | 1;
// }): Promise<CartItem> {
//   const {
//     customerId,
//     product,
//     quantity,
//     uom,
//     price,
//     eventSale,
//     reserve = 0,
//   } = params;

//   await setShopSessionTZ();

//   const existing = await findCartRowForCustomerProduct({
//     customerId,
//     product,
//     reserve,
//   });

//   const now = new Date();

//   let row: any;

//   if (existing) {
//     // ✅ ถ้ามีอยู่แล้ว: เอาจำนวนเดิม + ใหม่
//     const currentQty = Number(existing.quantity ?? 0);
//     const newQty = currentQty + quantity;
//     const newPriceAmount = calcPriceAmount(newQty, price);

//     row = await prismaShop.carts.update({
//       where: { id: existing.id },
//       data: {
//         id__customers: BigInt(customerId),
//         product,
//         quantity: BigInt(newQty),
//         uom,
//         price,
//         price_amount: newPriceAmount,
//         check_product: true,
//         cart_status: 0,
//         reserve,
//         event_sale: eventSale,
//         // เก็บ created_at เดิมไว้ อัปเดตเฉพาะ updated_at
//         created_at: existing.created_at ?? now,
//         updated_at: now,
//       },
//     });
//   } else {
//     // ✅ ยังไม่มี row นี้: สร้างใหม่
//     const priceAmount = calcPriceAmount(quantity, price);

//     row = await prismaShop.carts.create({
//       data: {
//         id__customers: BigInt(customerId),
//         product,
//         quantity: BigInt(quantity),
//         uom,
//         price,
//         price_amount: priceAmount,
//         check_product: true,
//         cart_status: 0,
//         reserve,
//         event_sale: eventSale,
//         created_at: now,
//         updated_at: now,
//       },
//     });
//   }

//   return mapCartRowToCartItem(row);
// }


// v.1.1.2 ================================================

// // src/services/cart/cart.crud.ts

// import { prismaShop } from "@/lib/db";
// import { setShopSessionTZ } from "@/lib/db";
// import { calcPriceAmount } from "./cart.helpers";
// import type { CartItem, EventSaleType } from "@/types/cart";
// import { mapCartRowToCartItem } from "./cart.helpers";
// import { findCartRowForCustomerProduct } from "./cart.query";

// /**
//  * เคลียร์ lock order ที่ timeout แล้ว (เทียบเท่า __construct() ของ ServiceController)
//  * ถ้าอยากเปลี่ยนให้ dynamic location สามารถส่ง param เข้ามาได้
//  */
// export async function clearExpiredLockOrders(location: string = "13") {
//   await setShopSessionTZ();

//   await prismaShop.lock_orders.updateMany({
//     where: {
//       status: 1,
//       location,
//       timeout: { lt: BigInt(Math.floor(Date.now() / 1000)) },
//     },
//     data: {
//       status: 0,
//     },
//   });
// }

// /**
//  * updateOrCreate cart ตาม logic Laravel:
//  * where: (id__customers, product, cart_status=0, reserve)
//  */
// export async function upsertCartItem(params: {
//   customerId: number;
//   product: string;
//   quantity: number;
//   uom: string;
//   price: number;
//   eventSale: EventSaleType;
//   reserve?: 0 | 1;
// }): Promise<CartItem> {
//   const {
//     customerId,
//     product,
//     quantity,
//     uom,
//     price,
//     eventSale,
//     reserve = 0,
//   } = params;

//   await setShopSessionTZ();

//   const priceAmount = calcPriceAmount(quantity, price);

//   const existing = await findCartRowForCustomerProduct({
//     customerId,
//     product,
//     reserve,
//   });

//   const data = {
//     id__customers: BigInt(customerId),
//     product,
//     quantity: BigInt(quantity),
//     uom,
//     price,
//     price_amount: priceAmount,
//     check_product: true,
//     cart_status: 0,
//     reserve,
//     event_sale: eventSale,
//   };

//   let row: any;

//   if (existing) {
//     row = await prismaShop.carts.update({
//       where: { id: existing.id },
//       data,
//     });
//   } else {
//     row = await prismaShop.carts.create({
//       data,
//     });
//   }

//   return mapCartRowToCartItem(row);
// }

// v.1.1.6 ==================================================================
// src/services/checkout/checkout.service.ts

import type { CheckoutData } from "@/types/checkout";
import { buildCheckoutProfileInfo } from "@/types/checkout";

import type { PersonProfile, EntityProfile } from "@/types/profile";

import {
  buildCheckoutItemsFromCart,
  buildSummaryFromItems,
  buildCheckoutAddressesFromProfiles,
  buildCheckoutProfileAddressBookFromProfiles,
  pickDefaultAddress,
  type CartWithProduct,
} from "./checkout.helpers";

import { getCartAndProductsForCheckout } from "./checkout.query";

import { ProfileService } from "@/services/profile.service";

/**
 * Service หลักของ Checkout
 * รวมข้อมูลจาก:
 *  - carts (ตะกร้า) + products_clearance
 *  - customer_profile_people / entities
 * แล้ว map เป็น CheckoutData สำหรับส่งเข้า UI
 */
export class CheckoutService {
  /**
   * โหลดข้อมูลทั้งหมดที่จำเป็นสำหรับหน้า /checkout
   */
  static async getCheckoutData(
    customerId: number | bigint
  ): Promise<CheckoutData> {
    const cid = BigInt(customerId);

    console.log("[checkout] getCheckoutData cid =", cid);

    // 1) ดึง cart + products พร้อมกัน
    const [{ cartItems, products }, profileRaw] = await Promise.all([
      getCartAndProductsForCheckout(cid),
      ProfileService.getProfile(cid),
    ]);

    console.log(
      "[checkout] cartItems length =",
      cartItems.length,
      "products length =",
      products.length
    );
    if (cartItems.length > 0) {
      console.log("[checkout] cartItems sample =", cartItems[0]);
    }
    if (products.length > 0) {
      console.log("[checkout] products sample =", products[0]);
    }

    // 2) join cart + products ด้วย SKU (cart.product ↔ product.sku)
    const productBySku = new Map<string, (typeof products)[number]>();
    for (const p of products) {
      productBySku.set(String(p.sku), p);
    }

    const cartWithProduct: CartWithProduct[] = cartItems
      .map((cart) => {
        const sku = String((cart as any).product);
        const product = productBySku.get(sku);

        if (!product) {
          console.log("[checkout] NO product match for cart SKU", sku);
          return null;
        }

        return { cart, product };
      })
      .filter((r): r is CartWithProduct => r !== null);

    console.log(
      "[checkout] cartWithProduct length =",
      cartWithProduct.length,
      "sample =",
      cartWithProduct[0]
    );

    // 3) map → CheckoutItem[]
    const checkoutItems = buildCheckoutItemsFromCart(cartWithProduct);

    console.log(
      "[checkout] checkoutItems length =",
      checkoutItems.length,
      "sample =",
      checkoutItems[0]
    );

    // 4) summary เบื้องต้น (ยังไม่คิด shipping/ส่วนลดจริง)
    const summary = buildSummaryFromItems(checkoutItems, {
      shippingFee: 0,
      discount: 0,
    });

    console.log("[checkout] summary =", summary);

    // 5) profile → address (shipping / billing)
    const personProfile = profileRaw.person
      ? (profileRaw.person as any as PersonProfile)
      : null;

    const entityProfile = profileRaw.entity
      ? (profileRaw.entity as any as EntityProfile)
      : null;

    console.log("[checkout] personProfile =", personProfile);
    console.log("[checkout] entityProfile =", entityProfile);

    const { shipping, billing } = buildCheckoutAddressesFromProfiles(
      personProfile,
      entityProfile
    );

    const shippingAddress = pickDefaultAddress(shipping);
    const billingAddress = pickDefaultAddress(billing);

    console.log("[checkout] shippingAddress =", shippingAddress);
    console.log("[checkout] billingAddress =", billingAddress);

    // 5.1) profile → addressProfiles (2 การ์ด person/entity สำหรับ sheet)
    const addressProfiles =
      buildCheckoutProfileAddressBookFromProfiles(personProfile, entityProfile);

    console.log("[checkout] addressProfiles =", addressProfiles);

    // 6) profile info (mode + email/taxId)
    const profileInfo = buildCheckoutProfileInfo(personProfile, entityProfile);

    console.log("[checkout] profileInfo =", profileInfo);

    // 7) ประกอบเป็น CheckoutData
    const data: CheckoutData = {
      items: checkoutItems,
      summary,
      shippingAddress: shippingAddress ?? null,
      billingAddress: billingAddress ?? null,
      profileInfo,
      addressProfiles,
    };

    console.log(
      "[checkout] final CheckoutData items length =",
      data.items.length
    );

    return data;
  }
}

// v.1.1.6 ==================================================================

// v.1.1.5 ==================================================================
// // src/services/checkout/checkout.service.ts

// import type { CheckoutData } from "@/types/checkout";
// import {
//   buildCheckoutProfileInfo,
// } from "@/types/checkout";

// import type { PersonProfile, EntityProfile } from "@/types/profile";

// import {
//   buildCheckoutItemsFromCart,
//   buildSummaryFromItems,
//   buildCheckoutAddressesFromProfiles,
//   pickDefaultAddress,
//   type CartWithProduct,
// } from "./checkout.helpers";

// import {
//   getCartAndProductsForCheckout,
// } from "./checkout.query";

// import { ProfileService } from "@/services/profile.service";

// /**
//  * Service หลักของ Checkout
//  * รวมข้อมูลจาก:
//  *  - carts (ตะกร้า) + products_clearance
//  *  - customer_profile_people / entities
//  * แล้ว map เป็น CheckoutData สำหรับส่งเข้า UI
//  */
// export class CheckoutService {
//   /**
//    * โหลดข้อมูลทั้งหมดที่จำเป็นสำหรับหน้า /checkout
//    */
//   static async getCheckoutData(
//     customerId: number | bigint
//   ): Promise<CheckoutData> {
//     const cid = BigInt(customerId);

//     console.log("[checkout] getCheckoutData cid =", cid);

//     // 1) ดึง cart + products พร้อมกัน
//     const [{ cartItems, products }, profileRaw] = await Promise.all([
//       getCartAndProductsForCheckout(cid),
//       ProfileService.getProfile(cid),
//     ]);

//     console.log(
//       "[checkout] cartItems length =",
//       cartItems.length,
//       "products length =",
//       products.length
//     );
//     if (cartItems.length > 0) {
//       console.log("[checkout] cartItems sample =", cartItems[0]);
//     }
//     if (products.length > 0) {
//       console.log("[checkout] products sample =", products[0]);
//     }

//     // 2) join cart + products ด้วย SKU (cart.product ↔ product.sku)
//     const productBySku = new Map<string, (typeof products)[number]>();
//     for (const p of products) {
//       productBySku.set(String(p.sku), p);
//     }

//     const cartWithProduct: CartWithProduct[] = cartItems
//       .map((cart) => {
//         const sku = String((cart as any).product);
//         const product = productBySku.get(sku);

//         if (!product) {
//           console.log(
//             "[checkout] NO product match for cart SKU",
//             sku
//           );
//           return null;
//         }

//         return { cart, product };
//       })
//       .filter((r): r is CartWithProduct => r !== null);

//     console.log(
//       "[checkout] cartWithProduct length =",
//       cartWithProduct.length,
//       "sample =",
//       cartWithProduct[0]
//     );

//     // 3) map → CheckoutItem[]
//     const checkoutItems = buildCheckoutItemsFromCart(cartWithProduct);

//     console.log(
//       "[checkout] checkoutItems length =",
//       checkoutItems.length,
//       "sample =",
//       checkoutItems[0]
//     );

//     // 4) summary เบื้องต้น (ยังไม่คิด shipping/ส่วนลดจริง)
//     const summary = buildSummaryFromItems(checkoutItems, {
//       shippingFee: 0,
//       discount: 0,
//     });

//     console.log("[checkout] summary =", summary);

//     // 5) profile → address (shipping / billing)
//     const personProfile = profileRaw.person
//       ? (profileRaw.person as any as PersonProfile)
//       : null;

//     const entityProfile = profileRaw.entity
//       ? (profileRaw.entity as any as EntityProfile)
//       : null;

//     console.log("[checkout] personProfile =", personProfile);
//     console.log("[checkout] entityProfile =", entityProfile);

//     const { shipping, billing } = buildCheckoutAddressesFromProfiles(
//       personProfile,
//       entityProfile
//     );

//     const shippingAddress = pickDefaultAddress(shipping);
//     const billingAddress = pickDefaultAddress(billing);

//     console.log("[checkout] shippingAddress =", shippingAddress);
//     console.log("[checkout] billingAddress =", billingAddress);

//     // 6) profile info (mode + email/taxId)
//     const profileInfo = buildCheckoutProfileInfo(
//       personProfile,
//       entityProfile
//     );

//     console.log("[checkout] profileInfo =", profileInfo);

//     // 7) ประกอบเป็น CheckoutData
//     const data: CheckoutData = {
//       items: checkoutItems,
//       summary,
//       shippingAddress: shippingAddress ?? null,
//       billingAddress: billingAddress ?? null,
//       profileInfo,
//     };

//     console.log(
//       "[checkout] final CheckoutData items length =",
//       data.items.length
//     );

//     return data;
//   }
// }

// v.1.1.5 ==================================================================

// v.1.1.4 ==================================================================
// // src/services/checkout/checkout.service.ts

// import type { CheckoutData } from "@/types/checkout";
// import {
//   buildCheckoutProfileInfo,
// } from "@/types/checkout";

// import type { PersonProfile, EntityProfile } from "@/types/profile";

// import {
//   buildCheckoutItemsFromCart,
//   buildSummaryFromItems,
//   buildCheckoutAddressesFromProfiles,
//   pickDefaultAddress,
//   type CartWithProduct,
// } from "./checkout.helpers";

// import {
//   getCartAndProductsForCheckout,
// } from "./checkout.query";

// import { ProfileService } from "@/services/profile.service";

// /**
//  * Service หลักของ Checkout
//  * รวมข้อมูลจาก:
//  *  - carts (ตะกร้า) + products_clearance
//  *  - customer_profile_people / entities
//  * แล้ว map เป็น CheckoutData สำหรับส่งเข้า UI
//  */
// export class CheckoutService {
//   /**
//    * โหลดข้อมูลทั้งหมดที่จำเป็นสำหรับหน้า /checkout
//    */
//   static async getCheckoutData(
//     customerId: number | bigint
//   ): Promise<CheckoutData> {
//     const cid = BigInt(customerId);
//     console.log("[checkout] getCheckoutData cid = %s", cid);

//     // 1) ดึง cart + products พร้อมกัน
//     const [{ cartItems, products }, profileRaw] = await Promise.all([
//       getCartAndProductsForCheckout(cid),
//       ProfileService.getProfile(cid),
//     ]);

//     console.log(
//       "[checkout] cartItems length = %d products length = %d",
//       cartItems.length,
//       products.length
//     );
//     if (cartItems.length > 0) {
//       console.log("[checkout] cartItems sample =", cartItems[0]);
//     }
//     if (products.length > 0) {
//       console.log("[checkout] products sample =", products[0]);
//     }

//     // 2) join cart + products ด้วย **SKU** (cart.product ↔ product.sku)
//     const productBySku = new Map<string, (typeof products)[number]>();
//     for (const p of products) {
//       productBySku.set(String(p.sku), p);
//     }
//     console.log(
//       "[checkout] join map keys (skus) =",
//       Array.from(productBySku.keys())
//     );

//     const cartWithProduct: CartWithProduct[] = cartItems
//       .map((cart) => {
//         const raw: any = cart;
//         const sku = String(raw.product ?? "");

//         if (!sku) {
//           console.log("[checkout] cart row without sku/product =", raw);
//           return null;
//         }

//         const product = productBySku.get(sku);
//         if (!product) {
//           console.log(
//             "[checkout] no matching product for cart sku =",
//             sku
//           );
//           return null;
//         }

//         return { cart, product };
//       })
//       .filter((r): r is CartWithProduct => r !== null);

//     console.log(
//       "[checkout] cartWithProduct length = %d sample =",
//       cartWithProduct.length,
//       cartWithProduct[0]
//     );

//     // 3) map → CheckoutItem[]
//     const checkoutItems = buildCheckoutItemsFromCart(cartWithProduct);
//     console.log(
//       "[checkout] checkoutItems length = %d sample =",
//       checkoutItems.length,
//       checkoutItems[0]
//     );

//     // 4) summary เบื้องต้น (ยังไม่คิด shipping/ส่วนลดจริง)
//     const summary = buildSummaryFromItems(checkoutItems, {
//       shippingFee: 0,
//       discount: 0,
//     });
//     console.log("[checkout] summary =", summary);

//     // 5) profile → address (shipping / billing)
//     const personProfile = profileRaw.person
//       ? (profileRaw.person as any as PersonProfile)
//       : null;

//     const entityProfile = profileRaw.entity
//       ? (profileRaw.entity as any as EntityProfile)
//       : null;

//     console.log("[checkout] personProfile =", personProfile);
//     console.log("[checkout] entityProfile =", entityProfile);

//     const { shipping, billing } = buildCheckoutAddressesFromProfiles(
//       personProfile,
//       entityProfile
//     );

//     const shippingAddress = pickDefaultAddress(shipping);
//     const billingAddress = pickDefaultAddress(billing);

//     console.log("[checkout] shippingAddress =", shippingAddress);
//     console.log("[checkout] billingAddress =", billingAddress);

//     // 6) profile info (mode + email/taxId)
//     const profileInfo = buildCheckoutProfileInfo(
//       personProfile,
//       entityProfile
//     );
//     console.log("[checkout] profileInfo =", profileInfo);

//     // 7) ประกอบเป็น CheckoutData
//     const data: CheckoutData = {
//       items: checkoutItems,
//       summary,
//       shippingAddress: shippingAddress ?? null,
//       billingAddress: billingAddress ?? null,
//       profileInfo,
//     };

//     console.log(
//       "[checkout] final CheckoutData items length = %d",
//       data.items.length
//     );

//     return data;
//   }
// }

// v.1.1.4 ==================================================================

// v.1.1.3 ==================================================================
// // src/services/checkout/checkout.service.ts

// import type { CheckoutData } from "@/types/checkout";
// import { buildCheckoutProfileInfo } from "@/types/checkout";

// import type { PersonProfile, EntityProfile } from "@/types/profile";

// import {
//   buildCheckoutItemsFromCart,
//   buildSummaryFromItems,
//   buildCheckoutAddressesFromProfiles,
//   pickDefaultAddress,
//   type CartWithProduct,
// } from "./checkout.helpers";

// import { getCartAndProductsForCheckout } from "./checkout.query";

// import { ProfileService } from "@/services/profile.service";

// /**
//  * Service หลักของ Checkout
//  * รวมข้อมูลจาก:
//  *  - carts (ตะกร้า) + products_clearance
//  *  - customer_profile_people / entities
//  * แล้ว map เป็น CheckoutData สำหรับส่งเข้า UI
//  */
// export class CheckoutService {
//   /**
//    * โหลดข้อมูลทั้งหมดที่จำเป็นสำหรับหน้า /checkout
//    */
//   static async getCheckoutData(
//     customerId: number | bigint
//   ): Promise<CheckoutData> {
//     const cid = BigInt(customerId);

//     console.log("[checkout] getCheckoutData cid =", cid.toString());

//     // 1) ดึง cart + products พร้อมกัน
//     const [{ cartItems, products }, profileRaw] = await Promise.all([
//       getCartAndProductsForCheckout(cid),
//       ProfileService.getProfile(cid),
//     ]);

//     console.log(
//       "[checkout] cartItems length =",
//       cartItems.length,
//       "products length =",
//       products.length
//     );
//     console.log("[checkout] cartItems sample =", cartItems[0]);
//     console.log("[checkout] products sample =", products[0]);

//     // 2) join cart + products ด้วย id สินค้า
//     const productById = new Map<number, (typeof products)[number]>();
//     for (const p of products) {
//       productById.set(p.id, p);
//     }

//     const cartWithProduct: CartWithProduct[] = cartItems
//       .map((cart) => {
//         const raw: any = cart;
//         const productId =
//           raw.id__products_clearance ?? raw.productId ?? raw.product_id;

//         if (!productId) return null;

//         const product = productById.get(Number(productId));
//         if (!product) return null;

//         return { cart, product };
//       })
//       .filter((r): r is CartWithProduct => r !== null);

//     console.log(
//       "[checkout] cartWithProduct length =",
//       cartWithProduct.length,
//       "sample =",
//       cartWithProduct[0]
//     );

//     // 3) map → CheckoutItem[]
//     const checkoutItems = buildCheckoutItemsFromCart(cartWithProduct);
//     console.log(
//       "[checkout] checkoutItems length =",
//       checkoutItems.length,
//       "sample =",
//       checkoutItems[0]
//     );

//     // 4) summary เบื้องต้น (ยังไม่คิด shipping/ส่วนลดจริง)
//     const summary = buildSummaryFromItems(checkoutItems, {
//       shippingFee: 0,
//       discount: 0,
//     });
//     console.log("[checkout] summary =", summary);

//     // 5) profile → address (shipping / billing)
//     const personProfile = profileRaw.person
//       ? (profileRaw.person as any as PersonProfile)
//       : null;

//     const entityProfile = profileRaw.entity
//       ? (profileRaw.entity as any as EntityProfile)
//       : null;

//     console.log("[checkout] personProfile =", personProfile);
//     console.log("[checkout] entityProfile =", entityProfile);

//     const { shipping, billing } = buildCheckoutAddressesFromProfiles(
//       personProfile,
//       entityProfile
//     );

//     const shippingAddress = pickDefaultAddress(shipping);
//     const billingAddress = pickDefaultAddress(billing);

//     console.log("[checkout] shippingAddress =", shippingAddress);
//     console.log("[checkout] billingAddress =", billingAddress);

//     // 6) profile info (mode + email/taxId)
//     const profileInfo = buildCheckoutProfileInfo(personProfile, entityProfile);
//     console.log("[checkout] profileInfo =", profileInfo);

//     // 7) ประกอบเป็น CheckoutData
//     const data: CheckoutData = {
//       items: checkoutItems,
//       summary,
//       shippingAddress: shippingAddress ?? null,
//       billingAddress: billingAddress ?? null,
//       profileInfo,
//     };

//     console.log(
//       "[checkout] final CheckoutData items length =",
//       data.items.length
//     );

//     return data;
//   }
// }

// v.1.1.3 ==================================================================

// v.1.1.2 ==================================================================
// // src/services/checkout/checkout.service.ts

// import type { CheckoutData } from "@/types/checkout";
// import {
//   buildCheckoutProfileInfo,
// } from "@/types/checkout";

// import type { PersonProfile, EntityProfile } from "@/types/profile";

// import {
//   buildCheckoutItemsFromCart,
//   buildSummaryFromItems,
//   buildCheckoutAddressesFromProfiles,
//   pickDefaultAddress,
//   type CartWithProduct,
// } from "./checkout.helpers";

// import {
//   getCartAndProductsForCheckout,
// } from "./checkout.query";

// import { ProfileService } from "@/services/profile.service";

// /**
//  * Service หลักของ Checkout
//  * รวมข้อมูลจาก:
//  *  - carts (ตะกร้า) + products_clearance
//  *  - customer_profile_people / entities
//  * แล้ว map เป็น CheckoutData สำหรับส่งเข้า UI
//  */
// export class CheckoutService {
//   /**
//    * โหลดข้อมูลทั้งหมดที่จำเป็นสำหรับหน้า /checkout
//    */
//   static async getCheckoutData(
//     customerId: number | bigint
//   ): Promise<CheckoutData> {
//     const cid = BigInt(customerId);

//     // 1) ดึง cart + products พร้อมกัน
//     const [{ cartItems, products }, profileRaw] = await Promise.all([
//       getCartAndProductsForCheckout(cid),
//       ProfileService.getProfile(cid),
//     ]);

//     // 2) join cart + products ด้วย id สินค้า
//     const productById = new Map<number, typeof products[number]>();
//     for (const p of products) {
//       productById.set(p.id, p);
//     }

//     const cartWithProduct: CartWithProduct[] = cartItems
//       .map((cart) => {
//         const raw: any = cart;
//         const productId =
//           raw.id__products_clearance ?? raw.productId ?? raw.product_id;

//         if (!productId) return null;

//         const product = productById.get(Number(productId));
//         if (!product) return null;

//         return { cart, product };
//       })
//       .filter((r): r is CartWithProduct => r !== null);

//     // 3) map → CheckoutItem[]
//     const checkoutItems = buildCheckoutItemsFromCart(cartWithProduct);

//     // 4) summary เบื้องต้น (ยังไม่คิด shipping/ส่วนลดจริง)
//     const summary = buildSummaryFromItems(checkoutItems, {
//       shippingFee: 0,
//       discount: 0,
//     });

//     // 5) profile → address (shipping / billing)
//     const personProfile = profileRaw.person
//       ? (profileRaw.person as any as PersonProfile)
//       : null;

//     const entityProfile = profileRaw.entity
//       ? (profileRaw.entity as any as EntityProfile)
//       : null;

//     const { shipping, billing } = buildCheckoutAddressesFromProfiles(
//       personProfile,
//       entityProfile
//     );

//     const shippingAddress = pickDefaultAddress(shipping);
//     const billingAddress = pickDefaultAddress(billing);

//     // 6) profile info (mode + email/taxId)
//     const profileInfo = buildCheckoutProfileInfo(
//       personProfile,
//       entityProfile
//     );

//     // 7) ประกอบเป็น CheckoutData
//     const data: CheckoutData = {
//       items: checkoutItems,
//       summary,
//       shippingAddress: shippingAddress ?? null,
//       billingAddress: billingAddress ?? null,
//       profileInfo,
//     };

//     return data;
//   }
// }

// v.1.1.2 ==================================================================

// // src/services/checkout/checkout.service.ts

// import type { CheckoutData, CheckoutItem } from "@/types/checkout";
// import {
//   mapCartItemToCheckoutItem,
//   buildCheckoutSummary,
// } from "@/types/checkout";
// import { fetchSelectedCartItems, fetchProductsForCart } from "./checkout.query";
// import { ProfileService } from "@/services/profile.service";
// import { buildCheckoutAddressesFromProfile } from "./checkout.helpers";

// function emptyCheckoutData(): CheckoutData {
//   return {
//     items: [],
//     summary: {
//       itemCount: 0,
//       subtotal: 0,
//       shippingFee: 0,
//       discount: 0,
//       grandTotal: 0,
//     },
//     shippingAddress: null,
//     billingAddress: null,
//     profileInfo: { mode: null },
//   };
// }

// /**
//  * ดึงข้อมูลครบชุดสำหรับหน้า Checkout
//  */
// export async function getCheckoutData(
//   customerId: number | null
// ): Promise<CheckoutData> {
//   if (!customerId) {
//     return emptyCheckoutData();
//   }

//   // 1) ดึง cart items ที่ถูกเลือก
//   const cartItems = await fetchSelectedCartItems(customerId);
//   if (!cartItems.length) {
//     // ถึงแม้ไม่มีสินค้า ก็ควรโหลด profile ให้
//     const profile = await ProfileService.getProfile(BigInt(customerId));
//     const { shippingAddress, billingAddress, profileInfo } =
//       buildCheckoutAddressesFromProfile({
//         person: profile.person as any,
//         entity: profile.entity as any,
//       });

//     return {
//       ...emptyCheckoutData(),
//       shippingAddress,
//       billingAddress,
//       profileInfo,
//     };
//   }

//   // 2) ดึง products_clearance มา map เพิ่มเติม
//   const skus = Array.from(new Set(cartItems.map((c) => c.product)));
//   const productMap = await fetchProductsForCart(skus);

//   const items: CheckoutItem[] = cartItems.map((cart) => {
//     const product =
//       productMap[cart.product] ??
//       ({
//         id: 0,
//         sku: cart.product,
//         name: cart.product,
//         brand: null,
//         image_url: null,
//         uom_default: cart.uom,
//       } as any);

//     return mapCartItemToCheckoutItem(cart, product);
//   });

//   // 3) summary (ตอนนี้ shippingFee / discount = 0 ไว้ก่อน)
//   const summary = buildCheckoutSummary(items, {
//     shippingFee: 0,
//     discount: 0,
//   });

//   // 4) profile + address
//   const profile = await ProfileService.getProfile(BigInt(customerId));
//   const { shippingAddress, billingAddress, profileInfo } =
//     buildCheckoutAddressesFromProfile({
//       person: profile.person as any,
//       entity: profile.entity as any,
//     });

//   return {
//     items,
//     summary,
//     shippingAddress,
//     billingAddress,
//     profileInfo,
//   };
// }

// /**
//  * ดึงเฉพาะ list item (เผื่อหน้าอื่นอยากใช้)
//  */
// export async function getCheckoutItems(
//   customerId: number | null
// ): Promise<CheckoutItem[]> {
//   const data = await getCheckoutData(customerId);
//   return data.items;
// }

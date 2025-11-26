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

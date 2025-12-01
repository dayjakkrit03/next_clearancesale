// v.1.1.3 ===========================================================
// src/services/checkout/checkout.helpers.ts

import type { CartItem } from "@/types/cart";
import type {
  CheckoutItem,
  CheckoutSummary,
  CheckoutAddress,
  ProductForCheckout,
  CheckoutProfileAddressBook,
} from "@/types/checkout";

import {
  mapCartItemToCheckoutItem,
  buildCheckoutSummary,
  buildCheckoutAddressesFromProfiles as buildCheckoutAddressesFromProfilesCore,
  buildCheckoutProfileAddressBook as buildCheckoutProfileAddressBookCore,
} from "@/types/checkout";

import type { PersonProfile, EntityProfile } from "@/types/profile";

/* ======================================================
 * 1) Cart → CheckoutItem helpers
 * ====================================================== */

export type CartWithProduct = {
  cart: CartItem;
  product: ProductForCheckout;
};

/**
 * แปลงข้อมูล cart + product ที่ดึงจาก DB
 * ให้กลายเป็น CheckoutItem[] สำหรับใช้ในหน้า checkout
 */
export function buildCheckoutItemsFromCart(
  rows: CartWithProduct[]
): CheckoutItem[] {
  return rows.map(({ cart, product }) =>
    mapCartItemToCheckoutItem(cart, product)
  );
}

/**
 * คำนวณสรุปยอดจากรายการสินค้าใน checkout
 * (ห่อ buildCheckoutSummary จาก types/checkout อีกที)
 */
export function buildSummaryFromItems(
  items: CheckoutItem[],
  opts?: { shippingFee?: number; discount?: number }
): CheckoutSummary {
  return buildCheckoutSummary(items, opts);
}

/* ======================================================
 * 2) Profile → Address helpers (wrap ของกลางจาก types/checkout)
 * ====================================================== */

export type CheckoutAddressesFromProfiles = {
  shipping: CheckoutAddress[];
  billing: CheckoutAddress[];
};

/**
 * สร้างรายการ address (shipping / billing) จาก
 * - customer_profile_people
 * - customer_profile_entities
 *
 * จริง ๆ logic หลักอยู่ใน src/types/checkout.ts แล้ว
 * ฟังก์ชันนี้เป็นแค่ wrapper ให้ service layer เรียกใช้งาน
 */
export function buildCheckoutAddressesFromProfiles(
  person: PersonProfile | null | undefined,
  entity: EntityProfile | null | undefined
): CheckoutAddressesFromProfiles {
  return buildCheckoutAddressesFromProfilesCore(
    person ?? null,
    entity ?? null
  );
}

/* ======================================================
 * 2.1) Profile → ProfileAddressBook (2 การ์ด person/entity)
 * ====================================================== */

/**
 * สร้าง "สมุด 2 การ์ดโปรไฟล์" สำหรับ sheet เลือกที่อยู่
 * - การ์ดบุคคลธรรมดา (person)
 * - การ์ดนิติบุคคล (entity)
 *
 * ตัว logic หลักอยู่ใน src/types/checkout.ts
 * ฟังก์ชันนี้เป็น wrapper ให้ service layer เรียกใช้งานเหมือนตัวบน
 */
export function buildCheckoutProfileAddressBookFromProfiles(
  person: PersonProfile | null | undefined,
  entity: EntityProfile | null | undefined
): CheckoutProfileAddressBook {
  return buildCheckoutProfileAddressBookCore(person ?? null, entity ?? null);
}

/* ======================================================
 * 3) Utilities: เลือก default address
 * ====================================================== */

export function pickDefaultAddress(
  addresses: CheckoutAddress[]
): CheckoutAddress | null {
  if (!addresses.length) return null;
  return (
    addresses.find((a) => a.isDefault) ??
    addresses[0] ??
    null
  );
}

// v.1.1.3 ===========================================================

// v.1.1.2 ===========================================================
// // src/services/checkout/checkout.helpers.ts

// import type { CartItem } from "@/types/cart";
// import type {
//   CheckoutItem,
//   CheckoutSummary,
//   CheckoutAddress,
//   ProductForCheckout,
// } from "@/types/checkout";

// import {
//   mapCartItemToCheckoutItem,
//   buildCheckoutSummary,
//   buildCheckoutAddressesFromProfiles as buildCheckoutAddressesFromProfilesCore,
// } from "@/types/checkout";

// import type { PersonProfile, EntityProfile } from "@/types/profile";

// /* ======================================================
//  * 1) Cart → CheckoutItem helpers
//  * ====================================================== */

// export type CartWithProduct = {
//   cart: CartItem;
//   product: ProductForCheckout;
// };

// /**
//  * แปลงข้อมูล cart + product ที่ดึงจาก DB
//  * ให้กลายเป็น CheckoutItem[] สำหรับใช้ในหน้า checkout
//  */
// export function buildCheckoutItemsFromCart(
//   rows: CartWithProduct[]
// ): CheckoutItem[] {
//   return rows.map(({ cart, product }) =>
//     mapCartItemToCheckoutItem(cart, product)
//   );
// }

// /**
//  * คำนวณสรุปยอดจากรายการสินค้าใน checkout
//  * (ห่อ buildCheckoutSummary จาก types/checkout อีกที)
//  */
// export function buildSummaryFromItems(
//   items: CheckoutItem[],
//   opts?: { shippingFee?: number; discount?: number }
// ): CheckoutSummary {
//   return buildCheckoutSummary(items, opts);
// }

// /* ======================================================
//  * 2) Profile → Address helpers (wrap ของกลางจาก types/checkout)
//  * ====================================================== */

// export type CheckoutAddressesFromProfiles = {
//   shipping: CheckoutAddress[];
//   billing: CheckoutAddress[];
// };

// /**
//  * สร้างรายการ address (shipping / billing) จาก
//  * - customer_profile_people
//  * - customer_profile_entities
//  *
//  * จริง ๆ logic หลักอยู่ใน src/types/checkout.ts แล้ว
//  * ฟังก์ชันนี้เป็นแค่ wrapper ให้ service layer เรียกใช้งาน
//  */
// export function buildCheckoutAddressesFromProfiles(
//   person: PersonProfile | null | undefined,
//   entity: EntityProfile | null | undefined
// ): CheckoutAddressesFromProfiles {
//   return buildCheckoutAddressesFromProfilesCore(
//     person ?? null,
//     entity ?? null
//   );
// }

// /* ======================================================
//  * 3) Utilities: เลือก default address
//  * ====================================================== */

// export function pickDefaultAddress(
//   addresses: CheckoutAddress[]
// ): CheckoutAddress | null {
//   if (!addresses.length) return null;
//   return (
//     addresses.find((a) => a.isDefault) ??
//     addresses[0] ??
//     null
//   );
// }

// v.1.1.2 ===========================================================

// v.1.1.1 ===========================================================
// // src/services/checkout/checkout.helpers.ts

// import type { CartItem } from "@/types/cart";
// import type {
//   CheckoutItem,
//   CheckoutSummary,
//   CheckoutAddress,
//   ProductForCheckout,
// } from "@/types/checkout";
// import {
//   mapCartItemToCheckoutItem,
//   buildCheckoutSummary,
//   isEmptyProfileCore,
// } from "@/types/checkout";
// import type { PersonProfile, EntityProfile } from "@/types/profile";

// /* ======================================================
//  * 1) Cart → CheckoutItem helpers
//  * ====================================================== */

// export type CartWithProduct = {
//   cart: CartItem;
//   product: ProductForCheckout;
// };

// /**
//  * แปลงข้อมูล cart + product ที่ดึงจาก DB
//  * ให้กลายเป็น CheckoutItem[] สำหรับใช้ในหน้า checkout
//  */
// export function buildCheckoutItemsFromCart(
//   rows: CartWithProduct[]
// ): CheckoutItem[] {
//   return rows.map(({ cart, product }) =>
//     mapCartItemToCheckoutItem(cart, product)
//   );
// }

// /**
//  * คำนวณสรุปยอดจากรายการสินค้าใน checkout
//  * (ห่อ buildCheckoutSummary จาก types/checkout อีกที)
//  */
// export function buildSummaryFromItems(
//   items: CheckoutItem[],
//   opts?: { shippingFee?: number; discount?: number }
// ): CheckoutSummary {
//   return buildCheckoutSummary(items, opts);
// }

// /* ======================================================
//  * 2) Profile → Address helpers
//  *    (ใช้ข้อมูลจาก customer_profile_people / entities)
//  * ====================================================== */

// /** ตรวจว่าตัวอักษรมีค่าจริงไหม */
// function hasText(value: unknown): boolean {
//   if (value == null) return false;
//   const s = String(value).trim();
//   return s.length > 0;
// }

// /** ต่อ string address โดยข้ามส่วนที่ว่าง */
// function joinAddressParts(parts: Array<string | null | undefined>): string {
//   return parts
//     .map((p) => (p ?? "").trim())
//     .filter((p) => p.length > 0)
//     .join(" ");
// }

// /** ใช้เช็คว่า shipping block หรือ billing block ว่างทั้งชุดไหม */
// function isEmptyAddressBlock(values: Record<string, unknown>): boolean {
//   return Object.values(values).every((v) => !hasText(v));
// }

// export type CheckoutAddressesFromProfiles = {
//   shipping: CheckoutAddress[];
//   billing: CheckoutAddress[];
// };

// /**
//  * สร้างรายการ address (shipping / billing) จาก
//  * - customer_profile_people
//  * - customer_profile_entities
//  *
//  * หมายเหตุ:
//  * - ยังไม่ผูกกับ DB ตรง ๆ แค่ใช้บน UI checkout
//  * - id ของ CheckoutAddress เป็น running number ภายในหน้า ไม่ได้ใช้ id จาก DB
//  */
// export function buildCheckoutAddressesFromProfiles(
//   person: PersonProfile | null | undefined,
//   entity: EntityProfile | null | undefined
// ): CheckoutAddressesFromProfiles {
//   const shipping: CheckoutAddress[] = [];
//   const billing: CheckoutAddress[] = [];

//   let nextId = 1;

//   // ---------- บุคคลธรรมดา ----------
//   if (person && !isEmptyProfileCore(person)) {
//     // shipping
//     const personShipBlock = {
//       addr: person.personShipAddr,
//       dist: person.personShipDistric,
//       prov: person.personShipProvince,
//       country: person.personShipCountry,
//       postcode: person.personShipPostCode,
//     };

//     if (!isEmptyAddressBlock(personShipBlock)) {
//       shipping.push({
//         id: nextId++,
//         type: "HOME",
//         name: person.personCompanyName || "",
//         phone: person.personTel || "",
//         address: joinAddressParts([
//           person.personShipAddr,
//           person.personShipDistric,
//           person.personShipProvince,
//           person.personShipCountry,
//           person.personShipPostCode,
//         ]),
//         isDefault: shipping.length === 0, // อันแรกเป็น default
//       });
//     }

//     // billing (ที่อยู่ออกใบกำกับภาษี)
//     const personBillBlock = {
//       addr: person.personTaxAddr,
//       dist: person.personTaxDistric,
//       prov: person.personTaxProvince,
//       country: person.personTaxCountry,
//       postcode: person.personTaxPostcode,
//     };

//     if (!isEmptyAddressBlock(personBillBlock)) {
//       billing.push({
//         id: nextId++,
//         type: "HOME",
//         name: person.personCompanyName || "",
//         phone: person.personTel || "",
//         address: joinAddressParts([
//           person.personTaxAddr,
//           person.personTaxDistric,
//           person.personTaxProvince,
//           person.personTaxCountry,
//           person.personTaxPostcode,
//         ]),
//         isDefault: billing.length === 0,
//       });
//     }
//   }

//   // ---------- นิติบุคคล ----------
//   if (entity && !isEmptyProfileCore(entity)) {
//     // shipping
//     const entityShipBlock = {
//       addr: entity.entityShipAddr,
//       dist: entity.entityShipDistric,
//       prov: entity.entityShipProvince,
//       country: entity.entityShipCountry,
//       postcode: entity.entityShipPostCode,
//     };

//     if (!isEmptyAddressBlock(entityShipBlock)) {
//       shipping.push({
//         id: nextId++,
//         type: "OFFICE",
//         name: entity.entityCompanyName || "",
//         phone: entity.entityTel || "",
//         address: joinAddressParts([
//           entity.entityShipAddr,
//           entity.entityShipDistric,
//           entity.entityShipProvince,
//           entity.entityShipCountry,
//           entity.entityShipPostCode,
//         ]),
//         isDefault: shipping.length === 0, // ถ้ายังไม่มี (จาก person) อันนี้จะเป็น default
//       });
//     }

//     // billing
//     const entityBillBlock = {
//       addr: entity.entityTaxAddr,
//       dist: entity.entityTaxDistric,
//       prov: entity.entityTaxProvince,
//       country: entity.entityTaxCountry,
//       postcode: entity.entityTaxPostcode,
//     };

//     if (!isEmptyAddressBlock(entityBillBlock)) {
//       billing.push({
//         id: nextId++,
//         type: "OFFICE",
//         name: entity.entityCompanyName || "",
//         phone: entity.entityTel || "",
//         address: joinAddressParts([
//           entity.entityTaxAddr,
//           entity.entityTaxDistric,
//           entity.entityTaxProvince,
//           entity.entityTaxCountry,
//           entity.entityTaxPostcode,
//         ]),
//         isDefault: billing.length === 0,
//       });
//     }
//   }

//   return { shipping, billing };
// }

// /* ======================================================
//  * 3) Utilities: เลือก default address
//  * ====================================================== */

// export function pickDefaultAddress(
//   addresses: CheckoutAddress[]
// ): CheckoutAddress | null {
//   if (!addresses.length) return null;
//   return (
//     addresses.find((a) => a.isDefault) ??
//     addresses[0] ??
//     null
//   );
// }

// v.1.1.1 ===========================================================

// // src/services/checkout/checkout.helpers.ts

// import type {
//   PersonProfile,
//   EntityProfile,
// } from "@/types/profile";
// import type {
//   CheckoutAddress,
//   CheckoutAddressTag,
//   CheckoutProfileInfo,
// } from "@/types/checkout";
// import { buildCheckoutProfileInfo } from "@/types/checkout";

// function buildAddressString(
//   addr?: string,
//   district?: string,
//   province?: string,
//   subDistrict?: string,
//   postCode?: string
// ): string {
//   const parts = [
//     addr,
//     subDistrict,
//     district,
//     province,
//     postCode ? `รหัสไปรษณีย์ ${postCode}` : undefined,
//   ]
//     .map((v) => (v ?? "").trim())
//     .filter((v) => v !== "");

//   return parts.join(" ");
// }

// function createAddress(
//   id: number,
//   tag: CheckoutAddressTag,
//   name: string | undefined,
//   phone: string | undefined,
//   address: string
// ): CheckoutAddress {
//   return {
//     id,
//     type: tag,
//     name: name?.trim() || "",
//     phone: phone?.trim() || "",
//     address,
//     isDefault: true,
//   };
// }

// /**
//  * สร้างที่อยู่จัดส่งจาก PersonProfile
//  */
// function buildShippingFromPerson(person: PersonProfile): CheckoutAddress {
//   const addr = buildAddressString(
//     person.personShipAddr,
//     person.personShipCountry,
//     person.personShipProvince,
//     person.personShipDistric,
//     person.personShipPostCode
//   );

//   return createAddress(
//     1,
//     "HOME",
//     person.personCompanyName,
//     person.personTel,
//     addr
//   );
// }

// /**
//  * สร้างที่อยู่จัดส่งจาก EntityProfile
//  */
// function buildShippingFromEntity(entity: EntityProfile): CheckoutAddress {
//   const addr = buildAddressString(
//     entity.entityShipAddr,
//     entity.entityShipCountry,
//     entity.entityShipProvince,
//     entity.entityShipDistric,
//     entity.entityShipPostCode
//   );

//   return createAddress(
//     1,
//     "OFFICE",
//     entity.entityCompanyName ?? entity.entityCustomerName,
//     entity.entityTel,
//     addr
//   );
// }

// /**
//  * ที่อยู่ออกใบกำกับภาษีจาก PersonProfile
//  */
// function buildBillingFromPerson(person: PersonProfile): CheckoutAddress {
//   const addr = buildAddressString(
//     person.personTaxAddr,
//     person.personTaxCountry,
//     person.personTaxProvince,
//     person.personTaxDistric,
//     person.personTaxPostcode
//   );

//   return createAddress(
//     2,
//     "HOME",
//     person.personCompanyName,
//     person.personTel,
//     addr || buildAddressString(
//       person.personShipAddr,
//       person.personShipCountry,
//       person.personShipProvince,
//       person.personShipDistric,
//       person.personShipPostCode
//     )
//   );
// }

// /**
//  * ที่อยู่ออกใบกำกับภาษีจาก EntityProfile
//  */
// function buildBillingFromEntity(entity: EntityProfile): CheckoutAddress {
//   const addr = buildAddressString(
//     entity.entityTaxAddr,
//     entity.entityTaxCountry,
//     entity.entityTaxProvince,
//     entity.entityTaxDistric,
//     entity.entityTaxPostcode
//   );

//   return createAddress(
//     2,
//     "OFFICE",
//     entity.entityCompanyName,
//     entity.entityTel,
//     addr || buildAddressString(
//       entity.entityShipAddr,
//       entity.entityShipCountry,
//       entity.entityShipProvince,
//       entity.entityShipDistric,
//       entity.entityShipPostCode
//     )
//   );
// }

// /**
//  * รวมทุกอย่าง: shipping + billing + profileInfo
//  */
// export function buildCheckoutAddressesFromProfile(params: {
//   person: PersonProfile | null;
//   entity: EntityProfile | null;
// }): {
//   shippingAddress: CheckoutAddress | null;
//   billingAddress: CheckoutAddress | null;
//   profileInfo: CheckoutProfileInfo;
// } {
//   const { person, entity } = params;

//   const profileInfo = buildCheckoutProfileInfo(person, entity);

//   if (profileInfo.mode === "entity" && entity) {
//     return {
//       shippingAddress: buildShippingFromEntity(entity),
//       billingAddress: buildBillingFromEntity(entity),
//       profileInfo,
//     };
//   }

//   if (profileInfo.mode === "person" && person) {
//     return {
//       shippingAddress: buildShippingFromPerson(person),
//       billingAddress: buildBillingFromPerson(person),
//       profileInfo,
//     };
//   }

//   return {
//     shippingAddress: null,
//     billingAddress: null,
//     profileInfo,
//   };
// }

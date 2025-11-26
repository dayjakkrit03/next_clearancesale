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

// v.1.1.2 ===============================================
// src/app/profile/profile.types.ts

export type {
  PersonProfile,
  EntityProfile,
  ProfilePayload as ProfileRequestPayload,
  ProfileResponse,
  ProfileMode as Mode,
} from "@/types/profile";

// v.1.1.2 ===============================================

// // src/app/profile/profile.types.ts

// export type PersonProfile = {
//   personCompanyName?: string;
//   personIdCard?: string;
//   personTel?: string;
//   personMail?: string;
//   personContactMore?: string;

//   personShipAddr?: string;
//   personShipDistric?: string;
//   personShipProvince?: string;
//   personShipCountry?: string;
//   personShipPostCode?: string;

//   personTaxAddr?: string;
//   personTaxDistric?: string;
//   personTaxProvince?: string;
//   personTaxCountry?: string;
//   personTaxPostcode?: string;
// };

// export type EntityProfile = {
//   entityCompanyName?: string;
//   entityCustomerName?: string;
//   entityTel?: string;
//   entityMail?: string;
//   entityContactMore?: string;

//   entityTaxId?: string;
//   entityTaxAddr?: string;
//   entityTaxDistric?: string;
//   entityTaxProvince?: string;
//   entityTaxCountry?: string;
//   entityTaxPostcode?: string;

//   entityShipAddr?: string;
//   entityShipDistric?: string;
//   entityShipProvince?: string;
//   entityShipCountry?: string;
//   entityShipPostCode?: string;
// };

// export type ProfileResponse = {
//   ok: boolean;
//   person?: PersonProfile | null;
//   entity?: EntityProfile | null;
// };

// export type Mode = "person" | "entity";

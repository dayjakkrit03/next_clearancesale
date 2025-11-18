// v.1.1.2 ===============================================
// src/types/profile.ts

/* =======================
 * 1) Profile core types
 * ======================= */

export type PersonProfile = {
  personCompanyName?: string;
  personIdCard?: string;
  personTel?: string;
  personMail?: string;
  personContactMore?: string;

  personShipAddr?: string;
  personShipDistric?: string;
  personShipProvince?: string;
  personShipCountry?: string;
  personShipPostCode?: string;

  personTaxAddr?: string;
  personTaxDistric?: string;
  personTaxProvince?: string;
  personTaxCountry?: string;
  personTaxPostcode?: string;
};

export type EntityProfile = {
  entityCompanyName?: string;
  entityCustomerName?: string;
  entityTel?: string;
  entityMail?: string;
  entityContactMore?: string;

  entityTaxId?: string;
  entityTaxAddr?: string;
  entityTaxDistric?: string;
  entityTaxProvince?: string;
  entityTaxCountry?: string;
  entityTaxPostcode?: string;

  entityShipAddr?: string;
  entityShipDistric?: string;
  entityShipProvince?: string;
  entityShipCountry?: string;
  entityShipPostCode?: string;
};

/** payload ที่ client จะส่งเข้า API /api/profile */
export type ProfilePayload = {
  person?: PersonProfile | null;
  entity?: EntityProfile | null;
};

/** response มาตรฐานจาก /api/profile */
export type ProfileResponse = {
  ok: boolean;
} & ProfilePayload;

/** โหมดที่ใช้ใน UI */
export type ProfileMode = "person" | "entity";

/** alias ไว้รองรับโค้ดเก่าที่เคยใช้ชื่อ Mode */
export type Mode = ProfileMode;

/* =======================
 * 2) Location / Combobox types
 * ใช้ร่วมกับ LocationSelect + API /api/locations/*
 * ======================= */

/**
 * generic option สำหรับ combobox
 * raw = ข้อมูลดิบจาก backend (เช่น มี provinceId/districtId ติดมาด้วย)
 */
export type LocationOption<T = any> = {
  id: number | string; // ✅ ใช้ id แทน value
  label: string;
  raw?: T;
};

/** จังหวัดที่ API /api/locations/provinces ส่งกลับ */
export type ProvinceItem = {
  id: number;
  name: string;
};

/** อำเภอ/เขต ที่ API /api/locations/districts ส่งกลับ */
export type DistrictItem = {
  id: number;
  name: string;
  provinceId: number;
};

/** ตำบล/แขวง ที่ API /api/locations/sub-districts ส่งกลับ */
export type SubDistrictItem = {
  id: number;
  name: string;
  districtId: number;
};

/**
 * รหัสไปรษณีย์ที่ API /api/locations/postal-codes ส่งกลับ
 * มีทั้ง code และชื่อจังหวัด/อำเภอ/ตำบลไว้ใช้ auto-fill
 */
export type PostalCodeItem = {
  id: number;
  code: number | string;

  provinceId: number;
  districtId: number;
  subDistrictId: number;

  provinceName: string;
  districtName: string;
  subDistrictName: string;
};

// [FIX] เพิ่มการ export PostalCodeRaw เพื่อให้ EntityProfileForm.tsx สามารถ import ได้
// และกำหนดให้มีโครงสร้างเดียวกับ PostalCodeItem
export type PostalCodeRaw = PostalCodeItem;

// v.1.1.2 ===============================================

// // src/types/profile.ts

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

// /** payload ที่ client จะส่งเข้า API /api/profile */
// export type ProfilePayload = {
//   person?: PersonProfile | null;
//   entity?: EntityProfile | null;
// };

// /** response มาตรฐานจาก /api/profile */
// export type ProfileResponse = {
//   ok: boolean;
// } & ProfilePayload;

// /** โหมดที่ใช้ใน UI */
// export type ProfileMode = "person" | "entity";

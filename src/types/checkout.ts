// v.1.1.8 ===============================================================
// src/types/checkout.ts

import type { CartItem } from "@/types/cart";
import type { PersonProfile, EntityProfile } from "@/types/profile";

/* ======================================================
 *  Address Types
 * ====================================================== */

export type CheckoutAddressTag = "HOME" | "OFFICE";

/** ใช้บอกว่า address นี้เอาไว้ทำอะไรในหน้า checkout */
export type CheckoutAddressPurpose = "shipping" | "billing";

/** โหมดโปรไฟล์ที่ใช้งานใน checkout */
export type CheckoutProfileMode = "person" | "entity" | null;

export type CheckoutAddress = {
  id: number;
  /** HOME = บุคคลธรรมดา, OFFICE = นิติบุคคล (เอาไป map เป็น label ที่ UI) */
  type: CheckoutAddressTag;

  /** ชื่อที่โชว์บนบล็อก เช่น จักรกฤษ รุ่งวงษ์ / บจก.อินเตอร์ลิ้งค์ฯ */
  name: string;

  /** เบอร์ติดต่อ */
  phone: string;

  /** ที่อยู่รวมทุกอย่างในรูปแบบพร้อมแสดง */
  address: string;

  /** ใช้ทำ “ค่าเริ่มต้น” ใน sheet / card list */
  isDefault: boolean;

  /** ใช้แยกว่าบล็อกนี้ใช้เป็น “ที่อยู่จัดส่ง” หรือ “ที่อยู่ออกใบกำกับภาษี” */
  purpose?: CheckoutAddressPurpose;

  /** ใช้รู้ว่า address นี้มาจาก profile แบบไหน */
  profileMode?: Exclude<CheckoutProfileMode, null>; // "person" | "entity"

  /** id row ของตาราง customer_profile_people/entities (ถ้ามี) */
  profileSourceId?: number | string | bigint;
};

/* ======================================================
 *  Helper: Map Profile → CheckoutAddress
 *  (ยังเป็น pure function ใช้ได้ทั้งกับ mock / service layer)
 * ====================================================== */

/** ใช้เช็คว่าชุด field address ว่างหมดไหม */
function isEmptyAddressFields(fields: Array<string | null | undefined>) {
  return fields.map((v) => (v ?? "").trim()).every((v) => v === "");
}

export function mapPersonProfileToCheckoutAddresses(
  person: PersonProfile | null
): {
  shippingAddress?: CheckoutAddress;
  billingAddress?: CheckoutAddress;
} {
  if (!person) return {};

  // ✅ ใช้ "ชื่อลูกค้า" เป็นหลัก
  const baseName =
    (person as any).personName ||
    (person as any).personCustomerName ||
    (person as any).personCompanyName ||
    "บุคคลธรรมดา";

  const phone = person.personTel ?? "";

  // ที่อยู่จัดส่ง: เอา "รายละเอียดผู้รับสินค้าเพิ่มเติม" ไปต่อใน address แทน
  const shipParts = [
    person.personContactMore,
    person.personShipAddr,
    person.personShipDistric,
    person.personShipProvince,
    person.personShipCountry,
    person.personShipPostCode,
  ];

  const taxParts = [
    person.personTaxAddr,
    person.personTaxDistric,
    person.personTaxProvince,
    person.personTaxCountry,
    person.personTaxPostcode,
  ];

  const shippingAddress = !isEmptyAddressFields(shipParts)
    ? ({
        id: 1,
        type: "HOME",
        name: baseName, // ← แสดงเป็น "จักรกฤษ รุ่งวงษ์"
        phone,
        address: shipParts.filter(Boolean).join(" "),
        isDefault: true,
        purpose: "shipping",
        profileMode: "person",
        profileSourceId: (person as any).id,
      } satisfies CheckoutAddress)
    : undefined;

  const billingAddress = !isEmptyAddressFields(taxParts)
    ? ({
        id: 2,
        type: "HOME",
        name: baseName, // ← ใช้ชื่อเดียวกัน
        phone,
        address: taxParts.filter(Boolean).join(" "),
        isDefault: true,
        purpose: "billing",
        profileMode: "person",
        profileSourceId: (person as any).id,
      } satisfies CheckoutAddress)
    : undefined;

  return { shippingAddress, billingAddress };
}

export function mapEntityProfileToCheckoutAddresses(
  entity: EntityProfile | null
): {
  shippingAddress?: CheckoutAddress;
  billingAddress?: CheckoutAddress;
} {
  if (!entity) return {};

  const baseName =
    entity.entityCompanyName || entity.entityCustomerName || "นิติบุคคล";
  const phone = entity.entityTel ?? "";

  const shipParts = [
    entity.entityShipAddr,
    entity.entityShipDistric,
    entity.entityShipProvince,
    entity.entityShipCountry,
    entity.entityShipPostCode,
  ];
  const taxParts = [
    entity.entityTaxAddr,
    entity.entityTaxDistric,
    entity.entityTaxProvince,
    entity.entityTaxCountry,
    entity.entityTaxPostcode,
  ];

  const shippingAddress = !isEmptyAddressFields(shipParts)
    ? ({
        id: 3,
        type: "OFFICE",
        name: baseName,
        phone,
        address: shipParts.filter(Boolean).join(" "),
        isDefault: true,
        purpose: "shipping",
        profileMode: "entity",
        profileSourceId: (entity as any).id,
      } satisfies CheckoutAddress)
    : undefined;

  const billingAddress = !isEmptyAddressFields(taxParts)
    ? ({
        id: 4,
        type: "OFFICE",
        name: baseName,
        phone,
        address: taxParts.filter(Boolean).join(" "),
        isDefault: true,
        purpose: "billing",
        profileMode: "entity",
        profileSourceId: (entity as any).id,
      } satisfies CheckoutAddress)
    : undefined;

  return { shippingAddress, billingAddress };
}

/**
 * รวม person + entity ให้เป็น list สำหรับ checkout (ใช้หน้าแรก)
 * - shipping: ใช้ในบล็อก “ที่อยู่จัดส่ง”
 * - billing: ใช้ในบล็อก “ที่อยู่ออกใบกำกับภาษี”
 */
export function buildCheckoutAddressesFromProfiles(
  person: PersonProfile | null,
  entity: EntityProfile | null
): {
  shipping: CheckoutAddress[];
  billing: CheckoutAddress[];
} {
  const { shippingAddress: personShip, billingAddress: personBill } =
    mapPersonProfileToCheckoutAddresses(person);
  const { shippingAddress: entityShip, billingAddress: entityBill } =
    mapEntityProfileToCheckoutAddresses(entity);

  const shipping: CheckoutAddress[] = [];
  const billing: CheckoutAddress[] = [];

  let nextId = 1;

  // ให้ทุกตัวที่ push เข้ามา isDefault = false ก่อน
  for (const addr of [personShip, entityShip]) {
    if (addr) {
      shipping.push({ ...addr, id: nextId++, isDefault: false });
    }
  }

  for (const addr of [personBill, entityBill]) {
    if (addr) {
      billing.push({ ...addr, id: nextId++, isDefault: false });
    }
  }

  // ตั้งค่า isDefault true เฉพาะตัวแรกของแต่ละกลุ่มเท่านั้น
  if (shipping[0]) shipping[0].isDefault = true;
  if (billing[0]) billing[0].isDefault = true;

  return { shipping, billing };
}

/* ======================================================
 *  Profile Address Groups (ใช้สำหรับหน้าเลือกใน Sheet)
 * ====================================================== */

// การ์ดหนึ่งใบในหน้าเลือก: รวมทั้งที่อยู่จัดส่ง + ออกใบกำกับของโหมดเดียวกัน
export type CheckoutProfileAddressGroup = {
  /** โหมดของโปรไฟล์ในกลุ่มนี้ */
  mode: Exclude<CheckoutProfileMode, null>; // "person" | "entity"
  /** ที่อยู่จัดส่ง (ถ้ามี) */
  shipping?: CheckoutAddress;
  /** ที่อยู่ออกใบกำกับภาษี (ถ้ามี) */
  billing?: CheckoutAddress;
};

// สมุดรวบรวม 2 การ์ด: บุคคลธรรมดา + นิติบุคคล
export type CheckoutProfileAddressBook = {
  person?: CheckoutProfileAddressGroup;
  entity?: CheckoutProfileAddressGroup;
};

// helper สำหรับสร้างข้อมูล 2 การ์ด ให้ sheet ใช้ render
export function buildCheckoutProfileAddressBook(
  person: PersonProfile | null,
  entity: EntityProfile | null
): CheckoutProfileAddressBook {
  const { shippingAddress: personShip, billingAddress: personBill } =
    mapPersonProfileToCheckoutAddresses(person);
  const { shippingAddress: entityShip, billingAddress: entityBill } =
    mapEntityProfileToCheckoutAddresses(entity);

  const book: CheckoutProfileAddressBook = {};

  if (personShip || personBill) {
    book.person = {
      mode: "person",
      shipping: personShip,
      billing: personBill,
    };
  }

  if (entityShip || entityBill) {
    book.entity = {
      mode: "entity",
      shipping: entityShip,
      billing: entityBill,
    };
  }

  return book;
}

/* ======================================================
 *  Delivery Options
 * ====================================================== */

export type DeliveryOption = "standard" | "express";

/* ======================================================
 *  Checkout Item (ตัวจริง + UI fields)
 * ====================================================== */

export type CheckoutItem = {
  /** id แถวใน checkout (ส่วนใหญ่ใช้ cart.id) */
  id: number;

  /** Mapping back to DB */
  cartId?: number;
  productId?: number;
  product?: string;

  /** Owner */
  customerId?: number;

  /** แสดงผลบน UI */
  name: string;
  sku?: string;
  brand?: string;

  /** รูปสินค้า */
  image: string;
  imageUrl?: string;

  /** ราคาต่อหน่วย */
  price: number;
  unitPrice?: number;

  /** จำนวนที่ลูกค้าซื้อ */
  quantity: number;

  /** หน่วยขาย เช่น PC., M. */
  uom?: string;

  /** ราคาปกติ (ก่อนลด) */
  originalPrice?: number;

  /** ส่วนลดเป็น % เช่น 60 => ประหยัด 60% */
  discountPercent?: number;

  /** line total จาก DB หรือ service คำนวณ */
  lineTotal?: number;

  /** ใช้เลือกส่งบางรายการไป checkout */
  checked?: boolean;

  /** Raw cart item จาก DB */
  rawCart?: CartItem;

  /** (UI only) store name */
  store?: string;
};

/* ======================================================
 *  Summary Types
 * ====================================================== */

export type CheckoutSummary = {
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  grandTotal: number;
};

/* ======================================================
 *  Profile Info (ใช้หน้า Checkout)
 * ====================================================== */

export type CheckoutProfileInfo = {
  mode: CheckoutProfileMode;
  email?: string;
  taxId?: string;
};

/* ======================================================
 *  Checkout Data (ภาพรวมสำหรับหน้า checkout)
 * ====================================================== */

export type CheckoutData = {
  items: CheckoutItem[];
  summary: CheckoutSummary;

  shippingAddress?: CheckoutAddress | null;
  billingAddress?: CheckoutAddress | null;
  profileInfo?: CheckoutProfileInfo;

  /** ใช้สำหรับหน้าเลือกที่อยู่ (2 การ์ด person + entity) */
  addressProfiles?: CheckoutProfileAddressBook;
};

/* ======================================================
 *  Voucher Type
 * ====================================================== */

export type CheckoutVoucher = {
  code: string;
  discount: number;
};

/* ======================================================
 *  Payment Methods
 * ====================================================== */

export type PaymentMethod =
  | "card"
  | "qr"
  | "cash"
  | "linepay"
  | "internetbanking"
  | "banktransfer";

export type PaymentMethodsArray = PaymentMethod[];

export type CheckoutPaymentData = {
  amount: number;
  orderId: string;
  items: CheckoutItem[];
  subtotal: number;
  shippingFee: number;
  shippingDiscount: number;
  voucherDiscount: number;
  appliedVouchers: CheckoutVoucher[];
};

/* ======================================================
 *  Invoice Info
 * ====================================================== */

export type CheckoutInvoiceInfo = {
  email: string;
  billingAddress: string;
  taxId?: string;
  headOfficeBranch?: string;
};

/* ======================================================
 *  Summary Section Props
 * ====================================================== */

export type CheckoutSummaryProps = {
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  voucherDiscount: number;
  total: number;
  onPlaceOrder: () => void;
};

/* ======================================================
 *  Product Info For Mapping Cart → Checkout
 * ====================================================== */

// ✅ ข้อมูลสินค้าใช้ตอน join กับ cart เพื่อนำไปสร้าง CheckoutItem
export type ProductForCheckout = {
  id: number;
  sku: string;
  name: string;
  brand: string | null;
  image_url: string | null;
  uom_default: string | null;

  // ข้อมูลเสริม (optional) เอาไว้ใช้ในอนาคต / UI
  categoryId?: number | null;
  originalPrice?: number | null;
  discountLabel?: string | null;
  clearanceSales?: boolean | null;
  clearanceQuantity?: number | null;
  freeShippingEligible?: boolean | null;
  freeShipMinimum?: number | null;
  warrantyMonths?: number | null;
  returnDays?: number | null;

  // เงื่อนไขการขาย (CUT / ROLL ฯลฯ) จาก product_conditions
  conditions?: any[] | null;
};

/* ======================================================
 *  Mappers
 * ====================================================== */

export function mapCartItemToCheckoutItem(
  cart: CartItem,
  product: ProductForCheckout
): CheckoutItem {
  const quantity = cart.quantity ?? 0;
  const unitPrice = cart.price ?? 0;

  const lineTotal =
    typeof cart.price_amount === "number"
      ? cart.price_amount
      : quantity * unitPrice;

  const imageUrl = product.image_url ?? "";

  return {
    id: cart.id,
    cartId: cart.id,
    productId: product.id,
    product: cart.product,

    customerId: cart.id_customer,

    name: product.name || cart.product,
    sku: product.sku,
    brand: product.brand ?? undefined,

    image: imageUrl,
    imageUrl,

    price: unitPrice,
    unitPrice,
    quantity,
    uom: cart.uom || product.uom_default || undefined,

    lineTotal,
    checked: cart.check_product,

    rawCart: cart,
  };
}

/* ======================================================
 *  Build Summary
 * ====================================================== */

export function buildCheckoutSummary(
  items: CheckoutItem[],
  opts?: {
    shippingFee?: number;
    discount?: number;
  }
): CheckoutSummary {
  const shippingFee = opts?.shippingFee ?? 0;
  const discount = opts?.discount ?? 0;

  const selected = items.filter((i) => i.checked);

  const itemCount = selected.length;

  const subtotal = selected.reduce((sum, item) => {
    const line =
      typeof item.lineTotal === "number"
        ? item.lineTotal
        : item.price * item.quantity;
    return sum + line;
  }, 0);

  const grandTotal = subtotal + shippingFee - discount;

  return {
    itemCount,
    subtotal,
    shippingFee,
    discount,
    grandTotal,
  };
}

/* ======================================================
 *  Profile Checker
 * ====================================================== */

export function isEmptyProfileCore(
  obj: Record<string, unknown> | null | undefined
): boolean {
  if (!obj) return true;
  const values = Object.values(obj);
  if (values.length === 0) return true;

  return values.every((v) => {
    if (v === null || v === undefined) return true;
    const s = String(v).trim();
    return s === "";
  });
}

export function buildCheckoutProfileInfo(
  person: PersonProfile | null,
  entity: EntityProfile | null
): CheckoutProfileInfo {
  const hasPerson =
    !!person &&
    [
      (person as any).personCustomerName,
      person.personShipAddr,
      person.personTaxAddr,
      person.personMail,
      person.personTel,
    ]
      .map((v) => (v ?? "").toString().trim())
      .some((v) => v !== "");

  const hasEntity =
    !!entity &&
    [
      entity.entityCompanyName,
      (entity as any).entityCustomerName,
      entity.entityShipAddr,
      entity.entityTaxAddr,
      entity.entityMail,
      entity.entityTaxId,
    ]
      .map((v) => (v ?? "").toString().trim())
      .some((v) => v !== "");

  // ---------- ตัดสินโหมดโปรไฟล์ (ให้บุคคลธรรมดาเป็นค่าเริ่มต้น) ----------

  // ถ้ามีข้อมูลบุคคลธรรมดาเมื่อไหร่ → ใช้ person ก่อนเสมอ
  if (hasPerson) {
    return {
      mode: "person",
      email: person?.personMail ?? undefined,
      taxId: person?.personIdCard ?? undefined,
    };
  }

  // ถ้าไม่มีบุคคลธรรมดา แต่มีนิติบุคคล → ใช้ entity
  if (hasEntity) {
    return {
      mode: "entity",
      email: entity?.entityMail ?? undefined,
      taxId: entity?.entityTaxId ?? undefined,
    };
  }

  // ไม่มีข้อมูลทั้งคู่
  return { mode: null };
}

// v.1.1.8 ===============================================================

// v.1.1.7 ===============================================================
// // src/types/checkout.ts

// import type { CartItem } from "@/types/cart";
// import type { PersonProfile, EntityProfile } from "@/types/profile";

// /* ======================================================
//  *  Address Types
//  * ====================================================== */

// export type CheckoutAddressTag = "HOME" | "OFFICE";

// /** ใช้บอกว่า address นี้เอาไว้ทำอะไรในหน้า checkout */
// export type CheckoutAddressPurpose = "shipping" | "billing";

// /** โหมดโปรไฟล์ที่ใช้งานใน checkout */
// export type CheckoutProfileMode = "person" | "entity" | null;

// export type CheckoutAddress = {
//   id: number;
//   /** HOME = บุคคลธรรมดา, OFFICE = นิติบุคคล (เอาไป map เป็น label ที่ UI) */
//   type: CheckoutAddressTag;

//   /** ชื่อที่โชว์บนบล็อก เช่น สิรดา ถวิก / บจก.อินเตอร์ลิ้งค์ฯ */
//   name: string;

//   /** เบอร์ติดต่อ */
//   phone: string;

//   /** ที่อยู่รวมทุกอย่างในรูปแบบพร้อมแสดง */
//   address: string;

//   /** ใช้ทำ “ค่าเริ่มต้น” ใน sheet / card list */
//   isDefault: boolean;

//   /** ใช้แยกว่าบล็อกนี้ใช้เป็น “ที่อยู่จัดส่ง” หรือ “ที่อยู่ออกใบกำกับภาษี” */
//   purpose?: CheckoutAddressPurpose;

//   /** ใช้รู้ว่า address นี้มาจาก profile แบบไหน */
//   profileMode?: Exclude<CheckoutProfileMode, null>; // "person" | "entity"

//   /** id row ของตาราง customer_profile_people/entities (ถ้ามี) */
//   profileSourceId?: number | string | bigint;
// };

// /* ======================================================
//  *  Helper: Map Profile → CheckoutAddress
//  *  (ยังเป็น pure function ใช้ได้ทั้งกับ mock / service layer)
//  * ====================================================== */

// /** ใช้เช็คว่าชุด field address ว่างหมดไหม */
// function isEmptyAddressFields(fields: Array<string | null | undefined>) {
//   return fields.map((v) => (v ?? "").trim()).every((v) => v === "");
// }

// export function mapPersonProfileToCheckoutAddresses(
//   person: PersonProfile | null
// ): {
//   shippingAddress?: CheckoutAddress;
//   billingAddress?: CheckoutAddress;
// } {
//   if (!person) return {};

//   // ✅ ใช้ "ชื่อลูกค้า" เป็นหลัก
//   const baseName =
//     (person as any).personName ||
//     (person as any).personCustomerName ||
//     (person as any).personCompanyName ||
//     "บุคคลธรรมดา";

//   const phone = person.personTel ?? "";

//   // ที่อยู่จัดส่ง: เอา "รายละเอียดผู้รับสินค้าเพิ่มเติม" ไปต่อใน address แทน
//   const shipParts = [
//     person.personContactMore,
//     person.personShipAddr,
//     person.personShipDistric,
//     person.personShipProvince,
//     person.personShipCountry,
//     person.personShipPostCode,
//   ];

//   const taxParts = [
//     person.personTaxAddr,
//     person.personTaxDistric,
//     person.personTaxProvince,
//     person.personTaxCountry,
//     person.personTaxPostcode,
//   ];

//   const shippingAddress = !isEmptyAddressFields(shipParts)
//     ? ({
//         id: 1,
//         type: "HOME",
//         name: baseName, // ← แสดงเป็น "จักรกฤษ รุ่งวงษ์"
//         phone,
//         address: shipParts.filter(Boolean).join(" "),
//         isDefault: true,
//         purpose: "shipping",
//         profileMode: "person",
//         profileSourceId: (person as any).id,
//       } satisfies CheckoutAddress)
//     : undefined;

//   const billingAddress = !isEmptyAddressFields(taxParts)
//     ? ({
//         id: 2,
//         type: "HOME",
//         name: baseName, // ← ใช้ชื่อเดียวกัน
//         phone,
//         address: taxParts.filter(Boolean).join(" "),
//         isDefault: true,
//         purpose: "billing",
//         profileMode: "person",
//         profileSourceId: (person as any).id,
//       } satisfies CheckoutAddress)
//     : undefined;

//   return { shippingAddress, billingAddress };
// }


// export function mapEntityProfileToCheckoutAddresses(
//   entity: EntityProfile | null
// ): {
//   shippingAddress?: CheckoutAddress;
//   billingAddress?: CheckoutAddress;
// } {
//   if (!entity) return {};

//   const baseName =
//     entity.entityCompanyName || entity.entityCustomerName || "นิติบุคคล";
//   const phone = entity.entityTel ?? "";

//   const shipParts = [
//     entity.entityShipAddr,
//     entity.entityShipDistric,
//     entity.entityShipProvince,
//     entity.entityShipCountry,
//     entity.entityShipPostCode,
//   ];
//   const taxParts = [
//     entity.entityTaxAddr,
//     entity.entityTaxDistric,
//     entity.entityTaxProvince,
//     entity.entityTaxCountry,
//     entity.entityTaxPostcode,
//   ];

//   const shippingAddress = !isEmptyAddressFields(shipParts)
//     ? ({
//         id: 3,
//         type: "OFFICE",
//         name: baseName,
//         phone,
//         address: shipParts.filter(Boolean).join(" "),
//         isDefault: true,
//         purpose: "shipping",
//         profileMode: "entity",
//         profileSourceId: (entity as any).id,
//       } satisfies CheckoutAddress)
//     : undefined;

//   const billingAddress = !isEmptyAddressFields(taxParts)
//     ? ({
//         id: 4,
//         type: "OFFICE",
//         name: baseName,
//         phone,
//         address: taxParts.filter(Boolean).join(" "),
//         isDefault: true,
//         purpose: "billing",
//         profileMode: "entity",
//         profileSourceId: (entity as any).id,
//       } satisfies CheckoutAddress)
//     : undefined;

//   return { shippingAddress, billingAddress };
// }

// /**
//  * รวม person + entity ให้เป็น list สำหรับ checkout
//  * - shipping: ใช้ในบล็อก “ที่อยู่จัดส่ง”
//  * - billing: ใช้ในบล็อก “ที่อยู่ออกใบกำกับภาษี”
//  *
//  * (ตอนนี้ยังไม่ได้ใช้ในหน้า checkout จริง แต่เตรียมไว้ให้ service layer เรียก)
//  */
// export function buildCheckoutAddressesFromProfiles(
//   person: PersonProfile | null,
//   entity: EntityProfile | null
// ): {
//   shipping: CheckoutAddress[];
//   billing: CheckoutAddress[];
// } {
//   const { shippingAddress: personShip, billingAddress: personBill } =
//     mapPersonProfileToCheckoutAddresses(person);
//   const { shippingAddress: entityShip, billingAddress: entityBill } =
//     mapEntityProfileToCheckoutAddresses(entity);

//   const shipping: CheckoutAddress[] = [];
//   const billing: CheckoutAddress[] = [];

//   let nextId = 1;

//   // ให้ทุกตัวที่ push เข้ามา isDefault = false ก่อน
//   for (const addr of [personShip, entityShip]) {
//     if (addr) {
//       shipping.push({ ...addr, id: nextId++, isDefault: false });
//     }
//   }

//   for (const addr of [personBill, entityBill]) {
//     if (addr) {
//       billing.push({ ...addr, id: nextId++, isDefault: false });
//     }
//   }

//   // ตั้งค่า isDefault true เฉพาะตัวแรกของแต่ละกลุ่มเท่านั้น
//   if (shipping[0]) shipping[0].isDefault = true;
//   if (billing[0]) billing[0].isDefault = true;

//   return { shipping, billing };
// }

// /* ======================================================
//  *  Delivery Options
//  * ====================================================== */

// export type DeliveryOption = "standard" | "express";

// /* ======================================================
//  *  Checkout Item (ตัวจริง + UI fields)
//  * ====================================================== */

// export type CheckoutItem = {
//   /** id แถวใน checkout (ส่วนใหญ่ใช้ cart.id) */
//   id: number;

//   /** Mapping back to DB */
//   cartId?: number;
//   productId?: number;
//   product?: string;

//   /** Owner */
//   customerId?: number;

//   /** แสดงผลบน UI */
//   name: string;
//   sku?: string;
//   brand?: string;

//   /** รูปสินค้า */
//   image: string;
//   imageUrl?: string;

//   /** ราคาต่อหน่วย */
//   price: number;
//   unitPrice?: number;

//   /** จำนวนที่ลูกค้าซื้อ */
//   quantity: number;

//   /** หน่วยขาย เช่น PC., M. */
//   uom?: string;

//   /** ราคาปกติ (ก่อนลด) */
//   originalPrice?: number;

//   /** ส่วนลดเป็น % เช่น 60 => ประหยัด 60% */
//   discountPercent?: number;

//   /** line total จาก DB หรือ service คำนวณ */
//   lineTotal?: number;

//   /** ใช้เลือกส่งบางรายการไป checkout */
//   checked?: boolean;

//   /** Raw cart item จาก DB */
//   rawCart?: CartItem;

//   /** (UI only) store name */
//   store?: string;
// };

// /* ======================================================
//  *  Summary Types
//  * ====================================================== */

// export type CheckoutSummary = {
//   itemCount: number;
//   subtotal: number;
//   shippingFee: number;
//   discount: number;
//   grandTotal: number;
// };

// /* ======================================================
//  *  Profile Info (ใช้หน้า Checkout)
//  * ====================================================== */

// export type CheckoutProfileInfo = {
//   mode: CheckoutProfileMode;
//   email?: string;
//   taxId?: string;
// };

// /* ======================================================
//  *  Checkout Data (ภาพรวมสำหรับหน้า checkout)
//  * ====================================================== */

// export type CheckoutData = {
//   items: CheckoutItem[];
//   summary: CheckoutSummary;

//   shippingAddress?: CheckoutAddress | null;
//   billingAddress?: CheckoutAddress | null;
//   profileInfo?: CheckoutProfileInfo;
// };

// /* ======================================================
//  *  Voucher Type
//  * ====================================================== */

// export type CheckoutVoucher = {
//   code: string;
//   discount: number;
// };

// /* ======================================================
//  *  Payment Methods
//  * ====================================================== */

// export type PaymentMethod =
//   | "card"
//   | "qr"
//   | "cash"
//   | "linepay"
//   | "internetbanking"
//   | "banktransfer";

// export type PaymentMethodsArray = PaymentMethod[];

// export type CheckoutPaymentData = {
//   amount: number;
//   orderId: string;
//   items: CheckoutItem[];
//   subtotal: number;
//   shippingFee: number;
//   shippingDiscount: number;
//   voucherDiscount: number;
//   appliedVouchers: CheckoutVoucher[];
// };

// /* ======================================================
//  *  Invoice Info
//  * ====================================================== */

// export type CheckoutInvoiceInfo = {
//   email: string;
//   billingAddress: string;
//   taxId?: string;
//   headOfficeBranch?: string;
// };

// /* ======================================================
//  *  Summary Section Props
//  * ====================================================== */

// export type CheckoutSummaryProps = {
//   itemCount: number;
//   subtotal: number;
//   shippingFee: number;
//   voucherDiscount: number;
//   total: number;
//   onPlaceOrder: () => void;
// };

// /* ======================================================
//  *  Product Info For Mapping Cart → Checkout
//  * ====================================================== */

// // ✅ ข้อมูลสินค้าใช้ตอน join กับ cart เพื่อนำไปสร้าง CheckoutItem
// export type ProductForCheckout = {
//   id: number;
//   sku: string;
//   name: string;
//   brand: string | null;
//   image_url: string | null;
//   uom_default: string | null;

//   // ข้อมูลเสริม (optional) เอาไว้ใช้ในอนาคต / UI
//   categoryId?: number | null;
//   originalPrice?: number | null;
//   discountLabel?: string | null;
//   clearanceSales?: boolean | null;
//   clearanceQuantity?: number | null;
//   freeShippingEligible?: boolean | null;
//   freeShipMinimum?: number | null;
//   warrantyMonths?: number | null;
//   returnDays?: number | null;

//   // เงื่อนไขการขาย (CUT / ROLL ฯลฯ) จาก product_conditions
//   conditions?: any[] | null;
// };

// /* ======================================================
//  *  Mappers
//  * ====================================================== */

// export function mapCartItemToCheckoutItem(
//   cart: CartItem,
//   product: ProductForCheckout
// ): CheckoutItem {
//   const quantity = cart.quantity ?? 0;
//   const unitPrice = cart.price ?? 0;

//   const lineTotal =
//     typeof cart.price_amount === "number"
//       ? cart.price_amount
//       : quantity * unitPrice;

//   const imageUrl = product.image_url ?? "";

//   return {
//     id: cart.id,
//     cartId: cart.id,
//     productId: product.id,
//     product: cart.product,

//     customerId: cart.id_customer,

//     name: product.name || cart.product,
//     sku: product.sku,
//     brand: product.brand ?? undefined,

//     image: imageUrl,
//     imageUrl,

//     price: unitPrice,
//     unitPrice,
//     quantity,
//     uom: cart.uom || product.uom_default || undefined,

//     lineTotal,
//     checked: cart.check_product,

//     rawCart: cart,
//   };
// }

// /* ======================================================
//  *  Build Summary
//  * ====================================================== */

// export function buildCheckoutSummary(
//   items: CheckoutItem[],
//   opts?: {
//     shippingFee?: number;
//     discount?: number;
//   }
// ): CheckoutSummary {
//   const shippingFee = opts?.shippingFee ?? 0;
//   const discount = opts?.discount ?? 0;

//   const selected = items.filter((i) => i.checked);

//   const itemCount = selected.length;

//   const subtotal = selected.reduce((sum, item) => {
//     const line =
//       typeof item.lineTotal === "number"
//         ? item.lineTotal
//         : item.price * item.quantity;
//     return sum + line;
//   }, 0);

//   const grandTotal = subtotal + shippingFee - discount;

//   return {
//     itemCount,
//     subtotal,
//     shippingFee,
//     discount,
//     grandTotal,
//   };
// }

// /* ======================================================
//  *  Profile Checker
//  * ====================================================== */

// export function isEmptyProfileCore(
//   obj: Record<string, unknown> | null | undefined
// ): boolean {
//   if (!obj) return true;
//   const values = Object.values(obj);
//   if (values.length === 0) return true;

//   return values.every((v) => {
//     if (v === null || v === undefined) return true;
//     const s = String(v).trim();
//     return s === "";
//   });
// }

// export function buildCheckoutProfileInfo(
//   person: PersonProfile | null,
//   entity: EntityProfile | null
// ): CheckoutProfileInfo {
//   const hasPerson =
//     !!person &&
//     [
//       (person as any).personCustomerName,
//       person.personShipAddr,
//       person.personTaxAddr,
//       person.personMail,
//       person.personTel,
//     ]
//       .map((v) => (v ?? "").toString().trim())
//       .some((v) => v !== "");

//   const hasEntity =
//     !!entity &&
//     [
//       entity.entityCompanyName,
//       (entity as any).entityCustomerName,
//       entity.entityShipAddr,
//       entity.entityTaxAddr,
//       entity.entityMail,
//       entity.entityTaxId,
//     ]
//       .map((v) => (v ?? "").toString().trim())
//       .some((v) => v !== "");

//   // ---------- ตัดสินโหมดโปรไฟล์ (ให้บุคคลธรรมดาเป็นค่าเริ่มต้น) ----------

//   // ถ้ามีข้อมูลบุคคลธรรมดาเมื่อไหร่ → ใช้ person ก่อนเสมอ
//   if (hasPerson) {
//     return {
//       mode: "person",
//       email: person?.personMail ?? undefined,
//       taxId: person?.personIdCard ?? undefined,
//     };
//   }

//   // ถ้าไม่มีบุคคลธรรมดา แต่มีนิติบุคคล → ใช้ entity
//   if (hasEntity) {
//     return {
//       mode: "entity",
//       email: entity?.entityMail ?? undefined,
//       taxId: entity?.entityTaxId ?? undefined,
//     };
//   }

//   // ไม่มีข้อมูลทั้งคู่
//   return { mode: null };
// }



// v.1.1.7 ===============================================================

// v.1.1.6 ===============================================================
// // src/types/checkout.ts

// import type { CartItem } from "@/types/cart";
// import type { PersonProfile, EntityProfile } from "@/types/profile";

// /* ======================================================
//  *  Address Types
//  * ====================================================== */

// export type CheckoutAddressTag = "HOME" | "OFFICE";

// /** ใช้บอกว่า address นี้เอาไว้ทำอะไรในหน้า checkout */
// export type CheckoutAddressPurpose = "shipping" | "billing";

// export type CheckoutAddress = {
//   id: number;
//   /** HOME = บุคคลธรรมดา, OFFICE = นิติบุคคล (เอาไป map เป็น label ที่ UI) */
//   type: CheckoutAddressTag;

//   /** ชื่อที่โชว์บนบล็อก เช่น สิรดา ถวิก / บจก.อินเตอร์ลิ้งค์ฯ */
//   name: string;

//   /** เบอร์ติดต่อ */
//   phone: string;

//   /** ที่อยู่รวมทุกอย่างในรูปแบบพร้อมแสดง */
//   address: string;

//   /** ใช้ทำ “ค่าเริ่มต้น” ใน sheet */
//   isDefault: boolean;

//   /** ใช้แยกว่าบล็อกนี้ใช้เป็น “ที่อยู่จัดส่ง” หรือ “ที่อยู่ออกใบกำกับภาษี” */
//   purpose?: CheckoutAddressPurpose;

//   /** ใช้รู้ว่า address นี้มาจาก profile แบบไหน */
//   profileMode?: "person" | "entity";

//   /** id row ของตาราง customer_profile_people/entities (ถ้ามี) */
//   profileSourceId?: number | string | bigint;
// };

// /* ======================================================
//  *  Helper: Map Profile → CheckoutAddress
//  *  (ยังเป็น pure function ใช้ได้ทั้งกับ mock / service layer)
//  * ====================================================== */

// /** ใช้เช็คว่าชุด field address ว่างหมดไหม */
// function isEmptyAddressFields(fields: Array<string | null | undefined>) {
//   return fields.map((v) => (v ?? "").trim()).every((v) => v === "");
// }

// export function mapPersonProfileToCheckoutAddresses(
//   person: PersonProfile | null
// ): {
//   shippingAddress?: CheckoutAddress;
//   billingAddress?: CheckoutAddress;
// } {
//   if (!person) return {};

//   const baseName =
//     (person as any).personContactMore ||
//     (person as any).personCompanyName ||
//     "บุคคลธรรมดา";
//   const phone = person.personTel ?? "";

//   const shipParts = [
//     person.personShipAddr,
//     person.personShipDistric,
//     person.personShipProvince,
//     person.personShipCountry,
//     person.personShipPostCode,
//   ];
//   const taxParts = [
//     person.personTaxAddr,
//     person.personTaxDistric,
//     person.personTaxProvince,
//     person.personTaxCountry,
//     person.personTaxPostcode,
//   ];

//   const shippingAddress = !isEmptyAddressFields(shipParts)
//     ? ({
//         id: 1,
//         type: "HOME",
//         name: baseName,
//         phone,
//         address: shipParts.filter(Boolean).join(" "),
//         isDefault: true,
//         purpose: "shipping",
//         profileMode: "person",
//         profileSourceId: (person as any).id,
//       } satisfies CheckoutAddress)
//     : undefined;

//   const billingAddress = !isEmptyAddressFields(taxParts)
//     ? ({
//         id: 2,
//         type: "HOME",
//         name: baseName,
//         phone,
//         address: taxParts.filter(Boolean).join(" "),
//         isDefault: true,
//         purpose: "billing",
//         profileMode: "person",
//         profileSourceId: (person as any).id,
//       } satisfies CheckoutAddress)
//     : undefined;

//   return { shippingAddress, billingAddress };
// }

// export function mapEntityProfileToCheckoutAddresses(
//   entity: EntityProfile | null
// ): {
//   shippingAddress?: CheckoutAddress;
//   billingAddress?: CheckoutAddress;
// } {
//   if (!entity) return {};

//   const baseName =
//     entity.entityCompanyName || entity.entityCustomerName || "นิติบุคคล";
//   const phone = entity.entityTel ?? "";

//   const shipParts = [
//     entity.entityShipAddr,
//     entity.entityShipDistric,
//     entity.entityShipProvince,
//     entity.entityShipCountry,
//     entity.entityShipPostCode,
//   ];
//   const taxParts = [
//     entity.entityTaxAddr,
//     entity.entityTaxDistric,
//     entity.entityTaxProvince,
//     entity.entityTaxCountry,
//     entity.entityTaxPostcode,
//   ];

//   const shippingAddress = !isEmptyAddressFields(shipParts)
//     ? ({
//         id: 3,
//         type: "OFFICE",
//         name: baseName,
//         phone,
//         address: shipParts.filter(Boolean).join(" "),
//         isDefault: true,
//         purpose: "shipping",
//         profileMode: "entity",
//         profileSourceId: (entity as any).id,
//       } satisfies CheckoutAddress)
//     : undefined;

//   const billingAddress = !isEmptyAddressFields(taxParts)
//     ? ({
//         id: 4,
//         type: "OFFICE",
//         name: baseName,
//         phone,
//         address: taxParts.filter(Boolean).join(" "),
//         isDefault: true,
//         purpose: "billing",
//         profileMode: "entity",
//         profileSourceId: (entity as any).id,
//       } satisfies CheckoutAddress)
//     : undefined;

//   return { shippingAddress, billingAddress };
// }

// /**
//  * รวม person + entity ให้เป็น list สำหรับ checkout
//  * - shipping: ใช้ในบล็อก “ที่อยู่จัดส่ง”
//  * - billing: ใช้ในบล็อก “ที่อยู่ออกใบกำกับภาษี”
//  *
//  * (ตอนนี้ยังไม่ได้ใช้ในหน้า checkout จริง แต่เตรียมไว้ให้ service layer เรียก)
//  */
// export function buildCheckoutAddressesFromProfiles(
//   person: PersonProfile | null,
//   entity: EntityProfile | null
// ): {
//   shipping: CheckoutAddress[];
//   billing: CheckoutAddress[];
// } {
//   const { shippingAddress: personShip, billingAddress: personBill } =
//     mapPersonProfileToCheckoutAddresses(person);
//   const { shippingAddress: entityShip, billingAddress: entityBill } =
//     mapEntityProfileToCheckoutAddresses(entity);

//   const shipping: CheckoutAddress[] = [];
//   const billing: CheckoutAddress[] = [];

//   let nextId = 1;

//   for (const addr of [personShip, entityShip]) {
//     if (addr) {
//       shipping.push({ ...addr, id: nextId++ });
//     }
//   }

//   for (const addr of [personBill, entityBill]) {
//     if (addr) {
//       billing.push({ ...addr, id: nextId++ });
//     }
//   }

//   // ตั้งค่า isDefault true แค่ตัวแรกของแต่ละกลุ่ม
//   if (shipping[0]) shipping[0].isDefault = true;
//   if (billing[0]) billing[0].isDefault = true;

//   return { shipping, billing };
// }

// /* ======================================================
//  *  Delivery Options
//  * ====================================================== */

// export type DeliveryOption = "standard" | "express";

// /* ======================================================
//  *  Checkout Item (ตัวจริง + UI fields)
//  * ====================================================== */

// export type CheckoutItem = {
//   /** id แถวใน checkout (ส่วนใหญ่ใช้ cart.id) */
//   id: number;

//   /** Mapping back to DB */
//   cartId?: number;
//   productId?: number;
//   product?: string;

//   /** Owner */
//   customerId?: number;

//   /** แสดงผลบน UI */
//   name: string;
//   sku?: string;
//   brand?: string;

//   /** รูปสินค้า */
//   image: string;
//   imageUrl?: string;

//   /** ราคาต่อหน่วย */
//   price: number;
//   unitPrice?: number;

//   /** จำนวนที่ลูกค้าซื้อ */
//   quantity: number;

//   /** หน่วยขาย เช่น PC., M. */
//   uom?: string;

//   /** ราคาปกติ (ก่อนลด) */
//   originalPrice?: number;

//   /** ส่วนลดเป็น % เช่น 60 => ประหยัด 60% */
//   discountPercent?: number;

//   /** line total จาก DB หรือ service คำนวณ */
//   lineTotal?: number;

//   /** ใช้เลือกส่งบางรายการไป checkout */
//   checked?: boolean;

//   /** Raw cart item จาก DB */
//   rawCart?: CartItem;

//   /** (UI only) store name */
//   store?: string;
// };

// /* ======================================================
//  *  Summary Types
//  * ====================================================== */

// export type CheckoutSummary = {
//   itemCount: number;
//   subtotal: number;
//   shippingFee: number;
//   discount: number;
//   grandTotal: number;
// };

// /* ======================================================
//  *  Profile Info (ใช้หน้า Checkout)
//  * ====================================================== */

// export type CheckoutProfileInfo = {
//   mode: "person" | "entity" | null;
//   email?: string;
//   taxId?: string;
// };

// /* ======================================================
//  *  Checkout Data (ภาพรวมสำหรับหน้า checkout)
//  * ====================================================== */

// export type CheckoutData = {
//   items: CheckoutItem[];
//   summary: CheckoutSummary;

//   shippingAddress?: CheckoutAddress | null;
//   billingAddress?: CheckoutAddress | null;
//   profileInfo?: CheckoutProfileInfo;
// };

// /* ======================================================
//  *  Voucher Type
//  * ====================================================== */

// export type CheckoutVoucher = {
//   code: string;
//   discount: number;
// };

// /* ======================================================
//  *  Payment Methods
//  * ====================================================== */

// export type PaymentMethod =
//   | "card"
//   | "qr"
//   | "cash"
//   | "linepay"
//   | "internetbanking"
//   | "banktransfer";

// export type PaymentMethodsArray = PaymentMethod[];

// export type CheckoutPaymentData = {
//   amount: number;
//   orderId: string;
//   items: CheckoutItem[];
//   subtotal: number;
//   shippingFee: number;
//   shippingDiscount: number;
//   voucherDiscount: number;
//   appliedVouchers: CheckoutVoucher[];
// };

// /* ======================================================
//  *  Invoice Info
//  * ====================================================== */

// export type CheckoutInvoiceInfo = {
//   email: string;
//   billingAddress: string;
//   taxId?: string;
//   headOfficeBranch?: string;
// };

// /* ======================================================
//  *  Summary Section Props
//  * ====================================================== */

// export type CheckoutSummaryProps = {
//   itemCount: number;
//   subtotal: number;
//   shippingFee: number;
//   voucherDiscount: number;
//   total: number;
//   onPlaceOrder: () => void;
// };

// /* ======================================================
//  *  Product Info For Mapping Cart → Checkout
//  * ====================================================== */

// // ✅ ข้อมูลสินค้าใช้ตอน join กับ cart เพื่อนำไปสร้าง CheckoutItem
// export type ProductForCheckout = {
//   id: number;
//   sku: string;
//   name: string;
//   brand: string | null;
//   image_url: string | null;
//   uom_default: string | null;

//   // ข้อมูลเสริม (optional) เอาไว้ใช้ในอนาคต / UI
//   categoryId?: number | null;
//   originalPrice?: number | null;
//   discountLabel?: string | null;
//   clearanceSales?: boolean | null;
//   clearanceQuantity?: number | null;
//   freeShippingEligible?: boolean | null;
//   freeShipMinimum?: number | null;
//   warrantyMonths?: number | null;
//   returnDays?: number | null;

//   // เงื่อนไขการขาย (CUT / ROLL ฯลฯ) จาก product_conditions
//   conditions?: any[] | null;
// };

// /* ======================================================
//  *  Mappers
//  * ====================================================== */

// export function mapCartItemToCheckoutItem(
//   cart: CartItem,
//   product: ProductForCheckout
// ): CheckoutItem {
//   const quantity = cart.quantity ?? 0;
//   const unitPrice = cart.price ?? 0;

//   const lineTotal =
//     typeof cart.price_amount === "number"
//       ? cart.price_amount
//       : quantity * unitPrice;

//   const imageUrl = product.image_url ?? "";

//   return {
//     id: cart.id,
//     cartId: cart.id,
//     productId: product.id,
//     product: cart.product,

//     customerId: cart.id_customer,

//     name: product.name || cart.product,
//     sku: product.sku,
//     brand: product.brand ?? undefined,

//     image: imageUrl,
//     imageUrl,

//     price: unitPrice,
//     unitPrice,
//     quantity,
//     uom: cart.uom || product.uom_default || undefined,

//     lineTotal,
//     checked: cart.check_product,

//     rawCart: cart,
//   };
// }

// /* ======================================================
//  *  Build Summary
//  * ====================================================== */

// export function buildCheckoutSummary(
//   items: CheckoutItem[],
//   opts?: {
//     shippingFee?: number;
//     discount?: number;
//   }
// ): CheckoutSummary {
//   const shippingFee = opts?.shippingFee ?? 0;
//   const discount = opts?.discount ?? 0;

//   const selected = items.filter((i) => i.checked);

//   const itemCount = selected.length;

//   const subtotal = selected.reduce((sum, item) => {
//     const line =
//       typeof item.lineTotal === "number"
//         ? item.lineTotal
//         : item.price * item.quantity;
//     return sum + line;
//   }, 0);

//   const grandTotal = subtotal + shippingFee - discount;

//   return {
//     itemCount,
//     subtotal,
//     shippingFee,
//     discount,
//     grandTotal,
//   };
// }

// /* ======================================================
//  *  Profile Checker
//  * ====================================================== */

// export function isEmptyProfileCore(
//   obj: Record<string, unknown> | null | undefined
// ): boolean {
//   if (!obj) return true;
//   const values = Object.values(obj);
//   if (values.length === 0) return true;

//   return values.every((v) => {
//     if (v === null || v === undefined) return true;
//     const s = String(v).trim();
//     return s === "";
//   });
// }

// export function buildCheckoutProfileInfo(
//   person: PersonProfile | null,
//   entity: EntityProfile | null
// ): CheckoutProfileInfo {
//   const emptyPerson = isEmptyProfileCore(person ?? undefined);
//   const emptyEntity = isEmptyProfileCore(entity ?? undefined);

//   if (!emptyEntity) {
//     return {
//       mode: "entity",
//       email: entity?.entityMail ?? undefined,
//       taxId: entity?.entityTaxId ?? undefined,
//     };
//   }

//   if (!emptyPerson) {
//     return {
//       mode: "person",
//       email: person?.personMail ?? undefined,
//       taxId: person?.personIdCard ?? undefined,
//     };
//   }

//   return { mode: null };
// }

// v.1.1.6 ===============================================================

// v.1.1.5 ===============================================================
// // src/types/checkout.ts

// import type { CartItem } from "@/types/cart";
// import type { PersonProfile, EntityProfile } from "@/types/profile";

// /* ======================================================
//  *  Address Types
//  * ====================================================== */

// export type CheckoutAddressTag = "HOME" | "OFFICE";

// export type CheckoutAddressPurpose = "shipping" | "billing";

// export type CheckoutProfileMode = "person" | "entity";

// /**
//  * ที่อยู่ 1 ชุดสำหรับใช้ใน Checkout
//  * - ใช้แสดงบล็อกที่อยู่จัดส่ง / ที่อยู่ออกใบกำกับฯ
//  * - รองรับทั้งข้อมูลจากบุคคลธรรมดา และนิติบุคคล
//  */
// export type CheckoutAddress = {
//   id: number;

//   /** ป้ายกำกับแบบ HOME / OFFICE (ใช้กับ UI ปัจจุบัน) */
//   type: CheckoutAddressTag;

//   /** ชื่อที่ใช้แสดง เช่น ชื่อลูกค้า / ชื่อบริษัท / ชื่อผู้ติดต่อ */
//   name: string;

//   /** หมายเลขโทรศัพท์หลัก */
//   phone: string;

//   /** ที่อยู่รวมทุกอย่างในรูปแบบพร้อมแสดง (บรรทัดเดียว) */
//   address: string;

//   /** ใช้ไฮไลท์เป็น address เริ่มต้น */
//   isDefault: boolean;

//   /** โปรไฟล์นี้มาจากบุคคลธรรมดา หรือ นิติบุคคล */
//   profileMode?: CheckoutProfileMode;

//   /** ใช้เป็นที่อยู่สำหรับจัดส่ง หรือออกใบกำกับ */
//   purpose?: CheckoutAddressPurpose;
// };

// /* ======================================================
//  *  Delivery Options
//  * ====================================================== */

// export type DeliveryOption = "standard" | "express";

// /* ======================================================
//  *  Checkout Item (ตัวจริง + UI fields)
//  * ====================================================== */

// export type CheckoutItem = {
//   /** id แถวใน checkout (ส่วนใหญ่ใช้ cart.id) */
//   id: number;

//   /** Mapping back to DB */
//   cartId?: number;
//   productId?: number;
//   product?: string;

//   /** Owner */
//   customerId?: number;

//   /** แสดงผลบน UI */
//   name: string;
//   sku?: string;
//   brand?: string;

//   /** รูปสินค้า */
//   image: string;
//   imageUrl?: string;

//   /** ราคาต่อหน่วย */
//   price: number;
//   unitPrice?: number;

//   /** จำนวนที่ลูกค้าซื้อ */
//   quantity: number;

//   /** หน่วยขาย เช่น PC., M. */
//   uom?: string;

//   /** ราคาปกติ (ก่อนลด) */
//   originalPrice?: number;

//   /** ส่วนลดเป็น % เช่น 60 => ประหยัด 60% */
//   discountPercent?: number;

//   /** line total จาก DB หรือ service คำนวณ */
//   lineTotal?: number;

//   /** ใช้เลือกส่งบางรายการไป checkout */
//   checked?: boolean;

//   /** Raw cart item จาก DB */
//   rawCart?: CartItem;

//   /** (UI only) store name */
//   store?: string;
// };

// /* ======================================================
//  *  Summary Types
//  * ====================================================== */

// export type CheckoutSummary = {
//   itemCount: number;
//   subtotal: number;
//   shippingFee: number;
//   discount: number;
//   grandTotal: number;
// };

// /* ======================================================
//  *  Profile Info (ใช้หน้า Checkout)
//  * ====================================================== */

// export type CheckoutProfileInfo = {
//   /** ใช้ profile แบบบุคคลธรรมดา หรือนิติบุคคล สำหรับ checkout นี้ */
//   mode: CheckoutProfileMode | null;
//   email?: string;
//   taxId?: string;
// };

// /* ======================================================
//  *  Checkout Data (ภาพรวมสำหรับหน้า checkout)
//  * ====================================================== */

// export type CheckoutData = {
//   items: CheckoutItem[];
//   summary: CheckoutSummary;

//   /** ที่อยู่จัดส่งที่เลือกใช้ */
//   shippingAddress?: CheckoutAddress | null;

//   /** ที่อยู่ออกใบกำกับภาษี (ถ้าแยกจาก shipping) */
//   billingAddress?: CheckoutAddress | null;

//   /** สรุปว่า checkout นี้ใช้ profile แบบไหน */
//   profileInfo?: CheckoutProfileInfo;
// };

// /* ======================================================
//  *  Voucher Type
//  * ====================================================== */

// export type CheckoutVoucher = {
//   code: string;
//   discount: number;
// };

// /* ======================================================
//  *  Payment Methods
//  * ====================================================== */

// export type PaymentMethod =
//   | "card"
//   | "qr"
//   | "cash"
//   | "linepay"
//   | "internetbanking"
//   | "banktransfer";

// export type PaymentMethodsArray = PaymentMethod[];

// export type CheckoutPaymentData = {
//   amount: number;
//   orderId: string;
//   items: CheckoutItem[];
//   subtotal: number;
//   shippingFee: number;
//   shippingDiscount: number;
//   voucherDiscount: number;
//   appliedVouchers: CheckoutVoucher[];
// };

// /* ======================================================
//  *  Invoice Info
//  * ====================================================== */

// export type CheckoutInvoiceInfo = {
//   email: string;
//   billingAddress: string;
//   taxId?: string;
//   headOfficeBranch?: string;
// };

// /* ======================================================
//  *  Summary Section Props
//  * ====================================================== */

// export type CheckoutSummaryProps = {
//   itemCount: number;
//   subtotal: number;
//   shippingFee: number;
//   voucherDiscount: number;
//   total: number;
//   onPlaceOrder: () => void;
// };

// /* ======================================================
//  *  Product Info For Mapping Cart → Checkout
//  * ====================================================== */

// export type ProductForCheckout = {
//   id: number;
//   sku: string;
//   name: string;
//   brand?: string | null;
//   image_url?: string | null;
//   uom_default?: string | null;
// };

// /* ======================================================
//  *  Mappers: Cart → CheckoutItem
//  * ====================================================== */

// export function mapCartItemToCheckoutItem(
//   cart: CartItem,
//   product: ProductForCheckout
// ): CheckoutItem {
//   const quantity = cart.quantity ?? 0;
//   const unitPrice = cart.price ?? 0;

//   const lineTotal =
//     typeof cart.price_amount === "number"
//       ? cart.price_amount
//       : quantity * unitPrice;

//   const imageUrl = product.image_url ?? "";

//   return {
//     id: cart.id,
//     cartId: cart.id,
//     productId: product.id,
//     product: cart.product,

//     customerId: cart.id_customer,

//     name: product.name || cart.product,
//     sku: product.sku,
//     brand: product.brand ?? undefined,

//     image: imageUrl,
//     imageUrl,

//     price: unitPrice,
//     unitPrice,
//     quantity,
//     uom: cart.uom || product.uom_default || undefined,

//     lineTotal,
//     checked: cart.check_product,

//     rawCart: cart,
//   };
// }

// /* ======================================================
//  *  Build Summary
//  * ====================================================== */

// export function buildCheckoutSummary(
//   items: CheckoutItem[],
//   opts?: {
//     shippingFee?: number;
//     discount?: number;
//   }
// ): CheckoutSummary {
//   const shippingFee = opts?.shippingFee ?? 0;
//   const discount = opts?.discount ?? 0;

//   const selected = items.filter((i) => i.checked);

//   const itemCount = selected.length;

//   const subtotal = selected.reduce((sum, item) => {
//     const line =
//       typeof item.lineTotal === "number"
//         ? item.lineTotal
//         : item.price * item.quantity;
//     return sum + line;
//   }, 0);

//   const grandTotal = subtotal + shippingFee - discount;

//   return {
//     itemCount,
//     subtotal,
//     shippingFee,
//     discount,
//     grandTotal,
//   };
// }

// /* ======================================================
//  *  Profile Checker (ใช้เช็คว่า profile ว่างหรือไม่)
//  * ====================================================== */

// export function isEmptyProfileCore(
//   obj: Record<string, unknown> | null | undefined
// ): boolean {
//   if (!obj) return true;
//   const values = Object.values(obj);
//   if (values.length === 0) return true;

//   return values.every((v) => {
//     if (v === null || v === undefined) return true;
//     const s = String(v).trim();
//     return s === "";
//   });
// }

// /* ======================================================
//  *  Build Checkout Profile Info (เลือกใช้ person หรือ entity)
//  * ====================================================== */

// export function buildCheckoutProfileInfo(
//   person: PersonProfile | null,
//   entity: EntityProfile | null
// ): CheckoutProfileInfo {
//   const emptyPerson = isEmptyProfileCore(person ?? undefined);
//   const emptyEntity = isEmptyProfileCore(entity ?? undefined);

//   if (!emptyEntity) {
//     return {
//       mode: "entity",
//       email: entity?.entityMail ?? undefined,
//       taxId: entity?.entityTaxId ?? undefined,
//     };
//   }

//   if (!emptyPerson) {
//     return {
//       mode: "person",
//       email: person?.personMail ?? undefined,
//       taxId: person?.personIdCard ?? undefined,
//     };
//   }

//   return { mode: null };
// }

// /* ======================================================
//  *  Helper: join address parts
//  * ====================================================== */

// function joinAddressParts(...parts: Array<string | null | undefined>): string {
//   return parts
//     .map((p) => (p ?? "").trim())
//     .filter((p) => p.length > 0)
//     .join(", ");
// }

// /* ======================================================
//  *  Profile → CheckoutAddress (Person / Entity)
//  *  (รองรับทั้งที่อยู่จัดส่ง และที่อยู่ออกใบกำกับ)
//  * ====================================================== */

// export type CheckoutProfileAddresses = {
//   personShipping?: CheckoutAddress;
//   personBilling?: CheckoutAddress;
//   entityShipping?: CheckoutAddress;
//   entityBilling?: CheckoutAddress;
// };

// /**
//  * สร้าง CheckoutAddress จากข้อมูลบุคคลธรรมดา (shipping / billing)
//  */
// export function mapPersonProfileToAddresses(
//   person: PersonProfile | null
// ): {
//   shipping?: CheckoutAddress;
//   billing?: CheckoutAddress;
// } {
//   if (!person) return {};

//   const hasShipping =
//     !!person.personShipAddr ||
//     !!person.personShipDistric ||
//     !!person.personShipProvince ||
//     !!person.personShipCountry ||
//     !!person.personShipPostCode;

//   const hasBilling =
//     !!person.personTaxAddr ||
//     !!person.personTaxDistric ||
//     !!person.personTaxProvince ||
//     !!person.personTaxCountry ||
//     !!person.personTaxPostcode;

//   const shippingAddress: CheckoutAddress | undefined = hasShipping
//     ? {
//         id: 1, // id สมมุติสำหรับบุคคลธรรมดา - ที่อยู่จัดส่ง
//         type: "HOME",
//         name: person.personCompanyName ?? "",
//         phone: person.personTel ?? "",
//         address: joinAddressParts(
//           person.personShipAddr,
//           person.personShipDistric,
//           person.personShipProvince,
//           person.personShipCountry,
//           person.personShipPostCode
//         ),
//         isDefault: true,
//         profileMode: "person",
//         purpose: "shipping",
//       }
//     : undefined;

//   const billingAddress: CheckoutAddress | undefined = hasBilling
//     ? {
//         id: 2, // id สมมุติสำหรับบุคคลธรรมดา - ที่อยู่ออกใบกำกับ
//         type: "HOME",
//         name: person.personCompanyName ?? "",
//         phone: person.personTel ?? "",
//         address: joinAddressParts(
//           person.personTaxAddr,
//           person.personTaxDistric,
//           person.personTaxProvince,
//           person.personTaxCountry,
//           person.personTaxPostcode
//         ),
//         isDefault: !hasShipping,
//         profileMode: "person",
//         purpose: "billing",
//       }
//     : undefined;

//   return {
//     ...(shippingAddress ? { shipping: shippingAddress } : {}),
//     ...(billingAddress ? { billing: billingAddress } : {}),
//   };
// }

// /**
//  * สร้าง CheckoutAddress จากข้อมูลนิติบุคคล (shipping / billing)
//  */
// export function mapEntityProfileToAddresses(
//   entity: EntityProfile | null
// ): {
//   shipping?: CheckoutAddress;
//   billing?: CheckoutAddress;
// } {
//   if (!entity) return {};

//   const hasShipping =
//     !!entity.entityShipAddr ||
//     !!entity.entityShipDistric ||
//     !!entity.entityShipProvince ||
//     !!entity.entityShipCountry ||
//     !!entity.entityShipPostCode;

//   const hasBilling =
//     !!entity.entityTaxAddr ||
//     !!entity.entityTaxDistric ||
//     !!entity.entityTaxProvince ||
//     !!entity.entityTaxCountry ||
//     !!entity.entityTaxPostcode;

//   const displayName =
//     entity.entityCompanyName ?? entity.entityCustomerName ?? "";

//   const shippingAddress: CheckoutAddress | undefined = hasShipping
//     ? {
//         id: 3, // id สมมุติสำหรับนิติบุคคล - ที่อยู่จัดส่ง
//         type: "OFFICE",
//         name: displayName,
//         phone: entity.entityTel ?? "",
//         address: joinAddressParts(
//           entity.entityShipAddr,
//           entity.entityShipDistric,
//           entity.entityShipProvince,
//           entity.entityShipCountry,
//           entity.entityShipPostCode
//         ),
//         isDefault: true,
//         profileMode: "entity",
//         purpose: "shipping",
//       }
//     : undefined;

//   const billingAddress: CheckoutAddress | undefined = hasBilling
//     ? {
//         id: 4, // id สมมุติสำหรับนิติบุคคล - ที่อยู่ออกใบกำกับ
//         type: "OFFICE",
//         name: displayName,
//         phone: entity.entityTel ?? "",
//         address: joinAddressParts(
//           entity.entityTaxAddr,
//           entity.entityTaxDistric,
//           entity.entityTaxProvince,
//           entity.entityTaxCountry,
//           entity.entityTaxPostcode
//         ),
//         isDefault: !hasShipping,
//         profileMode: "entity",
//         purpose: "billing",
//       }
//     : undefined;

//   return {
//     ...(shippingAddress ? { shipping: shippingAddress } : {}),
//     ...(billingAddress ? { billing: billingAddress } : {}),
//   };
// }

// /**
//  * รวม person + entity เป็นชุดเดียวสำหรับใช้ใน Checkout
//  */
// export function buildCheckoutProfileAddresses(
//   person: PersonProfile | null,
//   entity: EntityProfile | null
// ): CheckoutProfileAddresses {
//   const personAddrs = mapPersonProfileToAddresses(person);
//   const entityAddrs = mapEntityProfileToAddresses(entity);

//   return {
//     personShipping: personAddrs.shipping,
//     personBilling: personAddrs.billing,
//     entityShipping: entityAddrs.shipping,
//     entityBilling: entityAddrs.billing,
//   };
// }


// v.1.1.5 ===============================================================

// v.1.1.4 ===============================================================
// // src/types/checkout.ts

// import type { CartItem } from "@/types/cart";
// import type { PersonProfile, EntityProfile } from "@/types/profile";

// /* ======================================================
//  *  Address Types
//  * ====================================================== */

// export type CheckoutAddressTag = "HOME" | "OFFICE";

// export type CheckoutAddress = {
//   id: number;
//   type: CheckoutAddressTag;
//   name: string;
//   phone: string;
//   /** ที่อยู่รวมทุกอย่างในรูปแบบพร้อมแสดง */
//   address: string;
//   isDefault: boolean;
// };

// /* ======================================================
//  *  Delivery Options
//  * ====================================================== */

// export type DeliveryOption = "standard" | "express";

// /* ======================================================
//  *  Checkout Item (ตัวจริง + UI fields)
//  * ====================================================== */

// export type CheckoutItem = {
//   /** id แถวใน checkout (ส่วนใหญ่ใช้ cart.id) */
//   id: number;

//   /** Mapping back to DB */
//   cartId?: number;
//   productId?: number;
//   product?: string;

//   /** Owner */
//   customerId?: number;

//   /** แสดงผลบน UI */
//   name: string;
//   sku?: string;
//   brand?: string;

//   /** รูปสินค้า */
//   image: string;
//   imageUrl?: string;

//   /** ราคาต่อหน่วย */
//   price: number;
//   unitPrice?: number;

//   /** จำนวนที่ลูกค้าซื้อ */
//   quantity: number;

//   /** หน่วยขาย เช่น PC., M. */
//   uom?: string;

//   /** ราคาปกติ (ก่อนลด) */
//   originalPrice?: number;

//   /** ส่วนลดเป็น % เช่น 60 => ประหยัด 60% */
//   discountPercent?: number;

//   /** line total จาก DB หรือ service คำนวณ */
//   lineTotal?: number;

//   /** ใช้เลือกส่งบางรายการไป checkout */
//   checked?: boolean;

//   /** Raw cart item จาก DB */
//   rawCart?: CartItem;

//   /** (UI only) store name */
//   store?: string;
// };

// /* ======================================================
//  *  Summary Types
//  * ====================================================== */

// export type CheckoutSummary = {
//   itemCount: number;
//   subtotal: number;
//   shippingFee: number;
//   discount: number;
//   grandTotal: number;
// };

// /* ======================================================
//  *  Profile Info (ใช้หน้า Checkout)
//  * ====================================================== */

// export type CheckoutProfileInfo = {
//   mode: "person" | "entity" | null;
//   email?: string;
//   taxId?: string;
// };

// /* ======================================================
//  *  Checkout Data (ภาพรวมสำหรับหน้า checkout)
//  * ====================================================== */

// export type CheckoutData = {
//   items: CheckoutItem[];
//   summary: CheckoutSummary;

//   shippingAddress?: CheckoutAddress | null;
//   billingAddress?: CheckoutAddress | null;
//   profileInfo?: CheckoutProfileInfo;
// };

// /* ======================================================
//  *  Voucher Type
//  * ====================================================== */

// export type CheckoutVoucher = {
//   code: string;
//   discount: number;
// };

// /* ======================================================
//  *  Payment Methods
//  * ====================================================== */

// export type PaymentMethod =
//   | "card"
//   | "qr"
//   | "cash"
//   | "linepay"
//   | "internetbanking"
//   | "banktransfer";

// export type PaymentMethodsArray = PaymentMethod[];

// export type CheckoutPaymentData = {
//   amount: number;
//   orderId: string;
//   items: CheckoutItem[];
//   subtotal: number;
//   shippingFee: number;
//   shippingDiscount: number;
//   voucherDiscount: number;
//   appliedVouchers: CheckoutVoucher[];
// };

// /* ======================================================
//  *  Invoice Info
//  * ====================================================== */

// export type CheckoutInvoiceInfo = {
//   email: string;
//   billingAddress: string;
//   taxId?: string;
//   headOfficeBranch?: string;
// };

// /* ======================================================
//  *  Summary Section Props
//  * ====================================================== */

// export type CheckoutSummaryProps = {
//   itemCount: number;
//   subtotal: number;
//   shippingFee: number;
//   voucherDiscount: number;
//   total: number;
//   onPlaceOrder: () => void;
// };

// /* ======================================================
//  *  Product Info For Mapping Cart → Checkout
//  * ====================================================== */

// export type ProductForCheckout = {
//   id: number;
//   sku: string;
//   name: string;
//   brand?: string | null;
//   image_url?: string | null;
//   uom_default?: string | null;
// };

// /* ======================================================
//  *  Mappers
//  * ====================================================== */

// export function mapCartItemToCheckoutItem(
//   cart: CartItem,
//   product: ProductForCheckout
// ): CheckoutItem {
//   const quantity = cart.quantity ?? 0;
//   const unitPrice = cart.price ?? 0;

//   const lineTotal =
//     typeof cart.price_amount === "number"
//       ? cart.price_amount
//       : quantity * unitPrice;

//   const imageUrl = product.image_url ?? "";

//   return {
//     id: cart.id,
//     cartId: cart.id,
//     productId: product.id,
//     product: cart.product,

//     customerId: cart.id_customer,

//     name: product.name || cart.product,
//     sku: product.sku,
//     brand: product.brand ?? undefined,

//     image: imageUrl,
//     imageUrl,

//     price: unitPrice,
//     unitPrice,
//     quantity,
//     uom: cart.uom || product.uom_default || undefined,

//     lineTotal,
//     checked: cart.check_product,

//     rawCart: cart,
//   };
// }

// /* ======================================================
//  *  Build Summary
//  * ====================================================== */

// export function buildCheckoutSummary(
//   items: CheckoutItem[],
//   opts?: {
//     shippingFee?: number;
//     discount?: number;
//   }
// ): CheckoutSummary {
//   const shippingFee = opts?.shippingFee ?? 0;
//   const discount = opts?.discount ?? 0;

//   const selected = items.filter((i) => i.checked);

//   const itemCount = selected.length;

//   const subtotal = selected.reduce((sum, item) => {
//     const line =
//       typeof item.lineTotal === "number"
//         ? item.lineTotal
//         : item.price * item.quantity;
//     return sum + line;
//   }, 0);

//   const grandTotal = subtotal + shippingFee - discount;

//   return {
//     itemCount,
//     subtotal,
//     shippingFee,
//     discount,
//     grandTotal,
//   };
// }

// /* ======================================================
//  *  Profile Checker
//  * ====================================================== */

// export function isEmptyProfileCore(
//   obj: Record<string, unknown> | null | undefined
// ): boolean {
//   if (!obj) return true;
//   const values = Object.values(obj);
//   if (values.length === 0) return true;

//   return values.every((v) => {
//     if (v === null || v === undefined) return true;
//     const s = String(v).trim();
//     return s === "";
//   });
// }

// export function buildCheckoutProfileInfo(
//   person: PersonProfile | null,
//   entity: EntityProfile | null
// ): CheckoutProfileInfo {
//   const emptyPerson = isEmptyProfileCore(person ?? undefined);
//   const emptyEntity = isEmptyProfileCore(entity ?? undefined);

//   if (!emptyEntity) {
//     return {
//       mode: "entity",
//       email: entity?.entityMail ?? undefined,
//       taxId: entity?.entityTaxId ?? undefined,
//     };
//   }

//   if (!emptyPerson) {
//     return {
//       mode: "person",
//       email: person?.personMail ?? undefined,
//       taxId: person?.personIdCard ?? undefined,
//     };
//   }

//   return { mode: null };
// }

// v.1.1.4 ===============================================================

// v.1.1.3 ===============================================================
// // src/types/checkout.ts

// import type { CartItem } from "@/types/cart";
// import type { PersonProfile, EntityProfile } from "@/types/profile";

// /* ================================
//  *  Address Types (ใช้บนหน้า Checkout)
//  * ================================ */

// export type CheckoutAddressTag = "HOME" | "OFFICE";

// export type CheckoutAddress = {
//   id: number;
//   type: CheckoutAddressTag;
//   name: string;
//   phone: string;
//   address: string;
//   isDefault?: boolean;
// };

// /* ================================
//  *  Item / Summary Types
//  * ================================ */

// export type CheckoutItem = {
//   /** id แถวในหน้า checkout (หรือ cart.id ก็ได้ ถ้าจะผูกจริงทีหลัง) */
//   id: number;

//   /** อ้างอิงไปตาราง cart / product เผื่ออนาคตใช้ */
//   cartId?: number;
//   productId?: number;
//   product?: string;

//   /** ลูกค้าที่เป็นเจ้าของตะกร้า (เผื่อใช้ตอน service) */
//   customerId?: number;

//   /** ข้อมูลแสดงผลบน UI */
//   name: string;
//   sku?: string;
//   brand?: string;

//   /** รูปหลักของสินค้า (แนะนำใช้ตัวนี้ฝั่ง UI) */
//   image: string;

//   /** สำรอง ชื่อรูปแบบ URL เดิม (เผื่อใช้) */
//   imageUrl?: string;

//   /** ราคาต่อหน่วยตอนคิดเงิน */
//   price: number;

//   /** จำนวนที่สั่ง */
//   quantity: number;

//   /** หน่วย เช่น "M.", "PC." */
//   uom?: string;

//   /** ราคาปกติ (ก่อนลด) ถ้ามี */
//   originalPrice?: number;

//   /** ส่วนลดเป็นเปอร์เซ็นต์ (ใช้ขึ้นป้ายแดง) เช่น 60 = 60% */
//   discountPercent?: number;

//   /** ยอดรวมต่อแถว (ถ้าบันทึกมาจาก DB หรือ service คำนวณไว้ให้) */
//   lineTotal?: number;

//   /** สำรองราคาต่อหน่วย (ชื่อเดิม unitPrice) */
//   unitPrice?: number;

//   /** สถานะเลือก/ไม่เลือก (ไว้ใช้กรณีเลือกบางรายการไป checkout) */
//   checked?: boolean;

//   /** เก็บ raw cart item ไว้เผื่อใช้ภายหลังใน service */
//   rawCart?: CartItem;
// };

// export type CheckoutSummary = {
//   /** จำนวน "รายการสินค้า" (แถวที่ checked = true) */
//   itemCount: number;
//   /** ยอดรวมค่าสินค้าก่อนค่าจัดส่ง/ส่วนลด */
//   subtotal: number;
//   /** ค่าจัดส่ง */
//   shippingFee: number;
//   /** ส่วนลดจาก voucher / promotion */
//   discount: number;
//   /** ยอดสุทธิที่ต้องจ่าย */
//   grandTotal: number;
// };

// /* ========== ข้อมูล profile ที่มีผลกับ checkout ========== */

// export type CheckoutProfileInfo = {
//   mode: "person" | "entity" | null;
//   email?: string;
//   taxId?: string;
// };

// export type CheckoutData = {
//   items: CheckoutItem[];
//   summary: CheckoutSummary;

//   shippingAddress?: CheckoutAddress | null;
//   billingAddress?: CheckoutAddress | null;
//   profileInfo?: CheckoutProfileInfo;
// };

// /* ================================
//  *  Mapper & Helpers
//  * ================================ */

// export type ProductForCheckout = {
//   id: number;
//   sku: string;
//   name: string;
//   brand?: string | null;
//   image_url?: string | null;
//   /** หน่วย default เผื่อ cart.uom ว่าง */
//   uom_default?: string | null;
// };

// /**
//  * แปลง CartItem + Product → CheckoutItem
//  */
// export function mapCartItemToCheckoutItem(
//   cart: CartItem,
//   product: ProductForCheckout
// ): CheckoutItem {
//   const quantity = cart.quantity ?? 0;
//   const unitPrice = cart.price ?? 0;

//   const lineTotal =
//     typeof cart.price_amount === "number"
//       ? cart.price_amount
//       : quantity * unitPrice;

//   const imageUrl = product.image_url ?? "";

//   return {
//     /** ใช้ cart.id เป็น id หลักของแถว checkout */
//     id: cart.id,
//     cartId: cart.id,
//     productId: product.id,
//     product: cart.product,

//     customerId: cart.id_customer,

//     name: product.name || cart.product,
//     sku: product.sku,
//     brand: product.brand ?? undefined,

//     image: imageUrl, // ใช้แสดงผลใน UI
//     imageUrl, // เก็บสำรองในชื่อเดิม

//     price: unitPrice,
//     unitPrice,
//     quantity,
//     uom: cart.uom || product.uom_default || undefined,

//     lineTotal,
//     // originalPrice / discountPercent ค่อยเติมทีหลังถ้าต้องการ

//     checked: cart.check_product,
//     rawCart: cart,
//   };
// }

// /**
//  * สร้าง summary จากรายการสินค้า
//  */
// export function buildCheckoutSummary(
//   items: CheckoutItem[],
//   opts?: {
//     shippingFee?: number;
//     discount?: number;
//   }
// ): CheckoutSummary {
//   const shippingFee = opts?.shippingFee ?? 0;
//   const discount = opts?.discount ?? 0;

//   // ใช้เฉพาะ item ที่ checked = true (ถ้าไม่ระบุถือว่า false)
//   const selected = items.filter((i) => i.checked);

//   const itemCount = selected.length;

//   // lineTotal อาจ undefined → fallback เป็น price * quantity
//   const subtotal = selected.reduce((sum, item) => {
//     const line =
//       typeof item.lineTotal === "number"
//         ? item.lineTotal
//         : item.price * item.quantity;
//     return sum + line;
//   }, 0);

//   const grandTotal = subtotal + shippingFee - discount;

//   return {
//     itemCount,
//     subtotal,
//     shippingFee,
//     discount,
//     grandTotal,
//   };
// }

// /* ========== ช่วยตรวจ profile ว่าว่างไหม (ใช้ที่ service) ========== */

// export function isEmptyProfileCore(
//   obj: Record<string, unknown> | null | undefined
// ): boolean {
//   if (!obj) return true;
//   const values = Object.values(obj);
//   if (values.length === 0) return true;

//   return values.every((v) => {
//     if (v === null || v === undefined) return true;
//     const s = String(v).trim();
//     return s === "";
//   });
// }

// /**
//  * เลือก mode และข้อมูลเบื้องต้นจาก profile
//  */
// export function buildCheckoutProfileInfo(
//   person: PersonProfile | null,
//   entity: EntityProfile | null
// ): CheckoutProfileInfo {
//   const emptyPerson = isEmptyProfileCore(person ?? undefined);
//   const emptyEntity = isEmptyProfileCore(entity ?? undefined);

//   if (!emptyEntity) {
//     return {
//       mode: "entity",
//       email: entity?.entityMail ?? undefined,
//       taxId: entity?.entityTaxId ?? undefined,
//     };
//   }

//   if (!emptyPerson) {
//     return {
//       mode: "person",
//       email: person?.personMail ?? undefined,
//       taxId: person?.personIdCard ?? undefined,
//     };
//   }

//   return { mode: null };
// }

// v.1.1.3 ===============================================================

// v.1.1.2 ===============================================================
// // src/types/checkout.ts

// import type { CartItem } from "@/types/cart";
// import type { PersonProfile, EntityProfile } from "@/types/profile";

// /* ================================
//  *  Address Types (ใช้บนหน้า Checkout)
//  * ================================ */

// export type CheckoutAddressTag = "HOME" | "OFFICE";

// export type CheckoutAddress = {
//   id: number;
//   type: CheckoutAddressTag;
//   name: string;
//   phone: string;
//   address: string;
//   isDefault?: boolean;
// };

// /* ================================
//  *  Item / Summary Types
//  * ================================ */

// export type CheckoutItem = {
//   /** id แถวในหน้า checkout (หรือ cart.id ก็ได้ ถ้าจะผูกจริงทีหลัง) */
//   id: number;

//   /** อ้างอิงไปตาราง cart / product เผื่ออนาคตใช้ */
//   cartId?: number;
//   productId?: number;
//   product?: string;

//   /** ข้อมูลแสดงผลบน UI */
//   name: string;
//   sku?: string;
//   brand?: string;

//   /** รูปหลักของสินค้า */
//   image: string;

//   /** ราคาต่อหน่วยตอนคิดเงิน */
//   price: number;

//   /** จำนวนที่สั่ง */
//   quantity: number;

//   /** หน่วย เช่น "M.", "PC." */
//   uom?: string;

//   /** ราคาปกติ (ก่อนลด) ถ้ามี */
//   originalPrice?: number;

//   /** ส่วนลดเป็นเปอร์เซ็นต์ (ใช้ขึ้นป้ายแดง) เช่น 60 = 60% */
//   discountPercent?: number;

//   /** ยอดรวมต่อแถว (ถ้าอยากให้ service คำนวณมาให้เลย) */
//   lineTotal?: number;

//   /** สถานะเลือก/ไม่เลือก (ไว้ใช้กรณีเลือกบางรายการไป checkout) */
//   checked?: boolean;
// };

// export type CheckoutSummary = {
//   /** จำนวน "รายการสินค้า" (แถวที่ checked = true) */
//   itemCount: number;
//   /** ยอดรวมค่าสินค้าก่อนค่าจัดส่ง/ส่วนลด */
//   subtotal: number;
//   /** ค่าจัดส่ง */
//   shippingFee: number;
//   /** ส่วนลดจาก voucher / promotion */
//   discount: number;
//   /** ยอดสุทธิที่ต้องจ่าย */
//   grandTotal: number;
// };

// /* ========== ข้อมูลprofileที่มีผลกับ checkout ========== */

// export type CheckoutProfileInfo = {
//   mode: "person" | "entity" | null;
//   email?: string;
//   taxId?: string;
// };

// export type CheckoutData = {
//   items: CheckoutItem[];
//   summary: CheckoutSummary;

//   shippingAddress?: CheckoutAddress | null;
//   billingAddress?: CheckoutAddress | null;
//   profileInfo?: CheckoutProfileInfo;
// };

// /* ================================
//  *  Mapper & Helpers
//  * ================================ */

// export type ProductForCheckout = {
//   id: number;
//   sku: string;
//   name: string;
//   brand?: string | null;
//   image_url?: string | null;
//   /** หน่วย default เผื่อ cart.uom ว่าง */
//   uom_default?: string | null;
// };

// /**
//  * แปลง CartItem + Product → CheckoutItem
//  */
// export function mapCartItemToCheckoutItem(
//   cart: CartItem,
//   product: ProductForCheckout
// ): CheckoutItem {
//   const quantity = cart.quantity ?? 0;
//   const unitPrice = cart.price ?? 0;

//   const lineTotal =
//     typeof cart.price_amount === "number"
//       ? cart.price_amount
//       : quantity * unitPrice;

//   return {
//     cartId: cart.id,
//     customerId: cart.id_customer,
//     product: cart.product,

//     name: product.name || cart.product,
//     brand: product.brand ?? undefined,
//     imageUrl: product.image_url ?? undefined,

//     uom: cart.uom || product.uom_default || "",
//     quantity,
//     unitPrice,
//     lineTotal,

//     checked: cart.check_product,
//     rawCart: cart,
//   };
// }

// /**
//  * สร้าง summary จากรายการสินค้า
//  */
// export function buildCheckoutSummary(
//   items: CheckoutItem[],
//   opts?: {
//     shippingFee?: number;
//     discount?: number;
//   }
// ): CheckoutSummary {
//   const shippingFee = opts?.shippingFee ?? 0;
//   const discount = opts?.discount ?? 0;

//   const selected = items.filter((i) => i.checked);

//   const itemCount = selected.length;
//   const subtotal = selected.reduce((sum, item) => sum + item.lineTotal, 0);

//   const grandTotal = subtotal + shippingFee - discount;

//   return {
//     itemCount,
//     subtotal,
//     shippingFee,
//     discount,
//     grandTotal,
//   };
// }

// /* ========== ช่วยตรวจ profile ว่าว่างไหม (ใช้ที่ service) ========== */

// export function isEmptyProfileCore(
//   obj: Record<string, unknown> | null | undefined
// ): boolean {
//   if (!obj) return true;
//   const values = Object.values(obj);
//   if (values.length === 0) return true;

//   return values.every((v) => {
//     if (v === null || v === undefined) return true;
//     const s = String(v).trim();
//     return s === "";
//   });
// }

// /**
//  * เลือก mode และข้อมูลเบื้องต้นจาก profile
//  */
// export function buildCheckoutProfileInfo(
//   person: PersonProfile | null,
//   entity: EntityProfile | null
// ): CheckoutProfileInfo {
//   const emptyPerson = isEmptyProfileCore(person ?? undefined);
//   const emptyEntity = isEmptyProfileCore(entity ?? undefined);

//   if (!emptyEntity) {
//     return {
//       mode: "entity",
//       email: entity?.entityMail ?? undefined,
//       taxId: entity?.entityTaxId ?? undefined,
//     };
//   }

//   if (!emptyPerson) {
//     return {
//       mode: "person",
//       email: person?.personMail ?? undefined,
//       taxId: person?.personIdCard ?? undefined,
//     };
//   }

//   return { mode: null };
// }

// v.1.1.2 ===============================================================


// // src/types/checkout.ts

// /* ================================
//  *  Checkout module shared types
//  * ================================ */

// import type { CartItem } from "./cart";

// /* ---------- Address Types (ไว้ใช้ตอนเลือกที่อยู่ใน checkout) ---------- */

// export type CheckoutAddressTag = "HOME" | "OFFICE";

// export type CheckoutAddress = {
//   id: number;
//   type: CheckoutAddressTag;
//   name: string;
//   phone: string;
//   address: string;
//   isDefault?: boolean;
// };

// /* ---------- Item ที่ใช้แสดงบนหน้า Checkout (หน้าตาใกล้กับ Cart) ---------- */

// export type CheckoutItem = {
//   /** id แถวในตาราง carts (cart.id) */
//   cartId: number;
//   /** id ลูกค้า เผื่อใช้ในบางกรณี */
//   customerId: number;

//   /** SKU จากตาราง carts.product */
//   product: string;

//   /** ชื่อสินค้า (มาจาก products_clearance) */
//   name: string;
//   brand?: string;
//   imageUrl?: string;

//   /** หน่วยขาย เช่น "EA" (ใช้จาก cart หรือค่า default จากสินค้า) */
//   uom: string;

//   /** จำนวนที่สั่ง (จาก carts.quantity) */
//   quantity: number;

//   /** ราคาต่อหน่วยตอนคิดเงิน (จาก carts.price) */
//   unitPrice: number;

//   /** ยอดรวมต่อแถว (จาก carts.price_amount ถ้ามี, ถ้าไม่มีจะคำนวณ quantity * price แทน) */
//   lineTotal: number;

//   /** สถานะเลือก/ไม่เลือก จาก carts.check_product */
//   checked: boolean;

//   /** เก็บ raw cart item เผื่อ debug หรือใช้ field อื่นในภายหลัง */
//   rawCart?: CartItem;
// };

// /* ---------- สรุปยอดในหน้า Checkout (กล่องเขียวด้านขวา) ---------- */

// export type CheckoutSummary = {
//   /** จำนวนรายการสินค้า (เฉพาะแถวที่ checked = true) */
//   itemCount: number;

//   /** ยอดรวมค่าสินค้าก่อนค่าจัดส่ง/ส่วนลด */
//   subtotal: number;

//   /** ค่าจัดส่งรวม (อาจจะ 0 ถ้ายังไม่คิด) */
//   shippingFee: number;

//   /** ส่วนลดรวม (อาจจะ 0 ถ้ายังไม่มี) */
//   discount: number;

//   /** ยอดชำระทั้งหมด (subtotal + shippingFee - discount) */
//   grandTotal: number;
// };

// /* ---------- โครงข้อมูลรวมที่ /api/checkout หรือหน้า checkout ใช้ ---------- */

// export type CheckoutData = {
//   items: CheckoutItem[];
//   summary: CheckoutSummary;
//   shippingAddress?: CheckoutAddress | null;
//   billingAddress?: CheckoutAddress | null;
// };

// /* ================================
//  *  Mapper & Helper Functions
//  * ================================ */

// /**
//  * ข้อมูลสินค้าขั้นต่ำที่จำเป็นต้องใช้ในการสร้าง CheckoutItem
//  * (คุณจะ map มาจาก products_clearance หรือ view ไหนก็ได้ ขอให้มี field พวกนี้)
//  */
// export type ProductForCheckout = {
//   id: number;
//   sku: string;
//   name: string;
//   brand?: string | null;
//   image_url?: string | null;
//   /** หน่วย default เผื่อ cart.uom ว่าง */
//   uom_default?: string | null;
// };

// /**
//  * แปลง CartItem + Product → CheckoutItem
//  * ใช้ใน service / API ก่อนส่งไปให้หน้า checkout
//  */
// export function mapCartItemToCheckoutItem(
//   cart: CartItem,
//   product: ProductForCheckout
// ): CheckoutItem {
//   const quantity = cart.quantity ?? 0;
//   const unitPrice = cart.price ?? 0;

//   // ถ้ามี price_amount ให้ใช้จาก DB ก่อน, ถ้าไม่มีค่อยคำนวณเอง
//   const lineTotal =
//     typeof cart.price_amount === "number"
//       ? cart.price_amount
//       : quantity * unitPrice;

//   return {
//     cartId: cart.id,
//     customerId: cart.id_customer,
//     product: cart.product,

//     name: product.name,
//     brand: product.brand ?? undefined,
//     imageUrl: product.image_url ?? undefined,

//     uom: cart.uom || product.uom_default || "",
//     quantity,
//     unitPrice,
//     lineTotal,

//     checked: cart.check_product,
//     rawCart: cart,
//   };
// }

// /**
//  * สร้างสรุปยอดคำสั่งซื้อจากรายการ CheckoutItem
//  * ปกติจะใช้ items เฉพาะที่ checked = true
//  */
// export function buildCheckoutSummary(
//   items: CheckoutItem[],
//   opts?: {
//     shippingFee?: number;
//     discount?: number;
//   }
// ): CheckoutSummary {
//   const shippingFee = opts?.shippingFee ?? 0;
//   const discount = opts?.discount ?? 0;

//   // ใช้เฉพาะรายการที่เลือกจริง ๆ
//   const selected = items.filter((i) => i.checked);

//   const itemCount = selected.length;
//   const subtotal = selected.reduce((sum, item) => sum + item.lineTotal, 0);

//   const grandTotal = subtotal + shippingFee - discount;

//   return {
//     itemCount,
//     subtotal,
//     shippingFee,
//     discount,
//     grandTotal,
//   };
// }

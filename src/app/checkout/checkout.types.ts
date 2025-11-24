// v.1.1.2 ===============================================================
// src/app/checkout/checkout.types.ts

/* ========== Address / Shipping ========== */

export type CheckoutAddressTag = "HOME" | "OFFICE";

export type CheckoutAddress = {
  id: number;
  type: CheckoutAddressTag;
  name: string;
  phone: string;
  /** ที่อยู่รวมทุกอย่างในรูปแบบพร้อมแสดง */
  address: string;
  isDefault: boolean;
};

/** ตัวเลือกการจัดส่งต่อแพ็กเกจ (ไว้ขยายในอนาคต) */
export type DeliveryOption = "standard" | "express";

/* ========== Items / Packages ========== */

export type CheckoutItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  store: string;
  /** ราคาเดิม (ถ้ามี) */
  originalPrice?: number;
  /** ข้อความส่วนลด เช่น "Save ฿200" */
  discount?: string;
};

/* ถ้าในอนาคตต้องมีหลายร้าน/หลายแพ็กเกจจริง ๆ ค่อยใช้ type นี้ */
export type CheckoutPackage = {
  id: number;
  /** เช่น "แพ็กเกจ 1 จาก 2" */
  title: string;
  /** ร้านที่จัดส่ง เช่น TechMall Official Store */
  storeName: string;
  /** วิธีส่งที่เลือก */
  deliveryOption: DeliveryOption;
  items: CheckoutItem[];
};

/* ========== Voucher / Discount ========== */

export type CheckoutVoucher = {
  code: string;
  discount: number;
};

/* ========== Payment ========== */

export type PaymentMethod =
  | "card"
  | "qr"
  | "cash" // เก็บเงินปลายทาง
  | "linepay"
  | "internetbanking"
  | "banktransfer";

/** array ของ payment method (ใช้ใน component แทน as string[]) */
export type PaymentMethodsArray = PaymentMethod[];

/** ใช้ตอนเตรียมส่งไปหน้าชำระเงิน / payment gateway */
export type CheckoutPaymentData = {
  amount: number;
  orderId: string;
  items: CheckoutItem[];
  subtotal: number;
  shippingFee: number;
  /** ส่วนลดค่าจัดส่ง เช่น จากคูปอง freeship */
  shippingDiscount: number;
  /** ส่วนลดจาก voucher อื่น ๆ */
  voucherDiscount: number;
  appliedVouchers: CheckoutVoucher[];
};

/* ========== Invoice / Tax Info ========== */

export type CheckoutInvoiceInfo = {
  email: string;
  billingAddress: string;
  taxId?: string;
  headOfficeBranch?: string;
};

/* ========== Summary Section Props ========== */

export type CheckoutSummaryProps = {
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  voucherDiscount: number;
  total: number;
  onPlaceOrder: () => void;
};

// v.1.1.2 ===============================================================


// // src/app/checkout/checkout.types.ts

// /* ========== Address / Shipping ========== */

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

// /** ตัวเลือกการจัดส่งต่อแพ็กเกจ (ไว้ขยายในอนาคต) */
// export type DeliveryOption = "standard" | "express";

// /* ========== Items / Packages ========== */

// export type CheckoutItem = {
//   id: number;
//   name: string;
//   price: number;
//   quantity: number;
//   image: string;
//   store: string;
//   /** ราคาเดิม (ถ้ามี) */
//   originalPrice?: number;
//   /** ข้อความส่วนลด เช่น "Save ฿200" */
//   discount?: string;
// };

// /* ถ้าในอนาคตต้องมีหลายร้าน/หลายแพ็กเกจจริง ๆ ค่อยใช้ type นี้ */
// export type CheckoutPackage = {
//   id: number;
//   /** เช่น "แพ็กเกจ 1 จาก 2" */
//   title: string;
//   /** ร้านที่จัดส่ง เช่น TechMall Official Store */
//   storeName: string;
//   /** วิธีส่งที่เลือก */
//   deliveryOption: DeliveryOption;
//   items: CheckoutItem[];
// };

// /* ========== Voucher / Discount ========== */

// export type CheckoutVoucher = {
//   code: string;
//   discount: number;
// };

// /* ========== Payment ========== */

// export type PaymentMethod =
//   | "card"
//   | "qr"
//   | "cash"             // เก็บเงินปลายทาง
//   | "linepay"
//   | "internetbanking"
//   | "banktransfer";

// /** ใช้ตอนเตรียมส่งไปหน้าชำระเงิน / payment gateway */
// export type CheckoutPaymentData = {
//   amount: number;
//   orderId: string;
//   items: CheckoutItem[];
//   subtotal: number;
//   shippingFee: number;
//   /** ส่วนลดค่าจัดส่ง เช่น จากคูปอง freeship */
//   shippingDiscount: number;
//   /** ส่วนลดจาก voucher อื่น ๆ */
//   voucherDiscount: number;
//   appliedVouchers: CheckoutVoucher[];
// };

// /* ========== Invoice / Tax Info ========== */

// export type CheckoutInvoiceInfo = {
//   email: string;
//   billingAddress: string;
//   taxId?: string;
//   headOfficeBranch?: string;
// };

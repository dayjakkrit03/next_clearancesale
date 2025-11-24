// src/services/checkout/checkout.service.ts

import type { CheckoutPageData } from "./checkout.types";
import {
  fetchCartItems,
  fetchDefaultShippingAddress,
} from "./checkout.repo";
import type {
  CheckoutVoucher,
  PaymentMethod,
} from "@/app/checkout/checkout.types";

/**
 * ฟังก์ชันหลักสำหรับเตรียม data ให้หน้า /checkout
 */
export async function getCheckoutPageData(
  customerId: number | null,
): Promise<CheckoutPageData> {
  const [items, shippingAddress] = await Promise.all([
    fetchCartItems(customerId),
    fetchDefaultShippingAddress(customerId),
  ]);

  // ตอนนี้ยังไม่มีระบบ voucher จริง ใช้ array ว่างไปก่อน
  const appliedVouchers: CheckoutVoucher[] = [];

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // สมมติ logic ตอนนี้:
  // - ถ้ามีสินค้าให้คิดค่าขนส่ง 65 แล้วมีส่วนลดค่าขนส่ง 65 (= freeship)
  // - ภายหลังค่อยดึงจาก rules จริง
  const shippingFee = items.length > 0 ? 65 : 0;
  const voucherDiscount = appliedVouchers.reduce(
    (sum, v) => sum + v.discount,
    0,
  );
  const shippingDiscount = shippingFee; // freeship ทั้งหมด

  const total =
    subtotal + shippingFee - voucherDiscount - shippingDiscount;

  const availablePaymentMethods: PaymentMethod[] = [
    "card",
    "qr",
    "cash",
    "linepay",
    "internetbanking",
    "banktransfer",
  ];

  return {
    items,
    shippingAddress,
    invoiceInfo: null, // ภายหลังค่อยไปดึงจาก profile/invoice table
    appliedVouchers,
    availablePaymentMethods,

    subtotal,
    shippingFee,
    voucherDiscount,
    shippingDiscount,
    total,
  };
}

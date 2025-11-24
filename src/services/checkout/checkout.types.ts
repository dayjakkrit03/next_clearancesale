// src/services/checkout/checkout.types.ts

import type {
  CheckoutItem,
  CheckoutAddress,
  CheckoutVoucher,
  CheckoutInvoiceInfo,
  PaymentMethod,
} from "@/app/checkout/checkout.types";

/**
 * ข้อมูลทั้งหมดที่หน้า /checkout ต้องการจากฝั่ง server/service
 */
export type CheckoutPageData = {
  items: CheckoutItem[];
  shippingAddress: CheckoutAddress | null;
  invoiceInfo: CheckoutInvoiceInfo | null;
  appliedVouchers: CheckoutVoucher[];

  availablePaymentMethods: PaymentMethod[];

  subtotal: number;
  shippingFee: number;
  voucherDiscount: number;
  shippingDiscount: number;
  total: number;
};

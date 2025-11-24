// src/app/checkout/CheckoutClient.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import CheckoutShippingAddressSection from "./component/CheckoutShippingAddressSection";
import CheckoutPackagesSection from "./component/CheckoutPackagesSection";
import CheckoutPaymentSection from "./component/CheckoutPaymentSection";
import CheckoutVoucherSection from "./component/CheckoutVoucherSection";
import CheckoutInvoiceSection from "./component/CheckoutInvoiceSection";
import CheckoutSummarySection from "./component/CheckoutSummarySection";

import type {
  CheckoutItem,
  CheckoutVoucher,
  DeliveryOption,
  PaymentMethod,
  CheckoutPaymentData,
} from "./checkout.types";

import type { CheckoutPageData } from "@/services/checkout";

type Props = {
  initialData: CheckoutPageData;
};

export default function CheckoutClient({ initialData }: Props) {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ===== State หลักที่มีผลหลายส่วน =====

  // สินค้า ใช้จาก service layer
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(
    initialData.items,
  );

  // วิธีจัดส่ง ปัจจุบันยังใช้ mock logic แบบเดิม
  const [deliveryOption, setDeliveryOption] =
    useState<DeliveryOption>("standard");

  // วิธีชำระเงิน เริ่มจากตัวแรกที่ service ส่งมา หรือ "card"
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialData.availablePaymentMethods[0] ?? "card",
  );

  // Voucher state
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVouchers, setAppliedVouchers] = useState<CheckoutVoucher[]>(
    initialData.appliedVouchers ?? [],
  );
  const [voucherError, setVoucherError] = useState("");

  // ===== คำนวณราคา (ฝั่ง client) =====

  const subtotal = checkoutItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // ตาม logic เดิมของหน้า checkout:
  // - ถ้า standard => shippingFee = 0 (แต่อยู่ใน UI จะโชว์ 65 + ส่วนลด 65 แยก)
  // - ถ้า express => shippingFee = 65
  const shippingFee = deliveryOption === "standard" ? 0 : 65;

  const voucherDiscount = appliedVouchers.reduce(
    (sum, voucher) => sum + voucher.discount,
    0,
  );

  const total = subtotal + shippingFee - voucherDiscount;

  // ===== Logic Voucher =====

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) return;

    setVoucherError("");

    const mockVouchers: Record<string, CheckoutVoucher> = {
      SAVE100: { code: "SAVE100", discount: 100 },
      DISCOUNT50: { code: "DISCOUNT50", discount: 50 },
      FREESHIP: { code: "FREESHIP", discount: 65 },
      VC0001: { code: "VC0001", discount: 100 },
      VC0002: { code: "VC0002", discount: 200 },
    };

    const key = voucherCode.toUpperCase();
    const voucher = mockVouchers[key];

    if (!voucher) {
      setVoucherError("โค้ดส่วนลดไม่ถูกต้อง");
      return;
    }

    const isAlreadyApplied = appliedVouchers.some(
      (v) => v.code === voucher.code,
    );
    if (isAlreadyApplied) {
      setVoucherError("โค้ดนี้ถูกใช้แล้ว");
      return;
    }

    setAppliedVouchers((prev) => [...prev, voucher]);
    setVoucherCode("");
  };

  const handleRemoveVoucher = (codeToRemove: string) => {
    setAppliedVouchers((prev) => prev.filter((v) => v.code !== codeToRemove));
  };

  // ===== Logic Cart Item =====

  const handleRemoveItem = (itemId: number) => {
    setCheckoutItems((items) => items.filter((item) => item.id !== itemId));
  };

  // ===== Place Order =====

  const handlePlaceOrder = () => {
    const paymentData: CheckoutPaymentData = {
      amount: total,
      orderId: `ORDER-${Date.now()}`,
      items: checkoutItems,
      subtotal,
      shippingFee,
      shippingDiscount: 65, // ตอนนี้ยัง fix ตาม UI เดิม
      voucherDiscount,
      appliedVouchers,
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("paymentData", JSON.stringify(paymentData));
    }

    if (paymentMethod === "card") {
      router.push("/payment/card");
    } else if (paymentMethod === "qr") {
      router.push("/payment/qr");
    } else {
      // ยังไม่มี route แยกสำหรับวิธีอื่น ใช้ card เป็น default
      router.push("/payment/card");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/cart">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">ชำระเงิน</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ซ้าย: ที่อยู่ + แพ็กเกจสินค้า */}
          <div className="lg:col-span-2 space-y-6">
            <CheckoutShippingAddressSection />

            <CheckoutPackagesSection
              checkoutItems={checkoutItems}
              deliveryOption={deliveryOption}
              onChangeDeliveryOption={setDeliveryOption}
              onRemoveItem={handleRemoveItem}
            />
          </div>

          {/* ขวา: การชำระเงิน / Voucher / ใบกำกับ / สรุปยอด */}
          <div className="space-y-6">
            <CheckoutPaymentSection
              paymentMethod={paymentMethod}
              onChangePaymentMethod={setPaymentMethod}
            />

            <CheckoutVoucherSection
              voucherCode={voucherCode}
              setVoucherCode={setVoucherCode}
              voucherError={voucherError}
              setVoucherError={setVoucherError}
              appliedVouchers={appliedVouchers}
              onApplyVoucher={handleApplyVoucher}
              onRemoveVoucher={handleRemoveVoucher}
            />

            <CheckoutInvoiceSection />

            <CheckoutSummarySection
              itemCount={checkoutItems.length}
              subtotal={subtotal}
              shippingFee={shippingFee}
              voucherDiscount={voucherDiscount}
              total={total}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

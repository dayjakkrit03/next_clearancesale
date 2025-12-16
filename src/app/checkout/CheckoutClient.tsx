// v.1.1.17 =================================================================
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import CheckoutAddressSection from "./component/CheckoutAddressSection";
import CheckoutPackagesSection from "./component/CheckoutPackagesSection";
import CheckoutPaymentSection from "./component/CheckoutPaymentSection";
import CheckoutSummarySection from "./component/CheckoutSummarySection";
import PaymentPopup from "./component/PaymentPopup";

import type {
  CheckoutData,
  CheckoutItem,
  DeliveryOption,
  PaymentMethod,
  CheckoutVoucher,
  CheckoutAddress,
  CheckoutProfileInfo,
} from "@/types/checkout";
import { buildCheckoutProfileAddressBook } from "@/types/checkout";
import type { PersonProfile, EntityProfile } from "@/types/profile";

type Props = {
  initialData: CheckoutData;
};

export default function CheckoutClient({ initialData }: Props) {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* ===================== STATE ===================== */

  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(
    initialData.items ?? [],
  );

  const [insufficientSkus, setInsufficientSkus] = useState<string[]>([]);

  const [shippingAddress, setShippingAddress] =
    useState<CheckoutAddress | null>(initialData.shippingAddress ?? null);

  const [billingAddress, setBillingAddress] =
    useState<CheckoutAddress | null>(initialData.billingAddress ?? null);

  const [profileInfo, setProfileInfo] =
    useState<CheckoutProfileInfo | undefined>(initialData.profileInfo);

  const [personProfile, setPersonProfile] = useState<PersonProfile | null>(
    initialData.personProfile ?? null,
  );
  const [entityProfile, setEntityProfile] = useState<EntityProfile | null>(
    initialData.entityProfile ?? null,
  );

  const addressProfiles = buildCheckoutProfileAddressBook(
    personProfile,
    entityProfile,
  );

  const [deliveryOption, setDeliveryOption] =
    useState<DeliveryOption>("standard");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("card");

  const [appliedVouchers, setAppliedVouchers] = useState<CheckoutVoucher[]>([]);

  /* ===================== SUMMARY ===================== */

  const subtotal = checkoutItems.reduce((sum, item) => {
    const line =
      typeof item.lineTotal === "number"
        ? item.lineTotal
        : item.price * item.quantity;
    return sum + line;
  }, 0);

  const shippingFee = deliveryOption === "standard" ? 0 : 65;

  const voucherDiscount = appliedVouchers.reduce(
    (sum, voucher) => sum + voucher.discount,
    0,
  );

  const total = subtotal + shippingFee - voucherDiscount;

  /* ===================== POPUP ===================== */

  const [paymentPopupOpen, setPaymentPopupOpen] = useState(false);

  // 🔒 กัน submit ซ้ำ
  const submittingRef = useRef(false);

  /* ===================== ACTION ===================== */

  const handlePlaceOrder = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (!data.ok) {
        alert("กรุณาเข้าสู่ระบบใหม่");
        submittingRef.current = false;
        return;
      }

      const customerId = data.user.id;

      // 🔹 ตัดสินว่าเป็นบุคคล / นิติบุคคล
      // Laravel เดิมใช้ radio: 0 = person, 1 = entity
      const radio =
        profileInfo?.mode === "entity" ? "1" : "0";

      // เปิด popup ก่อน
      setPaymentPopupOpen(true);

      // สร้าง form ยิงเข้า Laravel
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "http://localhost:8081/next/makebuy";
      form.target = "payment_iframe";

      const add = (name: string, value: string) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      };

      add("customer_id", String(customerId));
      add("payment_method", paymentMethod === "qr" ? "payqr" : "paycard");
      add("radio", radio); // ✅ สำคัญ: ส่งบุคคล / นิติบุคคล

      document.body.appendChild(form);

      requestAnimationFrame(() => {
        form.submit();
      });
    } catch (e) {
      submittingRef.current = false;
    }
  };

  /* ===================== RENDER ===================== */

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
          {/* ซ้าย */}
          <div className="lg:col-span-2 space-y-6">
            <CheckoutAddressSection
              shippingAddress={shippingAddress}
              billingAddress={billingAddress}
              profileInfo={profileInfo}
              onChangeShippingAddress={setShippingAddress}
              onChangeBillingAddress={setBillingAddress}
              onChangeProfileInfo={setProfileInfo}
              addressProfiles={addressProfiles}
              personProfile={personProfile}
              entityProfile={entityProfile}
              onProfileSaved={(updated) => {
                if (updated.person !== undefined) {
                  setPersonProfile(updated.person ?? null);
                }
                if (updated.entity !== undefined) {
                  setEntityProfile(updated.entity ?? null);
                }
              }}
            />

            <CheckoutPackagesSection
              checkoutItems={checkoutItems}
              deliveryOption={deliveryOption}
              insufficientSkus={insufficientSkus}
              onFixInsufficientItem={async (item) => {
                const cartRowId = Number(item.cartId ?? item.id);
                const productId = item.productId;

                setCheckoutItems((prev) =>
                  prev.filter((x) => x.id !== item.id),
                );

                try {
                  await fetch("/api/cart/remove", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: cartRowId }),
                  });
                } catch {}

                if (productId) {
                  router.push(
                    `/product/${productId}?returnTo=${encodeURIComponent(
                      "/checkout",
                    )}`,
                  );
                  return;
                }

                router.push("/products");
              }}
              onChangeDeliveryOption={setDeliveryOption}
              onRemoveItem={(id) =>
                setCheckoutItems((items) =>
                  items.filter((item) => item.id !== id),
                )
              }
            />
          </div>

          {/* ขวา */}
          <div className="space-y-6">
            <CheckoutPaymentSection
              paymentMethod={paymentMethod}
              onChangePaymentMethod={setPaymentMethod}
            />

            <CheckoutSummarySection
              itemCount={checkoutItems.length}
              subtotal={subtotal}
              shippingFee={shippingFee}
              voucherDiscount={voucherDiscount}
              total={total}
              onPlaceOrder={handlePlaceOrder}
              items={checkoutItems as any}
              setInsufficientSkus={setInsufficientSkus}
            />
          </div>
        </div>
      </div>

      <PaymentPopup
        open={paymentPopupOpen}
        onClose={() => {
          setPaymentPopupOpen(false);
          submittingRef.current = false;
        }}
        iframeUrl=""
        title={paymentMethod === "qr" ? "ชำระเงิน QR Code" : "ชำระเงินด้วยบัตร"}
      />
    </div>
  );
}

// v.1.1.17 =================================================================

// v.1.1.16 =================================================================
// // src/app/checkout/CheckoutClient.tsx
// "use client";

// import { useEffect, useRef, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { ArrowLeft } from "lucide-react";

// import { Button } from "@/components/ui/button";

// import CheckoutAddressSection from "./component/CheckoutAddressSection";
// import CheckoutPackagesSection from "./component/CheckoutPackagesSection";
// import CheckoutPaymentSection from "./component/CheckoutPaymentSection";
// import CheckoutSummarySection from "./component/CheckoutSummarySection";
// import PaymentPopup from "./component/PaymentPopup";

// import type {
//   CheckoutData,
//   CheckoutItem,
//   DeliveryOption,
//   PaymentMethod,
//   CheckoutVoucher,
//   CheckoutAddress,
//   CheckoutProfileInfo,
// } from "@/types/checkout";
// import { buildCheckoutProfileAddressBook } from "@/types/checkout";
// import type { PersonProfile, EntityProfile } from "@/types/profile";

// type Props = {
//   initialData: CheckoutData;
// };

// export default function CheckoutClient({ initialData }: Props) {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   /* ===================== STATE ===================== */

//   const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(
//     initialData.items ?? [],
//   );

//   const [insufficientSkus, setInsufficientSkus] = useState<string[]>([]);

//   const [shippingAddress, setShippingAddress] =
//     useState<CheckoutAddress | null>(initialData.shippingAddress ?? null);

//   const [billingAddress, setBillingAddress] =
//     useState<CheckoutAddress | null>(initialData.billingAddress ?? null);

//   const [profileInfo, setProfileInfo] =
//     useState<CheckoutProfileInfo | undefined>(initialData.profileInfo);

//   const [personProfile, setPersonProfile] = useState<PersonProfile | null>(
//     initialData.personProfile ?? null,
//   );
//   const [entityProfile, setEntityProfile] = useState<EntityProfile | null>(
//     initialData.entityProfile ?? null,
//   );

//   const addressProfiles = buildCheckoutProfileAddressBook(
//     personProfile,
//     entityProfile,
//   );

//   const [deliveryOption, setDeliveryOption] =
//     useState<DeliveryOption>("standard");

//   const [paymentMethod, setPaymentMethod] =
//     useState<PaymentMethod>("card");

//   const [appliedVouchers, setAppliedVouchers] = useState<CheckoutVoucher[]>([]);

//   /* ===================== SUMMARY ===================== */

//   const subtotal = checkoutItems.reduce((sum, item) => {
//     const line =
//       typeof item.lineTotal === "number"
//         ? item.lineTotal
//         : item.price * item.quantity;
//     return sum + line;
//   }, 0);

//   const shippingFee = deliveryOption === "standard" ? 0 : 65;

//   const voucherDiscount = appliedVouchers.reduce(
//     (sum, voucher) => sum + voucher.discount,
//     0,
//   );

//   const total = subtotal + shippingFee - voucherDiscount;

//   /* ===================== POPUP ===================== */

//   const [paymentPopupOpen, setPaymentPopupOpen] = useState(false);

//   // 🔒 กัน submit ซ้ำ (ตัวแก้หลัก)
//   const submittingRef = useRef(false);

//   /* ===================== ACTION ===================== */

//   const handlePlaceOrder = async () => {
//     // 🔒 กันกดซ้ำ / event ซ้อน
//     if (submittingRef.current) return;
//     submittingRef.current = true;

//     try {
//       const res = await fetch("/api/auth/me");
//       const data = await res.json();

//       if (!data.ok) {
//         alert("กรุณาเข้าสู่ระบบใหม่");
//         submittingRef.current = false;
//         return;
//       }

//       const customerId = data.user.id;

//       // เปิด popup ก่อน (ให้ iframe พร้อม)
//       setPaymentPopupOpen(true);

//       // สร้าง form ยิงเข้า Laravel
//       const form = document.createElement("form");
//       form.method = "POST";
//       form.action = "http://localhost:8081/next/makebuy";
//       form.target = "payment_iframe";

//       const add = (name: string, value: string) => {
//         const input = document.createElement("input");
//         input.type = "hidden";
//         input.name = name;
//         input.value = value;
//         form.appendChild(input);
//       };

//       add("customer_id", String(customerId));
//       add("payment_method", paymentMethod === "qr" ? "payqr" : "paycard");

//       document.body.appendChild(form);

//       // ✅ submit แค่ครั้งเดียว หลัง popup render
//       requestAnimationFrame(() => {
//         form.submit();
//       });
//     } catch (e) {
//       submittingRef.current = false;
//     }
//   };

//   /* ===================== RENDER ===================== */

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Link href="/cart">
//             <Button variant="ghost" size="icon">
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//           </Link>
//           <h1 className="text-2xl font-bold">ชำระเงิน</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ซ้าย */}
//           <div className="lg:col-span-2 space-y-6">
//             <CheckoutAddressSection
//               shippingAddress={shippingAddress}
//               billingAddress={billingAddress}
//               profileInfo={profileInfo}
//               onChangeShippingAddress={setShippingAddress}
//               onChangeBillingAddress={setBillingAddress}
//               onChangeProfileInfo={setProfileInfo}
//               addressProfiles={addressProfiles}
//               personProfile={personProfile}
//               entityProfile={entityProfile}
//               onProfileSaved={(updated) => {
//                 if (updated.person !== undefined) {
//                   setPersonProfile(updated.person ?? null);
//                 }
//                 if (updated.entity !== undefined) {
//                   setEntityProfile(updated.entity ?? null);
//                 }
//               }}
//             />

//             <CheckoutPackagesSection
//               checkoutItems={checkoutItems}
//               deliveryOption={deliveryOption}
//               insufficientSkus={insufficientSkus}
//               onFixInsufficientItem={async (item) => {
//                 const cartRowId = Number(item.cartId ?? item.id);
//                 const productId = item.productId;

//                 setCheckoutItems((prev) =>
//                   prev.filter((x) => x.id !== item.id),
//                 );

//                 try {
//                   await fetch("/api/cart/remove", {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ id: cartRowId }),
//                   });
//                 } catch {}

//                 if (productId) {
//                   router.push(
//                     `/product/${productId}?returnTo=${encodeURIComponent(
//                       "/checkout",
//                     )}`,
//                   );
//                   return;
//                 }

//                 router.push("/products");
//               }}
//               onChangeDeliveryOption={setDeliveryOption}
//               onRemoveItem={(id) =>
//                 setCheckoutItems((items) =>
//                   items.filter((item) => item.id !== id),
//                 )
//               }
//             />
//           </div>

//           {/* ขวา */}
//           <div className="space-y-6">
//             <CheckoutPaymentSection
//               paymentMethod={paymentMethod}
//               onChangePaymentMethod={setPaymentMethod}
//             />

//             <CheckoutSummarySection
//               itemCount={checkoutItems.length}
//               subtotal={subtotal}
//               shippingFee={shippingFee}
//               voucherDiscount={voucherDiscount}
//               total={total}
//               onPlaceOrder={handlePlaceOrder}
//               items={checkoutItems as any}
//               setInsufficientSkus={setInsufficientSkus}
//             />
//           </div>
//         </div>
//       </div>

//       <PaymentPopup
//         open={paymentPopupOpen}
//         onClose={() => {
//           setPaymentPopupOpen(false);
//           submittingRef.current = false; // เผื่อผู้ใช้ปิดแล้วกดใหม่
//         }}
//         iframeUrl=""
//         title={paymentMethod === "qr" ? "ชำระเงิน QR Code" : "ชำระเงินด้วยบัตร"}
//       />
//     </div>
//   );
// }

// v.1.1.16 =================================================================

// v.1.1.15 =================================================================
// // src/app/checkout/CheckoutClient.tsx
// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { ArrowLeft } from "lucide-react";

// import { Button } from "@/components/ui/button";

// import CheckoutAddressSection from "./component/CheckoutAddressSection";
// import CheckoutPackagesSection from "./component/CheckoutPackagesSection";
// import CheckoutPaymentSection from "./component/CheckoutPaymentSection";
// import CheckoutSummarySection from "./component/CheckoutSummarySection";
// import PaymentPopup from "./component/PaymentPopup";

// import type {
//   CheckoutData,
//   CheckoutItem,
//   DeliveryOption,
//   PaymentMethod,
//   CheckoutVoucher,
//   CheckoutAddress,
//   CheckoutProfileInfo,
// } from "@/types/checkout";
// import { buildCheckoutProfileAddressBook } from "@/types/checkout";
// import type { PersonProfile, EntityProfile } from "@/types/profile";

// type Props = {
//   initialData: CheckoutData;
// };

// export default function CheckoutClient({ initialData }: Props) {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   /* ===================== STATE ===================== */

//   const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(
//     initialData.items ?? [],
//   );

//   const [insufficientSkus, setInsufficientSkus] = useState<string[]>([]);

//   const [shippingAddress, setShippingAddress] =
//     useState<CheckoutAddress | null>(initialData.shippingAddress ?? null);

//   const [billingAddress, setBillingAddress] =
//     useState<CheckoutAddress | null>(initialData.billingAddress ?? null);

//   const [profileInfo, setProfileInfo] =
//     useState<CheckoutProfileInfo | undefined>(initialData.profileInfo);

//   const [personProfile, setPersonProfile] = useState<PersonProfile | null>(
//     initialData.personProfile ?? null,
//   );
//   const [entityProfile, setEntityProfile] = useState<EntityProfile | null>(
//     initialData.entityProfile ?? null,
//   );

//   const addressProfiles = buildCheckoutProfileAddressBook(
//     personProfile,
//     entityProfile,
//   );

//   const [deliveryOption, setDeliveryOption] =
//     useState<DeliveryOption>("standard");

//   const [paymentMethod, setPaymentMethod] =
//     useState<PaymentMethod>("card");

//   const [appliedVouchers, setAppliedVouchers] = useState<CheckoutVoucher[]>([]);

//   /* ===================== SUMMARY ===================== */

//   const subtotal = checkoutItems.reduce((sum, item) => {
//     const line =
//       typeof item.lineTotal === "number"
//         ? item.lineTotal
//         : item.price * item.quantity;
//     return sum + line;
//   }, 0);

//   const shippingFee = deliveryOption === "standard" ? 0 : 65;

//   const voucherDiscount = appliedVouchers.reduce(
//     (sum, voucher) => sum + voucher.discount,
//     0,
//   );

//   const total = subtotal + shippingFee - voucherDiscount;

//   /* ===================== POPUP ===================== */

//   const [paymentPopupOpen, setPaymentPopupOpen] = useState(false);

//   /* ===================== ACTION ===================== */

//   /** ✅ POST เข้า iframe /next/makebuy */
//   const handlePlaceOrder = async () => {

//     const res = await fetch("/api/auth/me");
//     const data = await res.json();

//     if (!data.ok) {
//       alert("กรุณาเข้าสู่ระบบใหม่");
//       return;
//     }

//     const customerId = data.user.id; // ⭐ ตัวนี้แหละ

//   // เปิด popup ก่อน เพื่อให้ iframe ถูก render และมี name="payment_iframe"
//   setPaymentPopupOpen(true);

//   const form = document.createElement("form");
//   form.method = "POST";
//   form.action = "http://localhost:8081/next/makebuy";
//   form.target = "payment_iframe";

//   const add = (name: string, value: string) => {
//     const input = document.createElement("input");
//     input.type = "hidden";
//     input.name = name;
//     input.value = value;
//     form.appendChild(input);
//   };

//   // ใส่ค่าที่คุณส่งจริง
//   add("customer_id", customerId);
//   add("payment_method", paymentMethod === "qr" ? "payqr" : "paycard");

//   // add("customer_id", "573");
//   // add("payment_method", paymentMethod === "qr" ? "payqr" : "paycard");

//   document.body.appendChild(form);

//   // รอให้ popup/iframe โผล่ก่อนค่อย submit
//   requestAnimationFrame(() => form.submit());
// };


//   /* ===================== RENDER ===================== */

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Link href="/cart">
//             <Button variant="ghost" size="icon">
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//           </Link>
//           <h1 className="text-2xl font-bold">ชำระเงิน</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ซ้าย */}
//           <div className="lg:col-span-2 space-y-6">
//             <CheckoutAddressSection
//               shippingAddress={shippingAddress}
//               billingAddress={billingAddress}
//               profileInfo={profileInfo}
//               onChangeShippingAddress={setShippingAddress}
//               onChangeBillingAddress={setBillingAddress}
//               onChangeProfileInfo={setProfileInfo}
//               addressProfiles={addressProfiles}
//               personProfile={personProfile}
//               entityProfile={entityProfile}
//               onProfileSaved={(updated) => {
//                 if (updated.person !== undefined) {
//                   setPersonProfile(updated.person ?? null);
//                 }
//                 if (updated.entity !== undefined) {
//                   setEntityProfile(updated.entity ?? null);
//                 }
//               }}
//             />

//             <CheckoutPackagesSection
//               checkoutItems={checkoutItems}
//               deliveryOption={deliveryOption}
//               insufficientSkus={insufficientSkus}
//               onFixInsufficientItem={async (item) => {
//                 const cartRowId = Number(item.cartId ?? item.id);
//                 const productId = item.productId;

//                 setCheckoutItems((prev) =>
//                   prev.filter((x) => x.id !== item.id),
//                 );

//                 try {
//                   await fetch("/api/cart/remove", {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ id: cartRowId }),
//                   });
//                 } catch {}

//                 if (productId) {
//                   router.push(
//                     `/product/${productId}?returnTo=${encodeURIComponent(
//                       "/checkout",
//                     )}`,
//                   );
//                   return;
//                 }

//                 router.push("/products");
//               }}
//               onChangeDeliveryOption={setDeliveryOption}
//               onRemoveItem={(id) =>
//                 setCheckoutItems((items) =>
//                   items.filter((item) => item.id !== id),
//                 )
//               }
//             />
//           </div>

//           {/* ขวา */}
//           <div className="space-y-6">
//             <CheckoutPaymentSection
//               paymentMethod={paymentMethod}
//               onChangePaymentMethod={setPaymentMethod}
//             />

//             <CheckoutSummarySection
//               itemCount={checkoutItems.length}
//               subtotal={subtotal}
//               shippingFee={shippingFee}
//               voucherDiscount={voucherDiscount}
//               total={total}
//               onPlaceOrder={handlePlaceOrder}
//               items={checkoutItems as any}
//               setInsufficientSkus={setInsufficientSkus}
//             />
//           </div>
//         </div>
//       </div>

//       <PaymentPopup
//         open={paymentPopupOpen}
//         onClose={() => setPaymentPopupOpen(false)}
//         iframeUrl=""
//         title={paymentMethod === "qr" ? "ชำระเงิน QR Code" : "ชำระเงินด้วยบัตร"}
//       />
//     </div>
//   );
// }



// v.1.1.15 =================================================================

// v.1.1.14 ===============================================================
// // src/app/checkout/CheckoutClient.tsx
// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { ArrowLeft } from "lucide-react";

// import { Button } from "@/components/ui/button";

// import CheckoutAddressSection from "./component/CheckoutAddressSection";
// import CheckoutPackagesSection from "./component/CheckoutPackagesSection";
// import CheckoutPaymentSection from "./component/CheckoutPaymentSection";
// import CheckoutSummarySection from "./component/CheckoutSummarySection";
// import PaymentPopup from "./component/PaymentPopup";

// import type {
//   CheckoutData,
//   CheckoutItem,
//   DeliveryOption,
//   PaymentMethod,
//   CheckoutVoucher,
//   CheckoutAddress,
//   CheckoutProfileInfo,
// } from "@/types/checkout";
// import { buildCheckoutProfileAddressBook } from "@/types/checkout";
// import type { PersonProfile, EntityProfile } from "@/types/profile";

// type Props = {
//   initialData: CheckoutData;
// };

// export default function CheckoutClient({ initialData }: Props) {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   /* ===================== STATE ===================== */

//   const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(
//     initialData.items ?? [],
//   );

//   /** ✅ เก็บ SKU ที่สต๊อกไม่พอ (ไว้ไฮไลต์กรอบแดง) */
//   const [insufficientSkus, setInsufficientSkus] = useState<string[]>([]);

//   const [shippingAddress, setShippingAddress] =
//     useState<CheckoutAddress | null>(initialData.shippingAddress ?? null);

//   const [billingAddress, setBillingAddress] =
//     useState<CheckoutAddress | null>(initialData.billingAddress ?? null);

//   const [profileInfo, setProfileInfo] =
//     useState<CheckoutProfileInfo | undefined>(initialData.profileInfo);

//   const [personProfile, setPersonProfile] = useState<PersonProfile | null>(
//     initialData.personProfile ?? null,
//   );
//   const [entityProfile, setEntityProfile] = useState<EntityProfile | null>(
//     initialData.entityProfile ?? null,
//   );

//   const addressProfiles = buildCheckoutProfileAddressBook(
//     personProfile,
//     entityProfile,
//   );

//   const [deliveryOption, setDeliveryOption] =
//     useState<DeliveryOption>("standard");

//   const [paymentMethod, setPaymentMethod] =
//     useState<PaymentMethod>("card");

//   const [appliedVouchers, setAppliedVouchers] = useState<CheckoutVoucher[]>([]);

//   /* ===================== SUMMARY ===================== */

//   const subtotal = checkoutItems.reduce((sum, item) => {
//     const line =
//       typeof item.lineTotal === "number"
//         ? item.lineTotal
//         : item.price * item.quantity;
//     return sum + line;
//   }, 0);

//   const shippingFee = deliveryOption === "standard" ? 0 : 65;

//   const voucherDiscount = appliedVouchers.reduce(
//     (sum, voucher) => sum + voucher.discount,
//     0,
//   );

//   const total = subtotal + shippingFee - voucherDiscount;

//   /* ===================== POPUP ===================== */

//   const [paymentPopupOpen, setPaymentPopupOpen] = useState(false);
//   const [iframeUrl, setIframeUrl] = useState("");

//   /* ===================== ACTION ===================== */

//   /** ✅ payment flow เดิม (ไม่แตะ) */
//   const handlePlaceOrder = () => {
//     if (paymentMethod === "qr") {
//       setIframeUrl("http://localhost:8081//kbankqr/step1.php");
//     } else {
//       setIframeUrl("http://localhost:8081//kbackcard/step1.php?mode=debug");
//     }
//     setPaymentPopupOpen(true);
//   };

//   /**
//    * ✅ คลิก “รายการที่กรอบแดง” → ลบจาก cart แบบเดียวกับตะกร้า (status=3)
//    * แล้วพาไปหน้า product เพื่อเลือกจำนวนใหม่
//    */
//   const handleFixInsufficientItem = async (item: CheckoutItem) => {
//     const cartRowId = Number(item.cartId ?? item.id);
//     const productId = item.productId;

//     // optimistic: เอาออกจากรายการหน้า checkout ก่อน
//     setCheckoutItems((prev) => prev.filter((x) => x.id !== item.id));

//     // ลบแบบเดียวกับตะกร้า (POST /api/cart/remove)
//     try {
//       await fetch("/api/cart/remove", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id: cartRowId }),
//       });
//     } catch (e) {
//       console.error("[CHECKOUT][REMOVE][ERROR]", e);
//       // ไม่บล็อก user — ยังพาไปแก้ที่หน้าสินค้าได้
//     }

//     // ไปหน้า product เพื่อเลือกจำนวนใหม่
//     if (productId) {
//       // router.push(`/product/${productId}`);
//       router.push(`/product/${productId}?returnTo=${encodeURIComponent("/checkout")}`);
//       return;
//     }

//     // fallback: ถ้า productId ไม่มี (ไม่ควรเกิด)
//     if (item.sku) {
//       router.push(`/products?sku=${encodeURIComponent(item.sku)}`);
//       return;
//     }

//     router.push("/products");
//   };

//   /* ===================== RENDER ===================== */

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Link href="/cart">
//             <Button variant="ghost" size="icon">
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//           </Link>
//           <h1 className="text-2xl font-bold">ชำระเงิน</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ซ้าย */}
//           <div className="lg:col-span-2 space-y-6">
//             <CheckoutAddressSection
//               shippingAddress={shippingAddress}
//               billingAddress={billingAddress}
//               profileInfo={profileInfo}
//               onChangeShippingAddress={setShippingAddress}
//               onChangeBillingAddress={setBillingAddress}
//               onChangeProfileInfo={setProfileInfo}
//               addressProfiles={addressProfiles}
//               personProfile={personProfile}
//               entityProfile={entityProfile}
//               onProfileSaved={(updated) => {
//                 if (updated.person !== undefined) {
//                   setPersonProfile(updated.person ?? null);
//                 }
//                 if (updated.entity !== undefined) {
//                   setEntityProfile(updated.entity ?? null);
//                 }
//               }}
//             />

//             <CheckoutPackagesSection
//               checkoutItems={checkoutItems}
//               deliveryOption={deliveryOption}
//               insufficientSkus={insufficientSkus}
//               onFixInsufficientItem={handleFixInsufficientItem}
//               onChangeDeliveryOption={setDeliveryOption}
//               onRemoveItem={(id) =>
//                 setCheckoutItems((items) =>
//                   items.filter((item) => item.id !== id),
//                 )
//               }
//             />
//           </div>

//           {/* ขวา */}
//           <div className="space-y-6">
//             <CheckoutPaymentSection
//               paymentMethod={paymentMethod}
//               onChangePaymentMethod={setPaymentMethod}
//             />

//             <CheckoutSummarySection
//               itemCount={checkoutItems.length}
//               subtotal={subtotal}
//               shippingFee={shippingFee}
//               voucherDiscount={voucherDiscount}
//               total={total}
//               onPlaceOrder={handlePlaceOrder}
//               items={checkoutItems}
//               setInsufficientSkus={setInsufficientSkus}
//             />
//           </div>
//         </div>
//       </div>

//       <PaymentPopup
//         open={paymentPopupOpen}
//         onClose={() => setPaymentPopupOpen(false)}
//         iframeUrl={iframeUrl}
//         title={paymentMethod === "qr" ? "ชำระเงิน QR Code" : "ชำระเงินด้วยบัตร"}
//       />
//     </div>
//   );
// }

// v.1.1.14 ===============================================================

// v.1.1.13 ==============================================================
// // src/app/checkout/CheckoutClient.tsx
// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { ArrowLeft } from "lucide-react";

// import { Button } from "@/components/ui/button";

// import CheckoutAddressSection from "./component/CheckoutAddressSection";
// import CheckoutPackagesSection from "./component/CheckoutPackagesSection";
// import CheckoutPaymentSection from "./component/CheckoutPaymentSection";
// import CheckoutSummarySection from "./component/CheckoutSummarySection";
// import PaymentPopup from "./component/PaymentPopup";

// import type {
//   CheckoutData,
//   CheckoutItem,
//   DeliveryOption,
//   PaymentMethod,
//   CheckoutVoucher,
//   CheckoutAddress,
//   CheckoutProfileInfo,
// } from "@/types/checkout";
// import { buildCheckoutProfileAddressBook } from "@/types/checkout";
// import type { PersonProfile, EntityProfile } from "@/types/profile";

// type Props = {
//   initialData: CheckoutData;
// };

// export default function CheckoutClient({ initialData }: Props) {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   /* ===================== STATE ===================== */

//   const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(
//     initialData.items ?? [],
//   );

//   /** ✅ เก็บ SKU ที่สต๊อกไม่พอ */
//   const [insufficientSkus, setInsufficientSkus] = useState<string[]>([]);

//   const [shippingAddress, setShippingAddress] =
//     useState<CheckoutAddress | null>(initialData.shippingAddress ?? null);

//   const [billingAddress, setBillingAddress] =
//     useState<CheckoutAddress | null>(initialData.billingAddress ?? null);

//   const [profileInfo, setProfileInfo] =
//     useState<CheckoutProfileInfo | undefined>(initialData.profileInfo);

//   const [personProfile, setPersonProfile] = useState<PersonProfile | null>(
//     initialData.personProfile ?? null,
//   );
//   const [entityProfile, setEntityProfile] = useState<EntityProfile | null>(
//     initialData.entityProfile ?? null,
//   );

//   const addressProfiles = buildCheckoutProfileAddressBook(
//     personProfile,
//     entityProfile,
//   );

//   const [deliveryOption, setDeliveryOption] =
//     useState<DeliveryOption>("standard");

//   const [paymentMethod, setPaymentMethod] =
//     useState<PaymentMethod>("card");

//   const [appliedVouchers, setAppliedVouchers] = useState<CheckoutVoucher[]>([]);

//   /* ===================== SUMMARY ===================== */

//   const subtotal = checkoutItems.reduce((sum, item) => {
//     const line =
//       typeof item.lineTotal === "number"
//         ? item.lineTotal
//         : item.price * item.quantity;
//     return sum + line;
//   }, 0);

//   const shippingFee = deliveryOption === "standard" ? 0 : 65;

//   const voucherDiscount = appliedVouchers.reduce(
//     (sum, voucher) => sum + voucher.discount,
//     0,
//   );

//   const total = subtotal + shippingFee - voucherDiscount;

//   /* ===================== POPUP ===================== */

//   const [paymentPopupOpen, setPaymentPopupOpen] = useState(false);
//   const [iframeUrl, setIframeUrl] = useState("");

//   /* ===================== ACTION ===================== */

//   const handlePlaceOrder = () => {
//     if (paymentMethod === "qr") {
//       setIframeUrl("http://localhost:8081//kbankqr/step1.php");
//     } else {
//       setIframeUrl(
//         "http://localhost:8081//kbackcard/step1.php?mode=debug",
//       );
//     }
//     setPaymentPopupOpen(true);
//   };

//   /* ===================== RENDER ===================== */

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Link href="/cart">
//             <Button variant="ghost" size="icon">
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//           </Link>
//           <h1 className="text-2xl font-bold">ชำระเงิน</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ซ้าย */}
//           <div className="lg:col-span-2 space-y-6">
//             <CheckoutAddressSection
//               shippingAddress={shippingAddress}
//               billingAddress={billingAddress}
//               profileInfo={profileInfo}
//               onChangeShippingAddress={setShippingAddress}
//               onChangeBillingAddress={setBillingAddress}
//               onChangeProfileInfo={setProfileInfo}
//               addressProfiles={addressProfiles}
//               personProfile={personProfile}
//               entityProfile={entityProfile}
//               onProfileSaved={(updated) => {
//                 if (updated.person !== undefined) {
//                   setPersonProfile(updated.person ?? null);
//                 }
//                 if (updated.entity !== undefined) {
//                   setEntityProfile(updated.entity ?? null);
//                 }
//               }}
//             />

//             <CheckoutPackagesSection
//               checkoutItems={checkoutItems}
//               deliveryOption={deliveryOption}
//               insufficientSkus={insufficientSkus}   
//               onChangeDeliveryOption={setDeliveryOption}
//               onRemoveItem={(id) =>
//                 setCheckoutItems((items) =>
//                   items.filter((item) => item.id !== id),
//                 )
//               }
//             />
//           </div>

//           {/* ขวา */}
//           <div className="space-y-6">
//             <CheckoutPaymentSection
//               paymentMethod={paymentMethod}
//               onChangePaymentMethod={setPaymentMethod}
//             />

//             <CheckoutSummarySection
//               itemCount={checkoutItems.length}
//               subtotal={subtotal}
//               shippingFee={shippingFee}
//               voucherDiscount={voucherDiscount}
//               total={total}
//               onPlaceOrder={handlePlaceOrder}
//               items={checkoutItems}                 
//               setInsufficientSkus={setInsufficientSkus} 
//             />
//           </div>
//         </div>
//       </div>

//       <PaymentPopup
//         open={paymentPopupOpen}
//         onClose={() => setPaymentPopupOpen(false)}
//         iframeUrl={iframeUrl}
//         title={paymentMethod === "qr" ? "ชำระเงิน QR Code" : "ชำระเงินด้วยบัตร"}
//       />
//     </div>
//   );
// }

// v.1.1.13 ==============================================================

// v.1.1.12 ==============================================================
// // src/app/checkout/CheckoutClient.tsx
// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { ArrowLeft } from "lucide-react";

// import { Button } from "@/components/ui/button";

// import CheckoutAddressSection from "./component/CheckoutAddressSection";
// import CheckoutPackagesSection from "./component/CheckoutPackagesSection";
// import CheckoutPaymentSection from "./component/CheckoutPaymentSection";
// import CheckoutSummarySection from "./component/CheckoutSummarySection";
// import PaymentPopup from "./component/PaymentPopup";

// import type {
//   CheckoutData,
//   CheckoutItem,
//   DeliveryOption,
//   PaymentMethod,
//   CheckoutVoucher,
//   CheckoutAddress,
//   CheckoutProfileInfo,
// } from "@/types/checkout";
// import { buildCheckoutProfileAddressBook } from "@/types/checkout";
// import type { PersonProfile, EntityProfile } from "@/types/profile";

// type Props = {
//   initialData: CheckoutData;
// };

// export default function CheckoutClient({ initialData }: Props) {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   /* ===================== STATE ===================== */

//   const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(
//     initialData.items ?? [],
//   );

//   const [shippingAddress, setShippingAddress] =
//     useState<CheckoutAddress | null>(initialData.shippingAddress ?? null);

//   const [billingAddress, setBillingAddress] =
//     useState<CheckoutAddress | null>(initialData.billingAddress ?? null);

//   const [profileInfo, setProfileInfo] =
//     useState<CheckoutProfileInfo | undefined>(initialData.profileInfo);

//   const [personProfile, setPersonProfile] = useState<PersonProfile | null>(
//     initialData.personProfile ?? null,
//   );
//   const [entityProfile, setEntityProfile] = useState<EntityProfile | null>(
//     initialData.entityProfile ?? null,
//   );

//   const addressProfiles = buildCheckoutProfileAddressBook(
//     personProfile,
//     entityProfile,
//   );

//   const [deliveryOption, setDeliveryOption] =
//     useState<DeliveryOption>("standard");

//   const [paymentMethod, setPaymentMethod] =
//     useState<PaymentMethod>("card");

//   const [appliedVouchers, setAppliedVouchers] = useState<CheckoutVoucher[]>([]);

//   /* ===================== SUMMARY ===================== */

//   const subtotal = checkoutItems.reduce((sum, item) => {
//     const line =
//       typeof item.lineTotal === "number"
//         ? item.lineTotal
//         : item.price * item.quantity;
//     return sum + line;
//   }, 0);

//   const shippingFee = deliveryOption === "standard" ? 0 : 65;

//   const voucherDiscount = appliedVouchers.reduce(
//     (sum, voucher) => sum + voucher.discount,
//     0,
//   );

//   const total = subtotal + shippingFee - voucherDiscount;

//   /* ===================== POPUP ===================== */

//   const [paymentPopupOpen, setPaymentPopupOpen] = useState(false);
//   const [iframeUrl, setIframeUrl] = useState("");

//   /* ===================== ACTION ===================== */

//   const handlePlaceOrder = () => {
//     if (paymentMethod === "qr") {
//       setIframeUrl("http://localhost:8081//kbankqr/step1.php");
//     } else {
//       setIframeUrl(
//         "http://localhost:8081//kbackcard/step1.php?mode=debug",
//       );
//     }
//     setPaymentPopupOpen(true);
//   };

//   /* ===================== RENDER ===================== */

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Link href="/cart">
//             <Button variant="ghost" size="icon">
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//           </Link>
//           <h1 className="text-2xl font-bold">ชำระเงิน</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ซ้าย */}
//           <div className="lg:col-span-2 space-y-6">
//             <CheckoutAddressSection
//               shippingAddress={shippingAddress}
//               billingAddress={billingAddress}
//               profileInfo={profileInfo}
//               onChangeShippingAddress={setShippingAddress}
//               onChangeBillingAddress={setBillingAddress}
//               onChangeProfileInfo={setProfileInfo}
//               addressProfiles={addressProfiles}
//               personProfile={personProfile}
//               entityProfile={entityProfile}
//               onProfileSaved={(updated) => {
//                 if (updated.person !== undefined) {
//                   setPersonProfile(updated.person ?? null);
//                 }
//                 if (updated.entity !== undefined) {
//                   setEntityProfile(updated.entity ?? null);
//                 }
//               }}
//             />

//             <CheckoutPackagesSection
//               checkoutItems={checkoutItems}
//               deliveryOption={deliveryOption}
//               onChangeDeliveryOption={setDeliveryOption}
//               onRemoveItem={(id) =>
//                 setCheckoutItems((items) =>
//                   items.filter((item) => item.id !== id),
//                 )
//               }
//             />
//           </div>

//           {/* ขวา */}
//           <div className="space-y-6">
//             <CheckoutPaymentSection
//               paymentMethod={paymentMethod}
//               onChangePaymentMethod={setPaymentMethod}
//             />

//             <CheckoutSummarySection
//               itemCount={checkoutItems.length}
//               subtotal={subtotal}
//               shippingFee={shippingFee}
//               voucherDiscount={voucherDiscount}
//               total={total}
//               onPlaceOrder={handlePlaceOrder}
//               items={checkoutItems} //เพิ่มใหม่
//             />
//           </div>
//         </div>
//       </div>

//       <PaymentPopup
//         open={paymentPopupOpen}
//         onClose={() => setPaymentPopupOpen(false)}
//         iframeUrl={iframeUrl}
//         title={paymentMethod === "qr" ? "ชำระเงิน QR Code" : "ชำระเงินด้วยบัตร"}
//       />
//     </div>
//   );
// }

// v.1.1.12 ==============================================================

// v.1.1.11 ==============================================================
// // src/app/checkout/CheckoutClient.tsx
// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { ArrowLeft } from "lucide-react";

// import { Button } from "@/components/ui/button";

// import CheckoutAddressSection from "./component/CheckoutAddressSection";
// import CheckoutPackagesSection from "./component/CheckoutPackagesSection";
// import CheckoutPaymentSection from "./component/CheckoutPaymentSection";
// import CheckoutSummarySection from "./component/CheckoutSummarySection";
// import PaymentPopup from "./component/PaymentPopup";

// import type {
//   CheckoutData,
//   CheckoutItem,
//   DeliveryOption,
//   PaymentMethod,
//   CheckoutVoucher,
//   CheckoutAddress,
//   CheckoutProfileInfo,
// } from "@/types/checkout";
// import { buildCheckoutProfileAddressBook } from "@/types/checkout";
// import type { PersonProfile, EntityProfile } from "@/types/profile";

// type Props = {
//   initialData: CheckoutData;
// };

// export default function CheckoutClient({ initialData }: Props) {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   /* ===================== STATE ===================== */

//   const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(
//     initialData.items ?? [],
//   );

//   const [shippingAddress, setShippingAddress] =
//     useState<CheckoutAddress | null>(initialData.shippingAddress ?? null);

//   const [billingAddress, setBillingAddress] =
//     useState<CheckoutAddress | null>(initialData.billingAddress ?? null);

//   const [profileInfo, setProfileInfo] =
//     useState<CheckoutProfileInfo | undefined>(initialData.profileInfo);

//   const [personProfile, setPersonProfile] = useState<PersonProfile | null>(
//     initialData.personProfile ?? null,
//   );
//   const [entityProfile, setEntityProfile] = useState<EntityProfile | null>(
//     initialData.entityProfile ?? null,
//   );

//   const addressProfiles = buildCheckoutProfileAddressBook(
//     personProfile,
//     entityProfile,
//   );

//   const [deliveryOption, setDeliveryOption] =
//     useState<DeliveryOption>("standard");

//   const [paymentMethod, setPaymentMethod] =
//     useState<PaymentMethod>("card");

//   const [appliedVouchers, setAppliedVouchers] = useState<CheckoutVoucher[]>([]);

//   /* ===================== SUMMARY ===================== */

//   const subtotal = checkoutItems.reduce((sum, item) => {
//     const line =
//       typeof item.lineTotal === "number"
//         ? item.lineTotal
//         : item.price * item.quantity;
//     return sum + line;
//   }, 0);

//   const shippingFee = deliveryOption === "standard" ? 0 : 65;

//   const voucherDiscount = appliedVouchers.reduce(
//     (sum, voucher) => sum + voucher.discount,
//     0,
//   );

//   const total = subtotal + shippingFee - voucherDiscount;

//   /* ===================== POPUP ===================== */

//   const [paymentPopupOpen, setPaymentPopupOpen] = useState(false);

//   const iframeUrl =
//     "https://shop.interlink.co.th/kbackcard/step1.php?mode=debug";

//   /* ===================== ACTION ===================== */

//   const handlePlaceOrder = () => {
//     // ตอนนี้ใช้แค่เปิด popup เพื่อเทส PHP PayNow
//     setPaymentPopupOpen(true);
//   };

//   /* ===================== RENDER ===================== */

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Link href="/cart">
//             <Button variant="ghost" size="icon">
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//           </Link>
//           <h1 className="text-2xl font-bold">ชำระเงิน</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ซ้าย */}
//           <div className="lg:col-span-2 space-y-6">
//             <CheckoutAddressSection
//               shippingAddress={shippingAddress}
//               billingAddress={billingAddress}
//               profileInfo={profileInfo}
//               onChangeShippingAddress={setShippingAddress}
//               onChangeBillingAddress={setBillingAddress}
//               onChangeProfileInfo={setProfileInfo}
//               addressProfiles={addressProfiles}
//               personProfile={personProfile}
//               entityProfile={entityProfile}
//               onProfileSaved={(updated) => {
//                 if (updated.person !== undefined) {
//                   setPersonProfile(updated.person ?? null);
//                 }
//                 if (updated.entity !== undefined) {
//                   setEntityProfile(updated.entity ?? null);
//                 }
//               }}
//             />

//             <CheckoutPackagesSection
//               checkoutItems={checkoutItems}
//               deliveryOption={deliveryOption}
//               onChangeDeliveryOption={setDeliveryOption}
//               onRemoveItem={(id) =>
//                 setCheckoutItems((items) =>
//                   items.filter((item) => item.id !== id),
//                 )
//               }
//             />
//           </div>

//           {/* ขวา */}
//           <div className="space-y-6">
//             <CheckoutPaymentSection
//               paymentMethod={paymentMethod}
//               onChangePaymentMethod={setPaymentMethod}
//             />

//             <CheckoutSummarySection
//               itemCount={checkoutItems.length}
//               subtotal={subtotal}
//               shippingFee={shippingFee}
//               voucherDiscount={voucherDiscount}
//               total={total}
//               onPlaceOrder={handlePlaceOrder}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Popup PayNow */}
//       <PaymentPopup
//         open={paymentPopupOpen}
//         onClose={() => setPaymentPopupOpen(false)}
//         iframeUrl={iframeUrl}
//       />
//     </div>
//   );
// }

// v.1.1.11 ==============================================================

// v.1.1.10 ==============================================================
// // src/app/checkout/CheckoutClient.tsx

// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { ArrowLeft } from "lucide-react";

// import { Button } from "@/components/ui/button";

// import CheckoutAddressSection from "./component/CheckoutAddressSection";
// import CheckoutPackagesSection from "./component/CheckoutPackagesSection";
// import CheckoutPaymentSection from "./component/CheckoutPaymentSection";
// import CheckoutSummarySection from "./component/CheckoutSummarySection";

// import type {
//   CheckoutData,
//   CheckoutItem,
//   DeliveryOption,
//   PaymentMethod,
//   CheckoutVoucher,
//   CheckoutAddress,
//   CheckoutProfileInfo,
// } from "@/types/checkout";
// import { buildCheckoutProfileAddressBook } from "@/types/checkout";
// import type { PersonProfile, EntityProfile } from "@/types/profile";

// type Props = {
//   initialData: CheckoutData;
// };

// export default function CheckoutClient({ initialData }: Props) {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   /* ======================================================
//    *  STATE หลัก
//    * ====================================================== */

//   const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(
//     initialData.items ?? [],
//   );

//   const [shippingAddress, setShippingAddress] =
//     useState<CheckoutAddress | null>(initialData.shippingAddress ?? null);

//   const [billingAddress, setBillingAddress] =
//     useState<CheckoutAddress | null>(initialData.billingAddress ?? null);

//   const [profileInfo, setProfileInfo] =
//     useState<CheckoutProfileInfo | undefined>(initialData.profileInfo);

//   // โปรไฟล์ดิบจาก backend เอาไว้ใช้กับฟอร์มแก้ไข
//   const [personProfile, setPersonProfile] = useState<PersonProfile | null>(
//     initialData.personProfile ?? null,
//   );
//   const [entityProfile, setEntityProfile] = useState<EntityProfile | null>(
//     initialData.entityProfile ?? null,
//   );

//   // สร้างสมุด 2 การ์ดจากโปรไฟล์ปัจจุบัน
//   const addressProfiles = buildCheckoutProfileAddressBook(
//     personProfile,
//     entityProfile,
//   );

//   const [deliveryOption, setDeliveryOption] =
//     useState<DeliveryOption>("standard");

//   const [paymentMethod, setPaymentMethod] =
//     useState<PaymentMethod>("card");

//   const [voucherCode, setVoucherCode] = useState("");
//   const [appliedVouchers, setAppliedVouchers] = useState<CheckoutVoucher[]>([]);
//   const [voucherError, setVoucherError] = useState("");

//   /* ======================================================
//    *  SUMMARY
//    * ====================================================== */

//   const subtotal = checkoutItems.reduce((sum, item) => {
//     const line =
//       typeof item.lineTotal === "number"
//         ? item.lineTotal
//         : item.price * item.quantity;
//     return sum + line;
//   }, 0);

//   const shippingFee = deliveryOption === "standard" ? 0 : 65;

//   const voucherDiscount = appliedVouchers.reduce(
//     (sum, voucher) => sum + voucher.discount,
//     0,
//   );

//   const total = subtotal + shippingFee - voucherDiscount;

//   /* ======================================================
//    *  LOGIC VOUCHER
//    * ====================================================== */

//   const handleApplyVoucher = () => {
//     if (!voucherCode.trim()) return;

//     setVoucherError("");

//     const mockVouchers: Record<string, CheckoutVoucher> = {
//       SAVE100: { code: "SAVE100", discount: 100 },
//       DISCOUNT50: { code: "DISCOUNT50", discount: 50 },
//       FREESHIP: { code: "FREESHIP", discount: 65 },
//       VC0001: { code: "VC0001", discount: 100 },
//       VC0002: { code: "VC0002", discount: 200 },
//     };

//     const key = voucherCode.toUpperCase();
//     const voucher = mockVouchers[key];

//     if (!voucher) {
//       setVoucherError("โค้ดส่วนลดไม่ถูกต้อง");
//       return;
//     }

//     const isAlreadyApplied = appliedVouchers.some(
//       (v) => v.code === voucher.code,
//     );
//     if (isAlreadyApplied) {
//       setVoucherError("โค้ดนี้ถูกใช้แล้ว");
//       return;
//     }

//     setAppliedVouchers((prev) => [...prev, voucher]);
//     setVoucherCode("");
//   };

//   const handleRemoveVoucher = (codeToRemove: string) => {
//     setAppliedVouchers((prev) =>
//       prev.filter((v) => v.code !== codeToRemove),
//     );
//   };

//   /* ======================================================
//    *  REMOVE ITEM
//    * ====================================================== */

//   const handleRemoveItem = (itemId: number) => {
//     setCheckoutItems((items) => items.filter((item) => item.id !== itemId));
//   };

//   /* ======================================================
//    *  PLACE ORDER (เหมือน makeBuy ของ Laravel)
//    * ====================================================== */

//   const handlePlaceOrder = () => {
//     (async () => {
//       try {
//         // payload ส่งไป backend
//         const payload = {
//           paymentMethod,
//           shippingAddressId: shippingAddress?.id ?? null,
//           billingAddressId: billingAddress?.id ?? null,
//           profileMode: profileInfo?.mode ?? null,
//         };

//         const res = await fetch("/api/checkout/place-order", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         });

//         if (!res.ok) {
//           console.error("[checkout] place-order HTTP error", res.status);
//           alert("ไม่สามารถเริ่มคำสั่งซื้อได้ (HTTP " + res.status + ")");
//           return;
//         }

//         const data = await res.json();

//         if (!data.ok) {
//           console.error("[checkout] place-order error body =", data);
//           alert("ไม่สามารถเริ่มคำสั่งซื้อได้: " + (data.error ?? "unknown"));
//           return;
//         }

//         // ใช้ข้อมูลจาก backend (amount, refInv, orderId) + state ปัจจุบัน
//         const paymentData = {
//           amount: data.amount,
//           refInv: data.refInv,
//           orderId: data.orderId,
//           paymentMethod: data.paymentMethod as PaymentMethod,

//           items: checkoutItems,
//           subtotal,
//           shippingFee,
//           shippingDiscount: 65, // ยัง mock เหมือนเดิม
//           voucherDiscount,
//           appliedVouchers,

//           shippingAddress,
//           billingAddress,
//           profileInfo,
//         };

//         if (typeof window !== "undefined") {
//           sessionStorage.setItem("paymentData", JSON.stringify(paymentData));
//         }

//         const refInvParam = encodeURIComponent(data.refInv ?? "");
//         const orderIdParam = encodeURIComponent(data.orderId ?? "");

//         if (paymentMethod === "card") {
//           // เทียบกับ view('pay.makebuy_card', ...)
//           router.push(
//             `/payment/card?ref_inv=${refInvParam}&order_id=${orderIdParam}`,
//           );
//         } else if (paymentMethod === "qr") {
//           // เทียบกับ view('pay.makebuy_qr', ...)
//           router.push(
//             `/payment/qr?ref_inv=${refInvParam}&order_id=${orderIdParam}`,
//           );
//         } else {
//           // fallback
//           router.push(
//             `/payment/card?ref_inv=${refInvParam}&order_id=${orderIdParam}`,
//           );
//         }
//       } catch (err: any) {
//         console.error("[checkout] place-order exception =", err);
//         alert("เกิดข้อผิดพลาดขณะเริ่มคำสั่งซื้อ");
//       }
//     })();
//   };

//   /* ======================================================
//    *  RENDER
//    * ====================================================== */

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Link href="/cart">
//             <Button variant="ghost" size="icon">
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//           </Link>
//           <h1 className="text-2xl font-bold">ชำระเงิน</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ซ้าย */}
//           <div className="lg:col-span-2 space-y-6">
//             <CheckoutAddressSection
//               shippingAddress={shippingAddress}
//               billingAddress={billingAddress}
//               profileInfo={profileInfo}
//               onChangeShippingAddress={setShippingAddress}
//               onChangeBillingAddress={setBillingAddress}
//               onChangeProfileInfo={setProfileInfo}
//               // สมุด 2 การ์ดที่คำนวนจากโปรไฟล์ปัจจุบัน
//               addressProfiles={addressProfiles}
//               // โปรไฟล์ดิบสำหรับใช้ prefill ฟอร์ม
//               personProfile={personProfile}
//               entityProfile={entityProfile}
//               // หลังบันทึกจาก dialog แล้ว อัปเดต state โปรไฟล์
//               onProfileSaved={(updated) => {
//                 if (updated.person !== undefined) {
//                   setPersonProfile(updated.person ?? null);
//                 }
//                 if (updated.entity !== undefined) {
//                   setEntityProfile(updated.entity ?? null);
//                 }
//               }}
//             />

//             <CheckoutPackagesSection
//               checkoutItems={checkoutItems}
//               deliveryOption={deliveryOption}
//               onChangeDeliveryOption={setDeliveryOption}
//               onRemoveItem={handleRemoveItem}
//             />
//           </div>

//           {/* ขวา */}
//           <div className="space-y-6">
//             <CheckoutPaymentSection
//               paymentMethod={paymentMethod}
//               onChangePaymentMethod={setPaymentMethod}
//             />

//             <CheckoutSummarySection
//               itemCount={checkoutItems.length}
//               subtotal={subtotal}
//               shippingFee={shippingFee}
//               voucherDiscount={voucherDiscount}
//               total={total}
//               onPlaceOrder={handlePlaceOrder}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.10 ==============================================================

// v.1.1.9 ===============================================================
// // src/app/checkout/CheckoutClient.tsx

// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { ArrowLeft } from "lucide-react";

// import { Button } from "@/components/ui/button";

// import CheckoutAddressSection from "./component/CheckoutAddressSection";
// import CheckoutPackagesSection from "./component/CheckoutPackagesSection";
// import CheckoutPaymentSection from "./component/CheckoutPaymentSection";
// import CheckoutSummarySection from "./component/CheckoutSummarySection";

// import type {
//   CheckoutData,
//   CheckoutItem,
//   DeliveryOption,
//   PaymentMethod,
//   CheckoutVoucher,
//   CheckoutAddress,
//   CheckoutProfileInfo,
// } from "@/types/checkout";
// import { buildCheckoutProfileAddressBook } from "@/types/checkout";
// import type { PersonProfile, EntityProfile } from "@/types/profile";

// type Props = {
//   initialData: CheckoutData;
// };

// export default function CheckoutClient({ initialData }: Props) {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   /* ======================================================
//    *  STATE หลัก
//    * ====================================================== */

//   const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(
//     initialData.items ?? [],
//   );

//   const [shippingAddress, setShippingAddress] =
//     useState<CheckoutAddress | null>(initialData.shippingAddress ?? null);

//   const [billingAddress, setBillingAddress] =
//     useState<CheckoutAddress | null>(initialData.billingAddress ?? null);

//   const [profileInfo, setProfileInfo] =
//     useState<CheckoutProfileInfo | undefined>(initialData.profileInfo);

//   // โปรไฟล์ดิบจาก backend เอาไว้ใช้กับฟอร์มแก้ไข
//   const [personProfile, setPersonProfile] = useState<PersonProfile | null>(
//     initialData.personProfile ?? null,
//   );
//   const [entityProfile, setEntityProfile] = useState<EntityProfile | null>(
//     initialData.entityProfile ?? null,
//   );

//   // สร้างสมุด 2 การ์ดจากโปรไฟล์ปัจจุบัน
//   const addressProfiles = buildCheckoutProfileAddressBook(
//     personProfile,
//     entityProfile,
//   );

//   const [deliveryOption, setDeliveryOption] =
//     useState<DeliveryOption>("standard");

//   const [paymentMethod, setPaymentMethod] =
//     useState<PaymentMethod>("card");

//   const [voucherCode, setVoucherCode] = useState("");
//   const [appliedVouchers, setAppliedVouchers] = useState<CheckoutVoucher[]>([]);
//   const [voucherError, setVoucherError] = useState("");

//   /* ======================================================
//    *  SUMMARY
//    * ====================================================== */

//   const subtotal = checkoutItems.reduce((sum, item) => {
//     const line =
//       typeof item.lineTotal === "number"
//         ? item.lineTotal
//         : item.price * item.quantity;
//     return sum + line;
//   }, 0);

//   const shippingFee = deliveryOption === "standard" ? 0 : 65;

//   const voucherDiscount = appliedVouchers.reduce(
//     (sum, voucher) => sum + voucher.discount,
//     0,
//   );

//   const total = subtotal + shippingFee - voucherDiscount;

//   /* ======================================================
//    *  LOGIC VOUCHER
//    * ====================================================== */

//   const handleApplyVoucher = () => {
//     if (!voucherCode.trim()) return;

//     setVoucherError("");

//     const mockVouchers: Record<string, CheckoutVoucher> = {
//       SAVE100: { code: "SAVE100", discount: 100 },
//       DISCOUNT50: { code: "DISCOUNT50", discount: 50 },
//       FREESHIP: { code: "FREESHIP", discount: 65 },
//       VC0001: { code: "VC0001", discount: 100 },
//       VC0002: { code: "VC0002", discount: 200 },
//     };

//     const key = voucherCode.toUpperCase();
//     const voucher = mockVouchers[key];

//     if (!voucher) {
//       setVoucherError("โค้ดส่วนลดไม่ถูกต้อง");
//       return;
//     }

//     const isAlreadyApplied = appliedVouchers.some(
//       (v) => v.code === voucher.code,
//     );
//     if (isAlreadyApplied) {
//       setVoucherError("โค้ดนี้ถูกใช้แล้ว");
//       return;
//     }

//     setAppliedVouchers((prev) => [...prev, voucher]);
//     setVoucherCode("");
//   };

//   const handleRemoveVoucher = (codeToRemove: string) => {
//     setAppliedVouchers((prev) =>
//       prev.filter((v) => v.code !== codeToRemove),
//     );
//   };

//   /* ======================================================
//    *  REMOVE ITEM
//    * ====================================================== */

//   const handleRemoveItem = (itemId: number) => {
//     setCheckoutItems((items) => items.filter((item) => item.id !== itemId));
//   };

//   /* ======================================================
//    *  PLACE ORDER
//    * ====================================================== */

//   const handlePlaceOrder = () => {
//     const paymentData = {
//       amount: total,
//       orderId: `ORDER-${Date.now()}`,
//       items: checkoutItems,
//       subtotal,
//       shippingFee,
//       shippingDiscount: 65,
//       voucherDiscount,
//       appliedVouchers,
//     };

//     if (typeof window !== "undefined") {
//       sessionStorage.setItem("paymentData", JSON.stringify(paymentData));
//     }

//     if (paymentMethod === "card") {
//       router.push("/payment/card");
//     } else if (paymentMethod === "qr") {
//       router.push("/payment/qr");
//     } else {
//       router.push("/payment/card");
//     }
//   };

//   /* ======================================================
//    *  RENDER
//    * ====================================================== */

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Link href="/cart">
//             <Button variant="ghost" size="icon">
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//           </Link>
//           <h1 className="text-2xl font-bold">ชำระเงิน</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ซ้าย */}
//           <div className="lg:col-span-2 space-y-6">
//             <CheckoutAddressSection
//               shippingAddress={shippingAddress}
//               billingAddress={billingAddress}
//               profileInfo={profileInfo}
//               onChangeShippingAddress={setShippingAddress}
//               onChangeBillingAddress={setBillingAddress}
//               onChangeProfileInfo={setProfileInfo}
//               // สมุด 2 การ์ดที่คำนวนจากโปรไฟล์ปัจจุบัน
//               addressProfiles={addressProfiles}
//               // โปรไฟล์ดิบสำหรับใช้ prefill ฟอร์ม
//               personProfile={personProfile}
//               entityProfile={entityProfile}
//               // หลังบันทึกจาก dialog แล้ว อัปเดต state โปรไฟล์
//               onProfileSaved={(updated) => {
//                 if (updated.person !== undefined) {
//                   setPersonProfile(updated.person ?? null);
//                 }
//                 if (updated.entity !== undefined) {
//                   setEntityProfile(updated.entity ?? null);
//                 }
//               }}
//             />

//             <CheckoutPackagesSection
//               checkoutItems={checkoutItems}
//               deliveryOption={deliveryOption}
//               onChangeDeliveryOption={setDeliveryOption}
//               onRemoveItem={handleRemoveItem}
//             />
//           </div>

//           {/* ขวา */}
//           <div className="space-y-6">
//             <CheckoutPaymentSection
//               paymentMethod={paymentMethod}
//               onChangePaymentMethod={setPaymentMethod}
//             />

//             <CheckoutSummarySection
//               itemCount={checkoutItems.length}
//               subtotal={subtotal}
//               shippingFee={shippingFee}
//               voucherDiscount={voucherDiscount}
//               total={total}
//               onPlaceOrder={handlePlaceOrder}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.9 ===============================================================

// v.1.1.8 ===============================================================
// // src/app/checkout/CheckoutClient.tsx

// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { ArrowLeft } from "lucide-react";

// import { Button } from "@/components/ui/button";

// import CheckoutAddressSection from "./component/CheckoutAddressSection"; // <-- ใหม่
// import CheckoutPackagesSection from "./component/CheckoutPackagesSection";
// import CheckoutPaymentSection from "./component/CheckoutPaymentSection";
// import CheckoutSummarySection from "./component/CheckoutSummarySection";

// import type {
//   CheckoutData,
//   CheckoutItem,
//   DeliveryOption,
//   PaymentMethod,
//   CheckoutVoucher,
//   CheckoutAddress,
//   CheckoutProfileInfo,
// } from "@/types/checkout";

// type Props = {
//   initialData: CheckoutData;
// };

// export default function CheckoutClient({ initialData }: Props) {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   /* ======================================================
//    *  STATE หลัก
//    * ====================================================== */

//   const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(
//     initialData.items ?? [],
//   );

//   // รวม address ทั้ง shipping & billing ไว้ใน block เดียว
//   const [shippingAddress, setShippingAddress] =
//     useState<CheckoutAddress | null>(initialData.shippingAddress ?? null);

//   const [billingAddress, setBillingAddress] =
//     useState<CheckoutAddress | null>(initialData.billingAddress ?? null);

//   // โหมดโปรไฟล์ (person / entity / null)
//   const [profileInfo, setProfileInfo] =
//     useState<CheckoutProfileInfo | undefined>(initialData.profileInfo);

//   const [deliveryOption, setDeliveryOption] =
//     useState<DeliveryOption>("standard");

//   const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

//   const [voucherCode, setVoucherCode] = useState("");
//   const [appliedVouchers, setAppliedVouchers] = useState<CheckoutVoucher[]>([]);
//   const [voucherError, setVoucherError] = useState("");

//   /* ======================================================
//    *  SUMMARY
//    * ====================================================== */

//   const subtotal = checkoutItems.reduce((sum, item) => {
//     const line =
//       typeof item.lineTotal === "number"
//         ? item.lineTotal
//         : item.price * item.quantity;
//     return sum + line;
//   }, 0);

//   const shippingFee = deliveryOption === "standard" ? 0 : 65;

//   const voucherDiscount = appliedVouchers.reduce(
//     (sum, voucher) => sum + voucher.discount,
//     0,
//   );

//   const total = subtotal + shippingFee - voucherDiscount;

//   /* ======================================================
//    *  LOGIC VOUCHER
//    * ====================================================== */

//   const handleApplyVoucher = () => {
//     if (!voucherCode.trim()) return;

//     setVoucherError("");

//     const mockVouchers: Record<string, CheckoutVoucher> = {
//       SAVE100: { code: "SAVE100", discount: 100 },
//       DISCOUNT50: { code: "DISCOUNT50", discount: 50 },
//       FREESHIP: { code: "FREESHIP", discount: 65 },
//       VC0001: { code: "VC0001", discount: 100 },
//       VC0002: { code: "VC0002", discount: 200 },
//     };

//     const key = voucherCode.toUpperCase();
//     const voucher = mockVouchers[key];

//     if (!voucher) {
//       setVoucherError("โค้ดส่วนลดไม่ถูกต้อง");
//       return;
//     }

//     const isAlreadyApplied = appliedVouchers.some(
//       (v) => v.code === voucher.code,
//     );
//     if (isAlreadyApplied) {
//       setVoucherError("โค้ดนี้ถูกใช้แล้ว");
//       return;
//     }

//     setAppliedVouchers((prev) => [...prev, voucher]);
//     setVoucherCode("");
//   };

//   const handleRemoveVoucher = (codeToRemove: string) => {
//     setAppliedVouchers((prev) =>
//       prev.filter((v) => v.code !== codeToRemove),
//     );
//   };

//   /* ======================================================
//    *  REMOVE ITEM
//    * ====================================================== */

//   const handleRemoveItem = (itemId: number) => {
//     setCheckoutItems((items) => items.filter((item) => item.id !== itemId));
//   };

//   /* ======================================================
//    *  PLACE ORDER
//    * ====================================================== */

//   const handlePlaceOrder = () => {
//     const paymentData = {
//       amount: total,
//       orderId: `ORDER-${Date.now()}`,
//       items: checkoutItems,
//       subtotal,
//       shippingFee,
//       shippingDiscount: 65,
//       voucherDiscount,
//       appliedVouchers,
//     };

//     if (typeof window !== "undefined") {
//       sessionStorage.setItem("paymentData", JSON.stringify(paymentData));
//     }

//     if (paymentMethod === "card") {
//       router.push("/payment/card");
//     } else if (paymentMethod === "qr") {
//       router.push("/payment/qr");
//     } else {
//       router.push("/payment/card");
//     }
//   };

//   /* ======================================================
//    *  RENDER
//    * ====================================================== */

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Link href="/cart">
//             <Button variant="ghost" size="icon">
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//           </Link>
//           <h1 className="text-2xl font-bold">ชำระเงิน</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ซ้าย */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* 👉 บล็อกที่อยู่รวม (shipping + billing + profile mode) */}
//             <CheckoutAddressSection
//               shippingAddress={shippingAddress}
//               billingAddress={billingAddress}
//               profileInfo={profileInfo}
//               onChangeShippingAddress={setShippingAddress}
//               onChangeBillingAddress={setBillingAddress}
//               onChangeProfileInfo={setProfileInfo}
//               // 🔹 ข้อมูลสำหรับ 2 การ์ดโปรไฟล์ (บุคคลธรรมดา + นิติบุคคล)
//               addressProfiles={initialData.addressProfiles}
//               // 🔹 profile จริง เอาไปใช้ prefill ฟอร์มใน dialog
//               personProfile={initialData.personProfile ?? null}
//               entityProfile={initialData.entityProfile ?? null}
//               // 🔹 หลังบันทึกโปรไฟล์ให้ refresh หน้า checkout ใหม่
//               onProfileSaved={() => {
//                 router.refresh();
//               }}
//             />

//             <CheckoutPackagesSection
//               checkoutItems={checkoutItems}
//               deliveryOption={deliveryOption}
//               onChangeDeliveryOption={setDeliveryOption}
//               onRemoveItem={handleRemoveItem}
//             />
//           </div>

//           {/* ขวา */}
//           <div className="space-y-6">
//             <CheckoutPaymentSection
//               paymentMethod={paymentMethod}
//               onChangePaymentMethod={setPaymentMethod}
//             />

//             <CheckoutSummarySection
//               itemCount={checkoutItems.length}
//               subtotal={subtotal}
//               shippingFee={shippingFee}
//               voucherDiscount={voucherDiscount}
//               total={total}
//               onPlaceOrder={handlePlaceOrder}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.8 ===============================================================

// v.1.1.7 ===============================================================
// // src/app/checkout/CheckoutClient.tsx

// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { ArrowLeft } from "lucide-react";

// import { Button } from "@/components/ui/button";

// import CheckoutAddressSection from "./component/CheckoutAddressSection"; // <-- ใหม่
// import CheckoutPackagesSection from "./component/CheckoutPackagesSection";
// import CheckoutPaymentSection from "./component/CheckoutPaymentSection";
// import CheckoutSummarySection from "./component/CheckoutSummarySection";

// import type {
//   CheckoutData,
//   CheckoutItem,
//   DeliveryOption,
//   PaymentMethod,
//   CheckoutVoucher,
//   CheckoutAddress,
//   CheckoutProfileInfo,
// } from "@/types/checkout";

// type Props = {
//   initialData: CheckoutData;
// };

// export default function CheckoutClient({ initialData }: Props) {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   /* ======================================================
//    *  STATE หลัก
//    * ====================================================== */

//   const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(
//     initialData.items ?? [],
//   );

//   // รวม address ทั้ง shipping & billing ไว้ใน block เดียว
//   const [shippingAddress, setShippingAddress] =
//     useState<CheckoutAddress | null>(initialData.shippingAddress ?? null);

//   const [billingAddress, setBillingAddress] =
//     useState<CheckoutAddress | null>(initialData.billingAddress ?? null);

//   // โหมดโปรไฟล์ (person / entity / null)
//   const [profileInfo, setProfileInfo] =
//     useState<CheckoutProfileInfo | undefined>(initialData.profileInfo);

//   const [deliveryOption, setDeliveryOption] =
//     useState<DeliveryOption>("standard");

//   const [paymentMethod, setPaymentMethod] =
//     useState<PaymentMethod>("card");

//   const [voucherCode, setVoucherCode] = useState("");
//   const [appliedVouchers, setAppliedVouchers] = useState<CheckoutVoucher[]>([]);
//   const [voucherError, setVoucherError] = useState("");

//   /* ======================================================
//    *  SUMMARY
//    * ====================================================== */

//   const subtotal = checkoutItems.reduce((sum, item) => {
//     const line =
//       typeof item.lineTotal === "number"
//         ? item.lineTotal
//         : item.price * item.quantity;
//     return sum + line;
//   }, 0);

//   const shippingFee = deliveryOption === "standard" ? 0 : 65;

//   const voucherDiscount = appliedVouchers.reduce(
//     (sum, voucher) => sum + voucher.discount,
//     0,
//   );

//   const total = subtotal + shippingFee - voucherDiscount;

//   /* ======================================================
//    *  LOGIC VOUCHER
//    * ====================================================== */

//   const handleApplyVoucher = () => {
//     if (!voucherCode.trim()) return;

//     setVoucherError("");

//     const mockVouchers: Record<string, CheckoutVoucher> = {
//       SAVE100: { code: "SAVE100", discount: 100 },
//       DISCOUNT50: { code: "DISCOUNT50", discount: 50 },
//       FREESHIP: { code: "FREESHIP", discount: 65 },
//       VC0001: { code: "VC0001", discount: 100 },
//       VC0002: { code: "VC0002", discount: 200 },
//     };

//     const key = voucherCode.toUpperCase();
//     const voucher = mockVouchers[key];

//     if (!voucher) {
//       setVoucherError("โค้ดส่วนลดไม่ถูกต้อง");
//       return;
//     }

//     const isAlreadyApplied = appliedVouchers.some(
//       (v) => v.code === voucher.code,
//     );
//     if (isAlreadyApplied) {
//       setVoucherError("โค้ดนี้ถูกใช้แล้ว");
//       return;
//     }

//     setAppliedVouchers((prev) => [...prev, voucher]);
//     setVoucherCode("");
//   };

//   const handleRemoveVoucher = (codeToRemove: string) => {
//     setAppliedVouchers((prev) =>
//       prev.filter((v) => v.code !== codeToRemove),
//     );
//   };

//   /* ======================================================
//    *  REMOVE ITEM
//    * ====================================================== */

//   const handleRemoveItem = (itemId: number) => {
//     setCheckoutItems((items) => items.filter((item) => item.id !== itemId));
//   };

//   /* ======================================================
//    *  PLACE ORDER
//    * ====================================================== */

//   const handlePlaceOrder = () => {
//     const paymentData = {
//       amount: total,
//       orderId: `ORDER-${Date.now()}`,
//       items: checkoutItems,
//       subtotal,
//       shippingFee,
//       shippingDiscount: 65,
//       voucherDiscount,
//       appliedVouchers,
//     };

//     if (typeof window !== "undefined") {
//       sessionStorage.setItem("paymentData", JSON.stringify(paymentData));
//     }

//     if (paymentMethod === "card") {
//       router.push("/payment/card");
//     } else if (paymentMethod === "qr") {
//       router.push("/payment/qr");
//     } else {
//       router.push("/payment/card");
//     }
//   };

//   /* ======================================================
//    *  RENDER
//    * ====================================================== */

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Link href="/cart">
//             <Button variant="ghost" size="icon">
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//           </Link>
//           <h1 className="text-2xl font-bold">ชำระเงิน</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ซ้าย */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* 👉 บล็อกที่อยู่รวม (shipping + billing + profile mode) */}
//             <CheckoutAddressSection
//               shippingAddress={shippingAddress}
//               billingAddress={billingAddress}
//               profileInfo={profileInfo}
//               onChangeShippingAddress={setShippingAddress}
//               onChangeBillingAddress={setBillingAddress}
//               onChangeProfileInfo={setProfileInfo}
//               // 🔹 เพิ่มข้อมูลสำหรับ 2 การ์ดโปรไฟล์ (บุคคลธรรมดา + นิติบุคคล)
//               addressProfiles={initialData.addressProfiles}
//             />

//             <CheckoutPackagesSection
//               checkoutItems={checkoutItems}
//               deliveryOption={deliveryOption}
//               onChangeDeliveryOption={setDeliveryOption}
//               onRemoveItem={handleRemoveItem}
//             />
//           </div>

//           {/* ขวา */}
//           <div className="space-y-6">
//             <CheckoutPaymentSection
//               paymentMethod={paymentMethod}
//               onChangePaymentMethod={setPaymentMethod}
//             />

//             <CheckoutSummarySection
//               itemCount={checkoutItems.length}
//               subtotal={subtotal}
//               shippingFee={shippingFee}
//               voucherDiscount={voucherDiscount}
//               total={total}
//               onPlaceOrder={handlePlaceOrder}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.7 ===============================================================

// v.1.1.6 ===============================================================
// // src/app/checkout/CheckoutClient.tsx

// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { ArrowLeft } from "lucide-react";

// import { Button } from "@/components/ui/button";

// import CheckoutAddressSection from "./component/CheckoutAddressSection"; // <-- ใหม่
// import CheckoutPackagesSection from "./component/CheckoutPackagesSection";
// import CheckoutPaymentSection from "./component/CheckoutPaymentSection";
// import CheckoutSummarySection from "./component/CheckoutSummarySection";

// import type {
//   CheckoutData,
//   CheckoutItem,
//   DeliveryOption,
//   PaymentMethod,
//   CheckoutVoucher,
//   CheckoutAddress,
//   CheckoutProfileInfo,
// } from "@/types/checkout";

// type Props = {
//   initialData: CheckoutData;
// };

// export default function CheckoutClient({ initialData }: Props) {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   /* ======================================================
//    *  STATE หลัก
//    * ====================================================== */

//   const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(
//     initialData.items ?? [],
//   );

//   // รวม address ทั้ง shipping & billing ไว้ใน block เดียว
//   const [shippingAddress, setShippingAddress] =
//     useState<CheckoutAddress | null>(initialData.shippingAddress ?? null);

//   const [billingAddress, setBillingAddress] =
//     useState<CheckoutAddress | null>(initialData.billingAddress ?? null);

//   // โหมดโปรไฟล์ (person / entity / null)
//   const [profileInfo, setProfileInfo] =
//     useState<CheckoutProfileInfo | undefined>(initialData.profileInfo);

//   const [deliveryOption, setDeliveryOption] =
//     useState<DeliveryOption>("standard");

//   const [paymentMethod, setPaymentMethod] =
//     useState<PaymentMethod>("card");

//   const [voucherCode, setVoucherCode] = useState("");
//   const [appliedVouchers, setAppliedVouchers] = useState<CheckoutVoucher[]>([]);
//   const [voucherError, setVoucherError] = useState("");

//   /* ======================================================
//    *  SUMMARY
//    * ====================================================== */

//   const subtotal = checkoutItems.reduce((sum, item) => {
//     const line =
//       typeof item.lineTotal === "number"
//         ? item.lineTotal
//         : item.price * item.quantity;
//     return sum + line;
//   }, 0);

//   const shippingFee = deliveryOption === "standard" ? 0 : 65;

//   const voucherDiscount = appliedVouchers.reduce(
//     (sum, voucher) => sum + voucher.discount,
//     0,
//   );

//   const total = subtotal + shippingFee - voucherDiscount;

//   /* ======================================================
//    *  LOGIC VOUCHER
//    * ====================================================== */

//   const handleApplyVoucher = () => {
//     if (!voucherCode.trim()) return;

//     setVoucherError("");

//     const mockVouchers: Record<string, CheckoutVoucher> = {
//       SAVE100: { code: "SAVE100", discount: 100 },
//       DISCOUNT50: { code: "DISCOUNT50", discount: 50 },
//       FREESHIP: { code: "FREESHIP", discount: 65 },
//       VC0001: { code: "VC0001", discount: 100 },
//       VC0002: { code: "VC0002", discount: 200 },
//     };

//     const key = voucherCode.toUpperCase();
//     const voucher = mockVouchers[key];

//     if (!voucher) {
//       setVoucherError("โค้ดส่วนลดไม่ถูกต้อง");
//       return;
//     }

//     const isAlreadyApplied = appliedVouchers.some(
//       (v) => v.code === voucher.code,
//     );
//     if (isAlreadyApplied) {
//       setVoucherError("โค้ดนี้ถูกใช้แล้ว");
//       return;
//     }

//     setAppliedVouchers((prev) => [...prev, voucher]);
//     setVoucherCode("");
//   };

//   const handleRemoveVoucher = (codeToRemove: string) => {
//     setAppliedVouchers((prev) =>
//       prev.filter((v) => v.code !== codeToRemove),
//     );
//   };

//   /* ======================================================
//    *  REMOVE ITEM
//    * ====================================================== */

//   const handleRemoveItem = (itemId: number) => {
//     setCheckoutItems((items) => items.filter((item) => item.id !== itemId));
//   };

//   /* ======================================================
//    *  PLACE ORDER
//    * ====================================================== */

//   const handlePlaceOrder = () => {
//     const paymentData = {
//       amount: total,
//       orderId: `ORDER-${Date.now()}`,
//       items: checkoutItems,
//       subtotal,
//       shippingFee,
//       shippingDiscount: 65,
//       voucherDiscount,
//       appliedVouchers,
//     };

//     if (typeof window !== "undefined") {
//       sessionStorage.setItem("paymentData", JSON.stringify(paymentData));
//     }

//     if (paymentMethod === "card") {
//       router.push("/payment/card");
//     } else if (paymentMethod === "qr") {
//       router.push("/payment/qr");
//     } else {
//       router.push("/payment/card");
//     }
//   };

//   /* ======================================================
//    *  RENDER
//    * ====================================================== */

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Link href="/cart">
//             <Button variant="ghost" size="icon">
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//           </Link>
//           <h1 className="text-2xl font-bold">ชำระเงิน</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ซ้าย */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* 👉 บล็อกที่อยู่รวม (shipping + billing + profile mode) */}
//             <CheckoutAddressSection
//               shippingAddress={shippingAddress}
//               billingAddress={billingAddress}
//               profileInfo={profileInfo}
//               onChangeShippingAddress={setShippingAddress}
//               onChangeBillingAddress={setBillingAddress}
//               onChangeProfileInfo={setProfileInfo}
//             />

//             <CheckoutPackagesSection
//               checkoutItems={checkoutItems}
//               deliveryOption={deliveryOption}
//               onChangeDeliveryOption={setDeliveryOption}
//               onRemoveItem={handleRemoveItem}
//             />
//           </div>

//           {/* ขวา */}
//           <div className="space-y-6">
//             <CheckoutPaymentSection
//               paymentMethod={paymentMethod}
//               onChangePaymentMethod={setPaymentMethod}
//             />

//             <CheckoutSummarySection
//               itemCount={checkoutItems.length}
//               subtotal={subtotal}
//               shippingFee={shippingFee}
//               voucherDiscount={voucherDiscount}
//               total={total}
//               onPlaceOrder={handlePlaceOrder}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.6 ===============================================================

// v.1.1.5 ===============================================================
// // src/app/checkout/CheckoutClient.tsx

// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { ArrowLeft } from "lucide-react";

// import { Button } from "@/components/ui/button";

// import CheckoutShippingAddressSection from "./component/CheckoutShippingAddressSection";
// import CheckoutBillingAddressSection from "./component/CheckoutBillingAddressSection";
// import CheckoutPackagesSection from "./component/CheckoutPackagesSection";
// import CheckoutPaymentSection from "./component/CheckoutPaymentSection";
// // import CheckoutVoucherSection from "./component/CheckoutVoucherSection";
// // import CheckoutInvoiceSection from "./component/CheckoutInvoiceSection";
// import CheckoutSummarySection from "./component/CheckoutSummarySection";

// import type {
//   CheckoutData,
//   CheckoutItem,
//   DeliveryOption,
//   PaymentMethod,
//   CheckoutVoucher,
//   CheckoutAddress,
//   CheckoutProfileInfo,
// } from "@/types/checkout";

// type Props = {
//   initialData: CheckoutData;
// };

// export default function CheckoutClient({ initialData }: Props) {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   // ===== State หลักที่มีผลหลายส่วน =====
//   const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(
//     initialData.items ?? [],
//   );

//   // ✅ state ที่อยู่ / profile (มาจาก service layer)
//   const [shippingAddress, setShippingAddress] =
//     useState<CheckoutAddress | null>(initialData.shippingAddress ?? null);

//   const [billingAddress, setBillingAddress] =
//     useState<CheckoutAddress | null>(initialData.billingAddress ?? null);

//   const [profileInfo, setProfileInfo] =
//     useState<CheckoutProfileInfo | undefined>(initialData.profileInfo);

//   // ✅ ใช้ DeliveryOption จาก type กลาง
//   const [deliveryOption, setDeliveryOption] =
//     useState<DeliveryOption>("standard");

//   // ✅ ใช้ PaymentMethod จาก type กลาง
//   const [paymentMethod, setPaymentMethod] =
//     useState<PaymentMethod>("card");

//   const [voucherCode, setVoucherCode] = useState("");
//   const [appliedVouchers, setAppliedVouchers] = useState<CheckoutVoucher[]>([]);
//   const [voucherError, setVoucherError] = useState("");

//   // ===== คำนวณราคา (ฝั่ง UI) =====
//   const subtotal = checkoutItems.reduce((sum, item) => {
//     const line =
//       typeof item.lineTotal === "number"
//         ? item.lineTotal
//         : item.price * item.quantity;
//     return sum + line;
//   }, 0);

//   const shippingFee = deliveryOption === "standard" ? 0 : 65;

//   const voucherDiscount = appliedVouchers.reduce(
//     (sum, voucher) => sum + voucher.discount,
//     0,
//   );

//   const total = subtotal + shippingFee - voucherDiscount;

//   // ===== Logic Voucher (mock) =====
//   const handleApplyVoucher = () => {
//     if (!voucherCode.trim()) return;

//     setVoucherError("");

//     const mockVouchers: Record<string, CheckoutVoucher> = {
//       SAVE100: { code: "SAVE100", discount: 100 },
//       DISCOUNT50: { code: "DISCOUNT50", discount: 50 },
//       FREESHIP: { code: "FREESHIP", discount: 65 },
//       VC0001: { code: "VC0001", discount: 100 },
//       VC0002: { code: "VC0002", discount: 200 },
//     };

//     const key = voucherCode.toUpperCase();
//     const voucher = mockVouchers[key];

//     if (!voucher) {
//       setVoucherError("โค้ดส่วนลดไม่ถูกต้อง");
//       return;
//     }

//     const isAlreadyApplied = appliedVouchers.some(
//       (v) => v.code === voucher.code,
//     );
//     if (isAlreadyApplied) {
//       setVoucherError("โค้ดนี้ถูกใช้แล้ว");
//       return;
//     }

//     setAppliedVouchers((prev) => [...prev, voucher]);
//     setVoucherCode("");
//   };

//   const handleRemoveVoucher = (codeToRemove: string) => {
//     setAppliedVouchers((prev) =>
//       prev.filter((v) => v.code !== codeToRemove),
//     );
//   };

//   // ===== Logic Cart Item =====
//   const handleRemoveItem = (itemId: number) => {
//     setCheckoutItems((items) => items.filter((item) => item.id !== itemId));
//   };

//   // ===== Place Order (mock) =====
//   const handlePlaceOrder = () => {
//     const paymentData = {
//       amount: total,
//       orderId: `ORDER-${Date.now()}`,
//       items: checkoutItems,
//       subtotal,
//       shippingFee,
//       shippingDiscount: 65,
//       voucherDiscount,
//       appliedVouchers,
//     };

//     if (typeof window !== "undefined") {
//       sessionStorage.setItem("paymentData", JSON.stringify(paymentData));
//     }

//     if (paymentMethod === "card") {
//       router.push("/payment/card");
//     } else if (paymentMethod === "qr") {
//       router.push("/payment/qr");
//     } else {
//       router.push("/payment/card");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Link href="/cart">
//             <Button variant="ghost" size="icon">
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//           </Link>
//           <h1 className="text-2xl font-bold">ชำระเงิน</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ซ้าย: ที่อยู่ + รายการสินค้า */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* ที่อยู่จัดส่ง (บุคคล / นิติบุคคล) */}
//             <CheckoutShippingAddressSection
//               shippingAddress={shippingAddress}
//               billingAddress={billingAddress}
//               profileInfo={profileInfo}
//               onChangeShippingAddress={setShippingAddress}
//               onChangeBillingAddress={setBillingAddress}
//               onChangeProfileInfo={setProfileInfo}
//             />

//             {/* ที่อยู่ออกใบกำกับภาษี */}
//             <CheckoutBillingAddressSection
//               shippingAddress={shippingAddress}
//               billingAddress={billingAddress}
//               profileInfo={profileInfo}
//               onChangeBillingAddress={setBillingAddress}
//               onChangeProfileInfo={setProfileInfo}
//             />

//             <CheckoutPackagesSection
//               checkoutItems={checkoutItems}
//               deliveryOption={deliveryOption}
//               onChangeDeliveryOption={setDeliveryOption}
//               onRemoveItem={handleRemoveItem}
//             />
//           </div>

//           {/* ขวา: การชำระเงิน / Voucher / ใบกำกับ / สรุปยอด */}
//           <div className="space-y-6">
//             <CheckoutPaymentSection
//               paymentMethod={paymentMethod}
//               onChangePaymentMethod={setPaymentMethod}
//             />

//             {/* <CheckoutVoucherSection
//               voucherCode={voucherCode}
//               onChangeVoucherCode={setVoucherCode}
//               onApplyVoucher={handleApplyVoucher}
//               appliedVouchers={appliedVouchers}
//               onRemoveVoucher={handleRemoveVoucher}
//               error={voucherError}
//             /> */}

//             <CheckoutSummarySection
//               itemCount={checkoutItems.length}
//               subtotal={subtotal}
//               shippingFee={shippingFee}
//               voucherDiscount={voucherDiscount}
//               total={total}
//               onPlaceOrder={handlePlaceOrder}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.5 ===============================================================

// v.1.1.4 ===============================================================
// // src/app/checkout/CheckoutClient.tsx

// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { ArrowLeft } from "lucide-react";

// import { Button } from "@/components/ui/button";

// import CheckoutShippingAddressSection from "./component/CheckoutShippingAddressSection";
// import CheckoutPackagesSection from "./component/CheckoutPackagesSection";
// import CheckoutPaymentSection from "./component/CheckoutPaymentSection";
// // import CheckoutVoucherSection from "./component/CheckoutVoucherSection";
// // import CheckoutInvoiceSection from "./component/CheckoutInvoiceSection";
// import CheckoutSummarySection from "./component/CheckoutSummarySection";

// import type {
//   CheckoutData,
//   CheckoutItem,
//   DeliveryOption,
//   PaymentMethod,
//   CheckoutVoucher,
//   CheckoutAddress,
//   CheckoutProfileInfo,
// } from "@/types/checkout";

// type Props = {
//   initialData: CheckoutData;
// };

// export default function CheckoutClient({ initialData }: Props) {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   // ===== State หลักที่มีผลหลายส่วน =====
//   const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(
//     initialData.items ?? [],
//   );

//   // ✅ state ที่อยู่ / profile (มาจาก service layer)
//   const [shippingAddress, setShippingAddress] =
//     useState<CheckoutAddress | null>(initialData.shippingAddress ?? null);

//   const [billingAddress, setBillingAddress] =
//     useState<CheckoutAddress | null>(initialData.billingAddress ?? null);

//   const [profileInfo, setProfileInfo] = useState<CheckoutProfileInfo | undefined>(
//     initialData.profileInfo,
//   );

//   // ✅ ใช้ DeliveryOption จาก type กลาง
//   const [deliveryOption, setDeliveryOption] =
//     useState<DeliveryOption>("standard");

//   // ✅ ใช้ PaymentMethod จาก type กลาง
//   const [paymentMethod, setPaymentMethod] =
//     useState<PaymentMethod>("card");

//   const [voucherCode, setVoucherCode] = useState("");
//   const [appliedVouchers, setAppliedVouchers] = useState<CheckoutVoucher[]>([]);
//   const [voucherError, setVoucherError] = useState("");

//   // ===== คำนวณราคา (ฝั่ง UI) =====
//   const subtotal = checkoutItems.reduce((sum, item) => {
//     const line =
//       typeof item.lineTotal === "number"
//         ? item.lineTotal
//         : item.price * item.quantity;
//     return sum + line;
//   }, 0);

//   const shippingFee = deliveryOption === "standard" ? 0 : 65;

//   const voucherDiscount = appliedVouchers.reduce(
//     (sum, voucher) => sum + voucher.discount,
//     0,
//   );

//   const total = subtotal + shippingFee - voucherDiscount;

//   // ===== Logic Voucher (mock) =====
//   const handleApplyVoucher = () => {
//     if (!voucherCode.trim()) return;

//     setVoucherError("");

//     const mockVouchers: Record<string, CheckoutVoucher> = {
//       SAVE100: { code: "SAVE100", discount: 100 },
//       DISCOUNT50: { code: "DISCOUNT50", discount: 50 },
//       FREESHIP: { code: "FREESHIP", discount: 65 },
//       VC0001: { code: "VC0001", discount: 100 },
//       VC0002: { code: "VC0002", discount: 200 },
//     };

//     const key = voucherCode.toUpperCase();
//     const voucher = mockVouchers[key];

//     if (!voucher) {
//       setVoucherError("โค้ดส่วนลดไม่ถูกต้อง");
//       return;
//     }

//     const isAlreadyApplied = appliedVouchers.some(
//       (v) => v.code === voucher.code,
//     );
//     if (isAlreadyApplied) {
//       setVoucherError("โค้ดนี้ถูกใช้แล้ว");
//       return;
//     }

//     setAppliedVouchers((prev) => [...prev, voucher]);
//     setVoucherCode("");
//   };

//   const handleRemoveVoucher = (codeToRemove: string) => {
//     setAppliedVouchers((prev) =>
//       prev.filter((v) => v.code !== codeToRemove),
//     );
//   };

//   // ===== Logic Cart Item =====
//   const handleRemoveItem = (itemId: number) => {
//     setCheckoutItems((items) => items.filter((item) => item.id !== itemId));
//   };

//   // ===== Place Order (mock) =====
//   const handlePlaceOrder = () => {
//     const paymentData = {
//       amount: total,
//       orderId: `ORDER-${Date.now()}`,
//       items: checkoutItems,
//       subtotal,
//       shippingFee,
//       shippingDiscount: 65,
//       voucherDiscount,
//       appliedVouchers,
//     };

//     if (typeof window !== "undefined") {
//       sessionStorage.setItem("paymentData", JSON.stringify(paymentData));
//     }

//     if (paymentMethod === "card") {
//       router.push("/payment/card");
//     } else if (paymentMethod === "qr") {
//       router.push("/payment/qr");
//     } else {
//       router.push("/payment/card");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Link href="/cart">
//             <Button variant="ghost" size="icon">
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//           </Link>
//           <h1 className="text-2xl font-bold">ชำระเงิน</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ซ้าย: ที่อยู่ + รายการสินค้า */}
//           <div className="lg:col-span-2 space-y-6">
//             <CheckoutShippingAddressSection
//               shippingAddress={shippingAddress}
//               billingAddress={billingAddress}
//               profileInfo={profileInfo}
//               onChangeShippingAddress={setShippingAddress}
//               onChangeBillingAddress={setBillingAddress}
//               onChangeProfileInfo={setProfileInfo}
//             />

//             <CheckoutPackagesSection
//               checkoutItems={checkoutItems}
//               deliveryOption={deliveryOption}
//               onChangeDeliveryOption={setDeliveryOption}
//               onRemoveItem={handleRemoveItem}
//             />
//           </div>

//           {/* ขวา: การชำระเงิน / Voucher / ใบกำกับ / สรุปยอด */}
//           <div className="space-y-6">
//             <CheckoutPaymentSection
//               paymentMethod={paymentMethod}
//               onChangePaymentMethod={setPaymentMethod}
//             />

//             {/* <CheckoutVoucherSection ... /> */}

//             <CheckoutSummarySection
//               itemCount={checkoutItems.length}
//               subtotal={subtotal}
//               shippingFee={shippingFee}
//               voucherDiscount={voucherDiscount}
//               total={total}
//               onPlaceOrder={handlePlaceOrder}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.4 ===============================================================

// v.1.1.3 ===============================================================
// // src/app/checkout/CheckoutClient.tsx

// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { ArrowLeft } from "lucide-react";

// import { Button } from "@/components/ui/button";

// import CheckoutShippingAddressSection from "./component/CheckoutShippingAddressSection";
// import CheckoutPackagesSection from "./component/CheckoutPackagesSection";
// import CheckoutPaymentSection from "./component/CheckoutPaymentSection";
// // import CheckoutVoucherSection from "./component/CheckoutVoucherSection";
// // import CheckoutInvoiceSection from "./component/CheckoutInvoiceSection";
// import CheckoutSummarySection from "./component/CheckoutSummarySection";

// import type {
//   CheckoutData,
//   CheckoutItem,
//   DeliveryOption,
//   PaymentMethod,
//   CheckoutVoucher,
// } from "@/types/checkout";

// type Props = {
//   initialData: CheckoutData;
// };

// export default function CheckoutClient({ initialData }: Props) {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   // ===== State หลักที่มีผลหลายส่วน =====
//   const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(
//     initialData.items ?? []
//   );

//   // ✅ ใช้ DeliveryOption จาก type กลาง
//   const [deliveryOption, setDeliveryOption] =
//     useState<DeliveryOption>("standard");

//   // ✅ ใช้ PaymentMethod จาก type กลาง
//   const [paymentMethod, setPaymentMethod] =
//     useState<PaymentMethod>("card");

//   const [voucherCode, setVoucherCode] = useState("");
//   const [appliedVouchers, setAppliedVouchers] = useState<CheckoutVoucher[]>(
//     []
//   );
//   const [voucherError, setVoucherError] = useState("");

//   // ===== คำนวณราคา (ฝั่ง UI) =====
//   const subtotal = checkoutItems.reduce(
//     (sum, item) => {
//       const line =
//         typeof item.lineTotal === "number"
//           ? item.lineTotal
//           : item.price * item.quantity;
//       return sum + line;
//     },
//     0
//   );

//   const shippingFee = deliveryOption === "standard" ? 0 : 65;

//   const voucherDiscount = appliedVouchers.reduce(
//     (sum, voucher) => sum + voucher.discount,
//     0
//   );

//   const total = subtotal + shippingFee - voucherDiscount;

//   // ===== Logic Voucher (mock) =====
//   const handleApplyVoucher = () => {
//     if (!voucherCode.trim()) return;

//     setVoucherError("");

//     const mockVouchers: Record<string, CheckoutVoucher> = {
//       SAVE100: { code: "SAVE100", discount: 100 },
//       DISCOUNT50: { code: "DISCOUNT50", discount: 50 },
//       FREESHIP: { code: "FREESHIP", discount: 65 },
//       VC0001: { code: "VC0001", discount: 100 },
//       VC0002: { code: "VC0002", discount: 200 },
//     };

//     const key = voucherCode.toUpperCase();
//     const voucher = mockVouchers[key];

//     if (!voucher) {
//       setVoucherError("โค้ดส่วนลดไม่ถูกต้อง");
//       return;
//     }

//     const isAlreadyApplied = appliedVouchers.some(
//       (v) => v.code === voucher.code
//     );
//     if (isAlreadyApplied) {
//       setVoucherError("โค้ดนี้ถูกใช้แล้ว");
//       return;
//     }

//     setAppliedVouchers((prev) => [...prev, voucher]);
//     setVoucherCode("");
//   };

//   const handleRemoveVoucher = (codeToRemove: string) => {
//     setAppliedVouchers((prev) =>
//       prev.filter((v) => v.code !== codeToRemove)
//     );
//   };

//   // ===== Logic Cart Item =====
//   const handleRemoveItem = (itemId: number) => {
//     setCheckoutItems((items) => items.filter((item) => item.id !== itemId));
//   };

//   // ===== Place Order (mock) =====
//   const handlePlaceOrder = () => {
//     const paymentData = {
//       amount: total,
//       orderId: `ORDER-${Date.now()}`,
//       items: checkoutItems,
//       subtotal,
//       shippingFee,
//       shippingDiscount: 65,
//       voucherDiscount,
//       appliedVouchers,
//     };

//     if (typeof window !== "undefined") {
//       sessionStorage.setItem("paymentData", JSON.stringify(paymentData));
//     }

//     if (paymentMethod === "card") {
//       router.push("/payment/card");
//     } else if (paymentMethod === "qr") {
//       router.push("/payment/qr");
//     } else {
//       router.push("/payment/card");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Link href="/cart">
//             <Button variant="ghost" size="icon">
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//           </Link>
//           <h1 className="text-2xl font-bold">ชำระเงิน</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ซ้าย: ที่อยู่ + รายการสินค้า */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* บล็อกที่อยู่จัดส่ง + บิล (ตอนนี้ยังใช้ state ภายใน component เอง) */}
//             <CheckoutShippingAddressSection />

//             <CheckoutPackagesSection
//               checkoutItems={checkoutItems}
//               deliveryOption={deliveryOption}
//               onChangeDeliveryOption={setDeliveryOption}
//               onRemoveItem={handleRemoveItem}
//             />
//           </div>

//           {/* ขวา: การชำระเงิน / Voucher / ใบกำกับ / สรุปยอด */}
//           <div className="space-y-6">
//             <CheckoutPaymentSection
//               paymentMethod={paymentMethod}
//               onChangePaymentMethod={setPaymentMethod}
//             />

//             {/* ถ้าจะใช้ voucher section จริง ก็ uncomment แล้วส่ง props ให้ครบ */}
//             {/* <CheckoutVoucherSection
//               voucherCode={voucherCode}
//               onChangeVoucherCode={setVoucherCode}
//               onApplyVoucher={handleApplyVoucher}
//               appliedVouchers={appliedVouchers}
//               onRemoveVoucher={handleRemoveVoucher}
//               error={voucherError}
//             /> */}

//             {/* <CheckoutInvoiceSection /> */}

//             <CheckoutSummarySection
//               itemCount={checkoutItems.length}
//               subtotal={subtotal}
//               shippingFee={shippingFee}
//               voucherDiscount={voucherDiscount}
//               total={total}
//               onPlaceOrder={handlePlaceOrder}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.3 ===============================================================

// v.1.1.2 ===============================================================
// // src/app/checkout/CheckoutClient.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// import {
//   ArrowLeft,
//   MapPin,
//   CreditCard,
//   Wallet,
//   Check,
//   QrCode,
//   Trash2,
//   Smartphone,
//   Building2,
//   ArrowLeftRight,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Textarea } from "@/components/ui/textarea";

// import type {
//   CheckoutItem,
//   CheckoutSummary,
//   CheckoutAddress,
//   CheckoutProfileInfo,
// } from "@/types/checkout";

// type Props = {
//   items: CheckoutItem[];
//   summary: CheckoutSummary;
//   shippingAddress: CheckoutAddress | null;
//   billingAddress: CheckoutAddress | null;
//   profileInfo?: CheckoutProfileInfo;
// };

// /** shape ที่จะใช้ใน UI (ให้เหมือน UICartItem แต่ไม่มี checkbox / edit) */
// type UICheckoutItem = {
//   id: number;
//   name: string;
//   sku: string;
//   brand?: string;
//   price: number;
//   quantity: number;
//   uom?: string;
//   lineTotal: number;
//   image: string;
// };

// /**
//  * แปลง CheckoutItem → UICheckoutItem
//  */
// function mapItemsForUI(items: CheckoutItem[]): UICheckoutItem[] {
//   return items.map((i) => ({
//     id: i.cartId,
//     name: i.name,
//     sku: i.product,
//     brand: i.brand,
//     price: i.unitPrice,
//     quantity: i.quantity,
//     uom: i.uom || undefined,
//     lineTotal: i.lineTotal,
//     image: i.imageUrl || "/assets/placeholder-product.png",
//   }));
// }

// export default function CheckoutClient({
//   items,
//   summary,
//   shippingAddress,
//   billingAddress,
//   profileInfo,
// }: Props) {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   // ====== สินค้าในคำสั่งซื้อ (จาก props) ======
//   const [checkoutItems, setCheckoutItems] = useState<UICheckoutItem[]>(() =>
//     mapItemsForUI(items)
//   );

//   // ====== วิธีชำระเงิน / voucher / etc. (ยังเป็น UI-only) ======
//   const [paymentMethod, setPaymentMethod] = useState<"card" | "qr" | string>(
//     "card"
//   );
//   const [voucherCode, setVoucherCode] = useState("");
//   const [appliedVouchers, setAppliedVouchers] = useState<
//     { code: string; discount: number }[]
//   >([]);
//   const [voucherError, setVoucherError] = useState("");
//   const [isPaymentMethodsOpen, setIsPaymentMethodsOpen] = useState(false);
//   const [additionalPaymentMethods, setAdditionalPaymentMethods] = useState<
//     string[]
//   >([]);

//   // ====== ข้อมูล invoice ======
//   const initialEmail = profileInfo?.email || "example@email.com";

//   const initialBillingText =
//     billingAddress?.address || shippingAddress?.address || "";

//   const [invoiceInfo, setInvoiceInfo] = useState({
//     email: initialEmail,
//     billingAddress: initialBillingText,
//     taxId: profileInfo?.taxId ?? "",
//     headOfficeBranch: "",
//   });
//   const [isInvoiceSheetOpen, setIsInvoiceSheetOpen] = useState(false);

//   // ====== ที่อยู่จัดส่ง (read-only) ======
//   const addressDisplay = shippingAddress
//     ? {
//         tag: shippingAddress.type,
//         name: shippingAddress.name,
//         phone: shippingAddress.phone,
//         address: shippingAddress.address,
//       }
//     : null;

//   // ====== Summary คำนวณซ้ำจาก state ปัจจุบัน (รองรับลบสินค้า/ voucher) ======
//   const subtotal = useMemo(
//     () =>
//       checkoutItems.reduce(
//         (sum, item) => sum + item.price * item.quantity,
//         0
//       ),
//     [checkoutItems]
//   );

//   const shippingFee = summary.shippingFee ?? 0; // ตอนนี้ 0 ไว้ก่อน
//   const voucherDiscount = appliedVouchers.reduce(
//     (sum, v) => sum + v.discount,
//     0
//   );
//   const total = subtotal + shippingFee - voucherDiscount;

//   // ====== handlers ======

//   const handleRemoveItem = (id: number) => {
//     setCheckoutItems((prev) => prev.filter((it) => it.id !== id));
//     // TODO: ผูกกับ API ลบจาก carts จริง เช่น /api/cart/remove
//   };

//   const handleApplyVoucher = () => {
//     if (!voucherCode.trim()) return;
//     setVoucherError("");

//     const mockVouchers: Record<string, { code: string; discount: number }> = {
//       SAVE100: { code: "SAVE100", discount: 100 },
//       DISCOUNT50: { code: "DISCOUNT50", discount: 50 },
//       FREESHIP: { code: "FREESHIP", discount: 65 },
//       VC0001: { code: "VC0001", discount: 100 },
//       VC0002: { code: "VC0002", discount: 200 },
//     };

//     const code = voucherCode.toUpperCase();
//     const voucher = mockVouchers[code];

//     if (!voucher) {
//       setVoucherError("โค้ดส่วนลดไม่ถูกต้อง");
//       return;
//     }

//     const already = appliedVouchers.some((v) => v.code === code);
//     if (already) {
//       setVoucherError("โค้ดนี้ถูกใช้แล้ว");
//       return;
//     }

//     setAppliedVouchers((prev) => [...prev, voucher]);
//     setVoucherCode("");
//   };

//   const handleRemoveVoucher = (code: string) => {
//     setAppliedVouchers((prev) => prev.filter((v) => v.code !== code));
//   };

//   const handleConfirmPaymentMethods = () => {
//     const methodsToAdd: string[] = [];
//     if (
//       paymentMethod === "linepay" &&
//       !additionalPaymentMethods.includes("linepay")
//     )
//       methodsToAdd.push("linepay");
//     if (
//       paymentMethod === "internetbanking" &&
//       !additionalPaymentMethods.includes("internetbanking")
//     )
//       methodsToAdd.push("internetbanking");
//     if (
//       paymentMethod === "banktransfer" &&
//       !additionalPaymentMethods.includes("banktransfer")
//     )
//       methodsToAdd.push("banktransfer");
//     if (paymentMethod === "cash" && !additionalPaymentMethods.includes("cod"))
//       methodsToAdd.push("cod");

//     setAdditionalPaymentMethods((prev) => [...prev, ...methodsToAdd]);
//     setIsPaymentMethodsOpen(false);
//   };

//   const handleRemovePaymentMethod = (method: string) => {
//     setAdditionalPaymentMethods((prev) => prev.filter((m) => m !== method));
//     if (paymentMethod === method) setPaymentMethod("card");
//   };

//   const handleSaveInvoiceInfo = () => {
//     setIsInvoiceSheetOpen(false);
//   };

//   const handlePlaceOrder = () => {
//     const paymentData = {
//       amount: total,
//       orderId: `ORDER-${Date.now()}`,
//       items: checkoutItems,
//       subtotal,
//       shippingFee,
//       voucherDiscount,
//       appliedVouchers,
//     };

//     if (typeof window !== "undefined") {
//       sessionStorage.setItem("paymentData", JSON.stringify(paymentData));
//     }

//     if (paymentMethod === "card") {
//       router.push("/payment/card");
//     } else if (paymentMethod === "qr") {
//       router.push("/payment/qr");
//     } else {
//       router.push("/payment/card");
//     }
//   };

//   const getPaymentMethodInfo = (method: string) => {
//     const methodsMap = {
//       linepay: {
//         icon: <Smartphone className="h-6 w-6 text-green-600" />,
//         bgColor: "bg-green-100",
//         name: "LINE Pay",
//         description: "เชื่อมต่อบัตรหรือเติมเงินก่อนช้อปปิ้ง",
//       },
//       internetbanking: {
//         icon: <Building2 className="h-6 w-6 text-blue-600" />,
//         bgColor: "bg-blue-100",
//         name: "Internet banking",
//         description: "เข้าสู่ระบบด้วยบัญชีธนาคารเพื่อชำระเงิน",
//       },
//       banktransfer: {
//         icon: <ArrowLeftRight className="h-6 w-6 text-purple-600" />,
//         bgColor: "bg-purple-100",
//         name: "โอนเงินผ่านธนาคาร",
//         description: "โอนเงินโดยตรงไปยังบัญชีของผู้ขาย",
//       },
//       cod: {
//         icon: <Wallet className="h-6 w-6 text-orange-600" />,
//         bgColor: "bg-orange-100",
//         name: "เก็บเงินปลายทาง",
//         description: "ชำระเมื่อสินค้าจัดส่งถึงปลายทาง",
//       },
//     } as const;

//     return methodsMap[method as keyof typeof methodsMap];
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Link href="/cart">
//             <Button variant="ghost" size="icon">
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//           </Link>
//           <h1 className="text-2xl font-bold">ชำระเงิน</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ====== ซ้าย: ที่อยู่ + รายการสินค้า ====== */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* ที่อยู่จัดส่ง */}
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="flex items-center gap-2 text-lg">
//                   <MapPin className="h-5 w-5" />
//                   ที่อยู่จัดส่ง
//                   <Link href="/profile" className="ml-auto">
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="text-primary"
//                     >
//                       แก้ไข
//                     </Button>
//                   </Link>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {addressDisplay ? (
//                   <div className="bg-orange-50 p-3 rounded border border-orange-200">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span
//                         className={`text-white text-xs px-2 py-1 rounded ${
//                           addressDisplay.tag === "HOME"
//                             ? "bg-orange-500"
//                             : "bg-blue-500"
//                         }`}
//                       >
//                         {addressDisplay.tag}
//                       </span>
//                       <span className="font-medium">
//                         {addressDisplay.name}
//                       </span>
//                       <span className="text-muted-foreground">
//                         {addressDisplay.phone}
//                       </span>
//                     </div>
//                     <p className="text-sm text-muted-foreground">
//                       {addressDisplay.address}
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="text-sm text-red-600">
//                     ยังไม่พบข้อมูลที่อยู่จัดส่ง กรุณากรอกในหน้า{" "}
//                     <Link href="/profile" className="underline">
//                       โปรไฟล์
//                     </Link>{" "}
//                     ก่อนทำการสั่งซื้อ
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* รายการสินค้า – layout ตามหน้า Cart แต่ไม่มี checkbox / ปุ่มแก้ไข */}
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-lg">
//                   รายการสินค้าในคำสั่งซื้อ
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 {checkoutItems.length === 0 && (
//                   <p className="text-sm text-muted-foreground">
//                     ไม่มีสินค้าในคำสั่งซื้อ
//                   </p>
//                 )}

//                 {checkoutItems.map((item) => (
//                   <div
//                     key={item.id}
//                     className="p-4 bg-card rounded-lg border"
//                   >
//                     <div className="flex items-start gap-3">
//                       {/* eslint-disable-next-line @next/next/no-img-element */}
//                       <img
//                         src={item.image}
//                         alt={item.name}
//                         className="w-20 h-20 object-cover rounded border"
//                       />

//                       <div className="flex-1 min-w-0 space-y-1">
//                         <h3 className="font-semibold text-sm line-clamp-2">
//                           {item.name}
//                         </h3>

//                         <div className="text-[11px] font-semibold text-foreground">
//                           SKU: {item.sku}
//                         </div>

//                         {item.brand && (
//                           <div className="text-[11px] text-muted-foreground">
//                             Brand: {item.brand}
//                           </div>
//                         )}

//                         <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
//                           <div className="flex items-baseline gap-1">
//                             <span className="text-primary font-semibold text-sm">
//                               ฿{Number(item.price).toLocaleString()}
//                             </span>
//                             {item.uom && (
//                               <span className="text-[11px] text-muted-foreground">
//                                 / {item.uom}
//                               </span>
//                             )}
//                           </div>
//                         </div>

//                         <div className="text-[11px] text-muted-foreground">
//                           จำนวน:{" "}
//                           <span className="font-medium text-foreground">
//                             {Number(item.quantity).toLocaleString()}{" "}
//                             {item.uom ? item.uom : ""}
//                           </span>
//                         </div>

//                         <div className="text-sm flex items-center justify-between mt-1">
//                           <div>
//                             ราคารวม:{" "}
//                             <span className="font-bold text-red-600 text-base">
//                               ฿{Number(item.lineTotal).toLocaleString()}
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       {/* ปุ่มลบ */}
//                       <AlertDialog>
//                         <AlertDialogTrigger asChild>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </AlertDialogTrigger>
//                         <AlertDialogContent>
//                           <AlertDialogHeader>
//                             <AlertDialogTitle>
//                               ยืนยันการลบสินค้า
//                             </AlertDialogTitle>
//                             <AlertDialogDescription>
//                               คุณต้องการลบ "{item.name}" ออกจากรายการสั่งซื้อหรือไม่?
//                             </AlertDialogDescription>
//                           </AlertDialogHeader>
//                           <AlertDialogFooter>
//                             <AlertDialogCancel>
//                               ยกเลิก
//                             </AlertDialogCancel>
//                             <AlertDialogAction
//                               onClick={() => handleRemoveItem(item.id)}
//                               className="bg-red-600 hover:bg-red-700"
//                             >
//                               ลบ
//                             </AlertDialogAction>
//                           </AlertDialogFooter>
//                         </AlertDialogContent>
//                       </AlertDialog>
//                     </div>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           </div>

//           {/* ====== ขวา: Payment + Voucher + Invoice + Summary ====== */}
//           <div className="space-y-6">
//             {/* วิธีชำระเงิน */}
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-lg">เลือกวิธีชำระเงิน</CardTitle>
//                 <Sheet
//                   open={isPaymentMethodsOpen}
//                   onOpenChange={setIsPaymentMethodsOpen}
//                 >
//                   <SheetTrigger asChild>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="text-primary self-start p-0 h-auto"
//                     >
//                       ดูวิธีการทั้งหมด »
//                     </Button>
//                   </SheetTrigger>
//                   <SheetContent
//                     side="right"
//                     className="w-[500px] max-w-full overflow-hidden"
//                   >
//                     <SheetHeader>
//                       <SheetTitle>เลือกวิธีชำระเงิน</SheetTitle>
//                     </SheetHeader>

//                     <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
//                       <h3 className="text-sm font-medium text-gray-700">
//                         วิธีที่แนะนำ
//                       </h3>

//                       {/* แนะนำ: บัตรเครดิต/เดบิต */}
//                       <div
//                         className={`flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors cursor-pointer ${
//                           paymentMethod === "card"
//                             ? "border-primary bg-primary/5"
//                             : "border-gray-200"
//                         }`}
//                         onClick={() => setPaymentMethod("card")}
//                       >
//                         <div className="bg-blue-100 p-2 rounded-lg">
//                           <CreditCard className="h-6 w-6 text-blue-600" />
//                         </div>
//                         <div className="flex-1">
//                           <div className="font-medium text-gray-900">
//                             บัตรเครดิต/เดบิต
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             บัตรเครดิต/เดบิต
//                           </div>
//                           <div className="flex items-center gap-1 mt-1">
//                             <img
//                               src="/assets/mastercard-logo.svg"
//                               alt="Mastercard"
//                               className="h-4 w-auto"
//                             />
//                             <img
//                               src="/assets/jcb-logo.svg"
//                               alt="JCB"
//                               className="h-4 w-auto"
//                             />
//                             <img
//                               src="/assets/visa-logo.svg"
//                               alt="Visa"
//                               className="h-4 w-auto"
//                             />
//                           </div>
//                         </div>
//                         {paymentMethod === "card" && (
//                           <Check className="h-5 w-5 text-green-500" />
//                         )}
//                       </div>

//                       <Separator />

//                       <h3 className="text-sm font-medium text-gray-700">
//                         วิธีชำระเงินอื่น ๆ
//                       </h3>

//                       {/* เก็บเงินปลายทาง */}
//                       <div
//                         className={`flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors cursor-pointer ${
//                           paymentMethod === "cash"
//                             ? "border-primary bg-primary/5"
//                             : "border-gray-200"
//                         }`}
//                         onClick={() => setPaymentMethod("cash")}
//                       >
//                         <div className="bg-green-100 p-2 rounded-lg">
//                           <Wallet className="h-6 w-6 text-green-600" />
//                         </div>
//                         <div className="flex-1">
//                           <div className="font-medium text-gray-900">
//                             เก็บเงินปลายทาง
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             เก็บเงินปลายทาง
//                           </div>
//                         </div>
//                         {paymentMethod === "cash" && (
//                           <Check className="h-5 w-5 text-green-500" />
//                         )}
//                       </div>

//                       {/* QR PromptPay */}
//                       <div
//                         className={`flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors cursor-pointer ${
//                           paymentMethod === "qr"
//                             ? "border-primary bg-primary/5"
//                             : "border-gray-200"
//                         }`}
//                         onClick={() => setPaymentMethod("qr")}
//                       >
//                         <div className="bg-blue-100 p-2 rounded-lg">
//                           <QrCode className="h-6 w-6 text-blue-600" />
//                         </div>
//                         <div className="flex-1">
//                           <div className="font-medium text-gray-900">
//                             QR PromptPay
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             สแกน QR Code เพื่อชำระเงิน
//                           </div>
//                         </div>
//                         {paymentMethod === "qr" && (
//                           <Check className="h-5 w-5 text-green-500" />
//                         )}
//                       </div>

//                       {/* LINE Pay */}
//                       <div
//                         className={`flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors cursor-pointer ${
//                           paymentMethod === "linepay"
//                             ? "border-primary bg-primary/5"
//                             : "border-gray-200"
//                         }`}
//                         onClick={() => setPaymentMethod("linepay")}
//                       >
//                         <div className="bg-green-100 p-2 rounded-lg">
//                           <Smartphone className="h-6 w-6 text-green-600" />
//                         </div>
//                         <div className="flex-1">
//                           <div className="font-medium text-gray-900">
//                             LINE Pay
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             เชื่อมต่อบัตรหรือเติมเงินก่อนช้อปปิ้ง
//                           </div>
//                         </div>
//                         {paymentMethod === "linepay" && (
//                           <Check className="h-5 w-5 text-green-500" />
//                         )}
//                       </div>

//                       {/* Internet Banking */}
//                       <div
//                         className={`flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors cursor-pointer ${
//                           paymentMethod === "internetbanking"
//                             ? "border-primary bg-primary/5"
//                             : "border-gray-200"
//                         }`}
//                         onClick={() => setPaymentMethod("internetbanking")}
//                       >
//                         <div className="bg-blue-100 p-2 rounded-lg">
//                           <Building2 className="h-6 w-6 text-blue-600" />
//                         </div>
//                         <div className="flex-1">
//                           <div className="font-medium text-gray-900">
//                             Internet Banking
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             เข้าสู่ระบบด้วยบัญชีธนาคารเพื่อชำระเงิน
//                           </div>
//                         </div>
//                         {paymentMethod === "internetbanking" && (
//                           <Check className="h-5 w-5 text-green-500" />
//                         )}
//                       </div>

//                       {/* โอนเงินผ่านธนาคาร */}
//                       <div
//                         className={`flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors cursor-pointer ${
//                           paymentMethod === "banktransfer"
//                             ? "border-primary bg-primary/5"
//                             : "border-gray-200"
//                         }`}
//                         onClick={() => setPaymentMethod("banktransfer")}
//                       >
//                         <div className="bg-purple-100 p-2 rounded-lg">
//                           <ArrowLeftRight className="h-6 w-6 text-purple-600" />
//                         </div>
//                         <div className="flex-1">
//                           <div className="font-medium text-gray-900">
//                             โอนเงินผ่านธนาคาร
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             โอนเงินโดยตรงไปยังบัญชีของผู้ขาย
//                           </div>
//                         </div>
//                         {paymentMethod === "banktransfer" && (
//                           <Check className="h-5 w-5 text-green-500" />
//                         )}
//                       </div>
//                     </div>

//                     <div className="flex justify-end gap-2 mt-6">
//                       <Button
//                         variant="outline"
//                         onClick={() => setIsPaymentMethodsOpen(false)}
//                       >
//                         ยกเลิก
//                       </Button>
//                       <Button
//                         className="bg-orange-500 hover:bg-orange-600 text-white"
//                         onClick={handleConfirmPaymentMethods}
//                       >
//                         ยืนยัน
//                       </Button>
//                     </div>
//                   </SheetContent>
//                 </Sheet>
//               </CardHeader>

//               {/* กล่องวิธีหลัก (card / qr / etc) */}
//               <CardContent className="space-y-3">
//                 <RadioGroup
//                   value={paymentMethod}
//                   onValueChange={setPaymentMethod}
//                 >
//                   {/* บัตรเครดิต/เดบิต */}
//                   <div
//                     className={`flex items-center space-x-2 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors ${
//                       paymentMethod === "card"
//                         ? "border-primary bg-primary/5"
//                         : "border-gray-200"
//                     }`}
//                   >
//                     <RadioGroupItem value="card" id="card" />
//                     <div className="bg-blue-100 p-2 rounded-lg">
//                       <CreditCard className="h-6 w-6 text-blue-600" />
//                     </div>
//                     <div className="flex-1">
//                       <Label htmlFor="card" className="cursor-pointer">
//                         <div className="font-semibold text-gray-900">
//                           บัตรเครดิต/เดบิต
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           บัตรเครดิต/เดบิต
//                         </div>
//                       </Label>
//                       <div className="flex items-center gap-1 mt-2">
//                         <img
//                           src="/assets/mastercard-logo.svg"
//                           alt="Mastercard"
//                           className="h-4 w-auto"
//                         />
//                         <img
//                           src="/assets/jcb-logo.svg"
//                           alt="JCB"
//                           className="h-4 w-auto"
//                         />
//                         <img
//                           src="/assets/visa-logo.svg"
//                           alt="Visa"
//                           className="h-4 w-auto"
//                         />
//                       </div>
//                     </div>
//                     {paymentMethod === "card" && (
//                       <Check className="h-5 w-5 text-green-500" />
//                     )}
//                   </div>

//                   {/* QR PromptPay */}
//                   <div
//                     className={`flex items-center space-x-2 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors ${
//                       paymentMethod === "qr"
//                         ? "border-primary bg-primary/5"
//                         : "border-gray-200"
//                     }`}
//                   >
//                     <RadioGroupItem value="qr" id="qr" />
//                     <div className="bg-blue-100 p-2 rounded-lg">
//                       <QrCode className="h-6 w-6 text-blue-600" />
//                     </div>
//                     <Label
//                       htmlFor="qr"
//                       className="flex-1 cursor-pointer"
//                     >
//                       <div className="font-semibold text-gray-900">
//                         QR PromptPay
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         สแกน QR Code เพื่อชำระเงิน
//                       </div>
//                     </Label>
//                     {paymentMethod === "qr" && (
//                       <Check className="h-5 w-5 text-green-500" />
//                     )}
//                   </div>

//                   {/* วิธีชำระเงินอื่นที่ user เพิ่มจาก sheet */}
//                   {additionalPaymentMethods.map((method) => {
//                     const methodInfo = getPaymentMethodInfo(method);
//                     if (!methodInfo) return null;

//                     return (
//                       <div
//                         key={method}
//                         className={`flex items-center space-x-2 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors ${
//                           paymentMethod === method
//                             ? "border-primary bg-primary/5"
//                             : "border-gray-200"
//                         }`}
//                       >
//                         <RadioGroupItem value={method} id={method} />
//                         <div className={`${methodInfo.bgColor} p-2 rounded-lg`}>
//                           {methodInfo.icon}
//                         </div>
//                         <Label
//                           htmlFor={method}
//                           className="flex-1 cursor-pointer"
//                         >
//                           <div className="font-semibold text-gray-900">
//                             {methodInfo.name}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             {methodInfo.description}
//                           </div>
//                         </Label>
//                         {paymentMethod === method && (
//                           <Check className="h-5 w-5 text-green-500" />
//                         )}
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={(e) => {
//                             e.preventDefault();
//                             e.stopPropagation();
//                             handleRemovePaymentMethod(method);
//                           }}
//                           className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     );
//                   })}
//                 </RadioGroup>
//               </CardContent>
//             </Card>

//             {/* ใบกำกับภาษีและข้อมูลติดต่อ */}
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="flex items-center justify-between text-lg">
//                   ใบกำกับภาษีและข้อมูลติดต่อ
//                   <Sheet
//                     open={isInvoiceSheetOpen}
//                     onOpenChange={setIsInvoiceSheetOpen}
//                   >
//                     <SheetTrigger asChild>
//                       <Button variant="ghost" size="sm" className="text-primary">
//                         แก้ไข
//                       </Button>
//                     </SheetTrigger>
//                     <SheetContent
//                       side="right"
//                       className="w-[500px] max-w-full overflow-hidden"
//                     >
//                       <SheetHeader>
//                         <SheetTitle>ใบกำกับภาษีและข้อมูลติดต่อ</SheetTitle>
//                       </SheetHeader>

//                       <div className="mt-6 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
//                         {/* Email */}
//                         <div className="space-y-2">
//                           <Label
//                             htmlFor="invoice-email"
//                             className="text-sm font-medium"
//                           >
//                             * อีเมล
//                           </Label>
//                           <Input
//                             id="invoice-email"
//                             type="email"
//                             value={invoiceInfo.email}
//                             onChange={(e) =>
//                               setInvoiceInfo((prev) => ({
//                                 ...prev,
//                                 email: e.target.value,
//                               }))
//                             }
//                             placeholder="กรอกอีเมลเพื่อรับการอัปเดตสถานะการจัดส่ง"
//                           />
//                         </div>

//                         {/* Billing address */}
//                         <div className="space-y-2">
//                           <Label
//                             htmlFor="invoice-address"
//                             className="text-sm font-medium"
//                           >
//                             * ที่อยู่ในการออกใบกำกับภาษี
//                           </Label>
//                           <Textarea
//                             id="invoice-address"
//                             value={invoiceInfo.billingAddress}
//                             onChange={(e) =>
//                               setInvoiceInfo((prev) => ({
//                                 ...prev,
//                                 billingAddress: e.target.value,
//                               }))
//                             }
//                             rows={4}
//                             className="resize-none"
//                           />
//                           <p className="text-xs text-gray-500">
//                             คลิกเพื่อแก้ไขข้อมูลการเรียกเก็บเงินสำหรับการออกใบกำกับภาษี
//                             *กรุณา กรอกชื่อเต็มในช่องที่จำเป็น
//                           </p>
//                         </div>

//                         {/* Tax ID */}
//                         <div className="space-y-2">
//                           <Label
//                             htmlFor="invoice-taxId"
//                             className="text-sm font-medium"
//                           >
//                             เลขประจำตัวผู้เสียภาษี
//                           </Label>
//                           <Input
//                             id="invoice-taxId"
//                             value={invoiceInfo.taxId}
//                             onChange={(e) =>
//                               setInvoiceInfo((prev) => ({
//                                 ...prev,
//                                 taxId: e.target.value,
//                               }))
//                             }
//                             placeholder="กรุณากรอกเลขประจำตัวผู้เสียภาษีที่ถูกต้อง"
//                           />
//                           <p className="text-xs text-red-500">
//                             กรุณากรอกเลขประจำตัวผู้เสียภาษีเพื่อรับใบกำกับภาษี
//                           </p>
//                         </div>

//                         {/* Head office / branch */}
//                         <div className="space-y-2">
//                           <Label
//                             htmlFor="invoice-branch"
//                             className="text-sm font-medium"
//                           >
//                             รหัสสำนักงานใหญ่/สาขา (สำหรับบริษัท)
//                           </Label>
//                           <Input
//                             id="invoice-branch"
//                             value={invoiceInfo.headOfficeBranch}
//                             onChange={(e) =>
//                               setInvoiceInfo((prev) => ({
//                                 ...prev,
//                                 headOfficeBranch: e.target.value,
//                               }))
//                             }
//                             placeholder="กรุณากรอกสำนักงานใหญ่/สาขาเพื่อรับใบกำกับภาษี"
//                           />
//                         </div>
//                       </div>

//                       <div className="flex gap-3 mt-8">
//                         <Button
//                           variant="outline"
//                           className="flex-1"
//                           onClick={() => setIsInvoiceSheetOpen(false)}
//                         >
//                           ยกเลิก
//                         </Button>
//                         <Button
//                           className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
//                           onClick={handleSaveInvoiceInfo}
//                         >
//                           บันทึก
//                         </Button>
//                       </div>
//                     </SheetContent>
//                   </Sheet>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="text-sm">
//                   <p className="font-medium">Email</p>
//                   <p className="text-gray-600">{invoiceInfo.email}</p>
//                 </div>
//                 <div className="text-sm">
//                   <p className="font-medium">ที่อยู่ในการออกใบกำกับภาษี</p>
//                   <p className="text-gray-600 whitespace-pre-line">
//                     {invoiceInfo.billingAddress}
//                   </p>
//                 </div>
//                 {invoiceInfo.taxId && (
//                   <div className="text-sm">
//                     <p className="font-medium">เลขประจำตัวผู้เสียภาษี</p>
//                     <p className="text-gray-600">{invoiceInfo.taxId}</p>
//                   </div>
//                 )}
//                 {invoiceInfo.headOfficeBranch && (
//                   <div className="text-sm">
//                     <p className="font-medium">รหัสสำนักงานใหญ่/สาขา</p>
//                     <p className="text-gray-600">
//                       {invoiceInfo.headOfficeBranch}
//                     </p>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* Summary */}
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-lg">
//                   รายละเอียดคำสั่งซื้อ
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="flex justify-between text-sm">
//                   <span>ราคาสินค้า ({checkoutItems.length} รายการ)</span>
//                   <span>฿{subtotal.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span>ค่าจัดส่ง</span>
//                   <span className={shippingFee === 0 ? "text-green-600" : ""}>
//                     {shippingFee === 0
//                       ? "ฟรี"
//                       : `฿${shippingFee.toLocaleString()}`}
//                   </span>
//                 </div>
//                 {voucherDiscount > 0 && (
//                   <div className="flex justify-between text-sm">
//                     <span>ส่วนลดจากโค้ด</span>
//                     <span className="text-green-600">
//                       -฿{voucherDiscount.toLocaleString()}
//                     </span>
//                   </div>
//                 )}
//                 <Separator />
//                 <div className="flex justify-between font-bold text-lg">
//                   <span>ยอดรวมทั้งหมด</span>
//                   <span className="text-orange-600">
//                     ฿{total.toLocaleString()}
//                   </span>
//                 </div>
//                 <Button
//                   className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white"
//                   size="lg"
//                   onClick={handlePlaceOrder}
//                 >
//                   สั่งซื้อสินค้า
//                 </Button>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.2 ===============================================================

// // src/app/checkout/CheckoutClient.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// import {
//   ArrowLeft,
//   MapPin,
//   CreditCard,
//   Wallet,
//   Check,
//   QrCode,
//   Trash2,
//   Smartphone,
//   Building2,
//   ArrowLeftRight,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Textarea } from "@/components/ui/textarea";

// import type {
//   CheckoutItem,
//   CheckoutSummary,
//   CheckoutAddress,
//   CheckoutProfileInfo,
// } from "@/types/checkout";

// type Props = {
//   items: CheckoutItem[];
//   summary: CheckoutSummary;
//   shippingAddress: CheckoutAddress | null;
//   billingAddress: CheckoutAddress | null;
//   profileInfo?: CheckoutProfileInfo;
// };

// /**
//  * แปลง CheckoutItem → shape ที่ UI Mock เดิมใช้ (name, price, quantity, image)
//  */
// function mapItemsForUI(items: CheckoutItem[]) {
//   return items.map((i) => ({
//     id: i.cartId,
//     name: i.name,
//     price: i.unitPrice,
//     quantity: i.quantity,
//     image: i.imageUrl || "/assets/placeholder-product.png",
//   }));
// }

// export default function CheckoutClient({
//   items,
//   summary,
//   shippingAddress,
//   billingAddress,
//   profileInfo,
// }: Props) {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   // ====== สินค้าในคำสั่งซื้อ (จาก props) ======
//   const [checkoutItems, setCheckoutItems] = useState(() =>
//     mapItemsForUI(items)
//   );

//   // ====== วิธีชำระเงิน / voucher / etc. (ยังเป็น UI-only) ======
//   const [paymentMethod, setPaymentMethod] = useState<"card" | "qr" | string>(
//     "card"
//   );
//   const [voucherCode, setVoucherCode] = useState("");
//   const [appliedVouchers, setAppliedVouchers] = useState<
//     { code: string; discount: number }[]
//   >([]);
//   const [voucherError, setVoucherError] = useState("");
//   const [isPaymentMethodsOpen, setIsPaymentMethodsOpen] = useState(false);
//   const [additionalPaymentMethods, setAdditionalPaymentMethods] = useState<
//     string[]
//   >([]);

//   // ====== ข้อมูล invoice ======
//   const initialEmail = profileInfo?.email || "example@email.com";

//   const initialBillingText =
//     billingAddress?.address || shippingAddress?.address || "";

//   const [invoiceInfo, setInvoiceInfo] = useState({
//     email: initialEmail,
//     billingAddress: initialBillingText,
//     taxId: profileInfo?.taxId ?? "",
//     headOfficeBranch: "",
//   });
//   const [isInvoiceSheetOpen, setIsInvoiceSheetOpen] = useState(false);

//   // ====== ที่อยู่จัดส่ง (read-only) ======
//   const addressDisplay = shippingAddress
//     ? {
//         tag: shippingAddress.type,
//         name: shippingAddress.name,
//         phone: shippingAddress.phone,
//         address: shippingAddress.address,
//       }
//     : null;

//   // ====== Summary คำนวณซ้ำจาก state ปัจจุบัน (รองรับลบสินค้า/ voucher) ======
//   const subtotal = useMemo(
//     () =>
//       checkoutItems.reduce(
//         (sum, item) => sum + item.price * item.quantity,
//         0
//       ),
//     [checkoutItems]
//   );

//   const shippingFee = summary.shippingFee ?? 0; // ตอนนี้ 0 ไว้ก่อน
//   const voucherDiscount = appliedVouchers.reduce(
//     (sum, v) => sum + v.discount,
//     0
//   );
//   const total = subtotal + shippingFee - voucherDiscount;

//   // ====== handlers ======

//   const handleRemoveItem = (id: number) => {
//     setCheckoutItems((prev) => prev.filter((it) => it.id !== id));
//     // TODO: ผูกกับ API ลบจาก carts จริง เช่น /api/cart/remove
//   };

//   const handleApplyVoucher = () => {
//     if (!voucherCode.trim()) return;
//     setVoucherError("");

//     const mockVouchers: Record<string, { code: string; discount: number }> = {
//       SAVE100: { code: "SAVE100", discount: 100 },
//       DISCOUNT50: { code: "DISCOUNT50", discount: 50 },
//       FREESHIP: { code: "FREESHIP", discount: 65 },
//       VC0001: { code: "VC0001", discount: 100 },
//       VC0002: { code: "VC0002", discount: 200 },
//     };

//     const code = voucherCode.toUpperCase();
//     const voucher = mockVouchers[code];

//     if (!voucher) {
//       setVoucherError("โค้ดส่วนลดไม่ถูกต้อง");
//       return;
//     }

//     const already = appliedVouchers.some((v) => v.code === code);
//     if (already) {
//       setVoucherError("โค้ดนี้ถูกใช้แล้ว");
//       return;
//     }

//     setAppliedVouchers((prev) => [...prev, voucher]);
//     setVoucherCode("");
//   };

//   const handleRemoveVoucher = (code: string) => {
//     setAppliedVouchers((prev) => prev.filter((v) => v.code !== code));
//   };

//   const handleConfirmPaymentMethods = () => {
//     const methodsToAdd: string[] = [];
//     if (
//       paymentMethod === "linepay" &&
//       !additionalPaymentMethods.includes("linepay")
//     )
//       methodsToAdd.push("linepay");
//     if (
//       paymentMethod === "internetbanking" &&
//       !additionalPaymentMethods.includes("internetbanking")
//     )
//       methodsToAdd.push("internetbanking");
//     if (
//       paymentMethod === "banktransfer" &&
//       !additionalPaymentMethods.includes("banktransfer")
//     )
//       methodsToAdd.push("banktransfer");
//     if (paymentMethod === "cash" && !additionalPaymentMethods.includes("cod"))
//       methodsToAdd.push("cod");

//     setAdditionalPaymentMethods((prev) => [...prev, ...methodsToAdd]);
//     setIsPaymentMethodsOpen(false);
//   };

//   const handleRemovePaymentMethod = (method: string) => {
//     setAdditionalPaymentMethods((prev) => prev.filter((m) => m !== method));
//     if (paymentMethod === method) setPaymentMethod("card");
//   };

//   const handleSaveInvoiceInfo = () => {
//     setIsInvoiceSheetOpen(false);
//   };

//   const handlePlaceOrder = () => {
//     const paymentData = {
//       amount: total,
//       orderId: `ORDER-${Date.now()}`,
//       items: checkoutItems,
//       subtotal,
//       shippingFee,
//       voucherDiscount,
//       appliedVouchers,
//     };

//     if (typeof window !== "undefined") {
//       sessionStorage.setItem("paymentData", JSON.stringify(paymentData));
//     }

//     if (paymentMethod === "card") {
//       router.push("/payment/card");
//     } else if (paymentMethod === "qr") {
//       router.push("/payment/qr");
//     } else {
//       router.push("/payment/card");
//     }
//   };

//   const getPaymentMethodInfo = (method: string) => {
//     const methodsMap = {
//       linepay: {
//         icon: <Smartphone className="h-6 w-6 text-green-600" />,
//         bgColor: "bg-green-100",
//         name: "LINE Pay",
//         description: "เชื่อมต่อบัตรหรือเติมเงินก่อนช้อปปิ้ง",
//       },
//       internetbanking: {
//         icon: <Building2 className="h-6 w-6 text-blue-600" />,
//         bgColor: "bg-blue-100",
//         name: "Internet banking",
//         description: "เข้าสู่ระบบด้วยบัญชีธนาคารเพื่อชำระเงิน",
//       },
//       banktransfer: {
//         icon: <ArrowLeftRight className="h-6 w-6 text-purple-600" />,
//         bgColor: "bg-purple-100",
//         name: "โอนเงินผ่านธนาคาร",
//         description: "โอนเงินโดยตรงไปยังบัญชีของผู้ขาย",
//       },
//       cod: {
//         icon: <Wallet className="h-6 w-6 text-orange-600" />,
//         bgColor: "bg-orange-100",
//         name: "เก็บเงินปลายทาง",
//         description: "ชำระเมื่อสินค้าจัดส่งถึงปลายทาง",
//       },
//     } as const;

//     return methodsMap[method as keyof typeof methodsMap];
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
//         <div className="flex items-center gap-4 mb-6">
//           <Link href="/cart">
//             <Button variant="ghost" size="icon">
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//           </Link>
//           <h1 className="text-2xl font-bold">ชำระเงิน</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ====== ซ้าย: ที่อยู่ + รายการสินค้า ====== */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* ที่อยู่จัดส่ง */}
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="flex items-center gap-2 text-lg">
//                   <MapPin className="h-5 w-5" />
//                   ที่อยู่จัดส่ง
//                   <Link href="/profile" className="ml-auto">
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="text-primary"
//                     >
//                       แก้ไข
//                     </Button>
//                   </Link>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {addressDisplay ? (
//                   <div className="bg-orange-50 p-3 rounded border border-orange-200">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span
//                         className={`text-white text-xs px-2 py-1 rounded ${
//                           addressDisplay.tag === "HOME"
//                             ? "bg-orange-500"
//                             : "bg-blue-500"
//                         }`}
//                       >
//                         {addressDisplay.tag}
//                       </span>
//                       <span className="font-medium">
//                         {addressDisplay.name}
//                       </span>
//                       <span className="text-muted-foreground">
//                         {addressDisplay.phone}
//                       </span>
//                     </div>
//                     <p className="text-sm text-muted-foreground">
//                       {addressDisplay.address}
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="text-sm text-red-600">
//                     ยังไม่พบข้อมูลที่อยู่จัดส่ง กรุณากรอกในหน้า{" "}
//                     <Link href="/profile" className="underline">
//                       โปรไฟล์
//                     </Link>{" "}
//                     ก่อนทำการสั่งซื้อ
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* รายการสินค้า (ไม่แบ่งแพ็กเกจแล้ว) */}
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-lg">
//                   รายการสินค้าในคำสั่งซื้อ
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 {checkoutItems.length === 0 && (
//                   <p className="text-sm text-muted-foreground">
//                     ไม่มีสินค้าในคำสั่งซื้อ
//                   </p>
//                 )}

//                 {checkoutItems.map((item) => (
//                   <div
//                     key={item.id}
//                     className="border rounded-lg p-4 bg-gray-50"
//                   >
//                     <div className="flex gap-3">
//                       <img
//                         src={item.image}
//                         alt={item.name}
//                         className="w-16 h-16 object-cover rounded"
//                       />
//                       <div className="flex-1">
//                         <h3 className="font-medium text-sm">
//                           {item.name}
//                         </h3>
//                         <div className="flex justify-between items-center mt-2">
//                           <div className="text-orange-600 font-bold">
//                             ฿{item.price.toLocaleString()}
//                           </div>
//                           <div className="text-sm text-gray-600">
//                             จำนวน: {item.quantity}
//                           </div>
//                         </div>
//                       </div>

//                       <AlertDialog>
//                         <AlertDialogTrigger asChild>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </AlertDialogTrigger>
//                         <AlertDialogContent>
//                           <AlertDialogHeader>
//                             <AlertDialogTitle>
//                               ยืนยันการลบสินค้า
//                             </AlertDialogTitle>
//                             <AlertDialogDescription>
//                               คุณต้องการลบ "{item.name}" ออกจากรายการสั่งซื้อหรือไม่?
//                             </AlertDialogDescription>
//                           </AlertDialogHeader>
//                           <AlertDialogFooter>
//                             <AlertDialogCancel>
//                               ยกเลิก
//                             </AlertDialogCancel>
//                             <AlertDialogAction
//                               onClick={() => handleRemoveItem(item.id)}
//                               className="bg-red-600 hover:bg-red-700"
//                             >
//                               ลบ
//                             </AlertDialogAction>
//                           </AlertDialogFooter>
//                         </AlertDialogContent>
//                       </AlertDialog>
//                     </div>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           </div>

//           {/* ====== ขวา: Payment + Voucher + Invoice + Summary ====== */}
//           <div className="space-y-6">
//             {/* วิธีชำระเงิน */}
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-lg">เลือกวิธีชำระเงิน</CardTitle>
//                 <Sheet
//                   open={isPaymentMethodsOpen}
//                   onOpenChange={setIsPaymentMethodsOpen}
//                 >
//                   <SheetTrigger asChild>
                    
//                   </SheetTrigger>
//                   <SheetContent
//                     side="right"
//                     className="w-[500px] max-w-full overflow-hidden"
//                   >
//                     <SheetHeader>
//                       <SheetTitle>เลือกวิธีชำระเงิน</SheetTitle>
//                     </SheetHeader>

//                     <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
//                       <h3 className="text-sm font-medium text-gray-700">
//                         วิธีที่แนะนำ
//                       </h3>

//                       {/* แนะนำ: บัตรเครดิต/เดบิต */}
//                       <div
//                         className={`flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors cursor-pointer ${
//                           paymentMethod === "card"
//                             ? "border-primary bg-primary/5"
//                             : "border-gray-200"
//                         }`}
//                         onClick={() => setPaymentMethod("card")}
//                       >
//                         <div className="bg-blue-100 p-2 rounded-lg">
//                           <CreditCard className="h-6 w-6 text-blue-600" />
//                         </div>
//                         <div className="flex-1">
//                           <div className="font-medium text-gray-900">
//                             บัตรเครดิต/เดบิต
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             บัตรเครดิต/เดบิต
//                           </div>
//                           <div className="flex items-center gap-1 mt-1">
//                             <img
//                               src="/assets/mastercard-logo.svg"
//                               alt="Mastercard"
//                               className="h-4 w-auto"
//                             />
//                             <img
//                               src="/assets/jcb-logo.svg"
//                               alt="JCB"
//                               className="h-4 w-auto"
//                             />
//                             <img
//                               src="/assets/visa-logo.svg"
//                               alt="Visa"
//                               className="h-4 w-auto"
//                             />
//                           </div>
//                         </div>
//                         {paymentMethod === "card" && (
//                           <Check className="h-5 w-5 text-green-500" />
//                         )}
//                       </div>

//                       <Separator />

//                       <h3 className="text-sm font-medium text-gray-700">
//                         วิธีชำระเงินอื่น ๆ
//                       </h3>

//                       {/* เก็บเงินปลายทาง */}
//                       <div
//                         className={`flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors cursor-pointer ${
//                           paymentMethod === "cash"
//                             ? "border-primary bg-primary/5"
//                             : "border-gray-200"
//                         }`}
//                         onClick={() => setPaymentMethod("cash")}
//                       >
//                         <div className="bg-green-100 p-2 rounded-lg">
//                           <Wallet className="h-6 w-6 text-green-600" />
//                         </div>
//                         <div className="flex-1">
//                           <div className="font-medium text-gray-900">
//                             เก็บเงินปลายทาง
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             เก็บเงินปลายทาง
//                           </div>
//                         </div>
//                         {paymentMethod === "cash" && (
//                           <Check className="h-5 w-5 text-green-500" />
//                         )}
//                       </div>

//                       {/* QR PromptPay */}
//                       <div
//                         className={`flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors cursor-pointer ${
//                           paymentMethod === "qr"
//                             ? "border-primary bg-primary/5"
//                             : "border-gray-200"
//                         }`}
//                         onClick={() => setPaymentMethod("qr")}
//                       >
//                         <div className="bg-blue-100 p-2 rounded-lg">
//                           <QrCode className="h-6 w-6 text-blue-600" />
//                         </div>
//                         <div className="flex-1">
//                           <div className="font-medium text-gray-900">
//                             QR PromptPay
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             สแกน QR Code เพื่อชำระเงิน
//                           </div>
//                         </div>
//                         {paymentMethod === "qr" && (
//                           <Check className="h-5 w-5 text-green-500" />
//                         )}
//                       </div>

//                       {/* LINE Pay */}
//                       <div
//                         className={`flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors cursor-pointer ${
//                           paymentMethod === "linepay"
//                             ? "border-primary bg-primary/5"
//                             : "border-gray-200"
//                         }`}
//                         onClick={() => setPaymentMethod("linepay")}
//                       >
//                         <div className="bg-green-100 p-2 rounded-lg">
//                           <Smartphone className="h-6 w-6 text-green-600" />
//                         </div>
//                         <div className="flex-1">
//                           <div className="font-medium text-gray-900">
//                             LINE Pay
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             เชื่อมต่อบัตรหรือเติมเงินก่อนช้อปปิ้ง
//                           </div>
//                         </div>
//                         {paymentMethod === "linepay" && (
//                           <Check className="h-5 w-5 text-green-500" />
//                         )}
//                       </div>

//                       {/* Internet Banking */}
//                       <div
//                         className={`flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors cursor-pointer ${
//                           paymentMethod === "internetbanking"
//                             ? "border-primary bg-primary/5"
//                             : "border-gray-200"
//                         }`}
//                         onClick={() => setPaymentMethod("internetbanking")}
//                       >
//                         <div className="bg-blue-100 p-2 rounded-lg">
//                           <Building2 className="h-6 w-6 text-blue-600" />
//                         </div>
//                         <div className="flex-1">
//                           <div className="font-medium text-gray-900">
//                             Internet Banking
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             เข้าสู่ระบบด้วยบัญชีธนาคารเพื่อชำระเงิน
//                           </div>
//                         </div>
//                         {paymentMethod === "internetbanking" && (
//                           <Check className="h-5 w-5 text-green-500" />
//                         )}
//                       </div>

//                       {/* โอนเงินผ่านธนาคาร */}
//                       <div
//                         className={`flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors cursor-pointer ${
//                           paymentMethod === "banktransfer"
//                             ? "border-primary bg-primary/5"
//                             : "border-gray-200"
//                         }`}
//                         onClick={() => setPaymentMethod("banktransfer")}
//                       >
//                         <div className="bg-purple-100 p-2 rounded-lg">
//                           <ArrowLeftRight className="h-6 w-6 text-purple-600" />
//                         </div>
//                         <div className="flex-1">
//                           <div className="font-medium text-gray-900">
//                             โอนเงินผ่านธนาคาร
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             โอนเงินโดยตรงไปยังบัญชีของผู้ขาย
//                           </div>
//                         </div>
//                         {paymentMethod === "banktransfer" && (
//                           <Check className="h-5 w-5 text-green-500" />
//                         )}
//                       </div>
//                     </div>

//                     <div className="flex justify-end gap-2 mt-6">
//                       <Button
//                         variant="outline"
//                         onClick={() => setIsPaymentMethodsOpen(false)}
//                       >
//                         ยกเลิก
//                       </Button>
//                       <Button
//                         className="bg-orange-500 hover:bg-orange-600 text-white"
//                         onClick={handleConfirmPaymentMethods}
//                       >
//                         ยืนยัน
//                       </Button>
//                     </div>
//                   </SheetContent>
//                 </Sheet>
//               </CardHeader>

//               {/* กล่องวิธีหลัก (card / qr / etc) */}
//               <CardContent className="space-y-3">
//                 <RadioGroup
//                   value={paymentMethod}
//                   onValueChange={setPaymentMethod}
//                 >
//                   {/* บัตรเครดิต/เดบิต */}
//                   <div
//                     className={`flex items-center space-x-2 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors ${
//                       paymentMethod === "card"
//                         ? "border-primary bg-primary/5"
//                         : "border-gray-200"
//                     }`}
//                   >
//                     <RadioGroupItem value="card" id="card" />
//                     <div className="bg-blue-100 p-2 rounded-lg">
//                       <CreditCard className="h-6 w-6 text-blue-600" />
//                     </div>
//                     <div className="flex-1">
//                       <Label htmlFor="card" className="cursor-pointer">
//                         <div className="font-semibold text-gray-900">
//                           บัตรเครดิต/เดบิต
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           บัตรเครดิต/เดบิต
//                         </div>
//                       </Label>
//                       <div className="flex items-center gap-1 mt-2">
//                         <img
//                           src="/assets/mastercard-logo.svg"
//                           alt="Mastercard"
//                           className="h-4 w-auto"
//                         />
//                         <img
//                           src="/assets/jcb-logo.svg"
//                           alt="JCB"
//                           className="h-4 w-auto"
//                         />
//                         <img
//                           src="/assets/visa-logo.svg"
//                           alt="Visa"
//                           className="h-4 w-auto"
//                         />
//                       </div>
//                     </div>
//                     {paymentMethod === "card" && (
//                       <Check className="h-5 w-5 text-green-500" />
//                     )}
//                   </div>

//                   {/* QR PromptPay */}
//                   <div
//                     className={`flex items-center space-x-2 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors ${
//                       paymentMethod === "qr"
//                         ? "border-primary bg-primary/5"
//                         : "border-gray-200"
//                     }`}
//                   >
//                     <RadioGroupItem value="qr" id="qr" />
//                     <div className="bg-blue-100 p-2 rounded-lg">
//                       <QrCode className="h-6 w-6 text-blue-600" />
//                     </div>
//                     <Label
//                       htmlFor="qr"
//                       className="flex-1 cursor-pointer"
//                     >
//                       <div className="font-semibold text-gray-900">
//                         QR PromptPay
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         สแกน QR Code เพื่อชำระเงิน
//                       </div>
//                     </Label>
//                     {paymentMethod === "qr" && (
//                       <Check className="h-5 w-5 text-green-500" />
//                     )}
//                   </div>

//                   {/* วิธีชำระเงินอื่นที่ user เพิ่มจาก sheet */}
//                   {additionalPaymentMethods.map((method) => {
//                     const methodInfo = getPaymentMethodInfo(method);
//                     if (!methodInfo) return null;

//                     return (
//                       <div
//                         key={method}
//                         className={`flex items-center space-x-2 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors ${
//                           paymentMethod === method
//                             ? "border-primary bg-primary/5"
//                             : "border-gray-200"
//                         }`}
//                       >
//                         <RadioGroupItem value={method} id={method} />
//                         <div className={`${methodInfo.bgColor} p-2 rounded-lg`}>
//                           {methodInfo.icon}
//                         </div>
//                         <Label
//                           htmlFor={method}
//                           className="flex-1 cursor-pointer"
//                         >
//                           <div className="font-semibold text-gray-900">
//                             {methodInfo.name}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             {methodInfo.description}
//                           </div>
//                         </Label>
//                         {paymentMethod === method && (
//                           <Check className="h-5 w-5 text-green-500" />
//                         )}
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={(e) => {
//                             e.preventDefault();
//                             e.stopPropagation();
//                             handleRemovePaymentMethod(method);
//                           }}
//                           className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     );
//                   })}
//                 </RadioGroup>
//               </CardContent>
//             </Card>

//             {/* ใบกำกับภาษีและข้อมูลติดต่อ */}
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="flex items-center justify-between text-lg">
//                   ใบกำกับภาษีและข้อมูลติดต่อ
//                   <Sheet
//                     open={isInvoiceSheetOpen}
//                     onOpenChange={setIsInvoiceSheetOpen}
//                   >
//                     <SheetTrigger asChild>
//                       <Button variant="ghost" size="sm" className="text-primary">
//                         แก้ไข
//                       </Button>
//                     </SheetTrigger>
//                     <SheetContent
//                       side="right"
//                       className="w-[500px] max-w-full overflow-hidden"
//                     >
//                       <SheetHeader>
//                         <SheetTitle>ใบกำกับภาษีและข้อมูลติดต่อ</SheetTitle>
//                       </SheetHeader>

//                       <div className="mt-6 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
//                         {/* Email */}
//                         <div className="space-y-2">
//                           <Label
//                             htmlFor="invoice-email"
//                             className="text-sm font-medium"
//                           >
//                             * อีเมล
//                           </Label>
//                           <Input
//                             id="invoice-email"
//                             type="email"
//                             value={invoiceInfo.email}
//                             onChange={(e) =>
//                               setInvoiceInfo((prev) => ({
//                                 ...prev,
//                                 email: e.target.value,
//                               }))
//                             }
//                             placeholder="กรอกอีเมลเพื่อรับการอัปเดตสถานะการจัดส่ง"
//                           />
//                         </div>

//                         {/* Billing address */}
//                         <div className="space-y-2">
//                           <Label
//                             htmlFor="invoice-address"
//                             className="text-sm font-medium"
//                           >
//                             * ที่อยู่ในการออกใบกำกับภาษี
//                           </Label>
//                           <Textarea
//                             id="invoice-address"
//                             value={invoiceInfo.billingAddress}
//                             onChange={(e) =>
//                               setInvoiceInfo((prev) => ({
//                                 ...prev,
//                                 billingAddress: e.target.value,
//                               }))
//                             }
//                             rows={4}
//                             className="resize-none"
//                           />
//                           <p className="text-xs text-gray-500">
//                             คลิกเพื่อแก้ไขข้อมูลการเรียกเก็บเงินสำหรับการออกใบกำกับภาษี
//                             *กรุณา กรอกชื่อเต็มในช่องที่จำเป็น
//                           </p>
//                         </div>

//                         {/* Tax ID */}
//                         <div className="space-y-2">
//                           <Label
//                             htmlFor="invoice-taxId"
//                             className="text-sm font-medium"
//                           >
//                             เลขประจำตัวผู้เสียภาษี
//                           </Label>
//                           <Input
//                             id="invoice-taxId"
//                             value={invoiceInfo.taxId}
//                             onChange={(e) =>
//                               setInvoiceInfo((prev) => ({
//                                 ...prev,
//                                 taxId: e.target.value,
//                               }))
//                             }
//                             placeholder="กรุณากรอกเลขประจำตัวผู้เสียภาษีที่ถูกต้อง"
//                           />
//                           <p className="text-xs text-red-500">
//                             กรุณากรอกเลขประจำตัวผู้เสียภาษีเพื่อรับใบกำกับภาษี
//                           </p>
//                         </div>

//                         {/* Head office / branch */}
//                         <div className="space-y-2">
//                           <Label
//                             htmlFor="invoice-branch"
//                             className="text-sm font-medium"
//                           >
//                             รหัสสำนักงานใหญ่/สาขา (สำหรับบริษัท)
//                           </Label>
//                           <Input
//                             id="invoice-branch"
//                             value={invoiceInfo.headOfficeBranch}
//                             onChange={(e) =>
//                               setInvoiceInfo((prev) => ({
//                                 ...prev,
//                                 headOfficeBranch: e.target.value,
//                               }))
//                             }
//                             placeholder="กรุณากรอกสำนักงานใหญ่/สาขาเพื่อรับใบกำกับภาษี"
//                           />
//                         </div>
//                       </div>

//                       <div className="flex gap-3 mt-8">
//                         <Button
//                           variant="outline"
//                           className="flex-1"
//                           onClick={() => setIsInvoiceSheetOpen(false)}
//                         >
//                           ยกเลิก
//                         </Button>
//                         <Button
//                           className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
//                           onClick={handleSaveInvoiceInfo}
//                         >
//                           บันทึก
//                         </Button>
//                       </div>
//                     </SheetContent>
//                   </Sheet>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="text-sm">
//                   <p className="font-medium">Email</p>
//                   <p className="text-gray-600">{invoiceInfo.email}</p>
//                 </div>
//                 <div className="text-sm">
//                   <p className="font-medium">ที่อยู่ในการออกใบกำกับภาษี</p>
//                   <p className="text-gray-600 whitespace-pre-line">
//                     {invoiceInfo.billingAddress}
//                   </p>
//                 </div>
//                 {invoiceInfo.taxId && (
//                   <div className="text-sm">
//                     <p className="font-medium">เลขประจำตัวผู้เสียภาษี</p>
//                     <p className="text-gray-600">{invoiceInfo.taxId}</p>
//                   </div>
//                 )}
//                 {invoiceInfo.headOfficeBranch && (
//                   <div className="text-sm">
//                     <p className="font-medium">รหัสสำนักงานใหญ่/สาขา</p>
//                     <p className="text-gray-600">
//                       {invoiceInfo.headOfficeBranch}
//                     </p>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* Summary */}
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-lg">
//                   รายละเอียดคำสั่งซื้อ
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="flex justify-between text-sm">
//                   <span>ราคาสินค้า ({checkoutItems.length} รายการ)</span>
//                   <span>฿{subtotal.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span>ค่าจัดส่ง</span>
//                   <span className={shippingFee === 0 ? "text-green-600" : ""}>
//                     {shippingFee === 0
//                       ? "ฟรี"
//                       : `฿${shippingFee.toLocaleString()}`}
//                   </span>
//                 </div>
//                 {voucherDiscount > 0 && (
//                   <div className="flex justify-between text-sm">
//                     <span>ส่วนลดจากโค้ด</span>
//                     <span className="text-green-600">
//                       -฿{voucherDiscount.toLocaleString()}
//                     </span>
//                   </div>
//                 )}
//                 <Separator />
//                 <div className="flex justify-between font-bold text-lg">
//                   <span>ยอดรวมทั้งหมด</span>
//                   <span className="text-orange-600">
//                     ฿{total.toLocaleString()}
//                   </span>
//                 </div>
//                 <Button
//                   className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white"
//                   size="lg"
//                   onClick={handlePlaceOrder}
//                 >
//                   สั่งซื้อสินค้า
//                 </Button>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


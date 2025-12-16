// v.1.1.4 ===============================================================
// src/app/api/checkout/place-order/route.ts

import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import { prismaShop, setShopSessionTZ } from "@/lib/db";
import { CheckoutService } from "@/services/checkout/checkout.service";
import { CURRENT_EVENT_SALE } from "@/services/cart/cart.helpers";
import { nowTH } from "@/lib/time";

/* ============================================
 * helper: ดึง customerId จาก JWT (เหมือน /api/profile)
 * ============================================ */
function getCustomerId(req: NextRequest): bigint | null {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyAuthToken(token);
  if (!payload?.sub) return null;

  try {
    return BigInt(payload.sub);
  } catch {
    return null;
  }
}

/* ============================================
 * helper: สร้าง ref_inv แบบ SOE-25-00001
 * ใช้เวลาไทย (+07:00) ผ่าน nowTH()
 * ============================================ */
async function generateRefInv() {
  // ตั้ง timezone ของ session ให้ตรงกับไทย (ถ้า function รองรับ)
  try {
    await setShopSessionTZ("+07:00");
  } catch {
    // ถ้าตั้งไม่ได้ก็ไม่เป็นไร อย่างน้อยเราบวก 7 ชั่วโมงเองแล้ว
  }

  const now = nowTH();
  const year2 = now.getFullYear().toString().slice(-2); // "25"

  // หา row ของ section = "ref_inv"
  let counter = await prismaShop.counts.findFirst({
    where: { section: "ref_inv" },
  });

  if (!counter) {
    counter = await prismaShop.counts.create({
      data: {
        section: "ref_inv",
        count: 0,
        note: "auto created by Next.js",
        created_at: now,
        updated_at: now,
      },
    });
  }

  const nextCount = counter.count + 1;
  const padded = String(nextCount).padStart(5, "0"); // 1 -> "00001"

  const refInv = `SOE-${year2}-${padded}`;

  await prismaShop.counts.update({
    where: { id: counter.id },
    data: {
      count: nextCount,
      updated_at: now,
    },
  });

  return refInv;
}

/* ============================================
 * POST /api/checkout/place-order
 * ทำตัวให้เหมือน makeBuy ของ Laravel
 * ============================================ */

export async function POST(req: NextRequest) {
  const customerId = getCustomerId(req);
  if (!customerId) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHENTICATED" },
      { status: 401 },
    );
  }

  let body: {
    paymentMethod?: string;
    shippingAddressId?: number | null;
    billingAddressId?: number | null;
    profileMode?: string | null;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_JSON" },
      { status: 400 },
    );
  }

  const paymentMethod = (body.paymentMethod ?? "card") as
    | "card"
    | "qr"
    | "cash"
    | "linepay"
    | "internetbanking"
    | "banktransfer";

  // 1) โหลดข้อมูล checkout ปัจจุบัน (cart + profile)
  const checkoutData = await CheckoutService.getCheckoutData(customerId);
  const items = checkoutData.items ?? [];

  if (!items.length) {
    return NextResponse.json(
      { ok: false, error: "EMPTY_CART" },
      { status: 400 },
    );
  }

  // 2) คำนวณยอด amount
  //    - ถ้ามี summary -> subtotal + shippingFee - discount
  //    - ถ้า summary เป็น 0 หรือไม่มี -> fallback รวมจาก items
  const summary = checkoutData.summary;

  const amountFromSummary =
    (summary?.subtotal ?? 0) +
    (summary?.shippingFee ?? 0) -
    (summary?.discount ?? 0);

  const amountFromItems = items.reduce((sum, it) => {
    const line =
      typeof it.lineTotal === "number"
        ? it.lineTotal
        : it.price * it.quantity;
    return sum + line;
  }, 0);

  const amount = amountFromSummary > 0 ? amountFromSummary : amountFromItems;

  // ==========================
  // กรณีบัตรเครดิต/เดบิต (paycard)
  // -> เหมือน Laravel: แค่เปิดหน้า makebuy_card
  //    ยังไม่ create ref_inv / inv
  // ==========================
  if (paymentMethod === "card") {
    return NextResponse.json(
      {
        ok: true,
        paymentMethod: "card",
        amount,
        refInv: null,
        orderId: null,
      },
      { status: 200 },
    );
  }

  // ==========================
  // กรณี QR PromptPay (payqr)
  // -> เหมือน Laravel:
  //    - gen ref_inv จาก counts
  //    - insert ref_to_invs
  //    - insert inv
  //    - call API ธนาคาร (mock ด้วย FastAPI)
  // ==========================

  if (paymentMethod === "qr") {
    const now = nowTH(); // เวลาไทย
    const cid = customerId;

    // 1) gen ref_inv + update counts
    const refInv = await generateRefInv();

    // 2) เตรียม payload ส่งให้ KBank (หรือ FastAPI mock)
    const dataSend = {
      amount: amount.toFixed(2), // string, เช่น "342.00"
      currency: "THB",
      description: `Interlink Shop Pay Thai QR By CustomerID: ${cid.toString()}`,
      source_type: "qr",
      reference_order: refInv,
    };

    // 3) insert ref_to_invs
    await prismaShop.ref_to_invs.create({
      data: {
        ref_inv: refInv,
        inv: null,
        chrg_id: "",
        created_at: now,
        updated_at: now,
      },
    });

    // 4) insert inv
    await prismaShop.inv.create({
      data: {
        inv: null,
        chrg_id: "",
        data_checkout: JSON.stringify(dataSend),
        data_sales_header: "",
        data_sales_line: "",
        inv_status: false,
        reserve: false,
        created_at: now,
        updated_at: now,
        id__customers: cid,
        event_sale: CURRENT_EVENT_SALE,
        ref_inv: refInv,
        resp_InsertSalesHeader: null,
        resp_InsertSalesLine: null,
        resp_ReleaseSalesInvoice: null,
        resp_PostSalesInvoice: null,
        complete: false,
        lead_time: "",
      },
    });

    // 5) call FastAPI mock (แทน KBank จริง)
    let orderId: string | null = null;
    try {
      const bankRes = await fetch("http://127.0.0.1:8000/simulate-payment-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataSend),
      });

      if (bankRes.ok) {
        const j: any = await bankRes.json();
        orderId = j?.id ?? j?.order_id ?? null;
      }
    } catch (err) {
      console.error("[checkout.place-order] bank API error =", err);
      // เหมือน Laravel: ถ้าไม่มี order_id ก็ยังไปหน้า makebuy_qr ได้
    }

    return NextResponse.json(
      {
        ok: true,
        paymentMethod: "qr",
        amount,
        refInv,
        orderId,
      },
      { status: 200 },
    );
  }

  // method อื่น ๆ (ยังไม่รองรับจริง) -> ตอนนี้ทำเหมือน card ไปก่อน
  return NextResponse.json(
    {
      ok: true,
      paymentMethod,
      amount,
      refInv: null,
      orderId: null,
    },
    { status: 200 },
  );
}

// v.1.1.4 ===============================================================

// v.1.1.3 ===============================================================
// // src/app/api/checkout/place-order/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
// import { prismaShop, setShopSessionTZ } from "@/lib/db";
// import { CheckoutService } from "@/services/checkout/checkout.service";
// import { CURRENT_EVENT_SALE } from "@/services/cart/cart.helpers";

// /* ============================================
//  * helper: ดึง customerId จาก JWT (เหมือน /api/profile)
//  * ============================================ */
// function getCustomerId(req: NextRequest): bigint | null {
//   const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
//   if (!token) return null;

//   const payload = verifyAuthToken(token);
//   if (!payload?.sub) return null;

//   try {
//     return BigInt(payload.sub);
//   } catch {
//     return null;
//   }
// }

// /* ============================================
//  * helper: สร้าง ref_inv แบบ SOE-25-00001
//  * ============================================ */
// async function generateRefInv() {
//   await setShopSessionTZ();

//   const now = new Date();
//   const year2 = now.getFullYear().toString().slice(-2); // "25"

//   // หา row ของ section = "ref_inv"
//   let counter = await prismaShop.counts.findFirst({
//     where: { section: "ref_inv" },
//   });

//   if (!counter) {
//     counter = await prismaShop.counts.create({
//       data: {
//         section: "ref_inv",
//         count: 0,
//         note: "auto created by Next.js",
//         created_at: now,
//         updated_at: now,
//       },
//     });
//   }

//   const nextCount = counter.count + 1;
//   const padded = String(nextCount).padStart(5, "0"); // 1 -> "00001"

//   const refInv = `SOE-${year2}-${padded}`;

//   await prismaShop.counts.update({
//     where: { id: counter.id },
//     data: {
//       count: nextCount,
//       updated_at: now,
//     },
//   });

//   return refInv;
// }

// /* ============================================
//  * POST /api/checkout/place-order
//  * ทำตัวให้เหมือน makeBuy ของ Laravel
//  * ============================================ */

// export async function POST(req: NextRequest) {
//   const customerId = getCustomerId(req);
//   if (!customerId) {
//     return NextResponse.json(
//       { ok: false, error: "UNAUTHENTICATED" },
//       { status: 401 },
//     );
//   }

//   let body: {
//     paymentMethod?: string;
//     shippingAddressId?: number | null;
//     billingAddressId?: number | null;
//     profileMode?: string | null;
//   };

//   try {
//     body = await req.json();
//   } catch {
//     return NextResponse.json(
//       { ok: false, error: "INVALID_JSON" },
//       { status: 400 },
//     );
//   }

//   const paymentMethod = (body.paymentMethod ?? "card") as
//     | "card"
//     | "qr"
//     | "cash"
//     | "linepay"
//     | "internetbanking"
//     | "banktransfer";

//   // 1) โหลดข้อมูล checkout ปัจจุบัน (cart + profile)
//   const checkoutData = await CheckoutService.getCheckoutData(customerId);
//   const items = checkoutData.items ?? [];

//   if (!items.length) {
//     return NextResponse.json(
//       { ok: false, error: "EMPTY_CART" },
//       { status: 400 },
//     );
//   }

//   // 2) คำนวณยอด amount
//   //    - ถ้ามี summary -> subtotal + shippingFee - discount
//   //    - ถ้า summary เป็น 0 หรือไม่มี -> fallback รวมจาก items
//   const summary = checkoutData.summary;

//   const amountFromSummary =
//     (summary?.subtotal ?? 0) +
//     (summary?.shippingFee ?? 0) -
//     (summary?.discount ?? 0);

//   const amountFromItems = items.reduce((sum, it) => {
//     const line =
//       typeof it.lineTotal === "number"
//         ? it.lineTotal
//         : it.price * it.quantity;
//     return sum + line;
//   }, 0);

//   const amount = amountFromSummary > 0 ? amountFromSummary : amountFromItems;

//   // ==========================
//   // กรณีบัตรเครดิต/เดบิต (paycard)
//   // -> เหมือน Laravel: แค่เปิดหน้า makebuy_card
//   //    ยังไม่ create ref_inv / inv
//   // ==========================
//   if (paymentMethod === "card") {
//     return NextResponse.json(
//       {
//         ok: true,
//         paymentMethod: "card",
//         amount,
//         refInv: null,
//         orderId: null,
//       },
//       { status: 200 },
//     );
//   }

//   // ==========================
//   // กรณี QR PromptPay (payqr)
//   // -> เหมือน Laravel:
//   //    - gen ref_inv จาก counts
//   //    - insert ref_to_invs
//   //    - insert inv
//   //    - call API ธนาคาร (mock ด้วย FastAPI)
//   // ==========================

//   if (paymentMethod === "qr") {
//     const now = new Date();
//     const cid = customerId;

//     // 1) gen ref_inv + update counts
//     const refInv = await generateRefInv();

//     // 2) เตรียม payload ส่งให้ KBank (หรือ FastAPI mock)
//     const dataSend = {
//       amount: amount.toFixed(2), // string, เช่น "342.00"
//       currency: "THB",
//       description: `Interlink Shop Pay Thai QR By CustomerID: ${cid.toString()}`,
//       source_type: "qr",
//       reference_order: refInv,
//     };

//     // 3) insert ref_to_invs
//     await prismaShop.ref_to_invs.create({
//       data: {
//         ref_inv: refInv,
//         inv: null,
//         chrg_id: "",
//         created_at: now,
//         updated_at: now,
//       },
//     });

//     // 4) insert inv
//     await prismaShop.inv.create({
//       data: {
//         inv: null,
//         chrg_id: "",
//         data_checkout: JSON.stringify(dataSend),
//         data_sales_header: "",
//         data_sales_line: "",
//         inv_status: false,
//         reserve: false,
//         created_at: now,
//         updated_at: now,
//         id__customers: cid,
//         event_sale: CURRENT_EVENT_SALE,
//         ref_inv: refInv,
//         resp_InsertSalesHeader: null,
//         resp_InsertSalesLine: null,
//         resp_ReleaseSalesInvoice: null,
//         resp_PostSalesInvoice: null,
//         complete: false,
//         lead_time: "",
//       },
//     });

//     // 5) call FastAPI mock (แทน KBank จริง)
//     let orderId: string | null = null;
//     try {
//       const bankRes = await fetch("http://127.0.0.1:8000/simulate-payment-qr", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(dataSend),
//       });

//       if (bankRes.ok) {
//         const j: any = await bankRes.json();
//         orderId = j?.id ?? j?.order_id ?? null;
//       }
//     } catch (err) {
//       console.error("[checkout.place-order] bank API error =", err);
//       // เหมือน Laravel: ถ้าไม่มี order_id ก็ยังไปหน้า makebuy_qr ได้
//     }

//     return NextResponse.json(
//       {
//         ok: true,
//         paymentMethod: "qr",
//         amount,
//         refInv,
//         orderId,
//       },
//       { status: 200 },
//     );
//   }

//   // method อื่น ๆ (ยังไม่รองรับจริง) -> ตอนนี้ทำเหมือน card ไปก่อน
//   return NextResponse.json(
//     {
//       ok: true,
//       paymentMethod,
//       amount,
//       refInv: null,
//       orderId: null,
//     },
//     { status: 200 },
//   );
// }


// v.1.1.3 ===============================================================

// v.1.1.2 ===============================================================
// // src/app/api/checkout/place-order/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
// import { CheckoutService } from "@/services/checkout/checkout.service";
// import type { PaymentMethod } from "@/types/checkout";

// /** ดึง customerId จาก JWT (เหมือน profile route) */
// function getCustomerId(req: NextRequest): bigint | null {
//   const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
//   if (!token) return null;

//   const payload = verifyAuthToken(token);
//   if (!payload?.sub) return null;

//   try {
//     return BigInt(payload.sub);
//   } catch {
//     return null;
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     const customerId = getCustomerId(req);
//     if (!customerId) {
//       return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
//     }

//     const body = await req.json().catch(() => null);
//     if (!body) {
//       return NextResponse.json(
//         { ok: false, error: "INVALID_JSON" },
//         { status: 400 }
//       );
//     }

//     const {
//       paymentMethod,
//       shippingAddressId,
//       billingAddressId,
//       profileMode,
//     } = body as {
//       paymentMethod: PaymentMethod;
//       shippingAddressId?: number | null;
//       billingAddressId?: number | null;
//       profileMode?: string | null;
//     };

//     if (!paymentMethod) {
//       return NextResponse.json(
//         { ok: false, error: "paymentMethod is required" },
//         { status: 400 }
//       );
//     }

//     console.log("[place-order] customerId =", customerId.toString());
//     console.log("[place-order] body =", body);

//     // ✅ ทำงานเหมือน makeBuy (ส่วน gen ref_inv + inv + call KBank mock)
//     const result = await CheckoutService.createPaymentSession(
//       customerId,
//       paymentMethod
//     );

//     console.log("[place-order] createPaymentSession result =", result);

//     return NextResponse.json(
//       {
//         ok: true,
//         paymentMethod: result.paymentMethod,
//         amount: result.amount,
//         refInv: result.refInv,
//         invId: result.invId,
//         orderId: result.orderId,
//         itemForLeadTime: result.itemForLeadTime,
//         mockResponse: result.rawResponse,

//         // เผื่ออยาก debug ตาม user context
//         shippingAddressId: shippingAddressId ?? null,
//         billingAddressId: billingAddressId ?? null,
//         profileMode: profileMode ?? null,
//       },
//       { status: 200 }
//     );
//   } catch (err: any) {
//     console.error("[place-order] error:", err);

//     return NextResponse.json(
//       {
//         ok: false,
//         error: err?.message ?? "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }

// v.1.1.2 ===============================================================

// // src/app/api/checkout/place-order/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { CheckoutService } from "@/services/checkout/checkout.service";

// // TODO: ดึง customerId จาก auth จริง (JWT / cookie / session)
// function getMockCustomerId(): number {
//   return 1; // ชั่วคราว
// }

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json().catch(() => null);

//     if (!body) {
//       return NextResponse.json(
//         { error: "Invalid JSON body" },
//         { status: 400 }
//       );
//     }

//     const {
//       paymentMethod,
//       shippingAddressId,
//       billingAddressId,
//       profileMode,
//     } = body;

//     if (!paymentMethod) {
//       return NextResponse.json(
//         { error: "paymentMethod is required" },
//         { status: 400 }
//       );
//     }

//     console.log("[place-order] body =", body);

//     // 1) หา customer ID (mock)
//     const customerId = getMockCustomerId();
//     console.log("[place-order] using customerId =", customerId);

//     // 2) เรียก service ให้ทำงานเหมือน makeBuy ของ Laravel
//     const result = await CheckoutService.createPaymentSession(
//       customerId,
//       paymentMethod
//     );

//     console.log("[place-order] createPaymentSession result =", result);

//     // 3) เตรียม response ให้หน้า UI ใช้ redirect ไป payment page
//     return NextResponse.json(
//       {
//         ok: true,
//         paymentMethod: result.paymentMethod,
//         amount: result.amount,
//         refInv: result.refInv,
//         invId: result.invId,
//         orderId: result.orderId,
//         itemForLeadTime: result.itemForLeadTime,
//         mockResponse: result.rawResponse,
//       },
//       { status: 200 }
//     );
//   } catch (err: any) {
//     console.error("[place-order] error:", err);

//     return NextResponse.json(
//       {
//         ok: false,
//         error: err?.message ?? "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }

// src/app/api/payment/card/route.ts

import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import { prismaShop, setShopSessionTZ } from "@/lib/db";
import { CheckoutService } from "@/services/checkout/checkout.service";
import { CURRENT_EVENT_SALE } from "@/services/cart/cart.helpers";
import { nowTH } from "@/lib/time";

/* ดึง customerId จาก JWT */
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

/* gen ref_inv แบบ SOE-25-00001 */
async function generateRefInv() {
  try {
    await setShopSessionTZ("+07:00");
  } catch {
    // ถ้าตั้ง TZ ไม่ได้ก็ปล่อยไป (เราใช้ nowTH อยู่แล้ว)
  }

  const now = nowTH();
  const year2 = now.getFullYear().toString().slice(-2);

  let counter = await prismaShop.counts.findFirst({
    where: { section: "ref_inv" },
  });

  if (!counter) {
    counter = await prismaShop.counts.create({
      data: {
        section: "ref_inv",
        count: 0,
        note: "auto created by Next.js (card payment)",
        created_at: now,
        updated_at: now,
      },
    });
  }

  const nextCount = counter.count + 1;
  const padded = String(nextCount).padStart(5, "0");

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

/* POST /api/payment/card  → กด Pay Now ด้วยบัตร */
export async function POST(req: NextRequest) {
  const customerId = getCustomerId(req);
  if (!customerId) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHENTICATED" },
      { status: 401 },
    );
  }

  // โหลด checkout ปัจจุบันเพื่อคำนวณยอด (กัน user แก้ amount เอง)
  const checkoutData = await CheckoutService.getCheckoutData(customerId);
  const items = checkoutData.items ?? [];
  if (!items.length) {
    return NextResponse.json(
      { ok: false, error: "EMPTY_CART" },
      { status: 400 },
    );
  }

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

  const now = nowTH();
  const cid = customerId;

  // 1) gen ref_inv
  const refInv = await generateRefInv();

  // 2) payload ส่งให้ธนาคาร (mock)
  const dataSend = {
    amount: amount.toFixed(2),
    currency: "THB",
    description: `Interlink Shop Pay Card By CustomerID: ${cid.toString()}`,
    source_type: "card",
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
  let bankStatus: string | null = null;
  let bankRaw: any = null;

  try {
    const bankRes = await fetch("http://127.0.0.1:8000/simulate-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataSend),
    });

    if (bankRes.ok) {
      bankRaw = await bankRes.json();
      bankStatus = bankRaw?.status ?? null;
    }
  } catch (err) {
    console.error("[payment.card] bank API error =", err);
  }

  return NextResponse.json(
    {
      ok: true,
      amount,
      refInv,
      bankStatus,
      bankRaw,
    },
    { status: 200 },
  );
}

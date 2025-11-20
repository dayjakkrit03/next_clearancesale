// src/app/api/cart/reserve/add/route.ts

import { NextRequest, NextResponse } from "next/server";
import type { AddToCartRequest, AddToCartResponse } from "@/types/cart";
import { CURRENT_EVENT_SALE, normalizeQuantity } from "@/services/cart/cart.helpers";
import { upsertCartItem } from "@/services/cart/cart.crud";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AddToCartRequest | null;

    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { product, uom, quantity, price } = body;

    // อ่าน customerId จาก JWT cookie
    const cookie = req.cookies.get(AUTH_COOKIE_NAME);
    let customerId: number | null = null;

    if (cookie?.value) {
      const tokenPayload = verifyAuthToken(cookie.value);
      if (tokenPayload?.sub) {
        customerId = Number(tokenPayload.sub);
      }
    }

    // ถ้าไม่ login → ทำเหมือน Laravel: return "login"
    if (!customerId) {
      const resp: AddToCartResponse = { status: "login" };
      return NextResponse.json(resp, { status: 200 });
    }

    const qty = normalizeQuantity(quantity);

    // ถ้า qty <= 0 ไม่ต้องเพิ่มของ
    if (qty <= 0) {
      const resp: AddToCartResponse = { status: "sold-out" };
      return NextResponse.json(resp, { status: 200 });
    }

    // ✅ reserve-add ไม่เช็ค Navision / ItemAvail2
    // เขียนลงตะกร้าโดยตั้ง reserve = 1
    await upsertCartItem({
      customerId,
      product,
      quantity: qty,
      uom,
      price,
      eventSale: CURRENT_EVENT_SALE,
      reserve: 1,
    });

    const resp: AddToCartResponse = { status: "success" };
    return NextResponse.json(resp, { status: 200 });
  } catch (e) {
    console.error("[api/cart/reserve/add] error", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

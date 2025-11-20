// src/app/api/debug/cart/add/route.ts

import { NextResponse } from "next/server";
import { addToCartService } from "@/services/cart";
import type { AddToCartRequest } from "@/types/cart";

/**
 * DEBUG ONLY:
 * ทดสอบ addToCartService แบบง่าย ๆ ด้วยการยิง GET
 *
 * ตัวอย่างเรียกจาก Postman:
 * GET http://localhost:3000/api/debug/cart/add
 *   ?product=US-9015LSZH
 *   &uom=BX.
 *   &qty=1
 *   &price=2160
 *   &customerId=753
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  const product = searchParams.get("product") ?? "";
  const uom = searchParams.get("uom") ?? "";
  const qtyParam = searchParams.get("qty");
  const priceParam = searchParams.get("price");
  const customerIdParam = searchParams.get("customerId");

  const quantity = qtyParam ? Number(qtyParam) : 1;
  const price = priceParam ? Number(priceParam) : 0;

  const customerId =
    customerIdParam && !Number.isNaN(Number(customerIdParam))
      ? Number(customerIdParam)
      : null;

  if (!product || !uom) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing required query params: product, uom",
        example:
          "/api/debug/cart/add?product=US-9015LSZH&uom=BX.&qty=1&price=2160&customerId=753",
      },
      { status: 400 }
    );
  }

  const payload: AddToCartRequest = {
    product,
    uom,
    quantity,
    price,
  };

  try {
    const result = await addToCartService({
      customerId,
      payload,
      // ใช้ event sale ค่า default = CURRENT_EVENT_SALE ใน cart.helpers.ts
    });

    return NextResponse.json({
      ok: true,
      input: {
        product,
        uom,
        quantity,
        price,
        customerId,
      },
      result,
    });
  } catch (err: any) {
    console.error("[debug cart/add] error", err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}

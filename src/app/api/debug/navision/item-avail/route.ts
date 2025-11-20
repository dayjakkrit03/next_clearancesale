// src/app/api/debug/navision/item-avail/route.ts
import { NextResponse } from "next/server";
import { debugCheckItemAvail2 } from "@/services/cart";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const product = searchParams.get("product");
  const uom = searchParams.get("uom") ?? "M"; // ตั้งค่า default UOM ตามที่คุณใช้จริง
  const customerIdParam = searchParams.get("customerId");

  const customerId =
    customerIdParam != null && customerIdParam !== ""
      ? Number(customerIdParam)
      : null;

  if (!product) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing product. ใช้รูปแบบ ?product=SKU&uom=M&customerId=123",
      },
      { status: 400 }
    );
  }

  try {
    const inventories = await debugCheckItemAvail2({
      product,
      uom,
      customerId: Number.isFinite(customerId as number) ? (customerId as number) : null,
    });

    return NextResponse.json({
      ok: true,
      product,
      uom,
      customerId,
      inventories,
    });
  } catch (err) {
    console.error("[debug-navision] error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: (err as Error).message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}

// src/app/api/cart/list/route.ts

import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import { prismaShop, setShopSessionTZ } from "@/lib/db";
import { CURRENT_EVENT_SALE, mapCartRowToCartItem } from "@/services/cart/cart.helpers";
import type { CartItem } from "@/types/cart";

export async function GET(req: NextRequest) {
  try {
    // ============================
    //   อ่าน reserve จาก query
    // ============================
    const url = new URL(req.url);
    const reserveParam = url.searchParams.get("reserve");

    // รองรับหลายรูปแบบ:
    //   - ไม่ส่ง    → reserve = 0
    //   - "reserve" → reserve = 1  (แนว Laravel เดิม)
    //   - "1"/"true" → reserve = 1
    let reserve: 0 | 1 = 0;
    if (
      reserveParam === "reserve" ||
      reserveParam === "1" ||
      reserveParam === "true"
    ) {
      reserve = 1;
    }

    // ============================
    //   ตรวจสอบ JWT จาก cookie
    // ============================
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value || null;

    let customerId: number | null = null;
    if (token) {
      const decoded = verifyAuthToken(token);
      if (decoded?.sub) {
        customerId = Number(decoded.sub);
      }
    }

    if (!customerId) {
      // ทำเหมือนฝั่ง add: ส่งสถานะ "login" ให้ frontend ไป redirect เอง
      return NextResponse.json(
        { status: "login" },
        { status: 200 }
      );
    }

    // ============================
    //   ดึงข้อมูลจาก carts
    // ============================
    await setShopSessionTZ();

    const rows = await prismaShop.carts.findMany({
      where: {
        id__customers: BigInt(customerId),
        cart_status: 0,
        reserve,
        event_sale: CURRENT_EVENT_SALE as any,
      },
      orderBy: {
        id: "asc",
      },
    });

    const items: CartItem[] = rows.map((row) =>
      mapCartRowToCartItem(row as any)
    );

    const checkAll =
      items.length > 0 && items.every((item) => item.check_product === true);

    return NextResponse.json(
      {
        status: "ok",
        items,
        checkAll,
        reserve,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[api/cart/list] ERROR", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err?.message },
      { status: 500 }
    );
  }
}

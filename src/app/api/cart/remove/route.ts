// src/app/api/cart/remove/route.ts

import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import { prismaShop, setShopSessionTZ } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids } = body ?? {};

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid ids" },
        { status: 400 }
      );
    }

    // ================================
    //   ตรวจสอบ token และ customerId
    // ================================
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value || null;
    let customerId: number | null = null;

    if (token) {
      const decoded = verifyAuthToken(token);
      if (decoded?.sub) {
        customerId = Number(decoded.sub);
      }
    }

    if (!customerId) {
      return NextResponse.json(
        { status: "login" },
        { status: 200 }
      );
    }

    // ================================
    //   Update cart_status = 3
    // ================================
    await setShopSessionTZ();

    await prismaShop.carts.updateMany({
      where: {
        id__customers: BigInt(customerId),
        id: {
          in: ids.map((x: number | string) => BigInt(x)),
        },
        cart_status: 0,
      },
      data: {
        cart_status: 3,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(
      { status: "success" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[api/cart/remove] ERROR", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err?.message },
      { status: 500 }
    );
  }
}

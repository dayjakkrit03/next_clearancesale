// src/app/api/cart/update/route.ts

import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";

import { prismaShop, setShopSessionTZ } from "@/lib/db";
import {
  CURRENT_EVENT_SALE,
  normalizeQuantity,
  calcPriceAmount,
  mapCartRowToCartItem,
} from "@/services/cart/cart.helpers";

import { findCartRowForCustomerProduct } from "@/services/cart/cart.query";
import { clearExpiredLockOrders } from "@/services/cart/cart.crud";
import { debugCheckItemAvail2 } from "@/services/cart/cart.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product, uom, quantity } = body ?? {};

    if (!product || !uom || quantity == null) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // ============================
    //   อ่าน token จาก cookie
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
      return NextResponse.json(
        { status: "login" },
        { status: 200 }
      );
    }

    // ============================
    //  Normalized quantity
    // ============================
    const qty = normalizeQuantity(quantity);
    if (qty <= 0) {
      return NextResponse.json(
        { status: "invalid-qty" },
        { status: 200 }
      );
    }

    // ============================
    //   หา cart row เดิม
    // ============================
    const existing = await findCartRowForCustomerProduct({
      customerId,
      product,
      reserve: 0,
    });

    if (!existing) {
      return NextResponse.json(
        { status: "not-found" },
        { status: 200 }
      );
    }

    // ============================
    //   เช็คจำนวนจาก Navision
    // ============================
    const itemAvail = await debugCheckItemAvail2({
      product,
      uom,
      customerId,
    });

    if (itemAvail >= qty) {
      // ok
    } else if (itemAvail > 0) {
      return NextResponse.json(
        { status: "less-left", itemAvail },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { status: "sold-out" },
        { status: 200 }
      );
    }

    // ============================
    //   Update cart
    // ============================
    await setShopSessionTZ();

    const priceAmount = calcPriceAmount(qty, existing.price);

    const row = await prismaShop.carts.update({
      where: { id: existing.id },
      data: {
        quantity: BigInt(qty),
        price_amount: priceAmount,
        updated_at: new Date(),
      },
    });

    const item = mapCartRowToCartItem(row as any);

    return NextResponse.json(
      { status: "success", item },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[api/cart/update] ERROR", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err?.message },
      { status: 500 }
    );
  }
}

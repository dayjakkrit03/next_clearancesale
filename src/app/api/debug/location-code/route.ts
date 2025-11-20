// src/app/api/debug/location-code/route.ts
import { NextResponse } from "next/server";
import {
  getProductIdBySku,
  getLocationCodeForProductSku,
} from "@/services/cart";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sku = searchParams.get("sku");

  if (!sku) {
    return NextResponse.json(
      { error: "Missing sku. Example: ?sku=US-9025LSZH" },
      { status: 400 }
    );
  }

  const productId = await getProductIdBySku(sku);
  const locationCode = await getLocationCodeForProductSku(sku);

  return NextResponse.json({ sku, productId, locationCode });
}


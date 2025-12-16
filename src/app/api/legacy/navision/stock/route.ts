// src/app/api/legacy/navision/stock/route.ts

import { NextRequest, NextResponse } from "next/server";

const NAV_BASE_URL =
  process.env.NAVISION_BASE_URL ?? "http://203.151.70.36:8082";
const NAV_USERNAME =
  process.env.NAVISION_USERNAME ?? "kunakorn@interlink.co.th";
const NAV_PASSWORD = process.env.NAVISION_PASSWORD ?? "Kunak@2021";
const DEFAULT_LOCATION = process.env.DEFAULT_LOCATION ?? "12";

async function getNavToken(): Promise<string> {
  const res = await fetch(`${NAV_BASE_URL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "password",
      username: NAV_USERNAME,
      password: NAV_PASSWORD,
    }),
  });

  if (!res.ok) {
    throw new Error(`NAV token error: HTTP ${res.status}`);
  }

  const data: any = await res.json();
  if (!data?.access_token) {
    throw new Error("NAV token error: no access_token");
  }
  return data.access_token as string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sku = searchParams.get("sku");
  const uom = searchParams.get("uom") ?? "EA"; // หรือ "M." ตามที่คุณใช้จริง
  const location = searchParams.get("location") ?? DEFAULT_LOCATION;

  if (!sku) {
    return NextResponse.json(
      { error: "sku is required" },
      { status: 400 },
    );
  }

  try {
    const token = await getNavToken();

    const url = `${NAV_BASE_URL}/api/NAV/ItemAvail?No=${encodeURIComponent(
      sku,
    )}&locationCode=${encodeURIComponent(location)}&UOM=${encodeURIComponent(
      uom,
    )}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          sku,
          uom,
          quantity: 0,
          isNumeric: false,
          error: `NAV HTTP ${res.status}`,
        },
        { status: 200 },
      );
    }

    // Navision ส่งค่าเป็นตัวเลขดิบ เช่น 6, 0, 12.5 ฯลฯ
    const text = await res.text();
    const num = Number(text);

    if (!Number.isFinite(num)) {
      return NextResponse.json(
        {
          sku,
          uom,
          quantity: 0,
          isNumeric: false,
          raw: text,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        sku,
        uom,
        quantity: num,
        isNumeric: true,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("NAV stock error:", err);
    return NextResponse.json(
      {
        sku,
        uom,
        quantity: 0,
        isNumeric: false,
        error: err?.message ?? "unknown error",
      },
      { status: 200 }, // ไม่ทำให้ UI พัง แค่ถือว่าสินค้าหมดไปก่อน
    );
  }
}

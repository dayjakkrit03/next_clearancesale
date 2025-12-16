// v.1.1.2 ===============================================================
// src/app/api/stock/check/route.ts

import { NextRequest, NextResponse } from "next/server";
import { StockService } from "@/services/stock/stock.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body?.items)) {
      return NextResponse.json(
        { ok: false, error: "INVALID_PAYLOAD" },
        { status: 400 },
      );
    }

    // map payload ให้ตรงกับ service
    const items = body.items.map((it: any) => ({
      sku: it.sku,
      uom: it.uom,
      quantity: Number(it.quantity ?? 0), // จำนวน ROLL / EA
      total: Number(it.total ?? 0),       // เมตรรวม (เฉพาะ uom = M.)
    }));

    /**
     * คาดหวังว่า StockService.checkCartStock จะคืนค่าแบบนี้:
     * {
     *   ok: boolean,
     *   insufficientItems?: Array<{
     *     sku: string;
     *     available: number;
     *     requested: number;
     *     uom: string;
     *   }>
     * }
     */
    const result = await StockService.checkCartStock(items);

    // ✅ ผ่าน
    if (result?.ok) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // ❌ ไม่ผ่าน → ส่งรายการที่สต๊อกไม่พอ
    return NextResponse.json(
      {
        ok: false,
        insufficientItems: Array.isArray(result?.insufficientItems)
          ? result.insufficientItems
          : [],
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[API][STOCK][ERROR]", err);
    return NextResponse.json(
      {
        ok: false,
        insufficientItems: [],
        error: "INTERNAL_ERROR",
      },
      { status: 200 },
    );
  }
}

// v.1.1.2 ===============================================================

// // src/app/api/stock/check/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { StockService } from "@/services/stock/stock.service";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     if (!Array.isArray(body?.items)) {
//       return NextResponse.json(
//         { ok: false, error: "INVALID_PAYLOAD" },
//         { status: 400 },
//       );
//     }

//     // ✅ map payload ให้ตรงกับ service (ไม่ใช้ selectedLength แล้ว)
//     const items = body.items.map((it: any) => ({
//       sku: it.sku,
//       uom: it.uom,              // หน่วยจริง
//       quantity: Number(it.quantity ?? it.rollQty ?? 0), // จำนวน ROLL / จำนวนหน่วย
//       total: Number(it.total ?? it.totalMeter ?? 0),    // เมตรรวม (ใช้เฉพาะ uom = "M.")
//     }));

//     const result = await StockService.checkCartStock(items);

//     return NextResponse.json(result, { status: 200 });
//   } catch (err) {
//     console.error("[API][STOCK][ERROR]", err);
//     return NextResponse.json(
//       { ok: false, errors: [{ reason: "INTERNAL_ERROR" }] },
//       { status: 200 },
//     );
//   }
// }

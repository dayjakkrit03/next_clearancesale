// v.1.1.4 ==================================================================
// src/app/api/legacy/lead-time/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prismaShop, setShopSessionTZ } from "@/lib/db";

// บังคับ timezone ของ session ให้ตรง +07:00 (เหมือน service อื่น ๆ)
async function ensureTZ() {
  try {
    await setShopSessionTZ("+07:00");
  } catch {
    // เงียบไปได้ ไม่ต้อง throw
  }
}

// ✅ fallback ถ้าไม่พบข้อมูลใน lead_times
const FALLBACK_MIN = 3;
const FALLBACK_MAX = 7;

// ✅ เผื่อเวลาขนส่งกรณี lead_time = 1 (ของมีพร้อม)
const SHIPPING_BUFFER_DAYS = 7;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const sku = searchParams.get("sku");
  const uom = searchParams.get("uom") ?? "M.";
  const stock = searchParams.get("stock");

  if (!sku) {
    return NextResponse.json({ error: "sku is required" }, { status: 400 });
  }

  await ensureTZ();

  let leadDays: number | null = null;

  // 1) exact match: sku + uom + stock
  if (stock != null && stock !== "") {
    const rows: any[] = await prismaShop.$queryRawUnsafe(
      `
      SELECT lead_time
      FROM lead_times
      WHERE sku = ?
        AND uom = ?
        AND stock = ?
      LIMIT 1
      `,
      sku,
      uom,
      stock,
    );

    if (rows.length && rows[0].lead_time != null) {
      leadDays = Number(rows[0].lead_time);
    }
  }

  // 2) ถ้ายังไม่เจอ → ลองแบบไม่สน stock: sku + uom
  if (leadDays == null) {
    const rows: any[] = await prismaShop.$queryRawUnsafe(
      `
      SELECT lead_time
      FROM lead_times
      WHERE sku = ?
        AND uom = ?
      ORDER BY id ASC
      LIMIT 1
      `,
      sku,
      uom,
    );

    if (rows.length && rows[0].lead_time != null) {
      leadDays = Number(rows[0].lead_time);
    }
  }

  // 3) ถ้าไม่เจอเลย → ใช้ fallback 3–7 วัน
  if (leadDays == null || !Number.isFinite(leadDays)) {
    return NextResponse.json(
      {
        sku,
        uom,
        stock,
        leadDays: null,
        minDays: FALLBACK_MIN,
        maxDays: FALLBACK_MAX,
        message: `รอสินค้าภายใน ${FALLBACK_MIN}-${FALLBACK_MAX} วัน`,
        isFallback: true,
        isInStock: false,
      },
      { status: 200 },
    );
  }

  // 4) ถ้ามี leadDays จาก DB

  // 🔸 เคสพิเศษ: lead_time = 1 => มีของพร้อม ส่งภายใน 1–7 วัน
  if (leadDays === 1) {
    return NextResponse.json(
      {
        sku,
        uom,
        stock,
        leadDays,
        minDays: 1,
        maxDays: SHIPPING_BUFFER_DAYS,
        message: `จะได้รับภายใน 1-${SHIPPING_BUFFER_DAYS} วัน`,
        isFallback: false,
        isInStock: true,
      },
      { status: 200 },
    );
  }

  // 🔸 เคสอื่น ๆ: รอของจริง เช่น 30, 60 วัน (min = max = lead_time)
  return NextResponse.json(
    {
      sku,
      uom,
      stock,
      leadDays,
      minDays: leadDays,
      maxDays: leadDays,
      message: `รอสินค้าภายใน ${leadDays} วัน`,
      isFallback: false,
      isInStock: false,
    },
    { status: 200 },
  );
}

// v.1.1.4 ==================================================================

// v.1.1.3 ==================================================================
// // src/app/api/legacy/lead-time/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { prismaShop, setShopSessionTZ } from "@/lib/db";

// // บังคับ timezone ของ session ให้ตรง +07:00 (เหมือน service อื่น ๆ)
// async function ensureTZ() {
//   try {
//     await setShopSessionTZ("+07:00");
//   } catch {
//     // เงียบไปได้ ไม่ต้อง throw
//   }
// }

// // ✅ fallback ถ้าไม่พบข้อมูลใน lead_times
// const FALLBACK_MIN = 3;
// const FALLBACK_MAX = 7;

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);

//   const sku = searchParams.get("sku");
//   const uom = searchParams.get("uom") ?? "M.";
//   const stock = searchParams.get("stock");

//   if (!sku) {
//     return NextResponse.json({ error: "sku is required" }, { status: 400 });
//   }

//   await ensureTZ();

//   let leadDays: number | null = null;

//   // 1) exact match: sku + uom + stock
//   if (stock != null && stock !== "") {
//     const rows: any[] = await prismaShop.$queryRawUnsafe(
//       `
//       SELECT lead_time
//       FROM lead_times
//       WHERE sku = ?
//         AND uom = ?
//         AND stock = ?
//       LIMIT 1
//       `,
//       sku,
//       uom,
//       stock,
//     );

//     if (rows.length && rows[0].lead_time != null) {
//       leadDays = Number(rows[0].lead_time);
//     }
//   }

//   // 2) ถ้ายังไม่เจอ → ลองแบบไม่สน stock: sku + uom
//   if (leadDays == null) {
//     const rows: any[] = await prismaShop.$queryRawUnsafe(
//       `
//       SELECT lead_time
//       FROM lead_times
//       WHERE sku = ?
//         AND uom = ?
//       ORDER BY id ASC
//       LIMIT 1
//       `,
//       sku,
//       uom,
//     );

//     if (rows.length && rows[0].lead_time != null) {
//       leadDays = Number(rows[0].lead_time);
//     }
//   }

//   // 3) ถ้าไม่เจอเลย → ใช้ fallback 3–7 วัน
//   if (leadDays == null || !Number.isFinite(leadDays)) {
//     return NextResponse.json(
//       {
//         sku,
//         uom,
//         stock,
//         leadDays: null,
//         minDays: FALLBACK_MIN,
//         maxDays: FALLBACK_MAX,
//         message: `รอสินค้าภายใน ${FALLBACK_MIN}-${FALLBACK_MAX} วัน`,
//         isFallback: true,
//       },
//       { status: 200 },
//     );
//   }

//   // ถ้ามี leadDays จาก DB → ถือว่า min = max = leadDays
//   return NextResponse.json(
//     {
//       sku,
//       uom,
//       stock,
//       leadDays,
//       minDays: leadDays,
//       maxDays: leadDays,
//       message: `รอสินค้าภายใน ${leadDays} วัน`,
//       isFallback: false,
//     },
//     { status: 200 },
//   );
// }

// v.1.1.3 ==================================================================

// v.1.1.2 ===================================================================
// // src/app/api/legacy/lead-time/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";

// // กัน timezone เพี้ยน เหมือน service อื่น ๆ
// async function ensureTZ() {
//   try {
//     await setInterlinkSessionTZ("+07:00");
//   } catch {
//     // ignore
//   }
// }

// /**
//  * GET /api/legacy/lead-time?sku=...&uom=...&stock=...
//  *
//  * พฤติกรรมเทียบกับ LogisticController::leadTimes() แบบ getWith = 'string'
//  *   LeadTime::where('sku', $req->sku)
//  *           ->where('uom', $req->uom)
//  *           ->where('stock', $req->stock)
//  *           ->pluck('lead_time')
//  *           ->first();
//  *
//  * คืน JSON:
//  *   {
//  *     sku, uom, stock,
//  *     leadDays: number | null,
//  *     message: string
//  *   }
//  */
// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);

//   const sku = searchParams.get("sku");
//   const uom = searchParams.get("uom") ?? "M.";   // default ตามที่คุณใช้
//   const stockParam = searchParams.get("stock");  // optional

//   if (!sku) {
//     return NextResponse.json(
//       { error: "sku is required" },
//       { status: 400 },
//     );
//   }

//   await ensureTZ();

//   // เตรียม where ตาม logic เดิม: where sku + uom (+ stock ถ้าส่งมา)
//   const params: any[] = [sku, uom];
//   let sql = `
//     SELECT lead_time
//     FROM lead_times
//     WHERE sku = ?
//       AND uom = ?
//   `;

//   if (stockParam != null && stockParam !== "") {
//     sql += ` AND stock = ?`;
//     params.push(stockParam);
//   }

//   sql += `
//     ORDER BY lead_time DESC
//     LIMIT 1
//   `;

//   const rows: any[] = await prismaInterlink.$queryRawUnsafe(sql, ...params);

//   const leadRaw = rows?.[0]?.lead_time;
//   const leadDays =
//     leadRaw == null ? null : Number(leadRaw); // แปลงเป็น number ถ้าเจอ

//   // ถ้าไม่เจอข้อมูลในตาราง lead_times
//   if (leadDays == null || !Number.isFinite(leadDays)) {
//     return NextResponse.json(
//       {
//         sku,
//         uom,
//         stock: stockParam,
//         leadDays: null,
//         message: "ไม่พบข้อมูลระยะเวลาจัดส่งสำหรับสินค้า/หน่วยนี้",
//       },
//       { status: 200 },
//     );
//   }

//   const message = `รอสินค้าภายใน ${leadDays} วัน`;

//   return NextResponse.json(
//     {
//       sku,
//       uom,
//       stock: stockParam,
//       leadDays,
//       message,
//     },
//     { status: 200 },
//   );
// }

// v.1.1.2 ===================================================================

// // src/app/api/legacy/lead-time/route.ts
// import { NextRequest, NextResponse } from "next/server";

// const LEGACY_BASE_URL = process.env.LEGACY_BASE_URL ?? "http://localhost:8000";

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);

//   const sku = searchParams.get("sku");
//   const uom = searchParams.get("uom") ?? "M.";
//   const stock = searchParams.get("stock") ?? "1";

//   if (!sku) {
//     return NextResponse.json(
//       { error: "sku is required" },
//       { status: 400 },
//     );
//   }

//   // 🧠 ตรง path `/logistic/lead-times` คุณอาจต้องแก้ให้ตรงกับ route จริงใน Laravel
//   const url =
//     `${LEGACY_BASE_URL}/logistic/lead-times` +
//     `?getWith=string` +
//     `&sku=${encodeURIComponent(sku)}` +
//     `&uom=${encodeURIComponent(uom)}` +
//     `&stock=${encodeURIComponent(stock)}`;

//   try {
//     const r = await fetch(url, {
//       // ถ้า Laravel ใช้ session / cookie เพิ่ม header ตรงนี้ได้
//       method: "GET",
//     });

//     const text = await r.text(); // leadTimes() คืน string ธรรมดา

//     if (!r.ok) {
//       return NextResponse.json(
//         { error: "legacy error", status: r.status, body: text },
//         { status: 500 },
//       );
//     }

//     return NextResponse.json({ leadTimeText: text });
//   } catch (e: any) {
//     return NextResponse.json(
//       { error: "fetch to legacy failed", message: String(e?.message ?? e) },
//       { status: 500 },
//     );
//   }
// }

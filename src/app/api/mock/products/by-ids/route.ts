// v.1.1.2 ================================================
// src/app/api/mock/products/by-ids/route.ts
import { NextResponse } from "next/server";
import { getManyByIds } from "../_store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("ids");

  if (!idsParam || !idsParam.trim()) {
    return NextResponse.json({ items: [] }, { status: 200 });
  }

  const rawIds = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
  const seen = new Set<string>();
  const ids = rawIds.filter((id) => {
    const key = id.toString();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const items = await getManyByIds(ids); // ✅ await
  return NextResponse.json({ items }, { status: 200 });
}

// v.1.1.2 ================================================

// // src/app/api/mock/products/by-ids/route.ts
// import { NextResponse } from "next/server";
// import { getManyByIds } from "../_store";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// /**
//  * GET /api/mock/products/by-ids?ids=1,2,3
//  * - คืน items เรียงตามลำดับ ids ที่ส่งมา
//  * - ถ้าไม่ส่ง ids → คืน { items: [] }
//  */
// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const idsParam = searchParams.get("ids");

//   if (!idsParam || !idsParam.trim()) {
//     return NextResponse.json({ items: [] }, { status: 200 });
//   }

//   // แยกค่าเป็นอาร์เรย์ id
//   const rawIds = idsParam
//     .split(",")
//     .map((s) => s.trim())
//     .filter(Boolean);

//   // ป้องกันใส่ซ้ำ ๆ มากเกินจำเป็น แต่ยังคงลำดับแรกที่พบไว้
//   const seen = new Set<string>();
//   const ids = rawIds.filter((id) => {
//     const key = id.toString();
//     if (seen.has(key)) return false;
//     seen.add(key);
//     return true;
//   });

//   const items = getManyByIds(ids);

//   return NextResponse.json({ items }, { status: 200 });
// }

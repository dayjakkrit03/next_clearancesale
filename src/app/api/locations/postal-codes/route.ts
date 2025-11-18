// v.1.1.3 ===============================================
// src/app/api/locations/postal-codes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prismaShop } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const provinceIdParam = searchParams.get("provinceId");
    const districtIdParam = searchParams.get("districtId");
    const subDistrictIdParam = searchParams.get("subDistrictId");

    const where: any = {};

    // filter ตาม province/district/sub-district ถ้ามี
    if (provinceIdParam) {
      const n = Number(provinceIdParam);
      if (!Number.isNaN(n)) where.province_id = n;
    }
    if (districtIdParam) {
      const n = Number(districtIdParam);
      if (!Number.isNaN(n)) where.district_id = n;
    }
    if (subDistrictIdParam) {
      const n = Number(subDistrictIdParam);
      if (!Number.isNaN(n)) where.sub_district_id = n;
    }

    // filter ตามเลขขึ้นต้นของรหัสไปรษณีย์
    if (search) {
      const s = search.replace(/[^\d]/g, "");
      if (s.length > 0 && s.length <= 5) {
        const base = Number(s);
        const digits = 5 - s.length;
        const factor = 10 ** digits;
        const min = base * factor;
        const max = min + factor;

        where.code = {
          gte: min,
          lt: max,
        };
      }
    }

    const rows = await prismaShop.postal_codes.findMany({
      where,
      include: {
        provinces: true,
        districts: true,
        sub_districts: true,
      },
      orderBy: { code: "asc" },
      take: 100,
    });

    // group by code (ไม่ให้ซ้ำ)
    const byCode = new Map<number, (typeof rows)[number]>();

    for (const row of rows) {
      if (!byCode.has(row.code)) {
        byCode.set(row.code, row);
      }
    }

    const result = Array.from(byCode.values()).map((r) => ({
      id: r.id, // Int ธรรมดา
      code: r.code.toString(),
      provinceName: r.provinces.name,
      districtName: r.districts.name,
      subDistrictName: r.sub_districts.name,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("POSTAL CODES API ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error during fetching postal codes", details: (error as Error).message },
      { status: 500 }
    );
  }
}
// v.1.1.3 ===============================================

// v.1.1.2 ===============================================
// // src/app/api/locations/postal-codes/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { prismaShop } from "@/lib/db";

// export async function GET(req: NextRequest) {
//   const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";

//   if (!search) {
//     return NextResponse.json([]);
//   }

//   const numeric = Number.parseInt(search, 10);
//   let where: any = {};

//   if (!Number.isNaN(numeric)) {
//     const digits = search.length;
//     const base = numeric * 10 ** (5 - digits);
//     const max = base + 10 ** (5 - digits) - 1;

//     where = {
//       code: {
//         gte: base,
//         lte: max,
//       },
//     };
//   }

//   // ดึงมาทีเดียวเยอะหน่อยก่อน แล้วค่อยกรองไม่ให้ซ้ำ
//   const rows = await prismaShop.postal_codes.findMany({
//     where,
//     orderBy: { code: "asc" },
//     take: 200,
//   });

//   // ✅ group by code (ไม่ให้ code เดิมซ้ำซ้อน)
//   const seen = new Set<number>();
//   const result: { id: number; label: string }[] = [];

//   for (const row of rows) {
//     const codeNum = Number(row.code);
//     if (seen.has(codeNum)) continue;
//     seen.add(codeNum);

//     result.push({
//       id: codeNum,          // ใช้ code เป็น id ไปเลยก็ได้
//       label: String(row.code),
//     });
//   }

//   // ส่งกลับแค่ 20 อันแรกพอ
//   return NextResponse.json(result.slice(0, 20));
// }


// v.1.1.2 ===============================================

// // src/app/api/locations/postal-codes/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { prismaShop } from "@/lib/db";

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const search = (searchParams.get("search") ?? "").trim();

//   if (!search) {
//     return NextResponse.json([]);
//   }

//   // ใช้ raw query เพื่อให้ search ด้วย LIKE ได้เหมือน Laravel เดิม
//   const rows = await prismaShop.$queryRaw<
//     { id: number; code: number }[]
//   >`SELECT id, code 
//     FROM postal_codes 
//     WHERE CAST(code AS CHAR) LIKE ${"%" + search + "%"} 
//     ORDER BY code ASC 
//     LIMIT 20`;

//   const result = rows.map((r) => ({
//     id: r.id,
//     label: String(r.code),
//   }));

//   return NextResponse.json(result);
// }

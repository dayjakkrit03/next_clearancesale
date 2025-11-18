// v.1.1.3 ===============================================
// src/app/api/locations/sub-districts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prismaShop } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("search") ?? "").trim();
    const districtIdParam = searchParams.get("districtId");

    const districtId = districtIdParam ? Number(districtIdParam) : null;

    // 1. ตรวจสอบเงื่อนไขการดึงข้อมูล: ต้องมี districtId หรือมีการค้นหาที่ยาวพอ
    if (!districtId && (!q || q.length < 2)) {
      return NextResponse.json([]);
    }

    const where: any = {};

    // กรองตาม districtId เสมอถ้ามี
    if (districtId) {
      where.district_id = districtId;
    }

    // 2. กรองตาม search query: **ใช้ contains อย่างเดียว (ป้องกัน Prisma Error)**
    if (q && q.length > 0) {
      where.name = { contains: q };
    }
    
    // 3. กำหนด Limit การดึงข้อมูล: ให้แสดง 30 รายการแรกเมื่อ Focus (กรณีมี districtId แต่ไม่มี search)
    let takeLimit = 100;
    if (districtId && !q) {
      takeLimit = 30; // แสดง 30 รายการแรกเมื่อมีการกรองด้วย ID แต่ไม่มี search
    }

    const rows = await prismaShop.sub_districts.findMany({
      where,
      take: takeLimit, 
      orderBy: { name: "asc" },
    });

    const result = rows.map((s) => ({
      id: s.id,
      name: s.name,
      districtId: s.district_id,
    }));

    return NextResponse.json(result);

  } catch (error) {
    console.error("SUB-DISTRICTS API ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error during fetching sub-districts", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// v.1.1.3 ===============================================

// v.1.1.2 ===============================================
// // src/app/api/locations/sub-districts/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { prismaShop } from "@/lib/db";

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const search = searchParams.get("search") ?? "";
//   const districtIdParam = searchParams.get("districtId");

//   const where: any = {};

//   if (districtIdParam) {
//     const districtIdNum = Number(districtIdParam);
//     if (!Number.isNaN(districtIdNum)) {
//       where.district_id = districtIdNum;
//     }
//   }

//   if (search) {
//     where.name = { contains: search };
//   }

//   const subDistricts = await prismaShop.sub_districts.findMany({
//     where,
//     orderBy: { name: "asc" },
//     take: 30,
//   });

//   const result = subDistricts.map((s) => ({
//     id: s.id,
//     name: s.name,
//     districtId: s.district_id,
//   }));

//   return NextResponse.json(result);
// }

// v.1.1.2 ===============================================

// // src/app/api/locations/sub-districts/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { prismaShop } from "@/lib/db";

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const search = (searchParams.get("search") ?? "").trim();

//   if (!search) {
//     return NextResponse.json([]);
//   }

//   const rows = await prismaShop.sub_districts.findMany({
//     where: {
//       name: {
//         contains: search,
//       },
//     },
//     orderBy: { name: "asc" },
//     take: 20,
//   });

//   const result = rows.map((r) => ({
//     id: r.id,
//     label: r.name,
//   }));

//   return NextResponse.json(result);
// }

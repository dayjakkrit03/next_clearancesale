// v.1.1.2 ===============================================
// src/app/api/locations/districts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prismaShop } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("search") ?? "").trim();
    const provinceIdParam = searchParams.get("provinceId");

    const provinceId = provinceIdParam ? Number(provinceIdParam) : null;

    // 1. ตรวจสอบเงื่อนไขการดึงข้อมูล
    if (!provinceId && (!q || q.length < 2)) {
      return NextResponse.json([]);
    }

    const where: any = {};

    // กรองตาม provinceId เสมอถ้ามี
    if (provinceId) {
      where.province_id = provinceId;
    }

    // 2. กรองตาม search query: **ลบ mode: "insensitive" ออกเพื่อป้องกัน Error 500**
    if (q && q.length > 0) {
      where.name = { contains: q }; // **ใช้ contains อย่างเดียว**
    }

    // 3. กำหนด Limit การดึงข้อมูล
    let takeLimit = 100;
    if (provinceId && !q) {
      takeLimit = 30; // แสดง 30 รายการแรกเมื่อมีการกรองด้วย ID แต่ไม่มี search
    }

    const rows = await prismaShop.districts.findMany({
      where,
      take: takeLimit,
      orderBy: { name: "asc" },
    });

    const result = rows.map((d) => ({
      id: d.id,
      name: d.name,
      provinceId: d.province_id,
    }));

    return NextResponse.json(result);
    
  } catch (error) {
    console.error("DISTRICTS API ERROR:", error);
    // เพื่อให้ Postman และ Browser แสดง Error ที่ชัดเจน
    return NextResponse.json(
      { error: "Internal Server Error during fetching districts", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// v.1.1.2 ===============================================

// v.1.1.2 ===============================================
// // src/app/api/locations/districts/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prismaShop } from "@/lib/db";

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const search = searchParams.get("search") ?? "";
//   const provinceIdParam = searchParams.get("provinceId");

//   const where: any = {};

//   if (provinceIdParam) {
//     const provinceIdNum = Number(provinceIdParam);
//     if (!Number.isNaN(provinceIdNum)) {
//       where.province_id = provinceIdNum;
//     }
//   }

//   if (search) {
//     where.name = { contains: search };
//   }

//   const districts = await prismaShop.districts.findMany({
//     where,
//     orderBy: { name: "asc" },
//     take: 30,
//   });

//   const result = districts.map((d) => ({
//     id: d.id,
//     name: d.name,
//     provinceId: d.province_id,
//   }));

//   return NextResponse.json(result);
// }

// v.1.1.2 ===============================================

// // src/app/api/locations/districts/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { prismaShop } from "@/lib/db";

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const search = (searchParams.get("search") ?? "").trim();

//   if (!search) {
//     return NextResponse.json([]);
//   }

//   const rows = await prismaShop.districts.findMany({
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

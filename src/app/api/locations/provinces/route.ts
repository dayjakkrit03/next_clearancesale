// v.1.1.2 ===============================================
// src/app/api/locations/provinces/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prismaShop } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";

  const provinces = await prismaShop.provinces.findMany({
    where: search
      ? {
          name: {
            contains: search,
          },
        }
      : undefined,
    orderBy: { name: "asc" },
    // take: 30,
  });

  const result = provinces.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return NextResponse.json(result);
}

// v.1.1.2 ===============================================

// // src/app/api/locations/provinces/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { prismaShop } from "@/lib/db";

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const search = (searchParams.get("search") ?? "").trim();

//   if (!search) {
//     return NextResponse.json([]);
//   }

//   const rows = await prismaShop.provinces.findMany({
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

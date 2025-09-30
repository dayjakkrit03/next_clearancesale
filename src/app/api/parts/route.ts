// src/app/api/parts/route.ts
import { NextResponse } from "next/server";
import { prismaInterlink } from "@/lib/db";

export async function GET() {
  const rows = await prismaInterlink.part.findMany({
    where: { part_status: 1 },
    orderBy: { part_id: "asc" },
    select: {
      part_id: true,
      category_id: true,
      sub_id: true,
      part_name: true,
      part_picture: true,
      part_status: true,
    },
  });
  return NextResponse.json({ items: rows });
}

// src/app/api/subs/route.ts
import { NextResponse } from "next/server";
import { prismaInterlink } from "@/lib/db";

export async function GET() {
  const rows = await prismaInterlink.sub.findMany({
    where: { sub_status: 1 },
    orderBy: { sub_id: "asc" },
    select: {
      sub_id: true,
      category_id: true,
      sub_name: true,
      sub_picture: true,
      sub_status: true,
    },
  });
  return NextResponse.json({ items: rows });
}

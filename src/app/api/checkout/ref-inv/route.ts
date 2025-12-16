import { NextResponse } from "next/server";
import { prismaShop } from "@/lib/db";
import { nowTH } from "@/lib/time";

export async function GET() {
  const now = nowTH();
  const year2 = now.getFullYear().toString().slice(-2);

  // หา counter
  let counter = await prismaShop.counts.findFirst({
    where: { section: "ref_inv" },
  });

  if (!counter) {
    counter = await prismaShop.counts.create({
      data: {
        section: "ref_inv",
        count: 0,
        note: "auto created by Next.js",
        created_at: now,
        updated_at: now,
      },
    });
  }

  const nextCount = counter.count + 1;
  const padded = String(nextCount).padStart(5, "0");
  const refInv = `SOE-${year2}-${padded}`;

  await prismaShop.counts.update({
    where: { id: counter.id },
    data: {
      count: nextCount,
      updated_at: now,
    },
  });

  return NextResponse.json({
    ok: true,
    refInv,
  });
}

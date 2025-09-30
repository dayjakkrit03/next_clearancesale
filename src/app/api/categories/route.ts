// src/app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { prismaInterlink } from '@/lib/db'; // ใช้ไฟล์ใหม่ด้านบน

function toUICategory(r: any) {
  const fallbackById: Record<number, string> = {
    1: "/img/category/Home-01.png",
    2: "/img/category/Home-02.png",
    4: "/img/category/Home-05.png",
    5: "/img/category/Home-06.png",
    6: "/img/category/Home-07.png",
    7: "/img/category/Home-08.png",
    8: "/img/category/Home-10.png",
    9: "/img/category/Home-17.png",
    10: "/img/category/Home-18.png",
    11: "/img/category/Home-12.png",
  };
  const img =
    r.category_picture && r.category_picture.length > 0
      ? (r.category_picture.startsWith('/') ? r.category_picture : `/img/category/${r.category_picture}`)
      : (fallbackById[r.category_id] ?? '/placeholder.png');

  return {
    id: r.category_id,
    name: r.category_name,
    slug: String(r.category_id),     // ใช้ id เป็น slug ไปก่อน ให้ลิงก์ /category/:id ได้
    image_url: img,
  };
}

export async function GET() {
  const rows = await prismaInterlink.category.findMany({
    where: { category_status: 1 },
    orderBy: { category_number: 'asc' },
    select: {
      category_id: true,
      category_name: true,
      category_picture: true,
      category_number: true,
      category_status: true,
    },
  });

  const items = rows.map(toUICategory);
  // ถ้าจะให้ API cache แบบ ISR: ใส่ header s-maxage/stale-while-revalidate
  return NextResponse.json({ items }, {
    headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
  });
}

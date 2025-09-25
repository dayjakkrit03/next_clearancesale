// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prismaShop, prismaInterlink } from '@/lib/prisma'; // import ถูกต้องแล้ว

export async function GET() {
  try {
    // ใช้ $queryRaw เพื่อส่ง SQL query ตรงๆ และตรวจสอบเวลา
    const [shopTimeResult] = await prismaShop.$queryRaw<[{ t: Date }]>`SELECT NOW() AS t`;
    const [interTimeResult] = await prismaInterlink.$queryRaw<[{ t: Date }]>`SELECT NOW() AS t`;

    return NextResponse.json({ 
      ok: true, 
      shopConnected: true, 
      shopTime: shopTimeResult.t, 
      interlinkConnected: true,
      interlinkTime: interTimeResult.t 
    });
  } catch (e: any) {
    console.error("Database Health Check Error:", e); // เพิ่ม console.error เพื่อดู error ใน server logs
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

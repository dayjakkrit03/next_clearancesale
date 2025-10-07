// v.1.1.2 ==============================================
// src/app/api/uploads/products/route.ts

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

export const runtime = "nodejs"; // ให้ใช้ Node runtime

// จำกัดขนาดไฟล์ 2MB
const MAX_SIZE = 2 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      return NextResponse.json({ error: "Only PNG/JPG/WEBP" }, { status: 415 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (>2MB)" }, { status: 413 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // แปลงเป็น WEBP คุณภาพดี ไฟล์เล็ก
    const webp = await sharp(inputBuffer).webp({ quality: 82 }).toBuffer();

    // เตรียมโฟลเดอร์ใต้ /public
    const relDir = "/uploads/products";
    const absDir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(absDir, { recursive: true });

    const name = crypto.randomBytes(8).toString("hex") + ".webp";
    const absPath = path.join(absDir, name);
    await writeFile(absPath, webp);

    // URL ที่ frontend ใช้แสดงผล
    const url = `${relDir}/${name}`;
    return NextResponse.json({ url }, { status: 200 });
  } catch (err: any) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// v.1.1.2 ==============================================

// // src/app/api/uploads/products/route.ts

// import { NextResponse } from "next/server";
// import { writeFile } from "fs/promises";
// import path from "path";
// import sharp from "sharp";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// export async function POST(req: Request) {
//   const form = await req.formData();
//   const file = form.get("file") as File | null;
//   if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

//   const bytes = Buffer.from(await file.arrayBuffer());
//   // แปลงเป็น webp
//   const webp = await sharp(bytes).webp({ quality: 82 }).toBuffer();

//   const base = Date.now() + "-" + Math.random().toString(36).slice(2);
//   const filename = base + ".webp";
//   const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
//   const full = path.join(uploadDir, filename);

//   await writeFile(full, webp);
//   const url = "/uploads/products/" + filename;
//   return NextResponse.json({ url });
// }

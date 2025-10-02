// src/app/api/uploads/categories/route.ts

import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

export const runtime = "nodejs"; // ต้องใช้ fs

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "categories");

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      return NextResponse.json({ error: "Only PNG/JPG/WEBP allowed" }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Max 2MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // แปลงเป็น webp + ย่อให้เป็นสี่เหลี่ยมจัตุรัส (เช่น 256x256)
    const webpBuffer = await sharp(inputBuffer)
      .resize(256, 256, { fit: "cover", position: "center" })
      .webp({ quality: 80 })
      .toBuffer();

    // ตั้งชื่อไฟล์แบบสุ่ม
    const ts = Date.now();
    const rand = crypto.randomBytes(6).toString("hex");
    const fileName = `cat-${ts}-${rand}.webp`;

    await mkdir(UPLOAD_DIR, { recursive: true });
    const target = path.join(UPLOAD_DIR, fileName);
    await writeFile(target, webpBuffer);

    // URL สำหรับหน้าเว็บ
    const url = `/uploads/categories/${fileName}`;
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Upload failed" }, { status: 500 });
  }
}

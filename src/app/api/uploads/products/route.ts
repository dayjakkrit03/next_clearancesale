// src/app/api/uploads/products/route.ts

import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  // แปลงเป็น webp
  const webp = await sharp(bytes).webp({ quality: 82 }).toBuffer();

  const base = Date.now() + "-" + Math.random().toString(36).slice(2);
  const filename = base + ".webp";
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  const full = path.join(uploadDir, filename);

  await writeFile(full, webp);
  const url = "/uploads/products/" + filename;
  return NextResponse.json({ url });
}

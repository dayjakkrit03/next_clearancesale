// v.1.1.3 ==============================================
// app/api/mock/uploads/product_frame/route.ts

import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** ตรวจ PNG: 8 ไบต์แรก */
function isPng(buf: Buffer) {
  if (buf.length < 8) return false;
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < 8; i++) if (buf[i] !== sig[i]) return false;
  return true;
}

/** ตรวจ WebP: "RIFF" + 4 bytes size + "WEBP" */
function isWebp(buf: Buffer) {
  if (buf.length < 12) return false;
  return (
    buf[0] === 0x52 && // R
    buf[1] === 0x49 && // I
    buf[2] === 0x46 && // F
    buf[3] === 0x46 && // F
    buf[8] === 0x57 && // W
    buf[9] === 0x45 && // E
    buf[10] === 0x42 && // B
    buf[11] === 0x50 // P
  );
}

/** ตรวจจากบัฟเฟอร์ */
function detectByBuffer(buf: Buffer): "png" | "webp" | null {
  if (isPng(buf)) return "png";
  if (isWebp(buf)) return "webp";
  return null;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "Missing file field 'file'." }, { status: 400 });
    if (file.size === 0) return NextResponse.json({ error: "Empty file." }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)." }, { status: 413 });
    }

    const mime = (file.type || "").toLowerCase();
    const mimeAccept = new Set(["image/png", "image/x-png", "image/webp"]);
    if (mime && !mimeAccept.has(mime)) {
      // ไม่ปฏิเสธทันที — บาง browser ตั้ง mime แปลก ๆ ให้ตรวจจากบัฟเฟอร์ต่อ
      // แต่ถ้า mime มีจริงและไม่ใช่ภาพเลย ก็ปฏิเสธ
      if (!mime.startsWith("image/")) {
        return NextResponse.json({ error: "Unsupported file type." }, { status: 415 });
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ตรวจจากบัฟเฟอร์เพื่อความชัวร์
    const byBuf = detectByBuffer(buffer);

    // resolve ชนิดสุดท้ายตามกติกา:
    // 1) ถ้าบัฟเฟอร์บอกชัด → เชื่อบัฟเฟอร์
    // 2) ไม่ชัด → เดาโดย mime
    let kind: "png" | "webp" | null = byBuf;
    if (!kind) {
      if (mime.includes("png")) kind = "png";
      else if (mime.includes("webp")) kind = "webp";
    }

    if (!kind) {
      return NextResponse.json({ error: "Unsupported or invalid image file." }, { status: 415 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "product_frame");
    await mkdir(uploadsDir, { recursive: true });

    const ext = kind === "png" ? ".png" : ".webp";
    const outMime = kind === "png" ? "image/png" : "image/webp";
    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    const urlPath = `/uploads/product_frame/${filename}`;

    return NextResponse.json({
      url: urlPath,
      name: filename,
      size: file.size,
      type: outMime,
      kind,
    });
  } catch (err) {
    console.error("UPLOAD_ERROR", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}

// v.1.1.3 ==============================================


// v.1.1.2 ==============================================
// // app/api/mock/uploads/product_frame/route.ts

// import { NextResponse } from "next/server";
// import { mkdir, writeFile } from "fs/promises";
// import path from "path";
// import { randomUUID } from "crypto";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// /** ตรวจ PNG: 8 ไบต์แรก */
// function isPng(buf: Buffer) {
//   if (buf.length < 8) return false;
//   const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
//   for (let i = 0; i < 8; i++) if (buf[i] !== sig[i]) return false;
//   return true;
// }

// /** ตรวจ WebP: "RIFF" + 4 bytes size + "WEBP" */
// function isWebp(buf: Buffer) {
//   if (buf.length < 12) return false;
//   return (
//     buf[0] === 0x52 && // R
//     buf[1] === 0x49 && // I
//     buf[2] === 0x46 && // F
//     buf[3] === 0x46 && // F
//     buf[8] === 0x57 && // W
//     buf[9] === 0x45 && // E
//     buf[10] === 0x42 && // B
//     buf[11] === 0x50 // P
//   );
// }

// function detectType(buf: Buffer): "png" | "webp" | null {
//   if (isPng(buf)) return "png";
//   if (isWebp(buf)) return "webp";
//   return null;
// }

// export async function POST(req: Request) {
//   try {
//     const form = await req.formData();
//     const file = form.get("file") as File | null;

//     if (!file) return NextResponse.json({ error: "Missing file field 'file'." }, { status: 400 });
//     if (file.size === 0) return NextResponse.json({ error: "Empty file." }, { status: 400 });
//     if (file.size > 5 * 1024 * 1024) {
//       return NextResponse.json({ error: "File too large (max 5MB)." }, { status: 413 });
//     }

//     // ยอมรับเฉพาะ PNG / WebP
//     const acceptTypes = ["image/png", "image/webp", "image/x-png"];
//     if (file.type && !acceptTypes.includes(file.type)) {
//       return NextResponse.json({ error: "Only PNG or WebP is allowed." }, { status: 415 });
//     }

//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     const kind = detectType(buffer);
//     if (!kind) {
//       return NextResponse.json({ error: "Unsupported or invalid image file." }, { status: 415 });
//     }

//     const uploadsDir = path.join(process.cwd(), "public", "uploads", "product_frame");
//     await mkdir(uploadsDir, { recursive: true });

//     const ext = kind === "png" ? ".png" : ".webp";
//     const mime = kind === "png" ? "image/png" : "image/webp";
//     const filename = `${Date.now()}-${randomUUID()}${ext}`;
//     const filePath = path.join(uploadsDir, filename);

//     await writeFile(filePath, buffer);

//     const urlPath = `/uploads/product_frame/${filename}`;

//     return NextResponse.json({
//       url: urlPath,
//       name: filename,
//       size: file.size,
//       type: mime,
//       kind,
//     });
//   } catch (err) {
//     console.error("UPLOAD_ERROR", err);
//     return NextResponse.json({ error: "Upload failed." }, { status: 500 });
//   }
// }

// v.1.1.2 ==============================================

// // app/api/mock/uploads/product_frame/route.ts

// import { NextResponse } from "next/server";
// import { mkdir, writeFile } from "fs/promises";
// import path from "path";
// import { randomUUID } from "crypto";

// export const runtime = "nodejs";      // ต้องใช้ Node.js runtime เพื่อเขียนไฟล์ลงดิสก์
// export const dynamic = "force-dynamic";

// /** ตรวจลายเซ็นไฟล์ว่าเป็น PNG จริง (8 ไบต์แรก) */
// function isRealPng(buf: Buffer) {
//   if (buf.length < 8) return false;
//   const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
//   for (let i = 0; i < 8; i++) if (buf[i] !== sig[i]) return false;
//   return true;
// }

// export async function POST(req: Request) {
//   try {
//     const form = await req.formData();
//     const file = form.get("file") as File | null;

//     if (!file) {
//       return NextResponse.json({ error: "Missing file field 'file'." }, { status: 400 });
//     }
//     if (file.size === 0) {
//       return NextResponse.json({ error: "Empty file." }, { status: 400 });
//     }
//     // จำกัดขนาดไฟล์ 5MB (ปรับได้ตามต้องการ)
//     if (file.size > 5 * 1024 * 1024) {
//       return NextResponse.json({ error: "File too large (max 5MB)." }, { status: 413 });
//     }
//     if (file.type && !["image/png", "image/x-png"].includes(file.type)) {
//       return NextResponse.json({ error: "Only PNG is allowed." }, { status: 415 });
//     }

//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // กันส่งไฟล์ปลอม: ตรวจ PNG signature
//     if (!isRealPng(buffer)) {
//       return NextResponse.json({ error: "Invalid PNG signature." }, { status: 415 });
//     }

//     // โฟลเดอร์ปลายทางใหม่: /public/uploads/product_frame
//     const uploadsDir = path.join(process.cwd(), "public", "uploads", "product_frame");
//     await mkdir(uploadsDir, { recursive: true });

//     // ตั้งชื่อไฟล์ให้ไม่ชนกัน
//     const filename = `${Date.now()}-${randomUUID()}.png`;
//     const filePath = path.join(uploadsDir, filename);

//     await writeFile(filePath, buffer);

//     // path สำหรับเข้าถึงผ่านเว็บ
//     const urlPath = `/uploads/product_frame/${filename}`;

//     return NextResponse.json({
//       url: urlPath,
//       name: filename,
//       size: file.size,
//       type: "image/png",
//     });
//   } catch (err) {
//     console.error("UPLOAD_ERROR", err);
//     return NextResponse.json({ error: "Upload failed." }, { status: 500 });
//   }
// }

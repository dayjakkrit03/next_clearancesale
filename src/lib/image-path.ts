// v.1.1.4 =============================================
// src/lib/image-path.ts

import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";

/** ===== DB table names (ใช้ร่วมกับ product.helpers.ts ได้) ===== */
const TABLE = "products_clearance";
const IMAGES_TABLE = "images_products";

/** บังคับ session TZ +07:00 (กันเวลาคลาดเคลื่อน) */
async function ensureTZ() {
  try {
    await setInterlinkSessionTZ("+07:00");
  } catch {
    /* ignore */
  }
}

/**
 * ตัดคำว่า /public ออก เพื่อให้ตรงกับ path ของ Next.js
 * ตัวอย่าง:
 *   "/public/uploads/products/AAA" -> "/uploads/products/AAA"
 *   "public/uploads/products/AAA"  -> "/uploads/products/AAA"
 */
export function normalizeBasePath(p?: string | null): string {
  if (!p) return "/uploads/products";
  const cleaned = String(p).replace(/^\/?public\//, "/");
  return cleaned.replace(/\/$/, ""); // ตัด '/' ท้ายออกถ้ามี
}

/**
 * ใช้ต่อ path จาก base + filename
 * - base = products_clearance.image_url
 * - filename = images_products.image_name
 *
 * ถ้าไม่มี base/filename บางตัวจะคืนค่า null ให้ชัดเจน
 */
export function buildProductImagePath(
  base?: string | null,
  filename?: string | null
): string | null {
  if (!base && !filename) return null;

  const normalized = normalizeBasePath(base ?? "/uploads/products");

  if (!filename) {
    // มีแค่ base เช่น ยังไม่มีภาพใน images_products
    return normalized;
  }

  return `${normalized}/${filename}`;
}

/**
 * ดึง "รูปหลัก" จาก DB โดย join products_clearance + images_products
 * (ใช้ LIMIT 1 ตาม display_order)
 */
export async function getProductImageUrl(
  productId: number | string
): Promise<string | null> {
  await ensureTZ();

  const pid = isNaN(Number(productId)) ? productId : Number(productId);

  const rows: any[] = await prismaInterlink.$queryRawUnsafe(
    `
      SELECT
        p.image_url,
        i.image_name
      FROM ${TABLE} AS p
      LEFT JOIN ${IMAGES_TABLE} AS i
        ON i.product_id = p.product_id
       AND i.visible = 1
      WHERE p.product_id = ?
      ORDER BY i.display_order ASC, i.id ASC
      LIMIT 1
    `,
    pid
  );

  if (!rows || rows.length === 0) return null;

  const row = rows[0];
  return buildProductImagePath(row.image_url, row.image_name);
}

/**
 * ดึง "รูปทั้งหมด" ของสินค้า เรียงตาม display_order
 */
export async function getAllProductImages(
  productId: number | string
): Promise<string[]> {
  await ensureTZ();

  const pid = isNaN(Number(productId)) ? productId : Number(productId);

  const rows: any[] = await prismaInterlink.$queryRawUnsafe(
    `
      SELECT
        p.image_url,
        i.image_name,
        i.display_order
      FROM ${TABLE} AS p
      LEFT JOIN ${IMAGES_TABLE} AS i
        ON i.product_id = p.product_id
       AND i.visible = 1
      WHERE p.product_id = ?
      ORDER BY i.display_order ASC, i.id ASC
    `,
    pid
  );

  if (!rows || rows.length === 0) return [];

  const base = normalizeBasePath(rows[0].image_url);

  return rows
    .filter((r) => r.image_name)
    .map((r) => `${base}/${r.image_name}`);
}

/** ===== ฟังก์ชัน debug ไว้ใช้ใน api/debug ===== */

export async function debugProductImagePath(productId: number | string) {
  const url = await getProductImageUrl(productId);

  console.log("=== Product Image Path Debug ===");
  console.log("product_id:", productId);
  console.log("final url :", url);
  console.log("================================");

  return url;
}

export async function debugAllProductImages(productId: number | string) {
  const list = await getAllProductImages(productId);

  console.log("=== ALL IMAGES DEBUG ===");
  console.log("product_id:", productId);
  console.log("list:", list);
  console.log("=========================");

  return list;
}

// v.1.1.4 =============================================

// v.1.1.3 =============================================
// // src/lib/image-path.ts

// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";

// /** ===== DB table names (ใช้เหมือน product.helpers.ts) ===== */
// const TABLE = "products_clearance";
// const IMAGES_TABLE = "images_products";

// /** บังคับ session TZ +07:00 (กันเวลาคลาดเคลื่อน) */
// async function ensureTZ() {
//   try {
//     await setInterlinkSessionTZ("+07:00");
//   } catch {
//     /* ignore */
//   }
// }

// /**
//  * ตัดคำว่า /public ออก เพื่อให้ตรงกับ path ของ Next.js
//  * ตัวอย่าง:
//  *   "/public/uploads/products/AAA" -> "/uploads/products/AAA"
//  *   "public/uploads/products/AAA"  -> "/uploads/products/AAA"
//  */
// export function normalizeBasePath(p?: string | null): string {
//   if (!p) return "/uploads/products";
//   const cleaned = String(p).replace(/^\/?public\//, "/");
//   return cleaned.replace(/\/$/, ""); // ตัด '/' ท้ายออกถ้ามี
// }

// /**
//  * ดึง path รูปเต็มจาก DB
//  * - join products_clearance กับ images_products ด้วย product_id
//  * - เลือกเฉพาะรูปที่ visible = 1 และ order น้อยสุด (รูปหลัก)
//  *
//  * RESULT:
//  *   "/uploads/products/AM-2120-02XG/network-switch-professional.webp"
//  */
// export async function getProductImageUrl(
//   productId: number | string
// ): Promise<string | undefined> {
//   await ensureTZ();

//   const pid = isNaN(Number(productId)) ? productId : Number(productId);

//   // ใช้ queryRawUnsafe เพราะ TABLE/IMAGES_TABLE เป็น string
//   const rows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//       SELECT
//         p.image_url,
//         i.image_name
//       FROM ${TABLE} AS p
//       LEFT JOIN ${IMAGES_TABLE} AS i
//         ON i.product_id = p.product_id
//        AND i.visible = 1
//       WHERE p.product_id = ?
//       ORDER BY i.display_order ASC, i.id ASC
//       LIMIT 1
//     `,
//     pid
//   );

//   if (!rows || rows.length === 0) return undefined;

//   const row = rows[0];
//   const base = normalizeBasePath(row.image_url);
//   const imageName: string | null = row.image_name ?? null;

//   if (!imageName) {
//     // กรณีสินค้ายังไม่มีภาพใน images_products
//     return base;
//   }

//   return `${base}/${imageName}`;
// }

// /**
//  * ฟังก์ชัน debug เอาไว้ console.log ดูว่าพาทสุดท้ายที่ได้คืออะไร
//  */
// export async function debugProductImagePath(productId: number | string) {
//   const url = await getProductImageUrl(productId);

//   console.log("=== Product Image Path Debug ===");
//   console.log("product_id:", productId);
//   console.log("final url :", url);
//   console.log("================================");

//   return url;
// }

// export async function getAllProductImages(
//   productId: number | string
// ): Promise<string[]> {
//   await ensureTZ();

//   const pid = isNaN(Number(productId)) ? productId : Number(productId);

//   const rows: any[] = await prismaInterlink.$queryRawUnsafe(
//     `
//       SELECT
//         p.image_url,
//         i.image_name,
//         i.display_order
//       FROM ${TABLE} AS p
//       LEFT JOIN ${IMAGES_TABLE} AS i
//         ON i.product_id = p.product_id
//        AND i.visible = 1
//       WHERE p.product_id = ?
//       ORDER BY i.display_order ASC, i.id ASC
//     `,
//     pid
//   );

//   if (!rows || rows.length === 0) return [];

//   const base = normalizeBasePath(rows[0].image_url);

//   // แปลงเป็น array ของ path ครบทุกภาพ
//   const images = rows
//     .filter((r) => r.image_name) // ต้องมีชื่อไฟล์
//     .map((r) => `${base}/${r.image_name}`);

//   return images;
// }

// export async function debugAllProductImages(productId: number | string) {
//   const list = await getAllProductImages(productId);

//   console.log("=== ALL IMAGES DEBUG ===");
//   console.log("product_id:", productId);
//   console.log("list:", list);
//   console.log("=========================");

//   return list;
// }

// v.1.1.3 =============================================

// v.1.1.2 =============================================
// // src/lib/image-path.ts

// const PLACEHOLDER_IMAGE_URL = "/placeholder.png";

// /**
//  * ล้าง path ที่ดึงมาจาก DB (products_clearance.image_url)
//  * เช่น "/public/uploads/products/AM-2120-02XG" -> "/uploads/products/AM-2120-02XG"
//  */
// export function normalizeImageBasePath(imageBasePath?: string | null): string | null {
//   if (!imageBasePath) return null;

//   const cleaned = String(imageBasePath)
//     // ตัด "public" ด้านหน้าออก
//     .replace(/^\/?public\//, "/")
//     // ให้ขึ้นต้นด้วย "/"
//     .replace(/^(?!\/)/, "/")
//     // ตัด "/" ท้ายออก
//     .replace(/\/$/, "");

//   return cleaned;
// }

// /**
//  * สร้าง URL รูปภาพจาก base path + filename
//  * - basePath มาจาก products_clearance.image_url
//  * - filename มาจาก images_products.image_name
//  */
// export function buildProductImagePath(
//   imageBasePath?: string | null,
//   filename?: string | null,
// ): string {
//   const base = normalizeImageBasePath(imageBasePath);
//   if (!base) return PLACEHOLDER_IMAGE_URL;
//   if (!filename) return base;
//   return `${base}/${filename}`;
// }

// v.1.1.2 =============================================

// // src/lib/image-path.ts

// /**
//  * Image Path Helper สำหรับระบบ Interlink
//  *
//  * รองรับโครงสร้างดังนี้:
//  * - products_clearance.image_url = โฟลเดอร์ เช่น "/uploads/products/AM-3602A"
//  * - images_products.image_name   = ไฟล์ เช่น "lan-cat5e-box.webp"
//  * - products_clearance.product_filename = fallback file
//  *
//  * ตัว helper นี้จะสร้าง URL ที่ถูกต้องแบบ Next.js (ไม่ต้องมี /public นำหน้า)
//  */

// export const PLACEHOLDER_IMAGE = "/placeholder.png";

// /**
//  * ล้าง path ให้ถูกต้อง เช่น
//  * "/public/uploads/products/AM-3602A" → "/uploads/products/AM-3602A"
//  */
// export function normalizeBasePath(p?: string | null): string {
//   if (!p) return "/uploads/products";

//   let out = String(p).trim();

//   // ลบ "public/" ถ้ามี
//   out = out.replace(/^\/?public\//, "/");

//   // ลบ "/" ท้ายสุด
//   out = out.replace(/\/$/, "");

//   return out;
// }

// /**
//  * สร้าง URL รูปภาพสินค้าโดยรวม logic ทั้งหมด
//  */
// export function buildProductImageUrl(
//   baseUrl?: string | null,
//   imageName?: string | null,
//   fallbackFilename?: string | null
// ): string {
//   const base = normalizeBasePath(baseUrl);

//   // 1) รูปจาก images_products
//   if (imageName && imageName.trim() !== "") {
//     return `${base}/${imageName}`;
//   }

//   // 2) fallback จาก product_filename
//   if (fallbackFilename && fallbackFilename.trim() !== "") {
//     return `${base}/${fallbackFilename}`;
//   }

//   // 3) placeholder
//   return PLACEHOLDER_IMAGE;
// }

// /**
//  * ดึงรูป Thumbnail (อนาคตถ้าคุณมี thumbs จริง)
//  */
// export function buildThumbImageUrl(
//   baseUrl?: string | null,
//   imageName?: string | null
// ): string {
//   if (imageName) {
//     const ext = imageName.includes(".") ? imageName.split(".").pop() : "webp";
//     const name = imageName.replace(/\.[^/.]+$/, "");
//     return `${normalizeBasePath(baseUrl)}/${name}.thumb.${ext}`;
//   }

//   return PLACEHOLDER_IMAGE;
// }

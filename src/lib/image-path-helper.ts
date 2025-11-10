// src/lib/image-path-helper.ts

/**
 * Product Image Path Helper (src/lib/image-path-helper.ts)
 *
 * * ฟังก์ชันนี้ใช้สำหรับสร้าง URL รูปภาพสินค้าตามโครงสร้างการจัดเก็บใหม่
 * โครงสร้างใหม่: /uploads/products/{product_sku}/{filename}
 */

// Placeholder Image Path
const PLACEHOLDER_IMAGE_URL = '/placeholder.png'; // อ้างอิงจาก public/placeholder.png

// ประเภทของขนาดรูปภาพที่อาจใช้งานใน Frontend
export type ImageSize = 'main' | 'thumb' | 'default';

/**
 * สร้าง URL ที่สมบูรณ์สำหรับรูปภาพสินค้า
 *
 * @param productSku รหัส SKU ของสินค้า (เช่น AM-2120-02XG) ซึ่งเป็นชื่อโฟลเดอร์หลัก
 * @param filename ชื่อไฟล์รูปภาพ (เช่น 1.webp, primary.jpg)
 * @returns URL รูปภาพที่สมบูรณ์, หรือ placeholder หาก SKU หรือ filename เป็นค่าว่าง
 */
export function getProductImageUrl(
  productSku: string | null | undefined,
  filename: string,
  size: ImageSize = 'default'
): string {
  // 1. ตรวจสอบความถูกต้องของข้อมูลที่จำเป็น
  if (!productSku || !filename || productSku.trim() === '') {
    console.warn(`Missing Product SKU or filename. Returning placeholder: ${PLACEHOLDER_IMAGE_URL}`);
    return PLACEHOLDER_IMAGE_URL;
  }

  // 2. สร้าง Path ฐานโดยใช้ Product SKU
  // ตัวอย่าง Path: /uploads/products/AM-2120-02XG
  const baseUrl = `/uploads/products/${productSku.trim()}`;

  // 3. สร้าง URL รูปภาพที่สมบูรณ์
  // ตัวอย่าง: /uploads/products/AM-2120-02XG/1.webp
  return `${baseUrl}/${filename}`;
}

/**
 * ฟังก์ชันสำหรับดึง URL รูปภาพหลัก (Main Image URL)
 * สมมติว่ารูปภาพหลักคือ 1.webp เสมอ
 *
 * @param productSku รหัส SKU ของสินค้า
 * @returns URL รูปภาพหลัก หรือ Placeholder
 */
export function getProductMainImageUrl(productSku: string | null | undefined): string {
    // สมมติฐาน: รูปภาพหลักชื่อ 1.webp
    return getProductImageUrl(productSku, '1.webp', 'main');
}

/**
 * ฟังก์ชันสำหรับดึง URL รูปภาพ Thumb (Thumbnail Image URL)
 * สมมติว่ารูปภาพ Thumb คือ 1.thumb.webp
 *
 * @param productSku รหัส SKU ของสินค้า
 * @returns URL รูปภาพ Thumb หรือ Placeholder
 */
export function getProductThumbImageUrl(productSku: string | null | undefined): string {
    // สมมติฐาน: รูปภาพ Thumb ชื่อ 1.thumb.webp
    return getProductImageUrl(productSku, '1.thumb.webp', 'thumb');
}
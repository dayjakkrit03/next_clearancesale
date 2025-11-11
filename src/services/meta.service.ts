// // src/services/meta.service.ts
import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * Type สำหรับส่วนต่างๆ ของ Product Card ที่ควรจะแสดงผล
 * ตรงตามโครงสร้างที่ ProductCard Component เดิมต้องการ (visibleParts)
 */
export type CardPartKey = 
  | 'product_name' 
  | 'product_brand'
  | 'product_sku'
  | 'product_description'
  | 'product_price'
  | 'discount_percent'
  | 'category_id';

/**
 * Interface สำหรับข้อมูล Meta ของสินค้าที่ดึงมาจาก products_meta
 * ซึ่งจะใช้กำหนดว่าส่วนใดของ Card ควรแสดงผลบ้าง
 */
export interface ProductMeta {
  card_parts: CardPartKey[]; // อาร์เรย์ของชื่อฟิลด์ที่ต้องการแสดง
}

/**
 * ดึงข้อมูล Meta การแสดงผลของ Product Card
 * @returns {Promise<ProductMeta>}
 */
export async function getProductMeta(): Promise<ProductMeta> {
  try {
    // 🚩 แก้ไข: เปลี่ยน select: { meta_value: true } เป็น select: { card_parts: true }
    // เนื่องจาก Schema มี field 'card_parts' โดยตรง และไม่มี 'meta_value'
    const meta = await prismaInterlink.products_meta.findFirst({
      where: {
        id: 1, 
      },
      select: {
        card_parts: true, // 🚩 แก้ไข: ดึง field 'card_parts' (Type: JsonValue)
      },
    });

    // 🚩 แก้ไข: ตรวจสอบ meta.card_parts แทน meta.meta_value
    if (!meta || !meta.card_parts) {
      console.warn("Product Meta not found or card_parts is null. Using default settings.");
      // ส่งค่าเริ่มต้นกลับไปเพื่อให้แอปไม่ล่ม
      return getDefaultProductMeta();
    }

    const rawParts = meta.card_parts;
    let cardPartsArray: any;
    
    // 🚩 แก้ไข: Logic ในการจัดการ JsonValue (ซึ่งอาจเป็น JSON string หรือ Object/Array โดยตรง)
    if (typeof rawParts === 'string') {
        // ถ้าเป็น JSON string ให้ทำการ Parse
        cardPartsArray = JSON.parse(rawParts);
    } else {
        // ถ้าเป็น Object/Array โดยตรง (Type JsonValue) ให้ใช้ได้เลย
        cardPartsArray = rawParts;
    }
    
    // ตรวจสอบและกรอง key ให้เป็น CardPartKey ที่ถูกต้อง
    const validCardParts = Array.isArray(cardPartsArray)
      ? cardPartsArray.filter((key: string): key is CardPartKey => 
          ['product_name', 'product_brand', 'product_sku', 'product_description', 'product_price', 'discount_percent', 'category_id'].includes(key)
        )
      : getDefaultProductMeta().card_parts;
    
    return {
      card_parts: validCardParts,
    };

  } catch (error) {
    console.error("Error fetching product meta:", error);
    // กรณีเกิด error ใน DB หรือ JSON parse
    return getDefaultProductMeta();
  }
}

/**
 * ฟังก์ชันสำหรับกำหนดค่าเริ่มต้นในกรณีที่ดึง Meta Data ไม่ได้
 */
function getDefaultProductMeta(): ProductMeta {
    return {
        card_parts: [
            'product_name', 
            'product_price', 
            'discount_percent',
            'product_brand',
        ]
    };
}
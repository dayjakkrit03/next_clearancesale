// src/services/product.service.ts

import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * Interface สำหรับ Query Parameters จาก URL Search Params
 * ใช้สำหรับหน้า Product Listing ของลูกค้า
 */
export interface ProductQuery {
  search?: string;
  categoryId?: number | string; 
  // แก้ไข: Type ของ Sort/Order ใช้ String
  sort?: string; 
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/** ข้อมูลสินค้าที่ถูกดึงออกมาสำหรับ UI/Card */
export type UIProduct = {
  // 🚩 แก้ไข: เปลี่ยน id เป็น product_id ตาม Schema จริงของตาราง products_clearance
  product_id: number; 
  product_name: string;
  product_brand: string | null;
  product_sku: string | null;
  product_description: string | null;
  product_file: string | null; // URL/Path ของรูปภาพ
  product_filename: string | null;
  // 🚩 แก้ไข: เปลี่ยน product_price เป็น number | null เพื่อรองรับการแปลงจาก Decimal และค่า Null
  product_price: number | null; 
  discount_percent: number | null; // จำเป็นต้องมีเพื่อรองรับ UIComponent เดิม
  category_id: number | null;
  visible: boolean;
  // เพิ่ม field อื่นๆ ที่จำเป็นสำหรับ card ตาม schema เดิม
};


/**
 * ดึงรายการสินค้าจากตาราง products_clearance พร้อมนับจำนวนรวม
 * @param query พารามิเตอร์การค้นหา การกรอง และการแบ่งหน้า
 * @returns { items: UIProduct[], total: number }
 */
export async function queryProducts(
  query: ProductQuery = {}
): Promise<{ items: UIProduct[]; total: number }> {
  const {
    search,
    categoryId,
    sort = 'best_match',
    order = 'asc',
    page = 1,
    pageSize = 24, // ค่าเริ่มต้น 24
  } = query;

  // --- 1. กำหนด Pagination และ Sorting ---
  const take = Math.max(1, Number(pageSize));
  const skip = (Math.max(1, Number(page)) - 1) * take;
  
  const sortOrder: 'asc' | 'desc' = order === 'desc' ? 'desc' : 'asc';
  
  // 🚩 แก้ไข: Cast type เป็น any เพื่อหลีกเลี่ยง error 'ProductsClearanceOrderByWithRelationInput'
  let orderBy: any = {}; 
  
  // จัดการ Sorting
  if (sort === 'price') {
    orderBy = { product_price: sortOrder };
  } else if (sort === 'name') {
    orderBy = { product_name: sortOrder };
  } else {
    // default sort / best_match / order
    // 🚩 แก้ไข: เปลี่ยน id เป็น product_id ใน orderBy
    orderBy = { product_id: sortOrder }; 
  }

  // --- 2. กำหนดเงื่อนไข WHERE ---
  // 🚩 แก้ไข: Cast type เป็น any เพื่อหลีกเลี่ยง error 'ProductsClearanceWhereInput'
  const where: any = {
    // เงื่อนไขบังคับสำหรับลูกค้า: สินค้าต้องมองเห็นได้และมีสถานะปกติ (1)
    visible: true,
    product_status: 1, 
  };

  // 2.1 Filter ตาม Category 
  if (categoryId) {
    where.category_id = Number(categoryId);
  }

  // 2.2 Search (Partial match ในหลายฟิลด์)
  if (search && search.trim()) {
    const searchTerms = search.trim().split(/\s+/).filter(t => t.length > 0);

    // 🚩 แก้ไข: Cast type เป็น any และใช้ mode: 'insensitive' (string literal)
    const searchConditions: any[] = searchTerms.map(term => ({
      OR: [
        { product_name: { contains: term, mode: 'insensitive' } },
        { product_brand: { contains: term, mode: 'insensitive' } },
        { product_sku: { contains: term, mode: 'insensitive' } },
        { product_filename: { contains: term, mode: 'insensitive' } },
      ]
    }));

    // ใช้ AND เพื่อรวมเงื่อนไขการค้นหา
    if (where.AND) {
        where.AND = [...where.AND, ...searchConditions];
    } else {
        where.AND = searchConditions;
    }
  }
  
  // --- 3. ดึงข้อมูลและนับจำนวนรวม ---
  try {
    // rawItems จะมี Type ของ product_price เป็น Decimal | null
    const [rawItems, total] = await prismaInterlink.$transaction([
      // 🚩 ลบ discount_percent ออกจาก select
      prismaInterlink.products_clearance.findMany({
        where,
        take,
        skip,
        orderBy,
        select: {
          product_id: true,
          product_name: true,
          product_brand: true,
          product_sku: true,
          product_price: true, // Type คือ Decimal | null
          category_id: true,
          product_file: true,
          product_filename: true,
          product_description: true,
          visible: true,
        },
      }),

      prismaInterlink.products_clearance.count({ where }),
    ]);

    // 🚩 แก้ไข: ทำการ Map ข้อมูลเพื่อแปลง Decimal เป็น number และเติม discount_percent: null 
    const items: UIProduct[] = rawItems.map((item: any) => ({
        ...item,
        // 🚩 แก้ไข: แปลง Decimal Object เป็น number ก่อนส่งออกไปใช้ใน UI
        product_price: item.product_price ? Number(item.product_price) : null,
        // เพิ่ม discount_percent: null ชั่วคราว (จะถูกคำนวณจริงในขั้นตอนต่อไป)
        discount_percent: null, 
    }));

    return { 
      items,
      total,
    };
    
  } catch (error) {
    console.error("Error querying products:", error);
    return { items: [], total: 0 };
  }
}
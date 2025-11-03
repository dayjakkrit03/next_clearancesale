// v.1.1.3 ================================================================

// v.1.1.3 ================================================================

// v.1.1.2 ================================================================
 // src/services/category.service.ts

import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";

// 💡 กำหนด Type สำหรับข้อมูลที่ผ่านการแปลงและตรวจสอบแล้ว (Input จาก Excel)
// **ปรับปรุง:** ลบ image_filename ออก เนื่องจาก API นี้จะเก็บแค่ Path โฟลเดอร์
export interface CategoryImportItem {
  slug: string;
  name: string;
  display_order: number;
  visible: boolean;
  // เราอาจเพิ่ม users_action: number; ในภายหลังถ้าจำเป็นต้องระบุผู้ใช้งาน
}

/**
 * 🎯 API: POST /api/import/categories/insert-db
 * นำเข้าข้อมูล Category เข้าสู่ตาราง ui_categories (ใน Interlink DB)
 * โดยใช้ Upsert เพื่อให้สามารถอัปเดตข้อมูลที่มี slug ซ้ำได้
 * @param dataList - array ของข้อมูล Category ที่ได้จากไฟล์ Excel
 */
export async function insertCategoryData(dataList: CategoryImportItem[]) {
  // 1. ตั้งค่า Time Zone ก่อนทำธุรกรรม DB
  await setInterlinkSessionTZ();

  // 2. เตรียมข้อมูลสำหรับ Upsert (สร้างหรืออัปเดต)
  const upsertOperations = dataList.map((item) => {
    // **ปรับปรุง:** กำหนดค่า image_url เป็น Path โฟลเดอร์เท่านั้น: /uploads/categories/[slug]
    const image_url = `/uploads/categories/${item.slug}`;
    
    return prismaInterlink.ui_categories.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        // ใช้ image_url ใหม่
        image_url: image_url,
        visible: item.visible,
        display_order: item.display_order,
        updated_at: new Date(),
      },
      create: {
        slug: item.slug,
        name: item.name,
        // ใช้ image_url ใหม่
        image_url: image_url,
        visible: item.visible,
        display_order: item.display_order,
        // created_at: New Date() (ใช้ค่า default)
      },
    });
  });

  // 3. รัน Transaction เพื่อนำเข้า/อัปเดตทั้งหมดพร้อมกัน
  const results = await prismaInterlink.$transaction(upsertOperations);
  
  return {
    success: true,
    count: results.length,
    message: `${results.length} categories upserted successfully in Interlink DB.`,
  };
}
// v.1.1.2 ================================================================

// // src/services/category.service.ts
// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";

// // 💡 กำหนด Type สำหรับข้อมูลที่ผ่านการแปลงและตรวจสอบแล้ว (Input จาก Excel)
// export interface CategoryImportItem {
//   slug: string;
//   name: string;
//   image_filename: string; // ชื่อไฟล์รูปภาพ (เพื่อใช้ในขั้นตอนถัดไป)
//   display_order: number;
//   visible: boolean;
//   // เราอาจเพิ่ม users_action: number; ในภายหลังถ้าจำเป็นต้องระบุผู้ใช้งาน
// }

// /**
//  * 🎯 API: POST /api/import/categories/insert-db
//  * นำเข้าข้อมูล Category เข้าสู่ตาราง ui_categories (ใน Interlink DB)
//  * โดยใช้ Upsert เพื่อให้สามารถอัปเดตข้อมูลที่มี slug ซ้ำได้
//  * @param dataList - array ของข้อมูล Category ที่ได้จากไฟล์ Excel
//  */
// export async function insertCategoryData(dataList: CategoryImportItem[]) {
//   // 1. ตั้งค่า Time Zone ก่อนทำธุรกรรม DB
//   await setInterlinkSessionTZ();

//   // 2. เตรียมข้อมูลสำหรับ Upsert (สร้างหรืออัปเดต)
//   const upsertOperations = dataList.map((item) => {
//     // กำหนดค่า image_url: /categories/[slug]/[filename]
//     const image_url = `/uploads/categories/${item.slug}/${item.image_filename}`;
    
//     return prismaInterlink.ui_categories.upsert({
//       where: { slug: item.slug },
//       update: {
//         name: item.name,
//         image_url: image_url,
//         visible: item.visible,
//         display_order: item.display_order,
//         updated_at: new Date(),
//       },
//       create: {
//         slug: item.slug,
//         name: item.name,
//         image_url: image_url,
//         visible: item.visible,
//         display_order: item.display_order,
//         // created_at: New Date() (ใช้ค่า default)
//       },
//     });
//   });

//   // 3. รัน Transaction เพื่อนำเข้า/อัปเดตทั้งหมดพร้อมกัน
//   const results = await prismaInterlink.$transaction(upsertOperations);
  
//   return {
//     success: true,
//     count: results.length,
//     message: `${results.length} categories upserted successfully in Interlink DB.`,
//   };
// }